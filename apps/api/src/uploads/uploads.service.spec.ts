import { ServiceUnavailableException } from '@nestjs/common';
import { createHash } from 'node:crypto';
import { AppConfig } from '../config/env';
import { UploadsService } from './uploads.service';

const baseConfig: AppConfig = {
  databaseUrl: '',
  firebaseServiceAccountBase64: '',
  ownerEmails: [],
  corsOrigins: [],
  port: 0,
  cloudinary: { cloudName: 'demo', apiKey: 'key123', apiSecret: 'secret' },
};

describe('UploadsService', () => {
  it('signs folder + timestamp the way Cloudinary expects', () => {
    const result = new UploadsService(baseConfig).sign('products', 1_700_000_000_000);
    const expected = createHash('sha1')
      .update('folder=sanghavi-gold/products&timestamp=1700000000secret')
      .digest('hex');
    expect(result).toEqual({
      uploadUrl: 'https://api.cloudinary.com/v1_1/demo/image/upload',
      apiKey: 'key123',
      timestamp: 1_700_000_000,
      folder: 'sanghavi-gold/products',
      signature: expected,
    });
    expect(JSON.stringify(result)).not.toContain('secret"');
  });

  it('refuses when uploads are not configured', () => {
    expect(() => new UploadsService({ ...baseConfig, cloudinary: null }).sign('products')).toThrow(
      ServiceUnavailableException,
    );
  });
});
