// Script de test autonome pour l'email hebdomadaire
const RESEND_API_KEY = process.env.RESEND_API_KEY || 're_fKHnUNaD_GUGaLdbGP7bsoxapnLSWUwJ6';
const toEmail = process.argv[2] || 'clubtrader360@gmail.com';

console.log(`[TEST] Envoi email de test à: ${toEmail}`);

// Données de test
const testData = {
  user: { email: toEmail },
  trades: [
    { pnl: 234.56, date: '2026-04-21' },
    { pnl: -45.30, date: '2026-04-22' },
    { pnl: 123.45, date: '2026-04-23' },
    { pnl: -67.89, date: '2026-04-24' },
    { pnl: 345.67, date: '2026-04-25' }
  ],
  journalEntries: [
    { entry_date: '2026-04-21', positive_points: ['Respect du plan de trading', 'Bonne gestion du risque'], errors_committed: ['Revenge trading'] },
    { entry_date: '2026-04-23', positive_points: ['Respect du plan de trading', 'Patient avant l\'entrée'], errors_committed: ['Revenge trading', 'Manque de patience'] },
    { entry_date: '2026-04-25', positive_points: ['Bonne gestion du risque', 'Gestion émotionnelle'], errors_committed: ['Trade en dehors de sa zone'] }
  ],
  startDate: '2026-04-21',
  endDate: '2026-04-27'
};

function formatDate(dateStr) {
  const date = new Date(dateStr);
  const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
  return `${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
}

function generateWeeklyReportHTML({ user, trades, journalEntries, startDate, endDate }) {
  console.log('[WEEKLY-REPORT] 🎨 Génération du rapport HTML...');
  
  // ✅ Calculer les métriques
  const totalTrades = trades.length;
  const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
  const winningTrades = trades.filter(t => t.pnl > 0);
  const losingTrades = trades.filter(t => t.pnl < 0);
  const neutralTrades = trades.filter(t => t.pnl === 0);
  const winRate = totalTrades > 0 ? (winningTrades.length / totalTrades * 100).toFixed(0) : 0;
  
  const grossProfit = winningTrades.reduce((sum, t) => sum + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? (grossProfit / grossLoss).toFixed(2) : (grossProfit > 0 ? '∞' : '0');
  
  const bestTrade = trades.length > 0 ? Math.max(...trades.map(t => t.pnl)) : 0;
  const worstTrade = trades.length > 0 ? Math.min(...trades.map(t => t.pnl)) : 0;
  
  // Nouvelles métriques
  const avgWin = winningTrades.length > 0 ? (grossProfit / winningTrades.length).toFixed(2) : 0;
  const avgLoss = losingTrades.length > 0 ? (grossLoss / losingTrades.length).toFixed(2) : 0;
  const avgWinLossRatio = avgLoss > 0 ? (avgWin / avgLoss).toFixed(2) : (avgWin > 0 ? '∞' : '0');
  
  // Calcul des streaks
  let currentStreak = 0;
  let longestWinStreak = 0;
  let longestLossStreak = 0;
  let currentWinStreak = 0;
  let currentLossStreak = 0;
  
  trades.forEach(trade => {
    if (trade.pnl > 0) {
      currentWinStreak++;
      currentLossStreak = 0;
      longestWinStreak = Math.max(longestWinStreak, currentWinStreak);
    } else if (trade.pnl < 0) {
      currentLossStreak++;
      currentWinStreak = 0;
      longestLossStreak = Math.max(longestLossStreak, currentLossStreak);
    }
  });
  
  // Calcul des jours de trading
  const tradingDays = [...new Set(trades.map(t => t.date))].length;
  
  // Préparer les données pour le graphique (grouper par jour)
  const dailyPnl = {};
  trades.forEach(trade => {
    const date = trade.date;
    if (!dailyPnl[date]) {
      dailyPnl[date] = 0;
    }
    dailyPnl[date] += trade.pnl;
  });
  
  // Créer l'URL du graphique QuickChart
  const chartLabels = Object.keys(dailyPnl).sort();
  const chartData = chartLabels.map(date => dailyPnl[date].toFixed(2));
  const chartColors = chartData.map(val => parseFloat(val) >= 0 ? '#10b981' : '#ef4444');
  
  const chartConfig = {
    type: 'bar',
    data: {
      labels: chartLabels.map(d => {
        const date = new Date(d);
        const days = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        return days[date.getDay()];
      }),
      datasets: [{
        label: 'P&L Journalier',
        data: chartData,
        backgroundColor: chartColors,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        title: {
          display: true,
          text: 'Évolution du P&L cette semaine',
          color: '#e5e7eb',
          font: { size: 16, weight: 'bold' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#374151' },
          ticks: { color: '#9ca3af' }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#9ca3af' }
        }
      }
    }
  };
  
  const chartUrl = `https://quickchart.io/chart?c=${encodeURIComponent(JSON.stringify(chartConfig))}&backgroundColor=%231a1d29&width=560&height=300`;
  
  // ✅ Analyser les points positifs et erreurs
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
  
  // ✅ Générer le HTML
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
      color: #e5e7eb;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #000B25;
    }
    .container {
      background: #1a1d29;
      border-radius: 12px;
      padding: 30px;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
      border: 1px solid rgba(172, 134, 43, 0.2);
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
      color: #9ca3af;
      margin: 0;
      font-size: 14px;
    }
    .metric-card {
      background: #242938;
      border-left: 4px solid #ac862b;
      padding: 15px;
      margin: 15px 0;
      border-radius: 6px;
    }
    .metric-card h3 {
      margin: 0 0 10px 0;
      color: #e5e7eb;
      font-size: 16px;
    }
    .metric-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .metric-grid-3 {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 10px;
      margin-top: 10px;
    }
    .metric {
      text-align: center;
      padding: 8px;
      background: #1a1d29;
      border-radius: 4px;
    }
    .metric-value {
      font-size: 24px;
      font-weight: bold;
      color: #ac862b;
    }
    .metric-label {
      font-size: 11px;
      color: #9ca3af;
      text-transform: uppercase;
      margin-top: 4px;
    }
    .positive {
      color: #10b981 !important;
    }
    .negative {
      color: #ef4444 !important;
    }
    .neutral {
      color: #6b7280 !important;
    }
    .section {
      margin: 30px 0;
    }
    .section h2 {
      color: #e5e7eb;
      font-size: 20px;
      margin-bottom: 15px;
      padding-bottom: 10px;
      border-bottom: 2px solid #374151;
    }
    .list-item {
      padding: 10px;
      margin: 8px 0;
      background: #242938;
      border-radius: 6px;
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .badge {
      background: #ac862b;
      color: #000B25;
      padding: 2px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: bold;
    }
    .chart-container {
      margin: 20px 0;
      text-align: center;
      background: #242938;
      padding: 15px;
      border-radius: 8px;
    }
    .chart-container img {
      max-width: 100%;
      height: auto;
      border-radius: 6px;
    }
    .footer {
      text-align: center;
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #374151;
      color: #9ca3af;
      font-size: 12px;
    }
    .cta-button {
      display: inline-block;
      background: linear-gradient(135deg, #ac862b 0%, #b8932c 100%);
      color: #000B25;
      padding: 12px 30px;
      text-decoration: none;
      border-radius: 6px;
      font-weight: bold;
      margin: 20px 0;
      box-shadow: 0 4px 12px rgba(172, 134, 43, 0.3);
    }
    .cta-button:hover {
      background: linear-gradient(135deg, #b8932c 0%, #ac862b 100%);
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <!-- Logo Trader 360 -->
      <img src="https://journal-trader-360.vercel.app/trader360-logo.png" alt="Trader 360" style="max-width: 200px; height: auto; margin-bottom: 20px;">
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
    
    <!-- Métriques Détaillées -->
    <div class="metric-card">
      <h3>💰 MÉTRIQUES DÉTAILLÉES</h3>
      <div class="metric-grid-3">
        <div class="metric">
          <div class="metric-value positive">+${grossProfit.toFixed(2)}$</div>
          <div class="metric-label">Gross Profit</div>
        </div>
        <div class="metric">
          <div class="metric-value negative">-${grossLoss.toFixed(2)}$</div>
          <div class="metric-label">Gross Loss</div>
        </div>
        <div class="metric">
          <div class="metric-value">${tradingDays}</div>
          <div class="metric-label">Jours tradés</div>
        </div>
      </div>
      <div class="metric-grid-3" style="margin-top: 10px;">
        <div class="metric">
          <div class="metric-value positive">+${avgWin}$</div>
          <div class="metric-label">Avg Win</div>
        </div>
        <div class="metric">
          <div class="metric-value negative">-${avgLoss}$</div>
          <div class="metric-label">Avg Loss</div>
        </div>
        <div class="metric">
          <div class="metric-value">${avgWinLossRatio}</div>
          <div class="metric-label">R:R Ratio</div>
        </div>
      </div>
      <div class="metric-grid" style="margin-top: 10px;">
        <div class="metric">
          <div class="metric-value positive">${longestWinStreak}</div>
          <div class="metric-label">🔥 Winning Streak</div>
        </div>
        <div class="metric">
          <div class="metric-value negative">${longestLossStreak}</div>
          <div class="metric-label">❄️ Losing Streak</div>
        </div>
      </div>
    </div>
    
    ${totalTrades > 0 && chartLabels.length > 0 ? `
    <!-- Graphique d'évolution -->
    <div class="chart-container">
      <h3 style="color: #e5e7eb; margin: 0 0 15px 0; font-size: 16px;">📊 Évolution du P&L cette semaine</h3>
      <img src="${chartUrl}" alt="Graphique P&L hebdomadaire" style="width: 100%; height: auto;">
    </div>
    ` : ''}
    
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
      <p style="color: #9ca3af; font-size: 14px;">Tes forces cette semaine :</p>
      ${topPositives.map(([point, count]) => `
        <div class="list-item">

// Fonction d'envoi
async function sendTestEmail() {
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
      subject: '📊 [TEST MODE NUIT] Rapport Hebdomadaire - Semaine du 21 au 27 avril',
      html: html
    })
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    console.error('❌ Erreur:', data);
    return;
  }
  
  console.log('✅ Email envoyé!');
  console.log('📧 Email ID:', data.id);
  console.log('🔗 Resend:', 'https://resend.com/emails');
}

sendTestEmail();
