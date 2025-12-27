/**
 * =================================================================
 * JOURNAL TRADER 360 - TRADES MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('[CHART] Chargement supabase-trades.js...');
    
    // Récupérer le client Supabase depuis window.supabaseClient (créé par config.js)
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant (config non chargée ?)');
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
            alert('[WARN] Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!currentUser || !currentUser.uuid) {
            alert('[ERROR] Erreur: utilisateur non connecté');
            console.error('[ERROR] currentUser invalide:', currentUser);
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

        console.log(' Ajout trade pour UUID:', currentUser.uuid, tradeData);

        try {
            // Insérer dans Supabase
            const { data, error } = await supabase
                .from('trades')
                .insert([tradeData])
                .select()
                .single();

            if (error) {
                console.error('[ERROR] Erreur insertion trade:', error);
                alert('[ERROR] Erreur lors de l\'ajout du trade: ' + error.message);
                return;
            }

            console.log('[OK] Trade ajouté:', data);
            alert('[OK] Trade ajouté avec succès !');

            // Fermer la modal et reset
            document.getElementById('tradeModal').style.display = 'none';
            document.getElementById('addTradeForm').reset();

            // Rafraîchir la liste
            if (typeof loadTrades === 'function') {
                loadTrades();
            }

        } catch (err) {
            console.error('[ERROR] Exception addTrade:', err);
            alert('[ERROR] Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION CHARGEMENT TRADES =====
    async function loadTrades() {
        if (!currentUser || !currentUser.uuid) {
            console.warn('[WARN] loadTrades appelé mais currentUser invalide');
            return;
        }

        console.log(' Chargement des trades pour UUID:', currentUser.uuid);

        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', currentUser.uuid)
                .order('trade_date', { ascending: false })
                .order('entry_time', { ascending: false });

            if (error) {
                console.error('[ERROR] Erreur chargement trades:', error);
                return;
            }

            console.log('[OK] Trades chargés:', data.length);
            displayTrades(data);

        } catch (err) {
            console.error('[ERROR] Exception loadTrades:', err);
        }
    }

    // ===== FONCTION AFFICHAGE TRADES =====
    function displayTrades(trades) {
        const tbody = document.querySelector('#tradesTable tbody');
        
        if (!tbody) {
            console.warn('[WARN] Tableau trades introuvable');
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
        const accountName = document.getElementById('accountName');
        const accountSize = document.getElementById('accountSize');

        if (!accountName || !accountSize) {
            alert('[ERROR] Formulaire non trouvé');
            console.error('[ERROR] IDs manquants: accountName ou accountSize');
            return;
        }

        const name = accountName.value.trim();
        const sizeStr = accountSize.value.trim();

        if (!name || !sizeStr) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (!currentUser || !currentUser.uuid) {
            alert('[ERROR] Erreur: utilisateur non connecté');
            console.error('[ERROR] currentUser invalide:', currentUser);
            return;
        }

        // Parser la taille (supporte "100K" ou "100000")
        let size = parseFloat(sizeStr.replace(/[kK]/, '')) * (sizeStr.match(/[kK]/) ? 1000 : 1);

        const accountData = {
            user_id: currentUser.uuid,
            name: name,  // Utilise le nom comme numéro
            type: 'Trading',  // Type par défaut
            initial_balance: size,
            current_balance: size
        };

        console.log('[SAVE] Ajout compte pour UUID:', currentUser.uuid, accountData);

        try {
            const { data, error } = await supabase
                .from('accounts')
                .insert([accountData])
                .select()
                .single();

            if (error) {
                console.error('[ERROR] Erreur insertion compte:', error);
                alert('Erreur lors de l\'ajout du compte: ' + error.message);
                return;
            }

            console.log('[OK] Compte ajouté:', data);
            alert('Compte ajouté avec succès !');

            // Réinitialiser le formulaire
            accountName.value = '';
            accountSize.value = '';

            // Fermer le modal
            const modal = document.getElementById('addAccountModal');
            if (modal) modal.style.display = 'none';

            // Recharger les comptes
            if (typeof loadAccounts === 'function') {
                await loadAccounts();
            }

        } catch (err) {
            console.error('[ERROR] Exception addAccount:', err);
            alert('Erreur lors de l\'ajout: ' + err.message);
        }
    }

    // ===== FONCTION CHARGEMENT COMPTES =====
    async function loadAccounts() {
        if (!window.currentUser || !window.currentUser.uuid) {
            console.log('[WARN] loadAccounts appelé mais currentUser invalide');
            return;
        }

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', window.currentUser.uuid)
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ERROR] Erreur loadAccounts:', error);
                return;
            }

            console.log('[OK] Comptes chargés:', data.length);

            // Mettre à jour le select dans le formulaire de trade
            const tradeAccountSelect = document.getElementById('tradeAccount');
            if (tradeAccountSelect) {
                tradeAccountSelect.innerHTML = '<option value="">Sélectionner un compte</option>' +
                    data.map(acc => `<option value="${acc.name}">${acc.name} (${acc.type})</option>`).join('');
            }

            // Mettre à jour l'affichage des comptes (si fonction existe)
            if (typeof window.renderAccounts === 'function') {
                window.renderAccounts(data);
            }

        } catch (err) {
            console.error('[ERROR] Exception loadAccounts:', err);
        }
    }



    // ========================================
    // FONCTION : DELETE ACCOUNT
    // ========================================
    async function deleteAccount(accountId) {
        if (!accountId) {
            alert('[ERROR] ID du compte manquant');
            return;
        }

        const confirmed = confirm('Êtes-vous sûr de vouloir supprimer ce compte et tous ses trades associés ?');
        if (!confirmed) return;

        try {
            console.log('[DELETE] Suppression compte ID:', accountId);

            // 1. Supprimer tous les trades associés
            const { error: tradesError } = await supabase
                .from('trades')
                .delete()
                .eq('account_id', accountId);

            if (tradesError) {
                console.error('[ERROR] Erreur suppression trades:', tradesError);
                alert('Erreur lors de la suppression des trades: ' + tradesError.message);
                return;
            }

            // 2. Supprimer le compte
            const { error: accountError } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (accountError) {
                console.error('[ERROR] Erreur suppression compte:', accountError);
                alert('Erreur lors de la suppression du compte: ' + accountError.message);
                return;
            }

            console.log('[OK] Compte supprimé avec succès');
            alert('Compte supprimé avec succès !');

            // Recharger les comptes et trades
            if (typeof window.loadAccounts === 'function') {
                await window.loadAccounts();
            }
            if (typeof window.loadTrades === 'function') {
                await window.loadTrades();
            }
            
            // Rafraîchir l'affichage du dashboard
            if (typeof window.updateDashboard === 'function') {
                window.updateDashboard();
            }

        } catch (err) {
            console.error('[ERROR] Exception deleteAccount:', err);
            alert('Erreur lors de la suppression: ' + err.message);
        }
    }

    // ===== EXPORT DES FONCTIONS =====
    window.addTrade = addTrade;
    window.loadTrades = loadTrades;
    window.addAccount = addAccount;
    window.loadAccounts = loadAccounts;
    window.deleteAccount = deleteAccount;

    console.log('[OK] Fonctions trades exportées: addTrade, loadTrades, addAccount, loadAccounts, deleteAccount');

})();
