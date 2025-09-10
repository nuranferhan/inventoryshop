class InventoryManager {
    constructor() {
        this.apiBase = window.location.origin + '/api/inventory';
        this.inventory = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadInventory();
        this.loadStats();
    }

    // Event Binding
    bindEvents() {
        // Search and filter events
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Modal events
        document.getElementById('addItemBtn').addEventListener('click', () => this.openModal());
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelBtn').addEventListener('click', () => this.closeModal());
        document.getElementById('itemForm').addEventListener('submit', (e) => this.handleSubmit(e));

        // Close modal on background click
        document.getElementById('itemModal').addEventListener('click', (e) => {
            if (e.target.id === 'itemModal') this.closeModal();
        });
    }

    // API Communication Methods
    async apiRequest(endpoint, options = {}) {
        try {
            this.showLoading(true);
            
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`);
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            this.showToast(`Error: ${error.message}`, 'error');
            throw error;
        } finally {
            this.showLoading(false);
        }
    }

    async loadInventory(searchParams = '') {
        try {
            const response = await this.apiRequest(searchParams ? `?${searchParams}` : '');
            this.inventory = response.data;
            this.renderInventory();
            this.updateStats();
        } catch (error) {
            this.showError('Failed to load inventory');
        }
    }

    async createItem(itemData) {
        try {
            const response = await this.apiRequest('', {
                method: 'POST',
                body: JSON.stringify(itemData)
            });
            this.showToast('Item created successfully!', 'success');
            this.loadInventory();
            return response.data;
        } catch (error) {
            this.showToast('Failed to create item', 'error');
            throw error;
        }
    }

    async updateItem(id, itemData) {
        try {
            const response = await this.apiRequest(`/${id}`, {
                method: 'PUT',
                body: JSON.stringify(itemData)
            });
            this.showToast('Item updated successfully!', 'success');
            this.loadInventory();
            return response.data;
        } catch (error) {
            this.showToast('Failed to update item', 'error');
            throw error;
        }
    }

    async deleteItem(id) {
        if (!confirm('Are you sure you want to delete this item?')) {
            return;
        }

        try {
            await this.apiRequest(`/${id}`, { method: 'DELETE' });
            this.showToast('Item deleted successfully!', 'success');
            this.loadInventory();
        } catch (error) {
            this.showToast('Failed to delete item', 'error');
        }
    }

    // UI Rendering Methods
    renderInventory() {
        const container = document.getElementById('inventoryGrid');
        const emptyState = document.getElementById('emptyState');
        
        if (this.inventory.length === 0) {
            container.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        container.style.display = 'grid';
        emptyState.style.display = 'none';
        
        container.innerHTML = this.inventory.map(item => this.createItemCard(item)).join('');
        
        // Bind delete and edit events
        container.addEventListener('click', (e) => {
            const itemId = e.target.closest('[data-item-id]')?.dataset.itemId;
            if (!itemId) return;

            if (e.target.classList.contains('delete-btn')) {
                this.deleteItem(itemId);
            } else if (e.target.classList.contains('edit-btn')) {
                this.editItem(itemId);
            }
        });
    }

    createItemCard(item) {
        const isLowStock = item.quantity < 10;
        const formattedPrice = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(item.price);

        return `
            <div class="inventory-card" data-item-id="${item.id}">
                <div class="card-header">
                    <div>
                        <h3 class="card-title">${this.escapeHtml(item.name)}</h3>
                        <div class="card-category">${this.escapeHtml(item.category)}</div>
                    </div>
                </div>
                <p class="card-description">${this.escapeHtml(item.description || 'No description')}</p>
                <div class="card-details">
                    <div class="detail-item">
                        <div class="detail-label">Price</div>
                        <div class="detail-value price-value">${formattedPrice}</div>
                    </div>
                    <div class="detail-item">
                        <div class="detail-label">Quantity</div>
                        <div class="detail-value quantity-value ${isLowStock ? 'low-stock' : ''}">${item.quantity}</div>
                    </div>
                </div>
                <div class="card-actions">
                    <button class="btn btn-secondary btn-sm edit-btn">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn">Delete</button>
                </div>
            </div>
        `;
    }

    // Modal Management
    openModal(item = null) {
        this.currentEditId = item ? item.id : null;
        const modal = document.getElementById('itemModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('itemForm');
        
        title.textContent = item ? 'Edit Item' : 'Add New Item';
        
        if (item) {
            this.populateForm(item);
        } else {
            form.reset();
        }
        
        modal.style.display = 'flex';
        document.getElementById('itemName').focus();
    }

    closeModal() {
        document.getElementById('itemModal').style.display = 'none';
        document.getElementById('itemForm').reset();
        this.currentEditId = null;
    }

    populateForm(item) {
        document.getElementById('itemName').value = item.name;
        document.getElementById('itemDescription').value = item.description || '';
        document.getElementById('itemCategory').value = item.category;
        document.getElementById('itemPrice').value = item.price;
        document.getElementById('itemQuantity').value = item.quantity;
        document.getElementById('itemSku').value = item.sku || '';
    }

    async handleSubmit(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('itemName').value.trim(),
            description: document.getElementById('itemDescription').value.trim(),
            category: document.getElementById('itemCategory').value,
            price: parseFloat(document.getElementById('itemPrice').value),
            quantity: parseInt(document.getElementById('itemQuantity').value),
            sku: document.getElementById('itemSku').value.trim()
        };

        try {
            if (this.currentEditId) {
                await this.updateItem(this.currentEditId, formData);
            } else {
                await this.createItem(formData);
            }
            this.closeModal();
        } catch (error) {
            // Error handling is done in the API methods
        }
    }

    // Search and Filter
    handleSearch() {
        const searchTerm = document.getElementById('searchInput').value.trim();
        const category = document.getElementById('categoryFilter').value;
        
        const params = new URLSearchParams();
        if (searchTerm) params.set('q', searchTerm);
        if (category) params.set('category', category);
        
        this.loadInventory(params.toString());
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        this.loadInventory();
    }

    editItem(id) {
        const item = this.inventory.find(item => item.id === id);
        if (item) {
            this.openModal(item);
        }
    }

    // Statistics and Dashboard
    async loadStats() {
        // Since we don't have a stats endpoint, calculate from current inventory
        this.updateStats();
    }

    updateStats() {
        if (!this.inventory.length) {
            this.resetStats();
            return;
        }

        const totalItems = this.inventory.length;
        const totalValue = this.inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const categories = new Set(this.inventory.map(item => item.category)).size;
        const lowStock = this.inventory.filter(item => item.quantity < 10).length;

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalValue').textContent = new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(totalValue);
        document.getElementById('totalCategories').textContent = categories;
        document.getElementById('lowStock').textContent = lowStock;
    }

    resetStats() {
        document.getElementById('totalItems').textContent = '0';
        document.getElementById('totalValue').textContent = '$0.00';
        document.getElementById('totalCategories').textContent = '0';
        document.getElementById('lowStock').textContent = '0';
    }

    // UI Helper Methods
    showLoading(show) {
        const loader = document.getElementById('loadingIndicator');
        loader.style.display = show ? 'block' : 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('errorMessage');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }

    showToast(message, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.textContent = message;
        
        container.appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.add('show'), 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => container.removeChild(toast), 300);
        }, 3000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.inventoryManager = new InventoryManager();
});

// Performance optimization: Debounced search
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Add debounced search to input
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        const debouncedSearch = debounce(() => {
            if (window.inventoryManager) {
                window.inventoryManager.handleSearch();
            }
        }, 500);
        
        searchInput.addEventListener('input', debouncedSearch);
    }
});