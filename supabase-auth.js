// ========================================
// SUPABASE AUTH - VERSION IIFE (ISOLÉE)
// ========================================

(() => {
    console.log('[LOAD] Chargement supabase-auth.js...');

    // Récupérer le client depuis window.supabaseClient (pas window.supabase)
    const supabase = window.supabaseClient; // Référence locale, pas redéclaration
    
    if (!supabase) {
        console.error('[ERROR] ERREUR : window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    console.log('[OK] Client Supabase récupéré depuis window.supabaseClient');

    // ========================================
    // FONCTION : LOGIN ÉLÈVE
    // ========================================
    async function login() {
        const loginEmail = document.getElementById('loginEmail').value.trim();
        const loginPassword = document.getElementById('loginPassword').value;

        if (!loginEmail || !loginPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            console.log('[EMAIL] Tentative de connexion élève:', loginEmail);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });

            if (error) {
                console.error('[ERROR] Erreur auth:', error.message);
                alert('Email ou mot de passe incorrect');
                return;
            }

            console.log('[OK] Authentification réussie');
            console.log('[USER] UUID utilisateur:', data.user.id);

            // Store the Auth UUID globally (source of truth)
            window.currentUserAuthId = data.user.id;

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .single();

            if (userError) {
                console.error('[ERROR] Erreur récupération user:', userError);
                alert('Erreur lors de la récupération des données utilisateur');
                await supabase.auth.signOut();
                return;
            }

            // Vérifier le statut de l'utilisateur
            if (userData.status === 'revoked') {
                console.warn('[WARN] Compte révoqué');
                alert('Votre compte a été désactivé. Contactez un administrateur.');
                await supabase.auth.signOut();
                return;
            }

            if (userData.status === 'pending') {
                console.warn('[WARN] Compte en attente de validation');
                alert('Votre compte est en attente de validation par un coach. Vous recevrez une notification une fois approuvé.');
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = userData;
            window.currentUserUuid = userData && userData.uuid ? userData.uuid : window.currentUserAuthId;
            console.log('[OK] Connexion élève réussie:', userData.email);

            // Affichage de l'interface (version simple sans showMainApp)
            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            const userInfo = document.getElementById('userInfo');
            
            // Masquer l'écran d'authentification
            if (authScreen) authScreen.style.display = 'none';
            
            // Afficher l'interface élève
            if (mainApp) mainApp.style.display = 'flex';
            if (coachApp) coachApp.style.display = 'none';
            
            // Afficher l'email sous le logo
            if (userInfo) {
                userInfo.textContent = window.currentUser.email;
                console.log('[OK] Email affiché:', window.currentUser.email);
            }
            
            // ✅ CHARGER ET AFFICHER LES DONNÉES AUTOMATIQUEMENT APRÈS LA CONNEXION
            console.log('[AUTH] 🔄 Chargement automatique des données après connexion...');
            
            // Attendre un peu que l'UI soit prête, puis rafraîchir tout
            setTimeout(async () => {
                if (typeof window.refreshAllModules === 'function') {
                    console.log('[AUTH] ✅ Appel refreshAllModules()...');
                    await window.refreshAllModules();
                    console.log('[AUTH] ✅ Données chargées et affichées automatiquement');
                } else {
                    console.warn('[AUTH] ⚠️ refreshAllModules non disponible, chargement manuel...');
                    
                    // Fallback : charger manuellement
                    if (typeof window.loadAccounts === 'function') {
                        console.log('[OK] Appel window.loadAccounts()');
                        await window.loadAccounts();
                    }
                    
                    if (typeof window.loadTrades === 'function') {
                        console.log('[OK] Appel window.loadTrades()');
                        await window.loadTrades();
                    }
                    
                    if (typeof window.loadJournalEntries === 'function') {
                        console.log('[OK] Appel window.loadJournalEntries()');
                        await window.loadJournalEntries();
                    }
                }
            }, 500); // Attendre 500ms que l'UI soit prête

        } catch (err) {
            console.error('[ERROR] Erreur inattendue login:', err);
            alert('Erreur lors de la connexion');
        }
    }

    // ========================================
    // FONCTION : LOGIN COACH
    // ========================================
    async function coachLogin() {
        const coachEmail = document.getElementById('coachEmail').value.trim();
        const coachPassword = document.getElementById('coachCode').value;

        if (!coachEmail || !coachPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            console.log('[COACH] Tentative de connexion coach:', coachEmail);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: coachEmail,
                password: coachPassword
            });

            if (error) {
                console.error('[ERROR] Erreur auth coach:', error.message);
                alert('Email ou mot de passe incorrect');
                return;
            }

            console.log('[OK] Authentification coach réussie');
            console.log('[USER] UUID coach:', data.user.id);

            const { data: coachData, error: coachError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .eq('role', 'coach')
                .single();

            if (coachError || !coachData) {
                console.error('[ERROR] Utilisateur non coach ou erreur:', coachError);
                alert('Cet utilisateur n\'est pas un coach');
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = coachData;
            console.log('[OK] Connexion coach réussie:', coachData.email);

            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            
            if (authScreen) authScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'none';  // Masquer l'interface élève
            if (coachApp) coachApp.style.display = 'flex';  // Afficher l'interface COACH

            // Afficher le Dashboard Coach par défaut
            if (typeof showCoachSection === 'function') {
                showCoachSection('coachDashboard');
            }

            if (typeof loadCoachRegistrationsFromSupabase === 'function') {
                await loadCoachRegistrationsFromSupabase();
            }
            // ⚠️ NE PAS appeler refreshAllModules() pour le Coach !
            // refreshAllModules() est uniquement pour les élèves

        } catch (err) {
            console.error('[ERROR] Erreur inattendue coach login:', err);
            alert('Erreur lors de la connexion coach');
        }
    }

    // ========================================
    // FONCTION : REGISTER
    // ========================================
    async function register() {
        const registerEmail = document.getElementById('registerEmail').value.trim();
        const registerPassword = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!registerEmail || !registerPassword || !confirmPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        if (registerPassword !== confirmPassword) {
            alert('Les mots de passe ne correspondent pas');
            return;
        }

        if (registerPassword.length < 6) {
            alert('Le mot de passe doit contenir au moins 6 caractères');
            return;
        }

        try {
            console.log('[REGISTER] Tentative d\'inscription:', registerEmail);

            const { data, error } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword
            });

            if (error) {
                console.error('[ERROR] Erreur inscription:', error.message);
                alert('Erreur lors de l\'inscription: ' + error.message);
                return;
            }

            console.log('[OK] Inscription Supabase réussie');
            console.log('[USER] UUID:', data.user.id);

            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    uuid: data.user.id,
                    email: registerEmail,
                    role: 'student',
                    status: 'pending',
                    created_at: new Date().toISOString()
                });

            if (insertError) {
                console.error('[ERROR] Erreur insertion user:', insertError);
                alert('Erreur lors de la création du profil utilisateur');
                return;
            }

            console.log('[OK] Profil utilisateur créé dans la base');
            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');

            if (typeof showLoginForm === 'function') {
                showLoginForm();
            }

        } catch (err) {
            console.error('[ERROR] Erreur inattendue register:', err);
            alert('Erreur lors de l\'inscription');
        }
    }

    // ========================================
    // FONCTION : LOGOUT
    // ========================================
    async function logout() {
        try {
            console.log('[LOGOUT] Déconnexion...');
            
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('[ERROR] Erreur logout:', error);
                return;
            }

            window.currentUser = null;
            console.log('[OK] Déconnexion réussie');
            
            location.reload();

        } catch (err) {
            console.error('[ERROR] Erreur logout:', err);
        }
    }

    // ========================================
    // FONCTIONS UI
    // ========================================
    function showLoginForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const coachLoginForm = document.getElementById('coachLoginForm');
        
        if (loginForm) loginForm.style.display = 'block';
        if (registerForm) registerForm.style.display = 'none';
        if (coachLoginForm) coachLoginForm.style.display = 'none';
        
        console.log(' Formulaire login affiché');
    }

    function showRegisterForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const coachLoginForm = document.getElementById('coachLoginForm');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (coachLoginForm) coachLoginForm.style.display = 'none';
        
        console.log(' Formulaire register affiché');
    }

    function showCoachLogin() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const coachLoginForm = document.getElementById('coachLoginForm');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (coachLoginForm) coachLoginForm.style.display = 'block';
        
        console.log(' Formulaire coach login affiché');
    }

    // ========================================
    // EXPORT DES FONCTIONS
    // ========================================
    window.login = login;
    window.register = register;
    window.coachLogin = coachLogin;
    window.logout = logout;
    window.showLoginForm = showLoginForm;
    window.showRegisterForm = showRegisterForm;
    window.showCoachLogin = showCoachLogin;

    console.log('[OK] supabase-auth.js chargé - Fonctions exportées:', 
        'login, register, coachLogin, logout, showLoginForm, showRegisterForm, showCoachLogin');
})();
