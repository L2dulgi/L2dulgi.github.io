// Publications Management System
class Publication {
    constructor(data) {
        this.data = data;
    }

    render() {
        const pub = document.createElement('div');
        pub.className = 'publication-item';
        pub.setAttribute('data-year', this.data.year);
        pub.setAttribute('data-type', this.data.type);

        const typeIcon = this.getTypeIcon();
        const venueClass = this.getVenueClass();

        pub.innerHTML = `
            <div class="pub-icon">
                <i class="${typeIcon}"></i>
            </div>
            <div class="pub-content">
                <h3 class="pub-title">${this.data.title}</h3>
                <div class="pub-authors">
                    ${this.formatAuthors()}
                </div>
                <div class="pub-venue">
                    <span class="venue-name ${venueClass}">${this.data.venue}</span>
                    <span class="pub-year">${this.data.year}</span>
                    ${this.data.award ? `<span class="pub-award"><i class="fas fa-trophy"></i> ${this.data.award}</span>` : ''}
                </div>
                <div class="pub-abstract">
                    <p>${this.data.abstract}</p>
                </div>
                <div class="pub-links">
                    ${this.data.pdf ? `<a href="${this.data.pdf}" class="pub-link" target="_blank"><i class="fas fa-file-pdf"></i> PDF</a>` : ''}
                    ${this.data.arxiv ? `<a href="${this.data.arxiv}" class="pub-link" target="_blank"><i class="ai ai-arxiv"></i> arXiv</a>` : ''}
                    ${this.data.code ? `<a href="${this.data.code}" class="pub-link" target="_blank"><i class="fab fa-github"></i> Code</a>` : ''}
                    ${this.data.openreview ? `<a href="${this.data.openreview}" class="pub-link openreview-link" target="_blank"><i class="fas fa-external-link-alt"></i> OpenReview</a>` : ''}
                    ${this.data.project ? `<a href="${this.data.project}" class="pub-link" target="_blank"><i class="fas fa-project-diagram"></i> Project</a>` : ''}
                    ${this.data.video ? `<a href="${this.data.video}" class="pub-link" target="_blank"><i class="fab fa-youtube"></i> Video</a>` : ''}
                    <button class="pub-link cite-btn" data-pub-id="${this.data.id}"><i class="fas fa-quote-left"></i> Cite</button>
                </div>
                ${this.data.citations ? `
                    <div class="pub-metrics">
                        <span class="metric"><i class="fas fa-quote-right"></i> ${this.data.citations} citations</span>
                    </div>
                ` : ''}
            </div>
        `;

        // Add cite functionality
        const citeBtn = pub.querySelector('.cite-btn');
        citeBtn.addEventListener('click', () => this.showCitation());

        return pub;
    }

    formatAuthors() {
        return this.data.authors.map((author, index) => {
            const isMe = author.includes('Daehee Lee') || author.includes('D. Lee');
            const authorHtml = isMe ? `<strong>${author}</strong>` : author;
            return index === this.data.authors.length - 1 ? authorHtml : authorHtml + ', ';
        }).join('');
    }

    getTypeIcon() {
        const icons = {
            'conference': 'fas fa-users',
            'journal': 'fas fa-book',
            'workshop': 'fas fa-chalkboard-teacher',
            'preprint': 'fas fa-file-alt'
        };
        return icons[this.data.type] || 'fas fa-file-alt';
    }

    getVenueClass() {
        const topVenues = ['NeurIPS', 'ICML', 'ICLR', 'CVPR', 'ICCV', 'ECCV', 'ACL', 'EMNLP', 'AAAI', 'IJCAI'];
        return topVenues.some(venue => this.data.venue.includes(venue)) ? 'top-venue' : '';
    }

    showCitation() {
        const modal = document.createElement('div');
        modal.className = 'citation-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h3>Citation</h3>
                <div class="citation-formats">
                    <div class="format-section">
                        <h4>BibTeX</h4>
                        <pre class="citation-text">${this.getBibtex()}</pre>
                        <button class="copy-btn" data-text="${this.escapeHtml(this.getBibtex())}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <div class="format-section">
                        <h4>APA</h4>
                        <pre class="citation-text">${this.getAPA()}</pre>
                        <button class="copy-btn" data-text="${this.escapeHtml(this.getAPA())}">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Add event listeners
        modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });

        // Copy functionality
        modal.querySelectorAll('.copy-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const text = btn.getAttribute('data-text');
                navigator.clipboard.writeText(text).then(() => {
                    btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
                    setTimeout(() => {
                        btn.innerHTML = '<i class="fas fa-copy"></i> Copy';
                    }, 2000);
                });
            });
        });
    }

    getBibtex() {
        const key = this.data.title.split(' ').slice(0, 2).join('').toLowerCase() + this.data.year;
        return `@${this.data.type}{${key},
  title={${this.data.title}},
  author={${this.data.authors.join(' and ')}},
  booktitle={${this.data.venue}},
  year={${this.data.year}}
}`;
    }

    getAPA() {
        const authorList = this.data.authors.join(', ');
        return `${authorList} (${this.data.year}). ${this.data.title}. In ${this.data.venue}.`;
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Publications Manager
class PublicationsManager {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.publications = [];
        this.filteredPublications = [];
        this.filters = {
            year: 'all',
            type: 'all',
            search: ''
        };
    }

    loadPublications(data) {
        this.publications = data.map(item => new Publication(item));
        this.filteredPublications = [...this.publications];
        this.render();
    }

    render() {
        this.container.innerHTML = '';
        
        if (this.filteredPublications.length === 0) {
            this.container.innerHTML = '<p class="no-results">No publications found matching your criteria.</p>';
            return;
        }

        // Group by year
        const groupedByYear = {};
        this.filteredPublications.forEach(pub => {
            const year = pub.data.year;
            if (!groupedByYear[year]) {
                groupedByYear[year] = [];
            }
            groupedByYear[year].push(pub);
        });

        // Sort years descending
        const years = Object.keys(groupedByYear).sort((a, b) => b - a);

        years.forEach(year => {
            const yearSection = document.createElement('div');
            yearSection.className = 'year-section';
            yearSection.innerHTML = `<h3 class="year-header">${year}</h3>`;
            
            const pubList = document.createElement('div');
            pubList.className = 'publications-year-list';
            
            groupedByYear[year].forEach(pub => {
                pubList.appendChild(pub.render());
            });
            
            yearSection.appendChild(pubList);
            this.container.appendChild(yearSection);
        });
    }

    applyFilters() {
        this.filteredPublications = this.publications.filter(pub => {
            // Year filter
            if (this.filters.year !== 'all' && pub.data.year !== this.filters.year) {
                return false;
            }
            
            // Type filter
            if (this.filters.type !== 'all' && pub.data.type !== this.filters.type) {
                return false;
            }
            
            // Search filter
            if (this.filters.search) {
                const searchLower = this.filters.search.toLowerCase();
                const matchesTitle = pub.data.title.toLowerCase().includes(searchLower);
                const matchesAuthors = pub.data.authors.some(author => 
                    author.toLowerCase().includes(searchLower)
                );
                const matchesVenue = pub.data.venue.toLowerCase().includes(searchLower);
                const matchesTags = pub.data.tags && pub.data.tags.some(tag => 
                    tag.toLowerCase().includes(searchLower)
                );
                
                if (!matchesTitle && !matchesAuthors && !matchesVenue && !matchesTags) {
                    return false;
                }
            }
            
            return true;
        });
        
        this.render();
    }

    setFilter(filterType, value) {
        this.filters[filterType] = value;
        this.applyFilters();
    }
}

// Initialize Publications
document.addEventListener('DOMContentLoaded', () => {
    const pubManager = new PublicationsManager('publicationsList');
    
    // Load publications from data loader
    const loadPublicationsFromDataLoader = () => {
        if (window.dataLoader && window.dataLoader.data.publications) {
            const publications = window.dataLoader.data.publications.publications;
            pubManager.loadPublications(publications);
            
            // Update publication statistics
            updatePublicationStats(window.dataLoader.data.publications.statistics);
        } else {
            // Retry after a short delay if data loader isn't ready
            setTimeout(loadPublicationsFromDataLoader, 100);
        }
    };
    
    // Function to update publication statistics
    const updatePublicationStats = (stats) => {
        const statElements = {
            'total-papers': stats.total_papers,
            'total-citations': stats.total_citations || 0,
            'h-index': stats.h_index || 0
        };
        
        Object.entries(statElements).forEach(([id, value]) => {
            const element = document.querySelector(`[data-stat="${id}"]`);
            if (element) {
                element.textContent = value;
            }
        });
        
        // Update pub-count elements
        const pubCountElements = document.querySelectorAll('.pub-count');
        if (pubCountElements.length >= 3) {
            pubCountElements[0].textContent = stats.total_papers;
            pubCountElements[1].textContent = stats.total_citations || '0';
            pubCountElements[2].textContent = stats.h_index || '0';
        }
    };
    
    // Start loading publications
    loadPublicationsFromDataLoader();

    // Setup filters - wait for them to be created by dataLoader
    const setupFilters = () => {
        const yearFilter = document.getElementById('pubYearFilter');
        const typeFilter = document.getElementById('pubTypeFilter');
        const searchInput = document.getElementById('pubSearch');

        if (yearFilter && typeFilter && searchInput) {
            yearFilter.addEventListener('change', (e) => {
                pubManager.setFilter('year', e.target.value);
            });

            typeFilter.addEventListener('change', (e) => {
                pubManager.setFilter('type', e.target.value);
            });

            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    pubManager.setFilter('search', e.target.value);
                }, 300);
            });
        } else {
            // Retry if filters aren't ready yet
            setTimeout(setupFilters, 100);
        }
    };

    // Start setting up filters
    setupFilters();
});