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
        const layers = [4, 6, 5, 4, 3]; // Network architecture
        const layerSpacing = this.canvas.width / (layers.length + 1);
        
        // Generate nodes with more spread
        layers.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);
            const nodeSpacing = this.canvas.height / (nodeCount + 1);
            
            for (let i = 0; i < nodeCount; i++) {
                const y = nodeSpacing * (i + 1);
                // Add some randomness to avoid perfect grid
                const offsetX = (Math.random() - 0.5) * 40;
                const offsetY = (Math.random() - 0.5) * 30;
                
                this.nodes.push({
                    x: x + offsetX,
                    y: y + offsetY,
                    layer: layerIndex,
                    index: i,
                    radius: 5,
                    activation: Math.random()
                });
            }
        });
        
        // Generate connections with some randomness
        for (let l = 0; l < layers.length - 1; l++) {
            const currentLayerNodes = this.nodes.filter(n => n.layer === l);
            const nextLayerNodes = this.nodes.filter(n => n.layer === l + 1);
            
            currentLayerNodes.forEach(node1 => {
                nextLayerNodes.forEach(node2 => {
                    // Only connect some nodes to avoid too dense network
                    if (Math.random() > 0.3) {
                        this.connections.push({
                            from: node1,
                            to: node2,
                            weight: (Math.random() - 0.5) * 2,
                            signal: 0
                        });
                    }
                });
            });
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.01;
        
        // Update activations
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time + node.x * 0.01 + node.y * 0.01) + 1) / 2;
        });
        
        // Update signals
        this.connections.forEach(conn => {
            conn.signal = (Math.sin(this.time * 2 + conn.from.x * 0.02) + 1) / 2;
        });
        
        // Draw connections
        this.connections.forEach(conn => {
            const opacity = 0.5 + conn.signal * 0.15;
            const color = `rgba(0, 102, 204, ${opacity})`;
            
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 0.5 + conn.signal * 0.5;
            this.ctx.stroke();
        });
        
        // Draw nodes
        this.nodes.forEach(node => {
            // Node glow (more subtle)
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, node.radius * 2
            );
            glowGradient.addColorStop(0, `rgba(0, 102, 204, ${node.activation * 0.4})`);
            glowGradient.addColorStop(1, 'rgba(0, 102, 204, 0)');
            
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();
            
            // Node core (more subtle)
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.3 + node.activation * 0.2})`;
            this.ctx.fill();
            
            this.ctx.strokeStyle = `rgba(0, 102, 204, ${0.2 + node.activation * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        });
        
        // Add floating particles
        this.drawParticles();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawParticles() {
        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const x = (this.time * 50 + i * 100) % (this.canvas.width + 100) - 50;
            const y = this.canvas.height / 2 + Math.sin(this.time + i) * 100;
            const opacity = Math.sin(this.time + i * 0.5) * 0.3 + 0.2;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity})`;
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