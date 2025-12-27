/**
 * =================================================================
 * JOURNAL TRADER 360 - AUTHENTICATION MODULE
 * Version: DEFINITIVE 2.0 - FIXED
 * Convention: TOUJOURS utiliser UUID (jamais ID)
 * =================================================================
 */

console.log('🔗 Chargement supabase-auth.js...');

// ===== VÉRIFICATION SUPABASE =====
if (!window.supabase) {
    console.error('❌ ERREUR CRITIQUE: window.supabase non défini !');
    console.error('❌ Assurez-vous que supabase-config.js est chargé AVANT supabase-auth.js');
    throw new Error('Supabase client non initialisé');
}

const supabase = window.supabase;
console.log('✅ Supabase client récupéré depuis window.supabase');

// ===== FONCTION LOGIN ÉLÈVE =====
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    // Validation des champs
    if (!email || !password) {
        showError('loginError', 'Veuillez saisir votre email et mot de passe');
        return;
    }

    try {
        console.log('🔐 Tentative de connexion élève:', email);

        // 1. Authentification Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('❌ Erreur Supabase Auth:', error);
            showError('loginError', 'Email ou mot de passe incorrect');
            return;
        }

        console.log('✅ Authentification réussie, UUID:', data.user.id);

        // 2. Récupérer les données utilisateur depuis public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('uuid', data.user.id)
            .single();

        if (userError) {
            console.error('❌ Erreur récupération user:', userError);
            showError('loginError', 'Erreur lors de la récupération des données utilisateur');
            await supabase.auth.signOut();
            return;
        }

        if (!userData) {
            console.error('❌ Utilisateur non trouvé dans public.users');
            showError('loginError', 'Utilisateur non trouvé');
            await supabase.auth.signOut();
            return;
        }

        // 3. Vérifier que c'est un élève
        if (userData.role !== 'student') {
            console.error('❌ Rôle incorrect:', userData.role);
            showError('loginError', 'Accès réservé aux élèves');
            await supabase.auth.signOut();
            return;
        }

        if (userData.status !== 'active') {
            console.error('❌ Compte inactif:', userData.status);
            showError('loginError', 'Votre compte est inactif. Contactez votre coach.');
            await supabase.auth.signOut();
            return;
        }

        console.log('✅ Connexion élève réussie:', userData.email);

        // 4. Charger les données depuis Supabase
        await loadUserDataFromSupabase(userData.uuid);

        // 5. Définir currentUser et afficher l'app
        currentUser = userData;
        showMainApp();

    } catch (err) {
        console.error('❌ ERREUR CRITIQUE login:', err);
        showError('loginError', 'Une erreur critique est survenue');
    }
}

// ===== FONCTION LOGIN COACH =====
async function coachLogin() {
    const email = document.getElementById('coachEmail').value.trim();
    const code = document.getElementById('coachCode').value.trim();

    if (!email || !code) {
        showError('coachError', 'Veuillez saisir votre email et code');
        return;
    }

    try {
        console.log('🔐 Tentative de connexion coach:', email);

        // 1. Authentification Supabase (code = password)
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: code
        });

        if (error) {
            console.error('❌ Erreur Supabase Auth Coach:', error);
            showError('coachError', 'Email ou code incorrect');
            return;
        }

        console.log('✅ Authentification coach réussie, UUID:', data.user.id);

        // 2. Récupérer les données coach depuis public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('uuid', data.user.id)
            .single();

        if (userError || !userData) {
            console.error('❌ Erreur récupération coach:', userError);
            showError('coachError', 'Erreur lors de la récupération des données coach');
            await supabase.auth.signOut();
            return;
        }

        // 3. Vérifier que c'est un coach
        if (userData.role !== 'coach') {
            console.error('❌ Rôle incorrect:', userData.role);
            showError('coachError', 'Accès réservé aux coachs');
            await supabase.auth.signOut();
            return;
        }

        console.log('✅ Connexion coach réussie:', userData.email);

        // 4. Charger tous les élèves
        await loadAllUsers();

        // 5. Définir currentUser et afficher le dashboard coach
        currentUser = userData;
        showCoachDashboard();

    } catch (err) {
        console.error('❌ ERREUR CRITIQUE coachLogin:', err);
        showError('coachError', 'Une erreur critique est survenue');
    }
}

// ===== FONCTION REGISTER =====
async function register() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validation des champs
    if (!email || !password || !confirmPassword) {
        showError('registerError', 'Veuillez remplir tous les champs');
        return;
    }

    if (password !== confirmPassword) {
        showError('registerError', 'Les mots de passe ne correspondent pas');
        return;
    }

    if (password.length < 6) {
        showError('registerError', 'Le mot de passe doit contenir au moins 6 caractères');
        return;
    }

    try {
        console.log('📝 Tentative d\'inscription:', email);

        // 1. Créer le compte Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password
        });

        if (authError) {
            console.error('❌ Erreur inscription Supabase:', authError);
            showError('registerError', 'Erreur lors de l\'inscription: ' + authError.message);
            return;
        }

        console.log('✅ Compte Supabase créé, UUID:', authData.user.id);

        // 2. Créer l'entrée dans public.users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                uuid: authData.user.id,
                email: email,
                role: 'student',
                status: 'active',
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (userError) {
            console.error('❌ Erreur création user:', userError);
            showError('registerError', 'Erreur lors de la création du profil');
            // Supprimer le compte Auth si échec
            await supabase.auth.signOut();
            return;
        }

        console.log('✅ Profil utilisateur créé:', userData);

        // 3. Connexion automatique
        currentUser = userData;
        showMainApp();

        console.log('🎉 Inscription et connexion réussies !');

    } catch (err) {
        console.error('❌ ERREUR CRITIQUE register:', err);
        showError('registerError', 'Une erreur critique est survenue');
    }
}

// ===== FONCTION LOGOUT =====
async function logout() {
    try {
        console.log('🚪 Déconnexion...');
        
        await supabase.auth.signOut();
        
        currentUser = null;
        trades = [];
        journalEntries = [];
        accounts = [];
        
        showLoginForm();
        
        console.log('✅ Déconnexion réussie');
    } catch (err) {
        console.error('❌ Erreur logout:', err);
    }
}

// ===== EXPORT DES FONCTIONS =====
window.login = login;
window.register = register;
window.coachLogin = coachLogin;
window.logout = logout;

console.log('✅ supabase-auth.js chargé - Fonctions exportées: login, register, coachLogin, logout');
