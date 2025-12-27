// ========================================
// SUPABASE AUTH - VERSION IIFE (ISOLÉE)
// ========================================

(() => {
    console.log('🔗 Chargement supabase-auth.js...');

    // Récupérer le client depuis window.supabaseClient (pas window.supabase)
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('❌ ERREUR : window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    console.log('✅ Client Supabase récupéré depuis window.supabaseClient');

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
            console.log('📧 Tentative de connexion élève:', loginEmail);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: loginPassword
            });

            if (error) {
                console.error('❌ Erreur auth:', error.message);
                alert('Email ou mot de passe incorrect');
                return;
            }

            console.log('✅ Authentification réussie');
            console.log('👤 UUID utilisateur:', data.user.id);

            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .single();

            if (userError) {
                console.error('❌ Erreur récupération user:', userError);
                alert('Erreur lors de la récupération des données utilisateur');
                await supabase.auth.signOut();
                return;
            }

            // Vérifier le statut de l'utilisateur
            if (userData.status === 'revoked') {
                console.warn('⚠️ Compte révoqué');
                alert('Votre compte a été désactivé. Contactez un administrateur.');
                await supabase.auth.signOut();
                return;
            }

            if (userData.status === 'pending') {
                console.warn('⚠️ Compte en attente de validation');
                alert('Votre compte est en attente de validation par un coach. Vous recevrez une notification une fois approuvé.');
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = userData;
            console.log('✅ Connexion élève réussie:', userData.email);

            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            
            if (authScreen) authScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'flex';  // Afficher l'interface élève
            if (coachApp) coachApp.style.display = 'none';  // Masquer l'interface coach

            if (typeof loadUserDataFromSupabase === 'function') {
                await loadUserDataFromSupabase(userData.uuid);
            }
            if (typeof refreshAllModules === 'function') {
                refreshAllModules();
            }

        } catch (err) {
            console.error('❌ Erreur inattendue login:', err);
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
            console.log('🎓 Tentative de connexion coach:', coachEmail);

            const { data, error } = await supabase.auth.signInWithPassword({
                email: coachEmail,
                password: coachPassword
            });

            if (error) {
                console.error('❌ Erreur auth coach:', error.message);
                alert('Email ou mot de passe incorrect');
                return;
            }

            console.log('✅ Authentification coach réussie');
            console.log('👤 UUID coach:', data.user.id);

            const { data: coachData, error: coachError } = await supabase
                .from('users')
                .select('*')
                .eq('uuid', data.user.id)
                .eq('role', 'coach')
                .single();

            if (coachError || !coachData) {
                console.error('❌ Utilisateur non coach ou erreur:', coachError);
                alert('Cet utilisateur n\'est pas un coach');
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = coachData;
            console.log('✅ Connexion coach réussie:', coachData.email);

            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            
            if (authScreen) authScreen.style.display = 'none';
            if (mainApp) mainApp.style.display = 'flex';  // Afficher l'interface élève
            if (coachApp) coachApp.style.display = 'none';  // Masquer l'interface coach

            if (typeof loadCoachRegistrationsFromSupabase === 'function') {
                await loadCoachRegistrationsFromSupabase();
            }
            if (typeof refreshAllModules === 'function') {
                refreshAllModules();
            }

        } catch (err) {
            console.error('❌ Erreur inattendue coach login:', err);
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
            console.log('📝 Tentative d\'inscription:', registerEmail);

            const { data, error } = await supabase.auth.signUp({
                email: registerEmail,
                password: registerPassword
            });

            if (error) {
                console.error('❌ Erreur inscription:', error.message);
                alert('Erreur lors de l\'inscription: ' + error.message);
                return;
            }

            console.log('✅ Inscription Supabase réussie');
            console.log('👤 UUID:', data.user.id);

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
                console.error('❌ Erreur insertion user:', insertError);
                alert('Erreur lors de la création du profil utilisateur');
                return;
            }

            console.log('✅ Profil utilisateur créé dans la base');
            alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');

            if (typeof showLoginForm === 'function') {
                showLoginForm();
            }

        } catch (err) {
            console.error('❌ Erreur inattendue register:', err);
            alert('Erreur lors de l\'inscription');
        }
    }

    // ========================================
    // FONCTION : LOGOUT
    // ========================================
    async function logout() {
        try {
            console.log('🔒 Déconnexion...');
            
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('❌ Erreur logout:', error);
                return;
            }

            window.currentUser = null;
            console.log('✅ Déconnexion réussie');
            
            location.reload();

        } catch (err) {
            console.error('❌ Erreur logout:', err);
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
        
        console.log('📋 Formulaire login affiché');
    }

    function showRegisterForm() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const coachLoginForm = document.getElementById('coachLoginForm');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'block';
        if (coachLoginForm) coachLoginForm.style.display = 'none';
        
        console.log('📋 Formulaire register affiché');
    }

    function showCoachLogin() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const coachLoginForm = document.getElementById('coachLoginForm');
        
        if (loginForm) loginForm.style.display = 'none';
        if (registerForm) registerForm.style.display = 'none';
        if (coachLoginForm) coachLoginForm.style.display = 'block';
        
        console.log('📋 Formulaire coach login affiché');
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

    console.log('✅ supabase-auth.js chargé - Fonctions exportées:', 
        'login, register, coachLogin, logout, showLoginForm, showRegisterForm, showCoachLogin');
})();
