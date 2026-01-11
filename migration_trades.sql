-- =====================================================
-- MIGRATION: Vérification et correction table trades
-- Date: 2026-01-11
-- Description: S'assure que tous les champs nécessaires existent
-- =====================================================

-- Vérifier et ajouter les colonnes manquantes
DO $$ 
BEGIN
    -- symbol (instrument)
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'symbol'
    ) THEN
        ALTER TABLE trades ADD COLUMN symbol TEXT;
        RAISE NOTICE 'Colonne symbol ajoutée';
    END IF;

    -- trade_type
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'trade_type'
    ) THEN
        ALTER TABLE trades ADD COLUMN trade_type TEXT;
        RAISE NOTICE 'Colonne trade_type ajoutée';
    END IF;

    -- quantity
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'quantity'
    ) THEN
        ALTER TABLE trades ADD COLUMN quantity INTEGER;
        RAISE NOTICE 'Colonne quantity ajoutée';
    END IF;

    -- entry_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'entry_price'
    ) THEN
        ALTER TABLE trades ADD COLUMN entry_price NUMERIC(10,2);
        RAISE NOTICE 'Colonne entry_price ajoutée';
    END IF;

    -- exit_price
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'exit_price'
    ) THEN
        ALTER TABLE trades ADD COLUMN exit_price NUMERIC(10,2);
        RAISE NOTICE 'Colonne exit_price ajoutée';
    END IF;

    -- entry_time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'entry_time'
    ) THEN
        ALTER TABLE trades ADD COLUMN entry_time TIME;
        RAISE NOTICE 'Colonne entry_time ajoutée';
    END IF;

    -- exit_time
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'exit_time'
    ) THEN
        ALTER TABLE trades ADD COLUMN exit_time TIME;
        RAISE NOTICE 'Colonne exit_time ajoutée';
    END IF;

    -- trade_date
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'trade_date'
    ) THEN
        ALTER TABLE trades ADD COLUMN trade_date DATE;
        RAISE NOTICE 'Colonne trade_date ajoutée';
    END IF;

    -- stop_loss
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'stop_loss'
    ) THEN
        ALTER TABLE trades ADD COLUMN stop_loss NUMERIC(10,2);
        RAISE NOTICE 'Colonne stop_loss ajoutée';
    END IF;

    -- take_profit
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'take_profit'
    ) THEN
        ALTER TABLE trades ADD COLUMN take_profit NUMERIC(10,2);
        RAISE NOTICE 'Colonne take_profit ajoutée';
    END IF;

    -- setup
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'setup'
    ) THEN
        ALTER TABLE trades ADD COLUMN setup TEXT;
        RAISE NOTICE 'Colonne setup ajoutée';
    END IF;

    -- notes
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'notes'
    ) THEN
        ALTER TABLE trades ADD COLUMN notes TEXT;
        RAISE NOTICE 'Colonne notes ajoutée';
    END IF;

    -- manual_pnl
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'manual_pnl'
    ) THEN
        ALTER TABLE trades ADD COLUMN manual_pnl NUMERIC(10,2);
        RAISE NOTICE 'Colonne manual_pnl ajoutée';
    END IF;

    -- protections
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' 
        AND column_name = 'protections'
    ) THEN
        ALTER TABLE trades ADD COLUMN protections TEXT;
        RAISE NOTICE 'Colonne protections ajoutée';
    END IF;

END $$;

-- Afficher la structure finale
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'trades'
ORDER BY ordinal_position;
