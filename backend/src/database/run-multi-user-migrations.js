import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: console.log
});

async function migrate() {
    try {
        console.log('🔄 Connexion à la base de données...');
        await sequelize.authenticate();
        console.log('✅ Connecté avec succès\n');

        // Get the first user ID
        console.log('🔍 Recherche du premier utilisateur...');
        const [users] = await sequelize.query(
            'SELECT id FROM "Users" ORDER BY "createdAt" ASC LIMIT 1'
        );

        if (users.length === 0) {
            console.error('❌ Aucun utilisateur trouvé. Veuillez créer un utilisateur d\'abord.');
            process.exit(1);
        }

        const firstUserId = users[0].id;
        console.log(`✅ Utilisateur trouvé: ${firstUserId}\n`);

        // Add userId to Properties
        console.log('📝 Ajout de userId à Properties...');
        await sequelize.query(`
      ALTER TABLE "Properties"
      ADD COLUMN IF NOT EXISTS "userId" UUID;
    `);

        await sequelize.query(`
      UPDATE "Properties" SET "userId" = '${firstUserId}' WHERE "userId" IS NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Properties"
      ALTER COLUMN "userId" SET NOT NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Properties"
      ADD CONSTRAINT "Properties_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
    `);
        console.log('✅ userId ajouté à Properties\n');

        // Add userId to Tenants
        console.log('📝 Ajout de userId à Tenants...');
        await sequelize.query(`
      ALTER TABLE "Tenants"
      ADD COLUMN IF NOT EXISTS "userId" UUID;
    `);

        await sequelize.query(`
      UPDATE "Tenants" SET "userId" = '${firstUserId}' WHERE "userId" IS NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Tenants"
      ALTER COLUMN "userId" SET NOT NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Tenants"
      ADD CONSTRAINT "Tenants_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
    `);
        console.log('✅ userId ajouté à Tenants\n');

        // Add userId to Artisans
        console.log('📝 Ajout de userId à Artisans...');
        await sequelize.query(`
      ALTER TABLE "Artisans"
      ADD COLUMN IF NOT EXISTS "userId" UUID;
    `);

        await sequelize.query(`
      UPDATE "Artisans" SET "userId" = '${firstUserId}' WHERE "userId" IS NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Artisans"
      ALTER COLUMN "userId" SET NOT NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "Artisans"
      ADD CONSTRAINT "Artisans_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
    `);
        console.log('✅ userId ajouté à Artisans\n');

        // Add userId to FiscalDeclarations
        console.log('📝 Ajout de userId à FiscalDeclarations...');
        await sequelize.query(`
      ALTER TABLE "FiscalDeclarations"
      ADD COLUMN IF NOT EXISTS "userId" UUID;
    `);

        await sequelize.query(`
      UPDATE "FiscalDeclarations" SET "userId" = '${firstUserId}' WHERE "userId" IS NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "FiscalDeclarations"
      ALTER COLUMN "userId" SET NOT NULL;
    `);

        await sequelize.query(`
      ALTER TABLE "FiscalDeclarations"
      ADD CONSTRAINT "FiscalDeclarations_userId_fkey" 
      FOREIGN KEY ("userId") REFERENCES "Users"(id) ON DELETE CASCADE;
    `);
        console.log('✅ userId ajouté à FiscalDeclarations\n');

        // Update FiscalDeclarations unique index
        console.log('📝 Mise à jour de l\'index unique de FiscalDeclarations...');
        await sequelize.query(`
      DROP INDEX IF EXISTS "fiscal_declarations_year";
    `);

        await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_year_declaration" 
      ON "FiscalDeclarations" ("userId", "year");
    `);
        console.log('✅ Index mis à jour\n');

        // Create UserPropertyAccesses table
        console.log('📝 Création de la table UserPropertyAccesses...');
        await sequelize.query(`
      CREATE TABLE IF NOT EXISTS "UserPropertyAccesses" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" UUID NOT NULL REFERENCES "Users"(id) ON DELETE CASCADE,
        "propertyId" UUID NOT NULL REFERENCES "Properties"(id) ON DELETE CASCADE,
        "grantedBy" UUID NOT NULL REFERENCES "Users"(id),
        "role" VARCHAR(255) NOT NULL DEFAULT 'viewer' CHECK ("role" IN ('owner', 'manager', 'viewer')),
        "canEdit" BOOLEAN DEFAULT false,
        "canDelete" BOOLEAN DEFAULT false,
        "canInvite" BOOLEAN DEFAULT false,
        "isActive" BOOLEAN DEFAULT true,
        "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
        "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      );
    `);

        await sequelize.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_property_access" 
      ON "UserPropertyAccesses" ("userId", "propertyId");
    `);

        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "user_property_accesses_property_id" 
      ON "UserPropertyAccesses" ("propertyId");
    `);

        await sequelize.query(`
      CREATE INDEX IF NOT EXISTS "user_property_accesses_user_id" 
      ON "UserPropertyAccesses" ("userId");
    `);
        console.log('✅ Table UserPropertyAccesses créée\n');

        await sequelize.close();
        console.log('✅ Migration terminée avec succès!');
        console.log(`📊 Toutes les données ont été assignées à l'utilisateur: ${firstUserId}`);
        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur lors de la migration:', error);
        process.exit(1);
    }
}

migrate();
