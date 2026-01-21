# 🚀 Guide d'Exécution des Scripts SQL

## ⚠️ IMPORTANT : ORDRE D'EXÉCUTION

Exécutez les scripts dans cet ordre :

### 1️⃣ **Script 1** : `fix_pnl_with_fees_v2.sql`
**Ce qu'il fait :**
- Supprime et recrée la colonne `pnl`
- Crée le trigger qui déduit automatiquement les frais
- Recrée la vue `student_statistics`

### 2️⃣ **Script 2** : `recalculate_all_pnl.sql`
**Ce qu'il fait :**
- Force le recalcul de **TOUS** les trades existants
- Déduit les frais de tous les P&L

---

## 📝 Étapes à suivre

### **ÉTAPE 1** : Ouvrir Supabase Dashboard
1. Va sur : **https://supabase.com/dashboard**
2. Sélectionne le projet : **journal-trader-360**
3. Clique sur **SQL Editor** dans le menu de gauche
4. Clique sur **New Query**

---

### **ÉTAPE 2** : Exécuter le Script 1

1. **Copie TOUT le contenu** du fichier `fix_pnl_with_fees_v2.sql`
2. **Colle** dans l'éditeur SQL
3. Clique sur **Run** (ou `Ctrl+Enter` / `Cmd+Enter`)
4. **Attends 10-15 secondes**

**✅ Résultat attendu :**
```
NOTICE: 🎉 Migration terminée ! Le P&L inclut maintenant les frais.
NOTICE: 📊 Vue student_statistics recréée avec succès.
Success. No rows returned
```

---

### **ÉTAPE 3** : Exécuter le Script 2

1. **Crée une nouvelle requête** (New Query)
2. **Copie TOUT le contenu** du fichier `recalculate_all_pnl.sql`
3. **Colle** dans l'éditeur SQL
4. Clique sur **Run** (ou `Ctrl+Enter` / `Cmd+Enter`)
5. **Attends 5 secondes**

**✅ Résultat attendu :**
```
NOTICE: ✅ X trades recalculés avec frais déduits.
Success. X rows affected
```
(où X = le nombre de trades dans ta base)

---

## 🧪 Tests à faire APRÈS

### Test 1 : Vérifier un trade existant
1. Va dans **Trades**
2. Regarde un trade qui avait des frais (par exemple 4.20$)
3. Le P&L affiché doit maintenant être **inférieur** à avant

**Exemple :**
- **Avant** : P&L = $2,500.00 (sans frais)
- **Après** : P&L = $2,495.80 (avec frais de 4.20$ déduits)

### Test 2 : Ajouter un nouveau trade avec frais
1. Clique sur **Ajouter un Trade**
2. Remplis tous les champs
3. Dans **Frais / Commissions ($)** : mets `4.20`
4. Enregistre
5. Vérifie que le P&L affiché prend en compte les frais

### Test 3 : Modifier un trade avec frais
1. Clique sur **Modifier** sur un trade existant
2. Vérifie que le champ **Frais** affiche le montant (ex: 4.20)
3. Change les frais à `5.00`
4. Enregistre
5. Vérifie que le P&L a été recalculé

---

## 🆘 En cas de problème

### Erreur : "view student_statistics depends on it"
➡️ Tu as exécuté l'ancien script. Exécute le **Script 1** (`fix_pnl_with_fees_v2.sql`) qui gère ce problème.

### Les frais ne se chargent pas lors de l'édition
➡️ Attends 2-3 minutes que Vercel déploie, puis vide ton cache navigateur (`Ctrl+F5`)

### Le P&L n'a pas changé après les scripts
➡️ Vérifie que tu as bien exécuté les **2 scripts** dans l'ordre

---

## 📊 Calcul du P&L avec Frais

### Formule :
```
Point Diff = Exit Price - Entry Price
P&L Brut = Point Diff × Quantity × Multiplier
P&L Net = P&L Brut - Frais
```

### Multipliers par instrument :
- **ES** : $50 par point
- **MES** : $5 par point
- **NQ** : $20 par point
- **GC** : $100 par point
- **Autres** : $50 par défaut

### Exemple :
```
Trade ES LONG
Entry : 5000
Exit : 5025
Quantity : 2
Frais : 4.20$

→ Point Diff = 5025 - 5000 = 25
→ P&L Brut = 25 × 2 × 50 = $2,500.00
→ P&L Net = $2,500.00 - $4.20 = $2,495.80
```

---

## ✅ Checklist Finale

- [ ] Script 1 exécuté avec succès
- [ ] Script 2 exécuté avec succès
- [ ] Test 1 : Trade existant vérifié
- [ ] Test 2 : Nouveau trade avec frais ajouté
- [ ] Test 3 : Modification d'un trade testée
- [ ] Dashboard Coach fonctionne
- [ ] Dashboard Élève fonctionne

---

**🎉 Une fois tout vérifié, tu peux me confirmer que tout fonctionne !**

📧 Support : Envoie un screenshot si tu as une erreur
