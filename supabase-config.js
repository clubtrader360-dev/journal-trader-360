/**
 * =================================================================
 * JOURNAL TRADER 360 - CONFIGURATION SUPABASE
 * Version: DEFINITIVE 1.0
 * =================================================================
 */

// Configuration Supabase
const SUPABASE_URL = 'https://zgihbpgoorymomtsbxpz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpnaWhicGdvb3J5bW9tdHNieHB6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1NTkyODgsImV4cCI6MjA3OTEzNTI4OH0.eGTwcpYON_uP3ppOhVIWs4qKJLjn9TyE7usGnvU4oRA';

// Initialiser le client Supabase
// Initialiser le client Supabase (éviter redéclaration si cache)
if (typeof supabase === 'undefined') {
    var supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    console.log('✅ Client Supabase initialisé');
} else {
    console.log('✅ Client Supabase déjà existant (cache)');
}

console.log('✅ Supabase configuré (VERSION DEFINITIVE)');
