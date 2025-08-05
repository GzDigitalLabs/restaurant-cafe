-- ============================================
-- CREATE ADMIN USER SCRIPT
-- Run this in your Supabase SQL Editor
-- ============================================

-- First, let's check if the admin user already exists
SELECT * FROM users WHERE email = 'template@gzdigitallabs.com';

-- If no results, create the admin user
INSERT INTO users (email, role, is_active) 
VALUES ('template@gzdigitallabs.com', 'admin', true)
ON CONFLICT (email) 
DO UPDATE SET 
    role = 'admin',
    is_active = true,
    updated_at = NOW();

-- Verify the user was created
SELECT * FROM users WHERE email = 'template@gzdigitallabs.com';

-- ============================================
-- SCRIPT COMPLETE
-- ============================================ 