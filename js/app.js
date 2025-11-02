// Main application logic

const App = {
    init() {
        // Initialize all systems
        this.initProfile();
        this.initEventListeners();
        this.updateDisplay();
        Garden.init();
        Interactions.init();
        WeatherSystem.update();

        // Check for friend code in URL
        this.checkFriendCode();
    },

    // Initialize profile
    initProfile() {
        const profile = Storage.getProfile();

        // Display friend code
        const friendCodeEl = document.getElementById('friendCode');
        if (friendCodeEl) {
            friendCodeEl.textContent = profile.friendCode;
        }
    },

    // Initialize event listeners
    initEventListeners() {
        // Entry form submission
        const entryForm = document.getElementById('entryForm');
        if (entryForm) {
            entryForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleEntrySubmission();
            });
        }

        // Copy friend code
        const copyBtn = document.getElementById('copyCodeBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                const friendCode = document.getElementById('friendCode').textContent;
                navigator.clipboard.writeText(friendCode).then(() => {
                    Interactions.showNotification('Friend code copied!', 'success');
                });
            });
        }

        // Visit friend garden
        const visitBtn = document.getElementById('visitFriendBtn');
        if (visitBtn) {
            visitBtn.addEventListener('click', () => {
                const friendCode = document.getElementById('friendCodeInput').value.trim();
                if (friendCode) {
                    window.location.href = `?friend=${friendCode}`;
                } else {
                    Interactions.showNotification('Please enter a friend code', 'error');
                }
            });
        }
    },

    // Handle entry submission
    handleEntrySubmission() {
        const input = document.getElementById('gratitudeInput');
        const text = input.value.trim();

        if (!text) {
            Interactions.showNotification('Please write something you\'re grateful for!', 'error');
            return;
        }

        // Create entry
        const entry = {
            id: `entry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            text: text,
            date: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Save entry
        Storage.saveEntry(entry);

        // Update streak
        StreakManager.updateStreak();

        // Check for unlocks
        this.checkUnlocks();

        // Clear input
        input.value = '';

        // Update display
        this.updateDisplay();

        // Update weather
        WeatherSystem.update();

        Interactions.showNotification('Gratitude entry saved! 🌱', 'success');
    },

    // Update display
    updateDisplay() {
        const profile = Storage.getProfile();
        const entries = Storage.getEntries();

        // Update streak
        const streak = StreakManager.updateStreak();
        const streakEl = document.getElementById('streakCount');
        if (streakEl) {
            streakEl.textContent = streak;
        }

        // Update total entries
        const totalEl = document.getElementById('totalEntries');
        if (totalEl) {
            totalEl.textContent = entries.length;
        }

        // Update seed inventory
        this.updateSeedInventory();

        // Update unlocks
        this.updateUnlocks();
    },

    // Update seed inventory
    updateSeedInventory() {
        const entries = Storage.getEntries();
        const plants = Storage.getPlants();

        // Get entry IDs that are already planted
        const plantedEntryIds = new Set(plants.map(p => p.entryId));

        // Filter entries that haven't been planted
        const unplantedEntries = entries.filter(e => !plantedEntryIds.has(e.id));

        const container = document.getElementById('seedsContainer');
        if (!container) return;

        container.innerHTML = '';

        unplantedEntries.forEach(entry => {
            const seedEl = document.createElement('div');
            seedEl.className = 'seed-item';
            seedEl.dataset.entryId = entry.id;
            seedEl.textContent = '🌱';
            seedEl.draggable = true;
            container.appendChild(seedEl);
        });
    },

    // Add single seed to inventory
    addSeedToInventory(entry) {
        const container = document.getElementById('seedsContainer');
        if (!container) return;

        const seedEl = document.createElement('div');
        seedEl.className = 'seed-item seed-dropping';
        seedEl.dataset.entryId = entry.id;
        seedEl.textContent = '🌱';
        seedEl.draggable = true;
        container.appendChild(seedEl);

        setTimeout(() => {
            seedEl.classList.remove('seed-dropping');
        }, 400);
    },

    // Check for unlocks
    checkUnlocks() {
        const profile = Storage.getProfile();
        const totalEntries = profile.totalEntries;
        const streak = profile.currentStreak;
        const unlocks = profile.unlockedItems || [];

        const newUnlocks = [];

        // Unlock based on entries
        if (totalEntries >= 5 && !unlocks.includes('flower')) {
            Storage.addUnlock('flower');
            newUnlocks.push('flower');
        }
        if (totalEntries >= 15 && !unlocks.includes('tree')) {
            Storage.addUnlock('tree');
            newUnlocks.push('tree');
        }
        if (totalEntries >= 30 && !unlocks.includes('fruit')) {
            Storage.addUnlock('fruit');
            newUnlocks.push('fruit');
        }

        // Unlock based on streak
        if (streak >= 7 && !unlocks.includes('streak-bonus')) {
            Storage.addUnlock('streak-bonus');
            newUnlocks.push('streak-bonus');
        }
        if (streak >= 30 && !unlocks.includes('master-gardener')) {
            Storage.addUnlock('master-gardener');
            newUnlocks.push('master-gardener');
        }

        // Show unlock notifications
        if (newUnlocks.length > 0) {
            newUnlocks.forEach(unlock => {
                const messages = {
                    flower: '🌸 Unlocked: Flower Plants!',
                    tree: '🌳 Unlocked: Tree Plants!',
                    fruit: '🍓 Unlocked: Fruit Plants!',
                    'streak-bonus': '🎉 Unlocked: Streak Bonus!',
                    'master-gardener': '🏆 Master Gardener Achieved!'
                };

                setTimeout(() => {
                    Interactions.showNotification(messages[unlock] || 'New unlock!', 'achievement');
                }, newUnlocks.indexOf(unlock) * 1000);
            });

            this.updateUnlocks();
        }
    },

    // Update unlocks display
    updateUnlocks() {
        const unlocks = Storage.getUnlocks();
        const container = document.getElementById('unlocksGrid');
        if (!container) return;

        container.innerHTML = '';

        const allUnlocks = [
            { id: 'flower', emoji: '🌸', name: 'Flowers' },
            { id: 'tree', emoji: '🌳', name: 'Trees' },
            { id: 'fruit', emoji: '🍓', name: 'Fruit' },
            { id: 'streak-bonus', emoji: '⚡', name: 'Streak Bonus' },
            { id: 'master-gardener', emoji: '🏆', name: 'Master Gardener' }
        ];

        allUnlocks.forEach(unlock => {
            const unlockEl = document.createElement('div');
            unlockEl.className = 'unlock-item';

            if (unlocks.includes(unlock.id)) {
                unlockEl.textContent = unlock.emoji;
                unlockEl.title = unlock.name;
            } else {
                unlockEl.classList.add('locked');
                unlockEl.textContent = '🔒';
                unlockEl.title = `Locked: ${unlock.name}`;
            }

            container.appendChild(unlockEl);
        });
    },

    // Check for friend code in URL
    checkFriendCode() {
        const urlParams = new URLSearchParams(window.location.search);
        const friendCode = urlParams.get('friend');

        if (friendCode) {
            // For now, show a message (social features would need a backend)
            // In a real implementation, you'd fetch friend's garden data
            Interactions.showNotification(`Friend code: ${friendCode}\n(Full social features require backend)`, 'success');

            // Remove friend parameter after showing
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
};

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => App.init());
