// Mobile Menu Functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.getElementById('hamburger');
    const mobileNavOverlay = document.getElementById('mobileNavOverlay');
    const mobileNavLinks = document.querySelectorAll('.nav-link-mobile');

    // Toggle mobile menu
    hamburger.addEventListener('click', function() {
        hamburger.classList.toggle('active');
        mobileNavOverlay.classList.toggle('active');
        document.body.style.overflow = mobileNavOverlay.classList.contains('active') ? 'hidden' : '';
    });

    // Close mobile menu when clicking on a link
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function() {
            hamburger.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Close mobile menu when clicking outside
    mobileNavOverlay.addEventListener('click', function(e) {
        if (e.target === mobileNavOverlay) {
            hamburger.classList.remove('active');
            mobileNavOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

    // Header scroll effect
    const header = document.querySelector('.header');
    let lastScrollTop = 0;

    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            header.style.background = 'rgba(253, 246, 236, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(43, 45, 66, 0.15)';
        } else {
            header.style.background = 'rgba(253, 246, 236, 0.95)';
            header.style.boxShadow = '0 2px 20px rgba(43, 45, 66, 0.1)';
        }

        lastScrollTop = scrollTop;
    });

    // Smooth scrolling for anchor links
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


    


    // Intersection Observer for animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe elements for animation
    const animatedElements = document.querySelectorAll('.feature-card, .section-title, .offer-card, .testimonial-card, .meal-card, .about-content, .stat-item, .address-card, .location-map');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Menu category functionality
    const categoryButtons = document.querySelectorAll('.category-btn');
    const menuCategories = document.querySelectorAll('.menu-category');

    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetCategory = this.getAttribute('data-category');
            
            // Remove active class from all buttons and categories
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            menuCategories.forEach(category => category.classList.remove('active'));
            
            // Add active class to clicked button and target category
            this.classList.add('active');
            const targetElement = document.getElementById(targetCategory);
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });
});

 