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
        
        // Vérifier si on est en mode édition
        const modal = document.getElementById('addNoteModal');
        const editingId = modal?.dataset.editingId;
        const isEditing = editingId && editingId !== '';
        
        console.log('[JOURNAL] Mode:', isEditing ? 'ÉDITION' : 'AJOUT', 'ID:', editingId);
        
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
            let data, error;
            
            if (isEditing) {
                // MODE ÉDITION : Update
                console.log('[JOURNAL] 🔄 Mise à jour de l\'entrée ID:', editingId);
                
                const result = await supabase
                    .from('journal_entries')
                    .update(noteData)
                    .eq('id', editingId)
                    .eq('user_id', window.currentUser.uuid)
                    .select('*')
                    .single();
                
                data = result.data;
                error = result.error;
                
                if (!error) {
                    alert('✅ Note modifiée avec succès !');
                }
            } else {
                // MODE AJOUT : Insert
                console.log('[JOURNAL] ➕ Ajout d\'une nouvelle entrée');
                
                const result = await supabase
                    .from('journal_entries')
                    .insert([noteData])
                    .select('*')
                    .single();
                
                data = result.data;
                error = result.error;
                
                if (!error) {
                    alert('✅ Note ajoutée avec succès !');
                }
            }
            
            if (error) {
                console.error('[JOURNAL] ❌ Erreur:', error);
                alert(`❌ Erreur : ${error.message}`);
                return { data: null, error };
            }
            
            console.log('[JOURNAL] ✅ Opération réussie:', data);
            
            // Fermer la modale et réinitialiser
            if (modal) {
                modal.style.display = 'none';
                delete modal.dataset.editingId; // Nettoyer le mode édition
            }
            
            const form = document.getElementById('noteForm');
            if (form) {
                form.reset();
            }
            
            // Réinitialiser le texte du bouton
            const submitBtn = modal?.querySelector('.trader-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Ajouter la Note';
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
                            <button class="btn-view-journal text-green-600 hover:text-green-800 px-2 py-1 rounded hover:bg-green-50" title="Voir" data-entry-id="${entry.id}">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn-edit-journal text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50" title="Modifier" data-entry-id="${entry.id}">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-delete-journal text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50" title="Supprimer" data-entry-id="${entry.id}">
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
        
        // Attacher les événements après le rendu HTML
        attachJournalEventListeners();
        
        // Mettre à jour les statistiques
        updateJournalStats(entries);
    }
    
    // ===== FONCTION ATTACHEMENT ÉVÉNEMENTS =====
    function attachJournalEventListeners() {
        console.log('[JOURNAL] Attachement des événements...');
        
        // Boutons Voir
        document.querySelectorAll('.btn-view-journal').forEach(btn => {
            btn.addEventListener('click', function() {
                const entryId = this.getAttribute('data-entry-id');
                console.log('[JOURNAL] Clic sur Voir, ID:', entryId);
                viewJournalEntry(entryId);
            });
        });
        
        // Boutons Modifier
        document.querySelectorAll('.btn-edit-journal').forEach(btn => {
            btn.addEventListener('click', function() {
                const entryId = this.getAttribute('data-entry-id');
                console.log('[JOURNAL] Clic sur Modifier, ID:', entryId);
                editJournalEntry(entryId);
            });
        });
        
        // Boutons Supprimer
        document.querySelectorAll('.btn-delete-journal').forEach(btn => {
            btn.addEventListener('click', function() {
                const entryId = this.getAttribute('data-entry-id');
                console.log('[JOURNAL] Clic sur Supprimer, ID:', entryId);
                deleteJournalEntry(entryId);
            });
        });
        
        console.log('[JOURNAL] ✅ Événements attachés');
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
    async function viewJournalEntry(entryId) {
        console.log('[JOURNAL] viewJournalEntry() - START');
        console.log('[JOURNAL] entryId reçu:', entryId, 'Type:', typeof entryId);
        
        if (!window.currentUser || !window.currentUser.uuid) {
            console.error('[JOURNAL] ❌ Utilisateur non connecté');
            alert('❌ Vous devez être connecté');
            return;
        }
        
        console.log('[JOURNAL] User UUID:', window.currentUser.uuid);
        
        try {
            // Récupérer l'entrée depuis Supabase
            console.log('[JOURNAL] Requête Supabase avec id:', entryId);
            
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .eq('user_id', window.currentUser.uuid)
                .single();
            
            console.log('[JOURNAL] Résultat Supabase - data:', data, 'error:', error);
            
            if (error) {
                console.error('[JOURNAL] ❌ Erreur Supabase:', error);
                alert(`❌ Erreur : ${error.message}`);
                return;
            }
            
            if (!data) {
                console.error('[JOURNAL] ❌ Aucune donnée retournée');
                alert('❌ Note non trouvée');
                return;
            }
            
            console.log('[JOURNAL] ✅ Entrée récupérée:', data);
            
            // Afficher dans une modale ou alert pour l'instant
            const stars = '⭐'.repeat(data.session_rating || 0);
            const emotions = [];
            if (data.emotion_before) emotions.push(`Avant: ${data.emotion_before}`);
            if (data.emotion_after) emotions.push(`Après: ${data.emotion_after}`);
            
            const message = `
📅 Date: ${data.entry_date}
${stars ? `⭐ Notation: ${stars}\n` : ''}
${emotions.length > 0 ? `😊 Émotions: ${emotions.join(' | ')}\n` : ''}

📝 Contenu:
${data.content}
            `.trim();
            
            alert(message);
            
        } catch (err) {
            console.error('[JOURNAL] ❌ Exception viewJournalEntry:', err);
            alert(`❌ Erreur : ${err.message}`);
        }
    }
    
    // ===== FONCTION ÉDITION ENTRÉE =====
    async function editJournalEntry(entryId) {
        console.log('[JOURNAL] editJournalEntry() - START');
        console.log('[JOURNAL] entryId reçu:', entryId, 'Type:', typeof entryId);
        
        if (!window.currentUser || !window.currentUser.uuid) {
            console.error('[JOURNAL] ❌ Utilisateur non connecté');
            alert('❌ Vous devez être connecté');
            return;
        }
        
        console.log('[JOURNAL] User UUID:', window.currentUser.uuid);
        
        try {
            // Récupérer l'entrée depuis Supabase
            console.log('[JOURNAL] Requête Supabase avec id:', entryId);
            
            const { data, error } = await supabase
                .from('journal_entries')
                .select('*')
                .eq('id', entryId)
                .eq('user_id', window.currentUser.uuid)
                .single();
            
            console.log('[JOURNAL] Résultat Supabase - data:', data, 'error:', error);
            
            if (error) {
                console.error('[JOURNAL] ❌ Erreur Supabase:', error);
                alert(`❌ Erreur : ${error.message}`);
                return;
            }
            
            if (!data) {
                console.error('[JOURNAL] ❌ Aucune donnée retournée');
                alert('❌ Note non trouvée');
                return;
            }
            
            console.log('[JOURNAL] ✅ Entrée récupérée pour édition:', data);
            
            // Pré-remplir le formulaire
            document.getElementById('noteDate').value = data.entry_date;
            document.getElementById('noteText').value = data.content;
            document.getElementById('emotionBefore').value = data.emotion_before || '';
            document.getElementById('emotionAfter').value = data.emotion_after || '';
            document.getElementById('sessionRating').value = data.session_rating || 0;
            
            // Mettre à jour les étoiles visuellement
            const rating = data.session_rating || 0;
            document.querySelectorAll('.star-rating').forEach((s, index) => {
                if (index < rating) {
                    s.style.opacity = '1';
                    s.style.color = '#FFD700';
                } else {
                    s.style.opacity = '0.3';
                    s.style.color = '#ccc';
                }
            });
            
            // Ouvrir la modale en mode édition
            const modal = document.getElementById('addNoteModal');
            if (modal) {
                modal.dataset.editingId = entryId; // Stocker l'ID pour la sauvegarde
                modal.style.display = 'block';
            }
            
            // Changer le texte du bouton
            const submitBtn = modal.querySelector('.trader-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Modifier la Note';
            }
            
        } catch (err) {
            console.error('[JOURNAL] ❌ Exception editJournalEntry:', err);
            alert(`❌ Erreur : ${err.message}`);
        }
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
