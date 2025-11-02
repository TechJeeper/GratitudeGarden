// LocalStorage wrapper for Gratitude Garden

const Storage = {
    // Keys
    KEYS: {
        ENTRIES: 'gratitude_entries',
        GARDEN: 'garden_plants',
        PROFILE: 'user_profile',
        UNLOCKS: 'unlocked_items'
    },

    // Save gratitude entry
    saveEntry(entry) {
        const entries = this.getEntries();
        entries.push(entry);
        localStorage.setItem(this.KEYS.ENTRIES, JSON.stringify(entries));
        return entry;
    },

    // Get all entries
    getEntries() {
        const entries = localStorage.getItem(this.KEYS.ENTRIES);
        return entries ? JSON.parse(entries) : [];
    },

    // Get entries by date range
    getEntriesByDateRange(startDate, endDate) {
        const entries = this.getEntries();
        return entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= startDate && entryDate <= endDate;
        });
    },

    // Save garden plant
    savePlant(plant) {
        const plants = this.getPlants();
        plants.push(plant);
        localStorage.setItem(this.KEYS.GARDEN, JSON.stringify(plants));
        return plant;
    },

    // Get all plants
    getPlants() {
        const plants = localStorage.getItem(this.KEYS.GARDEN);
        return plants ? JSON.parse(plants) : [];
    },

    // Update plant
    updatePlant(plantId, updates) {
        const plants = this.getPlants();
        const index = plants.findIndex(p => p.id === plantId);
        if (index !== -1) {
            plants[index] = { ...plants[index], ...updates };
            localStorage.setItem(this.KEYS.GARDEN, JSON.stringify(plants));
            return plants[index];
        }
        return null;
    },

    // Delete plant
    deletePlant(plantId) {
        const plants = this.getPlants();
        const filtered = plants.filter(p => p.id !== plantId);
        localStorage.setItem(this.KEYS.GARDEN, JSON.stringify(filtered));
    },

    // Save user profile
    saveProfile(profile) {
        localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
        return profile;
    },

    // Get user profile
    getProfile() {
        const profile = localStorage.getItem(this.KEYS.PROFILE);
        if (profile) {
            return JSON.parse(profile);
        }
        
        // Create default profile
        const defaultProfile = {
            username: '',
            currentStreak: 0,
            longestStreak: 0,
            totalEntries: 0,
            unlockedItems: [],
            lastEntryDate: null,
            friendCode: this.generateFriendCode()
        };
        this.saveProfile(defaultProfile);
        return defaultProfile;
    },

    // Generate unique friend code
    generateFriendCode() {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    },

    // Save unlocked items
    saveUnlocks(unlockedItems) {
        localStorage.setItem(this.KEYS.UNLOCKS, JSON.stringify(unlockedItems));
    },

    // Get unlocked items
    getUnlocks() {
        const unlocks = localStorage.getItem(this.KEYS.UNLOCKS);
        return unlocks ? JSON.parse(unlocks) : [];
    },

    // Add unlocked item
    addUnlock(itemId) {
        const unlocks = this.getUnlocks();
        if (!unlocks.includes(itemId)) {
            unlocks.push(itemId);
            this.saveUnlocks(unlocks);
            
            // Update profile
            const profile = this.getProfile();
            profile.unlockedItems = unlocks;
            this.saveProfile(profile);
            
            return true;
        }
        return false;
    },

    // Export data
    exportData() {
        return {
            entries: this.getEntries(),
            plants: this.getPlants(),
            profile: this.getProfile(),
            unlocks: this.getUnlocks(),
            exportDate: new Date().toISOString()
        };
    },

    // Import data
    importData(data) {
        if (data.entries) {
            localStorage.setItem(this.KEYS.ENTRIES, JSON.stringify(data.entries));
        }
        if (data.plants) {
            localStorage.setItem(this.KEYS.GARDEN, JSON.stringify(data.plants));
        }
        if (data.profile) {
            localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(data.profile));
        }
        if (data.unlocks) {
            localStorage.setItem(this.KEYS.UNLOCKS, JSON.stringify(data.unlocks));
        }
        return true;
    },

    // Clear all data
    clearAll() {
        Object.values(this.KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
};

