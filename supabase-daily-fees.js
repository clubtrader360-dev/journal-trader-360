// ========================================
// MODULE: GESTION DES FRAIS QUOTIDIENS
// ========================================
// Ce module gère les frais de trading quotidiens (commissions, frais de plateforme, etc.)
// séparément des trades individuels pour ne pas fausser les statistiques.
//
// Table Supabase: daily_fees
// Colonnes:
// - id (SERIAL PRIMARY KEY)
// - user_id (UUID, FK vers auth.users)
// - account_id (INTEGER, FK vers accounts) - optionnel
// - date (DATE)
// - amount (NUMERIC) - montant des frais (toujours positif, déduit du P&L)
// - notes (TEXT) - optionnel (ex: "Frais Tradovate", "Commissions journée")
// - created_at (TIMESTAMP)
// ========================================

(() => {
  'use strict';

  console.log('[DAILY-FEES] Chargement supabase-daily-fees.js...');

  // ========================================
  // 🔧 VÉRIFICATIONS
  // ========================================
  if (!window.supabaseClient) {
    console.error('[DAILY-FEES] ❌ window.supabaseClient non disponible');
    return;
  }

  const supabase = window.supabaseClient;

  // ========================================
  // 📦 API PUBLIQUE
  // ========================================
  window.dailyFeesAPI = {
    create: addDailyFee,
    load: loadDailyFees,
    loadByDate: loadDailyFeesByDate,
    delete: deleteDailyFee,
    update: updateDailyFee
  };

  // ========================================
  // 1️⃣ AJOUTER DES FRAIS QUOTIDIENS
  // ========================================
  async function addDailyFee(feeData) {
    console.log('[DAILY-FEES] addDailyFee() - START', feeData);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[DAILY-FEES] ❌ Utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    // Validation
    if (!feeData.date || !feeData.amount) {
      console.error('[DAILY-FEES] ❌ Champs obligatoires manquants (date, amount)');
      return { data: null, error: 'Missing required fields' };
    }

    try {
      const feeWithUser = {
        user_id: window.currentUser.uuid,
        account_id: feeData.account_id || null,
        date: feeData.date,
        amount: parseFloat(feeData.amount),
        notes: feeData.notes || null
      };

      console.log('[DAILY-FEES] Payload:', feeWithUser);

      // ✅ MODE ÉDITION : Si feeData.id existe, faire un UPDATE
      let data, error;

      if (feeData.id) {
        console.log('[DAILY-FEES] 🔄 Mode ÉDITION - UPDATE des frais ID:', feeData.id);
        const result = await supabase
          .from('daily_fees')
          .update(feeWithUser)
          .eq('id', feeData.id)
          .eq('user_id', window.currentUser.uuid)
          .select('*')
          .single();
        
        data = result.data;
        error = result.error;
        
        if (error) {
          console.error('[DAILY-FEES] ❌ Erreur mise à jour frais:', error);
          return { data: null, error };
        }
        
        console.log('[DAILY-FEES] ✅ Frais mis à jour:', data);
      } else {
        // ✅ MODE AJOUT : Faire un INSERT
        console.log('[DAILY-FEES] ➕ Mode AJOUT - INSERT nouveaux frais');
        const result = await supabase
          .from('daily_fees')
          .insert([feeWithUser])
          .select('*')
          .single();
        
        data = result.data;
        error = result.error;

        if (error) {
          console.error('[DAILY-FEES] ❌ Erreur insertion frais:', error);
          return { data: null, error };
        }

        console.log('[DAILY-FEES] ✅ Frais ajoutés:', data);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error('[DAILY-FEES] ❌ Exception addDailyFee:', err);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 2️⃣ CHARGER TOUS LES FRAIS DE L'UTILISATEUR
  // ========================================
  async function loadDailyFees() {
    console.log('[DAILY-FEES] loadDailyFees() - START');

    if (!window.currentUser || !window.currentUser.uuid) {
      console.warn('[DAILY-FEES] ⚠️ Utilisateur non connecté');
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('daily_fees')
        .select('*')
        .eq('user_id', window.currentUser.uuid)
        .order('date', { ascending: false });

      if (error) {
        console.error('[DAILY-FEES] ❌ Erreur chargement frais:', error);
        return { data: [], error };
      }

      console.log(`[DAILY-FEES] ✅ Frais chargés: ${data.length}`, data);
      return { data, error: null };
    } catch (err) {
      console.error('[DAILY-FEES] ❌ Exception loadDailyFees:', err);
      return { data: [], error: err };
    }
  }

  // ========================================
  // 3️⃣ CHARGER LES FRAIS D'UNE DATE SPÉCIFIQUE
  // ========================================
  async function loadDailyFeesByDate(date) {
    console.log('[DAILY-FEES] loadDailyFeesByDate() - Date:', date);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.warn('[DAILY-FEES] ⚠️ Utilisateur non connecté');
      return { data: [], error: null };
    }

    try {
      const { data, error } = await supabase
        .from('daily_fees')
        .select('*')
        .eq('user_id', window.currentUser.uuid)
        .eq('date', date);

      if (error) {
        console.error('[DAILY-FEES] ❌ Erreur chargement frais par date:', error);
        return { data: [], error };
      }

      console.log(`[DAILY-FEES] ✅ Frais pour ${date}:`, data);
      return { data, error: null };
    } catch (err) {
      console.error('[DAILY-FEES] ❌ Exception loadDailyFeesByDate:', err);
      return { data: [], error: err };
    }
  }

  // ========================================
  // 4️⃣ SUPPRIMER DES FRAIS
  // ========================================
  async function deleteDailyFee(feeId) {
    console.log('[DAILY-FEES] deleteDailyFee() - ID:', feeId);

    if (!window.currentUser || !window.currentUser.uuid) {
      console.error('[DAILY-FEES] ❌ Utilisateur non connecté');
      return { data: null, error: 'User not logged in' };
    }

    try {
      const { data, error } = await supabase
        .from('daily_fees')
        .delete()
        .eq('id', feeId)
        .eq('user_id', window.currentUser.uuid)
        .select('*')
        .single();

      if (error) {
        console.error('[DAILY-FEES] ❌ Erreur suppression frais:', error);
        return { data: null, error };
      }

      console.log('[DAILY-FEES] ✅ Frais supprimés:', data);
      return { data, error: null };
    } catch (err) {
      console.error('[DAILY-FEES] ❌ Exception deleteDailyFee:', err);
      return { data: null, error: err };
    }
  }

  // ========================================
  // 5️⃣ METTRE À JOUR DES FRAIS
  // ========================================
  async function updateDailyFee(feeId, updatedData) {
    console.log('[DAILY-FEES] updateDailyFee() - ID:', feeId, 'Data:', updatedData);

    // Utiliser addDailyFee avec l'id pour faire un UPDATE
    return addDailyFee({ ...updatedData, id: feeId });
  }

  console.log('[DAILY-FEES] ✅ Module chargé - window.dailyFeesAPI disponible');
})();
