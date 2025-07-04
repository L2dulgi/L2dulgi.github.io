class FancyNeuralNetworkVisualization {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.connections = [];
        this.time = 0;
        this.maxNodes = 30;
        this.minNodes = 20;
        this.targetNodeCount = 25;
        this.nodeCreationTimer = 0;
        this.dynamicNodes = [];
        this.pulseWaves = [];
        this.colorShift = 0;

        // --- Tunable Parameters ---
        this.targetChangeInterval = 3; // s
        this.nodeCreationChance = 0.995;
        this.nodeRemovalChance = 0.997;
        this.animationSpeed = 0.06;
        this.mouse = {
            x: undefined,
            y: undefined,
            radius: 200, // Interaction radius
            trail: []
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
            const newX = event.clientX - rect.left;
            const newY = event.clientY - rect.top;
            
            if (this.mouse.x !== undefined) {
                this.mouse.trail.push({
                    x: newX,
                    y: newY,
                    life: 1.0
                });
                if (this.mouse.trail.length > 20) {
                    this.mouse.trail.shift();
                }
            }
            
            this.mouse.x = newX;
            this.mouse.y = newY;
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.mouse.x = undefined;
            this.mouse.y = undefined;
            this.mouse.trail = [];
        });

        this.canvas.addEventListener('click', (event) => {
            const rect = this.canvas.getBoundingClientRect();
            const clickX = event.clientX - rect.left;
            const clickY = event.clientY - rect.top;
            this.createShockwave(clickX, clickY);
        });
    }

    createShockwave(x, y) {
        // Create visible pulse wave
        this.pulseWaves.push({
            x: x,
            y: y,
            radius: 0,
            maxRadius: 400,
            life: 1.0
        });
        
        this.nodes.forEach(node => {
            const dx = node.x - x;
            const dy = node.y - y;
            const distance = Math.hypot(dx, dy);
            if (distance < 300) { // Shockwave radius
                const force = (300 - distance) / 300;
                const angle = Math.atan2(dy, dx);
                node.vx += Math.cos(angle) * force * 20;
                node.vy += Math.sin(angle) * force * 20;
                
                // Boost activation temporarily
                node.boostActivation = 1.0;
            }
        });
        
        // Trigger data flow through nearby connections
        this.connections.forEach(conn => {
            const distFrom = Math.hypot(conn.from.x - x, conn.from.y - y);
            const distTo = Math.hypot(conn.to.x - x, conn.to.y - y);
            if (distFrom < 300 || distTo < 300) {
                conn.dataFlow = 1.0;
                conn.flowDirection = distFrom < distTo ? 1 : -1;
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
            radius: 3 + Math.random() * 4,
            activation: Math.random(),
            boostActivation: 0,
            scale: isDynamic ? 0 : 1,
            targetScale: 1,
            id: Math.random().toString(36).substring(2, 11),
            floatSpeedX: (Math.random() - 0.5) * 0.012,
            floatSpeedY: (Math.random() - 0.5) * 0.01,
            floatRangeX: 15 + Math.random() * 15,
            floatRangeY: 12 + Math.random() * 12,
            floatPhaseX: Math.random() * Math.PI * 2,
            floatPhaseY: Math.random() * Math.PI * 2,
            hue: Math.random() * 360,
            type: Math.random() > 0.7 ? 'core' : 'standard'
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
                const distance = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                if (distance < 200 && Math.random() > 0.4) {
                    this.connections.push({
                        from: n1, 
                        to: n2, 
                        opacity: 0, 
                        targetOpacity: 0.6,
                        signal: 0,
                        dataFlow: 0,
                        flowDirection: 1,
                        strength: 1 - (distance / 200)
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
        // Flowing data particles
        for (let i = 0; i < 20; i++) {
            const x = (this.time * 50 + i * 100) % (this.canvas.width + 100) - 50;
            const y = this.canvas.height / 2 + Math.sin(this.time * 1.2 + i) * 100;
            const opacity = Math.sin(this.time * 1.5 + i * 0.3) * 0.3 + 0.7;
            const size = 1.5 + Math.sin(this.time * 2 + i) * 0.8;
            
            const hue = (this.colorShift + i * 20) % 360;
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${hue}, 100%, 60%, ${opacity})`;
            this.ctx.fill();
            
            this.ctx.beginPath();
            this.ctx.arc(x, y, size * 3, 0, Math.PI * 2);
            const grad = this.ctx.createRadialGradient(x, y, 0, x, y, size * 3);
            grad.addColorStop(0, `hsla(${hue}, 100%, 60%, ${opacity * 0.8})`);
            grad.addColorStop(1, `hsla(${hue}, 100%, 60%, 0)`);
            this.ctx.fillStyle = grad;
            this.ctx.fill();
        }
    }
    
    drawMouseTrail() {
        this.mouse.trail.forEach((point, index) => {
            point.life -= 0.05;
            if (point.life <= 0) return;
            
            const size = 3 * point.life;
            const opacity = point.life * 0.5;
            
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = `hsla(${200 + this.colorShift}, 100%, 70%, ${opacity})`;
            this.ctx.fill();
        });
        
        this.mouse.trail = this.mouse.trail.filter(p => p.life > 0);
    }
    
    drawPulseWaves() {
        this.pulseWaves.forEach((wave, index) => {
            wave.radius += 8;
            wave.life -= 0.02;
            
            if (wave.life <= 0) {
                this.pulseWaves.splice(index, 1);
                return;
            }
            
            this.ctx.beginPath();
            this.ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = `hsla(${180 + this.colorShift}, 100%, 60%, ${wave.life * 0.3})`;
            this.ctx.lineWidth = 2 * wave.life;
            this.ctx.stroke();
        });
    }

    animate() {
        // Create subtle canvas glow effect
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.time += 0.01;
        this.colorShift = (this.colorShift + 0.5) % 360;

        this.updateNodeCount();

        // Update nodes
        this.nodes.forEach(node => {
            node.activation = (Math.sin(this.time * 1.5 + node.baseX * 0.01) + 1) / 2;
            node.boostActivation = Math.max(0, node.boostActivation - 0.02);
            node.scale += (node.targetScale - node.scale) * this.animationSpeed;

            // The node's "home" position is its floating position
            const homeX = node.baseX + Math.sin(this.time * node.floatSpeedX + node.floatPhaseX) * node.floatRangeX;
            const homeY = node.baseY + Math.sin(this.time * node.floatSpeedY + node.floatPhaseY) * node.floatRangeY;

            // Spring force to pull the node back to its home position
            const springForceX = (homeX - node.x) * 0.015;
            const springForceY = (homeY - node.y) * 0.015;

            node.vx += springForceX;
            node.vy += springForceY;

            // Mouse interaction (attraction and repulsion based on distance)
            if (this.mouse.x !== undefined && this.mouse.y !== undefined) {
                const dx = node.x - this.mouse.x;
                const dy = node.y - this.mouse.y;
                const distance = Math.hypot(dx, dy);
                
                if (distance < this.mouse.radius) {
                    const normalizedDist = distance / this.mouse.radius;
                    const force = Math.sin(normalizedDist * Math.PI) * 3;
                    const angle = Math.atan2(dy, dx);
                    
                    if (distance < this.mouse.radius * 0.5) {
                        // Repulsion at close range
                        node.vx += Math.cos(angle) * force * 2;
                        node.vy += Math.sin(angle) * force * 2;
                    } else {
                        // Attraction at medium range
                        node.vx -= Math.cos(angle) * force * 0.5;
                        node.vy -= Math.sin(angle) * force * 0.5;
                    }
                }
            }
            
            // Damping
            node.vx *= 0.9;
            node.vy *= 0.9;
            
            // Update position
            node.x += node.vx;
            node.y += node.vy;
        });
        
        // Draw pulse waves
        this.drawPulseWaves();
        
        // Update and draw connections
        this.connections.forEach(conn => {
            conn.opacity += (conn.targetOpacity - conn.opacity) * this.animationSpeed;
            conn.signal = (Math.sin(this.time * 3 + conn.from.baseX * 0.02) + 1) / 2;
            conn.dataFlow = Math.max(0, conn.dataFlow - 0.02);

            if (conn.from.scale < 0.1 || conn.to.scale < 0.1 || conn.opacity < 0.01) return;

            const nodeScale = Math.min(conn.from.scale, conn.to.scale);
            const activationBoost = Math.max(conn.from.boostActivation, conn.to.boostActivation);
            const finalOpacity = conn.opacity * nodeScale * (0.4 + conn.signal * 0.4 + activationBoost * 0.2);

            // Draw connection line with gradient
            const gradient = this.ctx.createLinearGradient(
                conn.from.x, conn.from.y,
                conn.to.x, conn.to.y
            );
            
            const hue = 200 + this.colorShift + conn.signal * 60;
            gradient.addColorStop(0, `hsla(${hue}, 80%, 60%, ${finalOpacity})`);
            gradient.addColorStop(0.5, `hsla(${hue + 30}, 90%, 65%, ${finalOpacity * 1.2})`);
            gradient.addColorStop(1, `hsla(${hue}, 80%, 60%, ${finalOpacity})`);

            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.lineTo(conn.to.x, conn.to.y);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = (0.5 + conn.signal * 1 + conn.dataFlow * 2) * nodeScale * conn.strength;
            this.ctx.stroke();
            
            // Draw data flow particles
            if (conn.dataFlow > 0.1) {
                const progress = (this.time * 2) % 1;
                const x = conn.from.x + (conn.to.x - conn.from.x) * progress;
                const y = conn.from.y + (conn.to.y - conn.from.y) * progress;
                
                this.ctx.beginPath();
                this.ctx.arc(x, y, 2 * conn.dataFlow, 0, Math.PI * 2);
                this.ctx.fillStyle = `hsla(${hue + 60}, 100%, 70%, ${conn.dataFlow})`;
                this.ctx.fill();
            }
        });

        // Draw nodes
        this.nodes.forEach(node => {
            if (node.scale < 0.01) return;
            const radius = node.radius * node.scale;
            const totalActivation = node.activation + node.boostActivation;
            const glowOpacity = (0.5 + totalActivation * 0.5) * node.scale;
            
            const hue = node.type === 'core' ? 
                (node.hue + this.colorShift) % 360 : 
                (200 + this.colorShift + node.activation * 60) % 360;

            // Outer glow
            const grad = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius * 6);
            grad.addColorStop(0, `hsla(${hue}, 90%, 60%, ${glowOpacity * 0.8})`);
            grad.addColorStop(0.3, `hsla(${hue}, 80%, 50%, ${glowOpacity * 0.4})`);
            grad.addColorStop(1, `hsla(${hue}, 70%, 40%, 0)`);

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius * 6, 0, Math.PI * 2);
            this.ctx.fillStyle = grad;
            this.ctx.fill();

            // Inner core
            const coreGrad = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, radius);
            if (node.type === 'core') {
                coreGrad.addColorStop(0, `hsla(${hue}, 100%, 90%, ${node.scale})`);
                coreGrad.addColorStop(0.7, `hsla(${hue}, 90%, 70%, ${node.scale * 0.9})`);
                coreGrad.addColorStop(1, `hsla(${hue}, 80%, 60%, ${node.scale * 0.8})`);
            } else {
                coreGrad.addColorStop(0, `rgba(255, 255, 255, ${0.95 * node.scale})`);
                coreGrad.addColorStop(1, `hsla(${hue}, 50%, 80%, ${0.8 * node.scale})`);
            }

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
            this.ctx.fillStyle = coreGrad;
            this.ctx.fill();
            
            // Activation ring
            if (totalActivation > 0.7) {
                this.ctx.beginPath();
                this.ctx.arc(node.x, node.y, radius * 2, 0, Math.PI * 2);
                this.ctx.strokeStyle = `hsla(${hue + 60}, 100%, 70%, ${(totalActivation - 0.7) * node.scale})`;
                this.ctx.lineWidth = 1;
                this.ctx.stroke();
            }
        });

        this.drawParticles();
        this.drawMouseTrail();

        requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new FancyNeuralNetworkVisualization('fancyNeuralCanvas');
});