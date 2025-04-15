import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    try {
        const documents = await db.select().from(document)
            .orderBy(desc(document.uploadedAt));

        console.log('Loaded documents:', documents); // For debugging

        return { documents };
    } catch (error) {
        console.error('Failed to load documents:', error);
        return { documents: [] };
    }
}; 