# 🔍 Diagnostic Méthode/Hors Méthode - Étapes de Debug

## 🎯 Objectif

Identifier pourquoi les checkbox "Méthode" et "Hors Méthode" ne sont pas sauvegardées/rechargées correctement.

---

## 📋 Étape 1 : Diagnostic SQL (2 minutes)

### 1️⃣ Ouvrir Supabase SQL Editor

1. Aller sur : https://supabase.com/dashboard
2. Sélectionner le projet : **journal-trader-360**
3. Cliquer sur **SQL Editor**

### 2️⃣ Exécuter le Script de Diagnostic

**Copier-coller le contenu du fichier `diagnostic_methode.sql` :**

```sql
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
```

**Résultat attendu :**
- 2 lignes retournées
- `is_hors_methode | boolean | YES | false`
- `is_methode | boolean | YES | false`

✅ **Si 2 lignes** → Les colonnes existent, passer à l'étape suivante  
❌ **Si 0 ligne** → Exécuter `migration_methode_2026-02-05.sql`

---

### 3️⃣ Vérifier les Données

```sql
-- Afficher les 5 derniers trades créés
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
```

**Vérifier :**
- ✅ Les valeurs `is_methode` et `is_hors_methode` sont-elles `true` ou `false` ?
- ❌ Sont-elles toujours `false` même après avoir coché les checkbox ?

---

## 📋 Étape 2 : Test en Direct dans l'Application (3 minutes)

### 1️⃣ Rafraîchir l'Application

1. Aller sur : **https://journal-trader-360.vercel.app**
2. **Ctrl + F5** (hard refresh)

### 2️⃣ Ouvrir la Console JavaScript

1. Appuyer sur **F12** (ouvrir DevTools)
2. Cliquer sur l'onglet **Console**

### 3️⃣ Ajouter un Trade avec "Hors Méthode"

1. Cliquer sur **"Ajouter un Trade"**
2. Remplir tous les champs obligatoires
3. **COCHER "❌ Hors Méthode"**
4. Cliquer sur **"Ajouter"**

### 4️⃣ Vérifier les Logs dans la Console

**Chercher ces logs (dans l'ordre) :**

#### **A. Log 1 : Récupération des Checkboxes (index.html)**

```
🔍 [DEBUG METHODE] Checkboxes récupérées: {
  tradeMethode_element: <input ...>,
  tradeMethode_checked: false,
  is_methode: false,
  tradeHorsMethode_element: <input ...>,
  tradeHorsMethode_checked: true,  ← DOIT ÊTRE true
  is_hors_methode: true              ← DOIT ÊTRE true
}
```

**Vérification :**
- ✅ `tradeHorsMethode_checked: true` → La checkbox est cochée
- ✅ `is_hors_methode: true` → La valeur est bien récupérée
- ❌ Si `false` → **Problème : La checkbox n'est pas cochée ou l'ID est incorrect**

---

#### **B. Log 2 : Payload Envoyé à Supabase (supabase-trades.js)**

```
🔍 [DEBUG METHODE SUPABASE] Valeurs reçues: {
  is_methode_input: false,
  is_hors_methode_input: true,    ← DOIT ÊTRE true
  is_methode_final: false,
  is_hors_methode_final: true     ← DOIT ÊTRE true
}
```

**Vérification :**
- ✅ `is_hors_methode_input: true` → La valeur arrive bien à Supabase
- ✅ `is_hors_methode_final: true` → Le payload final est correct
- ❌ Si `false` → **Problème : La valeur n'est pas transmise dans tradeData**

---

#### **C. Log 3 : Payload Final Complet**

```
[TRADES] 📦 Payload final avec timestamps: {
  user_id: "...",
  account_id: 123,
  ...
  is_methode: false,
  is_hors_methode: true  ← DOIT ÊTRE true
}
```

**Vérification :**
- ✅ `is_hors_methode: true` dans le payload → Supabase va recevoir `true`
- ❌ Si `false` → **Problème : La valeur est écrasée quelque part**

---

### 5️⃣ Vérifier dans Supabase

1. Aller sur https://supabase.com/dashboard
2. Cliquer sur **Table Editor** → `trades`
3. Trier par **created_at** (décroissant)
4. Vérifier le trade que tu viens d'ajouter

**Colonnes à vérifier :**
- `is_methode` → Doit être `false`
- `is_hors_methode` → Doit être `true`

**Résultats possibles :**

| is_methode | is_hors_methode | Diagnostic |
|------------|-----------------|------------|
| `false` | `true` | ✅ **Sauvegarde OK** → Problème dans le rechargement |
| `false` | `false` | ❌ **Sauvegarde KO** → Problème dans l'envoi à Supabase |
| `NULL` | `NULL` | ❌ **Colonnes manquantes** → Exécuter migration SQL |

---

## 📋 Étape 3 : Test de Rechargement (2 minutes)

### 1️⃣ Rafraîchir la Page

- **Ctrl + F5**

### 2️⃣ Vérifier le Dashboard

- Aller dans le **bandeau en haut** du Dashboard
- Chercher **"Trades Hors Méthode"**
- **Attendu** : `1 (100%)`
- **Si `0 (0%)`** → Problème dans le rechargement

### 3️⃣ Éditer le Trade

1. Aller dans **Journal des Trades**
2. Cliquer sur **✏️ (Modifier)** sur le trade
3. **Vérifier** : La checkbox "❌ Hors Méthode" est-elle cochée ?

**Dans la console, chercher :**

```
[EDIT] Hors Méthode: ✅ Coché  ← DOIT APPARAÎTRE
```

**Résultats possibles :**

| Console Log | Checkbox | Diagnostic |
|-------------|----------|------------|
| `✅ Coché` | ✅ Cochée | ✅ **Rechargement OK** |
| `Non coché` | ❌ Décochée | ❌ **Rechargement KO** → `trade.is_hors_methode` est `false` |

---

## 🎯 Synthèse des Problèmes Possibles

| Symptôme | Cause | Solution |
|----------|-------|----------|
| Log 1 : `is_hors_methode: false` alors que coché | ID checkbox incorrect | Vérifier `id="tradeHorsMethode"` dans le HTML |
| Log 2 : `is_hors_methode_input: false` | Valeur non transmise | Vérifier `tradeData.is_hors_methode` dans `addTradeUI` |
| Supabase : `is_hors_methode` = `false` | Envoi échoué | Vérifier requête INSERT dans `supabase-trades.js` |
| Supabase : `is_hors_methode` = `true` mais Dashboard = 0 | Rechargement échoué | Vérifier mapping dans `refreshAllModules` |
| Édition : Checkbox décochée | Rechargement editTrade échoué | Vérifier `trade.is_hors_methode` dans `editTrade` |

---

## 📞 Me Communiquer

**Après avoir fait les tests, me dire :**

1. **Résultat SQL** : Les colonnes existent-elles ? (2 lignes ?)
2. **Log Console 1** : `is_hors_methode` = `true` ou `false` ?
3. **Log Console 2** : `is_hors_methode_input` = `true` ou `false` ?
4. **Supabase** : `is_hors_methode` = `true` ou `false` dans la table ?
5. **Dashboard** : "Trades Hors Méthode" = combien ?
6. **Édition** : Checkbox cochée ou décochée ?

Avec ces infos, je pourrai identifier précisément où est le bug ! 🔍
