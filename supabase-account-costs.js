// ================================================================
// SUPABASE ACCOUNT COSTS MODULE - Version Professionnelle
// ================================================================

(() => {
    'use strict';
    
    const MODULE = 'ACCOUNT_COSTS';
    const log = (msg, data) => console.log(`[${MODULE}] ${msg}`, data || '');
    const error = (msg, err) => console.error(`[${MODULE}] ❌ ${msg}`, err);

    // Récupérer le client Supabase
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        error('Client Supabase non disponible');
        return;
    }

    log('Module chargé');

    // ================================================================
    // API PUBLIQUE
    // ================================================================

    window.accountCostsAPI = {
        /**
         * Charger tous les coûts d'un utilisateur
         */
        async load(userId) {
            if (!userId) {
                error('load() - userId manquant');
                return { data: null, error: 'userId requis' };
            }

            try {
                log('Chargement coûts pour userId:', userId);
                
                const { data, error: err } = await supabase
                    .from('account_costs')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false });

                if (err) throw err;

                log('Coûts chargés:', data?.length || 0);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur load()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Créer un nouveau coût
         */
        async create(costData) {
            if (!costData.user_id) {
                error('create() - user_id manquant');
                return { data: null, error: 'user_id requis' };
            }

            try {
                log('Création coût:', costData);

                const { data, error: err } = await supabase
                    .from('account_costs')
                    .insert([costData])
                    .select()
                    .single();

                if (err) throw err;

                log('Coût créé:', data);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur create()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Mettre à jour un coût
         */
        async update(id, updates) {
            if (!id) {
                error('update() - id manquant');
                return { data: null, error: 'id requis' };
            }

            try {
                log('Mise à jour coût:', { id, updates });

                const { data, error: err } = await supabase
                    .from('account_costs')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (err) throw err;

                log('Coût mis à jour:', data);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur update()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Supprimer un coût
         */
        async delete(id) {
            if (!id) {
                error('delete() - id manquant');
                return { data: null, error: 'id requis' };
            }

            try {
                log('Suppression coût:', id);

                const { error: err } = await supabase
                    .from('account_costs')
                    .delete()
                    .eq('id', id);

                if (err) throw err;

                log('Coût supprimé:', id);
                return { data: true, error: null };
                
            } catch (err) {
                error('Erreur delete()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Recharger l'UI (à implémenter selon besoin)
         */
        refresh() {
            log('Rechargement UI coûts...');
            // TODO: Implémenter le rechargement de l'UI si nécessaire
        }
    };

    log('API exposée: window.accountCostsAPI');
})();
