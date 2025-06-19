// Data Loader Module
const DataLoader = {
    data: {
        personal: null,
        education: null,
        research: null,
        projects: null,
        awards: null,
        skills: null
    },

    async loadAllData() {
        try {
            // Load all JSON files
            const files = ['personal', 'education', 'research', 'projects', 'awards', 'skills'];
            
            for (const file of files) {
                const response = await fetch(`data/${file}.json`);
                this.data[file] = await response.json();
            }
            
            console.log('All data loaded successfully');
            return this.data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    },

    updatePersonalInfo() {
        if (!this.data.personal) return;

        const personal = this.data.personal;
        
        // Update navbar brand
        const navBrand = document.querySelector('.nav-brand');
        if (navBrand) navBrand.textContent = personal.name.full;

        // Update hero section
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) heroTitle.textContent = `Hi, I'm ${personal.name.first} ${personal.name.last}`;

        const heroSubtitle = document.querySelector('.hero-subtitle');
        if (heroSubtitle) heroSubtitle.textContent = personal.subtitle;

        // Update about section
        const aboutText = document.querySelector('.about-text p');
        if (aboutText) aboutText.textContent = personal.about.detailed;

        // Update contact links
        const contactLinks = document.querySelector('.contact-links');
        if (contactLinks && personal.social) {
            contactLinks.innerHTML = '';
            
            if (personal.social.googleScholar) {
                contactLinks.innerHTML += `<a href="${personal.social.googleScholar}" target="_blank" class="social-link" title="Google Scholar"><i class="fas fa-graduation-cap"></i></a>`;
            }
            if (personal.social.linkedin) {
                contactLinks.innerHTML += `<a href="${personal.social.linkedin}" target="_blank" class="social-link" title="LinkedIn"><i class="fab fa-linkedin"></i></a>`;
            }
            if (personal.social.github) {
                contactLinks.innerHTML += `<a href="${personal.social.github}" target="_blank" class="social-link" title="GitHub"><i class="fab fa-github"></i></a>`;
            }
            contactLinks.innerHTML += `<a href="mailto:${personal.contact.email}" class="social-link" title="Email"><i class="fas fa-envelope"></i></a>`;
        }

        // Update contact info
        const contactInfo = document.querySelector('.contact-info p');
        if (contactInfo) {
            contactInfo.innerHTML = `
                Currently a ${personal.title} at Sungkyunkwan University and Visiting Scholar at Carnegie Mellon University.<br>
                Email: <a href="mailto:${personal.contact.email}">${personal.contact.email}</a><br>
                Phone: ${personal.contact.phone}
            `;
        }
    },

    updateEducation() {
        if (!this.data.education) return;

        // Add education section to about
        const aboutStats = document.querySelector('.about-stats');
        if (aboutStats) {
            const currentDegree = this.data.education.degrees[0];
            const yearsExperience = new Date().getFullYear() - parseInt(this.data.education.degrees[2].startDate.split('.')[0]);
            
            aboutStats.innerHTML = `
                <div class="stat">
                    <h3>${this.data.projects.projects.length}</h3>
                    <p>Research Projects</p>
                </div>
                <div class="stat">
                    <h3>${yearsExperience}+</h3>
                    <p>Years in Research</p>
                </div>
                <div class="stat">
                    <h3>${this.data.awards.grants.length + this.data.awards.scholarships.length}</h3>
                    <p>Awards & Scholarships</p>
                </div>
            `;
        }
    },

    updateSkills() {
        if (!this.data.skills) return;

        const skillsContainer = document.querySelector('.skills');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            // Add main technical skills
            const mainSkills = [
                ...this.data.skills.technical.languages.slice(0, 3),
                ...this.data.skills.technical.areas.slice(0, 3)
            ];
            
            mainSkills.forEach(skill => {
                skillsContainer.innerHTML += `<div class="skill-tag">${skill}</div>`;
            });
        }
    },

    updateProjects() {
        if (!this.data.projects) return;

        const portfolioGrid = document.querySelector('.portfolio-grid');
        if (portfolioGrid) {
            portfolioGrid.innerHTML = '';
            
            // Show top 6 projects
            const topProjects = this.data.projects.projects.slice(0, 6);
            
            topProjects.forEach(project => {
                const projectHtml = `
                    <div class="portfolio-item">
                        <div class="portfolio-image">
                            <img src="https://via.placeholder.com/400x300/667eea/ffffff?text=${encodeURIComponent(project.title.split(' ').slice(0, 2).join(' '))}" alt="${project.title}">
                            <div class="portfolio-overlay">
                                <h3>${project.title}</h3>
                                <p>${project.category}</p>
                                <div class="project-tech">
                                    ${project.technologies.slice(0, 2).map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
                                </div>
                                <p class="project-status">${project.status === 'ongoing' ? 'Ongoing' : 'Completed'}</p>
                            </div>
                        </div>
                    </div>
                `;
                portfolioGrid.innerHTML += projectHtml;
            });
        }
    },

    updateResearchAreas() {
        if (!this.data.research) return;

        // Update hero subtitle with research areas
        const roles = this.data.research.areas.slice(0, 4).map(area => `${area} Researcher`);
        
        // Update the roles array in script.js
        if (window.updateTypingRoles) {
            window.updateTypingRoles(roles);
        }
    },

    async init() {
        await this.loadAllData();
        this.updatePersonalInfo();
        this.updateEducation();
        this.updateSkills();
        this.updateProjects();
        this.updateResearchAreas();
    }
};

// Initialize data loader when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    DataLoader.init();
});

// Export for use in other scripts
window.DataLoader = DataLoader;