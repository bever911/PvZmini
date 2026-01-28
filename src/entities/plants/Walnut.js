/**
 * Walnut - Defensive plant with high health
 * 
 * Cost: 50 sun
 * Health: 400 (4x normal)
 * Ability: Blocks zombies, no special actions
 */
class Walnut extends Plant {
    constructor(scene, x, y, row, col) {
        super(scene, x, y, row, col, {
            health: 400,  // High health!
            type: 'Walnut',
            emoji: '🥜',
            color: 0x8B4513  // Brown
        });
        
        console.log('Walnut planted - ready to defend!');
    }

    /**
     * Walnut has no special abilities
     * Just sits there and tanks damage
     */
}

// Static properties for UI
Walnut.cost = 50;
Walnut.displayName = 'Walnut';
Walnut.description = 'High health blocker';
