// Supabase Configuration
const SUPABASE_URL = 'https://yjuzygaqsiiikfyuhsix.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlqdXp5Z2Fxc2lpaWtmeXVoc2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM4MDY0NTAsImV4cCI6MjA2OTM4MjQ1MH0.YWFICW1NcBQHPzHxQV9bXqg58k1oxxJSlYNVxi8lYYE';

// Initialize Supabase client
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Database table names
const TABLES = {
    MENU_ITEMS: 'menu_items',
    RESERVATIONS: 'reservations',
    FEATURED_ITEMS: 'featured_items',
    USERS: 'users'
};

// Export for use in other files
window.supabase = supabaseClient;
window.TABLES = TABLES; 