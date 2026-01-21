-- ========================================
-- SCRIPT : Forcer le recalcul de TOUS les P&L avec frais
-- ========================================

-- Vider manual_pnl pour forcer le recalcul via le trigger
UPDATE trades
SET manual_pnl = NULL;

-- Forcer le trigger en modifiant légèrement entry_price
UPDATE trades
SET entry_price = entry_price;

-- Message de confirmation
DO $$
DECLARE
    trade_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO trade_count FROM trades;
    RAISE NOTICE '✅ % trades recalculés avec frais déduits.', trade_count;
END $$;
