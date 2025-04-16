import { sql } from 'drizzle-orm';

export async function up(db: any) {
    // Drop the old table and create new one to ensure clean state
    await db.run(sql`
        CREATE TABLE new_document (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            url TEXT NOT NULL,
            uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Copy data to new table, using filename for both fields
    await db.run(sql`
        INSERT INTO new_document (id, filename, original_name, mime_type, size, url, uploaded_at)
        SELECT id, filename, filename, mime_type, size, url, uploaded_at
        FROM document;
    `);

    // Drop old table and rename new one
    await db.run(sql`DROP TABLE document;`);
    await db.run(sql`ALTER TABLE new_document RENAME TO document;`);
}

export async function down(db: any) {
    // If needed to rollback, we'll recreate the original structure
    await db.run(sql`
        CREATE TABLE new_document (
            id INTEGER PRIMARY KEY,
            filename TEXT NOT NULL,
            original_name TEXT NOT NULL,
            base_filename TEXT NOT NULL,
            version_number INTEGER NOT NULL,
            mime_type TEXT NOT NULL,
            size INTEGER NOT NULL,
            url TEXT NOT NULL,
            uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    `);

    // Copy data back, setting version to 1 and using filename as base
    await db.run(sql`
        INSERT INTO new_document (id, filename, original_name, base_filename, version_number, mime_type, size, url, uploaded_at)
        SELECT id, filename, original_name, filename, 1, mime_type, size, url, uploaded_at
        FROM document;
    `);

    await db.run(sql`DROP TABLE document;`);
    await db.run(sql`ALTER TABLE new_document RENAME TO document;`);
} 