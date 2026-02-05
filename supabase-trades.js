// MODULE : TRADES + ACCOUNTS
// Source de vérité : Supabase
// IIFE isolée - Pas de globals au top-level
// ========================================

(() => {
  'use strict';

  // ========================================
  // 1️⃣ CLIENT SUPABASE (LOCAL À L'IIFE)
  // ========================================
  const supabase = window.supabaseClient;

  if (!supabase) {
    console.error('[TRADES] ❌ Erreur : window.supabaseClient manquant. Impossible de charger le module.');
    return;
  }

  console.log('[TRADES] ✅ Client Supabase récupéré depuis window.supabaseClient');

  // ========================================
  // 2️⃣ LOAD ACCOUNTS
  // ========================================
async function loadAccounts() {
    console.log('[TRADES] loadAccounts - START');
    
    if (!window.currentUser || !window.currentUser.uuid) {
        console.warn('[TRADES] ⚠️ Aucun utilisateur connecté');
        return { data: [], error: null };
    }
    
    const supabase = window.supabaseClient;
    
    try {
        const { data, error } = await supabase
            .from('accounts')
            .select('id, name, type, initial_balance, current_balance, active')
            .eq('user_id', window.currentUser.uuid)
            .order('created_at', { ascending: false });
        
        if (error) {
            console.error('[TRADES] ❌ Erreur:', error);
            return { data: [], error };
        }
        
        console.log(`[TRADES] ✅ ${data.length} compte(s) chargé(s)`);
        
        // Hydratation TOUS les selects (seulement si existent dans le DOM)
        const selectIds = ['tradeAccount', 'costAccountId', 'payoutAccountId', 'payoutAccount', 'csvTargetAccount'];
        
        selectIds.forEach(selectId => {
            const selectEl = document.getElementById(selectId);
            
            if (!selectEl) {
                console.log(`[TRADES] ⚠️ Select #${selectId} absent du DOM (skip)`);
                return;
            }
            
            // Reset + remplissage
            selectEl.innerHTML = '<option value="">Sélectionner un compte...</option>';
            
            data.forEach(account => {
                const option = document.createElement('option');
                option.value = account.id;
                option.textContent = account.name;
                selectEl.appendChild(option);
            });
            
            console.log(`[TRADES] ✅ Select #${selectId} hydraté (${data.length} comptes)`);
        });
        
        // Sidebar accountsList (si existe) - ID CORRIGÉ
        const accountsList = document.getElementById('accountsList');
        if (accountsList) {
            if (data.length === 0) {
                accountsList.innerHTML = '<p class="text-gray-500 text-center py-4 text-sm">Aucun compte. Cliquez sur + pour créer.</p>';
            } else {
                accountsList.innerHTML = data.map(account => {
                    // ✅ Utiliser la valeur 'active' depuis Supabase, par défaut true si non défini
                    const isActive = account.active !== undefined ? account.active : true;
                    return `
                        <div class="account-item">
                            <input type="checkbox" class="account-checkbox" ${isActive ? 'checked' : ''} 
                                   onchange="toggleAccount(${account.id})" 
                                   title="Activer/Désactiver ce compte dans les métriques">
                            <div class="account-info" style="flex: 1;">
                                <div class="account-name">${account.name}</div>
                                <div class="account-size text-xs">${account.type} - ${account.current_balance.toFixed(2)} USD</div>
                            </div>
                            <button onclick="deleteAccount(${account.id})" class="account-delete-btn" title="Supprimer">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    `;
                }).join('');
            }
            console.log('[TRADES] ✅ accountsList mis à jour');
        }
        
        return { data, error: null };
    } catch (err) {
        console.error('[TRADES] ❌ Exception:', err);
        return { data: [], error: err };
    }
}

  // ========================================
  // 3️⃣ ADD ACCOUNT (BACKEND LOGIC)
  // ========================================
  async function addAccount(accountData) {
    console.log('[TRADES] addAccount() - START - accountData reçu:', accountData);

    // ✅ 1) CHECK UTILISATEUR
    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      alert('❌ Erreur : vous devez être connecté pour créer un compte.');
      return { data: null, error: 'User not logged in' };
    }

    // ========================================
    // ✅ 2) FALLBACK DOM SI accountData === undefined
    // ========================================
    if (!accountData) {
      console.log('[TRADES] ⚠️ accountData === undefined → FALLBACK DOM');
      
      const nameInput = document.getElementById('accountName');
      const sizeInput = document.getElementById('accountSize');
      const typeSelect = document.getElementById('accountType');

      if (!nameInput || !sizeInput) {
        console.error('[TRADES] ❌ Erreur : champs DOM manquants (#accountName, #accountSize)');
        alert('❌ Erreur : formulaire incomplet. Impossible de créer le compte.');
        return { data: null, error: 'Missing DOM fields' };
      }

      accountData = {
        name: nameInput.value.trim(),
        type: typeSelect ? typeSelect.value : 'demo', // Récupérer depuis le DOM ou valeur par défaut
        initial_balance: parseFloat(sizeInput.value)
      };

      console.log('[TRADES] Données extraites du DOM:', accountData);
    }

    // ✅ 3) VALIDATION
    if (!accountData.name || accountData.name === '') {
      console.error('[TRADES] ❌ Erreur : nom du compte manquant');
      alert('❌ Erreur : le nom du compte est obligatoire.');
      return { data: null, error: 'Name is required' };
    }

    if (!accountData.initial_balance || isNaN(accountData.initial_balance) || accountData.initial_balance <= 0) {
      console.error('[TRADES] ❌ Erreur : balance initiale invalide:', accountData.initial_balance);
      alert('❌ Erreur : la balance initiale doit être un nombre supérieur à 0.');
      return { data: null, error: 'Invalid initial balance' };
    }

    // ✅ 4) CONSTRUCTION PAYLOAD FINAL
    const payloadFinal = {
      user_id: window.currentUser.uuid,
      name: accountData.name,
      type: accountData.type || 'demo',
      initial_balance: accountData.initial_balance,
      current_balance: accountData.current_balance || accountData.initial_balance
    };

    // ========================================
    // ✅ LOG CRITIQUE : PAYLOAD FINAL AVANT INSERT
    // ========================================
    console.log('[TRADES] 📦 PAYLOAD FINAL avant insert:', payloadFinal);

    // ✅ 5) INSERTION SUPABASE
    try {
      const { data, error } = await supabase
        .from('accounts')
        .insert([payloadFinal])
        .select('id, name, type, initial_balance, current_balance')
        .single();

      if (error) {
        console.error('[TRADES] ❌ Erreur insertion Supabase:', error);
        alert(`❌ Erreur lors de la création du compte : ${error.message}`);
        return { data: null, error };
      }

      console.log('[TRADES] ✅ Compte ajouté avec succès:', data);

      // ✅ 6) RECHARGER LES COMPTES
      await loadAccounts();

      return { data, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception addAccount:', err);
      alert(`❌ Erreur critique : ${err.message}`);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 3️⃣ UPDATE ACCOUNT
  // ========================================
  async function updateAccount(accountId, updatedData) {
    console.log('[TRADES] updateAccount() - START', accountId, updatedData);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    // ✅ VALIDATION : Au moins un champ à mettre à jour
    if (!updatedData || Object.keys(updatedData).length === 0) {
      console.error('[TRADES] ❌ Erreur : aucune donnée à mettre à jour');
      return { data: null, error: 'No data to update' };
    }

    // ✅ VALIDATION : Si le nom est présent, il ne doit pas être vide
    if (updatedData.name !== undefined && updatedData.name.trim() === '') {
      console.error('[TRADES] ❌ Erreur : nom du compte vide');
      alert('❌ Erreur : le nom du compte ne peut pas être vide.');
      return { data: null, error: 'Name cannot be empty' };
    }

    try {
      // ✅ Mise à jour dans Supabase
      const { data, error } = await supabase
        .from('accounts')
        .update(updatedData)
        .eq('id', accountId)
        .eq('user_id', window.currentUser.uuid)
        .select('*')
        .single();

      if (error) {
        console.error('[TRADES] ❌ Erreur mise à jour compte:', error);
        alert(`❌ Erreur : ${error.message}`);
        return { data: null, error };
      }

      console.log('[TRADES] ✅ Compte mis à jour:', data);

      // ✅ Recharger les comptes
      await loadAccounts();

      return { data, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception updateAccount:', err);
      alert(`❌ Erreur : ${err.message}`);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 4️⃣ ADD TRADE
  // ========================================
  async function addTrade(tradeData) {
    console.log('[TRADES] addTrade() - START', tradeData);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      alert('❌ Vous devez être connecté pour ajouter un trade.');
      return { data: null, error: 'User not logged in' };
    }

    // ✅ Combiner date + heure pour créer des timestamps complets
    let entry_timestamp = null;
    let exit_timestamp = null;
    
    if (tradeData.trade_date && tradeData.entry_time) {
      entry_timestamp = `${tradeData.trade_date}T${tradeData.entry_time}:00`;
      console.log('[TRADES] 🕐 Entry timestamp créé:', entry_timestamp);
    }
    
    if (tradeData.trade_date && tradeData.exit_time) {
      exit_timestamp = `${tradeData.trade_date}T${tradeData.exit_time}:00`;
      console.log('[TRADES] 🕐 Exit timestamp créé:', exit_timestamp);
    }

    // ✅ Normaliser la direction selon les valeurs possibles (MAJUSCULES)
    let trade_type_upper = (tradeData.trade_type || 'Long').toUpperCase().trim();
    
    // ✅ Détecter si le type contient "SHORT" ou "LONG" (pour gérer "Short (RR1 atteint)", etc.)
    let direction = 'LONG';  // Par défaut
    
    if (trade_type_upper.includes('SHORT') || trade_type_upper.includes('SELL') || trade_type_upper.includes('VENTE')) {
      direction = 'SHORT';
    } else if (trade_type_upper.includes('LONG') || trade_type_upper.includes('BUY') || trade_type_upper.includes('ACHAT')) {
      direction = 'LONG';
    }
    
    console.log('[TRADES] 📊 Direction détectée:', tradeData.trade_type, '→', direction);
    
    // ✅ CALCUL DU P&L avec déduction des frais (si manual_pnl n'est pas fourni)
    let calculated_pnl = tradeData.manual_pnl;
    
    if (!calculated_pnl && tradeData.entry_price && tradeData.exit_price && tradeData.quantity) {
      const symbol = (tradeData.symbol || 'ES').toUpperCase().replace(/[0-9]/g, '');  // Enlever les chiffres (ESH6 -> ES)
      
      // Multipliers par instrument
      const multipliers = {
        'ES': 50,
        'MES': 5,
        'NQ': 20,
        'MNQ': 2,
        'GC': 100,
        'MGC': 10,
        'DEMO': 1
      };
      
      const multiplier = multipliers[symbol] || 50;  // Par défaut: 50 (ES)
      
      console.log('[TRADES] 💰 Calcul P&L automatique:');
      console.log('  - Instrument:', symbol, '→ Multiplier:', multiplier);
      console.log('  - Entry:', tradeData.entry_price);
      console.log('  - Exit:', tradeData.exit_price);
      console.log('  - Quantity:', tradeData.quantity);
      console.log('  - Fees:', tradeData.fees || 0);
      
      // Calcul du P&L brut
      let point_diff = tradeData.exit_price - tradeData.entry_price;
      let pnl_brut = point_diff * tradeData.quantity * multiplier;
      
      // Si SHORT, inverser le signe
      if (direction === 'SHORT') {
        pnl_brut = -pnl_brut;
        console.log('[TRADES] 🔄 SHORT détecté → Inversion du P&L');
      }
      
      // Déduire les frais
      calculated_pnl = pnl_brut - (tradeData.fees || 0);
      
      console.log('[TRADES] 📊 P&L calculé:');
      console.log('  - Point Diff:', point_diff.toFixed(2));
      console.log('  - P&L Brut:', pnl_brut.toFixed(2));
      console.log('  - Frais:', (tradeData.fees || 0).toFixed(2));
      console.log('  - P&L Net:', calculated_pnl.toFixed(2));
    } else if (calculated_pnl) {
      // Si manual_pnl est fourni (ex: depuis CSV), l'utiliser tel quel
      // Les frais sont déjà déduits dans le CSV
      console.log('[TRADES] 📊 P&L manuel utilisé (frais déjà inclus):', calculated_pnl.toFixed(2));
    }
    
    const tradeWithUser = {
      user_id: window.currentUser.uuid,
      account_id: tradeData.account_id,
      instrument: tradeData.symbol || 'ES',
      direction: direction,  // ✅ Direction en MAJUSCULES (LONG/SHORT)
      type: tradeData.trade_type || 'Long',  // ✅ Ajout du type (Long, Short, Long (RR1 atteint), etc.)
      quantity: tradeData.quantity || 1,
      entry_price: tradeData.entry_price || 0,
      exit_price: tradeData.exit_price || 0,
      entry_time: entry_timestamp,
      exit_time: exit_timestamp,
      trade_date: tradeData.trade_date || null,
      stop_loss: tradeData.stop_loss || null,
      take_profit: tradeData.take_profit || null,
      setup: tradeData.setup || null,
      notes: tradeData.notes || null,
      manual_pnl: calculated_pnl || null,  // ✅ P&L calculé avec frais déduits
      protections: tradeData.protections || null,
      trade_trend_type: tradeData.trade_trend_type || 'Non spécifié',  // ✅ AJOUT: Type de trade (Tendance/Contre-tendance)
      fees: tradeData.fees || 0,  // ✅ AJOUT: Frais de trading
      is_break_even: tradeData.is_break_even || false,  // ✅ AJOUT: Indicateur Break-Even manuel
      is_methode: tradeData.is_methode || false,  // ✅ AJOUT: Trade méthode
      is_hors_methode: tradeData.is_hors_methode || false  // ✅ AJOUT: Trade hors méthode
    };
    
    console.log('[TRADES] 📦 Payload final avec timestamps:', tradeWithUser);
    console.log('[TRADES] 🔍 Vérification des champs obligatoires:');
    console.log('  - user_id:', tradeWithUser.user_id ? '✅' : '❌');
    console.log('  - account_id:', tradeWithUser.account_id ? '✅' : '❌');
    console.log('  - instrument:', tradeWithUser.instrument ? '✅' : '❌');
    console.log('  - direction:', tradeWithUser.direction ? '✅' : '❌');
    console.log('  - quantity:', tradeWithUser.quantity ? '✅' : '❌');
    console.log('  - entry_price:', tradeWithUser.entry_price !== null ? '✅' : '❌');
    console.log('  - exit_price:', tradeWithUser.exit_price !== null ? '✅' : '❌');
    console.log('  - entry_time:', tradeWithUser.entry_time ? '✅' : '❌');
    console.log('  - exit_time:', tradeWithUser.exit_time ? '✅' : '❌');
    console.log('  - trade_date:', tradeWithUser.trade_date ? '✅' : '❌');

    try {
      let data, error;
      
      // ✅ MODE ÉDITION : Si tradeData.id existe, faire un UPDATE
      if (tradeData.id) {
        console.log('[TRADES] 🔄 Mode ÉDITION - UPDATE du trade ID:', tradeData.id);
        const result = await supabase
          .from('trades')
          .update(tradeWithUser)
          .eq('id', tradeData.id)
          .eq('user_id', window.currentUser.uuid)
          .select('*')
          .single();
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('[TRADES] ❌ Erreur mise à jour trade:', error);
          alert(`❌ Erreur : ${error.message}`);
          return { data: null, error };
        }
        
        console.log('[TRADES] ✅ Trade mis à jour:', data);
      } else {
        // ✅ MODE AJOUT : Faire un INSERT
        console.log('[TRADES] ➕ Mode AJOUT - INSERT nouveau trade');
        const result = await supabase
          .from('trades')
          .insert([tradeWithUser])
          .select('*')
          .single();
        
        data = result.data;
        error = result.error;

        if (error) {
          console.error('[TRADES] ❌ Erreur insertion trade:', error);
          alert(`❌ Erreur : ${error.message}`);
          return { data: null, error };
        }

        console.log('[TRADES] ✅ Trade ajouté:', data);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception addTrade:', err);
      alert(`❌ Erreur : ${err.message}`);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 5️⃣ LOAD TRADES
  // ========================================
  async function loadTrades() {
    console.log('[TRADES] loadTrades() - START');

    if (!window.currentUser || !window.currentUser.uuid) {
      console.warn('[TRADES] ⚠️ Utilisateur non connecté. Aucun trade à charger.');
      return { data: [], error: null };
    }

    try {
      // ✅ CHARGEMENT PAR BATCH DE 1000 TRADES (ILLIMITÉ)
      let allTrades = [];
      let hasMore = true;
      let offset = 0;
      const batchSize = 1000;

      console.log('[TRADES] 📦 Chargement des trades par batch de', batchSize);

      while (hasMore) {
        const { data, error } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', window.currentUser.uuid)
          .order('entry_time', { ascending: false })
          .range(offset, offset + batchSize - 1);

        if (error) {
          console.error('[TRADES] ❌ Erreur chargement batch', offset, '-', offset + batchSize, ':', error);
          return { data: allTrades, error };
        }

        console.log(`[TRADES] ✅ Batch ${offset}-${offset + batchSize} : ${data.length} trades`);
        allTrades = allTrades.concat(data);

        // Si moins de batchSize trades, c'est le dernier batch
        if (data.length < batchSize) {
          hasMore = false;
        } else {
          offset += batchSize;
        }
      }

      console.log(`[TRADES] ✅ TOTAL CHARGÉ: ${allTrades.length} trades`);
      return { data: allTrades, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception loadTrades:', err);
      return { data: [], error: err };
    }
  }

  // ========================================
  // 6️⃣ DELETE ACCOUNT
  // ========================================
  // 6️⃣ DELETE ACCOUNT (+ trades associés)
  // ========================================
  async function deleteAccount(accountId) {
    console.log('[TRADES] deleteAccount() - START', accountId);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    try {
      // ✅ ÉTAPE 1 : Vérifier s'il y a des trades associés
      console.log('[TRADES] 🔍 Vérification des trades associés...');
      const { data: associatedTrades, error: checkError } = await supabase
        .from('trades')
        .select('id')
        .eq('account_id', accountId)
        .eq('user_id', window.currentUser.uuid);
      
      if (checkError) {
        console.error('[TRADES] ❌ Erreur vérification trades:', checkError);
        return { data: null, error: checkError };
      }
      
      const tradeCount = associatedTrades?.length || 0;
      console.log('[TRADES] 📊 Nombre de trades associés:', tradeCount);
      
      // ✅ ÉTAPE 2 : Confirmation si des trades existent
      if (tradeCount > 0) {
        const confirm = window.confirm(
          `⚠️ Ce compte contient ${tradeCount} trade(s).\n\n` +
          `Si vous supprimez ce compte, tous les trades associés seront également supprimés.\n\n` +
          `Voulez-vous continuer ?`
        );
        
        if (!confirm) {
          console.log('[TRADES] 🚫 Suppression annulée par l\'utilisateur');
          return { data: null, error: 'Cancelled by user' };
        }
        
        // ✅ ÉTAPE 3 : Supprimer les trades associés
        console.log('[TRADES] 🗑️ Suppression des', tradeCount, 'trades associés...');
        const { error: deleteTradesError } = await supabase
          .from('trades')
          .delete()
          .eq('account_id', accountId)
          .eq('user_id', window.currentUser.uuid);
        
        if (deleteTradesError) {
          console.error('[TRADES] ❌ Erreur suppression trades:', deleteTradesError);
          alert('❌ Erreur lors de la suppression des trades. Le compte n\'a pas été supprimé.');
          return { data: null, error: deleteTradesError };
        }
        
        console.log('[TRADES] ✅ Trades associés supprimés');
      }
      
      // ✅ ÉTAPE 4 : Supprimer le compte
      console.log('[TRADES] 🗑️ Suppression du compte...');
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId)
        .eq('user_id', window.currentUser.uuid);

      if (error) {
        console.error('[TRADES] ❌ Erreur suppression compte:', error);
        return { data: null, error };
      }

      console.log('[TRADES] ✅ Compte supprimé:', accountId);
      
      // ✅ ÉTAPE 5 : Recharger les comptes ET les trades
      await loadAccounts();
      await loadTrades();
      
      // ✅ ÉTAPE 6 : Rafraîchir l'interface
      if (typeof window.refreshAllModules === 'function') {
        window.refreshAllModules();
      }
      
      return { data: true, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception deleteAccount:', err);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 7️⃣ DELETE TRADE
  // ========================================
  async function deleteTrade(tradeId) {
    console.log('[TRADES] deleteTrade() - START', tradeId);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', tradeId)
        .eq('user_id', window.currentUser.uuid);

      if (error) {
        console.error('[TRADES] ❌ Erreur suppression trade:', error);
        return { data: null, error };
      }

      console.log('[TRADES] ✅ Trade supprimé:', tradeId);
      return { data: true, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception deleteTrade:', err);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 8️⃣ EXPOSITION GLOBALE (API PUBLIQUE)
  // ========================================
  window.tradesAPI = {
    loadAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
    loadTrades,
    addTrade,
    deleteTrade
  };

  // ⚠️ RÉTRO-COMPATIBILITÉ (anciens appels directs)
  // ⚠️ À SUPPRIMER DANS LA V3 (une fois migration UI complète)
  window.loadAccounts = loadAccounts;
  window.addAccount = addAccount;
  window.updateAccount = updateAccount;
  window.deleteAccount = deleteAccount;
  window.loadTrades = loadTrades;
  window.addTrade = addTrade;
  window.deleteTrade = deleteTrade;

  console.log('[TRADES] ✅ Module chargé. API exposée: window.tradesAPI');
})();
