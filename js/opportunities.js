import { fetchJobs } from './adzuna.js';
import { Auth, showToast } from './auth.js';

'use strict';
const SAVED_KEY = 'getemployed_saved_v2';
function loadSavedJobs() {
  try { return JSON.parse(localStorage.getItem(SAVED_KEY) || '[]'); }
  catch { return []; }
}
const state = {
  query:        '',
  trendingJobs: [],
  browseJobs:   [],
  loading:      false,
  error:        null,
  category:     'all',
  salary:       0,
  sort:         'relevance',
  page:         1,
  totalPages:   1,
  savedJobs:    loadSavedJobs(),
};
const searchInput      = document.getElementById('search-input');
const filterSalary     = document.getElementById('filter-salary');
const filterSort       = document.getElementById('filter-sort');
const cardsGrid        = document.getElementById('cards-grid');
const pagWrap          = document.getElementById('pagination-wrap');
const pagButtons       = document.getElementById('pagination-buttons');
const topPicksList     = document.getElementById('top-picks-list');
const savedSectionGrid = document.getElementById('saved-section-grid');
const jobPanel         = document.getElementById('job-panel');
const jpBackdrop       = document.getElementById('jp-backdrop');
const jpClose          = document.getElementById('jp-close');
const jpBody           = document.getElementById('jp-body');
const resultsCount     = document.getElementById('results-count');
const FALLBACK_JOBS = [
  { id:'fb1',  title:'Graduate Software Engineer', company:{display_name:'Accenture'},       location:{display_name:'London, UK'},         category:{label:'IT Jobs'},          salary_min:38000, salary_max:45000, description:'Build and maintain scalable software solutions as part of our award-winning graduate programme. You will work with senior engineers across cloud, AI, and enterprise platforms.',    redirect_url:'https://www.adzuna.co.uk/jobs/search?q=graduate+engineer', created:'2026-04-01T00:00:00Z' },
  { id:'fb2',  title:'Junior Data Analyst',        company:{display_name:'HSBC'},            location:{display_name:'Manchester, UK'},      category:{label:'Finance & Accounting'}, salary_min:32000, salary_max:40000, description:'Analyse large datasets using SQL, Python and Tableau to support business decisions. Great opportunity for a data-driven recent graduate to grow in a global bank.',        redirect_url:'https://www.adzuna.co.uk/jobs/search?q=data+analyst', created:'2026-04-02T00:00:00Z' },
  { id:'fb3',  title:'UX Designer Graduate',       company:{display_name:'BBC Studios'},     location:{display_name:'Remote / Hybrid'},     category:{label:'Creative & Design'},    salary_min:30000, salary_max:36000, description:'Design user-centred digital experiences for flagship BBC products. You will run user research, create wireframes, and prototype interactive designs.',                       redirect_url:'https://www.adzuna.co.uk/jobs/search?q=ux+designer', created:'2026-04-01T00:00:00Z' },
  { id:'fb4',  title:'Marketing Executive',        company:{display_name:'Unilever'},        location:{display_name:'London, UK'},         category:{label:'Marketing & PR'},       salary_min:28000, salary_max:34000, description:'Support brand campaigns across social, digital, and OOH channels. You will be part of one of the world\'s leading consumer goods companies.',                        redirect_url:'https://www.adzuna.co.uk/jobs/search?q=marketing', created:'2026-03-30T00:00:00Z' },
  { id:'fb5',  title:'Trainee Chartered Accountant',company:{display_name:'Deloitte'},       location:{display_name:'Birmingham, UK'},     category:{label:'Finance & Accounting'}, salary_min:35000, salary_max:42000, description:'Join Deloitte\'s graduate ACA training programme. Work with some of the UK\'s largest organisations across audit, tax, and consulting.',                              redirect_url:'https://www.adzuna.co.uk/jobs/search?q=accountant', created:'2026-04-03T00:00:00Z' },
  { id:'fb6',  title:'Cloud Engineer (Graduate)',  company:{display_name:'Amazon Web Services'},location:{display_name:'Edinburgh, UK'},   category:{label:'IT Jobs'},              salary_min:42000, salary_max:52000, description:'Design, deploy, and manage cloud infrastructure on AWS. Join a world-class engineering team and work towards your AWS Solutions Architect certification.',              redirect_url:'https://www.adzuna.co.uk/jobs/search?q=cloud+engineer', created:'2026-04-04T00:00:00Z' },
  { id:'fb7',  title:'Content Strategist',         company:{display_name:'The Guardian'},    location:{display_name:'Remote'},             category:{label:'Marketing & PR'},       salary_min:27000, salary_max:32000, description:'Create and manage content strategies across digital and print platforms. You will research, write, and optimise editorial content for millions of readers.',              redirect_url:'https://www.adzuna.co.uk/jobs/search?q=content+strategist', created:'2026-03-28T00:00:00Z' },
  { id:'fb8',  title:'Biomedical Science Graduate',company:{display_name:'AstraZeneca'},     location:{display_name:'Cambridge, UK'},      category:{label:'Healthcare & Nursing'}, salary_min:33000, salary_max:40000, description:'Carry out laboratory research on next-generation therapeutics. AstraZeneca\'s graduate programme offers rotations across R&D, clinical, and manufacturing teams.',    redirect_url:'https://www.adzuna.co.uk/jobs/search?q=science', created:'2026-04-05T00:00:00Z' },
  { id:'fb9',  title:'Product Manager Associate',  company:{display_name:'Google DeepMind'},location:{display_name:'London, UK'},         category:{label:'IT Jobs'},              salary_min:55000, salary_max:70000, description:'Work alongside world-leading AI researchers to define product roadmaps for transformative AI tools. An exceptional opportunity for technically-minded graduates.',   redirect_url:'https://www.adzuna.co.uk/jobs/search?q=product+manager', created:'2026-04-06T00:00:00Z' },
  { id:'fb10', title:'Recruitment Consultant',     company:{display_name:'Hays Plc'},        location:{display_name:'Leeds, UK'},          category:{label:'HR & Recruitment'},     salary_min:25000, salary_max:30000, description:'Source and place candidates in top roles across the UK. Develop your network, hit targets, and earn uncapped commission from day one.',                              redirect_url:'https://www.adzuna.co.uk/jobs/search?q=recruitment', created:'2026-03-25T00:00:00Z' },
  { id:'fb11', title:'Supply Chain Analyst',       company:{display_name:'Rolls-Royce'},    location:{display_name:'Derby, UK'},          category:{label:'Engineering Jobs'},     salary_min:32000, salary_max:40000, description:'Optimise the global supply chain for one of Britain\'s most iconic engineering companies. Use data analytics to drive efficiency across procurement and logistics.',   redirect_url:'https://www.adzuna.co.uk/jobs/search?q=supply+chain', created:'2026-03-29T00:00:00Z' },
  { id:'fb12', title:'Cyber Security Analyst',     company:{display_name:'GCHQ'},           location:{display_name:'Cheltenham, UK'},     category:{label:'IT Jobs'},              salary_min:36000, salary_max:48000, description:'Protect the UK\'s critical national infrastructure from cyber threats. Work on classified and open-source intelligence to detect, analyse, and respond to incidents.',  redirect_url:'https://www.adzuna.co.uk/jobs/search?q=cyber+security', created:'2026-04-01T00:00:00Z' },
  { id:'fb13', title:'Social Media Manager',       company:{display_name:'Spotify'},        location:{display_name:'London, UK'},         category:{label:'Marketing & PR'},       salary_min:30000, salary_max:38000, description:'Shape Spotify\'s social voice across UK and European markets. You will create viral content, manage influencer partnerships, and grow community engagement.',          redirect_url:'https://www.adzuna.co.uk/jobs/search?q=social+media', created:'2026-04-02T00:00:00Z' },
  { id:'fb14', title:'Investment Banking Analyst', company:{display_name:'Goldman Sachs'},  location:{display_name:'London, UK'},         category:{label:'Finance & Accounting'}, salary_min:65000, salary_max:85000, description:'Support M&A and capital markets transactions at one of the world\'s leading investment banks. Intensive two-year analyst programme with excellent exit opportunities.',  redirect_url:'https://www.adzuna.co.uk/jobs/search?q=investment+banking', created:'2026-04-07T00:00:00Z' },
  { id:'fb15', title:'HR Graduate Trainee',        company:{display_name:'PwC'},            location:{display_name:'Bristol, UK'},        category:{label:'HR & Recruitment'},     salary_min:29000, salary_max:35000, description:'Develop your HR career at PwC, one of the Big Four professional services firms. Rotations across talent acquisition, L&D, employee relations, and HR operations.',   redirect_url:'https://www.adzuna.co.uk/jobs/search?q=hr+graduate', created:'2026-03-31T00:00:00Z' },
];
function escapeHtml(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
function isSaved(id) {
  return Auth.isSaved(id);
}

function normalizeCategory(label) {
  const l = (label || '').toLowerCase();
  if (['it','tech','software','engineer','data','developer','cloud','cyber'].some(k => l.includes(k))) return 'tech';
  if (['market','sales','growth','brand','content','social'].some(k => l.includes(k))) return 'marketing';
  if (['financ','bank','account','invest','audit'].some(k => l.includes(k))) return 'finance';
  if (['health','care','pharma','science','bio','nurse','medic'].some(k => l.includes(k))) return 'healthcare';
  return 'other';
}
function computeScore(job) {
  let score = 50;
  if (job.salaryMin > 0)             score += 15;
  if (job.description.length > 300)  score += 20;
  if (job.company !== 'Organization') score += 15;
  return Math.min(score, 99);
}
function mapJob(raw, idx) {
  const categoryNorm = normalizeCategory(raw.category?.label || '');
  const job = {
    id:          String(raw.id || idx),
    role:        raw.title                  || 'Untitled Role',
    company:     raw.company?.display_name  || 'Organization',
    location:    raw.location?.display_name || 'Remote / Global',
    category:    raw.category?.label        || 'General',
    categoryNorm,
    salaryMin:   raw.salary_min             || 0,
    salaryMax:   raw.salary_max             || 0,
    description: raw.description            || 'See full listing for role details.',
    redirectUrl: raw.redirect_url           || 'https://www.adzuna.co.uk',
    created:     raw.created                || new Date().toISOString(),
  };
  job.matchScore = computeScore(job);
  return job;
}
function formatSalary(job) {
  if (job.salaryMin > 0) {
    const fmt = n => n >= 1000 ? `£${Math.round(n / 1000)}k` : `£${n}`;
    return job.salaryMax > job.salaryMin
      ? `${fmt(job.salaryMin)}–${fmt(job.salaryMax)}`
      : fmt(job.salaryMin);
  }
  return null;
}
function toggleSave(job) {
  Auth.toggleSaved(job);
  refreshAllUI();
}

function jobHue(id) {
  const hues = [230, 260, 290, 320, 170, 200, 30, 0];
  const sum  = [...String(id)].reduce((s, c) => s + c.charCodeAt(0), 0);
  return hues[sum % hues.length];
}
function shortLocation(loc) {
  if (!loc) return 'Remote';
  if (loc.toLowerCase().includes('remote')) return 'Remote';
  if (loc.toLowerCase().includes('hybrid')) return 'Hybrid';
  return loc.split(',')[0].trim();
}
const filterByQuery = query => jobs => {
  if (!query) return jobs;
  const q = query.toLowerCase();
  return jobs.filter(job =>
    [job.role, job.company, job.location, job.category].some(field =>
      field.toLowerCase().includes(q)
    )
  );
};
const filterByCategory = category => jobs => {
  if (!category || category === 'all') return jobs;
  return jobs.filter(job => job.categoryNorm === category);
};
const filterBySalary = minSalary => jobs => {
  if (!minSalary || minSalary <= 0) return jobs;
  return jobs.filter(job => job.salaryMin >= minSalary || job.salaryMax >= minSalary);
};
const sortJobs = sortKey => jobs => {
  const copy = [...jobs];
  if (sortKey === 'salary-desc') return copy.sort((a, b) => (b.salaryMin || 0) - (a.salaryMin || 0));
  if (sortKey === 'date-desc')   return copy.sort((a, b) => new Date(b.created) - new Date(a.created));
  if (sortKey === 'az')          return copy.sort((a, b) => a.role.localeCompare(b.role));
  if (sortKey === 'match-desc')  return copy.sort((a, b) => b.matchScore - a.matchScore);
  return copy;
};
function pipeline(jobs, ...transforms) {
  return transforms.reduce((currentJobs, transform) => transform(currentJobs), jobs);
}
function getFilteredBrowseJobs() {
  if (state.category === 'foryou' && Auth.user) {
    return [...state.browseJobs].sort((a, b) => Auth.matchScore(b) - Auth.matchScore(a));
  }
  return pipeline(
    state.browseJobs,
    sortJobs(state.sort)
  );
}
function buildCard(job) {
  const saved   = isSaved(job.id);
  const salary  = formatSalary(job);
  const loc     = shortLocation(job.location);

  const card = document.createElement('article');
  card.className  = 'job-card';
  card.dataset.id = job.id;
  card.setAttribute('role', 'listitem');
  card.setAttribute('tabindex', '0');
  card.setAttribute('aria-label', `${job.role} at ${job.company}`);
  card.innerHTML = `
    <div class="card-inner-pad">
      <div class="card-header-top">
        <span class="card-role-display">${escapeHtml(job.role)}</span>
        <button class="az-save-btn${saved ? ' saved' : ''}"
                aria-label="${saved ? 'Remove from shortlist' : 'Add to shortlist'}"
                aria-pressed="${saved}">
          ${saved ? '✓' : '+'}
        </button>
      </div>
      <div class="card-meta-row">
        <span class="card-category-tag">${escapeHtml(job.category)}</span>
        <span class="card-company-text">${escapeHtml(job.company)}</span>
      </div>
      <div class="card-footer-row">
        <span class="card-loc-text">${escapeHtml(loc)}</span>
        ${salary ? `<span class="card-salary-text">${escapeHtml(salary)}</span>` : ''}
      </div>
      ${Auth.user ? (() => {
        const sc  = Auth.matchScore(job);
        const cls = sc >= 80 ? 'high' : sc >= 55 ? 'mid' : 'low';
        const applied = Auth.isApplied(job.id);
        return `<div class="card-badge-row">
          <span class="ge-match-badge ge-match--${cls}">${sc}% match</span>
          ${applied ? '<span class="ge-applied-badge">Applied ✓</span>' : ''}
        </div>`;
      })() : ''}
    </div>
  `;

  card.querySelector('.az-save-btn').addEventListener('click', e => {
    e.stopPropagation();
    toggleSave(job);
  });
  card.addEventListener('click', () => {
    document.querySelectorAll('.job-card.active').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    openPanel(job.id);
  });
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      openPanel(job.id);
    }
  });
  return card;
}
function renderSkeletons() {
  if (!cardsGrid) return;
  cardsGrid.innerHTML = Array(12).fill(`
    <div class="skeleton-card" aria-hidden="true">
      <div class="skeleton-line long"></div>
      <div class="skeleton-line medium"></div>
      <div class="skeleton-line short"></div>
      <div class="skeleton-line medium"></div>
    </div>
  `).join('');
}
function renderBrowseResults() {
  if (!cardsGrid) return;
  cardsGrid.innerHTML = '';
  if (state.loading) return;
  const jobs = getFilteredBrowseJobs();
  if (resultsCount) {
    resultsCount.textContent = jobs.length > 0
      ? `${jobs.length} role${jobs.length !== 1 ? 's' : ''} found`
      : '';
  }
  if (jobs.length === 0) {
    const isForYou = state.category === 'foryou';
    cardsGrid.innerHTML = `
      <div class="empty-state" style="grid-column: 1/-1; padding: 4rem 2rem; text-align: center; background: rgba(255,255,255,0.02); border-radius: 24px; border: 1px dashed rgba(255,255,255,0.1);">
        <div style="font-size: 3rem; margin-bottom: 1.5rem; opacity: 0.5;">${isForYou ? '🎯' : '🔍'}</div>
        <h3 style="font-family: var(--font-display); font-size: 2rem; margin-bottom: 1rem; color: #fff;">${isForYou ? 'Refine Your Search' : 'No Results Found'}</h3>
        <p style="margin-bottom: 2rem; color: var(--muted); max-width: 400px; margin-inline: auto;">${isForYou
          ? 'We couldn\'t find direct matches for your current interests. Try broadening your preferences for better results.'
          : 'We couldn\'t find any roles matching those specific filters. Try adjusting your search criteria.'
        }</p>
        ${isForYou
          ? `<button class="btn-primary" id="update-prefs-btn" style="font-size:0.85rem;">Update Preferences</button>`
          : `<button class="btn-secondary" id="clear-filters-btn">Clear Filters</button>`
        }
      </div>
    `;
    document.getElementById('clear-filters-btn')?.addEventListener('click', resetFilters);
    document.getElementById('update-prefs-btn')?.addEventListener('click', () => Auth.openPrefsModal());
    renderPagination(0);
    return;
  }
  const fragment = document.createDocumentFragment();
  jobs.forEach(job => fragment.appendChild(buildCard(job)));
  cardsGrid.appendChild(fragment);
  renderPagination(jobs.length);
}
function renderTrending() {
  if (!topPicksList) return;
  topPicksList.innerHTML = '';
  if (state.trendingJobs.length === 0) {
    topPicksList.innerHTML = `
      <li style="padding:2.5rem; color:var(--muted); text-align:center; list-style:none; font-size:0.9rem; min-width:280px;">
        Trending roles unavailable right now.
      </li>`;
    return;
  }
  const fragment = document.createDocumentFragment();
  state.trendingJobs.forEach((job, i) => {
    const li = document.createElement('li');
    li.className = 'top10-item';
    li.setAttribute('role', 'listitem');
    const num = document.createElement('span');
    num.className = 'top10-number';
    num.setAttribute('aria-hidden', 'true');
    num.textContent = String(i + 1);
    li.appendChild(num);
    li.appendChild(buildCard(job));
    fragment.appendChild(li);
  });
  topPicksList.appendChild(fragment);
}
function renderSavedSection() {
  if (!savedSectionGrid) return;
  savedSectionGrid.innerHTML = '';
  const saved = Auth.savedJobs;
  if (saved.length === 0) {
    if (Auth.user) {
      savedSectionGrid.innerHTML = `
        <div class="saved-empty" id="saved-empty">
          No roles shortlisted yet. Browse below and hit <strong>+</strong> to save roles here.
        </div>`;
    } else {
      savedSectionGrid.innerHTML = `
        <div class="saved-empty" id="saved-empty" style="display:flex;flex-direction:column;align-items:center;gap:1rem;">
          <p>Sign up free to save roles and get personalised matches.</p>
          <button class="btn-primary" id="saved-signup-cta" style="font-size:0.85rem;padding:0.55rem 1.4rem;">Create Free Account</button>
        </div>`;
      document.getElementById('saved-signup-cta')?.addEventListener('click', () => Auth.openModal('signup'));
    }
    return;
  }
  const fragment = document.createDocumentFragment();
  saved.forEach(job => fragment.appendChild(buildCard(job)));
  savedSectionGrid.appendChild(fragment);
}
function renderPagination(visibleCount) {
  if (!pagButtons) return;
  pagButtons.innerHTML = '';
  const max = state.totalPages;
  const cur = state.page;
  if (visibleCount === 0) {
    if (pagWrap) pagWrap.hidden = true;
    return;
  }
  if (pagWrap) pagWrap.hidden = false;
  const scrollToSection = () => {
    document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const addBtn = (p, label, isActive = false, isDisabled = false) => {
    const btn = document.createElement('button');
    btn.className   = `page-btn${isActive ? ' active' : ''}`;
    btn.textContent = label;
    btn.disabled    = isDisabled;
    btn.setAttribute('aria-label', isActive ? `Page ${p}, current` : `Page ${p}`);
    btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    if (!isDisabled && !isActive) {
      btn.addEventListener('click', () => {
        state.page = p;
        fetchBrowse(p).then(scrollToSection);
      });
    }
    pagButtons.appendChild(btn);
  };
  const addDots = () => {
    const span = document.createElement('span');
    span.className   = 'pag-dots';
    span.textContent = '…';
    span.setAttribute('aria-hidden', 'true');
    pagButtons.appendChild(span);
  };
  addBtn(cur - 1, '←', false, cur === 1);
  const start = Math.max(1, cur - 2);
  const end   = Math.min(max, cur + 2);
  if (start > 1) { addBtn(1, '1'); if (start > 2) addDots(); }
  for (let i = start; i <= end; i++) addBtn(i, String(i), i === cur);
  if (end < max)  { if (end < max - 1) addDots(); addBtn(max, String(max)); }
  addBtn(cur + 1, '→', false, cur === max);
}
function refreshAllUI() {
  renderBrowseResults();
  renderTrending();
  renderSavedSection();
}
function resetFilters() {
  state.category = 'all';
  state.salary   = 0;
  state.sort     = 'relevance';
  state.query    = '';
  if (filterSort)   filterSort.value   = 'relevance';
  if (filterSalary) filterSalary.value = 'any';
  if (searchInput)  searchInput.value  = '';
  document.querySelectorAll('.tab[data-cat]').forEach(t => {
    const isAll = t.dataset.cat === 'all';
    t.classList.toggle('active', isAll);
    t.setAttribute('aria-selected', String(isAll));
  });
  fetchBrowse(1);
}
async function fetchTrending() {
  try {
    const data = await fetchJobs('graduate internship', 1, 'relevance', 0, 10);
    state.trendingJobs = (data.results || [])
      .map((raw, idx) => mapJob(raw, idx))
      .slice(0, 10);
    renderTrending();
  } catch (err) {
    console.error('[fetchTrending]', err);
    state.trendingJobs = FALLBACK_JOBS.slice(0, 10).map(raw => mapJob(raw, raw.id));
    renderTrending();
  }
}
async function fetchBrowse(page = 1) {
  if (state.loading) return;
  state.loading = true;
  state.page    = page;
  state.error   = null;
  renderSkeletons();
  if (resultsCount) resultsCount.textContent = 'Loading…';

  let searchWhat = state.query;
  let searchSalary = state.salary;

  if (!searchWhat) {
    if (state.category === 'foryou' && Auth.user && Auth.prefs) {
      const cats = (Auth.prefs.categories || []);
      searchWhat = cats.length ? cats.join(' ') : 'graduate internship';
      if (!state.salary && Auth.prefs.salaryMin) searchSalary = Auth.prefs.salaryMin;
      if (resultsCount) resultsCount.textContent = 'Loading your personalised feed…';
    } else if (state.category && state.category !== 'all') {
      searchWhat = state.category;
    } else {
      searchWhat = 'graduate internship';
    }
  }

  try {
    const data = await fetchJobs(
      searchWhat,
      state.page,
      state.sort,
      searchSalary,
      12
    );
    state.browseJobs = (data.results || [])
      .map((raw, idx) => mapJob(raw, idx + (page - 1) * 12));
    state.totalPages = Math.min(Math.ceil((data.count || 0) / 12), 50);
    state.loading    = false;
    renderBrowseResults();
  } catch (err) {
    state.loading = false;
    state.error   = err.message;
    console.warn('[fetchBrowse] API unavailable — using fallback data:', err.message);
    const start = (page - 1) * 12;
    const end   = start + 12;
    state.browseJobs = FALLBACK_JOBS.slice(start, end).map((raw, idx) => mapJob(raw, raw.id));
    state.totalPages = Math.ceil(FALLBACK_JOBS.length / 12);
    if (resultsCount) resultsCount.textContent = 'Demo Mode: Showing curated opportunities';
    renderBrowseResults();
  }
}
function openPanel(id) {
  const sid = String(id);
  const job = [...state.browseJobs, ...state.trendingJobs, ...state.savedJobs]
    .find(j => j.id === sid);
  if (!job || !jpBody) return;

  const saved   = isSaved(job.id);
  const salary  = formatSalary(job);
  const loc     = shortLocation(job.location);

  jpBody.innerHTML = `
    <div class="jp-header">
      <button class="jp-close" id="jp-close" aria-label="Close">&times;</button>
      <h2 class="jp-role">${escapeHtml(job.role)}</h2>
      <p class="jp-company-line">${escapeHtml(job.company)}</p>
      <div class="jp-chips">
        <span class="jp-chip">${escapeHtml(loc)}</span>
        <span class="jp-chip">${escapeHtml(job.category)}</span>
        ${salary ? `<span class="jp-chip accent">${escapeHtml(salary)}</span>` : ''}
      </div>
      <div class="jp-cta-row">
        <a class="jp-btn-apply"
           href="${escapeHtml(job.redirectUrl)}"
           target="_blank"
           rel="noopener noreferrer">Apply Now</a>
        <button class="jp-btn-save${saved ? ' saved' : ''}" id="jp-save-modal">
          ${saved ? '✓ Shortlisted' : '+ Shortlist'}
        </button>
      </div>
    </div>

    <div class="jp-body-section">
      <p class="jp-section-label">About the Role</p>
      <p class="jp-description">${escapeHtml(job.description)}</p>
    </div>

    <div class="jp-body-section">
      <p class="jp-section-label">Role Details</p>
      <div class="jp-details-grid">
        <div class="jp-detail-cell">
          <span class="jp-detail-label">Company</span>
          <span class="jp-detail-value">${escapeHtml(job.company)}</span>
        </div>
        <div class="jp-detail-cell">
          <span class="jp-detail-label">Location</span>
          <span class="jp-detail-value">${escapeHtml(loc)}</span>
        </div>
        <div class="jp-detail-cell">
          <span class="jp-detail-label">Category</span>
          <span class="jp-detail-value">${escapeHtml(job.category)}</span>
        </div>
        <div class="jp-detail-cell">
          <span class="jp-detail-label">Salary</span>
          <span class="jp-detail-value salary-value">${salary || 'On Request'}</span>
        </div>
      </div>
    </div>

    <div class="jp-footer-pad"></div>
  `;

  document.getElementById('jp-close')?.addEventListener('click', closePanel);

  document.getElementById('jp-save-modal')?.addEventListener('click', () => {
    toggleSave(job);
    openPanel(id);
  });

  document.querySelector('.jp-btn-apply')?.addEventListener('click', () => {
    Auth.markApplied(job.id);
    showToast('Application tracked! Good luck', 'success');
    setTimeout(() => { renderBrowseResults(); updatePersonalisedHero(); }, 400);
  });

  jobPanel?.classList.add('active');
  document.getElementById('jp-backdrop')?.classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closePanel() {
  jobPanel?.classList.remove('active');
  document.getElementById('jp-backdrop')?.classList.remove('active');
  document.querySelectorAll('.job-card.active').forEach(c => c.classList.remove('active'));
  document.body.style.overflow = '';
}
searchInput?.addEventListener('input', () => {
  state.query = searchInput.value.trim();
  state.page  = 1;
  renderBrowseResults();
});
searchInput?.addEventListener('keydown', e => {
  if (e.key === 'Enter') {
    state.query = searchInput.value.trim();
    state.page  = 1;
    fetchBrowse(1).then(() => {
      document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
    });
  }
});
filterSort?.addEventListener('change', () => {
  state.sort = filterSort.value;
  state.page = 1;
  fetchBrowse(1);
});
filterSalary?.addEventListener('change', () => {
  state.salary = parseInt(filterSalary.value) || 0;
  state.page   = 1;
  fetchBrowse(1);
});
document.addEventListener('categorychange', e => {
  state.category = e.detail.category || 'all';
  state.page     = 1;
  fetchBrowse(1);
});
document.getElementById('jp-backdrop')?.addEventListener('click', closePanel);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closePanel();
});
document.getElementById('billboard-cta')?.addEventListener('click', () => {
  document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
});
(function init() {
  updatePersonalisedHero();
  renderSavedSection();
  fetchTrending()
    .then(() => fetchBrowse(1))
    .catch(err => {
      console.error('[Init]', err);
      state.browseJobs = FALLBACK_JOBS.map(raw => mapJob(raw, raw.id));
      state.totalPages = 1;
      renderBrowseResults();
    });

  window.addEventListener('ge:authchange', () => {
    updatePersonalisedHero();
    if (Auth.user && Auth.prefs?.onboarded) {
      const forYouTab = document.querySelector('.tab[data-cat="foryou"]');
      if (forYouTab && !forYouTab.classList.contains('active')) {
        forYouTab.click();
      }
    }
    refreshAllUI();
  });
  window.addEventListener('ge:prefschange', () => { fetchBrowse(1); });
  window.addEventListener('ge:savedchange', () => { renderSavedSection(); renderBrowseResults(); });
  document.addEventListener('ge:resetfilters', () => resetFilters());
})();

function updatePersonalisedHero() {
  const user  = Auth.user;
  const prefs = Auth.prefs;
  const heading = document.getElementById('hero-heading');
  const desc    = document.querySelector('.hero-desc');
  const stats   = document.querySelectorAll('.hero-stats .stat-number');

  if (user) {
    const firstName = user.name.split(' ')[0];
    if (heading) heading.innerHTML = `Welcome back, <em>${escapeHtml(firstName)}</em>`;
    if (desc) {
      const cats  = (prefs?.categories || []).join(', ') || 'all areas';
      const loc   = prefs?.location && prefs.location !== 'Anywhere' ? ` in ${prefs.location}` : '';
      desc.textContent = `Personalised ${cats} roles${loc} — updated live.`;
    }
    if (stats.length >= 3) {
      const saved   = Auth.savedJobs.length;
      const applied = Auth.appliedJobs.length;
      const cats    = (prefs?.categories || []).length;
      stats[0].textContent = saved   || '0';
      stats[1].textContent = applied || '0';
      stats[2].textContent = cats    || '—';
      const labels = document.querySelectorAll('.hero-stats span');
      if (labels[0]) labels[0].textContent = 'Saved roles';
      if (labels[1]) labels[1].textContent = 'Applied';
      if (labels[2]) labels[2].textContent = 'Interests';
    }
    const ctaPrimary = document.getElementById('hero-cta');
    const ctaGhost   = document.getElementById('hero-cta-ghost');
    
    if (ctaPrimary) {
      if (prefs?.onboarded) {
        ctaPrimary.innerHTML = `View Matches`;
        const nextSec = () => document.getElementById('opportunities')?.scrollIntoView({ behavior: 'smooth' });
        const newPrimary = ctaPrimary.cloneNode(true);
        ctaPrimary.parentNode.replaceChild(newPrimary, ctaPrimary);
        newPrimary.addEventListener('click', nextSec);
      } else {
        ctaPrimary.innerHTML = `Personalise Feed`;
        const newPrimary = ctaPrimary.cloneNode(true);
        ctaPrimary.parentNode.replaceChild(newPrimary, ctaPrimary);
        newPrimary.addEventListener('click', () => Auth.openOnboarding());
      }
    }
    if (ctaGhost) {
      ctaGhost.innerHTML = `Preferences`;
      const newGhost = ctaGhost.cloneNode(true);
      ctaGhost.parentNode.replaceChild(newGhost, ctaGhost);
      newGhost.addEventListener('click', () => Auth.openPrefsModal());
    }
  } else {
    if (heading) heading.innerHTML = `Launch Your <em>Legacy</em>`;
    if (desc) desc.textContent = `Real-time graduate jobs and internships. Smart matching that puts you ahead — no account needed.`;
    const defaults = [{ v:'12,400+', l:'Live roles' }, { v:'95%', l:'Match accuracy' }, { v:'180+', l:'Companies' }];
    const labels = document.querySelectorAll('.hero-stats span');
    stats.forEach((el, i) => { if (defaults[i]) el.textContent = defaults[i].v; });
    labels.forEach((el, i) => { if (defaults[i]) el.textContent = defaults[i].l; });

    const ctaPrimary = document.getElementById('hero-cta');
    const ctaGhost   = document.getElementById('hero-cta-ghost');
    if (ctaPrimary) {
      ctaPrimary.innerHTML = `Explore Roles`;
    }
    if (ctaGhost) {
      ctaGhost.innerHTML = `Our Vision`;
      const newGhost = ctaGhost.cloneNode(true);
      ctaGhost.parentNode.replaceChild(newGhost, ctaGhost);
      newGhost.addEventListener('click', () => {
        const aboutModal = document.getElementById('about-modal');
        const aboutBackdrop = document.getElementById('about-backdrop');
        aboutModal?.classList.add('active');
        aboutBackdrop?.classList.add('active');
        document.body.style.overflow = 'hidden';
      });
    }
  }
}

