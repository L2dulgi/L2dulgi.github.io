// Mobile Navigation Toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    
    // Animate hamburger menu
    navToggle.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        navMenu.classList.remove('active');
        navToggle.classList.remove('active');
    });
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Navbar scroll effect
let lastScroll = 0;
const navbar = document.querySelector('.navbar');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    
    if (currentScroll > 100) {
        navbar.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.1)';
    } else {
        navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
    }
    
    lastScroll = currentScroll;
});

// Animate elements on scroll
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Wait for DOM to be fully loaded before observing sections
document.addEventListener('DOMContentLoaded', () => {
    // Observe all sections
    document.querySelectorAll('section').forEach(section => {
        if (!section.classList.contains('hero')) { // Don't animate hero section
            section.style.opacity = '0';
            section.style.transform = 'translateY(30px)';
            observer.observe(section);
        }
    });
    
    // Function to observe dynamically created elements
    window.observeNewElements = function() {
        setTimeout(() => {
            document.querySelectorAll('.publication-item, .research-card').forEach(element => {
                if (element.style.opacity !== '0') { // Only observe if not already observed
                    element.style.opacity = '0';
                    element.style.transform = 'translateY(30px)';
                    observer.observe(element);
                }
            });
        }, 500); // Wait for dynamic content to load
    };
    
    // Initial observation for existing elements
    document.querySelectorAll('.about-content').forEach(element => {
        element.style.opacity = '0';
        element.style.transform = 'translateY(30px)';
        observer.observe(element);
    });
    
    // Observe dynamic elements after a delay
    window.observeNewElements();
});


// Typing animation for hero subtitle
const heroSubtitle = document.querySelector('.hero-subtitle');
let roles = ['Lifelong Learning Agents', 'Tech Enthusiast'];
let roleIndex = 0;
let charIndex = 0;
let isDeleting = false;

// Function to update roles from data loader
window.updateTypingRoles = function(newRoles) {
    roles = newRoles;
    roleIndex = 0;
    charIndex = 0;
    isDeleting = false;
};

function typeRole() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
        heroSubtitle.textContent = currentRole.substring(0, charIndex - 1);
        charIndex--;
        
        if (charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }
    } else {
        heroSubtitle.textContent = currentRole.substring(0, charIndex + 1);
        charIndex++;
        
        if (charIndex === currentRole.length) {
            isDeleting = true;
            setTimeout(typeRole, 2000); // Pause at the end
            return;
        }
    }
    
    setTimeout(typeRole, isDeleting ? 50 : 100);
}

// Start typing animation after page loads
window.addEventListener('load', () => {
    setTimeout(typeRole, 1000);
});

// Add parallax effect to shapes
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const shapes = document.querySelectorAll('.shape');
    
    shapes.forEach((shape, index) => {
        const speed = 0.5 + (index * 0.1);
        const yPos = -(scrolled * speed);
        shape.style.transform = `translateY(${yPos}px)`;
    });
});

// Add hover effect to portfolio items
const portfolioItems = document.querySelectorAll('.portfolio-item');

portfolioItems.forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-10px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});