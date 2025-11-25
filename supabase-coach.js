// Fonction pour charger tous les étudiants depuis Supabase (pour le coach)
async function getAllStudentsDataFromSupabase() {
    try {
        // Récupérer tous les utilisateurs avec role='student' et status='active'
        const { data: students, error: studentsError } = await supabase
            .from('users')
            .select('*')
            .eq('role', 'student')
            .eq('status', 'active');

        if (studentsError) {
            console.error('Erreur récupération students:', studentsError);
            return [];
        }

        console.log('📊 Étudiants actifs trouvés:', students.length);

        const allStudentsData = [];

        // Pour chaque étudiant, récupérer ses données
        for (const student of students) {
            // Récupérer les trades
            const { data: trades } = await supabase
                .from('trades')
                .select('*')
                .eq('user_id', student.uuid);

            // Récupérer les accounts
            const { data: accounts } = await supabase
                .from('accounts')
                .select('*')
                .eq('user_id', student.uuid);

            // Récupérer les journal entries
            const { data: journalEntries } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', student.uuid);

            // Récupérer les account costs
            const { data: accountCosts } = await supabase
                .from('account_costs')
                .select('*')
                .eq('user_id', student.uuid);

            // Récupérer les payouts
            const { data: payouts } = await supabase
                .from('payouts')
                .select('*')
                .eq('user_id', student.uuid);

            allStudentsData.push({
                user: student,
                trades: trades || [],
                accounts: accounts || [],
                journalEntries: journalEntries || [],
                accountCosts: accountCosts || [],
                payouts: payouts || []
            });
        }

        return allStudentsData;

    } catch (err) {
        console.error('Erreur getAllStudentsDataFromSupabase:', err);
        return [];
    }
}

// Fonction pour charger la comptabilité coach depuis Supabase
async function loadCoachAccountingFromSupabase() {
    console.log('💰 Chargement comptabilité coach depuis Supabase...');

    try {
        const studentsData = await getAllStudentsDataFromSupabase();

        if (!studentsData || studentsData.length === 0) {
            console.log('⚠️ Aucun étudiant actif trouvé');
            document.getElementById('coachTotalInvested').textContent = '$0.00';
            document.getElementById('coachTotalPayouts').textContent = '$0.00';
            document.getElementById('coachNetProfit').textContent = '$0.00';
            document.getElementById('coachGlobalROI').textContent = '0.0%';
            return;
        }

        // Calculer les totaux
        let totalInvested = 0;
        let totalPayouts = 0;
        const studentsBreakdown = [];
        const allCosts = [];
        const allPayouts = [];

        studentsData.forEach(studentData => {
            const student = studentData.user;
            const costs = studentData.accountCosts || [];
            const payouts = studentData.payouts || [];

            // Calculer le total investi pour cet étudiant
            const studentInvested = costs.reduce((sum, c) => sum + (parseFloat(c.cost) || 0), 0);
            const studentPayouts = payouts.reduce((sum, p) => sum + (parseFloat(p.amount) || 0), 0);

            totalInvested += studentInvested;
            totalPayouts += studentPayouts;

            // Ajouter au breakdown
            if (studentInvested > 0 || studentPayouts > 0) {
                studentsBreakdown.push({
                    name: student.email.split('@')[0],
                    invested: studentInvested,
                    payouts: studentPayouts,
                    profit: studentPayouts - studentInvested
                });
            }

            // Collecter tous les coûts
            costs.forEach(c => {
                allCosts.push({
                    student: student.email.split('@')[0],
                    accountName: c.account_name,
                    cost: parseFloat(c.cost) || 0,
                    date: c.date
                });
            });

            // Collecter tous les payouts
            payouts.forEach(p => {
                allPayouts.push({
                    student: student.email.split('@')[0],
                    accountName: p.account_name,
                    amount: parseFloat(p.amount) || 0,
                    date: p.date
                });
            });
        });

        // Calculer le profit net et ROI
        const netProfit = totalPayouts - totalInvested;
        const globalROI = totalInvested > 0 ? ((netProfit / totalInvested) * 100) : 0;

        // Afficher les KPIs
        document.getElementById('coachTotalInvested').textContent = `$${totalInvested.toFixed(2)}`;
        document.getElementById('coachTotalPayouts').textContent = `$${totalPayouts.toFixed(2)}`;
        document.getElementById('coachNetProfit').textContent = `$${netProfit.toFixed(2)}`;
        document.getElementById('coachGlobalROI').textContent = `${globalROI.toFixed(1)}%`;

        // Afficher le tableau par étudiant
        const breakdownTable = document.getElementById('coachStudentsBreakdown');
        if (breakdownTable) {
            breakdownTable.innerHTML = studentsBreakdown.map(s => `
                <tr>
                    <td class="px-4 py-3">${s.name}</td>
                    <td class="px-4 py-3">$${s.invested.toFixed(2)}</td>
                    <td class="px-4 py-3">$${s.payouts.toFixed(2)}</td>
                    <td class="px-4 py-3 ${s.profit >= 0 ? 'text-green-600' : 'text-red-600'}">
                        $${s.profit.toFixed(2)}
                    </td>
                </tr>
            `).join('');
        }

        // Afficher tous les comptes achetés
        const costsTable = document.getElementById('coachAllCosts');
        if (costsTable) {
            costsTable.innerHTML = allCosts.sort((a, b) => new Date(b.date) - new Date(a.date)).map(c => `
                <tr>
                    <td class="px-4 py-3">${c.student}</td>
                    <td class="px-4 py-3">${c.accountName}</td>
                    <td class="px-4 py-3">$${c.cost.toFixed(2)}</td>
                    <td class="px-4 py-3">${new Date(c.date).toLocaleDateString('fr-FR')}</td>
                </tr>
            `).join('');
        }

        // Afficher tous les payouts
        const payoutsTable = document.getElementById('coachAllPayouts');
        if (payoutsTable) {
            payoutsTable.innerHTML = allPayouts.sort((a, b) => new Date(b.date) - new Date(a.date)).map(p => `
                <tr>
                    <td class="px-4 py-3">${p.student}</td>
                    <td class="px-4 py-3">${p.accountName}</td>
                    <td class="px-4 py-3">$${p.amount.toFixed(2)}</td>
                    <td class="px-4 py-3">${new Date(p.date).toLocaleDateString('fr-FR')}</td>
                </tr>
            `).join('');
        }

        console.log('✅ Comptabilité coach chargée');

    } catch (err) {
        console.error('Erreur loadCoachAccountingFromSupabase:', err);
    }
}

// Fonction pour charger les inscriptions en attente depuis Supabase
async function loadCoachRegistrationsFromSupabase() {
    console.log('🔄 Chargement des inscriptions depuis Supabase...');
    try {
        // Récupérer tous les utilisateurs
        const { data: allUsers, error } = await supabase
            .from('users')
            .select('*')
            .order('created_at', { ascending: false });

        console.log('📊 Tous les utilisateurs récupérés:', allUsers);

        if (error) {
            console.error('Erreur chargement registrations:', error);
            return;
        }

        // Séparer par statut
        const pendingUsers = allUsers.filter(u => u.status === 'pending' && u.role === 'student');
        const activeUsers = allUsers.filter(u => u.status === 'active' && u.role === 'student');
        const revokedUsers = allUsers.filter(u => u.status === 'revoked' && u.role === 'student');

        console.log('⏳ Inscriptions pending:', pendingUsers.length);
        console.log('✅ Étudiants actifs:', activeUsers.length);
        console.log('🚫 Étudiants révoqués:', revokedUsers.length);

        // Afficher les inscriptions en attente
        const pendingContainer = document.getElementById('coachPendingRegistrations');
        if (pendingContainer) {
            if (pendingUsers.length === 0) {
                pendingContainer.innerHTML = '<p class="text-gray-500">Aucune inscription en attente</p>';
            } else {
                pendingContainer.innerHTML = pendingUsers.map(u => `
                    <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div>
                            <p class="font-semibold">${u.email}</p>
                            <p class="text-sm text-gray-500">${new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                        </div>
                        <div class="space-x-2">
                            <button onclick="approveRegistration('${u.uuid}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                                ✓ Approuver
                            </button>
                            <button onclick="rejectRegistration('${u.uuid}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                                ✗ Refuser
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }

        // Afficher les étudiants actifs
        const activeContainer = document.getElementById('coachActiveStudents');
        if (activeContainer) {
            activeContainer.innerHTML = activeUsers.map(u => `
                <div class="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                        <p class="font-semibold">${u.email}</p>
                        <p class="text-sm text-gray-500">Inscrit le ${new Date(u.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                    <div class="space-x-2">
                        <button onclick="revokeStudent('${u.uuid}')" class="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600">
                            ⏸ Suspendre
                        </button>
                        <button onclick="deleteStudent('${u.uuid}')" class="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600">
                            🗑 Supprimer
                        </button>
                    </div>
                </div>
            `).join('');
        }

        // Afficher les étudiants révoqués
        const revokedContainer = document.getElementById('coachRevokedStudents');
        if (revokedContainer) {
            if (revokedUsers.length === 0) {
                revokedContainer.innerHTML = '<p class="text-gray-500">Aucun accès suspendu</p>';
            } else {
                revokedContainer.innerHTML = revokedUsers.map(u => `
                    <div class="flex items-center justify-between p-4 bg-red-50 rounded-lg border border-red-200">
                        <div>
                            <p class="font-semibold">${u.email}</p>
                            <p class="text-sm text-gray-500">Suspendu</p>
                        </div>
                        <button onclick="reactivateStudent('${u.uuid}')" class="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600">
                            ✓ Réactiver
                        </button>
                    </div>
                `).join('');
            }
        }

    } catch (err) {
        console.error('Erreur loadCoachRegistrationsFromSupabase:', err);
    }
}

// Fonction pour approuver une inscription
async function approveRegistration(userId) {
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('uuid', userId);

        if (error) {
            console.error('Erreur approbation:', error);
            alert('❌ Erreur lors de l\'approbation');
            return;
        }

        alert('✅ Inscription approuvée!');
        await loadCoachRegistrationsFromSupabase();

    } catch (err) {
        console.error('Erreur approveRegistration:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour refuser une inscription
async function rejectRegistration(userId) {
    if (!confirm('❌ Voulez-vous vraiment refuser cette inscription ?')) {
        return;
    }

    try {
        // Supprimer l'utilisateur et ses données (cascade)
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('uuid', userId);

        if (error) {
            console.error('Erreur rejet:', error);
            alert('❌ Erreur lors du rejet');
            return;
        }

        alert('✅ Inscription refusée et supprimée!');
        await loadCoachRegistrationsFromSupabase();

    } catch (err) {
        console.error('Erreur rejectRegistration:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour révoquer un étudiant
async function revokeStudent(userId) {
    if (!confirm('⏸ Voulez-vous vraiment suspendre cet accès ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'revoked' })
            .eq('uuid', userId);

        if (error) {
            console.error('Erreur révocation:', error);
            alert('❌ Erreur lors de la suspension');
            return;
        }

        alert('✅ Accès suspendu!');
        await loadCoachRegistrationsFromSupabase();

    } catch (err) {
        console.error('Erreur revokeStudent:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour réactiver un étudiant
async function reactivateStudent(userId) {
    try {
        const { error } = await supabase
            .from('users')
            .update({ status: 'active' })
            .eq('uuid', userId);

        if (error) {
            console.error('Erreur réactivation:', error);
            alert('❌ Erreur lors de la réactivation');
            return;
        }

        alert('✅ Étudiant réactivé!');
        await loadCoachRegistrationsFromSupabase();

    } catch (err) {
        console.error('Erreur reactivateStudent:', err);
        alert('❌ Une erreur est survenue');
    }
}

// Fonction pour supprimer un étudiant
async function deleteStudent(userId) {
    if (!confirm('🗑 Voulez-vous vraiment SUPPRIMER définitivement cet étudiant et toutes ses données ?')) {
        return;
    }

    try {
        const { error } = await supabase
            .from('users')
            .delete()
            .eq('uuid', userId);

        if (error) {
            console.error('Erreur suppression student:', error);
            alert('❌ Erreur lors de la suppression');
            return;
        }

        alert('✅ Étudiant supprimé!');
        await loadCoachRegistrationsFromSupabase();

    } catch (err) {
        console.error('Erreur deleteStudent:', err);
        alert('❌ Une erreur est survenue');
    }
}

console.log('✅ Coach Supabase chargé');
