// ===== Portfolio Website — Main JS =====
// Content comes from <script id="portfolio-data"> in index.html and assets/data/skills.csv.

const data = JSON.parse(document.getElementById('portfolio-data').textContent);

// Build a DOM element. Text is always set via textContent, so data can't inject HTML.
function el(tag, props = {}, children = []) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
        if (value == null || value === '' || value === false) continue;
        if (key === 'text') node.textContent = value;
        else if (key === 'class') node.className = value;
        else node.setAttribute(key, value);
    }
    node.append(...children.filter(Boolean));
    return node;
}

const list = (value) => (Array.isArray(value) ? value : []);

// ===== Render Functions =====

function renderHero() {
    const { name, title, description } = data.personal || {};
    if (name) document.querySelector('.hero-name').textContent = name;
    if (title) document.querySelector('.hero-title').textContent = title;
    document.querySelector('.hero-description').textContent = description || '';
}

function renderAbout() {
    const about = data.about;
    if (!about) return;

    const container = document.querySelector('.about-content');
    const header = el('div', { class: 'section-header' }, [
        el('div', {}, [
            el('p', { class: 'section-kicker', text: 'Profile & Engineering Loop' }),
            el('h2', { id: 'about-heading', class: 'section-title', text: about.name || 'About' })
        ]),
        el('p', { class: 'section-subtitle', text: 'From aerodynamic equations and CFD meshes to 3D-printed structures and embedded C++ flight control.' })
    ]);

    const approachCards = list(about.approach).map(step =>
        el('div', { class: 'approach-card' }, [
            el('span', { class: 'approach-step', text: step.step }),
            el('h3', { class: 'approach-title', text: step.title }),
            el('p', { class: 'approach-detail', text: step.detail })
        ])
    );

    const leftCol = el('div', { class: 'about-main' }, [
        about.bio && el('p', { class: 'bio-text', text: about.bio }),
        approachCards.length && el('div', { class: 'approach-grid' }, approachCards)
    ]);

    const eduNodes = list(about.education)
        .filter(item => item.degree || item.institution)
        .map(item => {
            const meta = [item.institution, item.year].filter(Boolean).join(' · ');
            return el('div', { class: 'education-item' }, [
                el('span', { class: 'education-type', text: item.type }),
                el('h3', { class: 'education-degree', text: item.degree }),
                el('p', { class: 'education-institution', text: meta }),
                item.description && el('p', { class: 'education-description', text: item.description })
            ]);
        });

    const interests = list(about.interests);
    const interestsCard = interests.length && el('div', { class: 'interests-card' }, [
        el('span', { class: 'education-type', text: 'Core Domains' }),
        el('h3', { class: 'interests-title', text: 'Focus Areas & Hardware' }),
        el('ul', { class: 'interest-list' },
            interests.map(i => el('li', { class: 'interest-tag', text: i })))
    ]);

    const rightCol = el('div', { class: 'about-sidebar' }, [
        ...eduNodes,
        interestsCard
    ]);

    container.append(
        header,
        el('div', { class: 'about-grid' }, [leftCol, rightCol])
    );
}

const DIAGRAM_SVGS = {
    rover: `
        <svg viewBox="0 0 480 220" fill="none" aria-hidden="true">
            <path d="M-20 45 C 80 15, 160 85, 260 50 C 350 20, 420 70, 500 35" stroke="rgba(255,255,255,0.06)" stroke-width="1.1"/>
            <path d="M-20 80 C 90 45, 175 120, 275 82 C 365 48, 430 105, 500 68" stroke="rgba(255,255,255,0.09)" stroke-width="1.1"/>
            <path d="M-20 118 C 100 85, 190 155, 290 115 C 380 80, 440 140, 500 102" stroke="rgba(94,176,236,0.18)" stroke-width="1.2"/>
            <path d="M-20 156 C 110 125, 205 188, 305 148 C 390 115, 450 175, 500 138" stroke="rgba(255,255,255,0.07)" stroke-width="1.1"/>
            <path d="M-20 192 C 120 165, 220 215, 320 182 C 400 155, 460 205, 500 174" stroke="rgba(255,255,255,0.05)" stroke-width="1.1"/>
            <ellipse cx="145" cy="112" rx="46" ry="24" stroke="rgba(255,255,255,0.08)" stroke-width="1"/>
            <ellipse cx="145" cy="112" rx="22" ry="11" stroke="rgba(255,255,255,0.12)" stroke-width="1"/>
            <path d="M58 168 C 125 162, 195 148, 252 96 C 298 54, 358 52, 422 58" stroke="rgba(94,176,236,0.55)" stroke-width="1.6" stroke-dasharray="5 5"/>
            <circle cx="58" cy="168" r="4" fill="#0B0D11" stroke="rgba(94,176,236,0.65)" stroke-width="1.6"/>
            <circle cx="252" cy="96" r="4" fill="#0B0D11" stroke="rgba(94,176,236,0.65)" stroke-width="1.6"/>
            <circle cx="422" cy="58" r="4.5" fill="rgba(94,176,236,0.8)"/>
            <circle cx="422" cy="58" r="12" stroke="rgba(94,176,236,0.25)" stroke-width="1"/>
            <text x="24" y="30" fill="#848F9E" font-family="Inter, sans-serif" font-size="10" font-weight="500" letter-spacing="1">TERRAIN CONTOUR // WAYPOINT NAV</text>
        </svg>`,
    telemetry: `
        <svg viewBox="0 0 480 220" fill="none" aria-hidden="true">
            <path d="M0 172 L 55 138 L 105 152 L 175 88 L 235 118 L 310 56 L 375 94 L 435 64 L 480 82" stroke="rgba(255,255,255,0.1)" stroke-width="1.1"/>
            <path d="M0 190 L 70 158 L 130 170 L 205 112 L 265 138 L 340 84 L 405 116 L 480 96" stroke="rgba(255,255,255,0.06)" stroke-width="1.1"/>
            <path d="M0 146 C 48 144, 78 96, 126 98 C 174 100, 206 142, 254 110 C 302 78, 336 48, 384 68 C 420 84, 448 62, 480 54" stroke="rgba(94,176,236,0.65)" stroke-width="1.6"/>
            <line x1="310" y1="42" x2="310" y2="195" stroke="rgba(94,176,236,0.2)" stroke-width="1" stroke-dasharray="3 4"/>
            <circle cx="310" cy="67" r="4" fill="rgba(94,176,236,0.85)"/>
            <circle cx="175" cy="88" r="3" fill="#0B0D11" stroke="rgba(255,255,255,0.3)" stroke-width="1.4"/>
            <text x="24" y="30" fill="#848F9E" font-family="Inter, sans-serif" font-size="10" font-weight="500" letter-spacing="1">ELEVATION RIDGE // BLE TELEMETRY</text>
        </svg>`
};

function renderProjects() {
    const grid = document.querySelector('.projects-grid');

    for (const project of list(data.projects)) {
        const media = el('div', { class: 'project-image' });
        if (project.image) {
            media.append(el('img', {
                src: project.image,
                width: project.image_width,
                height: project.image_height,
                alt: project.image_alt || project.title,
                loading: 'lazy',
                decoding: 'async'
            }));
        } else {
            media.classList.add('is-placeholder');
            media.innerHTML = DIAGRAM_SVGS[project.diagram] || DIAGRAM_SVGS.rover;
        }

        const galleryItems = list(project.gallery);
        const visualColumn = project.featured && galleryItems.length
            ? el('div', { class: 'project-showcase' }, [
                media,
                el('div', { class: 'project-subgallery' }, galleryItems.map(img =>
                    el('figure', { class: 'subgallery-item' }, [
                        el('img', {
                            src: img.src,
                            width: img.width,
                            height: img.height,
                            alt: img.alt || '',
                            loading: 'lazy',
                            decoding: 'async'
                        }),
                        img.caption && el('figcaption', { text: img.caption })
                    ])
                ))
            ])
            : media;

        const specs = list(project.specs);
        const specsNode = specs.length && el('dl', { class: 'project-specs' },
            specs.map(s => el('div', { class: 'project-spec-item' }, [
                el('dt', { text: s.label }),
                el('dd', { text: s.value })
            ]))
        );

        const links = [
            project.article && el('a', { class: 'project-link project-read-more', href: project.article, text: 'Read full engineering article →' }),
            project.github_link && el('a', { class: 'project-link', href: project.github_link, target: '_blank', rel: 'noopener', text: 'GitHub' }),
            project.demo_link && el('a', { class: 'project-link', href: project.demo_link, target: '_blank', rel: 'noopener', text: 'Live Demo' })
        ].filter(Boolean);

        const classes = [
            'project-card',
            project.featured && 'is-featured',
            project.article && 'is-clickable'
        ].filter(Boolean).join(' ');

        const card = el('article', { class: classes }, [
            visualColumn,
            el('div', { class: 'project-info' }, [
                el('span', { class: 'project-category', text: project.category }),
                el('h3', { class: 'project-title', text: project.title }),
                el('p', { class: 'project-description', text: project.description }),
                specsNode,
                el('ul', { class: 'project-tags' },
                    list(project.technologies).map(t => el('li', { class: 'tag', text: t }))),
                links.length && el('div', { class: 'project-links' }, links)
            ])
        ]);

        if (project.article) {
            card.addEventListener('click', (e) => {
                if (e.metaKey || e.ctrlKey || e.shiftKey) return;
                const external = e.target.closest('a[target="_blank"]');
                if (external) return;
                e.preventDefault();
                openProjectModal(project.article);
            });
        }

        grid.append(card);
    }
}

// ===== Project Article Modal =====

const articleCache = new Map();

async function openProjectModal(articleUrl) {
    const dialog = document.getElementById('project-modal');
    if (!dialog) {
        window.location.href = articleUrl;
        return;
    }

    const body = dialog.querySelector('.project-modal-body');
    const fullLink = dialog.querySelector('.project-modal-full');
    fullLink.href = articleUrl;

    body.innerHTML = '<p class="modal-loading">Loading article…</p>';
    dialog.showModal();
    dialog.scrollTop = 0;

    try {
        let articleHtml = articleCache.get(articleUrl);
        if (!articleHtml) {
            const res = await fetch(articleUrl);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const doc = new DOMParser().parseFromString(await res.text(), 'text/html');
            const article = doc.querySelector('article.project-article');
            if (!article) throw new Error('Article element missing');

            // Resolve relative image paths against the article file location
            const baseUrl = new URL(articleUrl, window.location.href);
            for (const img of article.querySelectorAll('img[src]')) {
                img.src = new URL(img.getAttribute('src'), baseUrl).href;
            }
            articleHtml = article.outerHTML;
            articleCache.set(articleUrl, articleHtml);
        }
        body.innerHTML = articleHtml;
    } catch {
        // Fallback when fetch is blocked (e.g. file:// origin)
        dialog.close();
        window.location.href = articleUrl;
    }
}

function initModal() {
    const dialog = document.getElementById('project-modal');
    if (!dialog) return;

    dialog.querySelector('.project-modal-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) dialog.close();
    });
}

function parseSkillsCsv(csv) {
    const categories = new Map();
    const lines = csv.replace(/^\uFEFF/, '').split(/\r?\n/);
    const delimiter = lines.find(l => l.trim())?.includes(';') ? ';' : ',';

    for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line) continue;

        const [category = '', name = '', level = ''] = line.split(delimiter).map(part => part.trim());
        if (!categories.size && category.toLowerCase() === 'category' && name.toLowerCase() === 'skill') continue;
        if (!category || !name) continue;

        if (!categories.has(category)) categories.set(category, []);
        categories.get(category).push({ name, level });
    }

    return [...categories.entries()].map(([category, items]) => ({ category, items }));
}

function buildSkillsNodes(csvText) {
    return parseSkillsCsv(csvText).map(category =>
        el('div', { class: 'skill-category' }, [
            el('div', { class: 'skill-category-header' }, [
                el('h3', { text: category.category }),
                el('span', { class: 'skill-count', text: `${category.items.length}` })
            ]),
            el('ul', { class: 'skill-list' }, category.items.map(item => {
                const lvl = (item.level || '').toLowerCase();
                return el('li', { class: 'skill-item' }, [
                    el('span', { class: 'skill-name', text: item.name }),
                    item.level && el('div', { class: 'skill-meta' }, [
                        el('span', { class: `skill-level-badge ${lvl}`, text: item.level })
                    ])
                ]);
            }))
        ])
    );
}

async function renderSkills() {
    const grid = document.querySelector('.skills-grid');
    if (!grid) return;

    const fallbackCsv = document.getElementById('skills-fallback')?.textContent || '';
    if (fallbackCsv.trim()) {
        grid.replaceChildren(...buildSkillsNodes(fallbackCsv));
    }

    try {
        const res = await fetch('assets/data/skills.csv');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const liveCsv = await res.text();
        if (liveCsv.trim() && liveCsv.trim() !== fallbackCsv.trim()) {
            grid.replaceChildren(...buildSkillsNodes(liveCsv));
        }
    } catch {
        // file:// blocks fetch() via CORS; initial inline fallback already rendered
    }
}

// ===== Navigation =====

function initNav() {
    const navbar = document.getElementById('navbar');
    const toggle = navbar.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-links');
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sections = [...document.querySelectorAll('main section[id]:not([hidden])')];
    const navLinks = [...menu.querySelectorAll('a')];

    const indicator = document.createElement('span');
    indicator.className = 'nav-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    menu.prepend(indicator);
    menu.classList.add('has-indicator');

    let currentId = null;
    let lockedId = null;
    let lockTimer = 0;

    const moveIndicator = (link, instant = false) => {
        if (!link) return;
        if (instant) indicator.style.transition = 'none';
        const linkRect = link.getBoundingClientRect();
        const menuRect = menu.getBoundingClientRect();
        const left = linkRect.left - menuRect.left - menu.clientLeft;
        const top = linkRect.top - menuRect.top - menu.clientTop;
        indicator.style.width = `${linkRect.width}px`;
        indicator.style.height = `${linkRect.height}px`;
        indicator.style.transform = `translate3d(${left}px, ${top}px, 0)`;
        if (instant) {
            indicator.getBoundingClientRect();
            requestAnimationFrame(() => {
                indicator.style.transition = '';
            });
        }
    };

    const setActive = (id, instant = false) => {
        if (!id || id === currentId) return;
        currentId = id;
        let activeLink = null;
        for (const link of navLinks) {
            const active = link.getAttribute('href') === `#${id}`;
            link.classList.toggle('active', active);
            if (active) {
                link.setAttribute('aria-current', 'true');
                activeLink = link;
            } else {
                link.removeAttribute('aria-current');
            }
        }
        moveIndicator(activeLink, instant);
    };

    const releaseLock = (sync = false) => {
        if (!lockedId) return;
        lockedId = null;
        clearTimeout(lockTimer);
        if (sync) onScroll();
    };

    const setOpen = (open) => {
        menu.classList.toggle('open', open);
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        if (open) moveIndicator(menu.querySelector('a.active'), true);
    };

    toggle.addEventListener('click', () => setOpen(!menu.classList.contains('open')));
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a[href^="#"]');
        if (!link) return;
        if (menu.contains(link)) setOpen(false);
        const href = link.getAttribute('href');
        const targetId = href.slice(1);
        const targetSection = sections.find(s => s.id === targetId);
        if (!targetSection) return;

        e.preventDefault();
        lockedId = targetId;
        clearTimeout(lockTimer);
        lockTimer = setTimeout(() => releaseLock(false), 400);
        setActive(targetId);
        targetSection.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth', block: 'start' });
        history.replaceState(null, '', href);
    });
    menu.addEventListener('keydown', (e) => {
        const idx = navLinks.indexOf(document.activeElement);
        if (idx === -1) return;
        let nextIdx = -1;
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') nextIdx = (idx + 1) % navLinks.length;
        else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') nextIdx = (idx - 1 + navLinks.length) % navLinks.length;
        else if (e.key === 'Home') nextIdx = 0;
        else if (e.key === 'End') nextIdx = navLinks.length - 1;
        if (nextIdx !== -1) {
            e.preventDefault();
            navLinks[nextIdx].focus();
        }
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('open')) {
            setOpen(false);
            toggle.focus();
        }
    });

    function onScroll() {
        navbar.classList.toggle('scrolled', window.scrollY > 10);
        if (lockedId) return;

        const offset = Math.max(navbar.offsetHeight + 24, window.innerHeight * 0.35);
        let current = sections[0]?.id;
        for (const section of sections) {
            if (section.getBoundingClientRect().top <= offset) current = section.id;
        }
        // At the bottom of the page, highlight the last section
        if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10) {
            current = sections[sections.length - 1]?.id;
        }
        setActive(current, currentId === null);
    }

    let ticking = false;
    const scheduleScroll = () => {
        if (lockedId) {
            clearTimeout(lockTimer);
            lockTimer = setTimeout(() => releaseLock(true), 140);
        }
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
            ticking = false;
            onScroll();
        });
    };

    window.addEventListener('scroll', scheduleScroll, { passive: true });
    window.addEventListener('scrollend', () => releaseLock(true), { passive: true });
    window.addEventListener('wheel', () => releaseLock(false), { passive: true });
    window.addEventListener('touchstart', () => releaseLock(false), { passive: true });
    const syncIndicator = () => requestAnimationFrame(() => moveIndicator(menu.querySelector('a.active'), true));
    window.addEventListener('resize', syncIndicator, { passive: true });
    window.matchMedia('(max-width: 768px)').addEventListener?.('change', syncIndicator);
    if ('ResizeObserver' in window) {
        const ro = new ResizeObserver(syncIndicator);
        ro.observe(menu);
        if (navLinks[0]) ro.observe(navLinks[0]);
    }
    document.fonts?.ready.then(() => moveIndicator(menu.querySelector('a.active'), true));

    onScroll();
}

// ===== Topographic / Isobar Contour Canvas =====

function initTopoCanvas() {
    const canvas = document.getElementById('topo-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let targetX = 0.68;
    let targetY = 0.42;
    let curX = targetX;
    let curY = targetY;
    let rafId = 0;

    // Smooth topographic / barometric scalar field in normalized [0..1] coords
    const sampleField = (nx, ny, px, py) => {
        const dx1 = nx - 0.78;
        const dy1 = (ny - 0.34) * 1.15;
        const peak1 = 1.45 * Math.exp(-(dx1 * dx1 + dy1 * dy1) / 0.048);

        const dx2 = nx - 0.18;
        const dy2 = (ny - 0.74) * 1.1;
        const peak2 = 1.25 * Math.exp(-(dx2 * dx2 + dy2 * dy2) / 0.055);

        const dx3 = nx - 0.48;
        const dy3 = (ny - 0.22) * 1.2;
        const basin1 = -1.05 * Math.exp(-(dx3 * dx3 + dy3 * dy3) / 0.045);

        const dx4 = nx - 0.56;
        const dy4 = (ny - 0.78) * 1.1;
        const peak3 = 1.1 * Math.exp(-(dx4 * dx4 + dy4 * dy4) / 0.05);

        const dxp = nx - px;
        const dyp = (ny - py) * 1.1;
        const pointerRidge = 0.52 * Math.exp(-(dxp * dxp + dyp * dyp) / 0.06);

        const wave =
            0.42 * Math.sin(nx * 7.2 + ny * 4.4) +
            0.3 * Math.cos(nx * 5.1 - ny * 7.4 + 0.9) +
            0.18 * Math.sin((nx - ny) * 11.0);

        return peak1 + peak2 + basin1 + peak3 + pointerRidge + wave;
    };

    const draw = () => {
        if (!width || !height) return;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, height);

        const step = width < 640 ? 16 : 18;
        const cols = Math.ceil(width / step) + 1;
        const rows = Math.ceil(height / step) + 1;
        const grid = new Float32Array(cols * rows);

        for (let r = 0; r < rows; r++) {
            const ny = (r * step) / height;
            const rowOffset = r * cols;
            for (let c = 0; c < cols; c++) {
                const nx = (c * step) / width;
                grid[rowOffset + c] = sampleField(nx, ny, curX, curY);
            }
        }

        const levels = 14;
        const minVal = -1.1;
        const maxVal = 2.0;

        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        for (let l = 0; l < levels; l++) {
            const iso = minVal + ((maxVal - minVal) * l) / (levels - 1);
            const isIndex = l % 4 === 2;
            ctx.beginPath();
            ctx.strokeStyle = isIndex
                ? 'rgba(94, 176, 236, 0.13)'
                : 'rgba(255, 255, 255, 0.055)';
            ctx.lineWidth = isIndex ? 1.15 : 0.85;

            for (let r = 0; r < rows - 1; r++) {
                const y = r * step;
                const row0 = r * cols;
                const row1 = (r + 1) * cols;

                for (let c = 0; c < cols - 1; c++) {
                    const x = c * step;
                    const v0 = grid[row0 + c];
                    const v1 = grid[row0 + c + 1];
                    const v2 = grid[row1 + c + 1];
                    const v3 = grid[row1 + c];

                    let mask = 0;
                    if (v0 >= iso) mask |= 1;
                    if (v1 >= iso) mask |= 2;
                    if (v2 >= iso) mask |= 4;
                    if (v3 >= iso) mask |= 8;
                    if (mask === 0 || mask === 15) continue;

                    const topX = x + step * ((iso - v0) / (v1 - v0 || 1e-6));
                    const topY = y;
                    const rightX = x + step;
                    const rightY = y + step * ((iso - v1) / (v2 - v1 || 1e-6));
                    const bottomX = x + step * ((iso - v3) / (v2 - v3 || 1e-6));
                    const bottomY = y + step;
                    const leftX = x;
                    const leftY = y + step * ((iso - v0) / (v3 - v0 || 1e-6));

                    switch (mask) {
                        case 1:
                        case 14:
                            ctx.moveTo(leftX, leftY);
                            ctx.lineTo(topX, topY);
                            break;
                        case 2:
                        case 13:
                            ctx.moveTo(topX, topY);
                            ctx.lineTo(rightX, rightY);
                            break;
                        case 3:
                        case 12:
                            ctx.moveTo(leftX, leftY);
                            ctx.lineTo(rightX, rightY);
                            break;
                        case 4:
                        case 11:
                            ctx.moveTo(rightX, rightY);
                            ctx.lineTo(bottomX, bottomY);
                            break;
                        case 5:
                            ctx.moveTo(leftX, leftY);
                            ctx.lineTo(bottomX, bottomY);
                            ctx.moveTo(topX, topY);
                            ctx.lineTo(rightX, rightY);
                            break;
                        case 6:
                        case 9:
                            ctx.moveTo(topX, topY);
                            ctx.lineTo(bottomX, bottomY);
                            break;
                        case 7:
                        case 8:
                            ctx.moveTo(leftX, leftY);
                            ctx.lineTo(bottomX, bottomY);
                            break;
                        case 10:
                            ctx.moveTo(leftX, leftY);
                            ctx.lineTo(topX, topY);
                            ctx.moveTo(rightX, rightY);
                            ctx.lineTo(bottomX, bottomY);
                            break;
                    }
                }
            }
            ctx.stroke();
        }
    };

    const tick = () => {
        rafId = 0;
        curX += (targetX - curX) * 0.08;
        curY += (targetY - curY) * 0.08;
        draw();
        if (Math.abs(targetX - curX) > 0.001 || Math.abs(targetY - curY) > 0.001) {
            rafId = requestAnimationFrame(tick);
        }
    };

    let heroRect = { left: 0, top: 0, width: 1, height: 1 };
    let heroVisible = true;

    const resize = () => {
        const rect = canvas.parentElement.getBoundingClientRect();
        heroRect = rect;
        width = Math.max(1, Math.round(rect.width));
        height = Math.max(1, Math.round(rect.height));
        dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);
        draw();
    };

    const hero = canvas.parentElement;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    reducedMotion.addEventListener?.('change', () => {
        if (reducedMotion.matches && rafId) {
            cancelAnimationFrame(rafId);
            rafId = 0;
        }
    });

    if ('IntersectionObserver' in window) {
        new IntersectionObserver((entries) => {
            heroVisible = entries[0]?.isIntersecting ?? true;
            if (!heroVisible && rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }
        }).observe(hero);
    }

    hero.addEventListener('pointermove', (e) => {
        if (reducedMotion.matches || !heroVisible) return;
        targetX = (e.clientX - heroRect.left) / (heroRect.width || 1);
        targetY = (e.clientY - heroRect.top) / (heroRect.height || 1);
        if (!rafId) rafId = requestAnimationFrame(tick);
    }, { passive: true });

    window.addEventListener('resize', resize, { passive: true });
    resize();
}

// ===== Initialize =====
// Each renderer runs independently so one failure can't blank the rest of the page.
for (const render of [renderHero, renderAbout, renderProjects, renderSkills, initNav, initModal, initTopoCanvas]) {
    try {
        Promise.resolve(render()).catch(err => console.error(`${render.name} failed:`, err));
    } catch (err) {
        console.error(`${render.name} failed:`, err);
    }
}
