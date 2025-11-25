# Journal Trader 360 - Version Supabase

## 📦 Fichiers

- `index.html` - Application principale
- `supabase-config.js` - Configuration Supabase (clés API)
- `supabase-auth.js` - Authentification (login/register)
- `supabase-trades.js` - Gestion trades/accounts avec Supabase

## 🚀 Déploiement GitHub

### Étape 1 : Uploader les fichiers

1. Allez sur votre repo : https://github.com/clubtrader360-dev/journal-trader-360
2. Supprimez l'ancien `index.html` (cliquez dessus → Delete file)
3. Cliquez sur **"Add file"** → **"Upload files"**
4. Glissez-déposez LES 4 FICHIERS :
   - `index.html`
   - `supabase-config.js`
   - `supabase-auth.js`
   - `supabase-trades.js`
5. Message de commit : `Intégration Supabase - Auth + Trades`
6. Cliquez **"Commit changes"**

### Étape 2 : Vercel redéploiera automatiquement

Vercel détectera les changements et redéploiera automatiquement (2-3 min).

## ✅ Test

1. Allez sur https://journal-trader-360.vercel.app/
2. Créez un nouveau compte (S'inscrire)
3. Attendez la validation du coach
4. Connectez-vous en coach pour valider :
   - Email: `clubtrader360@gmail.com`
   - Code: `MDMA2025`
5. Allez dans "Inscriptions" → Approuver le nouveau compte
6. Reconnectez-vous en élève et testez l'ajout de trade

## 🐛 Si ça ne marche pas

1. Ouvrez la console (F12)
2. Regardez les erreurs
3. Envoyez-moi une capture d'écran

## ✅ TOUT FONCTIONNE AVEC SUPABASE

✅ Login / Register
✅ Validation coach
✅ Ajout de trades
✅ Suppression de trades
✅ Ajout de comptes
✅ Suppression de comptes
✅ Journal entries (ajout/suppression)
✅ Account costs (ajout/suppression)
✅ Payouts (ajout/suppression)
✅ Comptabilité coach (complète)
✅ Gestion inscriptions (approve/reject/revoke)

## 🎉 APPLICATION 100% CLOUD

Toutes les données sont maintenant stockées dans Supabase PostgreSQL.
Plus de localStorage - tout est synchronisé en temps réel.
