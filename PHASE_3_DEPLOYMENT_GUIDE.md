# 📧 Guide de Déploiement - Phase 3 : Rapport Hebdomadaire

## ✅ STATUT ACTUEL

**Phase 3 implémentée et prête à déployer !**

- ✅ Code développé et testé
- ✅ PR #46 créée : https://github.com/clubtrader360-dev/journal-trader-360/pull/46
- ⏳ Configuration Vercel requise (2 variables d'environnement)
- ⏳ Déploiement final

---

## 🎯 CE QUI A ÉTÉ FAIT

### Phase 1 ✅ (PR #43 - Mergée)
- Points positifs & erreurs dans le Journal Quotidien
- 25 points positifs organisés en 5 catégories
- 22 erreurs organisées en 5 catégories
- Sauvegarde dans Supabase (`positive_points`, `errors_committed`)

### Phase 2 ✅ (PR #44 - Mergée)
- Badges ✅/❌ dans le calendrier
- Tooltip détaillé au survol avec résumé

### Phase 3 ⏳ (PR #46 - En attente de merge)
- Route API `/api/cron/weekly-report`
- Cron job : tous les dimanches à 19h UTC (= 20h Paris)
- Email HTML responsive avec métriques complètes
- Top 3 points positifs et erreurs de la semaine
- Conseil personnalisé pour s'améliorer

---

## 🚀 ÉTAPES DE DÉPLOIEMENT

### Étape 1 : Créer un compte Resend (5 min)

1. **Aller sur** : https://resend.com/signup
2. **Créer un compte gratuit** (email + mot de passe)
3. **Vérifier l'email** de confirmation
4. **Créer une clé API** :
   - Aller dans "API Keys"
   - Cliquer "Create API Key"
   - Nom : `Journal Trader 360`
   - Permissions : `Full access` (ou `Sending access`)
   - Cliquer "Create"
   - **COPIER LA CLÉ** (commence par `re_...`) et la sauvegarder temporairement

---

### Étape 2 : Récupérer la clé Supabase Service (2 min)

1. **Aller sur** : https://supabase.com/dashboard/project/zgihbpgoorymomtsbxpz/settings/api
2. **Copier la clé "service_role"** (⚠️ **PAS** la clé "anon public")
   - C'est la longue clé qui commence par `eyJhbGciOiJIUzI1NiIs...`
   - La sauvegarder temporairement

---

### Étape 3 : Configurer les variables d'environnement dans Vercel (3 min)

1. **Aller sur** : https://vercel.com/clubtrader360-dev/journal-trader-360/settings/environment-variables

2. **Ajouter RESEND_API_KEY** :
   - Cliquer "Add New"
   - Name : `RESEND_API_KEY`
   - Value : `re_...` (la clé Resend copiée à l'étape 1)
   - Environments : ✅ Production + ✅ Preview + ✅ Development
   - Cliquer "Save"

3. **Ajouter SUPABASE_SERVICE_KEY** :
   - Cliquer "Add New"
   - Name : `SUPABASE_SERVICE_KEY`
   - Value : `eyJhbGciOiJIUzI1NiIs...` (la clé Supabase copiée à l'étape 2)
   - Environments : ✅ Production + ✅ Preview + ✅ Development
   - Cliquer "Save"

4. **[OPTIONNEL] Ajouter CRON_SECRET** (recommandé pour la sécurité) :
   - Générer un token :
     ```bash
     openssl rand -hex 32
     ```
   - Cliquer "Add New"
   - Name : `CRON_SECRET`
   - Value : (le token généré)
   - Environments : ✅ Production + ✅ Preview + ✅ Development
   - Cliquer "Save"

---

### Étape 4 : Merger la PR #46 et redéployer (2 min)

1. **Merger la PR** : https://github.com/clubtrader360-dev/journal-trader-360/pull/46
   - Cliquer "Merge pull request"
   - Confirmer le merge

2. **Vercel déploiera automatiquement** (~2 min)
   - Aller sur : https://vercel.com/clubtrader360-dev/journal-trader-360
   - Attendre que le déploiement soit "Ready"

3. **Vérifier le cron job** :
   - Aller sur : https://vercel.com/clubtrader360-dev/journal-trader-360/settings/cron
   - Vous devez voir : `weekly-report` avec schedule `0 19 * * 0`

---

### Étape 5 : Tester l'endpoint manuellement (1 min)

**Option A : Test simple (sans authentification)**
```bash
curl https://journal-trader-360.vercel.app/api/cron/weekly-report
```

**Option B : Test avec authentification (si CRON_SECRET configuré)**
```bash
curl -X POST https://journal-trader-360.vercel.app/api/cron/weekly-report \
  -H "Authorization: Bearer VOTRE_CRON_SECRET"
```

**Résultat attendu** :
```json
{
  "success": true,
  "period": {
    "start": "2026-04-21",
    "end": "2026-04-27"
  },
  "totalUsers": 5,
  "results": [
    { "email": "user@example.com", "status": "sent", "emailId": "..." },
    { "email": "user2@example.com", "status": "skipped", "reason": "no_activity" }
  ]
}
```

---

### Étape 6 : Vérifier les logs (1 min)

1. **Logs Vercel** : https://vercel.com/clubtrader360-dev/journal-trader-360/logs
   - Filtrer par `/api/cron/weekly-report`
   - Chercher les logs `[WEEKLY-REPORT]`
   - Vérifier qu'il n'y a pas d'erreurs

2. **Logs Resend** : https://resend.com/emails
   - Voir la liste des emails envoyés
   - Vérifier le statut : `delivered` (envoyé avec succès)

---

## 📧 CONTENU DU RAPPORT

Chaque dimanche à 20h (heure Paris), les utilisateurs ayant eu une activité reçoivent :

### Métriques de la semaine
- 💰 P&L net (lundi → dimanche)
- 📊 Nombre de trades
- ✅ Win Rate (%)
- 📈 Profit Factor
- ⚡ Meilleur trade
- 🔻 Pire trade

### Analyse du journal
- ✅ **Top 3 points positifs** (ex: "Respect du plan: 5×")
- ❌ **Top 3 erreurs commises** (ex: "Revenge trading: 3×")
- 💡 **Conseil personnalisé** : focus sur l'erreur la plus fréquente

### Exemple visuel
```
📊 Ton Rapport Hebdomadaire
Semaine du 21 au 27 avril 2026

📈 PERFORMANCE GLOBALE
+1,234.56$  |  12 Trades
58% Win Rate | 2.34 Profit Factor

🎯 Trades Clés
⚡ Meilleur trade : +543.21$
🔻 Pire trade : -123.45$

✅ Points Positifs (15 au total)
[5×] Respect du plan de trading
[4×] Bonne gestion du risque
[3×] Patient avant l'entrée

❌ Erreurs Commises (8 au total)
[3×] Revenge trading
[2×] Trade en dehors de sa zone
[2×] Manque de patience

💡 Focus : Travaille à corriger "Revenge trading" cette semaine !
```

---

## ⚙️ CONFIGURATION ACTUELLE

| Paramètre | Valeur | Description |
|-----------|--------|-------------|
| **Schedule** | `0 19 * * 0` | Tous les dimanches à 19h UTC |
| **Heure Paris** | 20h00 (hiver) | 21h00 en été (UTC+2) |
| **Domaine email** | `reports@resend.dev` | Domaine gratuit Resend |
| **Endpoint** | `/api/cron/weekly-report` | Route API du cron |
| **Envoi** | Utilisateurs actifs uniquement | Au moins 1 trade ou 1 note |

---

## 📊 LIMITES & QUOTAS

### Resend (plan gratuit)
- ✅ **3 000 emails/mois** (~750 utilisateurs actifs)
- ✅ Statistiques d'envoi complètes
- ✅ API illimitée
- 💰 **Upgrade** : $20/mois pour 50 000 emails

### Vercel (plan Hobby)
- ✅ **Cron jobs gratuits** (illimité)
- ⚠️ **10 secondes max** par invocation
- ✅ Logs complets

---

## 🔐 SÉCURITÉ

### ✅ Bonnes pratiques implémentées
- Clés API stockées dans variables d'environnement (jamais dans le code)
- Token CRON_SECRET pour éviter les appels non autorisés
- Supabase Service Key avec accès RLS
- Email envoyé uniquement aux utilisateurs actifs

### ⚠️ Recommandations
- **Activer CRON_SECRET** pour la production (évite les appels non autorisés)
- **Utiliser un domaine vérifié** pour les emails (meilleure délivrabilité)
- **Monitorer les logs** régulièrement pour détecter les erreurs
- **Ne jamais committer** les clés API dans le code

---

## 🆘 TROUBLESHOOTING

### Problème : "Missing RESEND_API_KEY"
- ✅ Vérifier que la variable est ajoutée dans Vercel
- ✅ Vérifier qu'elle est activée pour "Production"
- ✅ Redéployer le projet après ajout

### Problème : "Missing SUPABASE_SERVICE_KEY"
- ✅ Vérifier que vous utilisez la clé **service_role** (pas anon)
- ✅ Vérifier qu'elle commence par `eyJhbGciOiJIUzI1NiIs`
- ✅ Redéployer après ajout

### Problème : Emails non reçus
- ✅ Vérifier les logs Resend pour voir si envoyé
- ✅ Vérifier les spams
- ✅ Vérifier que l'utilisateur a eu une activité cette semaine
- ✅ Vérifier l'adresse email dans Supabase

### Problème : Le cron ne s'exécute pas
- ✅ Vérifier que `vercel.json` est bien mergé
- ✅ Vérifier dans Vercel → Cron Jobs qu'il est listé
- ✅ Tester manuellement l'endpoint
- ✅ Vérifier les logs Vercel pour les erreurs

### Problème : "Unauthorized" lors du test manuel
- ✅ Si CRON_SECRET configuré, ajouter header : `-H "Authorization: Bearer $CRON_SECRET"`
- ✅ Sinon, supprimer CRON_SECRET des variables d'environnement

---

## 📚 RESSOURCES

- **Documentation complète** : `WEEKLY_REPORT_SETUP.md`
- **PR #46** : https://github.com/clubtrader360-dev/journal-trader-360/pull/46
- **Vercel Cron** : https://vercel.com/docs/cron-jobs
- **Resend Docs** : https://resend.com/docs
- **Cron Syntax** : https://crontab.guru/

---

## ✅ CHECKLIST FINALE

Avant de considérer la Phase 3 complète, vérifier :

- [ ] Compte Resend créé
- [ ] Clé API Resend ajoutée dans Vercel (`RESEND_API_KEY`)
- [ ] Clé Supabase Service ajoutée dans Vercel (`SUPABASE_SERVICE_KEY`)
- [ ] Token CRON_SECRET généré et ajouté (optionnel mais recommandé)
- [ ] PR #46 mergée dans `main`
- [ ] Vercel a déployé avec succès
- [ ] Cron job visible dans Vercel → Cron Jobs
- [ ] Test manuel de l'endpoint réussi
- [ ] Logs Vercel sans erreurs
- [ ] Email de test reçu dans Resend

---

**🎉 Une fois cette checklist complète, la Phase 3 sera opérationnelle !**

Les utilisateurs recevront automatiquement leur premier rapport le **dimanche suivant à 20h** (heure de Paris).
