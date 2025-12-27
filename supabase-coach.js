/**
 * =================================================================
 * JOURNAL TRADER 360 - COACH MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser UUID pour les requêtes
 * =================================================================
 */

(() => {
    console.log('[COACH] Chargement supabase-coach.js...');

    const supabase = window.supabaseClient; // Référence locale, pas redéclaration
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant');
        return;
    }

    console.log('[OK] Client Supabase récupéré pour coach');

    // ================================================================
    // FONCTION : CHARGER LE DASHBOARD COACH
    // ================================================================
    window.loadCoachDashboard = async function() {
        console.log('[LOAD] Chargement dashboard coach...');

        if (!window.currentUser || window.currentUser.role !== 'coach') {
            console.warn('[WARN] Utilisateur non coach');
            return;
        }

        try {
            // Charger les demandes d'inscription
            await loadCoachRegistrationsFromSupabase();

            // Charger les statistiques
            await loadCoachStats();

        } catch (err) {
            console.error('[ERROR] Erreur chargement dashboard coach:', err);
        }
    };

    // ================================================================
    // FONCTION : CHARGER LES INSCRIPTIONS EN ATTENTE
    // ================================================================
    async function loadCoachRegistrationsFromSupabase() {
        console.log('[LOAD] Chargement inscriptions en attente...');

        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('role', 'student')
                .eq('status', 'pending')
                .order('created_at', { ascending: false });

            if (error) throw error;

            console.log(`[OK] Inscriptions en attente: ${data.length}`);

            // Afficher les inscriptions
            displayRegistrations(data);

        } catch (err) {
            console.error('[ERROR] Erreur chargement inscriptions:', err);
        }
    }

    function displayRegistrations(registrations) {
        const container = document.getElementById('registrationsList');
        if (!container) return;

        if (registrations.length === 0) {
            container.innerHTML = '<p>Aucune demande en attente</p>';
            return;
        }

        container.innerHTML = registrations.map(user => `
            <div class="registration-item">
                <div>
                    <strong>${user.name}</strong>
                    <br>
                    <small>${user.email}</small>
                </div>
                <div>
                    <button onclick="approveRegistration('${user.uuid}')">Approuver</button>
                    <button onclick="rejectRegistration('${user.uuid}')">Refuser</button>
                </div>
            </div>
        `).join('');
    }

    // ================================================================
    // FONCTION : APPROUVER UNE INSCRIPTION
    // ================================================================
    window.approveRegistration = async function(userUuid) {
        console.log('[APPROVE] Approbation inscription:', userUuid);

        try {
            const { error } = await supabase
                .from('users')
                .update({ status: 'active' })
                .eq('uuid', userUuid);

            if (error) throw error;

            console.log('[OK] Inscription approuvée');
            alert('Inscription approuvée avec succès');

            // Recharger les inscriptions
            await loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Erreur approbation:', err);
            alert('Erreur lors de l\'approbation');
        }
    };

    // ================================================================
    // FONCTION : REFUSER UNE INSCRIPTION
    // ================================================================
    window.rejectRegistration = async function(userUuid) {
        console.log('[REJECT] Refus inscription:', userUuid);

        if (!confirm('Êtes-vous sûr de vouloir refuser cette inscription ?')) {
            return;
        }

        try {
            const { error } = await supabase
                .from('users')
                .delete()
                .eq('uuid', userUuid);

            if (error) throw error;

            console.log('[OK] Inscription refusée');
            alert('Inscription refusée');

            // Recharger les inscriptions
            await loadCoachRegistrationsFromSupabase();

        } catch (err) {
            console.error('[ERROR] Erreur refus:', err);
            alert('Erreur lors du refus');
        }
    };

    // ================================================================
    // FONCTION : CHARGER LES STATISTIQUES
    // ================================================================
    async function loadCoachStats() {
        console.log('[LOAD] Chargement statistiques coach...');

        try {
            // Nombre total d'étudiants actifs
            const { count: activeCount, error: activeError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student')
                .eq('status', 'active');

            if (activeError) throw activeError;

            // Nombre d'inscriptions en attente
            const { count: pendingCount, error: pendingError } = await supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'student')
                .eq('status', 'pending');

            if (pendingError) throw pendingError;

            console.log('[OK] Stats:', { activeCount, pendingCount });

            // Afficher les stats
            displayCoachStats({ activeCount, pendingCount });

        } catch (err) {
            console.error('[ERROR] Erreur chargement stats:', err);
        }
    }

    function displayCoachStats(stats) {
        const statsContainer = document.getElementById('coachStats');
        if (!statsContainer) return;

        statsContainer.innerHTML = `
            <div class="stat-card">
                <h3>${stats.activeCount || 0}</h3>
                <p>Étudiants actifs</p>
            </div>
            <div class="stat-card">
                <h3>${stats.pendingCount || 0}</h3>
                <p>En attente</p>
            </div>
        `;
    }

    // Exposer la fonction de chargement des inscriptions
    window.loadCoachRegistrationsFromSupabase = loadCoachRegistrationsFromSupabase;
    window.loadCoachStats = loadCoachStats;

    console.log('[OK] Module coach chargé avec succès');
})();
