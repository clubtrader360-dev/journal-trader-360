// ========================================
// SUPABASE CONFIG - VERSION IIFE (ISOLÉE)
// ========================================

(() => {
    console.log('🔧 Chargement supabase-config.js...');

    const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
    const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

    // Récupérer la librairie CDN Supabase
    const supabaseLib = window.supabase;
    
    if (!supabaseLib || typeof supabaseLib.createClient !== 'function') {
        console.error('❌ ERREUR : Supabase CDN manquant');
        throw new Error('Supabase CDN manquant. Vérifiez le script CDN dans <head>.');
    }

    // Créer le client et l'attacher à window.supabaseClient (PAS window.supabase)
    window.supabaseClient = supabaseLib.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    console.log('✅ Client Supabase créé: window.supabaseClient =', !!window.supabaseClient);
    console.log('✅ supabase-config.js chargé avec succès');
})();
