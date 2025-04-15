import { json } from '@sveltejs/kit';
import { db } from '$lib/server/db';

export const GET = async () => {
    try {
        const documents = await db.query.document.findMany();
        return json({
            success: true,
            message: 'Database connected successfully',
            documentCount: documents.length
        });
    } catch (error) {
        console.error('Database test failed:', error);
        return json({
            success: false,
            error: 'Failed to query database'
        }, { status: 500 });
    }
}; 