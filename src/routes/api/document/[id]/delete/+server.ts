import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ params }) => {
    try {
        const doc = await db.update(document)
            .set({ deleted: true })
            .where(eq(document.id, parseInt(params.id)))
            .returning();

        if (!doc.length) {
            throw error(404, 'Document not found');
        }

        return json({ success: true });
    } catch (e) {
        console.error('Delete error:', e);
        throw error(500, 'Failed to delete document');
    }
}; 