-- Migration: Ajout du champ taxe foncière (propertyTax) à la table Properties
-- Date: 2025-11-13

ALTER TABLE Properties
ADD COLUMN IF NOT EXISTS propertyTax DECIMAL(10,2)
COMMENT 'Taxe foncière annuelle';
