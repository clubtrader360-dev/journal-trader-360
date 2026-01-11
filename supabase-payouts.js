// ================================================================
// SUPABASE PAYOUTS MODULE - Version Compatible index.html
// ================================================================

(() => {
    'use strict';
    
    const MODULE = 'PAYOUTS';
    const log = (msg, data) => console.log(`[${MODULE}] ${msg}`, data || '');
    const error = (msg, err) => console.error(`[${MODULE}] ❌ ${msg}`, err);
    
    // Vérifier dépendances
    if (!window.supabaseClient) {
        error('supabaseClient manquant - Module non chargé');
        return;
    }
    
    const supabase = window.supabaseClient || window.supabase;
    
    // ================================================================
    // API PUBLIQUE
    // ================================================================
    
    /**
     * Charger tous les payouts d'un utilisateur
     */
    async function loadPayouts(userId) {
        if (!userId) {
            error('loadPayouts: userId manquant');
            return { data: [], error: 'userId manquant' };
        }
        
        try {
            log('Chargement payouts pour user:', userId);
            
            const { data, error: err } = await supabase
                .from('payouts')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            
            if (err) {
                error('Erreur chargement payouts:', err);
                return { data: [], error: err };
            }
            
            log(`✅ ${data?.length || 0} payout(s) chargé(s)`);
            return { data: data || [], error: null };
            
        } catch (err) {
            error('Exception loadPayouts:', err);
            return { data: [], error: err };
        }
    }
    
    /**
     * Créer un nouveau payout
     * Compatible avec addPayout() de index.html
     */
    async function createPayout(payoutData) {
        try {
            log('create - Données reçues:', payoutData);
            
            // Ajouter user_id si manquant
            if (!payoutData.user_id && window.currentUser) {
                payoutData.user_id = window.currentUser.uuid;
                log('user_id ajouté automatiquement:', payoutData.user_id);
            }
            
            // Validation minimale
            if (!payoutData.account_name) {
                error('account_name manquant');
                return { data: null, error: 'Nom du compte manquant' };
            }
            
            if (!payoutData.amount) {
                error('Montant manquant');
                return { data: null, error: 'Montant manquant' };
            }
            
            // Préparer données pour Supabase
            const finalData = {
                user_id: payoutData.user_id,
                account_id: payoutData.account_id || null,  // Peut être null
                account_name: payoutData.account_name,       // Nom libre
                amount: payoutData.amount,
                notes: payoutData.notes || payoutData.description || '',
                date: payoutData.date || new Date().toISOString().split('T')[0]
            };
            
            log('Création payout avec données finales:', finalData);
            
            const { data, error: err } = await supabase
                .from('payouts')
                .insert([finalData])
                .select()
                .single();
            
            if (err) {
                error('Erreur création payout:', err);
                return { data: null, error: err };
            }
            
            log('✅ Payout créé:', data);
            return { data, error: null };
            
        } catch (err) {
            error('Exception createPayout:', err);
            return { data: null, error: err };
        }
    }
    
    /**
     * Mettre à jour un payout
     */
    async function updatePayout(id, updates) {
        try {
            if (!id) {
                error('updatePayout: id manquant');
                return { data: null, error: 'ID manquant' };
            }
            
            log('Mise à jour payout:', { id, updates });
            
            const { data, error: err } = await supabase
                .from('payouts')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (err) {
                error('Erreur update payout:', err);
                return { data: null, error: err };
            }
            
            log('✅ Payout mis à jour:', data);
            return { data, error: null };
            
        } catch (err) {
            error('Exception updatePayout:', err);
            return { data: null, error: err };
        }
    }
    
    /**
     * Supprimer un payout
     */
    async function deletePayout(id) {
        try {
            if (!id) {
                error('deletePayout: id manquant');
                return { error: 'ID manquant' };
            }
            
            log('Suppression payout:', id);
            
            const { error: err } = await supabase
                .from('payouts')
                .delete()
                .eq('id', id);
            
            if (err) {
                error('Erreur suppression payout:', err);
                return { error: err };
            }
            
            log('✅ Payout supprimé');
            return { error: null };
            
        } catch (err) {
            error('Exception deletePayout:', err);
            return { error: err };
        }
    }
    
    // ================================================================
    // EXPORT API
    // ================================================================
    
    window.payoutsAPI = {
        load: loadPayouts,
        create: createPayout,
        update: updatePayout,
        delete: deletePayout
    };
    
    log('✅ Module chargé et API exposée');
})();
