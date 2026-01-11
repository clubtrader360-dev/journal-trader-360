# 🔧 Guide de Migration Supabase - Club Trader 360

## Problème Identifié
Les colonnes nécessaires manquent dans les tables `journal_entries` et potentiellement `trades`.

**Erreur visible :** `Could not find the 'emotion_after' column of 'journal_entries' in the schema cache`

---

## 📋 Solution : Exécuter les Scripts SQL de Migration

### Étape 1 : Connexion à Supabase

1. Allez sur https://supabase.com/dashboard
2. Sélectionnez votre projet **Club Trader 360**
3. Dans le menu de gauche, cliquez sur **SQL Editor**

### Étape 2 : Migration de la table `journal_entries`

1. Cliquez sur **+ New Query**
2. Copiez-collez le contenu du fichier `migration_journal_entries.sql`
3. Cliquez sur **Run** (ou appuyez sur Ctrl+Enter)
4. Vérifiez que le message indique : `Success. No rows returned`
5. Vous devriez voir les colonnes ajoutées listées en bas

**Colonnes qui seront ajoutées :**
- ✅ `emotion_before` (TEXT)
- ✅ `emotion_after` (TEXT)
- ✅ `session_rating` (INTEGER)
- ✅ `image_url` (TEXT)
- ✅ `content` (TEXT NOT NULL)

### Étape 3 : Migration de la table `trades` (optionnel mais recommandé)

1. Cliquez sur **+ New Query**
2. Copiez-collez le contenu du fichier `migration_trades.sql`
3. Cliquez sur **Run**
4. Vérifiez le succès

**Colonnes qui seront vérifiées/ajoutées :**
- symbol, trade_type, quantity
- entry_price, exit_price
- entry_time, exit_time, trade_date
- stop_loss, take_profit
- setup, notes, manual_pnl, protections

### Étape 4 : Vérification

Après avoir exécuté les migrations, vérifiez que tout est OK :

```sql
-- Vérifier journal_entries
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'journal_entries'
ORDER BY ordinal_position;

-- Vérifier trades
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'trades'
ORDER BY ordinal_position;
```

---

## ✅ Après la Migration

1. **Rafraîchissez votre application** (Ctrl+F5)
2. **Testez l'ajout d'une note** - Devrait fonctionner sans erreur
3. **Testez l'ajout d'un trade** - Devrait fonctionner correctement
4. **Vérifiez la console** - Plus d'erreurs de colonnes manquantes

---

## 🆘 En cas de problème

Si vous rencontrez une erreur lors de l'exécution :

1. **Vérifiez les permissions** : Votre utilisateur Supabase doit avoir les droits ALTER TABLE
2. **Vérifiez la table existe** : `SELECT * FROM journal_entries LIMIT 1;`
3. **Contactez-moi** avec le message d'erreur exact

---

## 📊 Structure Finale Attendue

### Table `journal_entries`
```
- id (bigint, PK)
- user_id (uuid, FK)
- entry_date (date)
- content (text)
- emotion_before (text)
- emotion_after (text)
- session_rating (integer)
- image_url (text)
- created_at (timestamp)
```

### Table `trades`
```
- id (bigint, PK)
- user_id (uuid, FK)
- account_id (bigint, FK)
- symbol (text)
- trade_type (text)
- quantity (integer)
- entry_price (numeric)
- exit_price (numeric)
- entry_time (time)
- exit_time (time)
- trade_date (date)
- stop_loss (numeric)
- take_profit (numeric)
- setup (text)
- notes (text)
- manual_pnl (numeric)
- protections (text)
- created_at (timestamp)
```
