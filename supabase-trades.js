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

    if (contracts <= 0) {
        alert('⚠️ Le nombre de contrats doit être supérieur à 0');
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

    // Préparer les données du trade
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
        pnl: parseFloat(pnl.toFixed(2)),
        account: account,
        duration_minutes: durationMinutes,
        created_at: new Date().toISOString()
    };

    console.log('📝 Ajout trade pour UUID:', currentUser.uuid);

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
        displayTrades();
        updateCharts();
        
        // Fermer le modal et réinitialiser le formulaire
        closeModal('addTradeModal');
        document.getElementById('tradeForm').reset();
        
        alert('✅ Trade ajouté avec succès!');

    } catch (err) {
        console.error('❌ Erreur addTrade:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION SUPPRESSION TRADE =====
async function deleteTrade(tradeId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce trade ?')) {
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    console.log('🗑️ Suppression trade ID:', tradeId, 'pour UUID:', currentUser.uuid);

    try {
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId)
            .eq('user_id', currentUser.uuid); // Sécurité RLS

        if (error) {
            console.error('❌ Erreur suppression trade:', error);
            alert('❌ Erreur lors de la suppression: ' + error.message);
            return;
        }

        console.log('✅ Trade supprimé:', tradeId);

        // Recharger depuis Supabase
        await loadUserDataFromSupabase(currentUser.uuid);
        displayTrades();
        updateCharts();
        
        alert('✅ Trade supprimé avec succès!');

    } catch (err) {
        console.error('❌ Erreur deleteTrade:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION AJOUT ACCOUNT =====
async function addAccount() {
    const name = document.getElementById('accountName').value.trim();
    const type = document.getElementById('accountType').value;
    const balance = parseFloat(document.getElementById('accountBalance').value);

    if (!name || !type || isNaN(balance)) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const accountData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        name: name,
        type: type,
        initial_balance: balance,
        current_balance: balance,
        created_at: new Date().toISOString()
    };

    console.log('💰 Ajout compte pour UUID:', currentUser.uuid);

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
        
        await loadUserDataFromSupabase(currentUser.uuid);
        displayAccounts();
        closeModal('addAccountModal');
        document.getElementById('accountForm').reset();
        
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
        return;
    }

    console.log('🗑️ Suppression compte ID:', accountId, 'pour UUID:', currentUser.uuid);

    try {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', accountId)
            .eq('user_id', currentUser.uuid);

        if (error) {
            console.error('❌ Erreur suppression account:', error);
            alert('❌ Erreur lors de la suppression: ' + error.message);
            return;
        }

        console.log('✅ Compte supprimé:', accountId);
        
        await loadUserDataFromSupabase(currentUser.uuid);
        displayAccounts();
        
        alert('✅ Compte supprimé avec succès!');

    } catch (err) {
        console.error('❌ Erreur deleteAccount:', err);
        alert('❌ Une erreur est survenue');
    }
}

console.log('✅ Trades Module chargé (VERSION DEFINITIVE)');
