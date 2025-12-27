/**
 * =================================================================
 * JOURNAL TRADER 360 - TRADES MODULE
 * Version: DEFINITIVE 1.0
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

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

    // Calculer le P&L
    const pnl = direction === 'long' 
        ? (exitPrice - entryPrice) * contracts 
        : (entryPrice - exitPrice) * contracts;

    // Calculer la durée
    const entryDateTime = new Date(`${date}T${entryTime}`);
    const exitDateTime = new Date(`${date}T${exitTime}`);
    const durationMs = exitDateTime - entryDateTime;
    const durationMinutes = Math.round(durationMs / 60000);

    // Construire l'objet trade
    const tradeData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        date: date,
        entry_time: entryTime,
        exit_time: exitTime,
        symbol: symbol,
        direction: direction,
        entry_price: entryPrice,
        exit_price: exitPrice,
        contracts: contracts,
        account_id: account,
        pnl: pnl,
        duration_minutes: durationMinutes,
        created_at: new Date().toISOString()
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

        // Recharger les trades depuis Supabase
        await loadUserDataFromSupabase(currentUser.uuid);

        // Réafficher la liste et mettre à jour les graphiques
        if (typeof displayTrades === 'function') {
            displayTrades();
        }
        if (typeof updateCharts === 'function') {
            updateCharts();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }

        // Fermer le modal et réinitialiser le formulaire
        closeModal('addTradeModal');
        const form = document.getElementById('tradeForm');
        if (form) form.reset();

        alert('✅ Trade ajouté avec succès!');

    } catch (err) {
        console.error('❌ Erreur addTrade:', err);
        alert('❌ Une erreur est survenue');
    }
}

/**
 * =========================================================
 *  AJOUT D’UN COMPTE TRADING  (VERSION CORRIGÉE OPTION B)
 *  - Utilise accountName + accountSize
 *  - Stocke dans: name, initial_balance, current_balance, type
 * =========================================================
 */
async function addAccount() {
    const name = document.getElementById('accountName').value.trim();
    const sizeInput = document.getElementById('accountSize').value.trim();

    if (!name || !sizeInput) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    // Convertir des formats type "100K" → 100000
    const initial_balance = parseFloat(sizeInput.replace(/[^0-9]/g, ''));
    if (isNaN(initial_balance)) {
        alert('⚠️ Taille de compte invalide');
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        console.error('❌ currentUser invalide:', currentUser);
        return;
    }

    const accountData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        name: name,
        type: 'standard',
        initial_balance: initial_balance,
        current_balance: initial_balance,
        created_at: new Date().toISOString()
    };

    console.log('💰 Ajout compte pour UUID:', currentUser.uuid, accountData);

    try {
        const { data, error } = await supabase
            .from('accounts')
            .insert([accountData])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur ajout account:', error);
            alert('❌ Erreur lors de l\'ajout du compte: ' + error.message);
            return;
        }

        console.log('✅ Compte ajouté:', data);

        // Recharger toutes les données utilisateur
        await loadUserDataFromSupabase(currentUser.uuid);

        // Réafficher les comptes + dashboard + charts si définis dans l’index
        if (typeof displayAccounts === 'function') {
            displayAccounts();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        if (typeof updateCharts === 'function') {
            updateCharts();
        }

        // Fermer la modale + reset formulaire
        closeModal('addAccountModal');
        const form = document.getElementById('accountForm');
        if (form) form.reset();

        alert('✅ Compte ajouté avec succès!');

    } catch (err) {
        console.error('❌ Erreur addAccount:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION SUPPRESSION ACCOUNT =====
async function deleteAccount(accountId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce compte ?')) {
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        console.error('❌ currentUser invalide:', currentUser);
        return;
    }

    try {
        console.log('🗑 Suppression compte:', accountId);
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', accountId)
            .eq('user_id', currentUser.uuid);

        if (error) {
            console.error('❌ Erreur deleteAccount:', error);
            alert('❌ Erreur lors de la suppression du compte: ' + error.message);
            return;
        }

        console.log('✅ Compte supprimé:', accountId);

        await loadUserDataFromSupabase(currentUser.uuid);

        if (typeof displayAccounts === 'function') {
            displayAccounts();
        }
        if (typeof updateDashboard === 'function') {
            updateDashboard();
        }
        if (typeof updateCharts === 'function') {
            updateCharts();
        }

        alert('✅ Compte supprimé avec succès!');

    } catch (err) {
        console.error('❌ Erreur deleteAccount:', err);
        alert('❌ Une erreur est survenue');
    }
}

console.log('✅ Trades Module chargé (VERSION DEFINITIVE)');

// ✅ EXPORTS GLOBAUX pour éviter "addAccount is not defined"

// Supprimer un trade
async function deleteTrade(tradeId) {
    try {
        console.log('🗑️ Suppression du trade:', tradeId);
        
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId);
        
        if (error) throw error;
        
        console.log('✅ Trade supprimé');
        alert('Trade supprimé avec succès');
        location.reload();
    } catch (err) {
        console.error('❌ Erreur deleteTrade:', err);
        alert('Erreur lors de la suppression: ' + err.message);
    }
}

window.addAccount = addAccount;
window.addTrade = addTrade;
window.deleteAccount = deleteAccount;
window.deleteTrade = deleteTrade;
console.log('✅ supabase-trades.js - Fonctions exportées');
