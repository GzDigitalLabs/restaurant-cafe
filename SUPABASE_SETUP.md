# Supabase Integration Setup Guide

This guide will help you set up the Supabase integration for your restaurant website.

## Prerequisites

1. A Supabase account (you already have this)
2. Your Supabase project URL and anon key (already provided)

## Step 1: Set Up Database Tables

1. Go to your Supabase dashboard
2. Navigate to the SQL Editor
3. Copy and paste the contents of `database-schema.sql` into the editor
4. Run the SQL commands to create the required tables

## Step 2: Configure Authentication

1. In your Supabase dashboard, go to Authentication > Settings
2. Enable Email authentication
3. Create an admin user:
   - Go to Authentication > Users
   - Click "Add User"
   - Enter admin email and password
   - This will be your admin login credentials

## Step 3: Test the Integration

1. Start your local server: `python -m http.server 8080`
2. Visit `http://localhost:8080/admin.html`
3. You should see a login form
4. Use your admin credentials to log in
5. Test adding menu items and managing featured dishes

## Step 4: Test Reservations

1. Visit `http://localhost:8080/reservation.html`
2. Fill out and submit a reservation form
3. Check your Supabase dashboard > Table Editor > reservations to see the submission

## Features Implemented

### 1. Admin Page Authentication
- Login form with Supabase authentication
- Session management
- Protected admin dashboard

### 2. Menu Management
- Add new menu items to Supabase
- View all menu items from database
- Update and delete menu items
- Featured dishes management

### 3. Reservation System
- Submit reservations to Supabase
- Form validation
- Success/error notifications

### 4. Database Tables
- `menu_items`: Store restaurant menu items
- `reservations`: Store customer reservations
- `featured_items`: Manage featured dishes
- `users`: Admin user management

## Security Features

- Row Level Security (RLS) enabled
- Public read access to menu items
- Authenticated users can manage menu items
- Public can submit reservations
- Only authenticated users can view reservations

## Troubleshooting

### Common Issues:

1. **"Supabase is not defined" error**
   - Make sure the Supabase CDN is loaded before your config file
   - Check that `supabase-config.js` is included in your HTML

2. **Authentication not working**
   - Verify your Supabase URL and anon key are correct
   - Check that email authentication is enabled in Supabase
   - Ensure you've created an admin user

3. **Database operations failing**
   - Run the database schema SQL commands
   - Check that RLS policies are properly configured
   - Verify table names match the ones in `supabase-config.js`

4. **CORS errors**
   - Add your localhost domain to Supabase CORS settings
   - Go to Settings > API > CORS and add `http://localhost:8080`

## File Structure

```
restaurant/
├── supabase-config.js    # Supabase configuration
├── auth.js              # Authentication system
├── admin.js             # Admin dashboard (updated)
├── reservations.js      # Reservation system (updated)
├── database-schema.sql  # Database setup
├── SUPABASE_SETUP.md    # This guide
└── [other existing files]
```

## Next Steps

1. Customize the admin interface as needed
2. Add more features like reservation management
3. Implement email notifications
4. Add analytics and reporting features
5. Set up automated backups

## Support

If you encounter any issues, check the browser console for error messages and refer to the Supabase documentation for additional help. 