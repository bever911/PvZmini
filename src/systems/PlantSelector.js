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
        this.shovelActive = false;
        this.moveMode = false;
        this.plantToMove = null;
        
        // All available plants with unlock requirements
        this.allPlants = [
            { class: Sunflower, cost: 50, emoji: '🌻', name: 'Sunflower', unlockWave: 0 },
            { class: Peashooter, cost: 100, emoji: '🌱', name: 'Peashooter', unlockWave: 0 },
            { class: Walnut, cost: 50, emoji: '🥜', name: 'Walnut', unlockWave: 0 },
            { class: CherryBomb, cost: 150, emoji: '💣', name: 'Cherry Bomb', unlockWave: 0 },
            { class: Repeater, cost: 200, emoji: '🌿', name: 'Repeater', unlockWave: 3 },
            { class: SnowPea, cost: 175, emoji: '❄️', name: 'Snow Pea', unlockWave: 5 },
            { class: Chomper, cost: 150, emoji: '🌺', name: 'Chomper', unlockWave: 7 }
        ];
        
        this.availablePlants = this.allPlants.filter(p => p.unlockWave === 0);
        
        console.log('PlantSelector initialized with', this.allPlants.length, 'total plants');
    }

    /**
     * Create the plant selection UI
     */
    create() {
        const startX = 200;
        const cardWidth = 80;
        const cardSpacing = 90;
        const y = 90; // Moved down from 40 to avoid covering title
        
        // Create all plant cards (including locked ones)
        this.allPlants.forEach((plantData, index) => {
            const x = startX + (index * cardSpacing);
            const card = this.createPlantCard(x, y, plantData);
            this.plantCards.push(card);
        });
        
        // Create shovel tool at the end
        const shovelX = startX + (this.allPlants.length * cardSpacing);
        this.createShovelTool(shovelX, y);
        
        // Listen for grid clicks
        this.scene.events.on('cellClicked', this.onCellClicked, this);
        
        console.log('Plant cards and shovel created');
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
        
        // Check if plant is locked
        const isLocked = plantData.unlockWave > 0;
        if (isLocked) {
            const lockOverlay = this.scene.add.rectangle(0, 0, 70, 70, 0x000000, 0.7);
            lockOverlay.setName('lockOverlay');
            card.add(lockOverlay);
            
            const lockIcon = this.scene.add.text(0, 0, '🔒', {
                fontSize: '30px'
            }).setOrigin(0.5);
            lockIcon.setName('lockIcon');
            card.add(lockIcon);
            
            const waveText = this.scene.add.text(0, 28, 'W' + plantData.unlockWave, {
                fontSize: '12px',
                fill: '#ffaa00',
                stroke: '#000',
                strokeThickness: 2
            }).setOrigin(0.5);
            waveText.setName('waveText');
            card.add(waveText);
        }
        
        // Make interactive
        bg.setInteractive();
        
        // Store data
        card.setData('plantData', plantData);
        card.setData('bg', bg);
        card.setData('emoji', emoji);
        card.setData('costText', costText);
        card.setData('isAffordable', true);
        card.setData('isLocked', isLocked);
        
        // Click handler
        bg.on('pointerdown', () => {
            if (!isLocked) {
                this.selectPlant(card, plantData);
            }
        });
        
        // Hover effect
        bg.on('pointerover', () => {
            if (!isLocked && card.getData('isAffordable')) {
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
     * Handle cell clicks for planting, digging, or moving
     */
    onCellClicked(data) {
        const { row, col, cell } = data;
        
        // Handle shovel mode
        if (this.shovelActive) {
            this.digUpPlant(row, col);
            return;
        }
        
        // Handle move mode
        if (this.moveMode) {
            this.handleMove(row, col);
            return;
        }
        
        // Normal planting mode
        if (!this.selectedPlant) return;
        
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

    /**
     * Create shovel tool for digging up plants
     */
    createShovelTool(x, y) {
        const shovel = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, 70, 70, 0x6b4423);
        bg.setStrokeStyle(2, 0x8B4513);
        shovel.add(bg);
        
        const shovelEmoji = this.scene.add.text(0, 0, '🔨', {
            fontSize: '40px'
        }).setOrigin(0.5);
        shovel.add(shovelEmoji);
        
        const label = this.scene.add.text(0, 25, 'DIG', {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        shovel.add(label);
        
        bg.setInteractive();
        
        bg.on('pointerdown', () => {
            this.shovelActive = !this.shovelActive;
            this.moveMode = false;
            this.selectedPlant = null;
            
            this.plantCards.forEach(card => {
                const cardBg = card.list[0];
                cardBg.setStrokeStyle(2, 0x8B4513);
            });
            
            if (this.shovelActive) {
                bg.setStrokeStyle(4, 0xffff00);
                if (this.moveCard) this.moveCard.list[0].setStrokeStyle(2, 0x8B4513);
                console.log('Shovel selected - click plants to dig them up!');
            } else {
                bg.setStrokeStyle(2, 0x8B4513);
            }
        });
        
        this.shovelCard = shovel;
        
        // Create move tool next to shovel
        this.createMoveTool(x + 90, y);
    }
    
    /**
     * Create move tool for relocating plants
     */
    createMoveTool(x, y) {
        const moveTool = this.scene.add.container(x, y);
        
        const bg = this.scene.add.rectangle(0, 0, 70, 70, 0x4a6b42);
        bg.setStrokeStyle(2, 0x8B4513);
        moveTool.add(bg);
        
        const moveEmoji = this.scene.add.text(0, 0, '↔️', {
            fontSize: '40px'
        }).setOrigin(0.5);
        moveTool.add(moveEmoji);
        
        const label = this.scene.add.text(0, 25, 'MOVE', {
            fontSize: '14px',
            fill: '#ffffff',
            stroke: '#000',
            strokeThickness: 3
        }).setOrigin(0.5);
        moveTool.add(label);
        
        bg.setInteractive();
        
        bg.on('pointerdown', () => {
            this.moveMode = !this.moveMode;
            this.shovelActive = false;
            this.selectedPlant = null;
            this.plantToMove = null;
            
            this.plantCards.forEach(card => {
                const cardBg = card.list[0];
                cardBg.setStrokeStyle(2, 0x8B4513);
            });
            
            if (this.moveMode) {
                bg.setStrokeStyle(4, 0x00ff00);
                if (this.shovelCard) this.shovelCard.list[0].setStrokeStyle(2, 0x8B4513);
                console.log('Move mode - click a plant, then click where to move it!');
                this.scene.instructionText.setText('Click a plant, then click empty spot to move it');
            } else {
                bg.setStrokeStyle(2, 0x8B4513);
                this.scene.instructionText.setText('Select a plant and click on lawn to place it');
            }
        });
        
        this.moveCard = moveTool;
    }

    /**
     * Handle plant moving
     */
    handleMove(row, col) {
        // First click - select plant to move
        if (!this.plantToMove) {
            const plant = this.scene.plants.find(p => p.row === row && p.col === col && !p.isDead);
            
            if (plant) {
                this.plantToMove = plant;
                console.log('↔️ Selected', plant.plantType, 'to move. Click destination...');
                this.scene.instructionText.setText('Click where to move ' + plant.plantType);
                
                // Highlight selected plant
                this.scene.tweens.add({
                    targets: plant,
                    alpha: 0.6,
                    duration: 300,
                    yoyo: true,
                    repeat: -1
                });
            } else {
                console.log('No plant here to move!');
            }
        } 
        // Second click - move to new location
        else {
            if (this.scene.gridSystem.isCellOccupied(row, col)) {
                console.log('Cannot move there - cell occupied!');
                return;
            }
            
            const oldRow = this.plantToMove.row;
            const oldCol = this.plantToMove.col;
            
            // Free old cell
            this.scene.gridSystem.setCellOccupied(oldRow, oldCol, false);
            
            // Occupy new cell
            this.scene.gridSystem.setCellOccupied(row, col, true);
            
            // Update plant position
            const newPos = this.scene.gridSystem.getCellCenter(row, col);
            this.plantToMove.row = row;
            this.plantToMove.col = col;
            
            // Stop pulsing animation
            this.scene.tweens.killTweensOf(this.plantToMove);
            this.plantToMove.alpha = 1;
            
            // Animate move
            this.scene.tweens.add({
                targets: this.plantToMove,
                x: newPos.x,
                y: newPos.y,
                duration: 300,
                ease: 'Back.easeOut'
            });
            
            console.log('✅ Moved plant from [' + oldRow + ',' + oldCol + '] to [' + row + ',' + col + ']');
            
            // Reset move mode
            this.plantToMove = null;
            this.moveMode = false;
            if (this.moveCard) {
                this.moveCard.list[0].setStrokeStyle(2, 0x8B4513);
            }
            this.scene.instructionText.setText('Select a plant and click on lawn to place it');
        }
    }

    /**
     * Dig up a plant with the shovel
     */
    digUpPlant(row, col) {
        // Find plant at this location
        const plantAtLocation = this.scene.plants.find(p => p.row === row && p.col === col && !p.isDead);
        
        if (plantAtLocation) {
            console.log('🔨 Digging up', plantAtLocation.plantType);
            
            // Animation before destroying
            this.scene.tweens.add({
                targets: plantAtLocation,
                alpha: 0,
                y: plantAtLocation.y - 20,
                duration: 300,
                onComplete: () => {
                    plantAtLocation.isDead = true;
                    this.scene.gridSystem.setCellOccupied(row, col, false);
                    plantAtLocation.destroy();
                }
            });
            
            // Deactivate shovel after use
            this.shovelActive = false;
            if (this.shovelCard) {
                const bg = this.shovelCard.list[0];
                bg.setStrokeStyle(2, 0x8B4513);
            }
        } else {
            console.log('No plant to dig up here!');
        }
    }

    /**
     * Unlock plants based on wave number
     */
    unlockPlantsForWave(wave) {
        const newUnlocks = this.allPlants.filter(p => p.unlockWave === wave);
        
        if (newUnlocks.length > 0) {
            newUnlocks.forEach(plant => {
                if (!this.availablePlants.includes(plant)) {
                    this.availablePlants.push(plant);
                    console.log('🎉 NEW PLANT UNLOCKED:', plant.name);
                    
                    const cardIndex = this.allPlants.indexOf(plant);
                    const card = this.plantCards[cardIndex];
                    
                    if (card) {
                        // Mark as unlocked
                        card.setData('isLocked', false);
                        
                        // Remove all lock elements
                        const lockOverlay = card.getByName('lockOverlay');
                        if (lockOverlay) lockOverlay.destroy();
                        
                        const lockIcon = card.getByName('lockIcon');
                        if (lockIcon) lockIcon.destroy();
                        
                        const waveText = card.getByName('waveText');
                        if (waveText) waveText.destroy();
                        
                        // Unlock animation
                        this.scene.tweens.add({
                            targets: card,
                            scaleX: 1.3,
                            scaleY: 1.3,
                            duration: 200,
                            yoyo: true,
                            repeat: 2,
                            ease: 'Back.easeOut'
                        });
                        
                        this.scene.cameras.main.flash(200, 255, 215, 0);
                    }
                }
            });
        }
    }
}
