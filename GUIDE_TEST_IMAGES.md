# 🧪 GUIDE DE TEST - Notes avec Images

## 📋 TESTS À EFFECTUER

### ✅ **TEST 1 : Vérifier l'affichage des anciennes notes**

**Objectif** : Voir si les notes créées avant l'implémentation des images s'affichent correctement

**Procédure** :
1. Attendre 2 minutes (déploiement Vercel)
2. Aller sur : https://journal-trader-360.vercel.app
3. Se connecter
4. Ouvrir la console (F12)
5. Cliquer sur l'icône 👁️ "Voir" d'une note existante
6. **Observer les logs dans la console** :

```
[JOURNAL] Clic sur Voir, ID: XXX
[JOURNAL] viewJournalEntry() - START
[JOURNAL] entryId reçu (brut): XXX Type: string
[JOURNAL] entryId converti: XXX Type: number
[JOURNAL] User UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
[JOURNAL] Requête Supabase avec id: XXX
[JOURNAL] Résultat Supabase - data: {id: X, session_rating: Y, image_url: null, ...} error: null
[JOURNAL] ✅ Entrée récupérée: {...}
[JOURNAL] 🌟 Rating: Y Stars: ⭐⭐⭐...
[JOURNAL] ℹ️ Aucune image pour cette note
```

**Résultat attendu** :
- ✅ La modale s'affiche
- ✅ Les étoiles s'affichent (si session_rating > 0)
- ✅ "Aucune évaluation" s'affiche (si session_rating = 0 ou null)
- ✅ Pas d'erreur dans la console
- ℹ️ Pas d'image (normal, anciennes notes)

---

### 🆕 **TEST 2 : Créer une nouvelle note AVEC IMAGE**

**Objectif** : Tester l'upload d'images vers Supabase Storage

**Procédure** :
1. Cliquer sur **"Ajouter une note"**
2. Remplir le formulaire :
   - **Date** : Aujourd'hui
   - **Note** : "Test upload image"
   - **Émotion avant** : Confiant
   - **Émotion après** : Satisfait
   - **Évaluation** : Cliquer sur 5 étoiles
   - **Image** : Sélectionner une image (screenshot, photo, etc.)
3. Cliquer sur **"Ajouter la Note"**
4. **Observer les logs dans la console** :

```
[JOURNAL] addNote() - START
[JOURNAL] Mode: AJOUT ID: null
[JOURNAL] Données collectées: {noteDate: "2026-01-11", noteText: "Test upload image", ..., hasImage: true}
[JOURNAL] 📤 Upload de l'image: screenshot.png
[JOURNAL] Nom du fichier: <uuid>/1736612345678_abc123.png
[JOURNAL] ✅ Image uploadée: {path: "...", ...}
[JOURNAL] 🔗 URL publique: https://xxx.supabase.co/storage/v1/object/public/journal-images/...
[JOURNAL] Payload final: {user_id: "...", image_url: "https://...", ...}
[JOURNAL] ➕ Ajout d'une nouvelle entrée
[JOURNAL] ✅ Opération réussie: {...}
```

**Résultat attendu** :
- ✅ Alert : "✅ Note ajoutée avec succès !"
- ✅ La nouvelle note apparaît dans la liste
- ✅ L'image s'affiche dans la liste (si visible)
- ✅ Pas d'erreur dans la console

---

### 👁️ **TEST 3 : Voir la nouvelle note avec image**

**Procédure** :
1. Cliquer sur l'icône 👁️ "Voir" de la note créée au TEST 2
2. **Observer les logs dans la console** :

```
[JOURNAL] Clic sur Voir, ID: XXX
[JOURNAL] viewJournalEntry() - START
[JOURNAL] ✅ Entrée récupérée: {id: X, session_rating: 5, image_url: "https://...", ...}
[JOURNAL] 🌟 Rating: 5 Stars: ⭐⭐⭐⭐⭐
[JOURNAL] 📸 Image URL: https://xxx.supabase.co/storage/v1/object/public/journal-images/...
```

**Résultat attendu** :
- ✅ La modale s'affiche
- ✅ Les 5 étoiles s'affichent
- ✅ Les émotions s'affichent (Avant: Confiant → Après: Satisfait)
- ✅ Le contenu s'affiche
- ✅ **L'image s'affiche** (section "📸 Image")
- ✅ Cliquer sur l'image → zoom (si fonction viewImageZoom existe)

---

## 🐛 PROBLÈMES POSSIBLES ET SOLUTIONS

### ❌ Erreur : "new row violates row-level security policy"

**Cause** : Les politiques RLS ne sont pas correctement configurées

**Solution** :
```sql
-- Vérifier les politiques existantes
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'objects' AND schemaname = 'storage';

-- Si aucune politique n'apparaît, ré-exécuter le SQL de configuration
```

---

### ❌ Erreur : "Invalid bucket"

**Cause** : Le bucket `journal-images` n'existe pas ou n'est pas public

**Solution** :
1. Aller dans **Storage** → Vérifier que `journal-images` existe
2. Vérifier que le bucket est **Public** (icône 🌐)
3. Si non public, cliquer sur le bucket → **Settings** → Cocher **Public bucket**

---

### ❌ L'image ne s'affiche pas dans la modale

**Logs à vérifier** :
```
[JOURNAL] 📸 Image URL: https://...
```

**Si l'URL est présente mais l'image ne s'affiche pas** :
1. Copier l'URL de l'image
2. L'ouvrir dans un nouvel onglet
3. Si erreur 404 ou 403 :
   - Vérifier que le bucket est **public**
   - Vérifier que la politique SELECT existe

**Si l'URL n'est pas présente** :
```
[JOURNAL] ℹ️ Aucune image pour cette note
```
- La note a été créée avant l'implémentation des images
- Ou l'upload a échoué (voir les logs d'erreur)

---

### ⚠️ Avertissement : "Erreur lors de l'upload de l'image. La note sera enregistrée sans image."

**Cause** : L'upload a échoué mais la note a été enregistrée quand même

**Solutions possibles** :
1. Vérifier la taille du fichier (max 5 MB par défaut)
2. Vérifier le format (jpg, png, gif, webp)
3. Vérifier les politiques RLS (INSERT)
4. Vérifier que le bucket existe

---

### 🌟 Les étoiles ne s'affichent pas

**Si vous voyez** : "Aucune évaluation"
- C'est normal, la note a été créée sans notation (session_rating = 0 ou null)

**Si vous voyez des étoiles dans la liste mais pas dans la modale** :
1. Ouvrir la console
2. Chercher le log : `[JOURNAL] 🌟 Rating: X Stars: ...`
3. Vérifier la valeur de `X`
4. Si `X = 0` → normal, pas d'étoiles
5. Si `X > 0` mais pas d'étoiles → envoyer les logs

---

## 📸 CAPTURES D'ÉCRAN ATTENDUES

### Modale SANS image (anciennes notes) :
```
┌─────────────────────────────────────────┐
│  📝 Note du 2026-01-11            ✕    │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │ 📅 2026-01-11                       │ │
│  │ ⭐⭐⭐ (ou "Aucune évaluation")     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 😊 Émotions                         │ │
│  │ Avant: Confiant → Après: Frustré    │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 📝 Contenu                          │ │
│  │ ljbgivv gdfhsdh                     │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  [ Fermer ]                               │
└─────────────────────────────────────────┘
```

### Modale AVEC image (nouvelles notes) :
```
┌─────────────────────────────────────────┐
│  📝 Note du 2026-01-11            ✕    │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐ │
│  │ 📅 2026-01-11                       │ │
│  │ ⭐⭐⭐⭐⭐                            │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 😊 Émotions                         │ │
│  │ Avant: Confiant → Après: Satisfait  │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 📝 Contenu                          │ │
│  │ Test upload image                   │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  ┌─────────────────────────────────────┐ │
│  │ 📸 Image                            │ │
│  │ [Screenshot du plan de trading]     │ │
│  │ (Cliquer pour agrandir)             │ │
│  └─────────────────────────────────────┘ │
│                                           │
│  [ Fermer ]                               │
└─────────────────────────────────────────┘
```

---

## 🎯 CHECKLIST COMPLÈTE

- [ ] Attendre 2 minutes (déploiement Vercel)
- [ ] TEST 1 : Voir une ancienne note (sans image)
  - [ ] Modale s'affiche ✅
  - [ ] Étoiles ou "Aucune évaluation" ✅
  - [ ] Émotions affichées ✅
  - [ ] Contenu affiché ✅
  - [ ] Pas d'erreur console ✅
- [ ] TEST 2 : Créer une nouvelle note avec image
  - [ ] Formulaire rempli ✅
  - [ ] Image sélectionnée ✅
  - [ ] "Note ajoutée avec succès !" ✅
  - [ ] Logs d'upload dans la console ✅
- [ ] TEST 3 : Voir la nouvelle note
  - [ ] Modale s'affiche ✅
  - [ ] 5 étoiles affichées ✅
  - [ ] Image affichée ✅
  - [ ] Clic sur l'image → zoom ✅

---

## 📞 SI VOUS AVEZ UN PROBLÈME

**Envoyez-moi** :
1. Une capture d'écran de la modale
2. Les logs complets de la console (F12)
3. Le message d'erreur exact (s'il y en a un)

---

**Dernière mise à jour** : 2026-01-11 - Commit a649a87
**Prochaine étape** : Tester les formulaires Trades, Payouts, Account Costs
