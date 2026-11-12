// ===== Portfolio Website — Main JS =====
// Reads data from embedded JSON (no external fetch needed)

const PORTFOLIO_DATA = document.currentScript.dataset.portfolio;
const data = JSON.parse(PORTFOLIO_DATA);

// Safe access helper
const get = (obj, path, fallback = null) => {
    return path.split('.').reduce((o, key) => o?.[key], obj) ?? fallback;
};

// ===== DOM Elements =====
const nav = document.querySelector('.navbar');
const heroName = document.querySelector('.hero-name');
const heroTitle = document.querySelector('.hero-title');
const heroDescription = document.querySelector('.hero-description');
const aboutContent = document.querySelector('.about-content');
const projectsGrid = document.querySelector('.projects-grid');
const skillsGrid = document.querySelector('.skills-grid');

// ===== Render Functions =====

function renderHero() {
    const personal = data.personal;
    
    heroName.textContent = get(personal, 'name', '');
    heroTitle.textContent = get(personal, 'title', '');
    heroDescription.textContent = get(personal, 'description', '');

}

function renderAbout() {
    const about = data.about;
    
    if (!about) return;

    let html = '';

    // Name & title
    if (get(about, 'name')) {
        html += `<h2 class="section-title">${get(about, 'name')}</h2>`;
    }

    // Bio paragraphs
    const bio = get(about, 'bio', '');
    if (bio) {
        html += `<p>${bio}</p>`;
    }

    // Education
    const education = get(about, 'education');
    if (education && Array.isArray(education)) {
        for (const item of education) {
            const degree = get(item, 'degree', '');
            const institution = get(item, 'institution', '');
            const year = get(item, 'year', '');
            const description = get(item, 'description', '');

            if (degree || institution) {
                html += `
                    <div style="margin-bottom: var(--space-6);">
                        <span style="font-size: 0.875rem; font-weight: 600; color: var(--accent-blue);">${get(item, 'type', '')}</span>
                        <h3 style="font-size: 1.25rem; margin-top: var(--space-2);">${degree}</h3>
                        <p style="color: var(--text-muted); font-size: 0.9rem;">${institution} ${year ? `| ${year}` : ''}</p>
                        ${description ? `<p style="margin-top: var(--space-2); color: var(--text-secondary); line-height: 1.7;">${description}</p>` : ''}
                    </div>
                `;
            }
        }
    }

    // Interests
    const interests = get(about, 'interests');
    if (interests && Array.isArray(interests)) {
        html += `<h3 style="font-size: 1rem; margin-top: var(--space-6);">Interests</h3>`;
        for (const interest of interests) {
            html += `<span style="display: inline-block; font-size: 0.875rem; padding: 4px 12px; background: rgba(58,149,216,0.1); color: var(--accent-blue); border-radius: 4px; margin-right: 8px;">${interest}</span>`;
        }
    }

    aboutContent.innerHTML = html || '<p>No content available.</p>';
}

function renderProjects() {
    const projects = get(data, 'projects', []);

    if (!Array.isArray(projects) || projects.length === 0) return;

    for (const project of projects) {
        const title = get(project, 'title', '');
        const description = get(project, 'description', '');
        const technologies = get(project, 'technologies', []);
        const image = get(project, 'image');
        const githubLink = get(project, 'github_link');
        const demoLink = get(project, 'demo_link');

        let html = '';

        // Image or placeholder graphic
        if (image) {
            html += `<img src="${image}" alt="${title}" style="width: 100%; height: auto; border-bottom: 1px solid var(--border-color);">`;
        } else {
            html += `
                <div class="project-image" style="padding: var(--space-6) var(--space-4); background: #0F1217;">
                    <svg width="100%" height="180" viewBox="0 0 400 180" fill="none">
                        <rect width="400" height="180" rx="8" fill="#0F1217"/>
                        <path d="M50 60h300v2H50z" fill="#1A1D24"/>
                        <path d="M50 90h300v2H50z" fill="#1A1D24"/>
                        <path d="M50 120h300v2H50z" fill="#1A1D24"/>
                        <rect x="80" y="40" width="60" height="90" rx="4" fill="#1A1D24"/>
                        <rect x="160" y="40" width="60" height="90" rx="4" fill="#1A1D24"/>
                        <rect x="240" y="40" width="60" height="90" rx="4" fill="#1A1D24"/>
                    </svg>
                </div>`;
        }

        html += `
            <div class="project-info">
                ${get(project, 'category') ? `<span class="project-category">${get(project, 'category')}</span>` : ''}
                <h3>${title}</h3>
                <p>${description}</p>
                <div class="project-tags">
                    ${technologies.map(t => `<span class="tag">${t}</span>`).join('')}
                </div>
            </div>
        `;

        // Links
        const links = [];
        if (githubLink) {
            links.push(`<a href="${githubLink}" target="_blank" rel="noopener">GitHub</a>`);
        }
        if (demoLink) {
            links.push(`<a href="${demoLink}" target="_blank" rel="noopener">Live Demo</a>`);
        }

        if (links.length > 0) {
            html += `<div class="project-links">${links.join('')}</div>`;
        }

        projectsGrid.innerHTML += html;
    }
}

function renderSkills() {
    const skills = get(data, 'skills', []);

    if (!Array.isArray(skills) || skills.length === 0) return;

    for (const category of skills) {
        const title = get(category, 'category', '');
        const items = get(category, 'items', []);

        if (!title || !Array.isArray(items)) continue;

        let html = `<div class="skill-category">`;
        html += `<h3>${title}</h3>`;
        html += `<ul class="skill-list">`;

        for (const item of items) {
            const name = get(item, 'name', '');
            const level = get(item, 'level'); // optional: "beginner", "intermediate", "advanced"
            
            let badge = '';
            if (level) {
                const colors = { beginner: '#707782', intermediate: '#A0A5AE', advanced: '#3A95D8' };
                badge = `<span style="font-size: 0.65rem; padding: 2px 6px; background: ${colors[level] || '#707782'}; color: #fff; border-radius: 3px; margin-left: 6px;">${level}</span>`;
            }

            html += `<li>${name}${badge}</li>`;
        }

        html += `</ul></div>`;
        skillsGrid.innerHTML += html;
    }
}



// ===== Initialize =====

function init() {
    renderHero();
    renderAbout();
    renderProjects();
    renderSkills();

    // Smooth scroll spy for nav active state
    const sections = document.querySelectorAll('section[id]');
    
    function updateActiveNav() {
        let current = '';
        const scrollY = window.scrollY;

        for (const section of sections) {
            const id = section.getAttribute('id');
            const rect = section.getBoundingClientRect();

            if (rect.top <= 120 && rect.bottom >= 120) {
                current = id;
                break;
            }
        }

        document.querySelectorAll('.nav-links a').forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}`) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });
    updateActiveNav(); // initial call
}

document.addEventListener('DOMContentLoaded', init);