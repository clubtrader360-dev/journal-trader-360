-- ============================================================
-- MIGRATION COMPLÈTE - Club Trader 360
-- À EXÉCUTER DANS SUPABASE SQL EDITOR
-- ============================================================

-- ============================================================
-- 1. TABLE JOURNAL_ENTRIES
-- ============================================================

-- Ajouter entry_date si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'entry_date'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN entry_date DATE;
    END IF;
END $$;

-- Ajouter content si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'content'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN content TEXT;
    END IF;
END $$;

-- Ajouter emotion_before si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'emotion_before'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN emotion_before TEXT;
    END IF;
END $$;

-- Ajouter emotion_after si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'emotion_after'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN emotion_after TEXT;
    END IF;
END $$;

-- Ajouter session_rating si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'session_rating'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN session_rating INTEGER;
    END IF;
END $$;

-- Ajouter image_url si manquant
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' AND column_name = 'image_url'
    ) THEN
        ALTER TABLE journal_entries ADD COLUMN image_url TEXT;
    END IF;
END $$;

-- ============================================================
-- 2. TABLE TRADES
-- ============================================================

-- Ajouter symbol
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'symbol'
    ) THEN
        ALTER TABLE trades ADD COLUMN symbol TEXT;
    END IF;
END $$;

-- Ajouter trade_type
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'trade_type'
    ) THEN
        ALTER TABLE trades ADD COLUMN trade_type TEXT;
    END IF;
END $$;

-- Ajouter quantity
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'quantity'
    ) THEN
        ALTER TABLE trades ADD COLUMN quantity INTEGER;
    END IF;
END $$;

-- Ajouter entry_price
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'entry_price'
    ) THEN
        ALTER TABLE trades ADD COLUMN entry_price NUMERIC(10,2);
    END IF;
END $$;

-- Ajouter exit_price
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'exit_price'
    ) THEN
        ALTER TABLE trades ADD COLUMN exit_price NUMERIC(10,2);
    END IF;
END $$;

-- Ajouter entry_time
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'entry_time'
    ) THEN
        ALTER TABLE trades ADD COLUMN entry_time TIME;
    END IF;
END $$;

-- Ajouter exit_time
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'exit_time'
    ) THEN
        ALTER TABLE trades ADD COLUMN exit_time TIME;
    END IF;
END $$;

-- Ajouter trade_date
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'trade_date'
    ) THEN
        ALTER TABLE trades ADD COLUMN trade_date DATE;
    END IF;
END $$;

-- Ajouter stop_loss
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'stop_loss'
    ) THEN
        ALTER TABLE trades ADD COLUMN stop_loss NUMERIC(10,2);
    END IF;
END $$;

-- Ajouter take_profit
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'take_profit'
    ) THEN
        ALTER TABLE trades ADD COLUMN take_profit NUMERIC(10,2);
    END IF;
END $$;

-- Ajouter setup
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'setup'
    ) THEN
        ALTER TABLE trades ADD COLUMN setup TEXT;
    END IF;
END $$;

-- Ajouter notes
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'notes'
    ) THEN
        ALTER TABLE trades ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Ajouter manual_pnl
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'manual_pnl'
    ) THEN
        ALTER TABLE trades ADD COLUMN manual_pnl NUMERIC(10,2);
    END IF;
END $$;

-- Ajouter protections
DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'trades' AND column_name = 'protections'
    ) THEN
        ALTER TABLE trades ADD COLUMN protections TEXT;
    END IF;
END $$;

-- ============================================================
-- 3. VÉRIFICATION FINALE
-- ============================================================

-- Afficher les colonnes de journal_entries
SELECT 'journal_entries columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Afficher les colonnes de trades
SELECT 'trades columns:' as info;
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades'
ORDER BY ordinal_position;

SELECT '✅ Migration terminée avec succès !' as status;
