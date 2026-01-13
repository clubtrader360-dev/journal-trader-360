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
            .select('id, name, type, initial_balance, current_balance')
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
                    // Initialiser active à true si non défini
                    const isActive = account.active !== false;
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
    let direction = (tradeData.trade_type || 'Long').toUpperCase().trim();
    
    // Mapper les valeurs possibles
    const directionMap = {
      'LONG': 'LONG',
      'SHORT': 'SHORT',
      'BUY': 'LONG',
      'SELL': 'SHORT',
      'ACHAT': 'LONG',
      'VENTE': 'SHORT'
    };
    
    direction = directionMap[direction] || 'LONG';  // Par défaut: LONG
    
    console.log('[TRADES] 📊 Direction normalisée:', tradeData.trade_type, '→', direction);
    
    const tradeWithUser = {
      user_id: window.currentUser.uuid,
      account_id: tradeData.account_id,
      instrument: tradeData.symbol || 'ES',
      direction: direction,  // ✅ Direction en MAJUSCULES (LONG/SHORT)
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
      manual_pnl: tradeData.manual_pnl || null,
      protections: tradeData.protections || null
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
      const { data, error } = await supabase
        .from('trades')
        .select('*')  // ✅ Charger TOUTES les colonnes
        .eq('user_id', window.currentUser.uuid)
        .order('entry_time', { ascending: false });

      if (error) {
        console.error('[TRADES] ❌ Erreur chargement trades:', error);
        return { data: [], error };
      }

      console.log(`[TRADES] ✅ Trades chargés: ${data.length}`, data);
      return { data, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception loadTrades:', err);
      return { data: [], error: err };
    }
  }

  // ========================================
  // 6️⃣ DELETE ACCOUNT
  // ========================================
  async function deleteAccount(accountId) {
    console.log('[TRADES] deleteAccount() - START', accountId);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[TRADES] ❌ Erreur : utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    try {
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
      await loadAccounts();
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
    deleteAccount,
    loadTrades,
    addTrade,
    deleteTrade
  };

  // ⚠️ RÉTRO-COMPATIBILITÉ (anciens appels directs)
  // ⚠️ À SUPPRIMER DANS LA V3 (une fois migration UI complète)
  window.loadAccounts = loadAccounts;
  window.addAccount = addAccount;
  window.deleteAccount = deleteAccount;
  window.loadTrades = loadTrades;
  window.addTrade = addTrade;
  window.deleteTrade = deleteTrade;

  console.log('[TRADES] ✅ Module chargé. API exposée: window.tradesAPI');
})();
