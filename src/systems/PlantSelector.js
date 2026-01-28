/**
 * PlantSelector - UI system for selecting and planting plants
 * 
 * Features:
 * - Shows plant cards at top of screen
 * - Handles plant selection
 * - Shows plant preview on hover
 * - Places plants on click
 * - Checks sun cost
 */
class PlantSelector {
    constructor(scene) {
        this.scene = scene;
        this.selectedPlant = null;
        this.plantCards = [];
        this.previewPlant = null;
        
        // Available plants for v1 demo
        this.availablePlants = [
            { class: Sunflower, cost: 50, emoji: '🌻', name: 'Sunflower' },
            { class: Peashooter, cost: 100, emoji: '🌱', name: 'Peashooter' },
            { class: Walnut, cost: 50, emoji: '🥜', name: 'Walnut' },
            { class: CherryBomb, cost: 150, emoji: '💣', name: 'Cherry Bomb' }
        ];
        
        console.log('PlantSelector initialized with', this.availablePlants.length, 'plants');
    }

    /**
     * Create the plant selection UI
     */
    create() {
        const startX = 200;
        const cardWidth = 80;
        const cardSpacing = 90;
        const y = 40;
        
        this.availablePlants.forEach((plantData, index) => {
            const x = startX + (index * cardSpacing);
            const card = this.createPlantCard(x, y, plantData);
            this.plantCards.push(card);
        });
        
        // Listen for grid clicks
        this.scene.events.on('cellClicked', this.onCellClicked, this);
        
        console.log('Plant cards created');
    }

    /**
     * Create a single plant card
     */
    createPlantCard(x, y, plantData) {
        const card = this.scene.add.container(x, y);
        
        // Background
        const bg = this.scene.add.rectangle(0, 0, 70, 70, 0x3a2510);
        bg.setStrokeStyle(2, 0x8B4513);
        card.add(bg);
        
        // Plant emoji
        const emoji = this.scene.add.text(0, -5, plantData.emoji, {
            fontSize: '40px'
        }).setOrigin(0.5);
        card.add(emoji);
        
        // Cost text
        const costText = this.scene.add.text(0, 25, plantData.cost, {
            fontSize: '16px',
            fill: '#ffff00',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        card.add(costText);
        
        // Make interactive
        bg.setInteractive();
        
        // Store data
        card.setData('plantData', plantData);
        card.setData('bg', bg);
        card.setData('emoji', emoji);
        card.setData('costText', costText);
        card.setData('isAffordable', true);
        
        // Click handler
        bg.on('pointerdown', () => {
            this.selectPlant(card, plantData);
        });
        
        // Hover effect
        bg.on('pointerover', () => {
            if (card.getData('isAffordable')) {
                bg.setFillStyle(0x4a3520);
            }
        });
        
        bg.on('pointerout', () => {
            if (this.selectedPlant !== card) {
                bg.setFillStyle(0x3a2510);
            }
        });
        
        return card;
    }

    /**
     * Select a plant for planting
     */
    selectPlant(card, plantData) {
        // Check if can afford
        if (this.scene.sunCount < plantData.cost) {
            console.log('Not enough sun!', this.scene.sunCount, '/', plantData.cost);
            
            // Shake animation
            this.scene.tweens.add({
                targets: card,
                x: card.x - 5,
                duration: 50,
                yoyo: true,
                repeat: 3
            });
            return;
        }
        
        // If clicking the same card, deselect
        if (this.selectedPlant === card) {
            this.deselectPlant();
            return;
        }
        
        // Deselect previous
        if (this.selectedPlant) {
            this.deselectPlant();
        }
        
        // Select this card
        this.selectedPlant = card;
        card.getData('bg').setFillStyle(0x6a5530); // Highlight
        
        // Change instruction text
        this.scene.instructionText.setText(`Click on lawn to plant ${plantData.name}`);
        
        console.log('Selected', plantData.name, 'for planting');
    }

    /**
     * Deselect current plant
     */
    deselectPlant() {
        if (this.selectedPlant) {
            this.selectedPlant.getData('bg').setFillStyle(0x3a2510);
            this.selectedPlant = null;
        }
        
        // Remove preview if exists
        if (this.previewPlant) {
            this.previewPlant.destroy();
            this.previewPlant = null;
        }
        
        // Reset instruction
        this.scene.instructionText.setText('Select a plant and click on lawn to place it');
    }

    /**
     * Handle cell clicks for planting
     */
    onCellClicked(data) {
        if (!this.selectedPlant) return;
        
        const { row, col, cell } = data;
        const plantData = this.selectedPlant.getData('plantData');
        
        // Check if cell is occupied
        if (this.scene.gridSystem.isCellOccupied(row, col)) {
            console.log('Cell already occupied!');
            return;
        }
        
        // Check sun cost again
        if (this.scene.sunCount < plantData.cost) {
            console.log('Not enough sun!');
            this.deselectPlant();
            return;
        }
        
        // Plant it!
        this.plantAt(row, col, plantData);
    }

    /**
     * Plant a plant at the given position
     */
    plantAt(row, col, plantData) {
        const pos = this.scene.gridSystem.getCellWorldPosition(row, col);
        
        // Create the plant
        const plant = new plantData.class(this.scene, pos.x, pos.y, row, col);
        
        // Mark cell as occupied
        this.scene.gridSystem.setCellOccupied(row, col, true, plant);
        
        // Deduct sun
        this.scene.sunCount -= plantData.cost;
        this.scene.updateSunDisplay();
        
        // Store plant
        if (!this.scene.plants) {
            this.scene.plants = [];
        }
        this.scene.plants.push(plant);
        
        // Deselect
        this.deselectPlant();
        
        console.log(`Planted ${plantData.name} at [${row}, ${col}] for ${plantData.cost} sun`);
    }

    /**
     * Update plant cards (gray out if can't afford)
     */
    update() {
        this.plantCards.forEach(card => {
            const plantData = card.getData('plantData');
            const isAffordable = this.scene.sunCount >= plantData.cost;
            
            card.setData('isAffordable', isAffordable);
            
            // Visual feedback
            const emoji = card.getData('emoji');
            const costText = card.getData('costText');
            
            if (isAffordable) {
                emoji.setAlpha(1);
                costText.setStyle({ fill: '#ffff00' });
            } else {
                emoji.setAlpha(0.3);
                costText.setStyle({ fill: '#666666' });
            }
        });
    }
}
