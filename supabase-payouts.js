// ================================================================
// SUPABASE PAYOUTS MODULE - Version Professionnelle
// ================================================================

(() => {
    'use strict';
    
    const MODULE = 'PAYOUTS';
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

    window.payoutsAPI = {
        /**
         * Charger tous les payouts d'un utilisateur
         */
        async load(userId) {
            if (!userId) {
                error('load() - userId manquant');
                return { data: null, error: 'userId requis' };
            }

            try {
                log('Chargement payouts pour userId:', userId);
                
                const { data, error: err } = await supabase
                    .from('payouts')
                    .select('*')
                    .eq('user_id', userId)
                    .order('date', { ascending: false });

                if (err) throw err;

                log('Payouts chargés:', data?.length || 0);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur load()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Créer un nouveau payout
         */
        async create(payoutData) {
            if (!payoutData.user_id) {
                error('create() - user_id manquant');
                return { data: null, error: 'user_id requis' };
            }

            try {
                log('Création payout:', payoutData);

                const { data, error: err } = await supabase
                    .from('payouts')
                    .insert([payoutData])
                    .select()
                    .single();

                if (err) throw err;

                log('Payout créé:', data);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur create()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Mettre à jour un payout
         */
        async update(id, updates) {
            if (!id) {
                error('update() - id manquant');
                return { data: null, error: 'id requis' };
            }

            try {
                log('Mise à jour payout:', { id, updates });

                const { data, error: err } = await supabase
                    .from('payouts')
                    .update(updates)
                    .eq('id', id)
                    .select()
                    .single();

                if (err) throw err;

                log('Payout mis à jour:', data);
                return { data, error: null };
                
            } catch (err) {
                error('Erreur update()', err);
                return { data: null, error: err.message };
            }
        },

        /**
         * Supprimer un payout
         */
        async delete(id) {
            if (!id) {
                error('delete() - id manquant');
                return { data: null, error: 'id requis' };
            }

            try {
                log('Suppression payout:', id);

                const { error: err } = await supabase
                    .from('payouts')
                    .delete()
                    .eq('id', id);

                if (err) throw err;

                log('Payout supprimé:', id);
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
            log('Rechargement UI payouts...');
            // TODO: Implémenter le rechargement de l'UI si nécessaire
        }
    };

    log('API exposée: window.payoutsAPI');
})();
