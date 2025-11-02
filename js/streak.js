// Streak tracking system

const StreakManager = {
    // Calculate current streak
    calculateStreak(entries) {
        if (!entries || entries.length === 0) return 0;

        // Sort entries by date (most recent first)
        const sortedEntries = [...entries].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        let streak = 0;
        let currentDate = new Date();
        currentDate.setHours(0, 0, 0, 0);

        // Check if today has an entry
        const today = new Date(currentDate);
        const hasToday = sortedEntries.some(entry => {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);
            return entryDate.getTime() === today.getTime();
        });

        if (!hasToday) {
            // If no entry today, start from yesterday
            currentDate.setDate(currentDate.getDate() - 1);
        }

        // Count consecutive days with entries
        for (const entry of sortedEntries) {
            const entryDate = new Date(entry.date);
            entryDate.setHours(0, 0, 0, 0);

            // If entry is on or before current date being checked
            if (entryDate.getTime() === currentDate.getTime()) {
                streak++;
                currentDate.setDate(currentDate.getDate() - 1);
            } else if (entryDate.getTime() < currentDate.getTime()) {
                // Gap found, break streak
                break;
            }
        }

        return streak;
    },

    // Update streak in profile
    updateStreak() {
        const entries = Storage.getEntries();
        const profile = Storage.getProfile();
        
        const currentStreak = this.calculateStreak(entries);
        const longestStreak = Math.max(currentStreak, profile.longestStreak || 0);

        profile.currentStreak = currentStreak;
        profile.longestStreak = longestStreak;
        profile.totalEntries = entries.length;

        Storage.saveProfile(profile);
        
        return currentStreak;
    },

    // Check if streak was broken
    checkStreakBreak() {
        const entries = Storage.getEntries();
        const profile = Storage.getProfile();
        const currentStreak = this.calculateStreak(entries);

        if (profile.currentStreak > 0 && currentStreak === 0) {
            return {
                broken: true,
                previousStreak: profile.currentStreak
            };
        }

        return { broken: false };
    },

    // Get streak bonus multiplier
    getStreakBonus(streak) {
        if (streak >= 30) return 3.0; // 30+ days: 3x bonus
        if (streak >= 14) return 2.5; // 14+ days: 2.5x bonus
        if (streak >= 7) return 2.0;  // 7+ days: 2x bonus
        if (streak >= 3) return 1.5;  // 3+ days: 1.5x bonus
        return 1.0; // Default: 1x
    }
};

