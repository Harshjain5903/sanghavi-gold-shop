import { Inject, Injectable, ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { APP_CONFIG, AppConfig } from '../config/env';

export type UploadTarget = 'products' | 'categories';

export interface UploadSignature {
  uploadUrl: string;
  apiKey: string;
  timestamp: number;
  folder: string;
  signature: string;
}

/**
 * Signs direct browser-to-Cloudinary uploads. The API secret never leaves the server;
 * the browser gets a signature that is only valid for this folder for about an hour.
 */
@Injectable()
export class UploadsService {
  constructor(@Inject(APP_CONFIG) private readonly config: AppConfig) {}

  sign(target: UploadTarget, now = Date.now()): UploadSignature {
    const cloudinary = this.config.cloudinary;
    if (!cloudinary) {
      throw new ServiceUnavailableException('Image uploads are not configured yet');
    }
    const timestamp = Math.floor(now / 1000);
    const folder = `sanghavi-gold/${target}`;
    // Cloudinary signature: SHA-1 of the alphabetically sorted params, followed by the secret.
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${cloudinary.apiSecret}`)
      .digest('hex');
    return {
      uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
      apiKey: cloudinary.apiKey,
      timestamp,
      folder,
      signature,
    };
  }
}
