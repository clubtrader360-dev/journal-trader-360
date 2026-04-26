-- Migration: Ajout de la colonne no_trade dans journal_entries
-- Date: 2026-04-26
-- Description: Permet de marquer les jours où l'utilisateur n'a pas tradé pour une raison stratégique

-- Ajouter la colonne no_trade (boolean)
ALTER TABLE journal_entries 
ADD COLUMN IF NOT EXISTS no_trade BOOLEAN DEFAULT FALSE;

-- Mettre à jour les entrées existantes pour s'assurer qu'elles ont FALSE par défaut
UPDATE journal_entries 
SET no_trade = FALSE 
WHERE no_trade IS NULL;

-- Commentaire pour documenter la colonne
COMMENT ON COLUMN journal_entries.no_trade IS 'Indique si l''utilisateur n''a pas tradé ce jour-là pour une raison stratégique (marché non propice, conditions inadaptées, etc.)';
