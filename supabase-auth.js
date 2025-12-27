// ========================================
// SUPABASE AUTH - VERSION IIFE (ISOLÉE)
// ========================================

(() => {
    console.log('[LOAD] Chargement supabase-auth.js...');

    // Récupérer le client depuis window.supabaseClient (pas window.supabase)
    const supabase = window.supabaseClient; // Référence locale, pas redéclaration
    
    if (!supabase) {
        console.error('[ERROR] ERREUR : window.supabaseClient manquant (config non chargée ?)');
        return;
    }

    console.log('[OK] Client Supabase récupéré depuis window.supabaseClient');

    // ========================================
    // FONCTION : LOGIN ÉLÈVE
    // ========================================
    async function login() {
        const loginEmail = document.getElementById('loginEmail').value.trim();
        const loginPassword = document.getElementById('loginPassword').value.trim();

        if (!loginEmail || !loginPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
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

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .single();

            if (userError) {
                console.error('[ERROR] Erreur récupération user:', userError);
                alert('Erreur lors de la récupération des données utilisateur');
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

            // Charger les comptes et trades
            if (typeof window.loadAccounts === 'function') {
                console.log('[OK] Appel window.loadAccounts()');
                window.loadAccounts();
            }

            if (typeof window.loadTrades === 'function') {
                console.log('[OK] Appel window.loadTrades()');
                window.loadTrades();
            }

        } catch (err) {
            console.error('[ERROR] Erreur login:', err);
            alert('Une erreur est survenue lors de la connexion');
        }
    }

    // ========================================
    // FONCTION : LOGIN COACH
    // ========================================
    async function coachLogin() {
        const coachEmail = document.getElementById('coachEmail').value.trim();
        const coachPassword = document.getElementById('coachPassword').value.trim();

        if (!coachEmail || !coachPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: coachEmail,
                password: coachPassword
            });

            if (error) {
                console.error('[ERROR] Erreur auth coach:', error.message);
                alert('Email ou mot de passe incorrect');
                return;
            }

            const { data: coachData, error: coachError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .single();

            if (coachError || coachData.role !== 'coach') {
                console.error('[ERROR] Pas un compte coach');
                alert('Ce compte n\'est pas un compte coach');
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = coachData;
            console.log('[OK] Connexion coach réussie:', coachData.email);

            // Afficher l'interface coach
            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');

            if (authScreen) authScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'none';
            if (coachApp) coachApp.style.display = 'block';

            // Charger le dashboard coach
            if (typeof window.loadCoachDashboard === 'function') {
                window.loadCoachDashboard();
            }

        } catch (err) {
            console.error('[ERROR] Erreur login coach:', err);
            alert('Une erreur est survenue lors de la connexion');
        }
    }

    // ========================================
    // FONCTION : INSCRIPTION
    // ========================================
    async function register() {
        const registerName = document.getElementById('registerName').value.trim();
        const registerEmail = document.getElementById('registerEmail').value.trim();
        const registerPassword = document.getElementById('registerPassword').value.trim();

        if (!registerName || !registerEmail || !registerPassword) {
            alert('Veuillez remplir tous les champs');
            return;
        }

        try {
            // Créer l'utilisateur dans auth.users
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword
            });

            if (authError) {
                console.error('[ERROR] Erreur création auth:', authError);
                alert('Erreur lors de la création du compte');
                return;
            }

            // Créer l'entrée dans la table users
            const { error: userError } = await supabase
                .from('users')
                .insert([{
                    uuid: authData.user.id,
                    email: registerEmail,
                    name: registerName,
                    role: 'student',
                    status: 'pending'
                }]);

            if (userError) {
                console.error('[ERROR] Erreur création user:', userError);
                alert('Erreur lors de la création du profil');
                return;
            }

            console.log('[OK] Inscription réussie');
            alert('Inscription réussie ! Votre compte est en attente de validation par un coach.');
            
            // Retour à l'écran de connexion
            showLoginForm();

        } catch (err) {
            console.error('[ERROR] Erreur inscription:', err);
            alert('Une erreur est survenue lors de l\'inscription');
        }
    }

    // ========================================
    // FONCTION : DÉCONNEXION
    // ========================================
    async function logout() {
        try {
            await supabase.auth.signOut();
            window.currentUser = null;
            
            // Retour à l'écran de connexion
            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');

            if (authScreen) authScreen.style.display = 'flex';
            if (mainApp) mainApp.style.display = 'none';
            if (coachApp) coachApp.style.display = 'none';

            console.log('[OK] Déconnexion réussie');

        } catch (err) {
            console.error('[ERROR] Erreur déconnexion:', err);
        }
    }

    // ========================================
    // FONCTIONS D'AFFICHAGE
    // ========================================
    function showLoginForm() {
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('coachLoginForm').style.display = 'none';
    }

    function showRegisterForm() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('coachLoginForm').style.display = 'none';
    }

    function showCoachLogin() {
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('coachLoginForm').style.display = 'block';
    }

    // ========================================
    // EXPOSER LES FONCTIONS GLOBALEMENT
    // ========================================
    window.login = login;
    window.coachLogin = coachLogin;
    window.register = register;
    window.logout = logout;
    window.showLoginForm = showLoginForm;
    window.showRegisterForm = showRegisterForm;
    window.showCoachLogin = showCoachLogin;

    console.log('[OK] Fonctions auth exposées globalement');
})();
