# 🔍 Comment vérifier que Supabase prend bien les données

## 📊 Méthode 1 : Via le site Supabase (RECOMMANDÉ)

### **Étape 1 : Connexion à Supabase**

1. Allez sur https://supabase.com
2. Connectez-vous avec votre compte
3. Cliquez sur votre projet **"Journal Trader 360"**

### **Étape 2 : Ouvrir le Table Editor**

1. Dans le menu de gauche, cliquez sur **"Table Editor"** (icône tableau)
2. Vous verrez vos 6 tables :
   - `users` - Utilisateurs (students + coach)
   - `trades` - Trades des étudiants
   - `accounts` - Comptes de trading
   - `journal_entries` - Entrées de journal
   - `account_costs` - Coûts des comptes
   - `payouts` - Payouts/Retraits

### **Étape 3 : Vérifier les données**

**Pour vérifier qu'un nouvel utilisateur s'est inscrit :**
1. Cliquez sur la table **`users`**
2. Vous verrez tous les utilisateurs
3. Colonnes importantes :
   - `email` - Email de l'utilisateur
   - `role` - `student` ou `coach`
   - `status` - `pending`, `active`, ou `revoked`
   - `created_at` - Date d'inscription

**Pour vérifier qu'un trade a été ajouté :**
1. Cliquez sur la table **`trades`**
2. Vous verrez tous les trades
3. Colonnes importantes :
   - `user_id` - ID de l'utilisateur
   - `symbol` - Ex: ES, NQ
   - `pnl` - Profit/Perte
   - `created_at` - Date de création

**Pour vérifier les account costs :**
1. Cliquez sur la table **`account_costs`**
2. Colonnes importantes :
   - `user_id` - ID de l'utilisateur
   - `account_name` - Nom du compte
   - `cost` - Montant ($450, etc.)
   - `date` - Date du coût

**Pour vérifier les payouts :**
1. Cliquez sur la table **`payouts`**
2. Colonnes importantes :
   - `user_id` - ID de l'utilisateur
   - `account_name` - Nom du compte
   - `amount` - Montant du payout
   - `date` - Date du payout

---

## 🔍 Méthode 2 : Via la Console du navigateur (Pour debugger)

### **Sur le site https://journal-trader-360.vercel.app/**

1. **Ouvrez la console** (F12 sur Windows/Linux, Cmd+Option+J sur Mac)
2. **Faites une action** (exemple: ajouter un trade)
3. **Regardez les logs dans la console** :
   - ✅ Messages verts = succès
   - ❌ Messages rouges = erreur

### **Logs à surveiller :**

**Lors de l'inscription :**
```
✅ Inscription réussie: {id: "...", email: "...", status: "pending"}
```

**Lors de l'ajout d'un trade :**
```
✅ Trade ajouté: {id: "...", symbol: "ES", pnl: 150}
```

**Lors du chargement des données :**
```
✅ Données chargées depuis Supabase
```

**Si erreur :**
```
❌ Erreur insertion trade: {...}
```

---

## 🚨 Que faire si les données n'apparaissent PAS dans Supabase ?

### **Vérification 1 : Regarder la console navigateur**

1. F12 → Console
2. Faites l'action (inscription, ajout trade, etc.)
3. Cherchez des messages d'erreur en rouge

**Erreurs courantes :**
- `RLS policy violation` → Problème de permissions
- `duplicate key value` → L'entrée existe déjà
- `null value in column` → Champ obligatoire manquant
- `relation "table" does not exist` → Table n'existe pas

### **Vérification 2 : Vérifier que les scripts JS sont chargés**

Dans la console, tapez :
```javascript
typeof supabase
```

**Résultat attendu :** `"object"`  
**Si "undefined"** → Le client Supabase n'est pas chargé

### **Vérification 3 : Vérifier les clés API**

Dans la console, tapez :
```javascript
supabase.supabaseUrl
```

**Résultat attendu :** `"https://zgihbpgoorymomtsbxpz.supabase.co"`  
**Si différent** → Problème de configuration

---

## ✅ Comment savoir que TOUT fonctionne bien ?

### **Test complet (10 min) :**

1. **Inscription nouvel utilisateur**
   - S'inscrire avec un nouvel email
   - Vérifier dans Supabase → `users` table → Status = `pending`

2. **Validation coach**
   - Se connecter en coach
   - Aller dans "Inscriptions"
   - Approuver l'utilisateur
   - Vérifier dans Supabase → `users` table → Status = `active`

3. **Ajout de trade (élève)**
   - Se connecter avec le compte élève approuvé
   - Ajouter un trade
   - Vérifier dans Supabase → `trades` table → 1 nouvelle ligne

4. **Ajout de cost (élève)**
   - Dans "Comptabilité", ajouter un account cost
   - Vérifier dans Supabase → `account_costs` table → 1 nouvelle ligne

5. **Ajout de payout (élève)**
   - Dans "Comptabilité", ajouter un payout
   - Vérifier dans Supabase → `payouts` table → 1 nouvelle ligne

6. **Comptabilité coach**
   - Se connecter en coach
   - Aller dans "Comptabilité"
   - Les montants doivent être corrects (Total investi, Payouts, ROI)

---

## 📊 Dashboard Supabase - Statistiques

### **Dans le menu "Home" de votre projet Supabase :**

Vous pouvez voir :
- **Database size** - Taille de la base (devrait augmenter quand vous ajoutez des données)
- **API requests** - Nombre de requêtes API (devrait augmenter quand vous utilisez l'app)
- **Active connections** - Connexions actives

Si ces chiffres augmentent, c'est que l'app communique bien avec Supabase ✅

---

## 🆘 AIDE RAPIDE

**Si une action ne fonctionne pas :**
1. F12 → Console
2. Faites l'action
3. Capture d'écran des erreurs
4. Envoyez-moi la capture

**Si rien ne s'affiche dans Supabase :**
1. Vérifiez que vous êtes sur le bon projet
2. Vérifiez que les tables existent (Table Editor → 6 tables)
3. Vérifiez la console navigateur pour les erreurs
