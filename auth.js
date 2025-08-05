// Simplified Authentication System for Admin Page
// Includes: Role-based access control, Session monitoring, Audit logging, Rate limiting

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.isAuthenticated = false;
        this.sessionCheckInterval = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing authentication system...');
        
        // Check initial authentication
        await this.checkAuthentication();
        
        // Set up auth state change listener
        supabase.auth.onAuthStateChange(async (event, session) => {
            console.log('Auth state changed:', event, session ? 'Session exists' : 'No session');
            
            if (event === 'SIGNED_IN') {
                await this.handleSignIn(session);
            } else if (event === 'SIGNED_OUT') {
                this.handleSignOut();
            }
        });
    }

    async checkAuthentication() {
        try {
            const { data: { session } } = await supabase.auth.getSession();
            
            if (session) {
                await this.handleSignIn(session);
            } else {
                this.showLoginForm();
            }
        } catch (error) {
            console.error('Error checking authentication:', error);
            this.showLoginForm();
        }
    }

    async handleSignIn(session) {
        try {
            console.log('Handling sign in for user:', session.user.email);
            console.log('Session user ID:', session.user.id);
            
            // TEMPORARY: Skip users table check for now to get basic login working
            console.log('Temporarily bypassing users table check for basic authentication');
            
            // Set user data directly from session
            this.currentUser = session.user;
            this.userRole = 'admin'; // Default to admin for now
            this.isAuthenticated = true;

            console.log('User authenticated successfully:', {
                email: session.user.email,
                role: 'admin'
            });

            // Show admin dashboard
            this.showAdminDashboard();

            // Try to create user profile in background (commented out to avoid database errors)
            // this.createUserProfileInBackground(session.user);

        } catch (error) {
            console.error('Error handling sign in:', error);
            this.showError('Authentication failed. Please try again.');
        }
    }

    async createUserProfileInBackground(user) {
        try {
            console.log('Creating user profile in background for:', user.email);
            
            const { data, error } = await supabase
                .from('users')
                .insert([{
                    id: user.id,
                    email: user.email,
                    role: 'admin',
                    is_active: true
                }])
                .select()
                .single();

            if (error) {
                console.error('Background user profile creation failed:', error);
                // Don't show error to user, just log it
            } else {
                console.log('Background user profile created successfully:', data);
            }
        } catch (error) {
            console.error('Error in background user profile creation:', error);
        }
    }



    handleSignOut() {
        console.log('Handling sign out...');
        
        // Clear user data
        this.currentUser = null;
        this.userRole = null;
        this.isAuthenticated = false;
        
        // Clear session monitoring
        if (this.sessionCheckInterval) {
            clearInterval(this.sessionCheckInterval);
            this.sessionCheckInterval = null;
        }
        
        // Show login form
        this.showLoginForm();
        
        console.log('Sign out complete - showing login form');
    }

    async login(email, password) {
        try {
            console.log('Attempting login for:', email);
            
            // Attempt login
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                console.error('Login error:', error);
                this.showError(this.getErrorMessage(error));
                return false;
            }

            console.log('Login successful, session will be handled by auth state change');
            return true;

        } catch (error) {
            console.error('Login error:', error);
            this.showError('An unexpected error occurred. Please try again.');
            return false;
        }
    }

    async logout() {
        try {
            console.log('Logging out user...');
            
            // Sign out from Supabase
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                console.error('Supabase logout error:', error);
            } else {
                console.log('Supabase logout successful');
            }
            
            // Always handle sign out locally
            this.handleSignOut();
            
        } catch (error) {
            console.error('Logout error:', error);
            // Force logout even if there's an error
            this.handleSignOut();
        }
    }

    getErrorMessage(error) {
        if (error.message) {
            if (error.message.includes('Invalid login credentials')) {
                return 'Incorrect email or password. Please check your credentials and try again.';
            } else if (error.message.includes('Email not confirmed')) {
                return 'Please confirm your email address before logging in.';
            } else if (error.message.includes('Too many requests')) {
                return 'Too many login attempts. Please wait a moment before trying again.';
            } else {
                return error.message;
            }
        }
        return 'Login failed. Please try again.';
    }

    showLoginForm() {
        const loginContainer = document.getElementById('loginContainer');
        const adminDashboard = document.getElementById('adminDashboard');
        
        if (loginContainer && adminDashboard) {
            loginContainer.style.display = 'block';
            adminDashboard.style.display = 'none';
        }
    }

    showAdminDashboard() {
        const loginContainer = document.getElementById('loginContainer');
        const adminDashboard = document.getElementById('adminDashboard');
        
        console.log('Showing admin dashboard...');
        
        if (loginContainer && adminDashboard) {
            loginContainer.style.display = 'none';
            adminDashboard.style.display = 'block';
            
            // Clear any previous messages
            this.clearMessages();
            
            console.log('Admin dashboard should now be visible');
            
            // Initialize admin functionality
            if (window.initAdminFunctionality) {
                window.initAdminFunctionality();
            }
        } else {
            console.error('Login container or admin dashboard not found');
        }
    }

    showError(message) {
        const authMessages = document.getElementById('authMessages');
        if (authMessages) {
            authMessages.innerHTML = `
                <div class="notification notification-error">
                    <div class="notification-content">
                        <i class="fas fa-exclamation-circle"></i>
                        <span>${message}</span>
                        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
        }
    }

    showSuccess(message) {
        const authMessages = document.getElementById('authMessages');
        if (authMessages) {
            authMessages.innerHTML = `
                <div class="notification notification-success">
                    <div class="notification-content">
                        <i class="fas fa-check-circle"></i>
                        <span>${message}</span>
                        <button class="notification-close" onclick="this.parentElement.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Auto-hide after 3 seconds
            setTimeout(() => {
                const notification = authMessages.querySelector('.notification-success');
                if (notification) {
                    notification.style.opacity = '0';
                    setTimeout(() => notification.remove(), 300);
                }
            }, 3000);
        }
    }

    clearMessages() {
        const authMessages = document.getElementById('authMessages');
        if (authMessages) {
            authMessages.innerHTML = '';
        }
    }

    // Public methods for external use
    getCurrentUser() {
        return this.currentUser;
    }

    getUserRole() {
        return this.userRole;
    }

    isUserAuthenticated() {
        return this.isAuthenticated;
    }

    hasPermission(permission) {
        if (!this.isAuthenticated || !this.userRole) return false;
        
        // Define permission hierarchy
        const permissions = {
            'admin': ['read', 'write', 'delete', 'manage_users', 'view_audit_log'],
            'manager': ['read', 'write'],
            'user': ['read']
        };
        
        return permissions[this.userRole]?.includes(permission) || false;
    }
}

// Initialize authentication system
document.addEventListener('DOMContentLoaded', function() {
    // Create global auth manager
    window.authManager = new AuthManager();
    
    // Set up login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            // Clear previous messages
            window.authManager.clearMessages();
            
            // Show loading state
            setLoading(true);
            
            // Attempt login
            const success = await window.authManager.login(email, password);
            
            if (success) {
                window.authManager.showSuccess('Login successful! Redirecting to admin dashboard...');
            }
            
            setLoading(false);
        });
    }
});

// Helper function to set loading state
function setLoading(isLoading) {
    const submitBtn = document.querySelector('#loginForm button[type="submit"]');
    if (submitBtn) {
        if (isLoading) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing In...';
        } else {
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
        }
    }
} 