-- ============================================
-- DEBUG USER SCRIPT
-- Run this in your Supabase SQL Editor to check user data
-- ============================================

-- 1. Check if user exists in users table
SELECT 'Users table check:' as info;
SELECT * FROM users WHERE email = 'template@gzdigitallabs.com';

-- 2. Check auth.users table (if accessible)
SELECT 'Auth users check:' as info;
SELECT id, email, created_at FROM auth.users WHERE email = 'template@gzdigitallabs.com';

-- 3. Create user with proper UUID from auth.users
-- First, get the UUID from auth.users
WITH auth_user AS (
    SELECT id, email FROM auth.users WHERE email = 'template@gzdigitallabs.com'
)
INSERT INTO users (id, email, role, is_active) 
SELECT 
    au.id,
    au.email,
    'admin',
    true
FROM auth_user au
ON CONFLICT (email) 
DO UPDATE SET 
    id = EXCLUDED.id,
    role = 'admin',
    is_active = true,
    updated_at = NOW();

-- 4. Verify the user was created/updated
SELECT 'Final check:' as info;
SELECT * FROM users WHERE email = 'template@gzdigitallabs.com';

-- ============================================
-- SCRIPT COMPLETE
-- ============================================ 