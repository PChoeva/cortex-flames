import { put, del } from '@vercel/blob';
import { env } from '$env/dynamic/private';

if (!env.BLOB_READ_WRITE_TOKEN) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not set');
}

export async function uploadFile(file: File, customFilename?: string) {
    const blob = await put(customFilename || file.name, file, {
        access: 'public',
        token: env.BLOB_READ_WRITE_TOKEN,
        addRandomSuffix: true // Still keep this for storage safety
    });
    return blob.url;
}

export async function deleteFile(url: string) {
    await del(url);
} 