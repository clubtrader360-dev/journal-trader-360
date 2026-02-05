-- =====================================================
-- MIGRATION URGENTE : Colonnes is_methode et is_hors_methode
-- Date: 2026-02-05
-- Objectif: Corriger l'erreur "Could not find the 'is_hors_methode' column"
-- =====================================================

-- ✅ Étape 1: Ajouter la colonne is_methode (boolean, par défaut false)
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS is_methode BOOLEAN DEFAULT false;

-- ✅ Étape 2: Ajouter la colonne is_hors_methode (boolean, par défaut false)
ALTER TABLE trades 
ADD COLUMN IF NOT EXISTS is_hors_methode BOOLEAN DEFAULT false;

-- ✅ Étape 3: Créer un index pour optimiser les requêtes de filtre
CREATE INDEX IF NOT EXISTS idx_trades_methode ON trades(is_methode);
CREATE INDEX IF NOT EXISTS idx_trades_hors_methode ON trades(is_hors_methode);

-- ✅ Étape 4: Commentaires pour documentation
COMMENT ON COLUMN trades.is_methode IS 'Indique si le trade respecte la méthode de trading définie';
COMMENT ON COLUMN trades.is_hors_methode IS 'Indique si le trade est réalisé en dehors de la méthode de trading';

-- ✅ Étape 5: Vérification
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'trades' 
  AND column_name IN ('is_methode', 'is_hors_methode')
ORDER BY column_name;

-- ✅ Résultat attendu :
-- column_name      | data_type | is_nullable | column_default
-- -----------------+-----------+-------------+----------------
-- is_hors_methode  | boolean   | YES         | false
-- is_methode       | boolean   | YES         | false

-- =====================================================
-- 🎉 Migration terminée avec succès !
-- =====================================================
-- Prochaines étapes :
-- 1. Rafraîchir l'application (Ctrl + F5)
-- 2. Ajouter un trade et cocher "✅ Méthode"
-- 3. Vérifier que l'erreur a disparu
-- =====================================================
