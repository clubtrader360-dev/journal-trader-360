# 📧 Configuration du Rapport Hebdomadaire

## 🔧 Variables d'environnement à configurer dans Vercel

### 1. **SUPABASE_SERVICE_KEY** (OBLIGATOIRE)
- Va dans Supabase Dashboard → Settings → API
- Copie la clé **"service_role key"** (⚠️ PAS la clé "anon public")
- Ajoute-la dans Vercel → Settings → Environment Variables
- Nom : `SUPABASE_SERVICE_KEY`
- Valeur : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (ta clé service)

### 2. **RESEND_API_KEY** (OBLIGATOIRE)
- Va sur https://resend.com
- Crée un compte (gratuit jusqu'à 3 000 emails/mois)
- Va dans API Keys → Create API Key
- Copie la clé `re_...`
- Ajoute-la dans Vercel → Settings → Environment Variables
- Nom : `RESEND_API_KEY`
- Valeur : `re_...` (ta clé Resend)

### 3. **CRON_SECRET** (RECOMMANDÉ)
- Génère un token sécurisé : `openssl rand -hex 32`
- Ajoute-le dans Vercel → Settings → Environment Variables
- Nom : `CRON_SECRET`
- Valeur : `abc123def456...` (ton token généré)

### 4. **SUPABASE_URL** (OPTIONNEL)
- Déjà défini dans le code : `https://zgihbpgoorymomtsbxpz.supabase.co`
- Ajoute-le si tu veux le surcharger
- Nom : `SUPABASE_URL`
- Valeur : `https://ton-projet.supabase.co`

---

## 📅 Configuration du Cron Job

Le cron job est configuré dans `vercel.json` :

\`\`\`json
{
  "crons": [
    {
      "path": "/api/cron/weekly-report",
      "schedule": "0 20 * * 0"
    }
  ]
}
\`\`\`

**Schedule** : `0 19 * * 0`
- `0` = Minute 0
- `19` = Heure 19 (19h00 UTC)
- `*` = Tous les jours du mois
- `*` = Tous les mois
- `0` = Dimanche (0 = dimanche, 1 = lundi, etc.)

➡️ **Résultat** : Tous les dimanches à 19h00 UTC (= **20h00 heure de Paris** en hiver, 21h00 en été)

---

## 🧪 Tester l'endpoint manuellement

### Depuis le navigateur (après déploiement)
\`\`\`
https://journal-trader-360.vercel.app/api/cron/weekly-report
\`\`\`

### Avec curl (avec le CRON_SECRET)
\`\`\`bash
curl -X POST https://journal-trader-360.vercel.app/api/cron/weekly-report \\
  -H "Authorization: Bearer TON_CRON_SECRET"
\`\`\`

---

## 📧 Configuration du domaine d'envoi (Resend)

### Option 1 : Utiliser le domaine Resend (plus simple)
- Resend fournit un sous-domaine gratuit : `@resend.dev`
- Aucune configuration DNS nécessaire
- L'email apparaîtra comme : `reports@resend.dev`
- ✅ **Configuré par défaut dans le code**

### Option 2 : Utiliser ton propre domaine (recommandé pour la prod)
1. Va dans Resend → Domains → Add Domain
2. Entre ton domaine : `journal-trader-360.com`
3. Ajoute les enregistrements DNS (SPF, DKIM, DMARC)
4. Attends la vérification (~15 min)
5. Modifie le `from` dans `weekly-report.js` :
   \`\`\`javascript
   from: 'Journal Trader 360 <reports@journal-trader-360.com>'
   \`\`\`

---

## 🎯 Contenu du rapport email

Le rapport hebdomadaire inclut :
- 📅 Période (lundi → dimanche)
- 💰 P&L net de la semaine
- 📊 Nombre de trades
- ✅ Win Rate
- 📈 Profit Factor
- ⚡ Meilleur trade
- 🔻 Pire trade
- ✅ **Top 3 points positifs** (avec nombre d'occurrences)
- ❌ **Top 3 erreurs commises** (avec nombre d'occurrences)
- 💡 Conseil personnalisé pour s'améliorer

---

## 🚀 Déploiement

1. Commit et push le code
2. Vercel détecte automatiquement le cron job
3. Va dans Vercel Dashboard → ton projet → Cron Jobs
4. Vérifie que le cron `weekly-report` est bien listé
5. Teste manuellement en cliquant sur "Run"

---

## 📊 Logs et monitoring

### Voir les logs d'exécution
- Va dans Vercel → ton projet → Logs
- Filtre par `/api/cron/weekly-report`
- Tu verras tous les logs `[WEEKLY-REPORT]`

### Vérifier les emails envoyés
- Va dans Resend Dashboard → Emails
- Tu verras la liste de tous les emails envoyés
- Tu peux voir le statut (delivered, bounced, etc.)

---

## ⚠️ Limites et quotas

### Resend (plan gratuit)
- **3 000 emails/mois** (suffisant pour ~750 utilisateurs actifs)
- Si dépassement → upgrade à $20/mois pour 50 000 emails

### Vercel (plan Hobby)
- **Cron jobs gratuits** (illimité)
- **Durée d'exécution** : 10 secondes max par invocation
- Si > 100 utilisateurs → optimiser l'envoi par batch

---

## 🔐 Sécurité

### ✅ Bonnes pratiques implémentées
- Clé service Supabase stockée en variable d'environnement (jamais dans le code)
- Token CRON_SECRET pour éviter les appels non autorisés
- Row Level Security (RLS) sur Supabase
- Headers CORS sécurisés

### ⚠️ À faire en production
- Activer le CRON_SECRET (obligatoire)
- Utiliser un domaine vérifié pour les emails
- Monitorer les logs d'erreur
- Mettre en place des alertes si échec d'envoi

---

## 🆘 Troubleshooting

### Problème : Le cron ne s'exécute pas
- ✅ Vérifie que `vercel.json` est bien committé
- ✅ Va dans Vercel Dashboard → Cron Jobs et vérifie qu'il est listé
- ✅ Teste manuellement l'endpoint `/api/cron/weekly-report`

### Problème : Erreur "Missing SUPABASE_SERVICE_KEY"
- ✅ Va dans Vercel → Settings → Environment Variables
- ✅ Ajoute `SUPABASE_SERVICE_KEY` avec la clé service (pas la clé publique)
- ✅ Redéploie le projet

### Problème : Emails non reçus
- ✅ Vérifie les logs Resend pour voir si l'email a été envoyé
- ✅ Vérifie les spams
- ✅ Si domaine personnalisé, vérifie la configuration DNS

### Problème : "auth.users" table not found
- ✅ Vérifie que tu utilises bien la clé **service_role** (pas anon)
- ✅ Vérifie que le projet Supabase est bien configuré

---

## 📚 Ressources

- [Documentation Vercel Cron](https://vercel.com/docs/cron-jobs)
- [Documentation Resend](https://resend.com/docs)
- [Documentation Supabase](https://supabase.com/docs)
- [Cron syntax generator](https://crontab.guru/)

---

**Prêt à déployer ! 🚀**
