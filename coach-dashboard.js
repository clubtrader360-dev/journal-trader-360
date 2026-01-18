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
        const protections = {};
        
        trades.forEach(trade => {
            let prots = trade.protections;
            
            // ✅ Convertir protections string en array si nécessaire
            if (typeof prots === 'string' && prots.length > 0) {
                prots = prots.split(',').map(p => p.trim());
            }
            
            if (Array.isArray(prots) && prots.length > 0) {
                prots.forEach(protection => {
                    if (protection) {
                        if (!protections[protection]) {
                            protections[protection] = { wins: 0, total: 0 };
                        }
                        protections[protection].total++;
                        if (parseFloat(trade.pnl) > 0) protections[protection].wins++;
                    }
                });
            }
        });
        
        console.log('[COACH DASHBOARD] 📊 Protections agrégées:', protections);
        
        const labels = Object.keys(protections);
        const data = labels.map(label => {
            return protections[label].total > 0 
                ? ((protections[label].wins / protections[label].total) * 100).toFixed(1)
                : 0;
        });
        
        const ctx = document.getElementById('globalProtectionChart');
        if (ctx && window.Chart) {
            if (window.globalProtectionChartInstance) {
                window.globalProtectionChartInstance.destroy();
            }
            
            // ✅ Si aucune protection, afficher un message
            if (labels.length === 0) {
                ctx.parentElement.innerHTML = '<p style="text-align: center; padding: 2rem; color: #9ca3af;">Aucune protection utilisée</p>';
                return;
            }
            
            window.globalProtectionChartInstance = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Win Rate %',
                        data: data,
                        backgroundColor: 'rgba(59, 130, 246, 0.8)',
                        borderColor: 'rgba(59, 130, 246, 1)',
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
                            max: 100,
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
        }
    }

    // ===== TRADER 360 SCORE GLOBAL =====
    function updateGlobalTrader360Score(trades) {
        console.log('[COACH DASHBOARD] 🎯 Calcul Trader 360 Score avec', trades.length, 'trades');
        
        if (trades.length === 0) {
            document.getElementById('globalTrader360Score').textContent = '0';
            return;
        }
        
        // ✅ Filtrer et convertir les pnl en nombres
        const validTrades = trades.filter(t => t.pnl !== undefined && t.pnl !== null);
        const wins = validTrades.filter(t => parseFloat(t.pnl) > 0).length;
        const losses = validTrades.filter(t => parseFloat(t.pnl) < 0).length;
        const winRate = validTrades.length > 0 ? (wins / validTrades.length) * 100 : 0;
        
        const totalWins = validTrades.filter(t => parseFloat(t.pnl) > 0).reduce((sum, t) => sum + parseFloat(t.pnl), 0);
        const totalLosses = Math.abs(validTrades.filter(t => parseFloat(t.pnl) < 0).reduce((sum, t) => sum + parseFloat(t.pnl), 0));
        const profitFactor = totalLosses > 0 ? totalWins / totalLosses : totalWins > 0 ? 5 : 0;
        
        // Score (sur 100)
        const score = Math.min(100, Math.round(
            (winRate * 0.4) + 
            (Math.min(profitFactor * 20, 50)) + 
            (validTrades.length > 50 ? 10 : (validTrades.length / 50) * 10)
        ));
        
        const scoreElement = document.getElementById('globalTrader360Score');
        if (scoreElement) {
            scoreElement.textContent = score;
            
            // Couleur selon le score
            if (score >= 80) {
                scoreElement.style.color = '#10b981';
            } else if (score >= 60) {
                scoreElement.style.color = '#f59e0b';
            } else {
                scoreElement.style.color = '#ef4444';
            }
        }
        
        console.log('[COACH DASHBOARD] 🎯 Trader 360 Score:', score, '(Win Rate:', winRate.toFixed(1) + '%, PF:', profitFactor.toFixed(2) + ')');
    }

    // ===== EXPORT DES FONCTIONS =====
    window.loadCoachDashboard = loadCoachDashboard;
    window.previousGlobalMonth = previousGlobalMonth;
    window.nextGlobalMonth = nextGlobalMonth;
    
    console.log('[COACH DASHBOARD] ✅ Module chargé');
})();
