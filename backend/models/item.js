// In-memory data store with sample data
let inventory = [
    {
        id: '1',
        name: 'Laptop Computer',
        description: 'High-performance laptop for business and gaming',
        category: 'Electronics',
        price: 999.99,
        quantity: 15,
        sku: 'LAP001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '2',
        name: 'Office Chair',
        description: 'Ergonomic office chair with lumbar support',
        category: 'Furniture',
        price: 249.99,
        quantity: 8,
        sku: 'CHR001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: '3',
        name: 'Wireless Mouse',
        description: 'Bluetooth wireless mouse with precision tracking',
        category: 'Electronics',
        price: 29.99,
        quantity: 50,
        sku: 'MOU001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    }
];

let nextId = 4;

class Item {
    static getAll() {
        return [...inventory]; // Return copy to prevent external modification
    }

    static getById(id) {
        return inventory.find(item => item.id === id);
    }

    static create(itemData) {
        const newItem = {
            id: String(nextId++),
            name: itemData.name,
            description: itemData.description || '',
            category: itemData.category,
            price: parseFloat(itemData.price),
            quantity: parseInt(itemData.quantity),
            sku: itemData.sku || this.generateSku(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        inventory.push(newItem);
        return newItem;
    }

    static update(id, updateData) {
        const itemIndex = inventory.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            return null;
        }

        const currentItem = inventory[itemIndex];
        const updatedItem = {
            ...currentItem,
            ...updateData,
            id: currentItem.id, // Preserve original ID
            createdAt: currentItem.createdAt, // Preserve creation date
            updatedAt: new Date().toISOString()
        };

        // Parse numeric fields if they exist
        if (updateData.price !== undefined) {
            updatedItem.price = parseFloat(updateData.price);
        }
        if (updateData.quantity !== undefined) {
            updatedItem.quantity = parseInt(updateData.quantity);
        }

        inventory[itemIndex] = updatedItem;
        return updatedItem;
    }

    static delete(id) {
        const itemIndex = inventory.findIndex(item => item.id === id);
        
        if (itemIndex === -1) {
            return false;
        }

        inventory.splice(itemIndex, 1);
        return true;
    }

    static generateSku() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substring(2, 5);
        return `SKU${timestamp}${random}`.toUpperCase();
    }

    // Performance optimization: Get inventory statistics
    static getStats() {
        const stats = {
            totalItems: inventory.length,
            totalValue: inventory.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            categories: {},
            lowStock: inventory.filter(item => item.quantity < 10)
        };

        inventory.forEach(item => {
            if (!stats.categories[item.category]) {
                stats.categories[item.category] = {
                    count: 0,
                    totalValue: 0
                };
            }
            stats.categories[item.category].count++;
            stats.categories[item.category].totalValue += item.price * item.quantity;
        });

        return stats;
    }
}

module.exports = Item;