import { json } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export const GET = () => {
    return json({
        hasDbUrl: !!env.DATABASE_URL,
        // Don't log the full URL in production!
        urlPreview: env.DATABASE_URL?.slice(0, 10) + '...'
    });
}; 