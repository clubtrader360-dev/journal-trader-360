// ========================================
// SUPABASE CONFIG - VERSION IIFE (ISOLÉE)
// ========================================

(() => {
    console.log('[CONFIG] Chargement supabase-config.js...');

    const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

    // Vérifier que la bibliothèque Supabase est chargée
    if (typeof supabase === 'undefined') {
        console.error('[ERROR] Bibliothèque Supabase non chargée. Vérifiez le CDN.');
        return;
    }

    // Créer le client Supabase et l'exposer globalement
    window.supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('[OK] Client Supabase créé: window.supabaseClient =', !!window.supabaseClient);
})();
