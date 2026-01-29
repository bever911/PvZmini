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
        this.zombieManager.startWaves();
        
        // 7. Listen for events
        this.events.on('cellClicked', this.onCellClicked, this);
        this.events.on('sunCollected', this.onSunCollected, this);
        
        console.log('✅ Phase 5 Complete: Wave system activated!');
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
        this.add.text(640, 15, 'PLANTS VS ZOMBIES', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Wave counter (top-center below title)
        this.waveText = this.add.text(640, 50, 'Wave: 0/10', {
            fontSize: '20px',
            fill: '#ffaa00',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Phase indicator (top-right)
        this.add.text(1250, 20, 'v0.5', {
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
     * Update wave display
     */
    updateWaveDisplay(current, max) {
        this.waveText.setText(`Wave: ${current}/${max}`);
        
        // Pulse animation
        this.tweens.add({
            targets: this.waveText,
            scale: { from: 1.5, to: 1 },
            duration: 300,
            ease: 'Back.easeOut'
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
        if (this.sunManager) this.sunManager.stop();
        
        // Dark overlay
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.85);
        
        // Game over panel
        const panel = this.add.rectangle(640, 360, 600, 400, 0x4a3520);
        panel.setStrokeStyle(8, 0x8b5a3c);
        
        // Tombstone emoji
        this.add.text(640, 240, '🪦', {
            fontSize: '80px'
        }).setOrigin(0.5);
        
        // Game over text
        this.add.text(640, 340, 'GAME OVER', {
            fontSize: '64px',
            fill: '#ff0000',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        // Reason
        this.add.text(640, 410, 'The zombies ate your brains!', {
            fontSize: '24px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Restart button
        const restartButton = this.add.rectangle(640, 490, 200, 50, 0x2a7d2e);
        restartButton.setStrokeStyle(3, 0x1a5d1e);
        restartButton.setInteractive({ useHandCursor: true });
        
        const restartText = this.add.text(640, 490, 'RESTART', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Button hover effect
        restartButton.on('pointerover', () => {
            restartButton.setFillStyle(0x3a9d3e);
        });
        restartButton.on('pointerout', () => {
            restartButton.setFillStyle(0x2a7d2e);
        });
        
        // Restart on click
        restartButton.on('pointerdown', () => {
            location.reload();
        });
        
        // Flash red
        this.cameras.main.flash(500, 255, 0, 0);
    }

    /**
     * Victory!
     */
    victory() {
        if (this.isGameOver) return;
        this.isGameOver = true;
        
        console.log('🎉 VICTORY! 🎉');
        
        // Stop everything
        this.physics.pause();
        if (this.sunManager) this.sunManager.stop();
        
        // Golden overlay
        const overlay = this.add.rectangle(640, 360, 1280, 720, 0x000000, 0.7);
        
        // Victory panel
        const panel = this.add.rectangle(640, 360, 700, 450, 0x4a3520);
        panel.setStrokeStyle(8, 0xffd700);
        
        // Trophy emoji
        this.add.text(640, 220, '🏆', {
            fontSize: '100px'
        }).setOrigin(0.5);
        
        // Victory text
        this.add.text(640, 340, 'VICTORY!', {
            fontSize: '72px',
            fill: '#ffd700',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 8
        }).setOrigin(0.5);
        
        // Congratulations
        this.add.text(640, 410, 'You survived all 10 waves!', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        this.add.text(640, 450, 'Your lawn is safe! 🌻', {
            fontSize: '24px',
            fill: '#00ff00',
            fontFamily: 'Arial',
            stroke: '#000000',
            strokeThickness: 3
        }).setOrigin(0.5);
        
        // Play again button
        const playButton = this.add.rectangle(640, 520, 220, 50, 0x2a7d2e);
        playButton.setStrokeStyle(3, 0xffd700);
        playButton.setInteractive({ useHandCursor: true });
        
        const playText = this.add.text(640, 520, 'PLAY AGAIN', {
            fontSize: '28px',
            fill: '#ffffff',
            fontFamily: 'Arial Black, Arial',
            stroke: '#000000',
            strokeThickness: 4
        }).setOrigin(0.5);
        
        // Button hover effect
        playButton.on('pointerover', () => {
            playButton.setFillStyle(0x3a9d3e);
        });
        playButton.on('pointerout', () => {
            playButton.setFillStyle(0x2a7d2e);
        });
        
        // Restart on click
        playButton.on('pointerdown', () => {
            location.reload();
        });
        
        // Flash gold
        this.cameras.main.flash(500, 255, 215, 0);
        
        // Confetti effect
        for (let i = 0; i < 50; i++) {
            this.time.delayedCall(i * 50, () => {
                const x = Phaser.Math.Between(200, 1080);
                const y = -50;
                const confetti = this.add.circle(x, y, 8, Phaser.Math.Between(0, 0xffffff));
                this.tweens.add({
                    targets: confetti,
                    y: 750,
                    x: x + Phaser.Math.Between(-100, 100),
                    alpha: 0,
                    duration: 2000,
                    ease: 'Cubic.easeIn',
                    onComplete: () => confetti.destroy()
                });
            });
        }
    }
}
