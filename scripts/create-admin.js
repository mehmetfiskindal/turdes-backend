#!/usr/bin/env node

const { PrismaClient } = require('@prisma/client');
const { Command } = require('commander');
const inquirer = require('inquirer');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();
const program = new Command();

program
  .name('create-admin')
  .description('CLI komutu ile admin kullanıcı oluşturma')
  .version('1.0.0');

async function main() {
  const questions = [
    {
      type: 'input',
      name: 'name',
      message: 'Admin kullanıcının adı:',
      validate: (input) => input.trim() !== '' || 'İsim alanı boş olamaz!'
    },
    {
      type: 'input',
      name: 'email',
      message: 'Admin kullanıcının e-posta adresi:',
      validate: (input) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(input) || 'Lütfen geçerli bir e-posta adresi girin!';
      }
    },
    {
      type: 'input',
      name: 'phone',
      message: 'Admin kullanıcının telefon numarası (opsiyonel):',
    },
    {
      type: 'password',
      name: 'password',
      message: 'Admin kullanıcının şifresi:',
      validate: (input) => {
        return input.length >= 8 || 'Şifre en az 8 karakter uzunluğunda olmalıdır!';
      }
    },
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Bu bilgilerle admin kullanıcısı oluşturmak istediğinize emin misiniz?',
      default: false
    }
  ];

  const answers = await inquirer.prompt(questions);

  if (!answers.confirm) {
    console.log('İşlem iptal edildi.');
    process.exit(0);
  }

  try {
    // Kullanıcının varlığını kontrol et
    const existingUser = await prisma.user.findUnique({
      where: {
        email: answers.email
      }
    });

    if (existingUser) {
      console.error(`Hata: ${answers.email} e-posta adresine sahip bir kullanıcı zaten var!`);
      process.exit(1);
    }

    // Şifreyi hash'le
    const passwordHash = await bcrypt.hash(answers.password, 10);

    // Admin kullanıcısı oluştur
    const user = await prisma.user.create({
      data: {
        email: answers.email,
        name: answers.name,
        phone: answers.phone || null,
        role: 'admin',
        passwordHash: passwordHash,
        isEmailVerified: true // Admin kullanıcısı doğrudan e-posta doğrulanmış olarak oluşturulur
      }
    });

    console.log(`Admin kullanıcı başarıyla oluşturuldu: ${user.email} (ID: ${user.id})`);
  } catch (error) {
    console.error('Admin kullanıcı oluşturulurken hata oluştu:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

program.action(main);

program.parse(process.argv);