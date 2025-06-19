class NeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.time = 0;
        this.maxNodes = 30;
        this.minNodes = 15;
        this.targetNodeCount = 20;
        this.nodeCreationTimer = 0;
        this.dynamicNodes = [];
        
        // Speed control parameters for creation/removal
        this.targetChangeInterval = 2; // Target node count change interval (seconds)
        this.nodeCreationChance = 0.995; // Node creation probability (higher = slower)
        this.nodeRemovalChance = 0.997; // Node removal probability (higher = slower)
        this.animationSpeed = 0.03; // Node/connection animation speed
        
        this.setupCanvas();
        this.generateNetwork();
        this.animate();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    }

    generateNetwork() {
        // Create initial minimum nodes
        this.createInitialNodes();
        this.generateConnections();
    }

    createInitialNodes() {
        // Create minimum base nodes with spacing
        for (let i = 0; i < this.minNodes; i++) {
            this.createNode(false); // false = permanent node
        }
        
        // Create some dynamic nodes with spacing from existing nodes
        for (let i = 0; i < 5; i++) {
            this.createNode(true); // true = can be destroyed
        }
    }

    createNode(isDynamic = true) {
        let x, y, attempts = 0;
        const minDistance = isDynamic ? 100 : 80; // Dynamic nodes have larger spacing
        const maxAttempts = 100; // More attempts
        
        // Place with sufficient distance from all existing nodes
        do {
            x = Math.random() * (this.canvas.width - 250) + 125;
            y = Math.random() * (this.canvas.height - 250) + 125;
            attempts++;
        } while (attempts < maxAttempts && this.nodes.some(existingNode => {
            const distance = Math.sqrt(Math.pow(existingNode.x - x, 2) + Math.pow(existingNode.y - y, 2));
            return distance < minDistance;
        }));
        
        // Don't create if sufficient space not found
        if (attempts >= maxAttempts && isDynamic) {
            return null;
        }
        
        const node = {
            x: x,
            y: y,
            baseX: x, // Original X position for floating animation
            baseY: y, // Original Y position for floating animation
            radius: 4 + Math.random() * 3,
            activation: Math.random(),
            scale: isDynamic ? 0 : 1,
            targetScale: 1,
            id: Math.random().toString(36).substring(2, 11),
            // Floating animation properties
            floatSpeedX: (Math.random() - 0.5) * 0.02, // Horizontal float speed
            floatSpeedY: (Math.random() - 0.5) * 0.015, // Vertical float speed
            floatRangeX: 20 + Math.random() * 15, // Horizontal float range
            floatRangeY: 15 + Math.random() * 10, // Vertical float range
            floatPhaseX: Math.random() * Math.PI * 2, // X phase offset
            floatPhaseY: Math.random() * Math.PI * 2  // Y phase offset
        };
        
        this.nodes.push(node);
        if (isDynamic) {
            this.dynamicNodes.push(node);
        }
        
        return node;
    }

    generateConnections() {
        this.connections = [];
        
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                const distance = Math.sqrt(
                    Math.pow(node1.x - node2.x, 2) + 
                    Math.pow(node1.y - node2.y, 2)
                );
                
                if (distance < 180 && Math.random() > 0.5) {
                    this.connections.push({
                        from: node1,
                        to: node2,
                        signal: 0,
                        opacity: 0, // Connection opacity start value
                        targetOpacity: 0.8 // Target opacity
                    });
                }
            }
        }
    }

    updateNodeCount() {
        this.nodeCreationTimer += 0.01;
        
        // Change target node count (adjustable interval)
        if (this.nodeCreationTimer > this.targetChangeInterval) {
            this.targetNodeCount = this.minNodes + Math.floor(Math.random() * (this.maxNodes - this.minNodes));
            this.nodeCreationTimer = 0;
        }
        
        const currentNodeCount = this.nodes.length;
        
        // Node creation (adjustable probability)
        if (currentNodeCount < this.targetNodeCount && Math.random() > this.nodeCreationChance) {
            const newNode = this.createNode(true);
            if (newNode) {
                this.generateConnections();
            }
        }
        
        // Node removal (adjustable probability)
        if (currentNodeCount > this.targetNodeCount && this.dynamicNodes.length > 0 && Math.random() > this.nodeRemovalChance) {
            this.removeRandomDynamicNode();
        }
    }

    removeRandomDynamicNode() {
        if (this.dynamicNodes.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.dynamicNodes.length);
        const nodeToRemove = this.dynamicNodes[randomIndex];
        
        nodeToRemove.targetScale = 0;
        
        // Make connected lines fade out smoothly
        this.connections.forEach(conn => {
            if (conn.from.id === nodeToRemove.id || conn.to.id === nodeToRemove.id) {
                conn.targetOpacity = 0;
            }
        });
        
        setTimeout(() => {
            this.nodes = this.nodes.filter(n => n.id !== nodeToRemove.id);
            this.dynamicNodes = this.dynamicNodes.filter(n => n.id !== nodeToRemove.id);
            this.connections = this.connections.filter(c => 
                c.from.id !== nodeToRemove.id && c.to.id !== nodeToRemove.id
            );
        }, 1000);
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.01;
        
        this.updateNodeCount();
        
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time + node.x * 0.01 + node.y * 0.01) + 1) / 2;
            // Adjustable node scale animation speed
            node.scale += (node.targetScale - node.scale) * this.animationSpeed;
            
            // Floating animation - update position based on sine waves
            node.x = node.baseX + Math.sin(this.time * node.floatSpeedX + node.floatPhaseX) * node.floatRangeX;
            node.y = node.baseY + Math.sin(this.time * node.floatSpeedY + node.floatPhaseY) * node.floatRangeY;
        });
        
        this.connections.forEach(conn => {
            conn.signal = (Math.sin(this.time * 2 + conn.from.x * 0.02) + 1) / 2;
            // Adjustable connection opacity animation speed
            conn.opacity += (conn.targetOpacity - conn.opacity) * this.animationSpeed;
        });
        
        this.connections.forEach(conn => {
            if (conn.from.scale < 0.1 || conn.to.scale < 0.1 || conn.opacity < 0.01) return;
            
            const nodeScale = Math.min(conn.from.scale, conn.to.scale);
            const finalOpacity = (0.7 + conn.signal * 0.2) * nodeScale * conn.opacity;
            
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(0, 102, 204, ${finalOpacity})`;
            this.ctx.lineWidth = (2 + conn.signal * 2) * nodeScale * conn.opacity;
            this.ctx.stroke();
        });
        
        this.nodes.forEach(node => {
            if (node.scale < 0.01) return;
            
            const effectiveRadius = node.radius * node.scale;
            const glowOpacity = (0.7 + node.activation * 0.2) * node.scale;
            
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0, node.x, node.y, effectiveRadius * 3
            );
            glowGradient.addColorStop(0, `rgba(0, 102, 204, ${glowOpacity})`);
            glowGradient.addColorStop(0.6, `rgba(0, 102, 204, ${glowOpacity * 0.7})`);
            glowGradient.addColorStop(1, 'rgba(0, 102, 204, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, effectiveRadius * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, effectiveRadius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${(0.95 + node.activation * 0.05) * node.scale})`;
            this.ctx.fill();
            
            this.ctx.strokeStyle = `rgba(0, 102, 204, ${(0.9 + node.activation * 0.1) * node.scale})`;
            this.ctx.lineWidth = 3 * node.scale;
            this.ctx.stroke();
        });
        
        this.drawParticles();
        
        requestAnimationFrame(() => this.animate());
    }

    drawParticles() {
        for (let i = 0; i < 15; i++) {
            const x = (this.time * 30 + i * 120) % (this.canvas.width + 100) - 50;
            const y = this.canvas.height / 2 + Math.sin(this.time * 0.8 + i) * 80;
            const opacity = Math.sin(this.time * 0.7 + i * 0.5) * 0.2 + 0.8;
            const size = 2 + Math.sin(this.time + i) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity * 0.6})`;
            this.ctx.fill();
        }
    }

}

// Initialize neural network visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeuralNetworkVisualization('neuralCanvas');
});