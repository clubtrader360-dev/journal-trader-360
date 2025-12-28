// ========================================
// CONFIGURATION SUPABASE
// ========================================

(() => {
  'use strict';

  console.log('[CONFIG] Chargement supabase-config.js...');

  // ========================================
  // CONFIGURATION (À REMPLACER PAR VOS VRAIES VALEURS)
  // ========================================
  const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

  // ========================================
  // VALIDATION
  // ========================================
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('[CONFIG] ❌ ERREUR : SUPABASE_URL ou SUPABASE_ANON_KEY manquant');
    return;
  }

  // ========================================
  // VÉRIFIER QUE LA BIBLIOTHÈQUE SUPABASE EST CHARGÉE
  // ========================================
  if (typeof supabase === 'undefined') {
    console.error('[CONFIG] ❌ ERREUR : Bibliothèque Supabase non chargée. Vérifiez le <script> dans index.html');
    return;
  }

  // ========================================
  // CRÉER LE CLIENT SUPABASE
  // ========================================
  try {
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('[CONFIG] ✅ Client Supabase créé : window.supabaseClient = true');
  } catch (error) {
    console.error('[CONFIG] ❌ Erreur création client Supabase:', error);
  }
})();
