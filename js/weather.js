// Weather effect system based on gratitude frequency and mood

const WeatherSystem = {
    currentWeather: 'sunny',
    
    // Plant emojis for different weather
    plantEmojis: {
        sunny: '🌻',
        partlyCloudy: '🌼',
        cloudy: '🌸',
        rainy: '🌺',
        stormy: '🌷',
        rainbow: '✨'
    },

    // Calculate weather based on entries
    calculateWeather(entries, streak) {
        if (!entries || entries.length === 0) {
            return 'cloudy'; // Default for no entries
        }

        const now = new Date();
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        
        // Count entries in last 7 days
        const recentEntries = entries.filter(entry => {
            const entryDate = new Date(entry.date);
            return entryDate >= sevenDaysAgo;
        });

        const recentCount = recentEntries.length;
        const entryFrequency = recentCount / 7; // Entries per day

        // Weather logic based on frequency and streak
        if (streak >= 30 && recentCount >= 7) {
            return 'rainbow'; // High gratitude, long streak
        } else if (streak >= 14 && recentCount >= 5) {
            return 'sunny'; // Good streak and frequency
        } else if (entryFrequency >= 0.7) {
            return 'partlyCloudy'; // Regular entries
        } else if (entryFrequency >= 0.4) {
            return 'cloudy'; // Some entries
        } else if (recentCount === 0) {
            return 'stormy'; // No recent entries
        } else {
            return 'rainy'; // Low frequency
        }
    },

    // Apply weather to overlay
    applyWeather(weather) {
        const overlay = document.getElementById('weatherOverlay');
        if (!overlay) return;

        // Remove all weather classes
        overlay.className = 'weather-overlay';
        
        // Add new weather class
        if (weather) {
            overlay.classList.add(`weather-${weather}`);
            this.currentWeather = weather;
        }
    },

    // Update weather based on current state
    update() {
        const entries = Storage.getEntries();
        const profile = Storage.getProfile();
        const streak = profile.currentStreak || 0;
        
        const weather = this.calculateWeather(entries, streak);
        this.applyWeather(weather);
        
        return weather;
    },

    // Get weather effect bonus
    getWeatherBonus(weather) {
        const bonuses = {
            rainbow: 1.5,
            sunny: 1.3,
            partlyCloudy: 1.1,
            cloudy: 1.0,
            rainy: 0.9,
            stormy: 0.8
        };
        
        return bonuses[weather] || 1.0;
    }
};

