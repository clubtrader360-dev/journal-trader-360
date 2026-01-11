/**
 * =================================================================
 * JOURNAL TRADER 360 - JOURNAL MODULE
 * Version: FINALE PRO - IIFE isolée
 * Convention: TOUJOURS utiliser user_id = currentUser.uuid
 * =================================================================
 */

(() => {
    console.log('[REGISTER] Chargement supabase-journal.js...');
    
    // Récupérer le client Supabase depuis window.supabaseClient (créé par config.js)
    const supabase = window.supabaseClient || window.supabase;
    
    if (!supabase) {
        console.error('[ERROR] window.supabaseClient manquant (config non chargée ?)');
        throw new Error('supabaseClient manquant');
    }

    // ===== FONCTION AJOUT/MODIFICATION NOTE =====
    async function addNote() {
        console.log('[JOURNAL] addNote() - START');
        
        // Vérification utilisateur
        if (!window.currentUser || !window.currentUser.uuid) {
            console.error('[JOURNAL] ❌ Utilisateur non connecté');
            alert('❌ Vous devez être connecté pour ajouter une note.');
            return { data: null, error: 'User not logged in' };
        }
        
        // Récupération des données du formulaire
        const noteDate = document.getElementById('noteDate')?.value;
        const noteText = document.getElementById('noteText')?.value;
        const emotionBefore = document.getElementById('emotionBefore')?.value;
        const emotionAfter = document.getElementById('emotionAfter')?.value;
        const sessionRating = document.getElementById('sessionRating')?.value;
        const imageFile = document.getElementById('noteImage')?.files[0];
        
        // Validation
        if (!noteDate || !noteText) {
            console.error('[JOURNAL] ❌ Champs obligatoires manquants');
            alert('⚠️ Veuillez remplir la date et le texte de la note.');
            return { data: null, error: 'Missing required fields' };
        }
        
        console.log('[JOURNAL] Données collectées:', { noteDate, noteText, emotionBefore, emotionAfter, sessionRating });
        
        // Construction du payload
        const noteData = {
            user_id: window.currentUser.uuid,
            entry_date: noteDate,
            content: noteText.trim(),
            emotion_before: emotionBefore || null,
            emotion_after: emotionAfter || null,
            session_rating: sessionRating ? parseInt(sessionRating) : null,
            image_url: null // TODO: Upload image si nécessaire
        };
        
        console.log('[JOURNAL] Payload final:', noteData);
        
        try {
            // Insertion dans Supabase
            const { data, error } = await supabase
                .from('journal_entries')
                .insert([noteData])
                .select('*')
                .single();
            
            if (error) {
                console.error('[JOURNAL] ❌ Erreur insertion:', error);
                alert(`❌ Erreur lors de l'ajout de la note : ${error.message}`);
                return { data: null, error };
            }
            
            console.log('[JOURNAL] ✅ Note ajoutée avec succès:', data);
            alert('✅ Note ajoutée avec succès !');
            
            // Fermer la modale et réinitialiser le formulaire
            const modal = document.getElementById('addNoteModal');
            if (modal) {
                modal.style.display = 'none';
            }
            
            const form = document.getElementById('noteForm');
            if (form) {
                form.reset();
            }
            
            // Rafraîchir l'affichage
            await loadJournalEntries();
            
            return { data, error: null };
        } catch (err) {
            console.error('[JOURNAL] ❌ Exception addNote:', err);
            alert(`❌ Erreur critique : ${err.message}`);
            return { data: null, error: err };
        }
    }
    
    // ===== FONCTION AJOUT ENTRÉE JOURNAL (ANCIENNE - RÉTRO-COMPATIBILITÉ) =====
    async function addJournalEntry() {
        console.log('[JOURNAL] addJournalEntry() - DEPRECATED - Utiliser addNote()');
        return await addNote();
    }

    // ===== FONCTION CHARGEMENT ENTRÉES JOURNAL =====
    async function loadJournalEntries() {
        console.log('[JOURNAL] loadJournalEntries() - START');
        
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[JOURNAL] ⚠️ Utilisateur non connecté. Aucune entrée à charger.');
            return { data: [], error: null };
        }

        console.log('[JOURNAL] Chargement des entrées pour UUID:', window.currentUser.uuid);

        try {
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('user_id', window.currentUser.uuid)
                .order('entry_date', { ascending: false });

            if (error) {
                console.error('[JOURNAL] ❌ Erreur chargement:', error);
                return { data: [], error };
            }

            console.log(`[JOURNAL] ✅ ${data.length} entrée(s) chargée(s)`);
            
            // Afficher les entrées dans le DOM
            displayJournalEntries(data);
            
            return { data, error: null };
        } catch (err) {
            console.error('[JOURNAL] ❌ Exception loadJournalEntries:', err);
            return { data: [], error: err };
        }
    }

    // ===== FONCTION AFFICHAGE ENTRÉES JOURNAL =====
    function displayJournalEntries(entries) {
        const container = document.getElementById('journalEntries');
        
        if (!container) {
            console.warn('[JOURNAL] ⚠️ Container #journalEntries introuvable');
            return;
        }

        if (!entries || entries.length === 0) {
            container.innerHTML = '<p class="text-gray-500 text-center py-8">Aucune note ajoutée. Commencez par ajouter une entrée.</p>';
            return;
        }

        container.innerHTML = entries.map(entry => {
            const stars = '⭐'.repeat(entry.session_rating || 0);
            const hasEmotions = entry.emotion_before || entry.emotion_after;
            
            return `
                <div class="border-b pb-4 mb-4 last:border-b-0">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <h4 class="font-semibold text-gray-800">${entry.entry_date}</h4>
                            ${stars ? `<span class="text-sm text-gray-500">${stars}</span>` : ''}
                        </div>
                        <div class="flex gap-2">
                            <button onclick="viewJournalEntry(${entry.id})" class="text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50" title="Voir">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editJournalEntry(${entry.id})" class="text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50" title="Modifier">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteJournalEntry(${entry.id})" class="text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${hasEmotions ? `
                        <div class="text-sm text-gray-600 mb-2">
                            ${entry.emotion_before ? `Avant: ${entry.emotion_before}` : ''}
                            ${entry.emotion_before && entry.emotion_after ? ' | ' : ''}
                            ${entry.emotion_after ? `Après: ${entry.emotion_after}` : ''}
                        </div>
                    ` : ''}
                    <p class="text-gray-700 whitespace-pre-wrap">${entry.content}</p>
                    ${entry.image_url ? `
                        <div class="mt-3">
                            <img src="${entry.image_url}" alt="Note image" class="max-w-full h-48 object-contain border rounded cursor-pointer hover:opacity-80 transition" onclick="viewImageZoom('${entry.image_url}')" title="Cliquer pour agrandir">
                        </div>
                    ` : ''}
                </div>
            `;
        }).join('');
        
        // Mettre à jour les statistiques
        updateJournalStats(entries);
    }
    
    // ===== FONCTION MISE À JOUR STATISTIQUES =====
    function updateJournalStats(entries) {
        const totalEntries = document.getElementById('totalEntries');
        const weeklyEntries = document.getElementById('weeklyEntries');
        const entriesWithImages = document.getElementById('entriesWithImages');
        
        if (totalEntries) {
            totalEntries.textContent = entries.length;
        }
        
        if (weeklyEntries) {
            const oneWeekAgo = new Date();
            oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
            const weeklyCount = entries.filter(e => new Date(e.entry_date) >= oneWeekAgo).length;
            weeklyEntries.textContent = weeklyCount;
        }
        
        if (entriesWithImages) {
            const imagesCount = entries.filter(e => e.image_url).length;
            entriesWithImages.textContent = imagesCount;
        }
    }
    
    // ===== FONCTION SUPPRESSION ENTRÉE =====
    async function deleteJournalEntry(entryId) {
        console.log('[JOURNAL] deleteJournalEntry() - START', entryId);
        
        if (!window.currentUser || !window.currentUser.uuid) {
            console.error('[JOURNAL] ❌ Utilisateur non connecté');
            return { data: null, error: 'User not logged in' };
        }
        
        if (!confirm('Êtes-vous sûr de vouloir supprimer cette note ?')) {
            return { data: null, error: 'Cancelled by user' };
        }
        
        try {
            const { error } = await supabase
                .from('journal_entries')
                .delete()
                .eq('id', entryId)
                .eq('user_id', window.currentUser.uuid);
            
            if (error) {
                console.error('[JOURNAL] ❌ Erreur suppression:', error);
                alert(`❌ Erreur : ${error.message}`);
                return { data: null, error };
            }
            
            console.log('[JOURNAL] ✅ Note supprimée');
            alert('✅ Note supprimée avec succès');
            
            // Rafraîchir l'affichage
            await loadJournalEntries();
            
            return { data: true, error: null };
        } catch (err) {
            console.error('[JOURNAL] ❌ Exception deleteJournalEntry:', err);
            alert(`❌ Erreur : ${err.message}`);
            return { data: null, error: err };
        }
    }
    
    // ===== FONCTION VISUALISATION ENTRÉE =====
    function viewJournalEntry(entryId) {
        console.log('[JOURNAL] viewJournalEntry() - TODO', entryId);
        alert('Fonctionnalité de visualisation en cours de développement');
    }
    
    // ===== FONCTION ÉDITION ENTRÉE =====
    function editJournalEntry(entryId) {
        console.log('[JOURNAL] editJournalEntry() - TODO', entryId);
        alert('Fonctionnalité d\'édition en cours de développement');
    }

    // ===== EXPORT DES FONCTIONS =====
    window.addNote = addNote;
    window.addJournalEntry = addJournalEntry;
    window.loadJournalEntries = loadJournalEntries;
    window.deleteJournalEntry = deleteJournalEntry;
    window.viewJournalEntry = viewJournalEntry;
    window.editJournalEntry = editJournalEntry;

    console.log('[JOURNAL] ✅ Module chargé. Fonctions exposées: addNote, loadJournalEntries, deleteJournalEntry, viewJournalEntry, editJournalEntry');

})();
