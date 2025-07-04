class FancyNeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.time = 0;
        this.maxNodes = 25;
        this.minNodes = 15;
        this.targetNodeCount = 20;
        this.nodeCreationTimer = 0;
        this.dynamicNodes = [];

        // --- Tunable Parameters ---
        this.targetChangeInterval = 3; // s
        this.nodeCreationChance = 0.995;
        this.nodeRemovalChance = 0.997;
        this.animationSpeed = 0.04;
        this.mouse = {
            x: undefined,
            y: undefined,
            radius: 150 // Interaction radius
        };

        this.setupCanvas();
        this.generateInitialNetwork();
        this.animate();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
            // We don't regenerate the whole network on resize anymore to keep it stable
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        this.canvas.addEventListener('mousemove', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = event.clientX - rect.left;
            this.mouse.y = event.clientY - rect.top;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
        });

        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            this.createShockwave(clickX, clickY);
        });
    }

    createShockwave(x, y) {
        this.nodes.forEach(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.hypot(dx, dy);
            if (distance < 300) { // Shockwave radius
                const force = (300 - distance) / 300;
                const angle = Math.atan2(dy, dx);
                node.vx += Math.cos(angle) * force * 15;
                node.vy += Math.sin(angle) * force * 15;
            }
        });
    }

    generateInitialNetwork() {
        for (let i = 0; i < this.minNodes; i++) {
            this.createNode(false);
        }
        for (let i = 0; i < 5; i++) {
            this.createNode(true);
        }
        this.generateConnections();
    }

    createNode(isDynamic = true) {
        let x, y, attempts = 0;
        const minDistance = isDynamic ? 100 : 80;
        const maxAttempts = 100;

        do {
            x = Math.random() * (this.canvas.width - 250) + 125;
            y = Math.random() * (this.canvas.height - 250) + 125;
            attempts++;
        } while (attempts < maxAttempts && this.nodes.some(existingNode => {
            const distance = Math.hypot(existingNode.x - x, existingNode.y - y);
            return distance < minDistance;
        }));

        if (attempts >= maxAttempts && isDynamic) return null;

        const node = {
            x, y,
            baseX: x, baseY: y,
            vx: 0, vy: 0, // Velocity for physics-based interaction
            radius: 4 + Math.random() * 3,
            activation: Math.random(),
            scale: isDynamic ? 0 : 1,
            targetScale: 1,
            id: Math.random().toString(36).substring(2, 11),
            floatSpeedX: (Math.random() - 0.5) * 0.01,
            floatSpeedY: (Math.random() - 0.5) * 0.008,
            floatRangeX: 10 + Math.random() * 10,
            floatRangeY: 8 + Math.random() * 8,
            floatPhaseX: Math.random() * Math.PI * 2,
            floatPhaseY: Math.random() * Math.PI * 2,
        };

        this.nodes.push(node);
        if (isDynamic) this.dynamicNodes.push(node);
        return node;
    }

    generateConnections() {
        this.connections = [];
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const n1 = this.nodes[i];
                const n2 = this.nodes[j];
                if (Math.hypot(n1.x - n2.x, n1.y - n2.y) < 180 && Math.random() > 0.5) {
                    this.connections.push({
                        from: n1, 
                        to: n2, 
                        opacity: 0, 
                        targetOpacity: 0.7,
                        signal: 0
                    });
                }
            }
        }
    }

    updateNodeCount() {
        this.nodeCreationTimer += 0.016;

        if (this.nodeCreationTimer > this.targetChangeInterval) {
            this.targetNodeCount = this.minNodes + Math.floor(Math.random() * (this.maxNodes - this.minNodes));
            this.nodeCreationTimer = 0;
        }

        if (this.nodes.length < this.targetNodeCount && Math.random() > this.nodeCreationChance) {
            if (this.createNode(true)) this.generateConnections();
        }

        if (this.nodes.length > this.targetNodeCount && this.dynamicNodes.length > 0 && Math.random() > this.nodeRemovalChance) {
            this.removeRandomDynamicNode();
        }
    }

    removeRandomDynamicNode() {
        if (this.dynamicNodes.length === 0) return;
        const nodeToRemove = this.dynamicNodes.splice(Math.floor(Math.random() * this.dynamicNodes.length), 1)[0];
        nodeToRemove.targetScale = 0;

        this.connections.forEach(conn => {
            if (conn.from.id === nodeToRemove.id || conn.to.id === nodeToRemove.id) {
                conn.targetOpacity = 0;
            }
        });

        setTimeout(() => {
            this.nodes = this.nodes.filter(n => n.id !== nodeToRemove.id);
            this.connections = this.connections.filter(c => c.from.id !== nodeToRemove.id && c.to.id !== nodeToRemove.id);
        }, 1000);
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

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.01;

        this.updateNodeCount();

        // Update nodes
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time + node.baseX * 0.01) + 1) / 2;
            node.scale += (node.targetScale - node.scale) * this.animationSpeed;

            // The node's "home" position is its floating position
            const homeX = node.baseX + Math.sin(this.time * node.floatSpeedX + node.floatPhaseX) * node.floatRangeX;
            const homeY = node.baseY + Math.sin(this.time * node.floatSpeedY + node.floatPhaseY) * node.floatRangeY;

            // Spring force to pull the node back to its home position
            const springForceX = (homeX - node.x) * 0.01;
            const springForceY = (homeY - node.y) * 0.01;

            node.vx += springForceX;
            node.vy += springForceY;

            // Mouse repulsion force
            if (this.mouse.x !== undefined && this.mouse.y !== undefined) {
                const dx = node.x - this.mouse.x;
                const dy = node.y - this.mouse.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < this.mouse.radius) {
                    const force = (this.mouse.radius - distance) / this.mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    node.vx += Math.cos(angle) * force * 2;
                    node.vy += Math.sin(angle) * force * 2;
                }
            }
            
            // Damping
            node.vx *= 0.92;
            node.vy *= 0.92;
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
        });
        
        // Update and draw connections
        this.connections.forEach(conn => {
            conn.opacity += (conn.targetOpacity - conn.opacity) * this.animationSpeed;
            conn.signal = (Math.sin(this.time * 2 + conn.from.baseX * 0.02) + 1) / 2;

            if (conn.from.scale < 0.1 || conn.to.scale < 0.1 || conn.opacity < 0.01) return;

            const nodeScale = Math.min(conn.from.scale, conn.to.scale);
            const finalOpacity = conn.opacity * nodeScale * (0.5 + conn.signal * 0.5);

            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(0, 153, 255, ${finalOpacity})`;
            this.ctx.lineWidth = (1 + conn.signal * 1.5) * nodeScale;
            this.ctx.stroke();
        });

        // Draw nodes
        this.nodes.forEach(node => {
            if (node.scale < 0.01) return;
            const radius = node.radius * node.scale;
            const glowOpacity = (0.6 + node.activation * 0.4) * node.scale;

            const grad = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 4);
            grad.addColorStop(0, `rgba(0, 153, 255, ${glowOpacity})`);
            grad.addColorStop(0.5, `rgba(0, 153, 255, ${glowOpacity * 0.5})`);
            grad.addColorStop(1, 'rgba(0, 153, 255, 0)');

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${0.9 * node.scale})`;
            this.ctx.fill();
        });

        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FancyNeuralNetworkVisualization('fancyNeuralCanvas');
});