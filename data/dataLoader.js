// Enhanced Data Loader Module for Dynamic Content
class DataLoader {
    constructor() {
        this.data = {
            personal: null,
            education: null,
            research: null,
            projects: null,
            publications: null,
            awards: null,
            skills: null
        };
    }

    async loadAllData() {
        try {
            const files = ['personal', 'education', 'research', 'projects', 'publications', 'awards', 'skills'];
            
            for (const file of files) {
                const response = await fetch(`data/${file}.json`);
                if (response.ok) {
                    this.data[file] = await response.json();
                } else {
                    console.warn(`Failed to load ${file}.json`);
                }
            }
            
            console.log('Data loaded successfully:', this.data);
            return this.data;
        } catch (error) {
            console.error('Error loading data:', error);
            return null;
        }
    }

    updateNavigation() {
        if (!this.data.personal) return;

        const personal = this.data.personal;
        
        // Update navigation brand
        const navName = document.getElementById('nav-name');
        const navSubtitle = document.getElementById('nav-subtitle');
        
        if (navName) navName.textContent = personal.name.full;
        if (navSubtitle) navSubtitle.textContent = personal.title;
    }

    updateHeroSection() {
        if (!this.data.personal || !this.data.projects || !this.data.education) return;

        const personal = this.data.personal;
        
        // Update hero content
        const heroName = document.getElementById('hero-name');
        const heroTitle = document.getElementById('hero-title');
        const heroDescription = document.getElementById('hero-description');
        
        if (heroName) heroName.textContent = personal.name.full;
        if (heroTitle) heroTitle.textContent = personal.subtitle;
        if (heroDescription) heroDescription.textContent = personal.tagline + '. ' + personal.about.short;
        
        // Calculate and update stats
        this.updateHeroStats();
    }

    updateHeroStats() {
        if (!this.data.projects || !this.data.education) return;

        const projectCount = this.data.projects.projects.length;
        const currentYear = new Date().getFullYear();
        const startYear = parseInt(this.data.education.degrees[2]?.startDate?.split('.')[0] || currentYear);
        const yearsExperience = currentYear - startYear;
        const universitiesCount = [...new Set(this.data.education.degrees.map(d => d.institution))].length;

        // Update stat numbers and animate
        this.animateStatNumber('stat-projects', projectCount);
        this.animateStatNumber('stat-experience', yearsExperience);
        this.animateStatNumber('stat-universities', universitiesCount);
    }

    animateStatNumber(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        element.setAttribute('data-target', targetValue);
        
        let current = 0;
        const increment = targetValue / 30;
        const timer = setInterval(() => {
            current += increment;
            if (current >= targetValue) {
                element.textContent = targetValue;
                clearInterval(timer);
            } else {
                element.textContent = Math.floor(current);
            }
        }, 50);
    }

    updateAboutSection() {
        if (!this.data.personal || !this.data.research) return;

        const personal = this.data.personal;
        
        // Update about text
        const aboutShort = document.getElementById('about-short');
        const aboutDetailed = document.getElementById('about-detailed');
        
        if (aboutShort) aboutShort.textContent = personal.about.short;
        if (aboutDetailed) aboutDetailed.textContent = personal.about.detailed;
        
        // Update research interests
        this.updateResearchInterests();
    }

    updateResearchInterests() {
        if (!this.data.research) return;

        const interestsContainer = document.getElementById('research-interests');
        if (!interestsContainer) return;

        interestsContainer.innerHTML = '';
        
        // Combine research areas and keywords
        const allInterests = [...this.data.research.areas, ...this.data.research.keywords];
        
        allInterests.forEach(interest => {
            const tag = document.createElement('span');
            tag.className = 'tag';
            tag.textContent = interest;
            interestsContainer.appendChild(tag);
        });
    }

    updateEducationSection() {
        if (!this.data.education) return;

        const educationList = document.getElementById('education-list');
        if (!educationList) return;

        educationList.innerHTML = '';
        
        this.data.education.degrees.forEach(degree => {
            const educationItem = document.createElement('div');
            educationItem.className = 'education-item';
            
            const endDate = degree.endDate === 'present' ? 'Present' : degree.endDate;
            const duration = `${degree.startDate} - ${endDate}`;
            
            let focusText = '';
            if (degree.focus && degree.focus.length > 0) {
                focusText = `<p class="thesis">Focus: ${degree.focus.join(', ')}</p>`;
            }
            if (degree.department) {
                focusText = `<p class="thesis">${degree.department}</p>`;
            }
            
            educationItem.innerHTML = `
                <h4>${degree.degree}</h4>
                <p>${degree.institution}, ${duration}</p>
                ${focusText}
            `;
            
            educationList.appendChild(educationItem);
        });
    }

    updateAffiliationsSection() {
        if (!this.data.education || !this.data.projects) return;

        const affiliationsList = document.getElementById('affiliations-list');
        if (!affiliationsList) return;

        affiliationsList.innerHTML = '';
        
        // Get current affiliations from education and projects
        const currentAffiliations = new Set();
        
        // Add current institutions from education
        this.data.education.degrees.forEach(degree => {
            if (degree.status === 'ongoing') {
                if (degree.lab) {
                    currentAffiliations.add(`${degree.lab}, ${degree.institution}`);
                } else if (degree.department) {
                    currentAffiliations.add(`${degree.department}, ${degree.institution}`);
                } else {
                    currentAffiliations.add(degree.institution);
                }
            }
        });
        
        // Add current project institutions
        this.data.projects.projects.forEach(project => {
            if (project.status === 'ongoing') {
                if (project.lab) {
                    currentAffiliations.add(`${project.lab}, ${project.institution}`);
                } else if (project.department) {
                    currentAffiliations.add(`${project.department}, ${project.institution}`);
                } else {
                    currentAffiliations.add(project.institution);
                }
            }
        });
        
        currentAffiliations.forEach(affiliation => {
            const li = document.createElement('li');
            li.textContent = affiliation;
            affiliationsList.appendChild(li);
        });
    }

    updateContactSection() {
        if (!this.data.personal) return;

        const personal = this.data.personal;
        
        // Update contact details
        const contactDetails = document.getElementById('contact-details');
        if (contactDetails) {
            contactDetails.innerHTML = `
                <p><strong>Email:</strong> <a href="mailto:${personal.contact.email}">${personal.contact.email}</a></p>
                <p><strong>Phone:</strong> ${personal.contact.phone}</p>
                <p><strong>Current Location:</strong> ${personal.contact.currentLocation}</p>
                <p><strong>Home:</strong> ${personal.contact.location}</p>
            `;
        }
        
        // Update social links
        const contactLinks = document.getElementById('contact-links');
        if (contactLinks) {
            contactLinks.innerHTML = '';
            
            if (personal.social.googleScholar) {
                contactLinks.innerHTML += `
                    <a href="${personal.social.googleScholar}" target="_blank" class="social-link" title="Google Scholar">
                        <i class="fas fa-graduation-cap"></i>
                    </a>
                `;
            }
            
            if (personal.social.linkedin) {
                contactLinks.innerHTML += `
                    <a href="${personal.social.linkedin}" target="_blank" class="social-link" title="LinkedIn">
                        <i class="fab fa-linkedin"></i>
                    </a>
                `;
            }
            
            if (personal.social.github) {
                contactLinks.innerHTML += `
                    <a href="${personal.social.github}" target="_blank" class="social-link" title="GitHub">
                        <i class="fab fa-github"></i>
                    </a>
                `;
            }
            
            contactLinks.innerHTML += `
                <a href="mailto:${personal.contact.email}" class="social-link" title="Email">
                    <i class="fas fa-envelope"></i>
                </a>
            `;
        }
    }

    updatePublicationStats() {
        if (!this.data.publications) return;
        
        const stats = this.data.publications.statistics;
        
        // Update publication statistics in the publications section
        const pubStats = document.querySelectorAll('.pub-count');
        if (pubStats.length >= 3) {
            pubStats[0].textContent = stats.total_papers;
            pubStats[1].textContent = stats.total_citations || '0';
            pubStats[2].textContent = stats.h_index || '0';
        }
        
        // Update hero stats if needed
        const statPublications = document.getElementById('stat-publications');
        if (statPublications) {
            this.animateStatNumber('stat-publications', stats.total_papers);
        }
    }

    async init() {
        try {
            await this.loadAllData();
            
            // Update all sections
            this.updateNavigation();
            this.updateHeroSection();
            this.updateAboutSection();
            this.updateEducationSection();
            this.updateAffiliationsSection();
            this.updateContactSection();
            this.updatePublicationStats();
            
            console.log('All sections updated successfully');
        } catch (error) {
            console.error('Error initializing data loader:', error);
        }
    }
}

// Create global instance
window.dataLoader = new DataLoader();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.dataLoader.init();
});

// Export for use in other scripts
window.DataLoader = DataLoader;