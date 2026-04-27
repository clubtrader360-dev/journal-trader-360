// ========================================
// SCRIPT DE TEST : ENVOI EMAIL DE DÉMONSTRATION
// ========================================
// Usage: node test-email.js YOUR_EMAIL@example.com
//
// Ce script envoie un email de test avec des données fictives
// pour visualiser le rendu final de l'email hebdomadaire.
//
// Prérequis:
// - Variables d'environnement configurées (RESEND_API_KEY, SUPABASE_SERVICE_KEY)
// - OU passer les clés en argument
// ========================================

const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_fKHnUNaD_GUGaLdbGP7bsoxapnLSWUwJ6';

// Email de destination (depuis les arguments de ligne de commande)
const toEmail = process.argv[2];

if (!toEmail) {
  console.error('❌ Usage: node test-email.js YOUR_EMAIL@example.com');
  process.exit(1);
}

console.log(`[TEST-EMAIL] 📧 Envoi d'un email de test à : ${toEmail}`);

// ========================================
// DONNÉES FICTIVES POUR LE TEST
// ========================================
const testData = {
  user: {
    email: toEmail,
    raw_user_meta_data: {
      full_name: 'Testeur'
    }
  },
  trades: [
    { pnl: 234.56, date: '2026-04-21' },
    { pnl: -45.30, date: '2026-04-22' },
    { pnl: 123.45, date: '2026-04-23' },
    { pnl: -67.89, date: '2026-04-24' },
    { pnl: 345.67, date: '2026-04-25' }
  ],
  journalEntries: [
    {
      entry_date: '2026-04-21',
      positive_points: ['Respect du plan de trading', 'Bonne gestion du risque', 'Patient avant l\'entrée'],
      errors_committed: ['Revenge trading']
    },
    {
      entry_date: '2026-04-23',
      positive_points: ['Respect du plan de trading', 'Laisser respirer mon trade'],
      errors_committed: ['Revenge trading', 'Manque de patience']
    },
    {
      entry_date: '2026-04-25',
      positive_points: ['Bonne gestion du risque', 'Patient avant l\'entrée', 'Gestion émotionnelle'],
      errors_committed: ['Trade en dehors de sa zone']
    }
  ],
  startDate: '2026-04-21',
  endDate: '2026-04-27'
};

// ========================================
// FONCTION : Formater une date
// ========================================
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const day = date.getDate();
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

// ========================================
// FONCTION : Générer le HTML du rapport
// ========================================
function generateWeeklyReportHTML({ user, trades, journalEntries, startDate, endDate }) {
  // Calculer les métriques
  const totalTrades = trades.length;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades * 100).toFixed(0) : 0;
  
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0');
  
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;
  
  // Analyser les points positifs et erreurs
  const allPositives = [];
  const allErrors = [];
  
  journalEntries.forEach(entry => {
    if (entry.positive_points && Array.isArray(entry.positive_points)) {
      allPositives.push(...entry.positive_points);
    }
    if (entry.errors_committed && Array.isArray(entry.errors_committed)) {
      allErrors.push(...entry.errors_committed);
    }
  });
  
  // Compter les occurrences
  const positivesCount = {};
  allPositives.forEach(p => {
    positivesCount[p] = (positivesCount[p] || 0) + 1;
  });
  
  const errorsCount = {};
  allErrors.forEach(e => {
    errorsCount[e] = (errorsCount[e] || 0) + 1;
  });
  
  // Top 3 de chaque
  const topPositives = Object.entries(positivesCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  const topErrors = Object.entries(errorsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  
  // Générer le HTML
  const html = `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rapport Hebdomadaire - Journal Trader 360</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    .header {
      text-align: center;
      border-bottom: 3px solid #ac862b;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .logo {
      max-width: 200px;
      height: auto;
      margin-bottom: 20px;
    }
    .header h1 {
      color: #ac862b;
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      color: #666;
      margin: 0;
      font-size: 14px;
    }
    .metric-card {
      background: #f9fafb;
      border-left: 4px solid #ac862b;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      color: #333;
      font-size: 16px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .metric {
      text-align: center;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #ac862b;
    }
    .metric-label {
      font-size: 12px;
      color: #666;
      text-transform: uppercase;
    }
    .positive {
      color: #10b981 !important;
    }
    .negative {
      color: #ef4444 !important;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #333;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #e5e7eb;
    }
    .list-item {
      padding: 10px;
      margin: 8px 0;
      background: #f9fafb;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #ac862b;
      color: white;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #e5e7eb;
      color: #666;
      font-size: 12px;
    }
    .cta-button {
      display: inline-block;
      background: #ac862b;
      color: white;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
    }
    .cta-button:hover {
      background: #8a6a22;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <!-- Logo Trader 360 -->
      <img src="https://journal-trader-360.vercel.app/trader360-logo.png" alt="Trader 360" class="logo">
      <h1>📊 Ton Rapport Hebdomadaire</h1>
      <p>Semaine du ${formatDate(startDate)} au ${formatDate(endDate)}</p>
    </div>
    
    <!-- Performance Globale -->
    <div class="metric-card">
      <h3>📈 PERFORMANCE GLOBALE</h3>
      <div class="metric-grid">
        <div class="metric">
          <div class="metric-value ${totalPnl >= 0 ? 'positive' : 'negative'}">
            ${totalPnl >= 0 ? '+' : ''}${totalPnl.toFixed(2)}$
          </div>
          <div class="metric-label">P&L Net</div>
        </div>
        <div class="metric">
          <div class="metric-value">${totalTrades}</div>
          <div class="metric-label">Trades</div>
        </div>
        <div class="metric">
          <div class="metric-value ${winRate >= 50 ? 'positive' : 'negative'}">${winRate}%</div>
          <div class="metric-label">Win Rate</div>
        </div>
        <div class="metric">
          <div class="metric-value">${profitFactor}</div>
          <div class="metric-label">Profit Factor</div>
        </div>
      </div>
    </div>
    
    ${totalTrades > 0 ? `
    <div class="section">
      <h2>🎯 Trades Clés</h2>
      <div class="list-item">
        <span>⚡ Meilleur trade :</span>
        <strong class="positive">+${bestTrade.toFixed(2)}$</strong>
      </div>
      <div class="list-item">
        <span>🔻 Pire trade :</span>
        <strong class="negative">${worstTrade.toFixed(2)}$</strong>
      </div>
    </div>
    ` : ''}
    
    ${topPositives.length > 0 ? `
    <div class="section">
      <h2>✅ Points Positifs (${allPositives.length} au total)</h2>
      <p style="color: #666; font-size: 14px;">Tes forces cette semaine :</p>
      ${topPositives.map(([point, count]) => `
        <div class="list-item">
          <span class="badge">${count}×</span>
          <span>${point}</span>
        </div>
      `).join('')}
    </div>
    ` : ''}
    
    ${topErrors.length > 0 ? `
    <div class="section">
      <h2>❌ Erreurs Commises (${allErrors.length} au total)</h2>
      <p style="color: #666; font-size: 14px;">⚠️ Points à améliorer :</p>
      ${topErrors.map(([error, count]) => `
        <div class="list-item">
          <span class="badge" style="background: #ef4444;">${count}×</span>
          <span>${error}</span>
        </div>
      `).join('')}
      <p style="color: #ef4444; font-size: 14px; margin-top: 15px; font-weight: bold;">
        💡 Focus : Travaille à corriger "${topErrors[0][0]}" cette semaine !
      </p>
    </div>
    ` : ''}
    
    <!-- CTA -->
    <div style="text-align: center;">
      <a href="https://journal-trader-360.vercel.app" class="cta-button">
        📖 Voir mon journal complet
      </a>
    </div>
    
    <!-- Footer -->
    <div class="footer">
      <p><strong>Journal Trader 360</strong> - Ton journal de trading intelligent</p>
      <p style="margin-top: 10px; color: #999; font-size: 11px;">
        Ceci est un email de test envoyé pour vérifier le rendu visuel.
      </p>
    </div>
  </div>
</body>
</html>
  `;
  
  return html;
}

// ========================================
// FONCTION : Envoyer l'email via Resend
// ========================================
async function sendTestEmail() {
  try {
    const html = generateWeeklyReportHTML(testData);
    
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'Journal Trader 360 <reports@resend.dev>',
        to: [toEmail],
        subject: '📊 [TEST] Ton Rapport Hebdomadaire - Semaine du 21 au 27 avril',
        html: html
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('❌ Erreur Resend:', data);
      return { success: false, error: data.message || 'Unknown error' };
    }
    
    console.log('✅ Email de test envoyé avec succès !');
    console.log('📧 Email ID:', data.id);
    console.log('📬 Destinataire:', toEmail);
    console.log('');
    console.log('💡 Vérifie ta boîte mail (et les spams si besoin) !');
    console.log('');
    console.log('🔗 Dashboard Resend : https://resend.com/emails');
    
    return { success: true, id: data.id };
    
  } catch (error) {
    console.error('❌ Exception sendTestEmail:', error);
    return { success: false, error: error.message };
  }
}

// Exécuter l'envoi
sendTestEmail();
