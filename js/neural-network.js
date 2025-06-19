// Neural Network Visualization
class NeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;
        
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.animationId = null;
        this.time = 0;
        this.maxNodes = 30; // Maximum number of nodes
        this.minNodes = 15; // Minimum number of nodes
        this.targetNodeCount = 20; // Current target
        this.nodeCreationTimer = 0;
        this.dynamicNodes = []; // Nodes that can be created/destroyed
        
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
        // Create minimum base nodes
        for (let i = 0; i < this.minNodes; i++) {
            this.createNode(false); // false = permanent node
        }
        
        // Create some dynamic nodes
        for (let i = 0; i < 5; i++) {
            this.createNode(true); // true = can be destroyed
        }
    }

    createNode(isDynamic = true) {
        const x = Math.random() * (this.canvas.width - 100) + 50;
        const y = Math.random() * (this.canvas.height - 100) + 50;
        
        const node = {
            x: x,
            y: y,
            radius: 4 + Math.random() * 3,
            activation: Math.random(),
            isDynamic: isDynamic,
            scale: isDynamic ? 0 : 1, // Start with 0 scale for dynamic nodes
            targetScale: 1,
            creationTime: this.time,
            lifeSpan: isDynamic ? 5 + Math.random() * 10 : Infinity,
            id: Math.random().toString(36).substr(2, 9)
        };
        
        this.nodes.push(node);
        if (isDynamic) {
            this.dynamicNodes.push(node);
        }
        
        return node;
    }

    generateConnections() {
        this.connections = [];
        
        // Connect nodes with distance-based probability
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const node1 = this.nodes[i];
                const node2 = this.nodes[j];
                const distance = Math.sqrt(
                    Math.pow(node1.x - node2.x, 2) + 
                    Math.pow(node1.y - node2.y, 2)
                );
                
                // Connect nodes that are close enough
                if (distance < 150 && Math.random() > 0.4) {
                    this.connections.push({
                        from: node1,
                        to: node2,
                        weight: (Math.random() - 0.5) * 2,
                        signal: 0,
                        id: node1.id + '-' + node2.id
                    });
                }
            }
        }
    }

    updateNodeCount() {
        this.nodeCreationTimer += 0.01;
        
        // Change target node count every few seconds
        if (this.nodeCreationTimer > 3) {
            this.targetNodeCount = this.minNodes + Math.floor(Math.random() * (this.maxNodes - this.minNodes));
            this.nodeCreationTimer = 0;
        }
        
        const currentNodeCount = this.nodes.length;
        
        // Add nodes if below target
        if (currentNodeCount < this.targetNodeCount && Math.random() > 0.98) {
            this.createNode(true);
            this.generateConnections(); // Regenerate connections
        }
        
        // Remove dynamic nodes if above target
        if (currentNodeCount > this.targetNodeCount && this.dynamicNodes.length > 0 && Math.random() > 0.99) {
            this.removeRandomDynamicNode();
        }
    }

    removeRandomDynamicNode() {
        if (this.dynamicNodes.length === 0) return;
        
        const randomIndex = Math.floor(Math.random() * this.dynamicNodes.length);
        const nodeToRemove = this.dynamicNodes[randomIndex];
        
        // Start shrinking animation
        nodeToRemove.targetScale = 0;
        
        // Remove after animation
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
        
        // Update node count dynamically
        this.updateNodeCount();
        
        // Update activations and scaling
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time + node.x * 0.01 + node.y * 0.01) + 1) / 2;
            
            // Smooth scaling animation for growing/shrinking
            const scaleDiff = node.targetScale - node.scale;
            node.scale += scaleDiff * 0.05; // Smooth interpolation
        });
        
        // Update signals
        this.connections.forEach(conn => {
            conn.signal = (Math.sin(this.time * 2 + conn.from.x * 0.02) + 1) / 2;
        });
        
        // Draw connections with higher opacity (더 불투명하게)
        this.connections.forEach(conn => {
            // Skip connections to/from invisible nodes
            if (conn.from.scale < 0.1 || conn.to.scale < 0.1) return;
            
            const baseOpacity = 0.4; // Much higher base opacity
            const dynamicOpacity = conn.signal * 0.5; // Higher dynamic range
            const opacity = (baseOpacity + dynamicOpacity) * Math.min(conn.from.scale, conn.to.scale);
            const color = `rgba(0, 102, 204, ${opacity})`;
            
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = (1 + conn.signal * 1) * Math.min(conn.from.scale, conn.to.scale);
            this.ctx.stroke();
        });
        
        // Draw nodes with higher opacity and scaling
        this.nodes.forEach(node => {
            if (node.scale < 0.01) return; // Skip invisible nodes
            
            const effectiveRadius = node.radius * node.scale;
            
            // Enhanced glow with higher opacity (더 불투명하게)
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, effectiveRadius * 2.5
            );
            const glowOpacity = (0.6 + node.activation * 0.4) * node.scale; // Much higher opacity
            glowGradient.addColorStop(0, `rgba(0, 102, 204, ${glowOpacity})`);
            glowGradient.addColorStop(0.7, `rgba(0, 102, 204, ${glowOpacity * 0.4})`);
            glowGradient.addColorStop(1, 'rgba(0, 102, 204, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, effectiveRadius * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            // Node core with much higher opacity (더 불투명하게)
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, effectiveRadius, 0, Math.PI * 2);
            const coreOpacity = (0.8 + node.activation * 0.2) * node.scale; // Very high opacity
            this.ctx.fillStyle = `rgba(255, 255, 255, ${coreOpacity})`;
            this.ctx.fill();
            
            // Enhanced border with higher opacity
            const borderOpacity = (0.7 + node.activation * 0.3) * node.scale; // Higher opacity
            this.ctx.strokeStyle = `rgba(0, 102, 204, ${borderOpacity})`;
            this.ctx.lineWidth = 2 * node.scale;
            this.ctx.stroke();
        });
        
        // Add floating particles with higher opacity
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawParticles() {
        const particleCount = 15;
        for (let i = 0; i < particleCount; i++) {
            const x = (this.time * 30 + i * 120) % (this.canvas.width + 100) - 50;
            const y = this.canvas.height / 2 + Math.sin(this.time * 0.8 + i) * 80;
            const opacity = Math.sin(this.time * 0.7 + i * 0.5) * 0.4 + 0.6; // Higher opacity (더 불투명하게)
            const size = 1.5 + Math.sin(this.time + i) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity})`;
            this.ctx.fill();
            
            // Enhanced glow for particles with higher opacity
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity * 0.4})`; // Higher glow opacity
            this.ctx.fill();
        }
    }

    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

// Initialize neural network visualization when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new NeuralNetworkVisualization('neuralCanvas');
});