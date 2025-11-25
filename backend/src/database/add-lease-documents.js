import { sequelize } from '../config/database.js';
import { QueryTypes } from 'sequelize';

/**
 * Migration to add lease closure fields and create LeaseDocuments table
 */
async function migrate() {
    try {
        console.log('Starting migration: Add lease closure fields and LeaseDocuments table...');

        // Add closure fields to Leases table
        await sequelize.query(`
      ALTER TABLE "Leases" 
      ADD COLUMN IF NOT EXISTS "closureReason" VARCHAR(255),
      ADD COLUMN IF NOT EXISTS "closureNotes" TEXT,
      ADD COLUMN IF NOT EXISTS "depositReturned" BOOLEAN DEFAULT false,
      ADD COLUMN IF NOT EXISTS "depositReturnedDate" TIMESTAMP WITH TIME ZONE;
    `);
        console.log('✅ Added closure fields to Leases table');

        // Create LeaseDocuments table
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "LeaseDocuments" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "leaseId" UUID NOT NULL REFERENCES "Leases"("id") ON DELETE CASCADE,
        "category" VARCHAR(255) NOT NULL DEFAULT 'other',
        "filename" VARCHAR(255) NOT NULL,
        "originalName" VARCHAR(255) NOT NULL,
        "fileSize" INTEGER NOT NULL,
        "mimeType" VARCHAR(255) NOT NULL,
        "filePath" VARCHAR(255) NOT NULL,
        "description" TEXT,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);
        console.log('✅ Created LeaseDocuments table');

        // Create indexes
        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "lease_documents_lease_id" ON "LeaseDocuments" ("leaseId");
    `);
        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "lease_documents_category" ON "LeaseDocuments" ("category");
    `);
        console.log('✅ Created indexes on LeaseDocuments table');

        console.log('✅ Migration completed successfully!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        throw error;
    }
}

// Run migration
migrate()
    .then(() => {
        console.log('Migration finished');
        process.exit(0);
    })
    .catch((error) => {
        console.error('Migration error:', error);
        process.exit(1);
    });
