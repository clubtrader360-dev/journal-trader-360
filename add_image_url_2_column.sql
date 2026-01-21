-- Ajouter la colonne image_url_2 à la table journal_entries
ALTER TABLE journal_entries
ADD COLUMN IF NOT EXISTS image_url_2 TEXT;

-- Commentaire pour la colonne
COMMENT ON COLUMN journal_entries.image_url_2 IS 'URL de la deuxième image (optionnelle) pour les notes du journal';
