import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';
import type { PageServerLoad } from './$types';
import type { Document } from '$lib/types';

export const load: PageServerLoad = async () => {
    try {
        const docs = await db.select().from(document)
            .orderBy(desc(document.uploadedAt));

        const documents = docs.map(doc => ({
            ...doc,
            uploadedAt: doc.uploadedAt?.toISOString() ?? new Date().toISOString()
        })) satisfies Document[];

        console.log('Loaded documents:', documents); // For debugging

        return { documents };
    } catch (error) {
        console.error('Failed to load documents:', error);
        return { documents: [] };
    }
}; 