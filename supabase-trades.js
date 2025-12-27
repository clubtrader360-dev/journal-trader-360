/**
 * =================================================================
 * JOURNAL TRADER 360 - TRADES MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('📈 Chargement supabase-trades.js...');
    
    // Récupérer le client Supabase depuis window.supabaseClient (créé par config.js)
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('❌ window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    // ===== FONCTION AJOUT TRADE =====
    async function addTrade() {
        // Récupérer les valeurs du formulaire
        const date = document.getElementById('tradeDate').value;
        const entryTime = document.getElementById('tradeEntryTime').value;
        const exitTime = document.getElementById('tradeExitTime').value;
        const symbol = document.getElementById('tradeSymbol').value.trim().toUpperCase();
        const direction = document.getElementById('tradeDirection').value;
        const entryPrice = parseFloat(document.getElementById('tradeEntryPrice').value);
        const exitPrice = parseFloat(document.getElementById('tradeExitPrice').value);
        const contracts = parseInt(document.getElementById('tradeContracts').value);
        const account = document.getElementById('tradeAccount').value;

        // Validations
        if (!date || !entryTime || !exitTime || !symbol || !direction || !entryPrice || !exitPrice || !contracts || !account) {
            alert('⚠️ Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!currentUser || !currentUser.uuid) {
            alert('❌ Erreur: utilisateur non connecté');
            console.error('❌ currentUser invalide:', currentUser);
            return;
        }

        // Calculer P&L
        const pnl = direction === 'long' 
            ? (exitPrice - entryPrice) * contracts 
            : (entryPrice - exitPrice) * contracts;

        // Préparer les données
        const tradeData = {
            user_id: currentUser.uuid,
            trade_date: date,
            entry_time: entryTime,
            exit_time: exitTime,
            symbol: symbol,
            direction: direction,
            entry_price: entryPrice,
            exit_price: exitPrice,
            contracts: contracts,
            account: account,
            pnl: pnl
        };

        console.log('💹 Ajout trade pour UUID:', currentUser.uuid, tradeData);

        try {
            // Insérer dans Supabase
            const { data, error } = await supabase
                .from('trades')
                .insert([tradeData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur insertion trade:', error);
                alert('❌ Erreur lors de l\'ajout du trade: ' + error.message);
                return;
            }

            console.log('✅ Trade ajouté:', data);
            alert('✅ Trade ajouté avec succès !');

            // Fermer la modal et reset
            document.getElementById('tradeModal').style.display = 'none';
            document.getElementById('addTradeForm').reset();

            // Rafraîchir la liste
            if (typeof loadTrades === 'function') {
                loadTrades();
            }

        } catch (err) {
            console.error('❌ Exception addTrade:', err);
            alert('❌ Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION CHARGEMENT TRADES =====
    async function loadTrades() {
        if (!currentUser || !currentUser.uuid) {
            console.warn('⚠️ loadTrades appelé mais currentUser invalide');
            return;
        }

        console.log('📥 Chargement des trades pour UUID:', currentUser.uuid);

        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', currentUser.uuid)
                .order('trade_date', { ascending: false })
                .order('entry_time', { ascending: false });

            if (error) {
                console.error('❌ Erreur chargement trades:', error);
                return;
            }

            console.log('✅ Trades chargés:', data.length);
            displayTrades(data);

        } catch (err) {
            console.error('❌ Exception loadTrades:', err);
        }
    }

    // ===== FONCTION AFFICHAGE TRADES =====
    function displayTrades(trades) {
        const tbody = document.querySelector('#tradesTable tbody');
        
        if (!tbody) {
            console.warn('⚠️ Tableau trades introuvable');
            return;
        }

        if (!trades || trades.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9">Aucun trade pour le moment</td></tr>';
            return;
        }

        tbody.innerHTML = trades.map(trade => {
            const pnlClass = trade.pnl >= 0 ? 'positive' : 'negative';
            return `
                <tr>
                    <td>${trade.trade_date}</td>
                    <td>${trade.entry_time}</td>
                    <td>${trade.exit_time}</td>
                    <td>${trade.symbol}</td>
                    <td>${trade.direction}</td>
                    <td>${trade.entry_price}</td>
                    <td>${trade.exit_price}</td>
                    <td>${trade.contracts}</td>
                    <td class="${pnlClass}">${trade.pnl.toFixed(2)} $</td>
                </tr>
            `;
        }).join('');
    }

    // ===== FONCTION AJOUT COMPTE =====
    async function addAccount() {
        const accountNumber = document.getElementById('accountNumber').value.trim();
        const accountType = document.getElementById('accountType').value;
        const initialBalance = parseFloat(document.getElementById('initialBalance').value);

        if (!accountNumber || !accountType || !initialBalance) {
            alert('⚠️ Veuillez remplir tous les champs');
            return;
        }

        if (!currentUser || !currentUser.uuid) {
            alert('❌ Erreur: utilisateur non connecté');
            return;
        }

        const accountData = {
            user_id: currentUser.uuid,
            account_number: accountNumber,
            account_type: accountType,
            initial_balance: initialBalance,
            current_balance: initialBalance
        };

        console.log('💼 Ajout compte pour UUID:', currentUser.uuid, accountData);

        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert([accountData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur insertion compte:', error);
                alert('❌ Erreur lors de l\'ajout du compte: ' + error.message);
                return;
            }

            console.log('✅ Compte ajouté:', data);
            alert('✅ Compte ajouté avec succès !');

            // Fermer modal et reset
            document.getElementById('accountModal').style.display = 'none';
            document.getElementById('addAccountForm').reset();

            // Rafraîchir
            if (typeof loadAccounts === 'function') {
                loadAccounts();
            }

        } catch (err) {
            console.error('❌ Exception addAccount:', err);
            alert('❌ Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION CHARGEMENT COMPTES =====
    async function loadAccounts() {
        if (!currentUser || !currentUser.uuid) {
            console.warn('⚠️ loadAccounts appelé mais currentUser invalide');
            return;
        }

        console.log('📥 Chargement des comptes pour UUID:', currentUser.uuid);

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', currentUser.uuid);

            if (error) {
                console.error('❌ Erreur chargement comptes:', error);
                return;
            }

            console.log('✅ Comptes chargés:', data.length);

            // Mettre à jour le select du formulaire de trade
            const tradeAccountSelect = document.getElementById('tradeAccount');
            if (tradeAccountSelect) {
                tradeAccountSelect.innerHTML = '<option value="">Sélectionner un compte</option>' +
                    data.map(acc => `<option value="${acc.account_number}">${acc.account_number} (${acc.account_type})</option>`).join('');
            }

        } catch (err) {
            console.error('❌ Exception loadAccounts:', err);
        }
    }

    // ===== EXPORT DES FONCTIONS =====
    window.addTrade = addTrade;
    window.loadTrades = loadTrades;
    window.addAccount = addAccount;
    window.loadAccounts = loadAccounts;

    console.log('✅ Fonctions trades exportées: addTrade, loadTrades, addAccount, loadAccounts');

})();
