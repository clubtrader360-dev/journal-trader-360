-- =====================================================
-- DIAGNOSTIC : Vérifier is_methode et is_hors_methode
-- Date: 2026-02-05
-- =====================================================

-- 1️⃣ Vérifier que les colonnes existent
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'trades' 
  AND column_name IN ('is_methode', 'is_hors_methode')
ORDER BY column_name;

-- Résultat attendu: 2 lignes
-- is_hors_methode | boolean | YES | false
-- is_methode      | boolean | YES | false

-- =====================================================

-- 2️⃣ Compter les trades avec méthode/hors méthode
SELECT 
    COUNT(*) as total_trades,
    SUM(CASE WHEN is_methode = true THEN 1 ELSE 0 END) as trades_methode,
    SUM(CASE WHEN is_hors_methode = true THEN 1 ELSE 0 END) as trades_hors_methode,
    SUM(CASE WHEN is_methode = false AND is_hors_methode = false THEN 1 ELSE 0 END) as trades_non_marques
FROM trades;

-- =====================================================

-- 3️⃣ Afficher les 5 derniers trades créés avec leurs valeurs
SELECT 
    id,
    trade_date,
    instrument,
    manual_pnl,
    is_methode,
    is_hors_methode,
    created_at
FROM trades
ORDER BY created_at DESC
LIMIT 5;

-- =====================================================

-- 4️⃣ Vérifier les NULL (ne devrait pas y en avoir)
SELECT 
    id,
    trade_date,
    instrument,
    is_methode,
    is_hors_methode
FROM trades
WHERE is_methode IS NULL OR is_hors_methode IS NULL
LIMIT 5;

-- Résultat attendu: 0 lignes

-- =====================================================
-- 📋 INTERPRÉTATION DES RÉSULTATS
-- =====================================================
-- 
-- Si Question 1 retourne 0 lignes:
--   ❌ Les colonnes n'existent pas → Exécuter migration_methode_2026-02-05.sql
--
-- Si Question 2 montre trades_methode = 0 et trades_hors_methode = 0:
--   ⚠️ Aucun trade n'a été marqué → Problème dans l'UI (checkboxes non envoyées)
--
-- Si Question 3 montre is_methode = false et is_hors_methode = false pour tous:
--   ⚠️ Les valeurs ne sont pas sauvegardées → Problème dans supabase-trades.js
--
-- Si Question 4 retourne des lignes:
--   ⚠️ Il y a des NULL → Exécuter: UPDATE trades SET is_methode = false, is_hors_methode = false WHERE is_methode IS NULL OR is_hors_methode IS NULL;
--
-- =====================================================
