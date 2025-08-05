-- Database Schema for Restaurant Website
-- Run these commands in your Supabase SQL editor

-- 1. Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    tags VARCHAR(500),
    has_allergies BOOLEAN DEFAULT FALSE,
    allergy_details TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Reservations Table
CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests INTEGER NOT NULL,
    special_requests TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Featured Items Table
CREATE TABLE IF NOT EXISTS featured_items (
    id BIGSERIAL PRIMARY KEY,
    menu_item_id BIGINT REFERENCES menu_items(id) ON DELETE CASCADE,
    slot_number INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Enhanced Users Table (for admin authentication with roles)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'manager')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Admin Audit Log Table
CREATE TABLE IF NOT EXISTS admin_audit_log (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES users(id),
    action VARCHAR(255) NOT NULL,
    details JSONB,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Rate Limiting Table
CREATE TABLE IF NOT EXISTS rate_limiting (
    id BIGSERIAL PRIMARY KEY,
    identifier VARCHAR(255) NOT NULL, -- email or IP
    action_type VARCHAR(100) NOT NULL, -- 'login', 'api_call', etc.
    attempts INTEGER DEFAULT 1,
    first_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_attempt TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_blocked BOOLEAN DEFAULT FALSE,
    blocked_until TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON menu_items(category);
CREATE INDEX IF NOT EXISTS idx_reservations_date ON reservations(date);
CREATE INDEX IF NOT EXISTS idx_reservations_status ON reservations(status);
CREATE INDEX IF NOT EXISTS idx_featured_items_slot ON featured_items(slot_number);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON admin_audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_timestamp ON admin_audit_log(timestamp);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_identifier ON rate_limiting(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limiting_action ON rate_limiting(action_type);

-- Enable Row Level Security (RLS)
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE featured_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE rate_limiting ENABLE ROW LEVEL SECURITY;

-- Create policies for public access to menu items
CREATE POLICY "Public read access to menu items" ON menu_items
    FOR SELECT USING (true);

-- Create policies for authenticated users to manage menu items
CREATE POLICY "Authenticated users can manage menu items" ON menu_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for public access to reservations (insert only)
CREATE POLICY "Public can insert reservations" ON reservations
    FOR INSERT WITH CHECK (true);

-- Create policies for authenticated users to view reservations
CREATE POLICY "Authenticated users can view reservations" ON reservations
    FOR SELECT USING (auth.role() = 'authenticated');

-- Create policies for public access to featured items
CREATE POLICY "Public read access to featured items" ON featured_items
    FOR SELECT USING (true);

-- Create policies for authenticated users to manage featured items
CREATE POLICY "Authenticated users can manage featured items" ON featured_items
    FOR ALL USING (auth.role() = 'authenticated');

-- Create policies for users table (admin only access)
CREATE POLICY "Admin users can manage users" ON users
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Create policies for audit log (admin only access)
CREATE POLICY "Admin users can view audit log" ON admin_audit_log
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "System can insert audit log" ON admin_audit_log
    FOR INSERT WITH CHECK (true);

-- Create policies for rate limiting (system access)
CREATE POLICY "System can manage rate limiting" ON rate_limiting
    FOR ALL USING (true);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_menu_items_updated_at BEFORE UPDATE ON menu_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION log_admin_action(
    p_user_id UUID,
    p_action VARCHAR(255),
    p_details JSONB DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
    INSERT INTO admin_audit_log (user_id, action, details, ip_address, user_agent)
    VALUES (
        p_user_id,
        p_action,
        p_details,
        inet_client_addr(),
        current_setting('request.headers', true)::json->>'user-agent'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to check rate limiting
CREATE OR REPLACE FUNCTION check_rate_limit(
    p_identifier VARCHAR(255),
    p_action_type VARCHAR(100),
    p_max_attempts INTEGER DEFAULT 5,
    p_window_minutes INTEGER DEFAULT 15
)
RETURNS BOOLEAN AS $$
DECLARE
    v_record RECORD;
    v_is_allowed BOOLEAN := TRUE;
BEGIN
    -- Check if identifier is currently blocked
    SELECT * INTO v_record 
    FROM rate_limiting 
    WHERE identifier = p_identifier 
    AND action_type = p_action_type
    AND is_blocked = TRUE 
    AND blocked_until > NOW();
    
    IF FOUND THEN
        RETURN FALSE; -- Still blocked
    END IF;
    
    -- Get or create rate limit record
    SELECT * INTO v_record 
    FROM rate_limiting 
    WHERE identifier = p_identifier 
    AND action_type = p_action_type;
    
    IF NOT FOUND THEN
        -- First attempt
        INSERT INTO rate_limiting (identifier, action_type)
        VALUES (p_identifier, p_action_type);
        RETURN TRUE;
    END IF;
    
    -- Check if window has expired
    IF v_record.first_attempt < NOW() - INTERVAL '1 minute' * p_window_minutes THEN
        -- Reset window
        UPDATE rate_limiting 
        SET attempts = 1, first_attempt = NOW(), last_attempt = NOW(), is_blocked = FALSE, blocked_until = NULL
        WHERE id = v_record.id;
        RETURN TRUE;
    END IF;
    
    -- Check if max attempts exceeded
    IF v_record.attempts >= p_max_attempts THEN
        -- Block for 15 minutes
        UPDATE rate_limiting 
        SET is_blocked = TRUE, blocked_until = NOW() + INTERVAL '15 minutes'
        WHERE id = v_record.id;
        RETURN FALSE;
    END IF;
    
    -- Increment attempts
    UPDATE rate_limiting 
    SET attempts = attempts + 1, last_attempt = NOW()
    WHERE id = v_record.id;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert default admin user (replace with your actual admin email)
-- INSERT INTO users (email, role) VALUES ('your-admin-email@example.com', 'admin'); 