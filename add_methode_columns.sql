-- Migration: Ajouter les colonnes is_methode et is_hors_methode à la table trades
-- Date: 2026-01-31
-- Objectif: Permettre de classifier les trades selon s'ils respectent la méthode de trading ou non

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

-- ✅ Succès !
-- Les colonnes is_methode et is_hors_methode ont été ajoutées à la table trades
-- Vous pouvez maintenant classifier vos trades selon qu'ils respectent votre méthode ou non
