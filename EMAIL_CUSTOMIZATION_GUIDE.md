# 🎨 Guide de Personnalisation de l'Email Hebdomadaire

## 📋 Table des matières

1. [Couleurs personnalisables](#couleurs)
2. [Logo](#logo)
3. [Mise en page](#mise-en-page)
4. [Textes et emojis](#textes)
5. [Tester les modifications](#test)

---

## 🎨 1. COULEURS PERSONNALISABLES

Le fichier à modifier : `/api/cron/weekly-report.js`

### Couleur principale (doré) : `#ac862b`

**Où la modifier :**

```javascript
// Ligne ~248 : Bordure du header
border-bottom: 3px solid #ac862b;

// Ligne ~252 : Titre principal
color: #ac862b;

// Ligne ~264 : Bordure de la carte de métriques
border-left: 4px solid #ac862b;

// Ligne ~285 : Valeurs des métriques
color: #ac862b;

// Ligne ~318 : Badges
background: #ac862b;

// Ligne ~335 : Bouton CTA
background: #ac862b;
```

**Exemples de couleurs alternatives :**
- Bleu : `#3b82f6`
- Vert : `#10b981`
- Violet : `#8b5cf6`
- Orange : `#f59e0b`

---

### Couleur positive (vert) : `#10b981`

```javascript
// Ligne ~293
.positive {
  color: #10b981 !important;
}
```

---

### Couleur négative (rouge) : `#ef4444`

```javascript
// Ligne ~296
.negative {
  color: #ef4444 !important;
}
```

---

### Couleur de fond : `#f5f5f5`

```javascript
// Ligne ~237
background-color: #f5f5f5;
```

---

## 🖼️ 2. LOGO

### Logo actuel

```html
<!-- Ligne ~354 -->
<img src="https://journal-trader-360.vercel.app/trader360-logo.png" 
     alt="Trader 360" 
     class="logo">
```

### Personnaliser le logo

**Option 1 : Changer la taille**

```css
/* Ligne ~250 */
.logo {
  max-width: 200px;  /* Modifier ici (ex: 150px, 250px) */
  height: auto;
  margin-bottom: 20px;
}
```

**Option 2 : Utiliser un autre logo**

1. Upload ton nouveau logo dans le projet
2. Changer l'URL :

```html
<img src="https://journal-trader-360.vercel.app/MON-NOUVEAU-LOGO.png" 
     alt="Trader 360" 
     class="logo">
```

**Option 3 : Supprimer le logo**

Commenter ou supprimer les lignes ~354-355 :

```html
<!-- <img src="..." alt="Trader 360" class="logo"> -->
```

---

## 📐 3. MISE EN PAGE

### Largeur de l'email

```css
/* Ligne ~234 */
max-width: 600px;  /* Modifier ici (ex: 500px, 700px) */
```

### Espacements

**Padding du container :**

```css
/* Ligne ~242 */
padding: 30px;  /* Modifier ici (ex: 20px, 40px) */
```

**Espacement entre sections :**

```css
/* Ligne ~299 */
.section {
  margin: 30px 0;  /* Modifier ici (ex: 20px 0, 40px 0) */
}
```

### Taille des polices

**Titre principal :**

```css
/* Ligne ~254 */
font-size: 28px;  /* Modifier ici (ex: 24px, 32px) */
```

**Valeurs des métriques :**

```css
/* Ligne ~283 */
font-size: 24px;  /* Modifier ici (ex: 20px, 28px) */
```

---

## ✏️ 4. TEXTES ET EMOJIS

### Titre de l'email

```javascript
// Ligne ~352
<h1>📊 Ton Rapport Hebdomadaire</h1>

// Exemples :
<h1>🚀 Ton Bilan de la Semaine</h1>
<h1>💪 Ta Performance Hebdomadaire</h1>
<h1>📈 Ton Résumé Trading</h1>
```

### Textes des sections

```javascript
// Ligne ~358 : Section performance
<h3>📈 PERFORMANCE GLOBALE</h3>

// Ligne ~383 : Section trades clés
<h2>🎯 Trades Clés</h2>

// Ligne ~397 : Section points positifs
<h2>✅ Points Positifs (${allPositives.length} au total)</h2>

// Ligne ~410 : Section erreurs
<h2>❌ Erreurs Commises (${allErrors.length} au total)</h2>
```

### Bouton CTA

```javascript
// Ligne ~433
<a href="https://journal-trader-360.vercel.app" class="cta-button">
  📖 Voir mon journal complet
</a>

// Exemples :
📊 Accéder à mon dashboard
🔍 Analyser mes trades
💼 Voir mon journal
```

### Footer

```javascript
// Ligne ~440
<p><strong>Journal Trader 360</strong> - Ton journal de trading intelligent</p>

// Personnaliser :
<p><strong>Trader 360</strong> - Votre partenaire trading</p>
```

---

## 🧪 5. TESTER LES MODIFICATIONS

### Méthode 1 : Script de test

```bash
# Envoyer un email de test à ton adresse
node test-email.js TON_EMAIL@example.com
```

**Exemple :**
```bash
node test-email.js john.doe@gmail.com
```

### Méthode 2 : Endpoint API

```bash
# Appeler l'endpoint manuellement
curl https://journal-trader-360.vercel.app/api/cron/weekly-report
```

### Méthode 3 : Outils en ligne

1. **Copier le HTML** de l'email (lignes 222-448 dans `weekly-report.js`)
2. **Coller dans un visualiseur** : https://htmledit.squarefree.com/
3. **Voir le rendu** instantanément

---

## 🔧 WORKFLOW DE MODIFICATION

1. ✅ **Modifier** `/api/cron/weekly-report.js`
2. ✅ **Tester localement** avec `node test-email.js`
3. ✅ **Commit & Push** les modifications
4. ✅ **Vercel redéploie** automatiquement
5. ✅ **Tester en production** avec l'endpoint

---

## 📝 EXEMPLE DE MODIFICATION COMPLÈTE

### Changer la couleur principale en bleu (#3b82f6)

```bash
# 1. Remplacer toutes les occurrences de #ac862b par #3b82f6
cd /home/user/webapp
sed -i 's/#ac862b/#3b82f6/g' api/cron/weekly-report.js

# 2. Tester
node test-email.js TON_EMAIL@example.com

# 3. Commit
git add api/cron/weekly-report.js
git commit -m "style: Changement couleur principale en bleu"
git push origin genspark_ai_developer
```

---

## 🎨 PALETTES DE COULEURS RECOMMANDÉES

### Palette 1 : Doré (actuelle)
- Principale : `#ac862b`
- Positive : `#10b981`
- Négative : `#ef4444`

### Palette 2 : Bleu professionnel
- Principale : `#3b82f6`
- Positive : `#10b981`
- Négative : `#ef4444`

### Palette 3 : Vert moderne
- Principale : `#10b981`
- Positive : `#34d399`
- Négative : `#f87171`

### Palette 4 : Violet élégant
- Principale : `#8b5cf6`
- Positive : `#10b981`
- Négative : `#f43f5e`

---

## 📚 RESSOURCES

- **Test HTML/CSS** : https://htmledit.squarefree.com/
- **Palette de couleurs** : https://tailwindcss.com/docs/customizing-colors
- **Resend Dashboard** : https://resend.com/emails
- **Vercel Logs** : https://vercel.com/clubtrader360-dev/journal-trader-360/logs

---

**Besoin d'aide ? Consulte la documentation principale dans `PHASE_3_DEPLOYMENT_GUIDE.md` !**
