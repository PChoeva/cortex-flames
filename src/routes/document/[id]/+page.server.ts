import { error } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
    const doc = await db.select().from(document)
        .where(eq(document.id, parseInt(params.id)))
        .limit(1);

    if (!doc.length) {
        throw error(404, 'Document not found');
    }

    return { document: doc[0] };
}; 