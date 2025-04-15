import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { uploadFile } from '$lib/server/storage/blob';
import type { RequestHandler } from '@sveltejs/kit';
import { eq, desc } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('document');

		if (!file || !(file instanceof File)) {
			throw error(400, 'No file uploaded');
		}

		// Get base filename (without extension)
		const baseFilename = file.name.replace(/\.[^/.]+$/, "");
		
		// Check if file exists and get latest version
		const existingVersions = await db.select()
			.from(document)
			.where(eq(document.baseFilename, baseFilename))
			.orderBy(desc(document.versionNumber));

		const nextVersion = existingVersions.length > 0 ? existingVersions[0].versionNumber + 1 : 1;
		
		// Create versioned filename
		const versionedName = nextVersion > 1 
			? `${baseFilename} (${nextVersion})${file.name.slice(baseFilename.length)}`
			: file.name;

		const url = await uploadFile(file, versionedName);

		const newDocument = await db.insert(document).values({
			filename: versionedName,
			originalName: file.name,
			baseFilename,
			versionNumber: nextVersion,
			mimeType: file.type,
			size: file.size,
			url
		}).returning();

		return json({ success: true, document: newDocument[0] });
	} catch (e) {
		console.error('Upload error:', e);
		throw error(500, 'Failed to process upload');
	}
}
