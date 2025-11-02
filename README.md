# Gratitude Garden 🌱

An interactive web-based gratitude journal game where you plant seeds by writing gratitude entries. Watch your garden grow over time with beautiful animations, unlock new plants and decorations, and maintain your daily watering streak!

## Features

- **Plant Seeds**: Write gratitude entries to create seeds that you can plant in your garden
- **Garden Growth**: Watch your plants grow through stages (seed → sprout → bud → flower → mature)
- **Daily Streaks**: Track consecutive days of gratitude entries with streak bonuses
- **Interactive Elements**: 
  - Drag seeds to plant them
  - Click plants to water them
  - Hover over elements for details
- **Unlock System**: Unlock new plant types as you write more entries
- **Weather Effects**: Dynamic weather based on your gratitude frequency and streak
- **Social Features**: Share your garden with friends using friend codes

## Getting Started

Simply open `index.html` in a web browser. No build process required!

All data is stored locally in your browser using LocalStorage, so your garden persists between sessions.

## How to Use

1. **Write Gratitude**: Enter something you're grateful for in the text area and click "Plant Seed 🌱"
2. **Plant Seeds**: Drag seeds from your inventory to empty spaces in the garden grid
3. **Water Plants**: Click on planted seeds/plants to water them (can water every 6 hours)
4. **Watch Growth**: Plants automatically grow over time based on days since planting and watering frequency
5. **Maintain Streak**: Write entries daily to build your streak and unlock bonuses
6. **Visit Friends**: Use your friend code or enter a friend's code to visit their garden (URL: `?friend=FRIENDCODE`)

## Unlocks

- **Flowers** (🌸): Unlocked at 5 entries
- **Trees** (🌳): Unlocked at 15 entries
- **Fruit** (🍓): Unlocked at 30 entries
- **Streak Bonus** (⚡): Unlocked at 7-day streak
- **Master Gardener** (🏆): Unlocked at 30-day streak

## Weather System

The weather in your garden changes based on:
- Frequency of gratitude entries
- Current streak length
- Recent activity

Weather types: Sunny ☀️, Partly Cloudy ⛅, Cloudy ☁️, Rainy 🌧️, Stormy ⛈️, Rainbow 🌈

## Browser Requirements

- Modern browser (Chrome, Firefox, Safari, Edge)
- LocalStorage support required
- JavaScript enabled

## Hosting on GitHub Pages

1. Push this repository to GitHub
2. Go to repository Settings → Pages
3. Select your branch and save
4. Your Gratitude Garden will be live at `https://yourusername.github.io/repository-name/`

## File Structure

```
/
├── index.html          # Main HTML file
├── css/
│   ├── styles.css      # Main stylesheet
│   ├── animations.css  # Animation definitions
│   └── weather.css     # Weather effect styles
├── js/
│   ├── app.js          # Main application logic
│   ├── garden.js       # Garden management
│   ├── storage.js      # LocalStorage wrapper
│   ├── interactions.js # Drag, click, hover handlers
│   ├── streak.js       # Streak tracking
│   └── weather.js      # Weather system
└── README.md           # This file
```

## License

Free to use and modify for personal use.

## Future Enhancements

- Sound effects
- More plant varieties
- Seasonal themes
- Export garden as image
- Daily gratitude prompts
- Statistics dashboard

Enjoy cultivating your Gratitude Garden! 🌱✨

