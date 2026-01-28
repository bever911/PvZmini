/**
 * GridSystem - Manages the 5x9 lawn grid for plant placement
 * 
 * Features:
 * - Visible grid lines
 * - Interactive cells with hover effects
 * - Cell occupancy tracking
 * - World position calculations
 */
class GridSystem {
    constructor(scene, config) {
        this.scene = scene;
        
        // Grid dimensions
        this.rows = config.rows || 5;
        this.cols = config.cols || 9;
        this.cellWidth = config.cellWidth || 120;
        this.cellHeight = config.cellHeight || 100;
        
        // Grid position offset (top-left corner)
        this.offsetX = config.offsetX || 200;
        this.offsetY = config.offsetY || 150;
        
        // Storage
        this.cells = [];
        this.graphics = scene.add.graphics();
        
        console.log('GridSystem initialized:', {
            rows: this.rows,
            cols: this.cols,
            cellSize: `${this.cellWidth}x${this.cellHeight}`
        });
    }

    /**
     * Create the grid - call this in scene.create()
     */
    create() {
        this.drawGrid();
        this.createInteractiveCells();
        console.log('Grid created with', this.rows * this.cols, 'cells');
    }

    /**
     * Draw the visible grid lines
     */
    drawGrid() {
        // Set line style - green lines with transparency
        this.graphics.lineStyle(2, 0x00ff00, 0.3);
        
        // Draw vertical lines
        for (let col = 0; col <= this.cols; col++) {
            const x = this.offsetX + (col * this.cellWidth);
            this.graphics.lineBetween(
                x, this.offsetY,
                x, this.offsetY + (this.rows * this.cellHeight)
            );
        }
        
        // Draw horizontal lines
        for (let row = 0; row <= this.rows; row++) {
            const y = this.offsetY + (row * this.cellHeight);
            this.graphics.lineBetween(
                this.offsetX, y,
                this.offsetX + (this.cols * this.cellWidth), y
            );
        }
    }

    /**
     * Create interactive cells for each grid position
     */
    createInteractiveCells() {
        for (let row = 0; row < this.rows; row++) {
            this.cells[row] = [];
            for (let col = 0; col < this.cols; col++) {
                const cell = this.createCell(row, col);
                this.cells[row][col] = cell;
            }
        }
    }

    /**
     * Create a single interactive cell
     */
    createCell(row, col) {
        const x = this.offsetX + (col * this.cellWidth);
        const y = this.offsetY + (row * this.cellHeight);
        
        // Create invisible rectangle that fills the cell
        const cellRect = this.scene.add.rectangle(
            x + this.cellWidth / 2,
            y + this.cellHeight / 2,
            this.cellWidth - 4,  // Slightly smaller than grid to avoid overlap
            this.cellHeight - 4,
            0x000000,
            0  // Fully transparent
        );
        
        // Make it interactive (clickable)
        cellRect.setInteractive();
        
        // Store cell data
        cellRect.setData('row', row);
        cellRect.setData('col', col);
        cellRect.setData('occupied', false);
        cellRect.setData('plant', null);
        
        // Hover effects
        cellRect.on('pointerover', () => {
            if (!cellRect.getData('occupied')) {
                // Highlight cell with yellow when hovering
                cellRect.setFillStyle(0xffff00, 0.3);
            }
        });
        
        cellRect.on('pointerout', () => {
            if (!cellRect.getData('occupied')) {
                // Remove highlight when not hovering
                cellRect.setFillStyle(0x000000, 0);
            }
        });
        
        cellRect.on('pointerdown', () => {
            // Log click for now - will be used for planting later
            console.log(`Clicked cell [${row}, ${col}]`);
            this.scene.events.emit('cellClicked', { row, col, cell: cellRect });
        });
        
        return cellRect;
    }

    /**
     * Get cell at specific row/col
     */
    getCellAt(row, col) {
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return this.cells[row][col];
        }
        return null;
    }

    /**
     * Get world position (center) of a cell
     */
    getCellWorldPosition(row, col) {
        const x = this.offsetX + (col * this.cellWidth) + this.cellWidth / 2;
        const y = this.offsetY + (row * this.cellHeight) + this.cellHeight / 2;
        return { x, y };
    }

    /**
     * Check if a cell is occupied
     */
    isCellOccupied(row, col) {
        const cell = this.getCellAt(row, col);
        return cell ? cell.getData('occupied') : true;
    }

    /**
     * Mark a cell as occupied/unoccupied
     */
    setCellOccupied(row, col, occupied, plant = null) {
        const cell = this.getCellAt(row, col);
        if (cell) {
            cell.setData('occupied', occupied);
            cell.setData('plant', plant);
            
            // Visual feedback
            if (occupied) {
                cell.setFillStyle(0x00ff00, 0.2);
            } else {
                cell.setFillStyle(0x000000, 0);
            }
        }
    }

    /**
     * Convert world coordinates to grid position
     */
    worldToGrid(worldX, worldY) {
        const col = Math.floor((worldX - this.offsetX) / this.cellWidth);
        const row = Math.floor((worldY - this.offsetY) / this.cellHeight);
        
        if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
            return { row, col };
        }
        return null;
    }
}
