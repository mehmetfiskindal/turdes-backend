# Turdes Deployment Guide

Bu dokümanda Turdes backend sisteminin production, staging ve development ortamlarına deployment süreci detaylı olarak açıklanmıştır.

## 1. Environment Overview

### Development Environment
- **Purpose**: Local development ve feature testing
- **Database**: Local PostgreSQL instance
- **URL**: http://localhost:3000
- **Branch**: `feature/*`, `develop`

### Staging Environment
- **Purpose**: Production-like testing ve QA
- **Database**: Cloud PostgreSQL (separate from production)
- **URL**: https://staging-api.turdes.com
- **Branch**: `develop`, `staging`

### Production Environment
- **Purpose**: Live application
- **Database**: Production PostgreSQL with backup
- **URL**: https://api.turdes.com
- **Branch**: `main`

## 2. Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **PostgreSQL**: 14.x or higher
- **npm**: 9.x or higher
- **PM2**: For process management (production)

### Required Services
- **Database**: PostgreSQL instance
- **Email Service**: SMTP server (Gmail, SendGrid, etc.)
- **Firebase**: For push notifications
- **File Storage**: Cloud storage for documents/images

## 3. Environment Variables

### Required Variables (All Environments)

```bash
# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Secrets
JWT_ACCESS_SECRET="your-access-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret-key"
JWT_ACCESS_EXPIRES="1h"
JWT_REFRESH_EXPIRES="7d"

# Email Configuration
MAIL_HOST="smtp.gmail.com"
MAIL_PORT="587"
MAIL_USER="your-email@gmail.com"
MAIL_PASSWORD="your-app-password"
MAIL_FROM="noreply@turdes.com"

# Application
NODE_ENV="production"
PORT="3000"
HOST_URL="https://api.turdes.com"
FRONTEND_URL="https://turdes.com"

# Firebase (Optional but recommended)
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Features
AUDIT_LOG_ENABLED="true"
```

### Environment-Specific Variables

**Development:**
```bash
NODE_ENV="development"
DATABASE_URL="postgresql://dev_user:dev_pass@localhost:5432/turdes_dev"
HOST_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:3001"
AUDIT_LOG_ENABLED="false"
```

**Staging:**
```bash
NODE_ENV="staging"
DATABASE_URL="postgresql://staging_user:staging_pass@staging-db:5432/turdes_staging"
HOST_URL="https://staging-api.turdes.com"
FRONTEND_URL="https://staging.turdes.com"
```

**Production:**
```bash
NODE_ENV="production"
DATABASE_URL="postgresql://prod_user:secure_pass@prod-db:5432/turdes_prod"
HOST_URL="https://api.turdes.com"
FRONTEND_URL="https://turdes.com"
```

## 4. Local Development Setup

### Initial Setup

```bash
# Clone repository
git clone https://github.com/your-org/turdes-backend.git
cd turdes-backend

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your local configuration

# Setup database
npm run migrate

# Create admin user (optional)
npm run create-admin

# Start development server
npm run start:dev
```

### Development Workflow

```bash
# Start with hot reload
npm run start:dev

# Run tests
npm run test:e2e

# Generate Prisma client after schema changes
npm run generate

# Create and apply migrations
npm run migrate

# View database in Prisma Studio
npm run studio
```

## 5. Docker Deployment

### Dockerfile

```dockerfile
# Production Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build application
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./

USER nestjs

EXPOSE 3000

# Use dumb-init to handle signals properly
ENTRYPOINT ["dumb-init", "--"]

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/main"]
```

### Docker Compose (Development)

```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/turdes_dev
    depends_on:
      - db
    volumes:
      - .:/app
      - /app/node_modules

  db:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: turdes_dev
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

### Docker Commands

```bash
# Build image
docker build -t turdes-backend .

# Run container
docker run -p 3000:3000 --env-file .env turdes-backend

# Using docker-compose
docker-compose up -d

# View logs
docker-compose logs -f app

# Run migrations in container
docker-compose exec app npx prisma migrate deploy

# Access container shell
docker-compose exec app sh
```

## 6. Cloud Deployment

### Railway Deployment

```bash
# Install Railway CLI and login
npm install -g @railway/cli
railway login

# Initialize project
railway init

# Link to existing project (if already created on Railway dashboard)
railway link

# Add PostgreSQL database
# Go to Railway dashboard and add PostgreSQL plugin
# Database URL will be automatically injected as DATABASE_URL

# Set environment variables
railway variables set NODE_ENV=production
railway variables set JWT_ACCESS_SECRET="your-secret"
railway variables set JWT_REFRESH_SECRET="your-refresh-secret"
railway variables set MAIL_HOST="smtp.gmail.com"
railway variables set MAIL_USER="your-email@gmail.com"
railway variables set MAIL_PASSWORD="your-app-password"
railway variables set MAIL_FROM="noreply@turdes.com"
# ... set all other required env vars

# Deploy from local
railway up

# Or deploy from GitHub (recommended)
# 1. Connect your GitHub repository in Railway dashboard
# 2. Railway will automatically deploy on push to main branch

# Run migrations
railway run npx prisma migrate deploy

# View logs
railway logs

# Open application
railway open
```

**Railway Dashboard Setup:**

1. **Create New Project**
   - Go to https://railway.app
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your turdes-backend repository

2. **Add PostgreSQL Database**
   - Click "New" → "Database" → "Add PostgreSQL"
   - Railway automatically sets DATABASE_URL variable

3. **Configure Environment Variables**
   - Go to project → Variables
   - Add all required environment variables
   - Use "Reference" feature for DATABASE_URL from PostgreSQL service

4. **Configure Build Settings**
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npx prisma migrate deploy && node dist/main`
   - Watch Paths: `/**`

5. **Custom Domain (Optional)**
   - Go to Settings → Domains
   - Add custom domain: `api.turdes.com`
   - Configure DNS settings as shown

**railway.json (Optional Configuration):**
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install && npx prisma generate && npm run build"
  },
  "deploy": {
    "startCommand": "npx prisma migrate deploy && node dist/main",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### AWS EC2 Deployment

```bash
# Connect to EC2 instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Install PM2
sudo npm install -g pm2

# Clone and setup application
git clone https://github.com/your-org/turdes-backend.git
cd turdes-backend
npm install

# Setup environment
cp .env.example .env
# Edit .env with production values

# Build application
npm run build

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate deploy

# Start with PM2
pm2 start dist/main.js --name "turdes-backend"
pm2 startup
pm2 save

# Setup Nginx reverse proxy
sudo apt install nginx
# Configure nginx (see nginx configuration below)
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/turdes-backend
server {
    listen 80;
    server_name api.turdes.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# Enable SSL with Certbot
# sudo certbot --nginx -d api.turdes.com
```

### DigitalOcean App Platform

**app.yaml:**
```yaml
name: turdes-backend
services:
- name: api
  source_dir: /
  github:
    repo: your-org/turdes-backend
    branch: main
  run_command: npm run start:prod
  environment_slug: node-js
  instance_count: 1
  instance_size_slug: basic-xxs
  env:
  - key: NODE_ENV
    value: production
  - key: DATABASE_URL
    value: ${db.DATABASE_URL}
  - key: JWT_ACCESS_SECRET
    value: your-secret
    type: SECRET

databases:
- name: db
  engine: PG
  version: "14"
  size: db-s-dev-database
```

## 7. CI/CD Pipeline

### GitHub Actions

**.github/workflows/deploy.yml:**
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgres:14
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: turdes_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Generate Prisma client
      run: npx prisma generate
    
    - name: Run migrations
      run: npx prisma migrate deploy
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/turdes_test
    
    - name: Run tests
      run: npm run test:e2e
      env:
        DATABASE_URL: postgresql://postgres:postgres@localhost:5432/turdes_test
        JWT_ACCESS_SECRET: test-secret
        JWT_REFRESH_SECRET: test-secret
        NODE_ENV: test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Install Railway CLI
      run: npm install -g @railway/cli
    
    - name: Deploy to Railway
      run: |
        railway link ${{secrets.RAILWAY_PROJECT_ID}}
        railway up
      env:
        RAILWAY_TOKEN: ${{secrets.RAILWAY_TOKEN}}
        
    - name: Run post-deploy migrations
      run: |
        railway run npx prisma migrate deploy
      env:
        RAILWAY_TOKEN: ${{secrets.RAILWAY_TOKEN}}

# Railway GitHub Secrets needed:
# - RAILWAY_TOKEN: Get from Railway dashboard → Account Settings → Tokens
# - RAILWAY_PROJECT_ID: Get from Railway dashboard → Project Settings → General
```

### GitLab CI/CD

**.gitlab-ci.yml:**
```yaml
stages:
  - test
  - build
  - deploy

variables:
  NODE_VERSION: "18"
  POSTGRES_VERSION: "14"

test:
  stage: test
  image: node:18
  services:
    - postgres:14
  variables:
    POSTGRES_DB: turdes_test
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: postgres
    DATABASE_URL: "postgresql://postgres:postgres@postgres:5432/turdes_test"
  script:
    - npm ci
    - npx prisma generate
    - npx prisma migrate deploy
    - npm run test:e2e
  only:
    - main
    - develop

build:
  stage: build
  image: docker:latest
  services:
    - docker:dind
  script:
    - docker build -t $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA .
    - docker push $CI_REGISTRY_IMAGE:$CI_COMMIT_SHA
  only:
    - main

deploy_production:
  stage: deploy
  image: alpine:latest
  script:
    - echo "Deploy to production"
    # Add your deployment script here
  only:
    - main
  when: manual
```

## 8. Database Migration Strategy

### Development to Production

```bash
# 1. Create migration in development
npm run migrate -- --name add_new_feature

# 2. Test migration with sample data
npm run migrate:reset
npm run migrate

# 3. Commit migration files
git add prisma/migrations/
git commit -m "Add migration for new feature"

# 4. Deploy to staging
git push origin staging

# 5. Run migration on staging
railway run npx prisma migrate deploy --environment staging

# 6. Test on staging
# ... run tests ...

# 7. Deploy to production
git push origin main

# 8. Run migration on production
railway run npx prisma migrate deploy --environment production
```

### Rollback Strategy

```bash
# For schema changes, prepare rollback migration
npx prisma migrate dev --name rollback_feature

# Emergency rollback (data loss possible)
# 1. Revert code
git revert <commit-hash>

# 2. Create rollback migration
npx prisma migrate dev --name emergency_rollback

# 3. Deploy rollback
railway run npx prisma migrate deploy
```

## 9. Monitoring & Health Checks

### Health Check Endpoint

```typescript
// src/health/health.controller.ts
@Controller('health')
export class HealthController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async check() {
    try {
      // Check database connectivity
      await this.prisma.$queryRaw`SELECT 1`;
      
      return {
        status: 'ok',
        timestamp: new Date().toISOString(),
        database: 'connected',
        uptime: process.uptime()
      };
    } catch (error) {
      throw new ServiceUnavailableException('Health check failed');
    }
  }
}
```

### PM2 Monitoring

```bash
# PM2 ecosystem file
# ecosystem.config.js
module.exports = {
  apps: [{
    name: 'turdes-backend',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    max_memory_restart: '1G'
  }]
};

# Start with ecosystem
pm2 start ecosystem.config.js

# Monitor
pm2 monit

# View logs
pm2 logs turdes-backend
```

## 10. Backup & Recovery

### Database Backup

```bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"
DB_NAME="turdes_prod"

# Create backup
pg_dump $DATABASE_URL > $BACKUP_DIR/turdes_backup_$DATE.sql

# Compress backup
gzip $BACKUP_DIR/turdes_backup_$DATE.sql

# Remove backups older than 30 days
find $BACKUP_DIR -name "turdes_backup_*.sql.gz" -mtime +30 -delete

# Upload to cloud storage (optional)
aws s3 cp $BACKUP_DIR/turdes_backup_$DATE.sql.gz s3://turdes-backups/
```

### Recovery Process

```bash
# Restore from backup
gunzip turdes_backup_20240115_120000.sql.gz
psql $DATABASE_URL < turdes_backup_20240115_120000.sql

# Reset Prisma migration state
npx prisma migrate resolve --applied "migration_name"
```

## 11. Security Considerations

### Environment Security

```bash
# Secure environment variables
# Use secret management tools in production
export JWT_ACCESS_SECRET=$(aws secretsmanager get-secret-value --secret-id jwt-access-secret --query SecretString --output text)

# File permissions
chmod 600 .env
chown app:app .env
```

### Firewall Configuration

```bash
# UFW firewall rules
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw deny 3000/tcp   # Block direct access to app
sudo ufw enable
```

### SSL/TLS Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d api.turdes.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

## 12. Performance Optimization

### Production Optimizations

```bash
# Node.js production optimizations
export NODE_ENV=production
export NODE_OPTIONS="--max-old-space-size=4096"

# Enable gzip compression in Nginx
# Add to nginx config:
gzip on;
gzip_types text/plain application/json application/javascript text/css;
```

### Database Optimization

```sql
-- Add database indexes for better performance
CREATE INDEX CONCURRENTLY idx_aid_requests_status_created ON "AidRequest"("status", "createdAt");
CREATE INDEX CONCURRENTLY idx_users_email_verified ON "User"("email", "isEmailVerified");
```

## 13. Troubleshooting

### Common Issues

**Port already in use:**
```bash
# Find process using port
lsof -ti:3000
# Kill process
kill -9 $(lsof -ti:3000)
```

**Database connection issues:**
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
pg_isready -h localhost -p 5432
```

**Memory issues:**
```bash
# Check memory usage
free -h
# Check application memory
pm2 show turdes-backend
```

### Log Analysis

```bash
# Application logs
tail -f logs/combined.log

# System logs
journalctl -u turdes-backend -f

# Database logs
tail -f /var/log/postgresql/postgresql-14-main.log
```

Bu deployment rehberi Turdes backend sisteminin tüm ortamlara güvenli ve etkili deploy edilmesi için gereken tüm adımları kapsar.