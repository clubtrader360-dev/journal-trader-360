/**
 * =================================================================
 * JOURNAL TRADER 360 - SUPABASE CONFIGURATION
 * Version: DEFINITIVE 3.0 - ULTRA CORRIGÉ
 * =================================================================
 */

console.log('🔧 Chargement supabase-config.js...');

// Configuration Supabase
const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

// Vérifier que la librairie Supabase est chargée
if (typeof supabase === 'undefined') {
    console.error('❌ ERREUR CRITIQUE: La librairie @supabase/supabase-js n\'est pas chargée !');
    console.error('❌ Assurez-vous que le CDN Supabase est bien chargé AVANT ce script');
    throw new Error('Librairie Supabase non chargée');
}

// Créer le client Supabase et l'attacher à window
try {
    if (!window.supabase) {
        // Utiliser l'objet global 'supabase' fourni par le CDN
        window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        console.log('✅ Client Supabase créé et attaché à window.supabase');
    } else {
        console.log('ℹ️ Client Supabase déjà initialisé (cache)');
    }
    
    console.log('✅ Supabase configuré (VERSION DEFINITIVE 3.0)');
    console.log('   URL:', SUPABASE_URL);
    console.log('   window.supabase:', typeof window.supabase);
    
} catch (error) {
    console.error('❌ ERREUR lors de l\'initialisation Supabase:', error);
    throw error;
}
