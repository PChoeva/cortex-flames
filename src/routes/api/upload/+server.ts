import { error, json } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { document } from '$lib/server/db/schema';
import { uploadFile } from '$lib/server/storage/blob';
import { EXTENSION_TO_MIME } from '$lib/constants';
import type { RequestHandler } from '@sveltejs/kit';
import { and, eq, or } from 'drizzle-orm';
import { documentLogger as logger } from '$lib/server/logger';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const formData = await request.formData();
		const file = formData.get('document');

		if (!file || !(file instanceof File)) {
			logger.warn('No file uploaded');
			throw error(400, 'No file uploaded');
		}

		const ext = file.name.match(/\.[^/.]+$/)?.[0]?.toLowerCase() || '';
		const mimeType = EXTENSION_TO_MIME[ext];

		logger.info({
			filename: file.name,
			extension: ext,
			mimeType,
			size: file.size
		}, 'Processing file upload');

		if (!mimeType) {
			logger.warn({ extension: ext }, 'Unsupported file type');
			throw error(400, 'Unsupported file type');
		}

		const baseName = file.name.slice(0, -ext.length);

		const existingFiles = await db.select()
			.from(document)
			.where(
				and(
					eq(document.originalName, file.name),
					or(
						eq(document.deleted, true),
						eq(document.deleted, false)
					)
				)
			);

		const finalName = existingFiles.length > 0 
			? `${baseName} (${existingFiles.length})${ext}`
			: file.name;

		logger.debug({ 
			originalName: file.name,
			finalName,
			existingCount: existingFiles.length 
		}, 'Resolved file name');

		const url = await uploadFile(file, finalName);
		logger.info({ url, finalName }, 'File uploaded to storage');

		const [newDocument] = await db.insert(document)
			.values({
				filename: finalName,
				originalName: file.name,
				mimeType,  // Use our mapped MIME type
				size: file.size,
				url,
				deleted: false,
				uploadedAt: new Date()
			})
			.returning();

		logger.info({ 
			documentId: newDocument.id,
			filename: newDocument.filename 
		}, 'Document created in database');

		return json({ success: true, document: newDocument });
	} catch (e: any) {
		logger.error({ 
			err: e,
			stack: e.stack 
		}, 'Upload failed');
		throw error(500, 'Failed to process upload');
	}
}
