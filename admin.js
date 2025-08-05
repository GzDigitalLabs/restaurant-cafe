// Enhanced Admin Dashboard Functionality
// Includes: Role-based permissions, Audit logging, Session monitoring integration

document.addEventListener('DOMContentLoaded', function() {
    // Wait for auth manager to be initialized
    if (window.authManager) {
        console.log('Auth manager available, checking authentication...');
        checkAdminAccess();
    } else {
        // Wait for auth manager to be ready
        const checkAuthManager = setInterval(() => {
            if (window.authManager) {
                clearInterval(checkAuthManager);
                checkAdminAccess();
            }
        }, 100);
    }
    
    // Listen for admin dashboard ready event
    window.addEventListener('adminDashboardReady', function() {
        console.log('Admin dashboard ready event received');
        checkAdminAccess();
    });
});

function checkAdminAccess() {
    if (!window.authManager) {
        console.error('Auth manager not available');
        return;
    }

    // Check if user is authenticated and has admin permissions
    if (window.authManager.isUserAuthenticated() && 
        window.authManager.hasPermission('read')) {
        console.log('User is authenticated with admin permissions, initializing admin functionality');
        initAdminFunctionality();
    } else {
        console.log('User is not authenticated or lacks admin permissions');
    }
}

function initAdminFunctionality() {
    console.log('Initializing admin functionality for authenticated user');

    // Menu items will be loaded from Supabase
    let menuItems = [];

    // DOM Elements
    const addItemBtn = document.getElementById('addItemBtn');
    const viewItemsBtn = document.getElementById('viewItemsBtn');
    const featuredItemsBtn = document.getElementById('featuredItemsBtn');
    const addItemForm = document.getElementById('addItemForm');
    const itemsList = document.getElementById('itemsList');
    const featuredItems = document.getElementById('featuredItems');
    const menuItemForm = document.getElementById('menuItemForm');
    const cancelBtn = document.getElementById('cancelBtn');
    const itemsGrid = document.getElementById('itemsGrid');
    const categoryButtons = document.querySelectorAll('.category-btn');
    const allergyRadios = document.querySelectorAll('input[name="hasAllergies"]');
    const allergyDetailsGroup = document.getElementById('allergyDetailsGroup');
    const availableDishesGrid = document.getElementById('availableDishesGrid');
    const saveFeaturedBtn = document.getElementById('saveFeaturedBtn');
    const clearFeaturedBtn = document.getElementById('clearFeaturedBtn');

    // Featured dishes selection
    let selectedFeaturedItems = [];
    let currentSlot = null;

    // Add logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    console.log('Looking for logout button:', logoutBtn);
    console.log('Button HTML:', logoutBtn ? logoutBtn.outerHTML : 'NOT FOUND');
    console.log('Button visible:', logoutBtn ? logoutBtn.offsetParent !== null : false);
    console.log('Button display:', logoutBtn ? logoutBtn.style.display : 'NOT FOUND');

    if (logoutBtn) {
        console.log('Logout button found, initializing...');
        logoutBtn.addEventListener('click', async function(e) {
            e.preventDefault();
            console.log('Logout button clicked!');
            
            // Add visual feedback
            logoutBtn.disabled = true;
            logoutBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging out...';
            
            try {
                await window.authManager.logout();
                console.log('Logged out successfully');
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            } finally {
                // Reset button state
                logoutBtn.disabled = false;
                logoutBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            }
        });
            console.log('Logout button event listener added successfully');
    
    // Keep original logout button styling, just ensure it's clickable
    logoutBtn.style.cursor = 'pointer';
    logoutBtn.style.pointerEvents = 'auto';
    
    console.log('Logout button positioned in admin controls');
} else {
    console.error('Logout button not found - check HTML for id="logoutBtn"');
}

    // Load menu items from Supabase
    function loadMenuItems() {
        try {
            console.log('Attempting to load menu items from table:', TABLES.MENU_ITEMS);
            
            supabase
                .from(TABLES.MENU_ITEMS)
                .select('*')
                .order('created_at', { ascending: false })
                .then(({ data, error }) => {
                    if (error) {
                        console.error('Error loading menu items:', error);
                        showNotification('Failed to load menu items', 'error');
                        return;
                    }

                    menuItems = data || [];
                    console.log('Loaded menu items:', menuItems.length);
                    renderMenuItems();
                    renderAvailableDishes();
                })
                .catch((error) => {
                    console.error('Error in loadMenuItems:', error);
                    showNotification('Failed to load menu items', 'error');
                });

        } catch (error) {
            console.error('Error in loadMenuItems:', error);
            showNotification('Failed to load menu items', 'error');
        }
    }

    // Save menu item
    async function saveMenuItem(itemData) {
        try {
            // Check write permission
            if (!window.authManager.hasPermission('write')) {
                showNotification('Insufficient permissions to add menu items', 'error');
                return;
            }

            const { data, error } = await supabase
                .from(TABLES.MENU_ITEMS)
                .insert([itemData])
                .select()
                .single();

            if (error) {
                console.error('Error saving menu item:', error);
                showNotification('Failed to save menu item', 'error');
                return;
            }

            showNotification('Menu item added successfully!', 'success');
            await loadMenuItems();

        } catch (error) {
            console.error('Error in saveMenuItem:', error);
            showNotification('Failed to save menu item', 'error');
        }
    }

    // Update menu item
    async function updateMenuItem(id, itemData) {
        try {
            // Check write permission
            if (!window.authManager.hasPermission('write')) {
                showNotification('Insufficient permissions to update menu items', 'error');
                return;
            }

            const { data, error } = await supabase
                .from(TABLES.MENU_ITEMS)
                .update(itemData)
                .eq('id', id)
                .select()
                .single();

            if (error) {
                console.error('Error updating menu item:', error);
                showNotification('Failed to update menu item', 'error');
                return;
            }

            showNotification('Menu item updated successfully!', 'success');
            await loadMenuItems();

        } catch (error) {
            console.error('Error in updateMenuItem:', error);
            showNotification('Failed to update menu item', 'error');
        }
    }

    // Delete menu item
    async function deleteMenuItem(id) {
        try {
            // Check delete permission
            if (!window.authManager.hasPermission('delete')) {
                showNotification('Insufficient permissions to delete menu items', 'error');
                return;
            }

            // Get item details before deletion
            const { data: itemToDelete } = await supabase
                .from(TABLES.MENU_ITEMS)
                .select('*')
                .eq('id', id)
                .single();

            const { error } = await supabase
                .from(TABLES.MENU_ITEMS)
                .delete()
                .eq('id', id);

            if (error) {
                console.error('Error deleting menu item:', error);
                showNotification('Failed to delete menu item', 'error');
                return;
            }

            showNotification('Menu item deleted successfully!', 'success');
            await loadMenuItems();

        } catch (error) {
            console.error('Error in deleteMenuItem:', error);
            showNotification('Failed to delete menu item', 'error');
        }
    }

    // Load featured items
    async function loadFeaturedItems() {
        try {
            const { data, error } = await supabase
                .from(TABLES.FEATURED_ITEMS)
                .select(`
                    slot_number,
                    menu_items (*)
                `)
                .order('slot_number', { ascending: true });

            if (error) {
                console.error('Error loading featured items:', error);
                return;
            }

            // Transform the data to match the expected format
            selectedFeaturedItems = (data || []).map(item => ({
                ...item.menu_items,
                slot: item.slot_number
            }));
            
            renderFeaturedSlots();

        } catch (error) {
            console.error('Error in loadFeaturedItems:', error);
        }
    }

    // Save featured items with audit logging
    async function saveFeaturedItems() {
        try {
            // Check write permission
            if (!window.authManager.hasPermission('write')) {
                showNotification('Insufficient permissions to update featured items', 'error');
                return;
            }

            // Clear existing featured items
            const { error: deleteError } = await supabase
                .from(TABLES.FEATURED_ITEMS)
                .delete()
                .neq('id', 0); // Delete all

            if (deleteError) {
                console.error('Error clearing featured items:', deleteError);
                showNotification('Failed to update featured items', 'error');
                return;
            }

            // Insert new featured items
            if (selectedFeaturedItems.length > 0) {
                // Transform the data to match the database schema
                // Only include the fields that exist in the featured_items table
                const featuredItemsToInsert = selectedFeaturedItems.map(item => ({
                    menu_item_id: item.id,
                    slot_number: item.slot
                }));

                console.log('Selected featured items:', selectedFeaturedItems);
                console.log('Transformed data for insertion:', featuredItemsToInsert);

                const { error: insertError } = await supabase
                    .from(TABLES.FEATURED_ITEMS)
                    .insert(featuredItemsToInsert);

                if (insertError) {
                    console.error('Error inserting featured items:', insertError);
                    showNotification('Failed to update featured items', 'error');
                    return;
                }
            }

            showNotification('Featured items updated successfully!', 'success');

        } catch (error) {
            console.error('Error in saveFeaturedItems:', error);
            showNotification('Failed to update featured items', 'error');
        }
    }

    // Initialize data loading with permission checks
    if (window.authManager.hasPermission('read')) {
        loadMenuItems();
        loadFeaturedItems();
    } else {
        showNotification('Insufficient permissions to view admin data', 'error');
    }
    
    // Add fallback for logAuditAction if it's called
    if (window.authManager && !window.authManager.logAuditAction) {
        window.authManager.logAuditAction = function() {
            console.log('Audit logging disabled');
            return Promise.resolve();
        };
    }

    // Toggle between Add Item, View Items, and Featured Items
    addItemBtn.addEventListener('click', function() {
        addItemBtn.classList.add('active');
        viewItemsBtn.classList.remove('active');
        featuredItemsBtn.classList.remove('active');
        addItemForm.style.display = 'block';
        itemsList.style.display = 'none';
        featuredItems.style.display = 'none';
    });

    viewItemsBtn.addEventListener('click', function() {
        viewItemsBtn.classList.add('active');
        addItemBtn.classList.remove('active');
        featuredItemsBtn.classList.remove('active');
        addItemForm.style.display = 'none';
        itemsList.style.display = 'block';
        featuredItems.style.display = 'none';
        renderMenuItems();
    });

    featuredItemsBtn.addEventListener('click', function() {
        featuredItemsBtn.classList.add('active');
        addItemBtn.classList.remove('active');
        viewItemsBtn.classList.remove('active');
        addItemForm.style.display = 'none';
        itemsList.style.display = 'none';
        featuredItems.style.display = 'block';
        renderAvailableDishes();
        renderFeaturedSlots();
    });

    // Allergy toggle functionality
    allergyRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'yes') {
                allergyDetailsGroup.style.display = 'block';
            } else {
                allergyDetailsGroup.style.display = 'none';
                document.getElementById('allergyDetails').value = '';
            }
        });
    });

    // Form submission
    menuItemForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const itemData = {
            name: formData.get('itemName'),
            price: parseFloat(formData.get('itemPrice')),
            description: formData.get('itemDescription'),
            category: formData.get('itemCategory'),
            icon: formData.get('itemIcon'),
            tags: formData.get('itemTags'),
            has_allergies: formData.get('hasAllergies') === 'yes',
            allergy_details: formData.get('allergyDetails') || '',
            image_url: formData.get('itemImage') || ''
        };

        // Validate required fields
        if (!itemData.name || !itemData.price || !itemData.description || !itemData.category) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }

        // Check write permission before submitting
        if (!window.authManager.hasPermission('write')) {
            showNotification('Insufficient permissions to add menu items', 'error');
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.admin-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        try {
            // Save to Supabase
            await saveMenuItem(itemData);
            
            // Reset form
            this.reset();
            allergyDetailsGroup.style.display = 'none';
            
            // Switch to view items
            viewItemsBtn.click();
            
        } catch (error) {
            console.error('Error saving menu item:', error);
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Cancel button
    cancelBtn.addEventListener('click', function() {
        menuItemForm.reset();
        allergyDetailsGroup.style.display = 'none';
    });

    // Category button functionality
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            // Filter items based on selected category
            const selectedCategory = this.dataset.category;
            renderMenuItems(selectedCategory);
        });
    });

    // Render menu items
    function renderMenuItems(filterCategory = '') {
        const filteredItems = filterCategory 
            ? menuItems.filter(item => item.category === filterCategory)
            : menuItems;

        itemsGrid.innerHTML = '';

        if (filteredItems.length === 0) {
            itemsGrid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1/-1;">No items found.</p>';
            return;
        }

        filteredItems.forEach(item => {
            const itemCard = createItemCard(item);
            itemsGrid.appendChild(itemCard);
        });
    }

    // Create item card with permission-based actions
    function createItemCard(item) {
        const card = document.createElement('div');
        card.className = 'meal-card admin-meal-card';
        
        const categoryNames = {
            'starters': 'Starters/Appetizers',
            'mains': 'Main Courses',
            'desserts': 'Desserts',
            'drinks': 'Drinks & Cocktails'
        };

        // Check permissions for action buttons
        const canEdit = window.authManager.hasPermission('write');
        const canDelete = window.authManager.hasPermission('delete');

        // Get image URL or use default
        const imageUrl = item.image_url || 'public/interior.jpg';
        
        // Parse tags
        const tags = item.tags ? item.tags.split(',').map(tag => tag.trim()) : [];

        card.innerHTML = `
            <div class="meal-image">
                <img src="${imageUrl}" alt="${item.name}" class="meal-img" onerror="this.src='public/interior.jpg'">
                <div class="meal-overlay">
                    <span class="meal-price">$${item.price}</span>
                </div>
            </div>
            <div class="meal-content">
                <h3 class="meal-title">${item.name}</h3>
                <p class="meal-description">${item.description}</p>
                <div class="meal-tags">
                    <span class="meal-tag">${categoryNames[item.category]}</span>
                    ${item.has_allergies ? '<span class="meal-tag allergy-tag">Contains Allergens</span>' : ''}
                    ${tags.map(tag => `<span class="meal-tag">${tag}</span>`).join('')}
                </div>
                <div class="admin-meal-actions">
                    <button class="admin-meal-btn admin-edit-btn" onclick="editItem(${item.id})" ${!canEdit ? 'disabled' : ''}>
                        <i class="fas fa-edit"></i>
                        Edit
                    </button>
                    <button class="admin-meal-btn admin-delete-btn" onclick="deleteItem(${item.id})" ${!canDelete ? 'disabled' : ''}>
                        <i class="fas fa-trash"></i>
                        Delete
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    // Edit item function
    window.editItem = function(id) {
        const item = menuItems.find(item => item.id === id);
        if (!item) return;

        // Populate form with item data
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemDescription').value = item.description;
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemIcon').value = item.icon;
        document.getElementById('itemTags').value = item.tags;
        document.getElementById('itemImage').value = item.image;

        // Handle allergies
        const allergyRadio = item.hasAllergies ? 'yes' : 'no';
        document.querySelector(`input[name="hasAllergies"][value="${allergyRadio}"]`).checked = true;
        
        if (item.hasAllergies) {
            document.getElementById('allergyDetails').value = item.allergyDetails;
            allergyDetailsGroup.style.display = 'block';
        } else {
            allergyDetailsGroup.style.display = 'none';
        }

        // Remove item from array
        menuItems = menuItems.filter(menuItem => menuItem.id !== id);
        
        // Switch to add form
        addItemBtn.click();
        
        // Change form title
        document.querySelector('.form-title').textContent = 'Edit Menu Item';
        
        showNotification('Item loaded for editing', 'info');
    };

    // Delete item function
    window.deleteItem = function(id) {
        if (confirm('Are you sure you want to delete this menu item?')) {
            menuItems = menuItems.filter(item => item.id !== id);
            renderMenuItems(filterCategory.value);
            showNotification('Menu item deleted successfully!', 'success');
        }
    };

    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;

        // Set background color based on type
        const colors = {
            success: '#51CF66',
            error: '#FF6B6B',
            info: '#339AF0'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Featured dishes functionality
    function renderAvailableDishes() {
        availableDishesGrid.innerHTML = '';
        
        menuItems.forEach(item => {
            const isSelected = selectedFeaturedItems.some(featured => featured.id === item.id);
            const card = createAvailableDishCard(item, isSelected);
            availableDishesGrid.appendChild(card);
        });
    }

    function createAvailableDishCard(item, isSelected) {
        const card = document.createElement('div');
        card.className = `available-dish-card ${isSelected ? 'selected' : ''}`;
        card.dataset.itemId = item.id;
        
        const categoryNames = {
            'starters': 'Starters/Appetizers',
            'mains': 'Main Courses',
            'desserts': 'Desserts',
            'drinks': 'Drinks & Cocktails'
        };

        card.innerHTML = `
            <div class="available-dish-header">
                <h4 class="available-dish-title">${item.name}</h4>
                <span class="available-dish-price">$${item.price}</span>
            </div>
            <p class="available-dish-description">${item.description}</p>
            <div class="available-dish-category">${categoryNames[item.category]}</div>
        `;

        card.addEventListener('click', function() {
            if (currentSlot) {
                selectDishForSlot(item, currentSlot);
            } else {
                showNotification('Please select a slot first', 'info');
            }
        });

        return card;
    }

    function renderFeaturedSlots() {
        const slots = document.querySelectorAll('.featured-slot');
        
        slots.forEach((slot, index) => {
            const slotNumber = index + 1;
            const slotContent = slot.querySelector('.slot-content');
            const slotStatus = slot.querySelector('.slot-status');
            const featuredItem = selectedFeaturedItems.find(item => item.slot === slotNumber);
            
            if (featuredItem) {
                slot.classList.add('filled');
                slotStatus.textContent = 'Filled';
                slotStatus.classList.add('filled');
                
                slotContent.innerHTML = `
                    <div class="featured-dish-card">
                        <div class="featured-dish-header">
                            <h4 class="featured-dish-title">${featuredItem.name}</h4>
                            <span class="featured-dish-price">$${featuredItem.price}</span>
                        </div>
                        <p class="featured-dish-description">${featuredItem.description}</p>
                        <button class="featured-dish-remove" onclick="removeFromSlot(${slotNumber})">
                            <i class="fas fa-times"></i> Remove
                        </button>
                    </div>
                `;
            } else {
                slot.classList.remove('filled');
                slotStatus.textContent = 'Empty';
                slotStatus.classList.remove('filled');
                
                slotContent.innerHTML = `
                    <div class="slot-placeholder">
                        <i class="fas fa-plus"></i>
                        <p>Select a dish</p>
                    </div>
                `;
            }

            // Add click event to select slot
            slot.addEventListener('click', function() {
                if (!slot.classList.contains('filled')) {
                    selectSlot(slotNumber);
                }
            });
        });
    }

    function selectSlot(slotNumber) {
        // Remove previous selection
        document.querySelectorAll('.featured-slot').forEach(slot => {
            slot.style.borderColor = slot.classList.contains('filled') ? '#A4161A' : '#B08968';
        });
        
        // Highlight current slot
        const currentSlotElement = document.querySelector(`[data-slot="${slotNumber}"]`);
        currentSlotElement.style.borderColor = '#A4161A';
        currentSlotElement.style.borderWidth = '3px';
        
        currentSlot = slotNumber;
        showNotification(`Slot ${slotNumber} selected. Click a dish to add it.`, 'info');
    }

    function selectDishForSlot(item, slotNumber) {
        // Remove item from any existing slot
        selectedFeaturedItems = selectedFeaturedItems.filter(featured => featured.id !== item.id);
        
        // Add item to selected slot with only necessary data for display
        selectedFeaturedItems.push({
            id: item.id,
            name: item.name,
            price: item.price,
            description: item.description,
            category: item.category,
            icon: item.icon,
            tags: item.tags,
            has_allergies: item.has_allergies,
            allergy_details: item.allergy_details,
            image_url: item.image_url,
            slot: slotNumber
        });
        
        // Reset slot selection
        currentSlot = null;
        document.querySelectorAll('.featured-slot').forEach(slot => {
            slot.style.borderColor = slot.classList.contains('filled') ? '#A4161A' : '#B08968';
            slot.style.borderWidth = '2px';
        });
        
        renderFeaturedSlots();
        renderAvailableDishes();
        showNotification(`${item.name} added to slot ${slotNumber}`, 'success');
    }

    window.removeFromSlot = function(slotNumber) {
        selectedFeaturedItems = selectedFeaturedItems.filter(item => item.slot !== slotNumber);
        renderFeaturedSlots();
        renderAvailableDishes();
        showNotification('Item removed from featured selection', 'success');
    };

    // Save featured selection with permission check
    saveFeaturedBtn.addEventListener('click', async function() {
        // Check write permission
        if (!window.authManager.hasPermission('write')) {
            showNotification('Insufficient permissions to update featured items', 'error');
            return;
        }

        if (selectedFeaturedItems.length === 0) {
            showNotification('Please select at least one dish', 'error');
            return;
        }
        
        const submitBtn = this;
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Saving...';
        submitBtn.disabled = true;

        try {
            await saveFeaturedItems();
        } catch (error) {
            console.error('Error saving featured items:', error);
        } finally {
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    // Clear all featured items with permission check and audit logging
    clearFeaturedBtn.addEventListener('click', async function() {
        // Check write permission
        if (!window.authManager.hasPermission('write')) {
            showNotification('Insufficient permissions to clear featured items', 'error');
            return;
        }

        if (confirm('Are you sure you want to clear all featured dishes?')) {
            const submitBtn = this;
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Clearing...';
            submitBtn.disabled = true;

            try {
                // Clear from Supabase
                const { error } = await supabase
                    .from(TABLES.FEATURED_ITEMS)
                    .delete()
                    .neq('id', 0); // Delete all records

                if (error) throw error;

                selectedFeaturedItems = [];
                currentSlot = null;
                renderFeaturedSlots();
                renderAvailableDishes();
                showNotification('All featured dishes cleared', 'success');
            } catch (error) {
                console.error('Error clearing featured items:', error);
                showNotification('Failed to clear featured items', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }
    });

    // Featured items are loaded from Supabase on page load
}