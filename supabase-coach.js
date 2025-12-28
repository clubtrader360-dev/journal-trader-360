/**
 * =================================================================
 * JOURNAL TRADER 360 - COACH MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser UUID pour les requêtes
 * =================================================================
 */

(() => {
    console.log('[COACH] Chargement supabase-coach.js...');
    
    // Récupérer le client Supabase depuis window.supabaseClient (créé par config.js)
    const supabase = window.supabaseClient || window.supabase;
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    // ===== FONCTION CHARGEMENT INSCRIPTIONS =====
    async function loadCoachRegistrationsFromSupabase() {
        console.log(' Chargement inscriptions depuis Supabase...');
        
        try {
            // Récupérer TOUS les utilisateurs
            const { data: allUsers, error } = await supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) {
                console.error('[ERROR] Erreur chargement registrations:', error);
                return;
            }

            console.log('[DATA] Utilisateurs récupérés:', allUsers.length);

            // Filtrer par statut et rôle
            const pendingUsers = allUsers.filter(u => u.status === 'pending' && u.role === 'student');
            const activeUsers = allUsers.filter(u => u.status === 'active' && u.role === 'student');
            const revokedUsers = allUsers.filter(u => u.status === 'revoked' && u.role === 'student');

            console.log('⏳ Pending:', pendingUsers.length, '[OK] Active:', activeUsers.length, ' Revoked:', revokedUsers.length);

            // Afficher les inscriptions en attente
            const pendingContainer = document.getElementById('coachPendingUsers');
            if (pendingContainer) {
                if (pendingUsers.length === 0) {
                    pendingContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Aucune demande en attente</p>';
                } else {
                    pendingContainer.innerHTML = pendingUsers.map(u => `
                        <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200 mb-3">
                            <div>
                                <p class="font-semibold">${u.email}</p>
                                <p class="text-sm text-gray-500">Inscrit le ${new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <div class="space-x-2">
                                <button onclick="approveRegistration('${u.uuid}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                     Approuver
                                </button>
                                <button onclick="rejectRegistration('${u.uuid}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                                     Refuser
                                </button>
                            </div>
                        </div>
                    `).join('');
                }
            }

            // Afficher les utilisateurs actifs
            const activeContainer = document.getElementById('coachActiveUsers');
            if (activeContainer) {
                if (activeUsers.length === 0) {
                    activeContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun utilisateur actif</p>';
                } else {
                    activeContainer.innerHTML = activeUsers.map(u => `
                        <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200 mb-3">
                            <div>
                                <p class="font-semibold">${u.email}</p>
                                <p class="text-sm text-gray-500">Actif depuis ${new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                            </div>
                            <button onclick="revokeAccess('${u.uuid}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition">
                                 Révoquer
                            </button>
                        </div>
                    `).join('');
                }
            }

            // Afficher les utilisateurs révoqués
            const revokedContainer = document.getElementById('coachRevokedUsers');
            if (revokedContainer) {
                if (revokedUsers.length === 0) {
                    revokedContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Aucun utilisateur révoqué</p>';
                } else {
                    revokedContainer.innerHTML = revokedUsers.map(u => `
                        <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200 mb-3">
                            <div>
                                <p class="font-semibold">${u.email}</p>
                                <p class="text-sm text-gray-500">Révoqué</p>
                            </div>
                            <button onclick="reactivateUser('${u.uuid}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition">
                                 Réactiver
                            </button>
                        </div>
                    `).join('');
                }
            }

        } catch (err) {
            console.error('[ERROR] Exception loadCoachRegistrations:', err);
        }
    }

    // ===== FONCTION APPROBATION =====
    async function approveRegistration(uuid) {
        if (!confirm('Confirmer l\'approbation de cet utilisateur ?')) {
            return;
        }

        console.log('[OK] Approbation utilisateur UUID:', uuid);

        try {
            const { data, error } = await supabase
                .from('users')
                .update({ status: 'active' })
                .eq('uuid', uuid)
                .select()
                .single();

            if (error) {
                console.error('[ERROR] Erreur approbation:', error);
                alert('[ERROR] Erreur lors de l\'approbation: ' + error.message);
                return;
            }

            console.log('[OK] Utilisateur approuvé:', data);
            alert('[OK] Utilisateur approuvé avec succès !');

            // Rafraîchir
            loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Exception approveRegistration:', err);
            alert('[ERROR] Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION REJET =====
    async function rejectRegistration(uuid) {
        if (!confirm('Confirmer le rejet de cet utilisateur ? (Cette action supprimera définitivement l\'utilisateur)')) {
            return;
        }

        console.log(' Rejet utilisateur UUID:', uuid);

        try {
            const { data, error } = await supabase
                .from('users')
                .delete()
                .eq('uuid', uuid)
                .select();

            if (error) {
                console.error('[ERROR] Erreur rejet:', error);
                alert('[ERROR] Erreur lors du rejet: ' + error.message);
                return;
            }

            console.log('[OK] Utilisateur rejeté:', data);
            alert('[OK] Utilisateur rejeté');

            // Rafraîchir
            loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Exception rejectRegistration:', err);
            alert('[ERROR] Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION RÉVOCATION =====
    async function revokeAccess(uuid) {
        if (!confirm('Confirmer la révocation de cet utilisateur ?')) {
            return;
        }

        console.log(' Révocation utilisateur UUID:', uuid);

        try {
            const { data, error } = await supabase
                .from('users')
                .update({ status: 'revoked' })
                .eq('uuid', uuid)
                .select()
                .single();

            if (error) {
                console.error('[ERROR] Erreur révocation:', error);
                alert('[ERROR] Erreur lors de la révocation: ' + error.message);
                return;
            }

            console.log('[OK] Accès révoqué:', data);
            alert('[OK] Accès révoqué');

            // Rafraîchir
            loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Exception revokeAccess:', err);
            alert('[ERROR] Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION RÉACTIVATION =====
    async function reactivateUser(uuid) {
        if (!confirm('Confirmer la réactivation de cet utilisateur ?')) {
            return;
        }

        console.log('[OK] Réactivation utilisateur UUID:', uuid);

        try {
            const { data, error } = await supabase
                .from('users')
                .update({ status: 'active' })
                .eq('uuid', uuid)
                .select()
                .single();

            if (error) {
                console.error('[ERROR] Erreur réactivation:', error);
                alert('[ERROR] Erreur lors de la réactivation: ' + error.message);
                return;
            }

            console.log('[OK] Utilisateur réactivé:', data);
            alert('[OK] Utilisateur réactivé avec succès !');

            // Rafraîchir
            loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Exception reactivateUser:', err);
            alert('[ERROR] Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION STATISTIQUES =====
    async function loadCoachStats() {
        console.log('[DATA] Chargement statistiques coach...');

        try {
            // Compter les utilisateurs par statut
            const { data: allUsers, error } = await supabase
                .from('users')
                .select('uuid, status, role')
                .eq('role', 'student');

            if (error) {
                console.error('[ERROR] Erreur chargement stats:', error);
                return;
            }

            const stats = {
                total: allUsers.length,
                active: allUsers.filter(u => u.status === 'active').length,
                pending: allUsers.filter(u => u.status === 'pending').length,
                revoked: allUsers.filter(u => u.status === 'revoked').length
            };

            console.log('[DATA] Statistiques:', stats);

            // Afficher dans le dashboard
            const statsContainer = document.getElementById('coachStats');
            if (statsContainer) {
                statsContainer.innerHTML = `
                    <div class="grid grid-cols-4 gap-4">
                        <div class="p-4 bg-blue-100 rounded-lg text-center">
                            <p class="text-3xl font-bold text-blue-600">${stats.total}</p>
                            <p class="text-sm text-gray-600">Total</p>
                        </div>
                        <div class="p-4 bg-green-100 rounded-lg text-center">
                            <p class="text-3xl font-bold text-green-600">${stats.active}</p>
                            <p class="text-sm text-gray-600">Actifs</p>
                        </div>
                        <div class="p-4 bg-yellow-100 rounded-lg text-center">
                            <p class="text-3xl font-bold text-yellow-600">${stats.pending}</p>
                            <p class="text-sm text-gray-600">En attente</p>
                        </div>
                        <div class="p-4 bg-red-100 rounded-lg text-center">
                            <p class="text-3xl font-bold text-red-600">${stats.revoked}</p>
                            <p class="text-sm text-gray-600">Révoqués</p>
                        </div>
                    </div>
                `;
            }

        } catch (err) {
            console.error('[ERROR] Exception loadCoachStats:', err);
        }
    }

    // ===== EXPORT DES FONCTIONS =====
    window.loadCoachRegistrationsFromSupabase = loadCoachRegistrationsFromSupabase;
    window.approveRegistration = approveRegistration;
    window.rejectRegistration = rejectRegistration;
    window.revokeAccess = revokeAccess;
    window.reactivateUser = reactivateUser;
    window.loadCoachStats = loadCoachStats;

    console.log('[OK] Fonctions coach exportées: loadCoachRegistrations, approveRegistration, rejectRegistration, revokeAccess, reactivateUser, loadCoachStats');

})();
