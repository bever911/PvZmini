/**
 * GameScene - Main gameplay scene
 * 
 * This is where all the game action happens!
 */
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
        this.gridSystem = null;
        this.sunManager = null;
        this.plantSelector = null;
        this.zombieManager = null;
        this.sunCount = 50;  // Starting sun
        this.plants = [];
        this.projectiles = [];
        this.zombies = [];
        this.isGameOver = false;
    }

    preload() {
        // Assets will be loaded here later
        console.log('GameScene: preload');
    }

    create() {
        console.log('GameScene: create');
        
        // 1. Create the lawn background
        this.createLawn();
        
        // 2. Create the grid system
        this.gridSystem = new GridSystem(this, {
            rows: 5,
            cols: 9,
            cellWidth: 120,
            cellHeight: 100,
            offsetX: 200,
            offsetY: 150
        });
        this.gridSystem.create();
        
        // 3. Create UI elements
        this.createUI();
        
        // 4. Create sun manager
        this.sunManager = new SunManager(this);
        this.sunManager.start();
        
        // 5. Create plant selector
        this.plantSelector = new PlantSelector(this);
        this.plantSelector.create();
        
        // 6. Create zombie manager
        this.zombieManager = new ZombieManager(this);
        this.zombieManager.startTestWave();
        
        // 7. Listen for events
        this.events.on('cellClicked', this.onCellClicked, this);
        this.events.on('sunCollected', this.onSunCollected, this);
        
        console.log('✅ Phase 4 Complete: Zombies incoming!');
    }

    /**
     * Create the lawn background
     */
    createLawn() {
        const lawnWidth = 1280;
        const lawnHeight = 720;
        
        // Base lawn color - forest green
        this.add.rectangle(
            lawnWidth / 2,
            lawnHeight / 2,
            lawnWidth,
            lawnHeight,
            0x228B22  // Forest green
        );
        
        // Add grass texture effect with random dots
        const graphics = this.add.graphics();
        
        // Dark green accents for texture
        graphics.fillStyle(0x1a7515, 0.2);
        for (let i = 0; i < 500; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(100, 650);
            graphics.fillRect(x, y, 2, 3);
        }
        
        // Lighter green accents
        graphics.fillStyle(0x2a9d2f, 0.15);
        for (let i = 0; i < 300; i++) {
            const x = Phaser.Math.Between(0, 1280);
            const y = Phaser.Math.Between(100, 650);
            graphics.fillRect(x, y, 3, 2);
        }
    }

    /**
     * Create UI elements
     */
    createUI() {
        // Top UI bar (brown, like PvZ)
        const uiBar = this.add.rectangle(
            640, 40,
            1280, 80,
            0x4a3520
        );
        
        // Sun counter (top-left) - make it stand out more
        const sunBg = this.add.rectangle(80, 40, 140, 50, 0x3a2510);
        
        this.sunText = this.add.text(30, 20, `☀ ${this.sunCount}`, {
            fontSize: '42px',
            fill: '#ffff00',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 6
        });
        
        // Game title (top-center)
        this.add.text(640, 25, 'PLANTS VS ZOMBIES', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Phase indicator (top-right)
        this.add.text(1250, 20, 'v0.4', {
            fontSize: '20px',
            fill: '#00ff00',
            fontFamily: 'Arial'
        }).setOrigin(1, 0);
        
        // Instructions (bottom)
        this.instructionText = this.add.text(640, 680, 'Select a plant and click on lawn to place it', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
    }

    /**
     * Handle cell clicks
     */
    onCellClicked(data) {
        // PlantSelector handles this now
    }

    /**
     * Handle sun collection
     */
    onSunCollected(amount) {
        this.sunCount += amount;
        this.updateSunDisplay();
        console.log('Sun collected! Total sun:', this.sunCount);
    }

    /**
     * Update sun counter display
     */
    updateSunDisplay() {
        this.sunText.setText(`☀ ${this.sunCount}`);
        
        // Pulse animation when sun is collected
        this.tweens.add({
            targets: this.sunText,
            scale: { from: 1.2, to: 1 },
            duration: 200,
            ease: 'Back.easeOut'
        });
    }

    update(time, delta) {
        // Update plant selector (for graying out cards)
        if (this.plantSelector) {
            this.plantSelector.update();
        }
        
        // Update all zombies
        if (this.zombies) {
            this.zombies.forEach(zombie => {
                if (zombie && zombie.active && zombie.update) {
                    zombie.update(delta);
                }
            });
        }
        
        // Update all projectiles
        if (this.projectiles) {
            this.projectiles.forEach(projectile => {
                if (projectile && projectile.active && projectile.update) {
                    projectile.update(delta);
                }
            });
        }
        
        // Check collisions
        this.checkCollisions();
    }

    /**
     * Check for collisions between projectiles and zombies
     */
    checkCollisions() {
        if (!this.projectiles || !this.zombies) return;
        if (this.projectiles.length === 0 || this.zombies.length === 0) return;
        
        // Check each projectile against each zombie
        this.projectiles.forEach(projectile => {
            if (!projectile || !projectile.active) return;
            
            this.zombies.forEach(zombie => {
                if (!zombie || !zombie.active || zombie.isDead) return;
                
                // Only check zombies in same row
                if (projectile.row !== zombie.row) return;
                
                // Check distance
                const distance = Math.abs(projectile.x - zombie.x);
                const verticalDistance = Math.abs(projectile.y - zombie.y);
                
                if (distance < 50 && verticalDistance < 50) {
                    // HIT!
                    console.log(`💥 PEA HIT ZOMBIE! Distance: ${distance}`);
                    zombie.takeDamage(projectile.damage);
                    projectile.destroy();
                }
            });
        });
    }

    /**
     * Game over!
     */
    gameOver() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        console.log('🚨 GAME OVER! 🚨');
        
        // Stop everything
        this.physics.pause();
        
        // Show game over text
        const gameOverBg = this.add.rectangle(640, 360, 800, 300, 0x000000, 0.8);
        
        const gameOverText = this.add.text(640, 320, 'GAME OVER', {
            fontSize: '72px',
            fill: '#ff0000',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        const restartText = this.add.text(640, 400, 'Refresh page to restart', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Flash red
        this.cameras.main.flash(500, 255, 0, 0);
    }
}
