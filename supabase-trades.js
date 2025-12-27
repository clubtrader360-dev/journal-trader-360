/**
 * =================================================================
 * JOURNAL TRADER 360 - TRADES MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = window.currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('[CHART] Chargement supabase-trades.js...');

    const supabase = window.supabaseClient; // Référence locale, pas redéclaration
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant');
        return;
    }

    console.log('[OK] Client Supabase récupéré');

    // ================================================================
    // FONCTION : CHARGER LES TRADES
    // ================================================================
    window.loadTrades = async function() {
        console.log('[LOAD] Chargement des trades...');

        // Vérification utilisateur connecté
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] loadTrades appelé SANS utilisateur connecté');
            return;
        }

        const userId = window.currentUser.uuid;

        try {
            const { data, error } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', userId)
                .order('entry_time', { ascending: false });

            if (error) throw error;

            console.log(`[OK] Trades chargés: ${data.length}`);
            
            // Appeler la fonction d'affichage si elle existe
            if (typeof window.displayTrades === 'function') {
                window.displayTrades(data);
            }

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur chargement trades:', err);
            return [];
        }
    };

    // ================================================================
    // FONCTION : AJOUTER UN TRADE
    // ================================================================
    window.addTrade = async function(tradeData) {
        console.log('[ADD] Ajout trade:', tradeData);

        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] addTrade appelé SANS utilisateur connecté');
            alert('Vous devez être connecté pour ajouter un trade');
            return;
        }

        try {
            // Ajouter le user_id
            const tradeWithUser = {
                ...tradeData,
                user_id: window.currentUser.uuid
            };

            const { data, error } = await supabase
                .from('trades')
                .insert([tradeWithUser])
                .select()
                .single();

            if (error) throw error;

            console.log('[OK] Trade ajouté:', data);
            
            // Recharger les trades
            window.loadTrades();

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur ajout trade:', err);
            alert('Erreur lors de l\'ajout du trade');
            return null;
        }
    };

    // ================================================================
    // FONCTION : SUPPRIMER UN TRADE
    // ================================================================
    window.deleteTrade = async function(tradeId) {
        console.log('[DELETE] Suppression trade:', tradeId);

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce trade ?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('trades')
                .delete()
                .eq('id', tradeId);

            if (error) throw error;

            console.log('[OK] Trade supprimé:', tradeId);
            
            // Recharger les trades
            window.loadTrades();

        } catch (err) {
            console.error('[ERROR] Erreur suppression trade:', err);
            alert('Erreur lors de la suppression du trade');
        }
    };

    // ================================================================
    // FONCTION : CHARGER LES COMPTES
    // ================================================================
    window.loadAccounts = async function() {
        console.log('[LOAD] Chargement des comptes...');

        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] loadAccounts appelé SANS utilisateur connecté');
            return;
        }

        const userId = window.currentUser.uuid;

        try {
            const { data, error } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`[OK] Comptes chargés: ${data.length}`);

            // Mettre à jour le select des comptes
            const tradeAccountSelect = document.getElementById('tradeAccount');
            if (tradeAccountSelect) {
                tradeAccountSelect.innerHTML = '<option value="">Sélectionner un compte...</option>';
                data.forEach(account => {
                    const option = document.createElement('option');
                    option.value = account.id;
                    option.textContent = account.name;
                    tradeAccountSelect.appendChild(option);
                });
                console.log('[OK] Select #tradeAccount mis à jour');
            }

            // Mettre à jour la liste des comptes dans la sidebar
            if (typeof window.renderAccountsList === 'function') {
                window.renderAccountsList(data);
            }

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur chargement comptes:', err);
            return [];
        }
    };

    // ================================================================
    // FONCTION : AJOUTER UN COMPTE
    // ================================================================
    window.addAccount = async function(accountData) {
        console.log('[ADD] Ajout compte:', accountData);

        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] addAccount appelé SANS utilisateur connecté');
            alert('Vous devez être connecté pour ajouter un compte');
            return;
        }

        try {
            // Ajouter le user_id
            const accountWithUser = {
                ...accountData,
                user_id: window.currentUser.uuid
            };

            const { data, error } = await supabase
                .from('accounts')
                .insert([accountWithUser])
                .select()
                .single();

            if (error) throw error;

            console.log('[OK] Compte ajouté:', data);
            
            // Recharger les comptes
            window.loadAccounts();

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur ajout compte:', err);
            alert('Erreur lors de l\'ajout du compte');
            return null;
        }
    };

    // ================================================================
    // FONCTION : SUPPRIMER UN COMPTE
    // ================================================================
    window.deleteAccount = async function(accountId) {
        console.log('[DELETE] Suppression compte:', accountId);

        if (!confirm('Êtes-vous sûr de vouloir supprimer ce compte ?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('accounts')
                .delete()
                .eq('id', accountId);

            if (error) throw error;

            console.log('[OK] Compte supprimé:', accountId);
            
            // Recharger les comptes
            window.loadAccounts();

        } catch (err) {
            console.error('[ERROR] Erreur suppression compte:', err);
            alert('Erreur lors de la suppression du compte');
        }
    };

    console.log('[OK] Module trades chargé avec succès');
})();
