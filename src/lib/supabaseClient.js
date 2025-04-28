import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'avatars';

// Initialize storage bucket if it doesn't exist
export const initializeStorage = async () => {
  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets.some(bucket => bucket.name === STORAGE_BUCKET);

    if (!bucketExists) {
      await supabase.storage.createBucket(STORAGE_BUCKET, {
        public: false,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif'],
      });
    }
  } catch (error) {
    console.error('Error initializing storage:', error);
  }
}; 