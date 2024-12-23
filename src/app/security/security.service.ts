import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

import { File as MulterFile } from 'multer';

@Injectable()
export class SecurityService {
  private readonly allowedFileTypes = [
    'image/jpeg',
    'image/png',
    'application/pdf',
  ];
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB

  validateFile(file: MulterFile): boolean {
    if (!this.allowedFileTypes.includes(file.mimetype)) {
      return false;
    }

    if (file.size > this.maxFileSize) {
      return false;
    }

    return true;
  }

  async scanFile(filePath: string): Promise<boolean> {
    // Placeholder for actual antivirus scanning logic
    // For now, we'll just simulate a scan with a random result
    const isFileSafe = Math.random() > 0.1; // 90% chance the file is safe
    return isFileSafe;
  }

  async saveFile(file: MulterFile, uploadDir: string): Promise<string> {
    const fileHash = crypto
      .createHash('sha256')
      .update(file.buffer)
      .digest('hex');
    const fileName = `${fileHash}${path.extname(file.originalname)}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    return filePath;
  }
}
