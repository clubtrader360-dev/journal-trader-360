# 🧪 TEST IMPORT CSV - GC (Gold)

## ✅ Modifications Apportées

### 1. Ajout de l'option GC dans le formulaire
```html
<option value="GC">GC (Gold - $100/point)</option>
```

### 2. Calcul du multiplicateur
- **ES** : 50$/point
- **NQ** : 20$/point  
- **MES** : 5$/point
- **GC** : 100$/point ✨ NOUVEAU
- **DEMO** : P&L manuel

### 3. Formule de calcul
```javascript
P&L = (Exit - Entry) × Quantity × Direction × Multiplicateur

Exemples GC :
- 0.1 point × 1 contrat = 10$  (0.1 × 1 × 100 = 10)
- 1.0 point × 1 contrat = 100$ (1.0 × 1 × 100 = 100)
- 2.5 points × 2 contrats = 500$ (2.5 × 2 × 100 = 500)
```

---

## 📊 FORMAT CSV ATTENDU

Le système devrait détecter automatiquement **GC** dans la colonne instrument.

### Exemple CSV :
```csv
date,entry_time,exit_time,instrument,direction,quantity,entry_price,exit_price,pnl
2026-01-14,09:30,10:15,GC,LONG,1,2050.5,2051.0,50.00
2026-01-14,14:00,14:45,GC,SHORT,2,2052.0,2051.5,100.00
```

---

## 🧪 TESTS À EFFECTUER

### Test 1 : Ajout Manuel
1. Aller dans "Journal des Trades"
2. Cliquer sur "Ajouter un Trade"
3. Sélectionner **GC (Gold - $100/point)**
4. Remplir :
   - Entry: 2050.0
   - Exit: 2050.5
   - Quantity: 1
   - Direction: LONG
5. **Résultat attendu** : P&L = +50$ (0.5 × 1 × 100)

### Test 2 : Import CSV
1. Créer un fichier CSV avec des trades GC
2. Importer le fichier
3. Vérifier que :
   - L'instrument est bien détecté comme "GC"
   - Le P&L est calculé avec le multiplicateur 100
   - Exemple : 0.1 point = 10$

### Test 3 : Dashboard Coach
1. Se connecter en Coach
2. Vérifier que les trades GC des élèves sont bien comptabilisés
3. Le calcul P&L doit utiliser le multiplicateur 100

---

## ✅ RÉSULTATS ATTENDUS

| Entry | Exit | Qty | Direction | Points | P&L Calculé |
|-------|------|-----|-----------|--------|-------------|
| 2050.0 | 2050.5 | 1 | LONG | +0.5 | +$50 |
| 2050.0 | 2051.0 | 1 | LONG | +1.0 | +$100 |
| 2052.0 | 2051.5 | 2 | SHORT | +0.5 | +$100 |
| 2050.0 | 2049.0 | 1 | LONG | -1.0 | -$100 |

---

## 📝 NOTES IMPORTANTES

- ✅ Le multiplicateur GC (100) est appliqué dans **3 endroits** :
  1. Formulaire d'ajout de trade (index.html ligne 2142)
  2. Calcul P&L élève (index.html ligne 5213)
  3. Calcul P&L coach (supabase-coach.js ligne 346)

- ✅ Compatible avec l'import CSV automatique
- ✅ Le P&L est calculé automatiquement sauf si instrument = DEMO

