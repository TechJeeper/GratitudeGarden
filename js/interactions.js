// Drag, click, and hover interactions

const Interactions = {
    draggedSeed: null,
    tooltip: null,

    init() {
        this.setupTooltip();
        this.setupDragAndDrop();
        this.setupClickToWater();
        this.setupHover();
    },

    // Setup tooltip element
    setupTooltip() {
        this.tooltip = document.getElementById('tooltip');
        if (!this.tooltip) {
            this.tooltip = document.createElement('div');
            this.tooltip.id = 'tooltip';
            this.tooltip.className = 'tooltip';
            document.body.appendChild(this.tooltip);
        }
    },

    // Show tooltip
    showTooltip(element, text, event) {
        if (!this.tooltip || !text) return;

        const rect = element.getBoundingClientRect();
        this.tooltip.textContent = text;
        this.tooltip.style.left = `${rect.left + rect.width / 2}px`;
        this.tooltip.style.top = `${rect.top - 10}px`;
        this.tooltip.style.transform = 'translate(-50%, -100%)';
        this.tooltip.classList.add('visible');
    },

    // Hide tooltip
    hideTooltip() {
        if (this.tooltip) {
            this.tooltip.classList.remove('visible');
        }
    },

    // Setup drag and drop for seeds
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList.contains('seed-item')) {
                this.draggedSeed = e.target.dataset.entryId;
                e.target.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('seed-item')) {
                e.target.classList.remove('dragging');
                this.draggedSeed = null;
            }
        });

        document.addEventListener('dragover', (e) => {
            if (this.draggedSeed && e.target.classList.contains('garden-cell')) {
                e.preventDefault();
                e.dataTransfer.dropEffect = 'move';
                
                // Visual feedback
                if (!e.target.classList.contains('occupied')) {
                    e.target.style.backgroundColor = 'rgba(74, 124, 89, 0.3)';
                }
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList.contains('garden-cell')) {
                e.target.style.backgroundColor = '';
            }
        });

        document.addEventListener('drop', (e) => {
            e.preventDefault();
            
            if (this.draggedSeed && e.target.classList.contains('garden-cell')) {
                // Reset background
                e.target.style.backgroundColor = '';

                // Check if cell is occupied
                if (e.target.classList.contains('occupied')) {
                    this.showNotification('This spot is already occupied!', 'error');
                    return;
                }

                // Get entry
                const entries = Storage.getEntries();
                const entry = entries.find(ent => ent.id === this.draggedSeed);
                
                if (!entry) {
                    this.showNotification('Seed not found!', 'error');
                    return;
                }

                // Get coordinates
                const x = e.target.dataset.x;
                const y = e.target.dataset.y;

                // Create plant
                const plant = Garden.createPlant(entry, x, y);
                
                // Remove seed from inventory
                const seedElement = document.querySelector(`[data-entry-id="${this.draggedSeed}"]`);
                if (seedElement) {
                    seedElement.classList.add('seed-dropping');
                    setTimeout(() => {
                        seedElement.remove();
                        App.updateSeedInventory();
                    }, 400);
                }

                // Animation
                e.target.classList.add('plant');
                setTimeout(() => e.target.classList.remove('plant'), 1000);

                this.showNotification('Seed planted! 🌱', 'success');
                
                this.draggedSeed = null;
            }
        });
    },

    // Setup click to water
    setupClickToWater() {
        document.addEventListener('click', (e) => {
            const cell = e.target.closest('.garden-cell');
            if (!cell) return;

            if (cell.classList.contains('occupied')) {
                const plantId = cell.dataset.plantId;
                if (plantId) {
                    const result = Garden.waterPlant(plantId);
                    if (result.success) {
                        this.showNotification(result.message, 'success');
                    } else {
                        this.showNotification(result.message, 'error');
                    }
                }
            }
        });
    },

    // Setup hover for details
    setupHover() {
        // Hover over plants
        document.addEventListener('mouseenter', (e) => {
            const cell = e.target.closest('.garden-cell');
            if (cell && cell.classList.contains('occupied')) {
                const plantId = cell.dataset.plantId;
                const plant = Storage.getPlants().find(p => p.id === plantId);
                
                if (plant) {
                    const plantData = Garden.PLANT_TYPES[plant.type] || Garden.PLANT_TYPES.basic;
                    const stageNames = ['Seed', 'Sprout', 'Bud', 'Flower', 'Mature'];
                    const plantedDate = new Date(plant.plantedDate);
                    const daysOld = Math.floor((Date.now() - plantedDate) / (1000 * 60 * 60 * 24));
                    
                    const tooltipText = `${plantData.stages[plant.stage]} ${stageNames[plant.stage]}\n` +
                                      `Planted: ${daysOld} day${daysOld !== 1 ? 's' : ''} ago\n` +
                                      `Watered: ${plant.waterCount || 1} time${(plant.waterCount || 1) !== 1 ? 's' : ''}\n` +
                                      `Click to water 💧`;
                    
                    this.showTooltip(cell, tooltipText, e);
                }
            }
        }, true);

        // Hover over seeds
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList.contains('seed-item')) {
                const entryId = e.target.dataset.entryId;
                const entries = Storage.getEntries();
                const entry = entries.find(ent => ent.id === entryId);
                
                if (entry) {
                    const entryDate = new Date(entry.date);
                    const tooltipText = `Drag to plant\n"${entry.text.substring(0, 50)}${entry.text.length > 50 ? '...' : ''}"\n${entryDate.toLocaleDateString()}`;
                    this.showTooltip(e.target, tooltipText, e);
                }
            }
        }, true);

        // Hide tooltip on mouse leave
        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList.contains('garden-cell') || 
                e.target.classList.contains('seed-item')) {
                this.hideTooltip();
            }
        }, true);
    },

    // Show notification
    showNotification(message, type = 'success') {
        const notification = document.getElementById('notification');
        if (!notification) return;

        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('visible');

        setTimeout(() => {
            notification.classList.remove('visible');
        }, 3000);
    }
};

