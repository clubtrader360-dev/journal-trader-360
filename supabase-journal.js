/**
 * =================================================================
 * JOURNAL TRADER 360 - JOURNAL MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('[REGISTER] Chargement supabase-journal.js...');

    const supabase = window.supabaseClient; // Référence locale, pas redéclaration
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant');
        return;
    }

    console.log('[OK] Client Supabase récupéré pour journal');

    // ================================================================
    // FONCTION : CHARGER LES ENTRÉES DU JOURNAL
    // ================================================================
    window.loadJournalEntries = async function() {
        console.log('[LOAD] Chargement des entrées journal...');

        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] loadJournalEntries appelé SANS utilisateur connecté');
            return;
        }

        const userId = window.currentUser.uuid;

        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });

            if (error) throw error;

            console.log(`[OK] Entrées journal chargées: ${data.length}`);

            // Appeler la fonction d'affichage si elle existe
            if (typeof window.displayJournalEntries === 'function') {
                window.displayJournalEntries(data);
            }

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur chargement journal:', err);
            return [];
        }
    };

    // ================================================================
    // FONCTION : AJOUTER UNE ENTRÉE JOURNAL
    // ================================================================
    window.addJournalEntry = async function(entryData) {
        console.log('[ADD] Ajout entrée journal:', entryData);

        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[WARN] addJournalEntry appelé SANS utilisateur connecté');
            alert('Vous devez être connecté pour ajouter une entrée');
            return;
        }

        // Validation du contenu
        if (!entryData.content || !entryData.content.trim()) {
            alert('Le contenu est obligatoire');
            return;
        }

        try {
            // Ajouter user_id et date
            const entryWithUser = {
                ...entryData,
                user_id: window.currentUser.uuid,
                date: entryData.date || new Date().toISOString().split('T')[0]
            };

            const { data, error } = await supabase
                .from('journal_entries')
                .insert([entryWithUser])
                .select()
                .single();

            if (error) throw error;

            console.log('[OK] Entrée journal ajoutée:', data);

            // Recharger les entrées
            window.loadJournalEntries();

            return data;

        } catch (err) {
            console.error('[ERROR] Erreur ajout entrée journal:', err);
            alert('Erreur lors de l\'ajout de l\'entrée');
            return null;
        }
    };

    // ================================================================
    // FONCTION : SUPPRIMER UNE ENTRÉE JOURNAL
    // ================================================================
    window.deleteJournalEntry = async function(entryId) {
        console.log('[DELETE] Suppression entrée journal:', entryId);

        if (!confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('journal_entries')
                .delete()
                .eq('id', entryId);

            if (error) throw error;

            console.log('[OK] Entrée journal supprimée:', entryId);

            // Recharger les entrées
            window.loadJournalEntries();

        } catch (err) {
            console.error('[ERROR] Erreur suppression entrée journal:', err);
            alert('Erreur lors de la suppression de l\'entrée');
        }
    };

    console.log('[OK] Module journal chargé avec succès');
})();
