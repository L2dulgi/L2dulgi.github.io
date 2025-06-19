// Enhanced Data Loader Module for Fully Dynamic Content
class DataLoader {
    constructor() {
        this.data = {
            personal: null,
            education: null,
            research: null,
            publications: null,
            awards: null,
            skills: null,
            config: null
        };
    }

    async loadAllData() {
        try {
            const files = ['personal', 'education', 'research', 'publications', 'awards', 'skills', 'config'];
            
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

    updatePageTitle() {
        if (!this.data.personal || !this.data.config) return;
        
        const title = this.data.config.site.title_template.replace('{name}', this.data.personal.name.full);
        document.getElementById('page-title').textContent = title;
        document.title = title;
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
        if (!this.data.personal || !this.data.config) return;

        const personal = this.data.personal;
        
        // Update hero content
        const heroName = document.getElementById('hero-name');
        const heroTitle = document.getElementById('hero-title');
        const heroDescription = document.getElementById('hero-description');
        const profileImg = document.getElementById('profile-img');
        
        if (heroName) heroName.textContent = personal.name.full;
        if (heroTitle) heroTitle.textContent = personal.subtitle;
        if (heroDescription) heroDescription.textContent = personal.tagline + '. ' + personal.about.short;
        if (profileImg) profileImg.alt = personal.name.full;
        
        // Update hero actions
        this.updateHeroActions();
        
        // Calculate and update stats
        this.updateHeroStats();
        
        // Update social links
        this.updateHeroSocialLinks();
    }

    updateHeroActions() {
        if (!this.data.config) return;
        
        const heroActions = document.getElementById('hero-actions');
        if (!heroActions) return;
        
        heroActions.innerHTML = '';
        
        this.data.config.site.hero.actions.forEach(action => {
            const link = document.createElement('a');
            link.href = action.href;
            link.className = action.class;
            if (action.target) link.target = action.target;
            
            let content = '';
            if (action.icon) content += `<i class="${action.icon}"></i> `;
            content += action.text;
            
            link.innerHTML = content;
            heroActions.appendChild(link);
        });
    }

    calculateYearsExperience() {
        if (!this.data.education) return 0;
        
        // Find MS-PhD Combined program start date
        const msPhdDegree = this.data.education.degrees.find(degree => 
            degree.degree === 'MS-PhD Combined' || 
            degree.degree.toLowerCase().includes('ms-phd') ||
            degree.degree.toLowerCase().includes('phd')
        );
        
        if (!msPhdDegree) return 0;
        
        const startDate = msPhdDegree.startDate;
        const [year, month] = startDate.split('.');
        const startYear = parseInt(year);
        const startMonth = parseInt(month);
        
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1; // getMonth() returns 0-11
        
        let years = currentYear - startYear;
        if (currentMonth < startMonth) {
            years -= 1;
        }
        
        return Math.max(0, years);
    }

    updateHeroStats() {
        if (!this.data.education || !this.data.config) return;

        const heroStats = document.getElementById('hero-stats');
        if (!heroStats) return;
        
        heroStats.innerHTML = '';
        
        // Calculate stats
        const stats = {};
        
        // Add publications count if available
        if (this.data.publications) {
            stats.publications_count = this.data.publications.statistics.total_papers;
        }
        
        this.data.config.site.hero.stats.forEach(statConfig => {
            const statItem = document.createElement('div');
            statItem.className = 'stat-item';
            
            const value = stats[statConfig.source] || 0;
            
            statItem.innerHTML = `
                <span class="stat-number" data-target="${value}" id="${statConfig.id}">0</span>
                <span class="stat-label">${statConfig.label}</span>
            `;
            
            heroStats.appendChild(statItem);
            
            // Animate the number
            this.animateStatNumber(statConfig.id, value);
        });
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

    updateHeroSocialLinks() {
        if (!this.data.personal || !this.data.config) return;
        
        const heroSocial = document.getElementById('hero-social');
        if (!heroSocial) return;
        
        heroSocial.innerHTML = '';
        
        this.data.config.site.hero.social_links.forEach(socialConfig => {
            const link = document.createElement('a');
            link.className = 'social-link';
            link.title = socialConfig.title;
            link.target = '_blank';
            
            // Set href based on source
            if (socialConfig.href_source === 'googleScholar') {
                link.href = this.data.personal.social.googleScholar;
            } else if (socialConfig.href_source === 'linkedin') {
                link.href = this.data.personal.social.linkedin;
            } else if (socialConfig.href_source === 'email') {
                link.href = `mailto:${this.data.personal.contact.email}`;
            }
            
            link.innerHTML = `<i class="${socialConfig.icon}"></i>`;
            heroSocial.appendChild(link);
        });
    }

    updateSectionTitles() {
        if (!this.data.config) return;
        
        const sections = this.data.config.site.sections;
        Object.keys(sections).forEach(sectionKey => {
            const element = document.getElementById(`${sectionKey}-section-title`);
            if (element) {
                element.textContent = sections[sectionKey];
            }
        });
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
        if (!this.data.education) return;

        const affiliationsList = document.getElementById('affiliations-list');
        if (!affiliationsList) return;

        affiliationsList.innerHTML = '';
        
        // Get current affiliations from education only
        const currentAffiliations = new Set();
        const pastAffiliations = new Set();
        
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
            } else if (degree.status === 'completed' && degree.degree === 'Visiting Scholar') {
                pastAffiliations.add(`${degree.institution} (Visiting Scholar, ${degree.endDate})`);
            }
        });
        
        // Add current affiliations
        currentAffiliations.forEach(affiliation => {
            const li = document.createElement('li');
            li.textContent = affiliation;
            affiliationsList.appendChild(li);
        });
        
        // Add past affiliations with different styling
        pastAffiliations.forEach(affiliation => {
            const li = document.createElement('li');
            li.textContent = affiliation;
            li.style.opacity = '0.7';
            li.style.fontStyle = 'italic';
            affiliationsList.appendChild(li);
        });
    }

    updatePublicationsSection() {
        if (!this.data.publications || !this.data.config) return;
        
        // Update publication stats
        this.updatePublicationStats();
        
        // Update publication filters
        this.updatePublicationFilters();
    }

    updatePublicationStats() {
        if (!this.data.publications || !this.data.config) return;
        
        const statsContainer = document.getElementById('publication-stats');
        if (!statsContainer) return;
        
        statsContainer.innerHTML = '';
        
        const stats = this.data.publications.statistics;
        
        this.data.config.site.publications.stats.forEach(statConfig => {
            const statDiv = document.createElement('div');
            statDiv.className = 'pub-stat';
            
            const value = stats[statConfig.source] || 0;
            
            statDiv.innerHTML = `
                <i class="${statConfig.icon}"></i>
                <span class="pub-count">${value}</span>
                <span class="pub-label">${statConfig.label}</span>
            `;
            
            statsContainer.appendChild(statDiv);
        });
    }

    updatePublicationFilters() {
        if (!this.data.publications || !this.data.config) return;
        
        const filtersContainer = document.getElementById('publication-filters');
        if (!filtersContainer) return;
        
        const stats = this.data.publications.statistics;
        const config = this.data.config.site.publications.filters;
        
        filtersContainer.innerHTML = `
            <select id="pubYearFilter" class="filter-select">
                <option value="all">${config.years.label}</option>
                ${stats.years_active.map(year => `<option value="${year}">${year}</option>`).join('')}
            </select>
            <select id="pubTypeFilter" class="filter-select">
                <option value="all">${config.types.label}</option>
                ${config.types.options.map(type => 
                    `<option value="${type}">${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
                ).join('')}
            </select>
            <input type="text" id="pubSearch" class="search-input" placeholder="Search publications...">
        `;
    }



    updateFooter() {
        if (!this.data.personal || !this.data.config) return;
        
        const footerText = document.getElementById('footer-text');
        if (!footerText) return;
        
        const currentYear = new Date().getFullYear();
        const text = this.data.config.site.footer.template
            .replace('{year}', currentYear)
            .replace('{name}', this.data.personal.name.full);
        
        footerText.innerHTML = text;
    }

    async init() {
        try {
            await this.loadAllData();
            
            // Update all sections
            this.updatePageTitle();
            this.updateNavigation();
            this.updateHeroSection();
            this.updateSectionTitles();
            this.updateAboutSection();
            this.updateEducationSection();
            this.updateAffiliationsSection();
            this.updatePublicationsSection();
            this.updateFooter();
            
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