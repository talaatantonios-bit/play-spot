import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class UploadService {
  private supabase: SupabaseClient;
  private readonly logger = new Logger(UploadService.name);

  constructor() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      this.logger.warn('Supabase credentials not found in environment variables. Uploads will fail.');
    }

    this.supabase = createClient(supabaseUrl || 'https://placeholder.supabase.co', supabaseKey || 'placeholder');
  }

  /**
   * Upload an image to Supabase Storage
   * @param path Directory path within the bucket (e.g., 'category/')
   * @param file The file object intercepted by Multer
   * @returns The public URL of the uploaded image
   */
  async uploadImage(path: string, file: Express.Multer.File): Promise<string> {
    const bucket = process.env.SUPABASE_BUCKET || 'play-spot-bucket';
    const fileExt = file.originalname.split('.').pop();
    const fileName = `${path}${Date.now()}-${Math.round(Math.random() * 10000)}.${fileExt}`;

    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      this.logger.error(`Supabase upload error: ${error.message}`);
      throw new InternalServerErrorException('Failed to upload image');
    }

    const { data: publicUrlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl;
  }
}
