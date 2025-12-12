/**
 * =================================================================
 * JOURNAL TRADER 360 - JOURNAL & ACCOUNTING MODULE
 * Version: DEFINITIVE 1.0
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

// ===== FONCTION AJOUT JOURNAL ENTRY =====
async function addJournalEntry() {
    const date = document.getElementById('journalDate').value;
    const content = document.getElementById('journalContent').value.trim();

    if (!date || !content) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const entryData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        date: date,
        content: content,
        created_at: new Date().toISOString()
    };

    console.log('📓 Ajout journal entry pour UUID:', currentUser.uuid);

    try {
        const { data, error } = await supabase
            .from('journal_entries')
            .insert([entryData])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur ajout journal entry:', error);
            alert('❌ Erreur lors de l\'ajout de l\'entrée: ' + error.message);
            return;
        }

        console.log('✅ Journal entry ajouté:', data);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayJournal();
        
        document.getElementById('journalDate').value = '';
        document.getElementById('journalContent').value = '';
        
        alert('✅ Entrée de journal ajoutée avec succès!');

    } catch (err) {
        console.error('❌ Erreur addJournalEntry:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION SUPPRESSION JOURNAL ENTRY =====
async function deleteJournalEntry(entryId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer cette entrée ?')) {
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    console.log('🗑️ Suppression journal entry ID:', entryId, 'pour UUID:', currentUser.uuid);

    try {
        const { error } = await supabase
            .from('journal_entries')
            .delete()
            .eq('id', entryId)
            .eq('user_id', currentUser.uuid);

        if (error) {
            console.error('❌ Erreur suppression journal entry:', error);
            alert('❌ Erreur lors de la suppression: ' + error.message);
            return;
        }

        console.log('✅ Journal entry supprimé:', entryId);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayJournal();
        
        alert('✅ Entrée supprimée avec succès!');

    } catch (err) {
        console.error('❌ Erreur deleteJournalEntry:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION AJOUT ACCOUNT COST =====
async function addAccountCost() {
    const accountName = document.getElementById('accountCostName').value.trim();
    const cost = parseFloat(document.getElementById('accountCostAmount').value);
    const date = document.getElementById('accountCostDate').value;

    if (!accountName || isNaN(cost) || !date) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const costData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        account_name: accountName,
        cost: cost,
        date: date,
        created_at: new Date().toISOString()
    };

    console.log('💸 Ajout account cost pour UUID:', currentUser.uuid);

    try {
        const { data, error } = await supabase
            .from('account_costs')
            .insert([costData])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur ajout account cost:', error);
            alert('❌ Erreur lors de l\'ajout du coût: ' + error.message);
            return;
        }

        console.log('✅ Account cost ajouté:', data);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayAccountCosts();
        
        document.getElementById('accountCostName').value = '';
        document.getElementById('accountCostAmount').value = '';
        document.getElementById('accountCostDate').value = '';
        closeModal('addAccountCostModal');
        
        alert('✅ Coût ajouté avec succès!');

    } catch (err) {
        console.error('❌ Erreur addAccountCost:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION SUPPRESSION ACCOUNT COST =====
async function deleteAccountCost(costId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce coût ?')) {
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    console.log('🗑️ Suppression account cost ID:', costId, 'pour UUID:', currentUser.uuid);

    try {
        const { error } = await supabase
            .from('account_costs')
            .delete()
            .eq('id', costId)
            .eq('user_id', currentUser.uuid);

        if (error) {
            console.error('❌ Erreur suppression account cost:', error);
            alert('❌ Erreur lors de la suppression: ' + error.message);
            return;
        }

        console.log('✅ Account cost supprimé:', costId);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayAccountCosts();
        
        alert('✅ Coût supprimé avec succès!');

    } catch (err) {
        console.error('❌ Erreur deleteAccountCost:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION AJOUT PAYOUT =====
async function addPayout() {
    const accountName = document.getElementById('payoutAccount').value.trim();
    const amount = parseFloat(document.getElementById('payoutAmount').value);
    const date = document.getElementById('payoutDate').value;

    if (!accountName || isNaN(amount) || !date) {
        alert('⚠️ Veuillez remplir tous les champs');
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    const payoutData = {
        user_id: currentUser.uuid,  // ⚠️ UTILISER UUID
        account_name: accountName,
        amount: amount,
        date: date,
        created_at: new Date().toISOString()
    };

    console.log('💰 Ajout payout pour UUID:', currentUser.uuid);

    try {
        const { data, error } = await supabase
            .from('payouts')
            .insert([payoutData])
            .select()
            .single();

        if (error) {
            console.error('❌ Erreur ajout payout:', error);
            alert('❌ Erreur lors de l\'ajout du payout: ' + error.message);
            return;
        }

        console.log('✅ Payout ajouté:', data);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayPayouts();
        
        document.getElementById('payoutAccount').value = '';
        document.getElementById('payoutAmount').value = '';
        document.getElementById('payoutDate').value = '';
        closeModal('addPayoutModal');
        
        alert('✅ Payout ajouté avec succès!');

    } catch (err) {
        console.error('❌ Erreur addPayout:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTION SUPPRESSION PAYOUT =====
async function deletePayout(payoutId) {
    if (!confirm('❌ Voulez-vous vraiment supprimer ce payout ?')) {
        return;
    }

    if (!currentUser || !currentUser.uuid) {
        alert('❌ Erreur: utilisateur non connecté');
        return;
    }

    console.log('🗑️ Suppression payout ID:', payoutId, 'pour UUID:', currentUser.uuid);

    try {
        const { error } = await supabase
            .from('payouts')
            .delete()
            .eq('id', payoutId)
            .eq('user_id', currentUser.uuid);

        if (error) {
            console.error('❌ Erreur suppression payout:', error);
            alert('❌ Erreur lors de la suppression: ' + error.message);
            return;
        }

        console.log('✅ Payout supprimé:', payoutId);

        await loadUserDataFromSupabase(currentUser.uuid);
        displayPayouts();
        
        alert('✅ Payout supprimé avec succès!');

    } catch (err) {
        console.error('❌ Erreur deletePayout:', err);
        alert('❌ Une erreur est survenue');
    }
}

// ===== FONCTIONS AFFICHAGE =====
function displayAccountCosts() {
    const tbody = document.getElementById('accountCostsTable');
    
    if (!accountCosts || accountCosts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2 opacity-30"></i>
                    <p>Aucun coût enregistré</p>
                </td>
            </tr>
        `;
        return;
    }

    const sortedCosts = [...accountCosts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedCosts.map(ac => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-2 text-sm">${new Date(ac.date).toLocaleDateString('fr-FR')}</td>
            <td class="py-3 px-2 text-sm font-medium">${ac.account_name}</td>
            <td class="py-3 px-2 text-sm text-right font-semibold" style="color: #dc2626;">-$${ac.cost.toFixed(2)}</td>
            <td class="py-3 px-2 text-center">
                <button onclick="deleteAccountCost('${ac.id}')" class="text-red-600 hover:text-red-800" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function displayPayouts() {
    const tbody = document.getElementById('payoutsTable');
    
    if (!userPayouts || userPayouts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="4" class="text-center py-8 text-gray-500">
                    <i class="fas fa-inbox text-4xl mb-2 opacity-30"></i>
                    <p>Aucun payout enregistré</p>
                </td>
            </tr>
        `;
        return;
    }

    const sortedPayouts = [...userPayouts].sort((a, b) => new Date(b.date) - new Date(a.date));
    
    tbody.innerHTML = sortedPayouts.map(p => `
        <tr class="border-b hover:bg-gray-50">
            <td class="py-3 px-2 text-sm">${new Date(p.date).toLocaleDateString('fr-FR')}</td>
            <td class="py-3 px-2 text-sm font-medium">${p.account_name}</td>
            <td class="py-3 px-2 text-sm text-right font-semibold" style="color: #10b981;">+$${p.amount.toFixed(2)}</td>
            <td class="py-3 px-2 text-center">
                <button onclick="deletePayout('${p.id}')" class="text-red-600 hover:text-red-800" title="Supprimer">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

console.log('✅ Journal & Accounting Module chargé (VERSION DEFINITIVE)');
