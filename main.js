const data = JSON.parse(document.querySelector('#portfolio-data').textContent);
const $ = (selector, scope = document) => scope.querySelector(selector);
const escapeHTML = value => String(value ?? '').replace(/[&<>'"]/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[char]));

function renderHero(){
  $('.hero-title').textContent=data.personal.title;
  $('.hero-description').textContent=data.personal.description;
  $('.contact-link').href=`mailto:${data.personal.email}`;
}
function renderAbout(){
  const interests=data.about.interests.map(item=>`<span class="chip">${escapeHTML(item)}</span>`).join('');
  $('.about-content').innerHTML=`<p>${escapeHTML(data.about.bio)}</p><div class="interest-list">${interests}</div>`;
}
function renderProjects(){
  $('.projects-grid').innerHTML=data.projects.map(project=>`<article class="project-card reveal"><div class="project-top"><span class="project-category">${escapeHTML(project.category)}</span><span class="project-number">${escapeHTML(project.number)}</span></div><h3>${escapeHTML(project.title)}</h3><p>${escapeHTML(project.description)}</p><div class="project-tags">${project.technologies.map(tech=>`<span class="tag">${escapeHTML(tech)}</span>`).join('')}</div></article>`).join('');
}
function renderExperience(){
  const experience=data.experience.map(item=>`<article class="timeline-item"><div class="timeline-date">${escapeHTML(item.start_date)} — ${escapeHTML(item.end_date)}</div><div><h3>${escapeHTML(item.title)}</h3><div class="timeline-meta">${escapeHTML(item.company)} · ${escapeHTML(item.location)}</div><p>${escapeHTML(item.description)}</p></div></article>`).join('');
  const education=data.about.education.map(item=>`<article class="timeline-item"><div class="timeline-date">${escapeHTML(item.year)}</div><div><h3>${escapeHTML(item.degree)} · ${escapeHTML(item.specialisation)}</h3><div class="timeline-meta">${escapeHTML(item.institution)}</div><p>Academic foundation in mathematics, physics, modelling and engineering design.</p></div></article>`).join('');
  $('.timeline').innerHTML=experience+education;
}
function renderSkills(){
  $('.skills-grid').innerHTML=data.skills.map(group=>`<article class="skill-category reveal"><h3>${escapeHTML(group.category)}</h3><ul class="skill-list">${group.items.map(item=>`<li><span>${escapeHTML(item.name)}</span><span class="skill-level">${escapeHTML(item.level)}</span></li>`).join('')}</ul></article>`).join('');
}
function setupNavigation(){
  const header=$('.site-header'),toggle=$('.nav-toggle'),menu=$('.nav-links');
  const closeMenu=()=>{menu.classList.remove('open');toggle.setAttribute('aria-expanded','false');toggle.setAttribute('aria-label','Open navigation')};
  toggle.addEventListener('click',()=>{const open=menu.classList.toggle('open');toggle.setAttribute('aria-expanded',String(open));toggle.setAttribute('aria-label',open?'Close navigation':'Open navigation')});
  menu.addEventListener('click',event=>{if(event.target.matches('a'))closeMenu()});
  const sections=[...document.querySelectorAll('main section[id]')];
  const update=()=>{header.classList.toggle('scrolled',scrollY>12);let current='home';sections.forEach(section=>{if(section.getBoundingClientRect().top<=140)current=section.id});document.querySelectorAll('.nav-links a').forEach(link=>link.classList.toggle('active',link.getAttribute('href')===`#${current}`))};
  addEventListener('scroll',update,{passive:true});update();
}
function setupReveal(){
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target)}}),{threshold:.12});
  document.querySelectorAll('.reveal').forEach(element=>observer.observe(element));
}
function init(){renderHero();renderAbout();renderProjects();renderExperience();renderSkills();setupNavigation();setupReveal()}
document.addEventListener('DOMContentLoaded',init);
