// ============================================================
// SUPABASE CONFIG - single source of truth for the client
// Creates window.supabaseClient once, and keeps window.supabase for backwards-compat.
// ============================================================

(() => {
  if (window.supabaseClient) {
    console.log('[CFG] Supabase client already initialised');
    // keep legacy alias
    window.supabase = window.supabaseClient;
    return;
  }

  // IMPORTANT: SUPABASE_URL and SUPABASE_ANON_KEY must be defined in index.html before this script.
  if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
    console.error('[CFG] Missing SUPABASE_URL or SUPABASE_ANON_KEY');
    return;
  }

  if (!window.supabaseLib || !window.supabaseLib.createClient) {
    console.error('[CFG] Missing Supabase JS library (supabaseLib). Check <script src="https://cdn.jsdelivr...">');
    return;
  }

  window.supabaseClient = window.supabaseLib.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  });

  // legacy alias (some modules may still reference window.supabase)
  window.supabase = window.supabaseClient;

  console.log('[CFG] Supabase client initialised');
})();
