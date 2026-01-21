-- ========================================
-- SCRIPT : Corriger le P&L pour inclure les frais
-- ========================================

-- 1. Supprimer la colonne pnl si elle est GENERATED (colonne calculée)
-- Attention : Cette commande peut échouer si la colonne n'est pas GENERATED
-- Dans ce cas, passer à l'étape 2

ALTER TABLE trades
DROP COLUMN IF EXISTS pnl;

-- 2. Recréer la colonne pnl comme colonne normale (non générée)
ALTER TABLE trades
ADD COLUMN pnl NUMERIC;

-- 3. Créer une fonction qui calcule le P&L en tenant compte des frais
CREATE OR REPLACE FUNCTION calculate_trade_pnl()
RETURNS TRIGGER AS $$
DECLARE
    multiplier NUMERIC := 50;  -- Par défaut ES
    point_diff NUMERIC;
    calculated_pnl NUMERIC;
BEGIN
    -- Si manual_pnl est défini, l'utiliser directement (déjà calculé avec frais côté client)
    IF NEW.manual_pnl IS NOT NULL THEN
        NEW.pnl := NEW.manual_pnl;
        RETURN NEW;
    END IF;
    
    -- Sinon, calculer automatiquement
    -- Déterminer le multiplier selon l'instrument
    CASE NEW.instrument
        WHEN 'ES' THEN multiplier := 50;
        WHEN 'MES' THEN multiplier := 5;
        WHEN 'NQ' THEN multiplier := 20;
        WHEN 'GC' THEN multiplier := 100;
        ELSE multiplier := 50;
    END CASE;
    
    -- Calculer la différence de points
    point_diff := NEW.exit_price - NEW.entry_price;
    
    -- Calculer le P&L brut
    calculated_pnl := point_diff * NEW.quantity * multiplier;
    
    -- Si SHORT, inverser le signe
    IF NEW.direction = 'SHORT' THEN
        calculated_pnl := -calculated_pnl;
    END IF;
    
    -- Déduire les frais (fees est toujours >= 0)
    calculated_pnl := calculated_pnl - COALESCE(NEW.fees, 0);
    
    NEW.pnl := calculated_pnl;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Créer le trigger AVANT INSERT/UPDATE
DROP TRIGGER IF EXISTS trigger_calculate_pnl ON trades;

CREATE TRIGGER trigger_calculate_pnl
    BEFORE INSERT OR UPDATE ON trades
    FOR EACH ROW
    EXECUTE FUNCTION calculate_trade_pnl();

-- 5. Mettre à jour tous les trades existants pour recalculer le P&L avec frais
UPDATE trades
SET pnl = NULL  -- Force le trigger à recalculer
WHERE pnl IS NOT NULL;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE 'Migration terminée ! Le P&L inclut maintenant les frais.';
END $$;
