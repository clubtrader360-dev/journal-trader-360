// ========================================
// SUPABASE AUTHENTICATION - VERSION FINALE CORRIGÉE
// ========================================

console.log('🔗 Chargement supabase-auth.js...');

// Récupérer le client Supabase depuis window
const supabase = window.supabase;

if (!supabase) {
    console.error('❌ ERREUR : window.supabase n\'est pas défini !');
    console.error('Vérifiez que supabase-config.js est chargé AVANT supabase-auth.js');
    throw new Error('window.supabase manquant');
}

console.log('✅ Supabase client récupéré depuis window.supabase');

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

        // Authentification Supabase
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

        // Récupérer les données utilisateur depuis la table users
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

        // Stocker l'utilisateur en mémoire
        window.currentUser = userData;
        console.log('✅ Connexion élève réussie:', userData.email);

        // ✅ FIX : Fermer authScreen (pas authModal)
        const authScreen = document.getElementById('authScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';

        await loadUserDataFromSupabase(userData.uuid);
        refreshAllModules();

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
    const coachPassword = document.getElementById('coachCode').value; // ✅ FIX : coachCode (pas coachPassword)

    if (!coachEmail || !coachPassword) {
        alert('Veuillez remplir tous les champs');
        return;
    }

    try {
        console.log('🎓 Tentative de connexion coach:', coachEmail);

        // Authentification Supabase
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

        // Récupérer les données coach
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

        // Stocker le coach en mémoire
        window.currentUser = coachData;
        console.log('✅ Connexion coach réussie:', coachData.email);

        // ✅ FIX : Fermer authScreen (pas authModal)
        const authScreen = document.getElementById('authScreen');
        const mainApp = document.getElementById('mainApp');
        
        if (authScreen) authScreen.style.display = 'none';
        if (mainApp) mainApp.style.display = 'flex';

        await loadCoachStudents(coachData.uuid);
        refreshAllModules();

    } catch (err) {
        console.error('❌ Erreur inattendue coach login:', err);
        alert('Erreur lors de la connexion coach');
    }
}

// ========================================
// FONCTION : REGISTER (INSCRIPTION)
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

        // Créer l'utilisateur dans Supabase Auth
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

        // Insérer dans la table users
        const { error: insertError } = await supabase
            .from('users')
            .insert({
                uuid: data.user.id,
                email: registerEmail,
                role: 'student',
                created_at: new Date().toISOString()
            });

        if (insertError) {
            console.error('❌ Erreur insertion user:', insertError);
            alert('Erreur lors de la création du profil utilisateur');
            return;
        }

        console.log('✅ Profil utilisateur créé dans la base');
        alert('Inscription réussie ! Vous pouvez maintenant vous connecter.');

        // Retourner à la page de login
        showLoginForm();

    } catch (err) {
        console.error('❌ Erreur inattendue register:', err);
        alert('Erreur lors de l\'inscription');
    }
}

// ========================================
// FONCTION : LOGOUT (DÉCONNEXION)
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
        
        // Rediriger ou recharger
        location.reload();

    } catch (err) {
        console.error('❌ Erreur logout:', err);
    }
}

// ========================================
// FONCTIONS UI : NAVIGATION ENTRE FORMULAIRES
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
// EXPORT DES FONCTIONS VERS WINDOW
// ========================================
window.login = login;
window.register = register;
window.coachLogin = coachLogin;
window.logout = logout;

// ✅ FIX : Export des fonctions UI
window.showLoginForm = showLoginForm;
window.showRegisterForm = showRegisterForm;
window.showCoachLogin = showCoachLogin;

console.log('✅ supabase-auth.js chargé - Fonctions exportées: login, register, coachLogin, logout, showLoginForm, showRegisterForm, showCoachLogin');
