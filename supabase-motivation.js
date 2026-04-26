/**
 * =================================================================
 * JOURNAL TRADER 360 - MON POURQUOI MODULE
 * Version: 1.0.0
 * Description: Gestion de la motivation utilisateur (texte + image)
 * =================================================================
 */

(() => {
    console.log('[MOTIVATION] Chargement supabase-motivation.js...');
    
    // Récupérer le client Supabase
    const supabase = window.supabaseClient || window.supabase;
    
    if (!supabase) {
        console.error('[MOTIVATION] ❌ window.supabaseClient manquant');
        throw new Error('supabaseClient manquant');
    }

    // Variable globale pour stocker la motivation
    let currentMotivation = null;

    // ===== FONCTION CHARGEMENT MOTIVATION =====
    async function loadMotivation() {
        console.log('[MOTIVATION] loadMotivation() - START');
        console.log('[MOTIVATION] window.currentUser:', window.currentUser);
        
        // Attendre que l'utilisateur soit chargé (max 5s)
        let attempts = 0;
        while ((!window.currentUser || !window.currentUser.uuid) && attempts < 50) {
            console.log('[MOTIVATION] ⏳ Attente de l\'utilisateur...', attempts);
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!window.currentUser || !window.currentUser.uuid) {
            console.warn('[MOTIVATION] ⚠️ Utilisateur non connecté après 5s');
            // Afficher quand même l'état vide
            currentMotivation = null;
            displayMotivationSection();
            return { data: null, error: 'User not logged in' };
        }
        
        console.log('[MOTIVATION] ✅ Utilisateur trouvé:', window.currentUser.uuid);
        
        try {
            const { data, error } = await supabase
                .from('user_motivation')
                .select('*')
                .eq('user_id', window.currentUser.uuid)
                .single();
            
            if (error) {
                if (error.code === 'PGRST116') {
                    // Aucune motivation trouvée (première fois)
                    console.log('[MOTIVATION] ℹ️ Aucune motivation définie');
                    currentMotivation = null;
                    displayMotivationSection();
                    return { data: null, error: null };
                }
                // Autre erreur (ex: table n'existe pas)
                console.error('[MOTIVATION] ❌ Erreur chargement:', error);
                console.log('[MOTIVATION] ℹ️ Affichage état vide par défaut');
                currentMotivation = null;
                displayMotivationSection(); // Afficher l'état vide quand même
                return { data: null, error };
            }
            
            console.log('[MOTIVATION] ✅ Motivation chargée:', data);
            currentMotivation = data;
            displayMotivationSection();
            
            // Vérifier si on doit afficher le modal de bienvenue
            checkShowWelcomeModal();
            
            return { data, error: null };
        } catch (err) {
            console.error('[MOTIVATION] ❌ Exception loadMotivation:', err);
            // Afficher l'état vide en cas d'exception
            console.log('[MOTIVATION] ℹ️ Affichage état vide après exception');
            currentMotivation = null;
            displayMotivationSection();
            return { data: null, error: err };
        }
    }

    // ===== FONCTION AFFICHAGE SECTION MOTIVATION =====
    function displayMotivationSection() {
        console.log('[MOTIVATION] displayMotivationSection() - START');
        console.log('[MOTIVATION] currentMotivation:', currentMotivation);
        
        const displayDiv = document.getElementById('motivationDisplay');
        const emptyDiv = document.getElementById('motivationEmpty');
        
        console.log('[MOTIVATION] displayDiv:', displayDiv);
        console.log('[MOTIVATION] emptyDiv:', emptyDiv);
        
        if (!displayDiv || !emptyDiv) {
            console.warn('[MOTIVATION] ⚠️ Éléments DOM introuvables');
            return;
        }
        
        if (currentMotivation && (currentMotivation.motivation_text || currentMotivation.motivation_image_url)) {
            // Afficher la motivation
            console.log('[MOTIVATION] ✅ Affichage motivation existante');
            displayDiv.classList.remove('hidden');
            emptyDiv.classList.add('hidden');
            
            // Texte
            const textElement = document.getElementById('motivationDisplayText');
            if (textElement) {
                textElement.textContent = currentMotivation.motivation_text || 'Aucun texte défini';
            }
            
            // Image
            const imageContainer = document.getElementById('motivationImageContainer');
            const imageElement = document.getElementById('motivationDisplayImage');
            
            if (currentMotivation.motivation_image_url && imageElement && imageContainer) {
                imageElement.src = currentMotivation.motivation_image_url;
                imageContainer.classList.remove('hidden');
            } else if (imageContainer) {
                imageContainer.classList.add('hidden');
            }
            
            // Checkbox "Afficher à la connexion"
            const checkbox = document.getElementById('showOnLoginCheckbox');
            if (checkbox) {
                checkbox.checked = currentMotivation.show_on_login !== false;
            }
        } else {
            // Afficher l'état vide
            console.log('[MOTIVATION] ✅ Affichage état vide (première utilisation)');
            displayDiv.classList.add('hidden');
            emptyDiv.classList.remove('hidden');
        }
    }

    // ===== FONCTION VÉRIFIER AFFICHAGE MODAL BIENVENUE =====
    function checkShowWelcomeModal() {
        if (!currentMotivation) return;
        
        // Vérifier si on doit afficher
        const showOnLogin = currentMotivation.show_on_login !== false;
        const today = new Date().toISOString().split('T')[0];
        const lastShown = currentMotivation.last_shown_date;
        
        console.log('[MOTIVATION] Check welcome modal:', { showOnLogin, today, lastShown });
        
        // Afficher si show_on_login est true
        // (on affiche à CHAQUE connexion, pas seulement une fois par jour)
        if (showOnLogin) {
            showWelcomeModal();
        }
    }

    // ===== FONCTION AFFICHER MODAL BIENVENUE =====
    function showWelcomeModal() {
        if (!currentMotivation) return;
        
        console.log('[MOTIVATION] Affichage du modal de bienvenue');
        
        const modal = document.getElementById('motivationWelcomeModal');
        const textElement = document.getElementById('motivationWelcomeText');
        const imageContainer = document.getElementById('motivationWelcomeImageContainer');
        const imageElement = document.getElementById('motivationWelcomeImage');
        
        if (!modal) {
            console.warn('[MOTIVATION] ⚠️ Modal de bienvenue introuvable');
            return;
        }
        
        // Remplir le texte
        if (textElement) {
            textElement.textContent = currentMotivation.motivation_text || '';
        }
        
        // Remplir l'image
        if (currentMotivation.motivation_image_url && imageElement && imageContainer) {
            imageElement.src = currentMotivation.motivation_image_url;
            imageContainer.classList.remove('hidden');
        } else if (imageContainer) {
            imageContainer.classList.add('hidden');
        }
        
        // Réinitialiser la checkbox
        const dontShowCheckbox = document.getElementById('dontShowTodayCheckbox');
        if (dontShowCheckbox) {
            dontShowCheckbox.checked = false;
        }
        
        // Afficher le modal
        modal.style.display = 'block';
        
        // Mettre à jour last_shown_date
        updateLastShownDate();
    }

    // ===== FONCTION FERMER MODAL BIENVENUE =====
    async function closeMotivationWelcomeModal() {
        const modal = document.getElementById('motivationWelcomeModal');
        const dontShowCheckbox = document.getElementById('dontShowTodayCheckbox');
        
        if (dontShowCheckbox && dontShowCheckbox.checked && currentMotivation) {
            // Désactiver temporairement l'affichage
            // (sera réactivé demain car last_shown_date sera différent)
            console.log('[MOTIVATION] Ne plus afficher aujourd\'hui');
        }
        
        if (modal) {
            modal.style.display = 'none';
        }
    }

    // ===== FONCTION METTRE À JOUR DATE DERNIÈRE VUE =====
    async function updateLastShownDate() {
        if (!currentMotivation) return;
        
        const today = new Date().toISOString().split('T')[0];
        
        try {
            const { error } = await supabase
                .from('user_motivation')
                .update({ last_shown_date: today })
                .eq('user_id', window.currentUser.uuid);
            
            if (error) {
                console.error('[MOTIVATION] ❌ Erreur mise à jour last_shown_date:', error);
            } else {
                console.log('[MOTIVATION] ✅ last_shown_date mis à jour:', today);
                currentMotivation.last_shown_date = today;
            }
        } catch (err) {
            console.error('[MOTIVATION] ❌ Exception updateLastShownDate:', err);
        }
    }

    // ===== FONCTION OUVRIR MODAL ÉDITION =====
    function openEditMotivationModal() {
        const modal = document.getElementById('editMotivationModal');
        const titleElement = document.getElementById('motivationModalTitle');
        const textInput = document.getElementById('motivationTextInput');
        const imageInput = document.getElementById('motivationImageInput');
        const showOnLoginInput = document.getElementById('showOnLoginInput');
        const imagePreview = document.getElementById('motivationImagePreview');
        const previewImg = document.getElementById('motivationPreviewImg');
        
        if (!modal) {
            console.warn('[MOTIVATION] ⚠️ Modal d\'édition introuvable');
            return;
        }
        
        // Pré-remplir les champs si une motivation existe
        if (currentMotivation) {
            if (titleElement) titleElement.textContent = 'Modifier mon Pourquoi';
            if (textInput) textInput.value = currentMotivation.motivation_text || '';
            if (showOnLoginInput) showOnLoginInput.checked = currentMotivation.show_on_login !== false;
            
            // Afficher l'image existante
            if (currentMotivation.motivation_image_url && imagePreview && previewImg) {
                previewImg.src = currentMotivation.motivation_image_url;
                imagePreview.classList.remove('hidden');
            }
        } else {
            if (titleElement) titleElement.textContent = 'Définir mon Pourquoi';
            if (textInput) textInput.value = '';
            if (showOnLoginInput) showOnLoginInput.checked = true;
            if (imagePreview) imagePreview.classList.add('hidden');
        }
        
        // Réinitialiser l'input file
        if (imageInput) imageInput.value = '';
        
        modal.style.display = 'block';
    }

    // ===== FONCTION PRÉVISUALISATION IMAGE =====
    function previewMotivationImage(input) {
        const preview = document.getElementById('motivationImagePreview');
        const previewImg = document.getElementById('motivationPreviewImg');
        
        if (!input.files || !input.files[0]) return;
        
        const reader = new FileReader();
        reader.onload = function(e) {
            if (previewImg) {
                previewImg.src = e.target.result;
            }
            if (preview) {
                preview.classList.remove('hidden');
            }
        };
        reader.readAsDataURL(input.files[0]);
    }

    // ===== FONCTION SUPPRIMER IMAGE =====
    function removeMotivationImage() {
        const imageInput = document.getElementById('motivationImageInput');
        const preview = document.getElementById('motivationImagePreview');
        const previewImg = document.getElementById('motivationPreviewImg');
        
        if (imageInput) imageInput.value = '';
        if (previewImg) previewImg.src = '';
        if (preview) preview.classList.add('hidden');
    }

    // ===== FONCTION SAUVEGARDER MOTIVATION =====
    async function saveMotivation(event) {
        event.preventDefault();
        console.log('[MOTIVATION] saveMotivation() - START');
        
        if (!window.currentUser || !window.currentUser.uuid) {
            alert('❌ Vous devez être connecté');
            return;
        }
        
        const textInput = document.getElementById('motivationTextInput');
        const imageInput = document.getElementById('motivationImageInput');
        const showOnLoginInput = document.getElementById('showOnLoginInput');
        
        const motivationText = textInput?.value.trim();
        const showOnLogin = showOnLoginInput?.checked !== false;
        
        if (!motivationText && !imageInput?.files[0]) {
            alert('⚠️ Veuillez ajouter au moins un texte ou une image');
            return;
        }
        
        // Upload de l'image si présente
        let imageUrl = currentMotivation?.motivation_image_url || null;
        
        if (imageInput?.files[0]) {
            console.log('[MOTIVATION] 📤 Upload de l\'image...');
            
            try {
                const file = imageInput.files[0];
                const fileExt = file.name.split('.').pop();
                const fileName = `${window.currentUser.uuid}/motivation_${Date.now()}.${fileExt}`;
                
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('journal-images')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });
                
                if (uploadError) {
                    console.error('[MOTIVATION] ❌ Erreur upload:', uploadError);
                    alert('⚠️ Erreur lors de l\'upload de l\'image');
                } else {
                    const supabaseUrl = supabase.supabaseUrl || 'https://zgihbpgoorymomtsbxpz.supabase.co';
                    imageUrl = `${supabaseUrl}/storage/v1/object/public/journal-images/${fileName}`;
                    console.log('[MOTIVATION] ✅ Image uploadée:', imageUrl);
                }
            } catch (err) {
                console.error('[MOTIVATION] ❌ Exception upload:', err);
                alert('⚠️ Erreur lors de l\'upload de l\'image');
            }
        }
        
        // Préparer les données
        const motivationData = {
            user_id: window.currentUser.uuid,
            motivation_text: motivationText,
            motivation_image_url: imageUrl,
            show_on_login: showOnLogin,
            updated_at: new Date().toISOString()
        };
        
        try {
            let data, error;
            
            if (currentMotivation) {
                // Update
                console.log('[MOTIVATION] 🔄 Mise à jour...');
                const result = await supabase
                    .from('user_motivation')
                    .update(motivationData)
                    .eq('user_id', window.currentUser.uuid)
                    .select('*')
                    .single();
                
                data = result.data;
                error = result.error;
            } else {
                // Insert
                console.log('[MOTIVATION] ➕ Insertion...');
                const result = await supabase
                    .from('user_motivation')
                    .insert([motivationData])
                    .select('*')
                    .single();
                
                data = result.data;
                error = result.error;
            }
            
            if (error) {
                console.error('[MOTIVATION] ❌ Erreur:', error);
                alert(`❌ Erreur : ${error.message}`);
                return;
            }
            
            console.log('[MOTIVATION] ✅ Sauvegarde réussie:', data);
            alert('✅ Votre motivation a été enregistrée !');
            
            currentMotivation = data;
            
            // Fermer le modal
            const modal = document.getElementById('editMotivationModal');
            if (modal) modal.style.display = 'none';
            
            // Rafraîchir l'affichage
            displayMotivationSection();
            
        } catch (err) {
            console.error('[MOTIVATION] ❌ Exception saveMotivation:', err);
            alert(`❌ Erreur : ${err.message}`);
        }
    }

    // ===== FONCTION METTRE À JOUR SHOW_ON_LOGIN =====
    async function updateShowOnLogin() {
        const checkbox = document.getElementById('showOnLoginCheckbox');
        if (!checkbox || !currentMotivation) return;
        
        const newValue = checkbox.checked;
        
        try {
            const { error } = await supabase
                .from('user_motivation')
                .update({ show_on_login: newValue })
                .eq('user_id', window.currentUser.uuid);
            
            if (error) {
                console.error('[MOTIVATION] ❌ Erreur mise à jour show_on_login:', error);
                alert('❌ Erreur lors de la mise à jour');
                checkbox.checked = !newValue; // Restaurer l'ancien état
            } else {
                console.log('[MOTIVATION] ✅ show_on_login mis à jour:', newValue);
                currentMotivation.show_on_login = newValue;
            }
        } catch (err) {
            console.error('[MOTIVATION] ❌ Exception updateShowOnLogin:', err);
            checkbox.checked = !newValue;
        }
    }

    // ===== EXPORT DES FONCTIONS =====
    window.loadMotivation = loadMotivation;
    window.openEditMotivationModal = openEditMotivationModal;
    window.previewMotivationImage = previewMotivationImage;
    window.removeMotivationImage = removeMotivationImage;
    window.saveMotivation = saveMotivation;
    window.updateShowOnLogin = updateShowOnLogin;
    window.closeMotivationWelcomeModal = closeMotivationWelcomeModal;
    window.checkShowWelcomeModal = checkShowWelcomeModal;

    console.log('[MOTIVATION] ✅ Module chargé');

})();
