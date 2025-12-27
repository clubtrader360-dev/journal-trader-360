/**
 * =================================================================
 * JOURNAL TRADER 360 - JOURNAL MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('📝 Chargement supabase-journal.js...');
    
    // Récupérer le client Supabase depuis window.supabaseClient (créé par config.js)
    const supabase = window.supabaseClient;
    
    if (!supabase) {
        console.error('❌ window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    // ===== FONCTION AJOUT ENTRÉE JOURNAL =====
    async function addJournalEntry() {
        const date = document.getElementById('journalDate').value;
        const title = document.getElementById('journalTitle').value.trim();
        const content = document.getElementById('journalContent').value.trim();
        const mood = document.getElementById('journalMood').value;

        if (!date || !title || !content) {
            alert('⚠️ Veuillez remplir tous les champs obligatoires');
            return;
        }

        if (!currentUser || !currentUser.uuid) {
            alert('❌ Erreur: utilisateur non connecté');
            console.error('❌ currentUser invalide:', currentUser);
            return;
        }

        const journalData = {
            user_id: currentUser.uuid,
            entry_date: date,
            title: title,
            content: content,
            mood: mood || 'neutral'
        };

        console.log('📝 Ajout entrée journal pour UUID:', currentUser.uuid, journalData);

        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .insert([journalData])
                .select()
                .single();

            if (error) {
                console.error('❌ Erreur insertion journal:', error);
                alert('❌ Erreur lors de l\'ajout de l\'entrée: ' + error.message);
                return;
            }

            console.log('✅ Entrée journal ajoutée:', data);
            alert('✅ Entrée de journal ajoutée avec succès !');

            // Fermer modal et reset
            document.getElementById('journalModal').style.display = 'none';
            document.getElementById('addJournalForm').reset();

            // Rafraîchir
            if (typeof loadJournalEntries === 'function') {
                loadJournalEntries();
            }

        } catch (err) {
            console.error('❌ Exception addJournalEntry:', err);
            alert('❌ Erreur système: ' + err.message);
        }
    }

    // ===== FONCTION CHARGEMENT ENTRÉES JOURNAL =====
    async function loadJournalEntries() {
        if (!currentUser || !currentUser.uuid) {
            console.warn('⚠️ loadJournalEntries appelé mais currentUser invalide');
            return;
        }

        console.log('📥 Chargement des entrées journal pour UUID:', currentUser.uuid);

        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', currentUser.uuid)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('❌ Erreur chargement journal:', error);
                return;
            }

            console.log('✅ Entrées journal chargées:', data.length);
            displayJournalEntries(data);

        } catch (err) {
            console.error('❌ Exception loadJournalEntries:', err);
        }
    }

    // ===== FONCTION AFFICHAGE ENTRÉES JOURNAL =====
    function displayJournalEntries(entries) {
        const container = document.getElementById('journalEntriesContainer');
        
        if (!container) {
            console.warn('⚠️ Container journal introuvable');
            return;
        }

        if (!entries || entries.length === 0) {
            container.innerHTML = '<p>Aucune entrée de journal pour le moment</p>';
            return;
        }

        container.innerHTML = entries.map(entry => {
            const moodEmoji = {
                'positive': '😊',
                'neutral': '😐',
                'negative': '😞'
            }[entry.mood] || '😐';

            return `
                <div class="journal-entry">
                    <div class="entry-header">
                        <h3>${entry.title} ${moodEmoji}</h3>
                        <span class="entry-date">${entry.entry_date}</span>
                    </div>
                    <div class="entry-content">
                        ${entry.content}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ===== EXPORT DES FONCTIONS =====
    window.addJournalEntry = addJournalEntry;
    window.loadJournalEntries = loadJournalEntries;

    console.log('✅ Fonctions journal exportées: addJournalEntry, loadJournalEntries');

})();
