const state = {
  skillTags: [],
  interestTags: [],
  allSkills: [],
  allDomains: [],
  allProjects: [],
  selectedDomains: []
};

async function init() {
  await Promise.all([loadSkills(), loadDomains(), loadBrowse()]);
}

async function loadSkills() {
  try {
    const res = await fetch('/api/skills');
    const data = await res.json();
    state.allSkills = data.skills || [];
  } catch {
    state.allSkills = ['python','javascript','react','flask','pandas','tensorflow',
      'nodejs','css','html','opencv','java','arduino','docker','flutter'];
  }
}

async function loadDomains() {
  try {
    const res = await fetch('/api/domains');
    const data = await res.json();
    state.allDomains = data.domains || [];
  } catch {
    state.allDomains = ['AI/ML','Web Development','Data Science','IoT','Mobile',
      'Blockchain','DevOps','Cybersecurity','Game Development','Robotics'];
  }
  renderDomainChips();
}

async function loadBrowse() {
  try {
    const res = await fetch('/api/projects');
    const data = await res.json();
    state.allProjects = data.projects || [];
    renderBrowse(state.allProjects);
    document.getElementById('browse-count').textContent = `${state.allProjects.length} projects`;

    const sel = document.getElementById('filter-domain');
    const domains = [...new Set(state.allProjects.map(p => p.domain))].sort();
    domains.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d; opt.textContent = d;
      sel.appendChild(opt);
    });
  } catch (e) {
    console.warn('Server not running — browse unavailable');
  }
}

function renderDomainChips() {
  const wrap = document.getElementById('domain-chips');
  wrap.innerHTML = '';
  state.allDomains.forEach(domain => {
    const chip = document.createElement('div');
    chip.className = 'chip';
    chip.textContent = domain;
    chip.dataset.domain = domain;
    chip.addEventListener('click', () => toggleDomain(domain, chip));
    wrap.appendChild(chip);
  });
}

function toggleDomain(domain, el) {
  if (state.selectedDomains.includes(domain)) {
    state.selectedDomains = state.selectedDomains.filter(d => d !== domain);
    el.classList.remove('active');
  } else {
    state.selectedDomains.push(domain);
    el.classList.add('active');
  }
}

function setupTagInput(inputId, wrapId, tagsArr, suggestListId) {
  const input = document.getElementById(inputId);
  const suggestList = suggestListId ? document.getElementById(suggestListId) : null;

  input.addEventListener('input', () => {
    if (suggestList) showSuggestions(input.value, suggestList, tagsArr, (val) => {
      addTag(val, wrapId, inputId, tagsArr);
      suggestList.classList.remove('open');
    });
  });

  input.addEventListener('keydown', (e) => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      addTag(input.value.replace(',', '').trim(), wrapId, inputId, tagsArr);
      if (suggestList) suggestList.classList.remove('open');
    }
    if (e.key === 'Backspace' && !input.value && tagsArr.length) {
      tagsArr.pop();
      renderTags(wrapId, inputId, tagsArr);
    }
  });

  input.addEventListener('blur', () => {
    setTimeout(() => { if (suggestList) suggestList.classList.remove('open'); }, 180);
  });
}

function showSuggestions(val, list, tagsArr, onSelect) {
  if (!val.trim()) { list.classList.remove('open'); return; }
  const matches = state.allSkills
    .filter(s => s.includes(val.toLowerCase()) && !tagsArr.includes(s))
    .slice(0, 7);
  if (!matches.length) { list.classList.remove('open'); return; }
  list.innerHTML = '';
  matches.forEach(m => {
    const div = document.createElement('div');
    div.textContent = m;
    div.addEventListener('mousedown', (e) => { e.preventDefault(); onSelect(m); });
    list.appendChild(div);
  });
  list.classList.add('open');
}

function addTag(val, wrapId, inputId, tagsArr) {
  val = val.toLowerCase().trim();
  if (!val || tagsArr.includes(val)) return;
  tagsArr.push(val);
  renderTags(wrapId, inputId, tagsArr);
  document.getElementById(inputId).value = '';
}

function removeTag(val, wrapId, inputId, tagsArr) {
  const idx = tagsArr.indexOf(val);
  if (idx > -1) tagsArr.splice(idx, 1);
  renderTags(wrapId, inputId, tagsArr);
}

function renderTags(wrapId, inputId, tagsArr) {
  const wrap = document.getElementById(wrapId);
  const input = document.getElementById(inputId);
  wrap.innerHTML = '';
  tagsArr.forEach(t => {
    const tag = document.createElement('span');
    tag.className = 'tag';
    tag.innerHTML = `${t} <span class="tag-remove" data-val="${t}">×</span>`;
    tag.querySelector('.tag-remove').addEventListener('click', () => {
      removeTag(t, wrapId, inputId, tagsArr);
    });
    wrap.appendChild(tag);
  });
  wrap.appendChild(input);
}

async function getRecommendations() {
  const skills = [...state.skillTags];
  const rawSkill = document.getElementById('skills-input').value.trim();
  if (rawSkill) skills.push(rawSkill);

  const interests = [...state.interestTags, ...state.selectedDomains];
  const rawInterest = document.getElementById('interests-input').value.trim();
  if (rawInterest) interests.push(rawInterest);

  if (!skills.length && !interests.length) {
    showToast('Please add at least one skill or interest');
    return;
  }

  const difficulty = document.getElementById('difficulty-select').value;

  document.getElementById('loading').classList.add('show');
  document.getElementById('results-section').style.display = 'none';
  document.getElementById('empty-state').classList.remove('show');

  try {
    const res = await fetch('/api/recommend', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ skills, interests, difficulty })
    });
    const data = await res.json();
    document.getElementById('loading').classList.remove('show');

    if (data.recommendations && data.recommendations.length) {
      renderResults(data.recommendations);
    } else {
      document.getElementById('empty-state').classList.add('show');
    }
  } catch {
    document.getElementById('loading').classList.remove('show');
    renderResults(getDemoResults());
  }
}

function getDemoResults() {
  return [
    { id:1, title:'Smart Attendance System', description:'Face recognition attendance using OpenCV and deep learning', skills:['python','opencv','deep-learning'], domain:'AI/ML', difficulty:'Intermediate', tags:['automation','cv'], similarity: 85 },
    { id:7, title:'Sentiment Analysis Tool', description:'Analyze sentiment of tweets and reviews using NLP', skills:['python','nltk','scikit-learn'], domain:'Data Science', difficulty:'Intermediate', tags:['nlp','text-analysis'], similarity: 72 },
    { id:14, title:'Music Recommendation Engine', description:'Recommend songs based on listening history', skills:['python','pandas','scikit-learn'], domain:'AI/ML', difficulty:'Intermediate', tags:['recommendation','music'], similarity: 60 },
  ];
}

function renderResults(items) {
  const grid = document.getElementById('results-grid');
  document.getElementById('results-count').textContent = `${items.length} matches`;
  grid.innerHTML = '';
  items.forEach(p => grid.appendChild(buildCard(p, true)));
  document.getElementById('results-section').style.display = 'block';
}

function renderBrowse(projects) {
  const grid = document.getElementById('browse-grid');
  grid.innerHTML = '';
  projects.forEach(p => grid.appendChild(buildCard(p, false)));
  document.getElementById('browse-count').textContent = `${projects.length} projects`;
}

function filterBrowse() {
  const domain = document.getElementById('filter-domain').value;
  const diff = document.getElementById('filter-diff').value;
  let filtered = state.allProjects;
  if (domain) filtered = filtered.filter(p => p.domain === domain);
  if (diff) filtered = filtered.filter(p => p.difficulty === diff);
  renderBrowse(filtered);
}

function buildCard(p, showScore) {
  const card = document.createElement('div');
  card.className = 'project-card card-stagger';
  const score = p.similarity || 0;
  card.innerHTML = `
    <div class="card-top">
      <span class="domain-badge">${p.domain}</span>
      ${showScore ? `<span class="match-score">⚡ ${score}%</span>` : ''}
    </div>
    <div class="card-title">${p.title}</div>
    <div class="card-desc">${p.description}</div>
    ${showScore ? `<div class="score-bar-wrap"><div class="score-bar"><div class="score-fill" style="width:${score}%"></div></div></div>` : ''}
    <div class="card-skills">
      ${(p.skills || []).slice(0, 4).map(s => `<span class="skill-pill">${s}</span>`).join('')}
    </div>
    <div class="card-footer">
      <div class="difficulty-row">
        <div class="diff-indicator ${p.difficulty}"></div>
        ${p.difficulty}
      </div>
      <div class="card-cta">View Details →</div>
    </div>
  `;
  card.addEventListener('click', () => openModal(p));
  return card;
}

function openModal(p) {
  document.getElementById('modal-domain').textContent = p.domain;
  document.getElementById('modal-title').textContent = p.title;
  document.getElementById('modal-desc').textContent = p.description;
  document.getElementById('modal-skills').innerHTML =
    (p.skills || []).map(s => `<span class="skill-pill">${s}</span>`).join('');
  document.getElementById('modal-tags').innerHTML =
    (p.tags || []).map(t => `<span class="skill-pill">${t}</span>`).join('');
  document.getElementById('modal-difficulty').innerHTML =
    `<div class="diff-indicator ${p.difficulty}" style="display:inline-block;margin-right:6px"></div>${p.difficulty}`;
  document.getElementById('modal-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeModal(e) {
  if (e.target === document.getElementById('modal-overlay')) closeModalDirect();
}

function closeModalDirect() {
  document.getElementById('modal-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

function showPage(name, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`page-${name}`).classList.add('active');
  btn.classList.add('active');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 3000);
}

document.addEventListener('DOMContentLoaded', () => {
  setupTagInput('skills-input', 'skills-wrap', state.skillTags, 'skills-suggestions');
  setupTagInput('interests-input', 'interests-wrap', state.interestTags, null);
  init();
});
