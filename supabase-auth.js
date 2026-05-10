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
            
            // ✅ NETTOYAGE COMPLET de l'interface Coach
            if (coachApp) {
                coachApp.style.display = 'none';
                coachApp.style.visibility = 'hidden';
                coachApp.style.opacity = '0';
            }
            
            // ✅ RÉINITIALISATION FORCÉE de l'interface Élève
            if (mainApp) {
                mainApp.style.display = 'flex';
                mainApp.style.visibility = 'visible';
                mainApp.style.opacity = '1';
                console.log('[DEBUG] mainApp réinitialisé:', {
                    display: mainApp.style.display,
                    visibility: mainApp.style.visibility,
                    opacity: mainApp.style.opacity
                });
            }
            
            // Afficher le nom (ou email si pas de nom) sous le logo
            if (userInfo) {
                const displayName = window.currentUser.name || window.currentUser.email;
                userInfo.textContent = displayName;
                console.log('[OK] Nom affiché:', displayName);
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
            const errorElement = document.getElementById('coachError');
            if (errorElement) {
                errorElement.textContent = 'Veuillez remplir tous les champs';
                errorElement.classList.remove('hidden');
            }
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
                const errorElement = document.getElementById('coachError');
                if (errorElement) {
                    errorElement.textContent = 'Email ou mot de passe incorrect';
                    errorElement.classList.remove('hidden');
                }
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
                const errorElement = document.getElementById('coachError');
                if (errorElement) {
                    errorElement.textContent = 'Cet utilisateur n\'est pas un coach';
                    errorElement.classList.remove('hidden');
                }
                await supabase.auth.signOut();
                return;
            }

            window.currentUser = coachData;
            console.log('[COACH LOGIN] ✅ Authentification réussie:', coachData.email);

            // ========================================
            // AFFICHAGE BRUTAL DE L'INTERFACE COACH
            // ========================================
            const authScreen = document.getElementById('authScreen');
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            
            console.log('[COACH LOGIN] 📋 État des éléments DOM:');
            console.log('  - authScreen:', authScreen ? 'TROUVÉ' : '❌ INTROUVABLE');
            console.log('  - mainApp:', mainApp ? 'TROUVÉ' : '❌ INTROUVABLE');
            console.log('  - coachApp:', coachApp ? 'TROUVÉ' : '❌ INTROUVABLE');
            
            if (!coachApp) {
                alert('❌ ERREUR CRITIQUE: coachApp introuvable dans le DOM!\n\nOuvrez la console (F12) pour plus de détails.');
                console.error('[COACH LOGIN] ❌ ERREUR FATALE: #coachApp n\'existe pas dans le HTML!');
                return;
            }
            
            // ÉTAPE 1: Masquer complètement authScreen et mainApp
            console.log('[COACH LOGIN] 🔒 Masquage authScreen et mainApp...');
            if (authScreen) {
                authScreen.style.display = 'none';
                authScreen.style.visibility = 'hidden';
                authScreen.style.opacity = '0';
            }
            if (mainApp) {
                mainApp.style.display = 'none';
                mainApp.style.visibility = 'hidden';
                mainApp.style.opacity = '0';
            }
            console.log('[COACH LOGIN] ✅ authScreen et mainApp masqués');
            
            // ÉTAPE 2: FORCER l'affichage de coachApp de manière BRUTALE
            console.log('[COACH LOGIN] 🎯 Affichage FORCÉ de coachApp...');
            coachApp.style.display = 'flex';
            coachApp.style.visibility = 'visible';
            coachApp.style.opacity = '1';
            coachApp.style.position = 'relative';
            coachApp.style.width = '100%';
            coachApp.style.height = '100vh';
            coachApp.style.zIndex = '9999';
            coachApp.classList.remove('hidden');
            
            // Vérification immédiate
            const computedStyle = window.getComputedStyle(coachApp);
            console.log('[COACH LOGIN] 📊 Styles calculés de coachApp:');
            console.log('  - display:', computedStyle.display);
            console.log('  - visibility:', computedStyle.visibility);
            console.log('  - opacity:', computedStyle.opacity);
            console.log('  - width:', computedStyle.width);
            console.log('  - height:', computedStyle.height);
            
            if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') {
                console.error('[COACH LOGIN] ⚠️ ATTENTION: coachApp n\'est TOUJOURS PAS VISIBLE malgré les styles forcés!');
                alert('⚠️ L\'interface coach ne s\'affiche pas correctement.\n\nOuvrez la console (F12) et partagez les logs avec le support.');
            } else {
                console.log('[COACH LOGIN] ✅ coachApp est maintenant VISIBLE');
            }
            
            // ÉTAPE 3: Afficher le contenu du dashboard
            console.log('[COACH LOGIN] 📂 Chargement du contenu dashboard...');
            
            // Attendre que les fonctions soient disponibles
            let attempts = 0;
            const maxAttempts = 30; // 15 secondes max
            
            const checkAndLoad = setInterval(async () => {
                attempts++;
                
                const showSection = window.showCoachSection;
                const loadDashboard = window.loadCoachDashboard;
                
                console.log(`[COACH LOGIN] ⏳ Tentative ${attempts}/${maxAttempts}:`);
                console.log('  - showCoachSection:', typeof showSection === 'function' ? '✅' : '❌');
                console.log('  - loadCoachDashboard:', typeof loadDashboard === 'function' ? '✅' : '❌');
                
                if (typeof showSection === 'function' && typeof loadDashboard === 'function') {
                    clearInterval(checkAndLoad);
                    console.log('[COACH LOGIN] ✅ Toutes les fonctions sont chargées!');
                    
                    try {
                        console.log('[COACH LOGIN] 🚀 Appel de showCoachSection("coachDashboard")...');
                        await showSection('coachDashboard');
                        console.log('[COACH LOGIN] ✅ Dashboard affiché avec succès!');
                        
                        // Charger les inscriptions
                        if (typeof loadCoachRegistrationsFromSupabase === 'function') {
                            console.log('[COACH LOGIN] 📝 Chargement des inscriptions...');
                            await loadCoachRegistrationsFromSupabase();
                        }
                        
                        console.log('[COACH LOGIN] 🎉 CONNEXION COACH TERMINÉE AVEC SUCCÈS!');
                        
                    } catch (err) {
                        console.error('[COACH LOGIN] ❌ Erreur lors du chargement du dashboard:', err);
                        console.error('[COACH LOGIN] Stack:', err.stack);
                        alert('❌ Erreur lors du chargement du dashboard.\n\nOuvrez la console (F12) pour voir les détails.');
                    }
                    
                } else if (attempts >= maxAttempts) {
                    clearInterval(checkAndLoad);
                    console.error('[COACH LOGIN] ❌ TIMEOUT: Les scripts ne se sont pas chargés après 15 secondes!');
                    console.error('[COACH LOGIN] État final:');
                    console.error('  - showCoachSection:', typeof showSection);
                    console.error('  - loadCoachDashboard:', typeof loadDashboard);
                    
                    alert('❌ TIMEOUT: Les scripts du coach n\'ont pas pu se charger.\n\nVeuillez actualiser la page (F5) et réessayer.\n\nSi le problème persiste, partagez les logs de la console (F12).');
                }
            }, 500)

        } catch (err) {
            console.error('[ERROR] Erreur inattendue coach login:', err);
            const errorElement = document.getElementById('coachError');
            if (errorElement) {
                errorElement.textContent = 'Erreur lors de la connexion coach';
                errorElement.classList.remove('hidden');
            }
        }
    }

    // ========================================
    // FONCTION : REGISTER
    // ========================================
    async function register() {
        const registerName = document.getElementById('registerName').value.trim();
        const registerEmail = document.getElementById('registerEmail').value.trim();
        const registerPassword = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!registerName || !registerEmail || !registerPassword || !confirmPassword) {
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

            // Récupérer l'UUID même si il y a une erreur (l'utilisateur peut être créé quand même)
            let userUuid = data?.user?.id;

            if (error) {
                // Ignorer l'erreur "Database error saving new user" car on crée l'utilisateur manuellement après
                if (error.message.includes('Database error saving new user') || error.message.includes('User already registered')) {
                    console.warn('[WARN] Erreur Supabase Auth ignorée (on crée l\'utilisateur manuellement):', error.message);
                    
                    // L'utilisateur est créé malgré l'erreur, récupérer la session
                    const { data: sessionData } = await supabase.auth.getSession();
                    if (sessionData?.session?.user?.id) {
                        userUuid = sessionData.session.user.id;
                        console.log('[INFO] UUID récupéré depuis la session:', userUuid);
                    }
                } else if (!error.message.includes('email') && !error.message.includes('password')) {
                    // Ne pas afficher l'alerte si l'erreur est liée à l'email ou au mot de passe
                    console.warn('[WARN] Erreur inscription (ignorée):', error.message);
                } else {
                    console.error('[ERROR] Erreur inscription:', error.message);
                    alert('Erreur lors de l\'inscription: ' + error.message);
                    return;
                }
            }

            // Vérifier que l'UUID existe
            if (!userUuid) {
                console.error('[ERROR] UUID utilisateur manquant après inscription');
                alert('Erreur lors de l\'inscription: impossible de récupérer l\'identifiant utilisateur');
                return;
            }

            console.log('[OK] Inscription Supabase réussie');
            console.log('[USER] UUID:', userUuid);

            const { error: insertError } = await supabase
                .from('users')
                .insert({
                    uuid: userUuid,
                    name: registerName,
                    email: registerEmail,
                    role: 'student',
                    status: 'pending'
                });

            if (insertError) {
                console.error('[ERROR] Erreur insertion user:', insertError);
                console.error('[ERROR] Code:', insertError.code);
                console.error('[ERROR] Message:', insertError.message);
                console.error('[ERROR] Details:', insertError.details);
                
                // Si l'erreur est "duplicate key", c'est que l'utilisateur existe déjà
                if (insertError.code === '23505' || insertError.message.includes('duplicate')) {
                    console.log('[INFO] L\'utilisateur existe déjà dans users, connexion automatique...');
                    alert('Inscription réussie ! Connexion en cours...');
                    
                    // Remplir les champs de connexion et appeler login()
                    document.getElementById('loginEmail').value = registerEmail;
                    document.getElementById('loginPassword').value = registerPassword;
                    await login();
                    return;
                }
                
                alert('Erreur lors de la création du profil utilisateur: ' + insertError.message);
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

            // ✅ Nettoyage COMPLET avant reload
            window.currentUser = null;
            
            // Masquer toutes les interfaces
            const mainApp = document.getElementById('mainApp');
            const coachApp = document.getElementById('coachApp');
            const authScreen = document.getElementById('authScreen');
            
            if (mainApp) mainApp.style.display = 'none';
            if (coachApp) coachApp.style.display = 'none';
            if (authScreen) authScreen.style.display = 'flex';
            
            console.log('[OK] Déconnexion réussie - Nettoyage effectué');
            
            // ✅ Reload avec cache forcé
            location.reload(true);  // true = forcer le rechargement depuis le serveur

        } catch (err) {
            console.error('[ERROR] Erreur logout:', err);
            // En cas d'erreur, recharger quand même
            location.reload(true);
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
