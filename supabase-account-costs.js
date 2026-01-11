// ================================================================
// SUPABASE ACCOUNT COSTS MODULE - Version Compatible index.html
// ================================================================

(() => {
    'use strict';
    
    const MODULE = 'ACCOUNT_COSTS';
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
     * Charger tous les coûts d'un utilisateur
     */
    async function loadAccountCosts(userId) {
        if (!userId) {
            error('loadAccountCosts: userId manquant');
            return { data: [], error: 'userId manquant' };
        }
        
        try {
            log('Chargement account_costs pour user:', userId);
            
            const { data, error: err } = await supabase
                .from('account_costs')
                .select('*')
                .eq('user_id', userId)
                .order('date', { ascending: false });
            
            if (err) {
                error('Erreur chargement account_costs:', err);
                return { data: [], error: err };
            }
            
            log(`✅ ${data?.length || 0} coût(s) chargé(s)`);
            return { data: data || [], error: null };
            
        } catch (err) {
            error('Exception loadAccountCosts:', err);
            return { data: [], error: err };
        }
    }
    
    /**
     * Créer un nouveau coût
     * Compatible avec addAccountCost() de index.html
     */
    async function createAccountCost(costData) {
        try {
            log('create - Données reçues:', costData);
            
            // Ajouter user_id si manquant
            if (!costData.user_id && window.currentUser) {
                costData.user_id = window.currentUser.uuid;
                log('user_id ajouté automatiquement:', costData.user_id);
            }
            
            // Validation minimale
            if (!costData.account_id) {
                error('account_id manquant');
                return { data: null, error: 'Compte non sélectionné' };
            }
            
            if (!costData.amount && !costData.cost) {
                error('Montant manquant (amount ou cost)');
                return { data: null, error: 'Montant manquant' };
            }
            
            // Normaliser les données pour Supabase
            const finalData = {
                user_id: costData.user_id,
                account_id: costData.account_id,
                account_name: costData.account_name || 'Compte',  // Nom du compte
                cost: costData.amount || costData.cost,  // Montant payé RÉEL
                notes: costData.notes || costData.description || '',  // Notes optionnelles
                date: costData.date || new Date().toISOString().split('T')[0]
            };
            
            log('Création account_cost avec données normalisées:', finalData);
            
            const { data, error: err } = await supabase
                .from('account_costs')
                .insert([finalData])
                .select()
                .single();
            
            if (err) {
                error('Erreur création account_cost:', err);
                return { data: null, error: err };
            }
            
            log('✅ Coût créé:', data);
            return { data, error: null };
            
        } catch (err) {
            error('Exception createAccountCost:', err);
            return { data: null, error: err };
        }
    }
    
    /**
     * Mettre à jour un coût
     */
    async function updateAccountCost(id, updates) {
        try {
            if (!id) {
                error('updateAccountCost: id manquant');
                return { data: null, error: 'ID manquant' };
            }
            
            log('Mise à jour account_cost:', { id, updates });
            
            const { data, error: err } = await supabase
                .from('account_costs')
                .update(updates)
                .eq('id', id)
                .select()
                .single();
            
            if (err) {
                error('Erreur update account_cost:', err);
                return { data: null, error: err };
            }
            
            log('✅ Coût mis à jour:', data);
            return { data, error: null };
            
        } catch (err) {
            error('Exception updateAccountCost:', err);
            return { data: null, error: err };
        }
    }
    
    /**
     * Supprimer un coût
     */
    async function deleteAccountCost(id) {
        try {
            if (!id) {
                error('deleteAccountCost: id manquant');
                return { error: 'ID manquant' };
            }
            
            log('Suppression account_cost:', id);
            
            const { error: err } = await supabase
                .from('account_costs')
                .delete()
                .eq('id', id);
            
            if (err) {
                error('Erreur suppression account_cost:', err);
                return { error: err };
            }
            
            log('✅ Coût supprimé');
            return { error: null };
            
        } catch (err) {
            error('Exception deleteAccountCost:', err);
            return { error: err };
        }
    }
    
    // ================================================================
    // EXPORT API
    // ================================================================
    
    window.accountCostsAPI = {
        load: loadAccountCosts,
        create: createAccountCost,
        update: updateAccountCost,
        delete: deleteAccountCost
    };
    
    log('✅ Module chargé et API exposée');
})();
        
