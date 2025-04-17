import { put, del } from '@vercel/blob';
import { env } from '$env/dynamic/private';
import { dev } from '$app/environment';

if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set');
}

// Define the folder based on environment
const STORAGE_FOLDER = dev ? 'dev' : 'prod';

export async function uploadFile(file: File, customFilename?: string) {
    // Prefix the filename with the environment folder
    const filename = `${STORAGE_FOLDER}/${customFilename || file.name}`;
    
    const blob = await put(filename, file, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true // Still keep this for storage safety
    });
    return blob.url;
}

export async function deleteFile(url: string) {
    await del(url);
} 