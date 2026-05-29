import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { mkdir, rm, writeFile } from 'fs/promises';
import { join, extname } from 'path';
import {
  cloudinary,
  ensureCloudinaryConfigured,
  isCloudinaryConfigured,
} from '../config/cloudinary.config';
import { productImageFolder } from './cloudinary-paths';

export interface CloudinaryUploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly localUploadRoot = join(process.cwd(), 'uploads');

  uploadProductImage(
    file: Express.Multer.File,
    tenantId: number,
    productId: number,
  ): Promise<CloudinaryUploadResult> {
    if (!file?.buffer?.length) {
      return Promise.reject(
        new BadRequestException('Image file is required'),
      );
    }

    if (!file.mimetype.startsWith('image/')) {
      return Promise.reject(
        new BadRequestException('Only image files are allowed'),
      );
    }

    if (isCloudinaryConfigured()) {
      return this.uploadToCloudinary(file, tenantId, productId);
    }

    this.logger.warn(
      'Cloudinary is not configured; saving product image to local uploads folder.',
    );
    return this.uploadToLocalDisk(file, tenantId, productId);
  }

  /** Deletes every asset under the product folder (tenant-scoped). */
  async deleteProductFolder(
    tenantId: number,
    productId: number,
  ): Promise<void> {
    const folder = productImageFolder(tenantId, productId);

    await this.deleteLocalProductFolder(folder);

    if (!isCloudinaryConfigured()) {
      return;
    }

    try {
      ensureCloudinaryConfigured();
      await cloudinary.api.delete_resources_by_prefix(`${folder}/`, {
        resource_type: 'image',
      });
      await cloudinary.api.delete_folder(folder).catch(() => undefined);
    } catch (error) {
      this.logger.warn(
        `Cloudinary folder cleanup failed for ${folder}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  async deleteByPublicIds(publicIds: string[]): Promise<void> {
    const cloudinaryIds = publicIds.filter(
      (id) => id.trim().length > 0 && !id.startsWith('local:'),
    );
    if (cloudinaryIds.length === 0 || !isCloudinaryConfigured()) {
      return;
    }

    try {
      ensureCloudinaryConfigured();
      await cloudinary.api.delete_resources(cloudinaryIds, {
        resource_type: 'image',
      });
    } catch (error) {
      this.logger.warn(
        `Cloudinary bulk delete failed: ${error instanceof Error ? error.message : error}`,
      );
    }
  }

  private uploadToCloudinary(
    file: Express.Multer.File,
    tenantId: number,
    productId: number,
  ): Promise<CloudinaryUploadResult> {
    ensureCloudinaryConfigured();
    const folder = productImageFolder(tenantId, productId);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: 'image',
          use_filename: true,
          unique_filename: true,
        },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new Error('Cloudinary upload did not return asset metadata'));
            return;
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  private async uploadToLocalDisk(
    file: Express.Multer.File,
    tenantId: number,
    productId: number,
  ): Promise<CloudinaryUploadResult> {
    const folder = productImageFolder(tenantId, productId);
    const dir = join(this.localUploadRoot, folder);
    await mkdir(dir, { recursive: true });

    const extension = extname(file.originalname) || '.jpg';
    const filename = `${Date.now()}${extension}`;
    const relativePath = `${folder}/${filename}`;
    await writeFile(join(dir, filename), file.buffer);

    const baseUrl = (
      process.env.API_PUBLIC_URL ?? `http://localhost:${process.env.PORT ?? 3000}`
    ).replace(/\/$/, '');

    return {
      url: `${baseUrl}/uploads/${relativePath.replace(/\\/g, '/')}`,
      publicId: `local:${relativePath.replace(/\\/g, '/')}`,
    };
  }

  private async deleteLocalProductFolder(folder: string): Promise<void> {
    const dir = join(this.localUploadRoot, folder);
    try {
      await rm(dir, { recursive: true, force: true });
    } catch (error) {
      this.logger.warn(
        `Local folder cleanup failed for ${dir}: ${error instanceof Error ? error.message : error}`,
      );
    }
  }
}
