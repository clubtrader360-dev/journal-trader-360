-- Migration: Création de la table user_motivation
-- Date: 2026-04-26
-- Description: Stocke la motivation personnelle de l'utilisateur (photo + texte "Mon Pourquoi")

-- Créer la table user_motivation
CREATE TABLE IF NOT EXISTS user_motivation (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    motivation_text TEXT,
    motivation_image_url TEXT,
    show_on_login BOOLEAN DEFAULT TRUE,
    last_shown_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Ajouter un index sur user_id pour les requêtes rapides
CREATE INDEX IF NOT EXISTS idx_user_motivation_user_id ON user_motivation(user_id);

-- Ajouter les commentaires pour la documentation
COMMENT ON TABLE user_motivation IS 'Stocke la motivation personnelle (Mon Pourquoi) de chaque utilisateur';
COMMENT ON COLUMN user_motivation.user_id IS 'UUID de l''utilisateur (référence auth.users)';
COMMENT ON COLUMN user_motivation.motivation_text IS 'Texte de motivation (pourquoi je trade)';
COMMENT ON COLUMN user_motivation.motivation_image_url IS 'URL de l''image de motivation (famille, objectif, etc.)';
COMMENT ON COLUMN user_motivation.show_on_login IS 'Afficher le modal à la connexion (true/false)';
COMMENT ON COLUMN user_motivation.last_shown_date IS 'Dernière date d''affichage du modal';

-- Activer RLS (Row Level Security)
ALTER TABLE user_motivation ENABLE ROW LEVEL SECURITY;

-- Policy: Les utilisateurs peuvent voir uniquement leur propre motivation
CREATE POLICY "Users can view their own motivation"
    ON user_motivation
    FOR SELECT
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent insérer leur propre motivation
CREATE POLICY "Users can insert their own motivation"
    ON user_motivation
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent mettre à jour leur propre motivation
CREATE POLICY "Users can update their own motivation"
    ON user_motivation
    FOR UPDATE
    USING (auth.uid() = user_id);

-- Policy: Les utilisateurs peuvent supprimer leur propre motivation
CREATE POLICY "Users can delete their own motivation"
    ON user_motivation
    FOR DELETE
    USING (auth.uid() = user_id);
