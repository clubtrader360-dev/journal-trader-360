# 📦 Configuration Supabase Storage pour les Images

## 🎯 Objectif
Permettre aux utilisateurs de télécharger des images (screenshots, plans de trading) dans leurs notes quotidiennes.

---

## ⚙️ ÉTAPE 1 : Créer le bucket Storage

### 1️⃣ Aller dans Supabase Dashboard
1. Ouvrir : https://supabase.com/dashboard
2. Sélectionner votre projet **Club Trader 360**
3. Cliquer sur **Storage** dans le menu latéral gauche

### 2️⃣ Créer un nouveau bucket
1. Cliquer sur **"New bucket"**
2. Remplir les informations :
   - **Name** : `journal-images`
   - **Public bucket** : ✅ **Cocher cette case** (important pour afficher les images)
   - **File size limit** : `5 MB` (ou plus si vous voulez autoriser des images plus grandes)
   - **Allowed MIME types** : Laisser vide ou ajouter : `image/jpeg, image/png, image/gif, image/webp`

3. Cliquer sur **"Create bucket"**

---

## 🔒 ÉTAPE 2 : Configurer les politiques de sécurité (RLS)

### 1️⃣ Ajouter une politique pour l'upload (INSERT)

**Nom** : `Users can upload their own images`

**SQL** :
```sql
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'journal-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Explication** :
- Seuls les utilisateurs authentifiés peuvent uploader
- Ils peuvent uniquement uploader dans leur propre dossier (basé sur leur UUID)

### 2️⃣ Ajouter une politique pour la lecture (SELECT)

**Nom** : `Public images are accessible to everyone`

**SQL** :
```sql
CREATE POLICY "Public images are accessible to everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-images');
```

**Explication** :
- Les images sont accessibles publiquement (car le bucket est public)
- Nécessaire pour afficher les images dans l'interface

### 3️⃣ Ajouter une politique pour la suppression (DELETE)

**Nom** : `Users can delete their own images`

**SQL** :
```sql
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'journal-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);
```

**Explication** :
- Les utilisateurs peuvent supprimer uniquement leurs propres images

---

## 📋 ÉTAPE 3 : Appliquer les politiques via l'interface

### Méthode simple (via l'interface Supabase) :

1. Dans **Storage** → Cliquer sur le bucket `journal-images`
2. Aller dans l'onglet **"Policies"**
3. Cliquer sur **"New policy"**
4. Pour chaque politique ci-dessus :
   - Sélectionner **"For full customization"**
   - Remplir :
     - **Policy name** : (le nom de la politique)
     - **Allowed operation** : (SELECT, INSERT ou DELETE selon la politique)
     - **Target roles** : `authenticated` (ou `public` pour la lecture)
     - **USING expression** : (copier l'expression SQL correspondante)
   - Cliquer sur **"Review"** puis **"Save policy"**

---

## ✅ ÉTAPE 4 : Vérification

### 1️⃣ Vérifier que le bucket existe
- Dans **Storage**, vous devriez voir le bucket `journal-images`
- Il devrait être marqué comme **"Public"**

### 2️⃣ Tester l'upload depuis l'application
1. Aller sur : https://journal-trader-360.vercel.app
2. Se connecter
3. Ajouter une note quotidienne avec une image
4. Vérifier que :
   - ✅ L'image est uploadée sans erreur
   - ✅ L'image s'affiche dans la liste des notes
   - ✅ L'image s'affiche dans la modale "Voir"

### 3️⃣ Vérifier dans Supabase Storage
- Dans **Storage** → `journal-images`
- Vous devriez voir des dossiers avec les UUIDs des utilisateurs
- Chaque dossier contient les images uploadées par l'utilisateur

---

## 🔍 STRUCTURE DES FICHIERS

```
journal-images/
├── <user_uuid_1>/
│   ├── 1736612345678_abc123.jpg
│   ├── 1736612456789_def456.png
│   └── ...
├── <user_uuid_2>/
│   ├── 1736612567890_ghi789.jpg
│   └── ...
└── ...
```

**Format des noms de fichiers** :
- `<user_uuid>/<timestamp>_<random>.ext`
- Exemple : `550e8400-e29b-41d4-a716-446655440000/1736612345678_abc123.jpg`

---

## 🐛 DÉPANNAGE

### ❌ Erreur : "new row violates row-level security policy"
**Solution** : Vérifier que la politique INSERT est bien configurée avec `auth.uid()::text = (storage.foldername(name))[1]`

### ❌ Erreur : "Error: Invalid bucket"
**Solution** : Vérifier que le bucket `journal-images` existe bien et qu'il est public

### ❌ L'image ne s'affiche pas
**Solution** :
1. Vérifier que le bucket est **public**
2. Vérifier que la politique SELECT existe
3. Vérifier l'URL dans la console : elle doit ressembler à :
   ```
   https://<project-ref>.supabase.co/storage/v1/object/public/journal-images/<user_uuid>/<filename>
   ```

### ❌ Erreur : "File size exceeds limit"
**Solution** : Augmenter la limite de taille dans les paramètres du bucket (max 50 MB)

---

## 📊 EXEMPLE DE POLITIQUE COMPLÈTE (via SQL Editor)

Si vous préférez tout faire via SQL, exécutez ce script complet :

```sql
-- 1. Créer les politiques pour le bucket journal-images

-- Politique INSERT : Upload d'images
CREATE POLICY "Users can upload their own images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'journal-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Politique SELECT : Lecture des images
CREATE POLICY "Public images are accessible to everyone"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'journal-images');

-- Politique DELETE : Suppression d'images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (
    bucket_id = 'journal-images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
);

-- 2. Vérifier les politiques
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'objects' AND schemaname = 'storage'
ORDER BY policyname;
```

---

## 🎬 PROCHAINES ÉTAPES

1. ✅ Créer le bucket `journal-images` dans Supabase Storage
2. ✅ Configurer les 3 politiques (INSERT, SELECT, DELETE)
3. 🧪 Tester l'upload d'une image depuis l'application
4. ✅ Vérifier que l'image s'affiche correctement dans la modale "Voir"

**Une fois configuré, les images seront automatiquement uploadées et affichées !** 🎉

---

**Dernière mise à jour** : 2026-01-11 - Commit 4333d7e
**Documentation** : https://supabase.com/docs/guides/storage
