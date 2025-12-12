/**
 * =================================================================
 * JOURNAL TRADER 360 - AUTHENTICATION MODULE
 * Version: DEFINITIVE 1.0
 * Convention: TOUJOURS utiliser UUID (jamais ID)
 * =================================================================
 */

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
        console.log('🔐 Tentative de connexion:', email);

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
            console.error('❌ Utilisateur introuvable dans public.users avec UUID:', data.user.id);
            showError('loginError', 'Votre profil est incomplet. Contactez le support.');
            await supabase.auth.signOut();
            return;
        }

        console.log('✅ Utilisateur trouvé:', userData.email, 'Status:', userData.status);

        // 3. Vérifier le statut
        if (userData.status === 'pending') {
            showError('loginError', '⏳ Votre compte est en attente de validation par le coach.');
            await supabase.auth.signOut();
            return;
        }
        
        if (userData.status === 'revoked') {
            showError('loginError', '⛔ Votre accès a été suspendu. Contactez votre coach.');
            await supabase.auth.signOut();
            return;
        }

        // 4. Mettre à jour last_login
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('uuid', userData.uuid);

        // 5. Connexion réussie
        currentUser = userData;
        console.log('✅ Connexion élève réussie:', userData.email);
        
        // Charger les données et afficher l'app
        await loadUserDataFromSupabase(currentUser.uuid);
        showMainApp();

    } catch (err) {
        console.error('❌ Erreur critique login:', err);
        showError('loginError', 'Une erreur est survenue. Réessayez.');
    }
}

// ===== FONCTION LOGIN COACH =====
async function coachLogin() {
    const email = document.getElementById('coachEmail').value.trim();
    const code = document.getElementById('coachCode').value;

    if (!email || !code) {
        showError('coachError', 'Veuillez saisir votre email et code');
        return;
    }

    try {
        console.log('👨‍🏫 Tentative connexion coach:', email);

        // Authentification avec le code comme mot de passe
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: code
        });

        if (error) {
            console.error('❌ Erreur coach auth:', error);
            showError('coachError', 'Email ou code incorrect');
            return;
        }

        // Vérifier que c'est bien un coach
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('uuid', data.user.id)
            .single();

        if (userError || !userData || userData.role !== 'coach') {
            console.error('❌ Pas un coach:', userError);
            showError('coachError', 'Accès coach non autorisé');
            await supabase.auth.signOut();
            return;
        }

        // Connexion coach réussie
        currentUser = userData;
        console.log('✅ Connexion coach réussie:', userData.email);
        showMainApp();

    } catch (err) {
        console.error('❌ Erreur coach login:', err);
        showError('coachError', 'Une erreur est survenue');
    }
}

// ===== FONCTION INSCRIPTION =====
async function register() {
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Validations
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
        console.log('📝 Inscription:', email);

        // 1. Créer l'utilisateur dans Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: email,
            password: password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    role: 'student'
                }
            }
        });

        if (authError) {
            console.error('❌ Erreur signup:', authError);
            if (authError.message.includes('already registered')) {
                showError('registerError', 'Un compte existe déjà avec cet email');
            } else if (authError.message.includes('For security purposes')) {
                showError('registerError', 'Trop de tentatives. Attendez 60 secondes.');
            } else {
                showError('registerError', 'Erreur: ' + authError.message);
            }
            return;
        }

        console.log('✅ Auth créé, UUID:', authData.user.id);

        // 2. Créer l'entrée dans public.users avec status='pending'
        const { data: userData, error: userError } = await supabase
            .from('users')
            .insert([{
                uuid: authData.user.id,
                email: email,
                role: 'student',
                status: 'pending',
                name: email.split('@')[0],
                created_at: new Date().toISOString()
            }])
            .select()
            .single();

        if (userError) {
            console.error('❌ Erreur création user dans table:', userError);
            showError('registerError', 'Erreur lors de la création du profil');
            return;
        }

        console.log('✅ Inscription complète:', userData);

        // 3. Déconnecter immédiatement
        await supabase.auth.signOut();

        // 4. Message de succès
        alert('✅ Inscription réussie !\n\nVotre demande a été envoyée au coach.\nVous recevrez un accès dès validation.');

        // Retour au formulaire de connexion
        showLoginForm();

    } catch (err) {
        console.error('❌ Erreur register:', err);
        showError('registerError', 'Une erreur est survenue');
    }
}

// ===== FONCTION CHARGEMENT DONNÉES UTILISATEUR =====
async function loadUserDataFromSupabase(userUuid) {
    try {
        console.log('📊 Chargement données pour UUID:', userUuid);

        // Charger les trades
        const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', userUuid)
            .order('created_at', { ascending: false });

        if (!tradesError && trades) {
            allTrades = trades;
            console.log('✅ Trades chargés:', trades.length);
        }

        // Charger les accounts
        const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userUuid);

        if (!accountsError && accounts) {
            tradingAccounts = accounts;
            console.log('✅ Accounts chargés:', accounts.length);
        }

        // Charger les journal entries
        const { data: entries, error: entriesError } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userUuid)
            .order('created_at', { ascending: false });

        if (!entriesError && entries) {
            journalEntries = entries;
            console.log('✅ Journal entries chargés:', entries.length);
        }

        // Charger les account costs
        const { data: costs, error: costsError } = await supabase
            .from('account_costs')
            .select('*')
            .eq('user_id', userUuid);

        if (!costsError && costs) {
            accountCosts = costs;
            console.log('✅ Account costs chargés:', costs.length);
        }

        // Charger les payouts
        const { data: payouts, error: payoutsError } = await supabase
            .from('payouts')
            .select('*')
            .eq('user_id', userUuid);

        if (!payoutsError && payouts) {
            userPayouts = payouts;
            console.log('✅ Payouts chargés:', payouts.length);
        }

        console.log('✅ Toutes les données chargées depuis Supabase');

    } catch (err) {
        console.error('❌ Erreur chargement données:', err);
    }
}

// ===== FONCTION LOGOUT =====
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    window.location.reload();
}

// ===== FONCTIONS HELPERS UI =====
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('hidden');
        setTimeout(() => {
            errorElement.classList.add('hidden');
        }, 5000);
    }
}

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

console.log('✅ Auth Module chargé (VERSION DEFINITIVE)');
