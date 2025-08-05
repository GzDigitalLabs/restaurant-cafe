# Enhanced Security Setup Guide

This guide will help you implement the 4 priority security features for your restaurant admin system.

## 1. Database Setup

### Step 1: Run the Enhanced Database Schema
1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the entire contents of `database-schema.sql`
4. Execute the script

### Step 2: Create Admin User
After running the schema, create your admin user:

```sql
-- Replace 'your-admin-email@example.com' with your actual email
INSERT INTO users (email, role) VALUES ('your-admin-email@example.com', 'admin');
```

## 2. Security Features Implemented

### ✅ Role-Based Access Control
- **Admin Role**: Full access (read, write, delete, manage_users, view_audit_log)
- **Manager Role**: Limited access (read, write)
- **User Role**: Read-only access

### ✅ Session Monitoring
- Automatic session expiry detection
- 5-minute interval session checks
- Automatic logout on session expiration

### ✅ Audit Logging
- All admin actions are logged with timestamps
- Includes user ID, action type, and details
- IP address and user agent tracking

### ✅ Rate Limiting
- 5 failed login attempts within 15 minutes
- 15-minute account lockout
- Database-level rate limiting with automatic cleanup

## 3. Testing the Security Features

### Test Rate Limiting:
1. Try logging in with wrong credentials 5 times
2. You should see "Too many login attempts" message
3. Wait 15 minutes or check the database to see the lockout

### Test Role-Based Access:
1. Create a user with 'manager' role
2. They should only see read/write permissions
3. Create a user with 'user' role
4. They should only see read permissions

### Test Audit Logging:
1. Perform any admin action (add/edit/delete menu item)
2. Check the `admin_audit_log` table in Supabase
3. You should see detailed logs of all actions

### Test Session Monitoring:
1. Log in to admin panel
2. Wait for session to expire (or manually expire it)
3. You should be automatically logged out

## 4. Database Tables Created

### `users` (Enhanced)
- `id`: UUID primary key
- `email`: User email
- `role`: 'admin', 'manager', or 'user'
- `is_active`: Boolean for account status
- `last_login`: Timestamp of last login
- `login_attempts`: Failed login counter
- `locked_until`: Account lockout timestamp

### `admin_audit_log`
- `id`: Auto-incrementing primary key
- `user_id`: Reference to users table
- `action`: Action performed (e.g., 'LOGIN_SUCCESS', 'ADD_MENU_ITEM')
- `details`: JSONB with action details
- `ip_address`: Client IP address
- `user_agent`: Browser/device info
- `timestamp`: When action occurred

### `rate_limiting`
- `id`: Auto-incrementing primary key
- `identifier`: Email or IP address
- `action_type`: Type of action ('login', 'api_call', etc.)
- `attempts`: Number of attempts
- `first_attempt`: When first attempt occurred
- `last_attempt`: When last attempt occurred
- `is_blocked`: Whether currently blocked
- `blocked_until`: When block expires

## 5. Security Functions

### `log_admin_action(user_id, action, details)`
- Logs admin actions to audit trail
- Captures IP address and user agent automatically

### `check_rate_limit(identifier, action_type, max_attempts, window_minutes)`
- Checks if action is allowed based on rate limiting
- Returns true/false for whether action should proceed

## 6. Permission Levels

### Admin Permissions:
- ✅ Read menu items
- ✅ Write (add/edit) menu items
- ✅ Delete menu items
- ✅ Manage featured items
- ✅ View audit logs
- ✅ Manage users

### Manager Permissions:
- ✅ Read menu items
- ✅ Write (add/edit) menu items
- ❌ Delete menu items
- ✅ Manage featured items
- ❌ View audit logs
- ❌ Manage users

### User Permissions:
- ✅ Read menu items
- ❌ Write menu items
- ❌ Delete menu items
- ❌ Manage featured items
- ❌ View audit logs
- ❌ Manage users

## 7. Monitoring and Maintenance

### Regular Tasks:
1. **Review Audit Logs**: Check `admin_audit_log` for suspicious activity
2. **Clean Rate Limiting**: Old rate limit records are automatically cleaned
3. **Monitor Failed Logins**: Check for patterns in failed login attempts
4. **User Management**: Regularly review and update user roles

### Security Best Practices:
1. Use strong passwords for admin accounts
2. Regularly rotate admin credentials
3. Monitor audit logs for unusual activity
4. Keep Supabase and dependencies updated
5. Consider implementing 2FA for additional security

## 8. Troubleshooting

### Common Issues:

**"User profile not found"**
- Ensure the user exists in the `users` table
- Check that the email matches exactly

**"Insufficient permissions"**
- Verify the user's role in the `users` table
- Check that the role is one of: 'admin', 'manager', 'user'

**Rate limiting not working**
- Check the `rate_limiting` table for existing records
- Verify the database functions are created correctly

**Audit logging not working**
- Check that the `log_admin_action` function exists
- Verify RLS policies allow the function to insert records

## 9. Next Steps

After implementing these security features, consider:

1. **Two-Factor Authentication**: Implement 2FA using Supabase's built-in support
2. **Password Policy**: Add client-side password strength validation
3. **Account Lockout Notifications**: Email admins when accounts are locked
4. **Security Dashboard**: Create a view to monitor security metrics
5. **Backup Strategy**: Regular backups of audit logs and user data

## 10. Support

If you encounter any issues:
1. Check the browser console for JavaScript errors
2. Review Supabase logs for database errors
3. Verify all database functions and policies are created
4. Test with a fresh admin user account

The enhanced security system is now ready to protect your restaurant admin panel! 