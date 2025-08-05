// Menu Page - Dynamic Menu Loading
// Loads menu items from Supabase database and displays them dynamically

// Use existing Supabase configuration
const supabase = window.supabase;

// Menu categories mapping
const CATEGORY_MAPPING = {
    'starters': 'Starters/Appetizers',
    'mains': 'Main Courses', 
    'desserts': 'Desserts',
    'drinks': 'Drinks & Cocktails'
};

document.addEventListener('DOMContentLoaded', function() {
    console.log('Menu page loaded, initializing dynamic menu...');
    console.log('Supabase client:', window.supabase);
    console.log('TABLES:', window.TABLES);
    
    if (!window.supabase) {
        console.error('Supabase client not found!');
        showErrorMessage('Failed to initialize database connection.');
        return;
    }
    
    if (!window.TABLES) {
        console.error('TABLES configuration not found!');
        showErrorMessage('Failed to load database configuration.');
        return;
    }
    
    showLoading();
    
    // Small delay to ensure all scripts are loaded
    setTimeout(() => {
        loadMenuItems();
    }, 100);
});

async function loadMenuItems() {
    try {
        console.log('Loading menu items from database...');
        console.log('Using table:', window.TABLES.MENU_ITEMS);
        
        const { data: menuItems, error } = await supabase
            .from(window.TABLES.MENU_ITEMS)
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error loading menu items:', error);
            hideLoading();
            showErrorMessage('Failed to load menu items. Please try again later.');
            return;
        }

        console.log('Loaded menu items:', menuItems);
        
        hideLoading();
        
        if (menuItems && menuItems.length > 0) {
            displayMenuItems(menuItems);
        } else {
            console.log('No menu items found in database');
            showDefaultMenu();
        }

    } catch (error) {
        console.error('Error in loadMenuItems:', error);
        hideLoading();
        showDefaultMenu();
    }
}

function displayMenuItems(menuItems) {
    console.log('Displaying menu items:', menuItems);
    
    // Clear existing static content
    clearMenuContent();
    
    // Group items by category
    const itemsByCategory = groupItemsByCategory(menuItems);
    console.log('Items grouped by category:', itemsByCategory);
    
    // Display items for each category
    Object.keys(itemsByCategory).forEach(categoryId => {
        const items = itemsByCategory[categoryId];
        console.log(`Processing category ${categoryId} with ${items.length} items`);
        
        const categoryElement = document.getElementById(categoryId);
        
        if (categoryElement) {
            const menuGrid = categoryElement.querySelector('.menu-grid');
            if (menuGrid) {
                menuGrid.innerHTML = ''; // Clear existing content
                items.forEach(item => {
                    const itemCard = createMenuItemCard(item);
                    menuGrid.appendChild(itemCard);
                });
                console.log(`Added ${items.length} items to category ${categoryId}`);
            } else {
                console.error(`Menu grid not found in category ${categoryId}`);
            }
        } else {
            console.error(`Category element not found: ${categoryId}`);
        }
    });
    
    console.log('Menu items displayed successfully');
}

function groupItemsByCategory(menuItems) {
    const grouped = {
        'starters': [],
        'mains': [],
        'desserts': [],
        'drinks': []
    };
    
    // Category mapping for different possible values
    const categoryMapping = {
        'starters': ['starters', 'appetizers', 'starters/appetizers'],
        'mains': ['mains', 'main courses', 'main course', 'entrees'],
        'desserts': ['desserts', 'dessert'],
        'drinks': ['drinks', 'beverages', 'cocktails', 'drinks & cocktails']
    };
    
    menuItems.forEach(item => {
        const category = item.category?.toLowerCase();
        console.log(`Item "${item.name}" has category: "${category}"`);
        
        let assigned = false;
        
        // Try to match with category mapping
        for (const [targetCategory, possibleValues] of Object.entries(categoryMapping)) {
            if (possibleValues.includes(category)) {
                grouped[targetCategory].push(item);
                console.log(`Added to ${targetCategory} category`);
                assigned = true;
                break;
            }
        }
        
        // Default to mains if category not found
        if (!assigned) {
            grouped['mains'].push(item);
            console.log(`Added to mains category (default)`);
        }
    });
    
    return grouped;
}

function createMenuItemCard(item) {
    const card = document.createElement('div');
    card.className = 'meal-card';
    
    // Create image section
    const imageSection = document.createElement('div');
    imageSection.className = 'meal-image';
    
    if (item.image_url) {
        // Use actual image
        const img = document.createElement('img');
        img.src = item.image_url;
        img.alt = item.name;
        img.className = 'meal-img';
        imageSection.appendChild(img);
    } else {
        // Use placeholder with icon
        const placeholder = document.createElement('div');
        placeholder.className = 'meal-img-placeholder';
        const icon = document.createElement('i');
        icon.className = item.icon || 'fas fa-utensils';
        placeholder.appendChild(icon);
        imageSection.appendChild(placeholder);
    }
    
    // Add overlay
    const overlay = document.createElement('div');
    overlay.className = 'meal-overlay';
    const eyeIcon = document.createElement('i');
    eyeIcon.className = 'fas fa-eye';
    overlay.appendChild(eyeIcon);
    imageSection.appendChild(overlay);
    
    // Create price section
    const priceSection = document.createElement('div');
    priceSection.className = 'meal-price';
    priceSection.textContent = `$${parseFloat(item.price).toFixed(2)}`;
    
    // Create content section
    const contentSection = document.createElement('div');
    contentSection.className = 'meal-content';
    
    const title = document.createElement('h3');
    title.className = 'meal-title';
    title.textContent = item.name;
    
    const description = document.createElement('p');
    description.className = 'meal-description';
    description.textContent = item.description;
    
    const tagsSection = document.createElement('div');
    tagsSection.className = 'meal-tags';
    
    // Add tags if they exist
    if (item.tags) {
        const tagList = item.tags.split(',').map(tag => tag.trim());
        tagList.forEach(tag => {
            const tagSpan = document.createElement('span');
            tagSpan.className = 'meal-tag';
            tagSpan.textContent = tag;
            tagsSection.appendChild(tagSpan);
        });
    }
    
    contentSection.appendChild(title);
    contentSection.appendChild(description);
    contentSection.appendChild(tagsSection);
    
    // Assemble card
    card.appendChild(imageSection);
    card.appendChild(priceSection);
    card.appendChild(contentSection);
    
    return card;
}

function clearMenuContent() {
    // Clear all menu categories
    const menuCategories = document.querySelectorAll('.menu-category');
    menuCategories.forEach(category => {
        const menuGrid = category.querySelector('.menu-grid');
        if (menuGrid) {
            menuGrid.innerHTML = '';
        }
    });
}

function showDefaultMenu() {
    console.log('Showing default menu - no items found');
    
    // Show "no items" message in each category
    const menuCategories = document.querySelectorAll('.menu-category');
    menuCategories.forEach(category => {
        const menuGrid = category.querySelector('.menu-grid');
        if (menuGrid) {
            const noItemsDiv = document.createElement('div');
            noItemsDiv.className = 'no-items-message';
            noItemsDiv.innerHTML = `
                <div style="text-align: center; padding: 3rem; color: #666;">
                    <i class="fas fa-utensils" style="font-size: 3rem; color: #A4161A; margin-bottom: 1rem; display: block;"></i>
                    <h3 style="margin-bottom: 1rem; color: #003049;">No menu items available</h3>
                    <p style="margin: 0;">Menu items will appear here once they are added through the admin panel.</p>
                </div>
            `;
            menuGrid.appendChild(noItemsDiv);
        }
    });
}

// Add loading indicator
function showLoading() {
    const menuContent = document.querySelector('.menu-content');
    if (menuContent) {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'loading-indicator';
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading menu...';
        loadingDiv.style.textAlign = 'center';
        loadingDiv.style.padding = '2rem';
        loadingDiv.style.fontSize = '1.2rem';
        loadingDiv.style.color = '#666';
        menuContent.appendChild(loadingDiv);
    }
}

function hideLoading() {
    const loadingIndicator = document.querySelector('.loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.remove();
    }
}

function showErrorMessage(message) {
    const menuContent = document.querySelector('.menu-content');
    if (menuContent) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <i class="fas fa-exclamation-triangle"></i>
            <p>${message}</p>
        `;
        errorDiv.style.textAlign = 'center';
        errorDiv.style.padding = '2rem';
        errorDiv.style.color = '#721c24';
        errorDiv.style.backgroundColor = '#f8d7da';
        errorDiv.style.border = '1px solid #f5c6cb';
        errorDiv.style.borderRadius = '8px';
        errorDiv.style.margin = '2rem 0';
        menuContent.appendChild(errorDiv);
    }
} 