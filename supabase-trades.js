// ========================================
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
    console.log('[TRADES] loadAccounts() - START');

    if (!window.currentUser || !window.currentUser.uuid) {
      console.warn('[TRADES] ⚠️ Utilisateur non connecté. Aucun compte à charger.');
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('accounts')
        .select('id, name, type, initial_balance, current_balance')
        .eq('user_id', window.currentUser.uuid)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[TRADES] ❌ Erreur chargement comptes:', error);
        return { data: [], error };
      }

      console.log(`[TRADES] ✅ Comptes chargés: ${data.length}`, data);

      // MAJ UI SELECT
      const selectElement = document.getElementById('tradeAccount');
      if (selectElement) {
        selectElement.innerHTML = '<option value="">Sélectionner un compte</option>';
        data.forEach(account => {
          const option = document.createElement('option');
          option.value = account.id;
          option.textContent = account.name;
          selectElement.appendChild(option);
        });
        console.log('[TRADES] ✅ Select #tradeAccount mis à jour');
      }

      // MAJ UI SIDEBAR
      const accountListElement = document.getElementById('accountList');
      if (accountListElement) {
        if (data.length === 0) {
          accountListElement.innerHTML = '<p class="text-muted">Aucun compte.</p>';
        } else {
          accountListElement.innerHTML = data.map(account => `
            <div class="account-item" data-id="${account.id}">
              <span>${account.name}</span>
              <span>${account.current_balance.toFixed(2)} USD</span>
            </div>
          `).join('');
        }
        console.log('[TRADES] ✅ Sidebar #accountList mis à jour');
      }

      return { data, error: null };
    } catch (err) {
      console.error('[TRADES] ❌ Exception loadAccounts:', err);
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

      if (!nameInput || !sizeInput || !typeSelect) {
        console.error('[TRADES] ❌ Erreur : champs DOM manquants (#accountName, #accountSize, #accountType)');
        alert('❌ Erreur : formulaire incomplet. Impossible de créer le compte.');
        return { data: null, error: 'Missing DOM fields' };
      }

      accountData = {
        name: nameInput.value.trim(),
        type: typeSelect.value,
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

    const tradeWithUser = {
      user_id: window.currentUser.uuid,
      ...tradeData
    };

    try {
      const { data, error } = await supabase
        .from('trades')
        .insert([tradeWithUser])
        .select('*')
        .single();

      if (error) {
        console.error('[TRADES] ❌ Erreur insertion trade:', error);
        alert(`❌ Erreur : ${error.message}`);
        return { data: null, error };
      }

      console.log('[TRADES] ✅ Trade ajouté:', data);
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
        .select('id, instrument, quantity, entry_time, account_id')
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

