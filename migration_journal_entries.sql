-- =====================================================
-- MIGRATION: Correction de la table journal_entries
-- Date: 2026-01-11
-- Description: Ajoute les colonnes manquantes pour le journal
-- =====================================================

-- Vérifier si les colonnes existent et les ajouter si nécessaire
DO $$ 
BEGIN
    -- Ajouter emotion_before si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'emotion_before'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN emotion_before TEXT;
        RAISE NOTICE 'Colonne emotion_before ajoutée';
    END IF;

    -- Ajouter emotion_after si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'emotion_after'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN emotion_after TEXT;
        RAISE NOTICE 'Colonne emotion_after ajoutée';
    END IF;

    -- Ajouter session_rating si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'session_rating'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN session_rating INTEGER;
        RAISE NOTICE 'Colonne session_rating ajoutée';
    END IF;

    -- Ajouter image_url si elle n'existe pas
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'image_url'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN image_url TEXT;
        RAISE NOTICE 'Colonne image_url ajoutée';
    END IF;

    -- Vérifier que content existe, sinon la créer
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'journal_entries' 
        AND column_name = 'content'
    ) THEN
        ALTER TABLE journal_entries 
        ADD COLUMN content TEXT NOT NULL;
        RAISE NOTICE 'Colonne content ajoutée';
    END IF;

END $$;

-- Afficher la structure finale de la table
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;
