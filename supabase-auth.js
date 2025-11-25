// Remplacer la fonction login() existante
async function login() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('loginError', 'Veuillez saisir votre email et mot de passe');
        return;
    }

    try {
        // Connexion avec Supabase
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        });

        if (error) {
            console.error('Erreur login Supabase:', error);
            showError('loginError', 'Email ou mot de passe incorrect');
            return;
        }

        // Récupérer les données utilisateur depuis la table users
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError) {
            console.error('Erreur récupération user:', userError);
            showError('loginError', 'Erreur lors de la récupération des données');
            return;
        }

        // Vérifier le statut
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

        // Mettre à jour lastLogin
        await supabase
            .from('users')
            .update({ last_login: new Date().toISOString() })
            .eq('id', userData.id);

        // Connexion réussie
        currentUser = userData;
        console.log('✅ Connexion élève réussie:', userData.email);
        await loadUserDataFromSupabase(userData.id);
        showMainApp();

    } catch (err) {
        console.error('Erreur login:', err);
        showError('loginError', 'Une erreur est survenue');
    }
}

// Remplacer la fonction coachLogin() existante
async function coachLogin() {
    const email = document.getElementById('coachEmail').value.trim();
    const code = document.getElementById('coachCode').value;

    if (!email || !code) {
        showError('coachError', 'Veuillez saisir votre email et code');
        return;
    }

    try {
        // Pour le coach, on utilise le code comme mot de passe
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: code
        });

        if (error) {
            console.error('Erreur coach login:', error);
            showError('coachError', 'Email ou code incorrect');
            return;
        }

        // Vérifier que c'est bien un coach
        const { data: userData, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();

        if (userError || userData.role !== 'coach') {
            console.error('Pas un coach:', userError);
            showError('coachError', 'Accès coach non autorisé');
            await supabase.auth.signOut();
            return;
        }

        // Connexion coach réussie
        currentUser = userData;
        console.log('✅ Connexion coach réussie:', userData.email);
        showCoachInterface();

    } catch (err) {
        console.error('Erreur coach login:', err);
        showError('coachError', 'Une erreur est survenue');
    }
}

// Nouvelle fonction pour charger les données depuis Supabase
async function loadUserDataFromSupabase(userId) {
    try {
        // Charger les trades
        const { data: trades, error: tradesError } = await supabase
            .from('trades')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!tradesError && trades) {
            allTrades = trades;
        }

        // Charger les accounts
        const { data: accounts, error: accountsError } = await supabase
            .from('accounts')
            .select('*')
            .eq('user_id', userId);

        if (!accountsError && accounts) {
            tradingAccounts = accounts;
        }

        // Charger les journal entries
        const { data: entries, error: entriesError } = await supabase
            .from('journal_entries')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false });

        if (!entriesError && entries) {
            journalEntries = entries;
        }

        // Charger les account costs
        const { data: costs, error: costsError } = await supabase
            .from('account_costs')
            .select('*')
            .eq('user_id', userId);

        if (!costsError && costs) {
            accountCosts = costs;
        }

        // Charger les payouts
        const { data: payouts, error: payoutsError } = await supabase
            .from('payouts')
            .select('*')
            .eq('user_id', userId);

        if (!payoutsError && payouts) {
            userPayouts = payouts;
        }

        console.log('✅ Données chargées depuis Supabase');

    } catch (err) {
        console.error('Erreur chargement données:', err);
    }
}

// Fonction logout
async function logout() {
    await supabase.auth.signOut();
    currentUser = null;
    window.location.reload();
}

console.log('✅ Auth Supabase chargé');
