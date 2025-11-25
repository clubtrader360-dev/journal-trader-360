// Remplacer la fonction addTrade() pour utiliser Supabase
async function addTrade() {
    // Récupérer les valeurs du formulaire (même code qu'avant)
    const date = document.getElementById('tradeDate').value;
    const entryTime = document.getElementById('tradeEntryTime').value;
    const exitTime = document.getElementById('tradeExitTime').value;
    const symbol = document.getElementById('tradeSymbol').value.trim().toUpperCase();
    const direction = document.getElementById('tradeDirection').value;
    const entryPrice = parseFloat(document.getElementById('tradeEntryPrice').value);
    const exitPrice = parseFloat(document.getElementById('tradeExitPrice').value);
    const contracts = parseInt(document.getElementById('tradeContracts').value);
    const account = document.getElementById('tradeAccount').value;

    // Validations (même code qu'avant)
    if (!date || !entryTime || !exitTime || !symbol || !direction || !entryPrice || !exitPrice || !contracts || !account) {
        alert('⚠️ Veuillez remplir tous les champs obligatoires');
        return;
    }

    if (contracts <= 0) {
        alert('⚠️ Le nombre de contrats doit être supérieur à 0');
        return;
    }

    if (!currentUser || !currentUser.id) {
        alert('❌ Erreur: utilisateur non connecté');
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
        user_id: currentUser.id,
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

    try {
        // Insérer dans Supabase
        const { data, error } = await supabase
            .from('trades')
            .insert([tradeData])
            .select()
            .single();

        if (error) {
            console.error('Erreur insertion trade:', error);
            alert('❌ Erreur lors de l\'ajout du trade');
            return;
        }

        console.log('✅ Trade ajouté:', data);

        // Recharger les trades depuis Supabase
        await loadUserDataFromSupabase(currentUser.id);

        // Réafficher la liste et mettre à jour les graphiques
        displayTrades();
        updateCharts();
        
        // Fermer le modal et réinitialiser le formulaire
        closeModal('addTradeModal');
        document.getElementById('tradeForm').reset();
        
        alert('✅ Trade ajouté avec succès!');

    } catch (err) {
        console.error('Erreur addTrade:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Remplacer deleteTrade() pour utiliser Supabase
async function deleteTrade(tradeId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce trade ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('trades')
            .delete()
            .eq('id', tradeId)
            .eq('user_id', currentUser.id); // Sécurité RLS

        if (error) {
            console.error('Erreur suppression trade:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        console.log('✅ Trade supprimé:', tradeId);

        // Recharger depuis Supabase
        await loadUserDataFromSupabase(currentUser.id);
        displayTrades();
        updateCharts();
        
        alert('✅ Trade supprimé avec succès!');

    } catch (err) {
        console.error('Erreur deleteTrade:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour ajouter un account avec Supabase
async function addAccount() {
    const name = document.getElementById('accountName').value.trim();
    const type = document.getElementById('accountType').value;
    const balance = parseFloat(document.getElementById('accountBalance').value);

    if (!name || !type || isNaN(balance)) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    const accountData = {
        user_id: currentUser.id,
        name: name,
        type: type,
        initial_balance: balance,
        current_balance: balance,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('accounts')
            .insert([accountData])
            .select()
            .single();

        if (error) {
            console.error('Erreur ajout account:', error);
            alert('❌ Erreur lors de l\'ajout du compte');
            return;
        }

        console.log('✅ Compte ajouté:', data);
        
        await loadUserDataFromSupabase(currentUser.id);
        displayAccounts();
        closeModal('addAccountModal');
        document.getElementById('accountForm').reset();
        
        alert('✅ Compte ajouté avec succès!');

    } catch (err) {
        console.error('Erreur addAccount:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour supprimer un account avec Supabase
async function deleteAccount(accountId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce compte ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('accounts')
            .delete()
            .eq('id', accountId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Erreur suppression account:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        console.log('✅ Compte supprimé:', accountId);
        
        await loadUserDataFromSupabase(currentUser.id);
        displayAccounts();
        
        alert('✅ Compte supprimé avec succès!');

    } catch (err) {
        console.error('Erreur deleteAccount:', err);
        alert('❌ Une erreur est survenue');
    }
}

console.log('✅ Trades Supabase chargé');
