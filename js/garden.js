// Garden management and growth system

const Garden = {
    GRID_SIZE: 10,
    STAGES: {
        SEED: 0,
        SPROUT: 1,
        BUD: 2,
        FLOWER: 3,
        MATURE: 4
    },

    // Plant types and their emojis
    PLANT_TYPES: {
        basic: { emoji: '🌱', stages: ['🌱', '🌿', '🍀', '🌻', '🌺'] },
        flower_1: { emoji: '🌸', stages: ['🌱', '🌿', '🌼', '🌸', '🌺'] },
        flower_2: { emoji: '🌷', stages: ['🌱', '🌿', '🌷', '🌹', '💐'] },
        flower_3: { emoji: '🌻', stages: ['🌱', '🌿', '🌻', '🌞', '☀️'] },
        tree: { emoji: '🌳', stages: ['🌱', '🌿', '🌲', '🌳', '🌴'] },
        fruit: { emoji: '🍓', stages: ['🌱', '🌿', '🌼', '🍓', '🍇'] }
    },

    // Initialize garden grid
    init() {
        this.renderGrid();
        this.loadPlants();
        this.startGrowthLoop();
    },

    // Render garden grid
    renderGrid() {
        const grid = document.getElementById('gardenGrid');
        if (!grid) return;

        grid.innerHTML = '';
        grid.style.gridTemplateColumns = `repeat(${this.GRID_SIZE}, 1fr)`;

        for (let y = 0; y < this.GRID_SIZE; y++) {
            for (let x = 0; x < this.GRID_SIZE; x++) {
                const cell = document.createElement('div');
                cell.className = 'garden-cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                grid.appendChild(cell);
            }
        }
    },

    // Load and render plants
    loadPlants() {
        const plants = Storage.getPlants();
        plants.forEach(plant => {
            this.renderPlant(plant);
        });
        this.updatePlantCount();
    },

    // Create plant from entry
    createPlant(entry, x, y) {
        const plantId = `plant-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        // Determine plant type based on unlocks and entry count
        const profile = Storage.getProfile();
        const unlockedItems = profile.unlockedItems || [];

        let availableTypes = ['basic'];
        if (unlockedItems.includes('flower')) {
            availableTypes.push('flower_1', 'flower_2', 'flower_3');
        }
        if (unlockedItems.includes('tree')) {
            availableTypes.push('tree');
        }
        if (unlockedItems.includes('fruit')) {
            availableTypes.push('fruit');
        }

        const plantType = availableTypes[Math.floor(Math.random() * availableTypes.length)];

        const plant = {
            id: plantId,
            entryId: entry.id,
            type: plantType,
            x: parseInt(x),
            y: parseInt(y),
            stage: this.STAGES.SEED,
            plantedDate: new Date().toISOString(),
            lastWatered: new Date().toISOString(),
            growthProgress: 0,
            waterCount: 1
        };

        Storage.savePlant(plant);
        this.renderPlant(plant);
        this.updatePlantCount();

        return plant;
    },

    // Render plant on grid
    renderPlant(plant) {
        const cell = this.getCellAt(plant.x, plant.y);
        if (!cell || cell.classList.contains('occupied')) return;

        cell.classList.add('occupied');
        cell.dataset.plantId = plant.id;
        cell.dataset.stage = plant.stage;

        const plantData = this.PLANT_TYPES[plant.type] || this.PLANT_TYPES.basic;
        const emoji = plantData.stages[plant.stage] || '🌱';

        cell.textContent = emoji;
        cell.classList.add('plant-seed');

        // Add stage-specific class
        if (plant.stage === this.STAGES.SPROUT) {
            cell.classList.add('plant-sprout');
        } else if (plant.stage >= this.STAGES.MATURE) {
            cell.classList.add('plant-mature');
        }
    },

    // Get cell at coordinates
    getCellAt(x, y) {
        const cells = document.querySelectorAll('.garden-cell');
        return Array.from(cells).find(cell =>
            parseInt(cell.dataset.x) === parseInt(x) &&
            parseInt(cell.dataset.y) === parseInt(y)
        );
    },

    // Water plant
    waterPlant(plantId) {
        const plant = Storage.getPlants().find(p => p.id === plantId);
        if (!plant) return;

        const now = new Date();
        const lastWatered = new Date(plant.lastWatered);
        const hoursSinceWatering = (now - lastWatered) / (1000 * 60 * 60);

        // Can water every 6 hours
        if (hoursSinceWatering < 6) {
            return { success: false, message: 'Plant needs time before watering again!' };
        }

        plant.lastWatered = now.toISOString();
        plant.waterCount = (plant.waterCount || 1) + 1;
        plant.growthProgress = Math.min(plant.growthProgress + 10, 100);

        Storage.updatePlant(plantId, plant);

        // Visual feedback
        const cell = document.querySelector(`[data-plant-id="${plantId}"]`);
        if (cell) {
            cell.classList.add('watering');
            setTimeout(() => cell.classList.remove('watering'), 600);
            cell.classList.add('watered');
            setTimeout(() => cell.classList.remove('watered'), 3000);
        }

        // Check for growth
        this.checkGrowth(plant);

        return { success: true, message: 'Plant watered! 💧' };
    },

    // Check if plant should grow
    checkGrowth(plant) {
        const plantedDate = new Date(plant.plantedDate);
        const now = new Date();
        const daysOld = (now - plantedDate) / (1000 * 60 * 60 * 24);
        const waterBonus = Math.floor((plant.waterCount || 1) / 2);

        // Growth based on days + water count
        let targetStage = this.STAGES.SEED;
        if (daysOld + waterBonus >= 5) targetStage = this.STAGES.MATURE;
        else if (daysOld + waterBonus >= 3) targetStage = this.STAGES.FLOWER;
        else if (daysOld + waterBonus >= 2) targetStage = this.STAGES.BUD;
        else if (daysOld + waterBonus >= 1) targetStage = this.STAGES.SPROUT;

        if (targetStage > plant.stage) {
            this.growPlant(plant.id, targetStage);
        }
    },

    // Grow plant to next stage
    growPlant(plantId, newStage) {
        const plant = Storage.getPlants().find(p => p.id === plantId);
        if (!plant) return;

        plant.stage = newStage;
        Storage.updatePlant(plantId, plant);

        const cell = document.querySelector(`[data-plant-id="${plantId}"]`);
        if (cell) {
            cell.classList.add('growing');
            cell.dataset.stage = newStage;

            const plantData = this.PLANT_TYPES[plant.type] || this.PLANT_TYPES.basic;
            cell.textContent = plantData.stages[newStage] || '🌱';

            // Update classes
            cell.classList.remove('plant-seed', 'plant-sprout', 'plant-mature');
            if (newStage === this.STAGES.SPROUT) {
                cell.classList.add('plant-sprout');
            } else if (newStage >= this.STAGES.MATURE) {
                cell.classList.add('plant-mature');
            }

            setTimeout(() => cell.classList.remove('growing'), 1000);
        }
    },

    // Growth loop - check all plants periodically
    startGrowthLoop() {
        setInterval(() => {
            const plants = Storage.getPlants();
            plants.forEach(plant => {
                this.checkGrowth(plant);
            });
        }, 60000); // Check every minute
    },

    // Update plant count display
    updatePlantCount() {
        const count = Storage.getPlants().length;
        const countEl = document.getElementById('plantCount');
        if (countEl) {
            countEl.textContent = count;
        }
    },

    // Get plant at coordinates
    getPlantAt(x, y) {
        return Storage.getPlants().find(p =>
            parseInt(p.x) === parseInt(x) && parseInt(p.y) === parseInt(y)
        );
    },

    // Remove plant from garden
    removePlant(plantId) {
        // Remove from UI
        const cell = document.querySelector(`[data-plant-id="${plantId}"]`);
        if (cell) {
            cell.classList.remove('occupied', 'plant-seed', 'plant-sprout', 'plant-mature');
            cell.textContent = '';
            delete cell.dataset.plantId;
            delete cell.dataset.stage;
        }

        // Remove from storage
        Storage.deletePlant(plantId);

        this.updatePlantCount();
    }
};
