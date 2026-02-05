# 🔧 Migration Urgente : Colonnes Méthode/Hors Méthode

## ❌ Erreur Actuelle

```
Could not find the 'is_hors_methode' column of 'trades' in the schema cache
```

## ✅ Solution

Les colonnes `is_methode` et `is_hors_methode` doivent être ajoutées à la table `trades` dans Supabase.

## 📝 Étapes de Migration (2 minutes)

### 1️⃣ Ouvrir Supabase SQL Editor

1. Aller sur : https://supabase.com/dashboard
2. Sélectionner le projet : **journal-trader-360**
3. Cliquer sur **SQL Editor** dans le menu de gauche

### 2️⃣ Exécuter le Script SQL

**Copier-coller le script suivant dans l'éditeur SQL :**

```sql
-- Migration: Ajouter les colonnes is_methode et is_hors_methode à la table trades
-- Date: 2026-02-05
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
```

### 3️⃣ Cliquer sur "Run" (en bas à droite)

**Résultat attendu :**
```
Success. No rows returned.
```

### 4️⃣ Vérifier la Migration

**Exécuter cette requête pour vérifier :**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'trades' 
  AND column_name IN ('is_methode', 'is_hors_methode')
ORDER BY column_name;
```

**Résultat attendu :**

| column_name | data_type | is_nullable | column_default |
|-------------|-----------|-------------|----------------|
| is_hors_methode | boolean | YES | false |
| is_methode | boolean | YES | false |

### 5️⃣ Rafraîchir l'Application

1. Aller sur : https://journal-trader-360.vercel.app
2. Faire **Ctrl + F5** (hard refresh)
3. Ajouter un trade et cocher "✅ Méthode"
4. Vérifier que l'erreur a disparu

---

## 🎯 Ce que ça corrige

✅ Checkbox "✅ Méthode" fonctionnelle  
✅ Checkbox "❌ Hors Méthode" fonctionnelle  
✅ Compteurs "Trades Méthode" et "Trades Hors Méthode" dans le Dashboard  
✅ Statistiques correctes dans le bandeau du Dashboard

---

## 🚨 Important

**Cette migration est NON DESTRUCTIVE** :
- ✅ Ne supprime aucune donnée
- ✅ Ne modifie aucun trade existant
- ✅ Ajoute simplement 2 nouvelles colonnes avec valeur par défaut `false`
- ✅ Utilise `ADD COLUMN IF NOT EXISTS` (sécurisé)

---

## 📞 Support

Si l'erreur persiste après la migration, vérifier :

1. **Cache Supabase** : Attendre 1-2 minutes que le cache soit rafraîchi
2. **Connexion** : Se déconnecter/reconnecter de l'application
3. **Logs** : Ouvrir la console (F12) et chercher les erreurs

---

**Fichier SQL source** : `add_methode_columns.sql`
