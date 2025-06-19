// Research Cards Interactive Component
class ResearchCard {
    constructor(data) {
        this.data = data;
    }

    render() {
        const card = document.createElement('div');
        card.className = `research-card ${this.data.category}`;
        card.setAttribute('data-category', this.data.category);
        
        card.innerHTML = `
            <div class="card-header">
                <span class="card-category">${this.formatCategory(this.data.category)}</span>
                <span class="card-year">${this.data.year}</span>
            </div>
            <h3 class="card-title">${this.data.title}</h3>
            <p class="card-description">${this.data.description}</p>
            <div class="card-tags">
                ${this.data.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
            <div class="card-metrics">
                ${this.data.metrics ? this.renderMetrics() : ''}
            </div>
            <div class="card-actions">
                ${this.data.paper ? `<a href="${this.data.paper}" class="card-link" target="_blank"><i class="fas fa-file-pdf"></i> Paper</a>` : ''}
                ${this.data.code ? `<a href="${this.data.code}" class="card-link" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
                ${this.data.demo ? `<a href="${this.data.demo}" class="card-link" target="_blank"><i class="fas fa-play"></i> Demo</a>` : ''}
            </div>
        `;

        card.addEventListener('click', () => this.showDetails());
        return card;
    }

    renderMetrics() {
        return `
            <div class="metrics-grid">
                ${this.data.metrics.accuracy ? `
                    <div class="metric">
                        <span class="metric-value">${this.data.metrics.accuracy}%</span>
                        <span class="metric-label">Accuracy</span>
                    </div>
                ` : ''}
                ${this.data.metrics.improvement ? `
                    <div class="metric">
                        <span class="metric-value">+${this.data.metrics.improvement}%</span>
                        <span class="metric-label">Improvement</span>
                    </div>
                ` : ''}
                ${this.data.metrics.speed ? `
                    <div class="metric">
                        <span class="metric-value">${this.data.metrics.speed}x</span>
                        <span class="metric-label">Faster</span>
                    </div>
                ` : ''}
            </div>
        `;
    }

    formatCategory(category) {
        return category.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    showDetails() {
        const modal = document.createElement('div');
        modal.className = 'research-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2>${this.data.title}</h2>
                <div class="modal-body">
                    <div class="modal-section">
                        <h3>Abstract</h3>
                        <p>${this.data.abstract || this.data.description}</p>
                    </div>
                    ${this.data.methodology ? `
                        <div class="modal-section">
                            <h3>Methodology</h3>
                            <p>${this.data.methodology}</p>
                        </div>
                    ` : ''}
                    ${this.data.results ? `
                        <div class="modal-section">
                            <h3>Key Results</h3>
                            <ul>
                                ${this.data.results.map(result => `<li>${result}</li>`).join('')}
                            </ul>
                        </div>
                    ` : ''}
                    ${this.data.image ? `
                        <div class="modal-section">
                            <h3>Architecture</h3>
                            <img src="${this.data.image}" alt="${this.data.title}" class="modal-image">
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    }
}

// Research Grid Manager
class ResearchGrid {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.cards = [];
        this.activeFilter = 'all';
    }

    loadResearch(data) {
        this.cards = data.map(item => new ResearchCard(item));
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        const filteredCards = this.activeFilter === 'all' 
            ? this.cards 
            : this.cards.filter(card => card.data.category === this.activeFilter);

        filteredCards.forEach(card => {
            this.container.appendChild(card.render());
        });

        // Animate cards on load
        this.animateCards();
    }

    animateCards() {
        const cards = this.container.querySelectorAll('.research-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    filter(category) {
        this.activeFilter = category;
        this.render();
    }
}

// Initialize Research Grid
document.addEventListener('DOMContentLoaded', () => {
    const researchGrid = new ResearchGrid('researchGrid');
    
    // Wait for data loader to be ready and load research data
    const loadResearchFromDataLoader = () => {
        if (window.dataLoader && window.dataLoader.data.projects) {
            const projects = window.dataLoader.data.projects.projects.map((project, index) => ({
                id: index + 1,
                title: project.title,
                category: project.category.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                year: project.startDate.split('.')[0],
                description: project.description,
                tags: project.technologies.slice(0, 4),
                institution: project.institution,
                status: project.status,
                startDate: project.startDate,
                endDate: project.endDate,
                role: project.role,
                lab: project.lab,
                abstract: project.description,
                methodology: `Research conducted at ${project.institution}${project.lab ? ` in ${project.lab}` : ''}. Role: ${project.role}.`,
                results: [
                    `Status: ${project.status}`,
                    `Duration: ${project.startDate} - ${project.endDate}`,
                    `Technologies: ${project.technologies.join(', ')}`
                ]
            }));
            
            researchGrid.loadResearch(projects);
        } else {
            // Retry after a short delay if data loader isn't ready
            setTimeout(loadResearchFromDataLoader, 100);
        }
    };
    
    // Start loading research data
    loadResearchFromDataLoader();

    // Setup filters
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            researchGrid.filter(btn.getAttribute('data-filter'));
        });
    });
});