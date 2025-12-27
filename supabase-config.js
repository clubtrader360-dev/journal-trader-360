// ========================================
// SUPABASE CONFIGURATION - VERSION FINALE
// ========================================

console.log('🔧 Chargement supabase-config.js...');

// Configuration Supabase
const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

// Vérifier que le CDN Supabase est chargé
if (typeof supabase === 'undefined' || !supabase.createClient) {
    console.error('❌ ERREUR : Le CDN Supabase n\'est pas chargé !');
    throw new Error('Supabase CDN manquant. Vérifiez le script CDN dans <head>.');
}

// Créer le client Supabase et l'attacher à window
try {
    window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Client Supabase créé et attaché à window.supabase');
    console.log('✅ Supabase configuré (VERSION FINALE)');
    console.log('🔗 URL:', SUPABASE_URL);
    console.log('🔗 window.supabase:', typeof window.supabase);
} catch (error) {
    console.error('❌ Erreur lors de la création du client Supabase:', error);
    throw error;
}
