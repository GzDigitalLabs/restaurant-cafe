# Admin Functionality Test Guide

## **Complete Admin System Testing**

### **1. Authentication Test**
- ✅ Login with admin credentials
- ✅ Redirect to admin dashboard
- ✅ Logout functionality
- ✅ Session management

### **2. Menu Item Management Test**

#### **Add New Menu Item:**
1. Click "Add New Item" tab
2. Fill in all required fields:
   - **Item Name**: "Test Burger"
   - **Price**: 15.99
   - **Description**: "Delicious beef burger with fries"
   - **Category**: "Main Courses"
   - **Icon**: "fas fa-utensils"
   - **Tags**: "Popular, Signature"
   - **Image URL**: "https://example.com/burger.jpg"
   - **Allergies**: "No"
3. Click "Add Item" button
4. **Expected**: Success notification, item appears in list

#### **View All Items:**
1. Click "View All Items" tab
2. **Expected**: All menu items displayed in grid
3. Test filter by category
4. **Expected**: Items filter correctly

#### **Edit Menu Item:**
1. Click "Edit" button on any item
2. Modify fields
3. Click "Update"
4. **Expected**: Success notification, changes saved

#### **Delete Menu Item:**
1. Click "Delete" button on any item
2. Confirm deletion
3. **Expected**: Success notification, item removed

### **3. Featured Items Test**

#### **Add Featured Items:**
1. Click "Featured Dishes" tab
2. Click on an empty slot (1-6)
3. Click on a dish to add it
4. **Expected**: Dish appears in selected slot

#### **Save Featured Items:**
1. Add items to multiple slots
2. Click "Save Featured Selection"
3. **Expected**: Success notification, items saved

#### **Clear Featured Items:**
1. Click "Clear All Featured"
2. Confirm action
3. **Expected**: All slots cleared

### **4. Image Functionality Test**

#### **Add Item with Image:**
1. Add new menu item
2. Include image URL: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=500"
3. Save item
4. **Expected**: Image displays in item card

#### **Test Different Image URLs:**
- ✅ Unsplash images
- ✅ Direct image links
- ✅ HTTPS URLs only

### **5. Database Integration Test**

#### **Check Database Tables:**
1. **menu_items** - Should store all menu items
2. **featured_items** - Should store featured selections
3. **users** - Should store admin user

#### **Verify Data Persistence:**
1. Add menu items
2. Refresh page
3. **Expected**: Items still there
4. Add featured items
5. Refresh page
6. **Expected**: Featured items still there

### **6. Error Handling Test**

#### **Test Invalid Inputs:**
- Empty required fields
- Invalid price (negative)
- Invalid image URL
- **Expected**: Proper error messages

#### **Test Network Issues:**
- Disconnect internet
- Try to save item
- **Expected**: Error notification

### **7. Permission Test**

#### **Test Admin Permissions:**
- ✅ Add items
- ✅ Edit items
- ✅ Delete items
- ✅ Manage featured items
- ✅ View all data

### **8. UI/UX Test**

#### **Responsive Design:**
- Test on different screen sizes
- **Expected**: Layout adapts properly

#### **Loading States:**
- Watch for loading spinners
- **Expected**: Smooth transitions

#### **Notifications:**
- Success messages with X button
- Error messages with X button
- Auto-hide after 3 seconds

### **9. Performance Test**

#### **Load Time:**
- Page loads quickly
- Menu items load fast
- **Expected**: < 3 seconds

#### **Smooth Interactions:**
- Button clicks responsive
- Form submissions smooth
- **Expected**: No lag

## **Common Issues & Solutions**

### **If Items Don't Save:**
1. Check browser console for errors
2. Verify Supabase connection
3. Check database permissions

### **If Images Don't Load:**
1. Verify image URL is accessible
2. Check if URL is HTTPS
3. Test with different image URLs

### **If Featured Items Don't Work:**
1. Check featured_items table exists
2. Verify foreign key relationships
3. Check database permissions

## **Database Verification**

Run these queries in Supabase SQL Editor:

```sql
-- Check menu items
SELECT * FROM menu_items ORDER BY created_at DESC;

-- Check featured items
SELECT * FROM featured_items;

-- Check user permissions
SELECT * FROM users WHERE email = 'template@gzdigitallabs.com';
```

## **Success Criteria**

✅ **All CRUD operations work**  
✅ **Images display correctly**  
✅ **Featured items save/load**  
✅ **Error handling works**  
✅ **UI is responsive**  
✅ **Data persists after refresh**  
✅ **Permissions work correctly**  

The admin system should now be fully functional and ready for production use! 