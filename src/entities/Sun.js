/**
 * Sun - Collectible sun entity
 * 
 * Features:
 * - Falls from sky with animation (3 seconds)
 * - Clickable to collect (ONLY AFTER LANDING)
 * - Flies to sun counter when collected
 * - Auto-disappears after 8 seconds if not collected
 * - Yellow circle with sun emoji
 */
class Sun extends Phaser.GameObjects.Container {
    constructor(scene, x, y, targetY) {
        super(scene, x, y);
        
        this.scene = scene;
        this.targetY = targetY; // Where it should land
        this.collected = false;
        this.hasLanded = false; // NEW: Track if sun has landed
        this.lifespan = 8000; // 8 seconds in milliseconds
        
        // Create visual
        this.createVisual();
        
        // Make it interactive
        this.setSize(60, 60);
        this.setInteractive();
        
        // Add to scene
        scene.add.existing(this);
        
        // Start falling animation
        this.startFalling();
        
        // Add hover effect
        this.on('pointerover', () => {
            if (!this.collected && this.hasLanded) { // Only show hover if landed
                this.circle.setScale(1.2);
            }
        });
        
        this.on('pointerout', () => {
            if (!this.collected && this.hasLanded) { // Only show hover if landed
                this.circle.setScale(1);
            }
        });
        
        // Add click handler
        this.on('pointerdown', () => {
            if (!this.collected && this.hasLanded) { // Only collect if landed
                this.collect();
            }
        });
    }

    /**
     * Create the sun visual (yellow circle with sun emoji)
     */
    createVisual() {
        // Yellow circle background
        this.circle = this.scene.add.circle(0, 0, 30, 0xffff00);
        this.add(this.circle);
        
        // Outer glow
        const glow = this.scene.add.circle(0, 0, 32, 0xffff00, 0.3);
        this.add(glow);
        
        // Sun emoji text
        this.text = this.scene.add.text(0, 0, '☀', {
            fontSize: '40px',
            fill: '#ff8800'
        }).setOrigin(0.5);
        this.add(this.text);
        
        // Add subtle pulse animation
        this.scene.tweens.add({
            targets: this.circle,
            scale: { from: 1, to: 1.1 },
            duration: 500,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
        });
    }

    /**
     * Start falling animation from spawn to target Y
     */
    startFalling() {
        // Falling animation (3 seconds)
        this.scene.tweens.add({
            targets: this,
            y: this.targetY,
            duration: 3000, // 3 seconds
            ease: 'Cubic.easeIn',
            onComplete: () => {
                // Small bounce when landing
                this.scene.tweens.add({
                    targets: this,
                    y: this.targetY - 10,
                    duration: 100,
                    yoyo: true,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        // Mark as landed and start lifespan timer
                        this.hasLanded = true;
                        this.startLifespanTimer();
                        console.log('Sun landed and is now collectible');
                    }
                });
            }
        });
    }

    /**
     * Start the lifespan timer (only after landing)
     */
    startLifespanTimer() {
        this.lifespanTimer = this.scene.time.delayedCall(this.lifespan, () => {
            if (!this.collected) {
                this.disappear();
            }
        });
    }

    /**
     * Collect the sun - fly to counter
     */
    collect() {
        if (this.collected) return;
        
        this.collected = true;
        this.disableInteractive();
        
        // Cancel lifespan timer
        if (this.lifespanTimer) {
            this.lifespanTimer.remove();
        }
        
        // Target position (sun counter location)
        const targetX = 80;
        const targetY = 40;
        
        // Fly to counter animation
        this.scene.tweens.add({
            targets: this,
            x: targetX,
            y: targetY,
            scale: 0.5,
            duration: 500,
            ease: 'Power2',
            onComplete: () => {
                // Add sun value to counter
                this.scene.events.emit('sunCollected', 25);
                
                // Small flash effect at counter
                const flash = this.scene.add.circle(targetX, targetY, 20, 0xffff00, 0.8);
                this.scene.tweens.add({
                    targets: flash,
                    scale: 2,
                    alpha: 0,
                    duration: 300,
                    onComplete: () => flash.destroy()
                });
                
                // Destroy this sun
                this.destroy();
            }
        });
        
        console.log('Sun collected! +25 sun');
    }

    /**
     * Make sun disappear after lifespan expires
     */
    disappear() {
        if (this.collected) return;
        
        // Fade out animation
        this.scene.tweens.add({
            targets: this,
            alpha: 0,
            scale: 0.5,
            duration: 500,
            onComplete: () => {
                this.destroy();
            }
        });
        
        console.log('Sun disappeared (not collected)');
    }

    /**
     * Clean up
     */
    destroy(fromScene) {
        if (this.lifespanTimer) {
            this.lifespanTimer.remove();
        }
        super.destroy(fromScene);
    }
}
