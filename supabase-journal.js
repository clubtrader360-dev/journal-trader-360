// Fonction pour ajouter une entrée de journal avec Supabase
async function addJournalEntry() {
    const date = document.getElementById('journalDate').value;
    const content = document.getElementById('journalContent').value.trim();

    if (!date || !content) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.id) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const entryData = {
        user_id: currentUser.id,
        date: date,
        content: content,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([entryData])
            .select()
            .single();

        if (error) {
            console.error('Erreur ajout journal entry:', error);
            alert('❌ Erreur lors de l\'ajout de l\'entrée');
            return;
        }

        console.log('✅ Journal entry ajouté:', data);

        // Recharger les données
        await loadUserDataFromSupabase(currentUser.id);
        displayJournal();
        
        // Réinitialiser le formulaire
        document.getElementById('journalDate').value = '';
        document.getElementById('journalContent').value = '';
        
        alert('✅ Entrée de journal ajoutée avec succès!');

    } catch (err) {
        console.error('Erreur addJournalEntry:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour supprimer une entrée de journal avec Supabase
async function deleteJournalEntry(entryId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer cette entrée ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Erreur suppression journal entry:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        console.log('✅ Journal entry supprimé:', entryId);

        await loadUserDataFromSupabase(currentUser.id);
        displayJournal();
        
        alert('✅ Entrée supprimée avec succès!');

    } catch (err) {
        console.error('Erreur deleteJournalEntry:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour ajouter un coût de compte avec Supabase
async function addAccountCost() {
    const accountName = document.getElementById('costAccountName').value.trim();
    const cost = parseFloat(document.getElementById('costAmount').value);
    const date = document.getElementById('costDate').value;

    if (!accountName || isNaN(cost) || !date) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.id) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const costData = {
        user_id: currentUser.id,
        account_name: accountName,
        cost: cost,
        date: date,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('account_costs')
            .insert([costData])
            .select()
            .single();

        if (error) {
            console.error('Erreur ajout account cost:', error);
            alert('❌ Erreur lors de l\'ajout du coût');
            return;
        }

        console.log('✅ Account cost ajouté:', data);

        await loadUserDataFromSupabase(currentUser.id);
        displayAccountCosts();
        
        // Réinitialiser le formulaire
        document.getElementById('costAccountName').value = '';
        document.getElementById('costAmount').value = '';
        document.getElementById('costDate').value = '';
        
        alert('✅ Coût ajouté avec succès!');

    } catch (err) {
        console.error('Erreur addAccountCost:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour supprimer un coût de compte avec Supabase
async function deleteAccountCost(costId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce coût ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('account_costs')
            .delete()
            .eq('id', costId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Erreur suppression account cost:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        console.log('✅ Account cost supprimé:', costId);

        await loadUserDataFromSupabase(currentUser.id);
        displayAccountCosts();
        
        alert('✅ Coût supprimé avec succès!');

    } catch (err) {
        console.error('Erreur deleteAccountCost:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour ajouter un payout avec Supabase
async function addPayout() {
    const accountName = document.getElementById('payoutAccountName').value.trim();
    const amount = parseFloat(document.getElementById('payoutAmount').value);
    const date = document.getElementById('payoutDate').value;

    if (!accountName || isNaN(amount) || !date) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.id) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const payoutData = {
        user_id: currentUser.id,
        account_name: accountName,
        amount: amount,
        date: date,
        created_at: new Date().toISOString()
    };

    try {
        const { data, error } = await supabase
            .from('payouts')
            .insert([payoutData])
            .select()
            .single();

        if (error) {
            console.error('Erreur ajout payout:', error);
            alert('❌ Erreur lors de l\'ajout du payout');
            return;
        }

        console.log('✅ Payout ajouté:', data);

        await loadUserDataFromSupabase(currentUser.id);
        displayPayouts();
        
        // Réinitialiser le formulaire
        document.getElementById('payoutAccountName').value = '';
        document.getElementById('payoutAmount').value = '';
        document.getElementById('payoutDate').value = '';
        
        alert('✅ Payout ajouté avec succès!');

    } catch (err) {
        console.error('Erreur addPayout:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour supprimer un payout avec Supabase
async function deletePayout(payoutId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce payout ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('payouts')
            .delete()
            .eq('id', payoutId)
            .eq('user_id', currentUser.id);

        if (error) {
            console.error('Erreur suppression payout:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        console.log('✅ Payout supprimé:', payoutId);

        await loadUserDataFromSupabase(currentUser.id);
        displayPayouts();
        
        alert('✅ Payout supprimé avec succès!');

    } catch (err) {
        console.error('Erreur deletePayout:', err);
        alert('❌ Une erreur est survenue');
    }
}

console.log('✅ Journal + Costs + Payouts Supabase chargé');
