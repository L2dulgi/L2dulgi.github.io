class FancyNeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.time = 0;

        // Layer definition: e.g., [input, hidden1, hidden2, output]
        this.layerCounts = [4, 6, 6, 3];

        // --- Tunable Parameters ---
        this.animationSpeed = 0.04;
        this.mouse = {
            x: undefined,
            y: undefined,
            radius: 150 // Interaction radius
        };

        this.setupCanvas();
        this.generateLayeredNetwork();
        this.animate();
    }

    setupCanvas() {
        const resizeCanvas = () => {
            const container = this.canvas.parentElement;
            this.canvas.width = container.offsetWidth;
            this.canvas.height = container.offsetHeight;
            this.generateLayeredNetwork(); // Regenerate network on resize
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
                node.vx += Math.cos(angle) * force * 15; // Strong push
                node.vy += Math.sin(angle) * force * 15;
            }
        });
    }

    generateLayeredNetwork() {
        this.nodes = [];
        const layerSpacing = this.canvas.width / (this.layerCounts.length + 1);

        this.layerCounts.forEach((nodeCount, layerIndex) => {
            const x = layerSpacing * (layerIndex + 1);
            const ySpacing = this.canvas.height / (nodeCount + 1);

            for (let i = 0; i < nodeCount; i++) {
                const y = ySpacing * (i + 1);
                
                const node = {
                    x, y,
                    baseX: x, baseY: y,
                    vx: 0, vy: 0,
                    radius: 6 + Math.random() * 2,
                    activation: Math.random(),
                    scale: 1,
                    targetScale: 1,
                    id: `${layerIndex}-${i}`,
                    layer: layerIndex,
                    floatSpeedX: (Math.random() - 0.5) * 0.005,
                    floatSpeedY: (Math.random() - 0.5) * 0.004,
                    floatRangeX: 5 + Math.random() * 5,
                    floatRangeY: 4 + Math.random() * 4,
                    floatPhaseX: Math.random() * Math.PI * 2,
                    floatPhaseY: Math.random() * Math.PI * 2,
                };
                this.nodes.push(node);
            }
        });

        this.generateConnections();
    }

    generateConnections() {
        this.connections = [];
        for (const fromNode of this.nodes) {
            for (const toNode of this.nodes) {
                if (toNode.layer === fromNode.layer + 1) {
                    if (Math.random() > 0.3) { // Avoid connecting every single node
                        this.connections.push({
                            from: fromNode,
                            to: toNode,
                            opacity: 0,
                            targetOpacity: 0.6,
                            signal: 0
                        });
                    }
                }
            }
        }
    }

    drawParticles() {
        for (let i = 0; i < 15; i++) {
            const x = (this.time * 20 + i * 120) % (this.canvas.width + 100) - 50;
            const y = this.canvas.height / 2 + Math.sin(this.time * 0.5 + i) * 60;
            const opacity = Math.sin(this.time * 0.5 + i * 0.5) * 0.2 + 0.8;
            const size = 1.5 + Math.sin(this.time + i) * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity * 0.5})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 2.5, 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(0, 200, 255, ${opacity * 0.3})`;
            this.ctx.fill();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.time += 0.01;

        // Update nodes
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time + node.baseX * 0.01) + 1) / 2;

            const homeX = node.baseX + Math.sin(this.time * node.floatSpeedX + node.floatPhaseX) * node.floatRangeX;
            const homeY = node.baseY + Math.sin(this.time * node.floatSpeedY + node.floatPhaseY) * node.floatRangeY;

            const springForceX = (homeX - node.x) * 0.01;
            const springForceY = (homeY - node.y) * 0.01;

            node.vx += springForceX;
            node.vy += springForceY;

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
            
            node.vx *= 0.92;
            node.vy *= 0.92;
            
            node.x += node.vx;
            node.y += node.vy;
        });

        // Update and draw connections
        this.connections.forEach(conn => {
            conn.opacity += (conn.targetOpacity - conn.opacity) * this.animationSpeed;
            conn.signal = (Math.sin(this.time * 2 + conn.from.baseX * 0.02) + 1) / 2;

            const finalOpacity = conn.opacity * (0.5 + conn.signal * 0.5);

            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = `rgba(0, 153, 255, ${finalOpacity})`;
            this.ctx.lineWidth = (1 + conn.signal * 1.5);
            this.ctx.stroke();
        });

        // Draw nodes
        this.nodes.forEach(node => {
            const radius = node.radius;
            const glowOpacity = (0.6 + node.activation * 0.4);

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
            this.ctx.fillStyle = `rgba(255, 255, 255, 0.9)`;
            this.ctx.fill();
        });

        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FancyNeuralNetworkVisualization('fancyNeuralCanvas');
});