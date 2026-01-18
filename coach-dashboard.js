// ====================================
// COACH DASHBOARD GLOBAL - v2.0
// ====================================
// Dashboard complet pour le coach avec tous les graphiques et stats agrégées de tous les élèves
// Mise à jour: Fix conflit avec ancienne fonction index.html

(function() {
    'use strict';

    let allStudentsTrades = [];
    let globalCalendarMonth = new Date().getMonth();
    let globalCalendarYear = new Date().getFullYear();

    // ===== FONCTION PRINCIPALE: CHARGER LE DASHBOARD GLOBAL =====
    async function loadCoachDashboard() {
        console.log('[COACH DASHBOARD] 🎯 Chargement du dashboard global...');
        
        try {
            // Vérifier que la fonction existe
            if (!window.getAllStudentsData) {
                console.error('[COACH DASHBOARD] ❌ getAllStudentsData n\'existe pas encore!');
                setTimeout(loadCoachDashboard, 500);
                return;
            }
            
            // Récupérer TOUS les trades de TOUS les élèves
            console.log('[COACH DASHBOARD] 🔄 Appel getAllStudentsData()...');
            const studentsData = await window.getAllStudentsData();
            console.log('[COACH DASHBOARD] 📊 Données élèves récupérées:', studentsData);
            console.log('[COACH DASHBOARD] 📊 Nombre d\'élèves:', studentsData?.length || 0);
            
            if (!studentsData || studentsData.length === 0) {
                console.warn('[COACH DASHBOARD] ⚠️ Aucun élève trouvé');
                return;
            }
            
            // Agréger tous les trades
            allStudentsTrades = [];
            studentsData.forEach((student, index) => {
                console.log(`[COACH DASHBOARD] 📝 Élève ${index + 1}:`, student.user?.email);
                if (student.data && student.data.trades) {
                    console.log(`[COACH DASHBOARD]   → ${student.data.trades.length} trades`);
                    allStudentsTrades.push(...student.data.trades);
                }
            });
            
            console.log('[COACH DASHBOARD] 📈 Total trades agrégés:', allStudentsTrades.length);
            console.log('[COACH DASHBOARD] 📈 Premier trade:', allStudentsTrades[0]);
            
            // Mettre à jour les KPIs
            updateGlobalKPIs(allStudentsTrades, studentsData);
            
            // Mettre à jour le calendrier
            updateGlobalCalendar();
            
            // Mettre à jour les graphiques
            updateGlobalCharts(allStudentsTrades);
            
            // Mettre à jour le Trader 360 Score Global
            updateGlobalTrader360Score(allStudentsTrades);
            
        } catch (error) {
            console.error('[COACH DASHBOARD] ❌ Erreur:', error);
            console.error('[COACH DASHBOARD] ❌ Stack:', error.stack);
        }
    }

    // ===== MISE À JOUR DES KPIs GLOBAUX =====
    function updateGlobalKPIs(trades, studentsData) {
        // Nombre d'élèves actifs
        const activeStudents = studentsData.filter(s => s.user.status === 'active').length;
        document.getElementById('coachTotalStudents').textContent = activeStudents;
        
        // Total trades
        const totalTrades = trades.length;
        document.getElementById('coachTotalTrades').textContent = totalTrades;
        
        // Win Rate
        const wins = trades.filter(t => t.pnl > 0).length;
        const losses = trades.filter(t => t.pnl < 0).length;
        const winRate = totalTrades > 0 ? ((wins / totalTrades) * 100).toFixed(1) : 0;
        
        document.getElementById('coachTotalWins').textContent = wins;
        document.getElementById('coachTotalLosses').textContent = losses;
        document.getElementById('coachGlobalWinRate').textContent = `${winRate}%`;
        document.getElementById('coachWinRateBar').style.width = `${winRate}%`;
        
        // P&L Global
        const totalPnl = trades.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const pnlElement = document.getElementById('coachGlobalPnL');
        pnlElement.textContent = `$${totalPnl.toFixed(2)}`;
        pnlElement.style.color = totalPnl >= 0 ? '#10b981' : '#ef4444';
        
        console.log('[COACH DASHBOARD] ✅ KPIs mis à jour');
    }

    // ===== MISE À JOUR DU CALENDRIER GLOBAL =====
    function updateGlobalCalendar() {
        console.log('[COACH DASHBOARD] 📅 Mise à jour calendrier...');
        console.log('[COACH DASHBOARD] 📅 Trades disponibles:', allStudentsTrades.length);
        
        const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
            "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
        const daysOfWeek = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];
        
        // Mettre à jour le titre
        const monthYearSpan = document.getElementById('globalCalendarMonthYear');
        if (monthYearSpan) {
            monthYearSpan.textContent = `${monthNames[globalCalendarMonth]} ${globalCalendarYear}`;
        }
        
        const firstDay = new Date(globalCalendarYear, globalCalendarMonth, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarGrid = document.getElementById('globalCalendarGrid');
        if (!calendarGrid) {
            console.error('[COACH DASHBOARD] ❌ globalCalendarGrid introuvable');
            return;
        }
        
        let calendarHTML = '';
        let tradesFoundCount = 0;
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate.getTime());
            date.setDate(date.getDate() + i);
            
            const isCurrentMonth = date.getMonth() === globalCalendarMonth;
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const dateString = `${year}-${month}-${day}`;
            
            const dayTrades = allStudentsTrades.filter(trade => {
                const tradeDate = (trade.trade_date || trade.date || '').split('T')[0];
                return tradeDate === dateString;
            });
            
            if (dayTrades.length > 0) {
                tradesFoundCount++;
                console.log(`[COACH DASHBOARD] 📅 ${dateString}: ${dayTrades.length} trades`);
            }
            
            const dayPnl = dayTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
            
            let className = 'text-center py-3 cursor-pointer rounded transition-all';
            if (!isCurrentMonth) {
                className += ' text-gray-300';
            } else if (dayTrades.length > 0) {
                className += dayPnl > 0 ? ' bg-green-100 text-green-800 hover:bg-green-200' : ' bg-red-100 text-red-800 hover:bg-red-200';
            } else {
                className += ' text-gray-700 hover:bg-gray-100';
            }
            
            let cellContent = `<div class="font-semibold">${date.getDate()}</div>`;
            
            if (dayTrades.length > 0 && isCurrentMonth) {
                cellContent += '<div class="text-xs mt-1 space-y-0.5">';
                cellContent += `<div class="font-semibold">${dayPnl > 0 ? '+' : ''}$${dayPnl.toFixed(0)}</div>`;
                cellContent += `<div class="text-gray-600">${dayTrades.length} trades</div>`;
                cellContent += '</div>';
            }
            
            calendarHTML += `<div class="${className}">${cellContent}</div>`;
        }
        
        calendarGrid.innerHTML = calendarHTML;
        console.log('[COACH DASHBOARD] 📅 Calendrier mis à jour -', tradesFoundCount, 'jours avec trades');
    }

    // ===== NAVIGATION CALENDRIER =====
    function previousGlobalMonth() {
        globalCalendarMonth--;
        if (globalCalendarMonth < 0) {
            globalCalendarMonth = 11;
            globalCalendarYear--;
        }
        updateGlobalCalendar();
    }

    function nextGlobalMonth() {
        globalCalendarMonth++;
        if (globalCalendarMonth > 11) {
            globalCalendarMonth = 0;
            globalCalendarYear++;
        }
        updateGlobalCalendar();
    }

    // ===== MISE À JOUR DES GRAPHIQUES =====
    function updateGlobalCharts(trades) {
        console.log('[COACH DASHBOARD] 📊 Mise à jour graphiques avec', trades.length, 'trades');
        
        // Performance par Heure
        updateGlobalPerformanceByHour(trades);
        
        // Performance par Durée
        updateGlobalPerformanceByDuration(trades);
        
        // Drawdown Global
        updateGlobalDrawdown(trades);
        
        // Win Rate par Protection
        updateGlobalWinRateByProtection(trades);
        
        console.log('[COACH DASHBOARD] 📊 Graphiques mis à jour');
    }

    // ===== PERFORMANCE PAR HEURE =====
    function updateGlobalPerformanceByHour(trades) {
        console.log('[COACH DASHBOARD] 📊 Performance par heure - trades:', trades.length);
        
        const hourlyPnl = {};
        
        let tradesWithTime = 0;
        trades.forEach(trade => {
            let entryTime = trade.entry_time || trade.entryTime;
            if (entryTime) {
                tradesWithTime++;
                
                // ✅ Parser l'heure correctement (formats: "14:30", "14:30:00", "2026-01-18T14:30:00Z")
                let hour;
                if (entryTime.includes('T')) {
                    // Format ISO: "2026-01-18T14:30:00Z"
                    const date = new Date(entryTime);
                    hour = date.getHours();
                } else {
                    // Format HH:MM ou HH:MM:SS
                    hour = parseInt(entryTime.split(':')[0]);
                }
                
                if (!isNaN(hour) && hour >= 0 && hour < 24) {
                    if (!hourlyPnl[hour]) {
                        hourlyPnl[hour] = { pnl: 0, count: 0 };
                    }
                    hourlyPnl[hour].pnl += parseFloat(trade.pnl) || 0;
                    hourlyPnl[hour].count++;
                }
            }
        });
        
        console.log('[COACH DASHBOARD] 📊 Trades avec entry_time:', tradesWithTime);
        console.log('[COACH DASHBOARD] 📊 Données horaires:', hourlyPnl);
        
        // ✅ Générer des labels pour TOUTES les heures (0h-23h), même celles sans trades
        const labels = [];
        const data = [];
        for (let h = 0; h < 24; h++) {
            labels.push(`${h}h`);
            data.push(hourlyPnl[h] ? hourlyPnl[h].pnl : 0);
        }
        
        const ctx = document.getElementById('globalHourlyChart');
        if (ctx && window.Chart) {
            if (window.globalHourlyChartInstance) {
                window.globalHourlyChartInstance.destroy();
            }
            window.globalHourlyChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'P&L par Heure',
                        data: data,
                        backgroundColor: data.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                        borderColor: data.map(v => v >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(0);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // ===== PERFORMANCE PAR DURÉE =====
    function updateGlobalPerformanceByDuration(trades) {
        const durationBuckets = {
            '0-5min': { pnl: 0, count: 0, wins: 0 },
            '5-15min': { pnl: 0, count: 0, wins: 0 },
            '15-30min': { pnl: 0, count: 0, wins: 0 },
            '30-60min': { pnl: 0, count: 0, wins: 0 },
            '60+min': { pnl: 0, count: 0, wins: 0 }
        };
        
        let tradesWithDuration = 0;
        trades.forEach(trade => {
            let duration;
            
            // ✅ Calculer la durée depuis entry_time et exit_time
            let entryTime = trade.entry_time || trade.entryTime;
            let exitTime = trade.exit_time || trade.exitTime;
            
            if (entryTime && exitTime) {
                try {
                    // Parser les timestamps (formats: "HH:MM", "HH:MM:SS", "2026-01-18T14:30:00Z")
                    let entryDate, exitDate;
                    
                    if (entryTime.includes('T')) {
                        entryDate = new Date(entryTime);
                        exitDate = new Date(exitTime);
                    } else {
                        // Format HH:MM ou HH:MM:SS
                        entryDate = new Date(`1970-01-01T${entryTime}`);
                        exitDate = new Date(`1970-01-01T${exitTime}`);
                    }
                    
                    duration = (exitDate - entryDate) / (1000 * 60); // Durée en minutes
                    
                    if (duration >= 0) {
                        tradesWithDuration++;
                    }
                } catch (e) {
                    console.warn('[COACH DASHBOARD] ⚠️ Erreur calcul durée:', e, 'Entry:', entryTime, 'Exit:', exitTime);
                }
            } else if (trade.duration_minutes !== undefined) {
                duration = trade.duration_minutes;
            }
            
            if (duration !== undefined && duration >= 0) {
                let bucket;
                
                if (duration < 5) bucket = '0-5min';
                else if (duration < 15) bucket = '5-15min';
                else if (duration < 30) bucket = '15-30min';
                else if (duration < 60) bucket = '30-60min';
                else bucket = '60+min';
                
                durationBuckets[bucket].pnl += parseFloat(trade.pnl) || 0;
                durationBuckets[bucket].count++;
                if (trade.pnl > 0) durationBuckets[bucket].wins++;
            }
        });
        
        console.log('[COACH DASHBOARD] 📊 Trades avec durée calculée:', tradesWithDuration, '/', trades.length);
        console.log('[COACH DASHBOARD] 📊 Performance par durée:', durationBuckets);
        
        const labels = Object.keys(durationBuckets);
        const data = labels.map(label => durationBuckets[label].pnl);
        
        const ctx = document.getElementById('globalDurationChart');
        if (ctx && window.Chart) {
            if (window.globalDurationChartInstance) {
                window.globalDurationChartInstance.destroy();
            }
            window.globalDurationChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'P&L par Durée',
                        data: data,
                        backgroundColor: data.map(v => v >= 0 ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)'),
                        borderColor: data.map(v => v >= 0 ? 'rgba(16, 185, 129, 1)' : 'rgba(239, 68, 68, 1)'),
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(0);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // ===== DRAWDOWN GLOBAL =====
    function updateGlobalDrawdown(trades) {
        // Trier les trades par date
        const sortedTrades = [...trades].sort((a, b) => {
            const dateA = a.trade_date || a.date;
            const dateB = b.trade_date || b.date;
            return new Date(dateA) - new Date(dateB);
        });
        
        let cumulativePnl = 0;
        let peak = 0;
        let drawdowns = [];
        let labels = [];
        
        sortedTrades.forEach((trade, index) => {
            cumulativePnl += trade.pnl || 0;
            if (cumulativePnl > peak) peak = cumulativePnl;
            const drawdown = peak - cumulativePnl;
            drawdowns.push(-drawdown);
            labels.push(index + 1);
        });
        
        const ctx = document.getElementById('globalDrawdownChart');
        if (ctx && window.Chart) {
            if (window.globalDrawdownChartInstance) {
                window.globalDrawdownChartInstance.destroy();
            }
            window.globalDrawdownChartInstance = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Drawdown',
                        data: drawdowns,
                        borderColor: 'rgba(239, 68, 68, 1)',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            ticks: {
                                callback: function(value) {
                                    return '$' + value.toFixed(0);
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // ===== WIN RATE PAR PROTECTION =====
    function updateGlobalWinRateByProtection(trades) {
        console.log('[COACH DASHBOARD] 🛡️ Analyse des protections - trades:', trades.length);
        
        const container = document.getElementById('globalProtectionAnalysisContainer');
        if (!container) {
            console.warn('[COACH DASHBOARD] ⚠️ globalProtectionAnalysisContainer introuvable');
            return;
        }
        
        if (trades.length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-6">
                    <i class="fas fa-chart-bar text-3xl mb-2"></i>
                    <p class="text-sm">Aucune donnée disponible</p>
                </div>
            `;
            return;
        }
        
        // Analyser chaque type de protection
        const protectionTypes = ['VWAP', 'MM20', 'Pivot', 'Clôture veille', 'Liquidité 30m/H1/H4'];
        const protectionStats = {};
        
        protectionTypes.forEach(protType => {
            // Filtrer les trades qui utilisent cette protection
            const tradesWithProt = trades.filter(trade => {
                let prots = trade.protections;
                
                // Convertir protections string en array si nécessaire
                if (typeof prots === 'string' && prots.length > 0) {
                    prots = prots.split(',').map(p => p.trim());
                }
                
                return Array.isArray(prots) && prots.includes(protType);
            });
            
            if (tradesWithProt.length > 0) {
                const winners = tradesWithProt.filter(t => parseFloat(t.pnl) > 0);
                const losers = tradesWithProt.filter(t => parseFloat(t.pnl) < 0);
                const winRate = (winners.length / tradesWithProt.length) * 100;
                const totalPnl = tradesWithProt.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
                
                protectionStats[protType] = {
                    total: tradesWithProt.length,
                    winners: winners.length,
                    losers: losers.length,
                    winRate: winRate,
                    totalPnl: totalPnl,
                    avgPnl: totalPnl / tradesWithProt.length
                };
            }
        });
        
        // Ajouter l'analyse des trades SANS protection
        const tradesWithoutProt = trades.filter(trade => {
            let prots = trade.protections;
            if (typeof prots === 'string') {
                prots = prots.split(',').map(p => p.trim()).filter(p => p.length > 0);
            }
            return !prots || prots.length === 0;
        });
        
        if (tradesWithoutProt.length > 0) {
            const winners = tradesWithoutProt.filter(t => parseFloat(t.pnl) > 0);
            const losers = tradesWithoutProt.filter(t => parseFloat(t.pnl) < 0);
            const winRate = (winners.length / tradesWithoutProt.length) * 100;
            const totalPnl = tradesWithoutProt.reduce((sum, t) => sum + (parseFloat(t.pnl) || 0), 0);
            
            protectionStats['Sans protection'] = {
                total: tradesWithoutProt.length,
                winners: winners.length,
                losers: losers.length,
                winRate: winRate,
                totalPnl: totalPnl,
                avgPnl: totalPnl / tradesWithoutProt.length
            };
        }
        
        console.log('[COACH DASHBOARD] 🛡️ Protections agrégées:', protectionStats);
        
        // Si aucune protection utilisée
        if (Object.keys(protectionStats).length === 0) {
            container.innerHTML = `
                <div class="text-center text-gray-500 py-6">
                    <i class="fas fa-info-circle text-3xl mb-2"></i>
                    <p class="text-sm">Aucune protection utilisée dans les trades</p>
                </div>
            `;
            return;
        }
        
        // Générer le HTML pour chaque protection
        container.innerHTML = Object.entries(protectionStats)
            .sort((a, b) => b[1].winRate - a[1].winRate) // Trier par win rate décroissant
            .map(([protType, stats]) => {
                const winRateColor = stats.winRate >= 60 ? 'text-green-600' : 
                                    stats.winRate >= 40 ? 'text-orange-500' : 'text-red-600';
                const pnlColor = stats.totalPnl > 0 ? 'text-green-600' : 'text-red-600';
                const bgColor = stats.totalPnl > 0 ? 'bg-green-50' : 'bg-red-50';
                
                // Icône selon le type de protection
                const icon = protType === 'VWAP' ? 'fa-chart-line' :
                            protType === 'MM20' ? 'fa-wave-square' :
                            protType === 'Pivot' ? 'fa-crosshairs' :
                            protType === 'Clôture veille' ? 'fa-history' :
                            protType === 'Liquidité 30m/H1/H4' ? 'fa-tint' :
                            'fa-ban'; // Sans protection
                
                return `
                    <div class="border-l-4 ${stats.totalPnl > 0 ? 'border-green-500' : 'border-red-500'} pl-3 py-3 ${bgColor} rounded-r">
                        <div class="flex justify-between items-center">
                            <div class="flex-1">
                                <div class="flex items-center gap-2 mb-2">
                                    <i class="fas ${icon} text-gray-600"></i>
                                    <span class="font-semibold text-gray-800">${protType}</span>
                                    <span class="text-xs text-gray-500">(${stats.total} trades)</span>
                                </div>
                                <div class="grid grid-cols-2 gap-2 text-sm">
                                    <div>
                                        <span class="text-gray-600">Win Rate:</span>
                                        <span class="font-bold ${winRateColor} ml-1">${stats.winRate.toFixed(1)}%</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">P&L Total:</span>
                                        <span class="font-bold ${pnlColor} ml-1">$${stats.totalPnl.toFixed(2)}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Gagnants:</span>
                                        <span class="text-green-600 font-semibold ml-1">${stats.winners}</span>
                                    </div>
                                    <div>
                                        <span class="text-gray-600">Perdants:</span>
                                        <span class="text-red-600 font-semibold ml-1">${stats.losers}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
    }

    // ===== TRADER 360 SCORE GLOBAL (GRAPHIQUE RADAR) =====
    let globalTraderScoreChart = null;

    function updateGlobalTrader360Score(trades) {
        console.log('[COACH DASHBOARD] 🎯 Calcul Trader 360 Score avec', trades.length, 'trades');
        
        const canvas = document.getElementById('globalTrader360Chart');
        if (!canvas) {
            console.error('[COACH DASHBOARD] ❌ Canvas globalTrader360Chart introuvable !');
            return;
        }
        
        // Initialiser le graphique si nécessaire
        if (!globalTraderScoreChart) {
            const ctx = canvas.getContext('2d');
            globalTraderScoreChart = new Chart(ctx, {
                type: 'radar',
                data: {
                    labels: ['Win %', 'Consistency', 'Profit Factor', 'Max Drawdown', 'Avg Win/Loss', 'Recovery Factor'],
                    datasets: [{
                        label: 'Trader 360 Score',
                        data: [0, 0, 0, 0, 0, 0],
                        fill: true,
                        backgroundColor: 'rgba(16, 185, 129, 0.2)',
                        borderColor: 'rgba(16, 185, 129, 1)',
                        pointBackgroundColor: 'rgba(16, 185, 129, 1)',
                        pointBorderColor: '#fff',
                        pointHoverBackgroundColor: '#fff',
                        pointHoverBorderColor: 'rgba(16, 185, 129, 1)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        r: {
                            beginAtZero: true,
                            max: 100,
                            ticks: {
                                stepSize: 20,
                                font: { size: 10 }
                            },
                            pointLabels: {
                                font: { size: 11 }
                            }
                        }
                    },
                    plugins: {
                        legend: { display: false }
                    }
                }
            });
        }
        
        // Si aucun trade, réinitialiser
        if (trades.length === 0) {
            globalTraderScoreChart.data.datasets[0].data = [0, 0, 0, 0, 0, 0];
            globalTraderScoreChart.update();
            const scoreEl = document.getElementById('globalTraderScoreValue');
            if (scoreEl) scoreEl.textContent = '0.0';
            return;
        }
        
        // ✅ Filtrer et convertir les pnl en nombres
        const validTrades = trades.filter(t => t.pnl !== undefined && t.pnl !== null);
        const winningTrades = validTrades.filter(t => parseFloat(t.pnl) > 0);
        const losingTrades = validTrades.filter(t => parseFloat(t.pnl) < 0);
        
        // 1. WIN RATE (0-100)
        const winRate = validTrades.length > 0 ? (winningTrades.length / validTrades.length) * 100 : 0;
        
        // 2. PROFIT FACTOR (normalisé sur 100)
        const grossProfit = winningTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0);
        const grossLoss = Math.abs(losingTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0));
        const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : (grossProfit > 0 ? 3 : 0);
        const profitFactorScore = Math.min(100, (profitFactor / 3) * 100);
        
        // 3. AVG WIN / AVG LOSS RATIO (normalisé sur 100)
        const avgWin = winningTrades.length > 0 ? grossProfit / winningTrades.length : 0;
        const avgLoss = losingTrades.length > 0 ? grossLoss / losingTrades.length : 0;
        const avgRatio = avgLoss > 0 ? avgWin / avgLoss : (avgWin > 0 ? 2 : 0);
        const avgRatioScore = Math.min(100, (avgRatio / 2) * 100);
        
        // 4. CONSISTENCY (écart-type du P&L normalisé)
        const avgPnl = validTrades.reduce((sum, t) => sum + parseFloat(t.pnl), 0) / validTrades.length;
        const variance = validTrades.reduce((sum, t) => sum + Math.pow(parseFloat(t.pnl) - avgPnl, 2), 0) / validTrades.length;
        const stdDev = Math.sqrt(variance);
        const cv = Math.abs(avgPnl) > 0 ? (stdDev / Math.abs(avgPnl)) : 0;
        const consistencyScore = Math.max(0, 100 - (cv * 20));
        
        // 5. MAX DRAWDOWN (calculé sur cumulative PnL)
        let cumulativePnl = 0;
        let maxPnl = 0;
        let maxDrawdown = 0;
        validTrades.forEach(trade => {
            cumulativePnl += parseFloat(trade.pnl);
            maxPnl = Math.max(maxPnl, cumulativePnl);
            const drawdown = maxPnl - cumulativePnl;
            maxDrawdown = Math.max(maxDrawdown, drawdown);
        });
        const totalProfit = Math.abs(cumulativePnl);
        const drawdownPct = totalProfit > 0 ? (maxDrawdown / totalProfit) * 100 : 0;
        const drawdownScore = Math.max(0, 100 - drawdownPct);
        
        // 6. RECOVERY FACTOR (Total Profit / Max Drawdown)
        const recoveryFactor = maxDrawdown > 0 ? totalProfit / maxDrawdown : (totalProfit > 0 ? 5 : 0);
        const recoveryScore = Math.min(100, (recoveryFactor / 5) * 100);
        
        // SCORE GLOBAL (moyenne pondérée)
        const weights = {
            winRate: 0.20,
            profitFactor: 0.25,
            avgRatio: 0.20,
            consistency: 0.15,
            drawdown: 0.10,
            recovery: 0.10
        };
        
        const globalScore = (
            winRate * weights.winRate +
            profitFactorScore * weights.profitFactor +
            avgRatioScore * weights.avgRatio +
            consistencyScore * weights.consistency +
            drawdownScore * weights.drawdown +
            recoveryScore * weights.recovery
        );
        
        // Mettre à jour le graphique radar
        globalTraderScoreChart.data.datasets[0].data = [
            winRate.toFixed(1),
            consistencyScore.toFixed(1),
            profitFactorScore.toFixed(1),
            drawdownScore.toFixed(1),
            avgRatioScore.toFixed(1),
            recoveryScore.toFixed(1)
        ];
        globalTraderScoreChart.update();
        
        // Afficher le score global
        const scoreEl = document.getElementById('globalTraderScoreValue');
        if (scoreEl) {
            scoreEl.textContent = globalScore.toFixed(1);
            
            // Couleur selon le score
            if (globalScore >= 80) {
                scoreEl.style.color = '#10b981'; // Vert
            } else if (globalScore >= 60) {
                scoreEl.style.color = '#f59e0b'; // Orange
            } else {
                scoreEl.style.color = '#ef4444'; // Rouge
            }
        }
        
        console.log('[COACH DASHBOARD] 🎯 Trader 360 Score:', globalScore.toFixed(1) + '/100');
        console.log('  Win Rate:', winRate.toFixed(1) + '%');
        console.log('  Profit Factor:', profitFactor.toFixed(2), '→', profitFactorScore.toFixed(1) + ' pts');
        console.log('  Avg Ratio:', avgRatio.toFixed(2), '→', avgRatioScore.toFixed(1) + ' pts');
        console.log('  Consistency:', consistencyScore.toFixed(1) + ' pts');
        console.log('  Drawdown:', drawdownPct.toFixed(1) + '%', '→', drawdownScore.toFixed(1) + ' pts');
        console.log('  Recovery:', recoveryFactor.toFixed(2), '→', recoveryScore.toFixed(1) + ' pts');
    }

    // ===== EXPORT DES FONCTIONS =====
    window.loadCoachDashboard = loadCoachDashboard;
    window.previousGlobalMonth = previousGlobalMonth;
    window.nextGlobalMonth = nextGlobalMonth;
    
    console.log('[COACH DASHBOARD] ✅ Module chargé');
})();
