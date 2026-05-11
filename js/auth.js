'use strict';

const KEYS = {
  user:    'ge_user',
  prefs:   'ge_prefs',
  saved:   'ge_saved_v2',
  applied: 'ge_applied',
};

function escHtml(s) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
  return String(s ?? '').replace(/[&<>"']/g, m => map[m]);
}
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function showToast(msg, type = 'info') {
  let box = document.getElementById('ge-toast-box');
  if (!box) {
    box = document.createElement('div');
    box.id = 'ge-toast-box';
    document.body.appendChild(box);
  }
  const t = document.createElement('div');
  t.className = `ge-toast ge-toast--${type}`;
  t.textContent = msg;
  box.appendChild(t);
  requestAnimationFrame(() => t.classList.add('ge-toast--in'));
  setTimeout(() => {
    t.classList.remove('ge-toast--in');
    t.addEventListener('transitionend', () => t.remove(), { once: true });
  }, 3000);
}

const Auth = {
  get user() {
    try { return JSON.parse(localStorage.getItem(KEYS.user) || 'null'); }
    catch { return null; }
  },
  get prefs() {
    try { return JSON.parse(localStorage.getItem(KEYS.prefs) || 'null'); }
    catch { return null; }
  },
  get savedJobs() {
    try { return JSON.parse(localStorage.getItem(KEYS.saved) || '[]'); }
    catch { return []; }
  },
  get appliedJobs() {
    try { return JSON.parse(localStorage.getItem(KEYS.applied) || '[]'); }
    catch { return []; }
  },

  signUp(name, email, password) {
    const existing = this._getAllUsers().find(u => u.email === email);
    if (existing) return { error: 'An account with this email already exists.' };
    const user = {
      id:        crypto.randomUUID?.() || String(Date.now()),
      name:      name.trim(),
      email:     email.trim().toLowerCase(),
      password,  
      createdAt: new Date().toISOString(),
    };
    const all = this._getAllUsers();
    all.push(user);
    localStorage.setItem('ge_all_users', JSON.stringify(all));
    this._setActive(user);
    return { user };
  },

  signIn(email, password) {
    const user = this._getAllUsers().find(
      u => u.email === email.trim().toLowerCase() && u.password === password
    );
    if (!user) return { error: 'Incorrect email or password.' };
    this._setActive(user);
    return { user };
  },

  signOut() {
    localStorage.removeItem(KEYS.user);
    showToast('Signed out. See you soon!', 'info');
    window.dispatchEvent(new CustomEvent('ge:authchange', { detail: null }));
    Auth.updateNav();
  },

  savePrefs(prefs) {
    const merged = { ...(this.prefs || {}), ...prefs, updatedAt: new Date().toISOString() };
    localStorage.setItem(KEYS.prefs, JSON.stringify(merged));
    window.dispatchEvent(new CustomEvent('ge:prefschange', { detail: merged }));
    return merged;
  },

  toggleSaved(job) {
    const list = this.savedJobs;
    const idx  = list.findIndex(j => j.id === job.id);
    if (idx >= 0) {
      list.splice(idx, 1);
      showToast('Removed from shortlist', 'info');
    } else {
      list.push({ ...job, savedAt: new Date().toISOString() });
      showToast('Saved to shortlist', 'success');
    }
    localStorage.setItem(KEYS.saved, JSON.stringify(list));
    window.dispatchEvent(new CustomEvent('ge:savedchange'));
    return idx < 0; 
  },

  markApplied(jobId) {
    const list = this.appliedJobs;
    if (!list.includes(jobId)) {
      list.push(jobId);
      localStorage.setItem(KEYS.applied, JSON.stringify(list));
    }
  },

  isSaved(id) { return this.savedJobs.some(j => j.id === id); },
  isApplied(id) { return this.appliedJobs.includes(id); },

  matchScore(job) {
    const p = this.prefs;
    if (!p) return job.matchScore ?? 60;
    let score = 40;
    const catMatch = (p.categories || []).some(c =>
      (job.categoryNorm || '').includes(c) || (job.category || '').toLowerCase().includes(c.toLowerCase())
    );
    if (catMatch) score += 30;
    if (p.salaryMin > 0 && job.salaryMin >= p.salaryMin) score += 15;
    if (p.location && job.location?.toLowerCase().includes(p.location.toLowerCase())) score += 15;
    return Math.min(score, 99);
  },

  _getAllUsers() {
    try { return JSON.parse(localStorage.getItem('ge_all_users') || '[]'); }
    catch { return []; }
  },
  _setActive(user) {
    const safe = { ...user };
    delete safe.password;
    localStorage.setItem(KEYS.user, JSON.stringify(safe));
    window.dispatchEvent(new CustomEvent('ge:authchange', { detail: safe }));
    Auth.updateNav();
  },

  updateNav() {
    const user = this.user;
    const right = document.getElementById('navbar-auth-area');

    document.body.classList.toggle('ge-logged-in', !!user);

    if (!right) return;

    if (user) {
      const initials = user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0,2);
      right.innerHTML = `
        <div class="ge-avatar-wrap" id="ge-avatar-wrap">
          <button class="ge-avatar" id="ge-avatar-btn" aria-label="Your profile" aria-haspopup="true" title="${escHtml(user.name)}">
            ${escHtml(initials)}
          </button>
          <div class="ge-dropdown" id="ge-dropdown" hidden>
            <div class="ge-dropdown-header">
              <strong>${escHtml(user.name)}</strong>
              <span>${escHtml(user.email)}</span>
            </div>
            <button class="ge-dropdown-item" id="ge-prefs-btn">Preferences</button>
            <button class="ge-dropdown-item ge-dropdown-item--danger" id="ge-signout-btn">Sign Out</button>
          </div>
        </div>`;
      document.getElementById('ge-avatar-btn').addEventListener('click', e => {
        e.stopPropagation();
        const dd = document.getElementById('ge-dropdown');
        dd.hidden = !dd.hidden;
      });
      document.addEventListener('click', () => {
        const dd = document.getElementById('ge-dropdown');
        if (dd) dd.hidden = true;
      });
      document.getElementById('ge-signout-btn')?.addEventListener('click', () => Auth.signOut());
      document.getElementById('ge-prefs-btn')?.addEventListener('click', () => Auth.openPrefsModal());
    } else {
      right.innerHTML = `
        <button class="btn-secondary ge-auth-btn" id="ge-login-trigger" style="font-size:0.8rem;padding:0.4rem 1rem;">Log In</button>
        <button class="btn-primary  ge-auth-btn" id="ge-signup-trigger" style="font-size:0.8rem;padding:0.4rem 1rem;">Sign Up</button>`;
      document.getElementById('ge-login-trigger')?.addEventListener('click',  () => Auth.openModal('login'));
      document.getElementById('ge-signup-trigger')?.addEventListener('click', () => Auth.openModal('signup'));
    }
  },

  openModal(view = 'signup') {
    let modal = document.getElementById('ge-auth-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'ge-auth-modal';
      modal.className = 'ge-modal-overlay';
      modal.innerHTML = `<div class="ge-modal-box" role="dialog" aria-modal="true" id="ge-modal-box"></div>`;
      document.body.appendChild(modal);
      modal.addEventListener('click', e => { if (e.target === modal) Auth.closeModal(); });
    }
    modal.hidden = false;
    document.body.style.overflow = 'hidden';
    Auth._renderModalView(view);
  },

  closeModal() {
    const m = document.getElementById('ge-auth-modal');
    if (m) m.hidden = true;
    document.body.style.overflow = '';
  },

  _renderModalView(view) {
    const box = document.getElementById('ge-modal-box');
    if (!box) return;

    if (view === 'signup') {
      box.innerHTML = `
        <button class="ge-modal-close" id="ge-modal-close">&times;</button>
        <div class="ge-modal-brand">GetEmployed</div>
        <h2 class="ge-modal-title">Create your free account</h2>
        <p class="ge-modal-sub">Unlock personalised job matching.</p>
        <form id="ge-signup-form" novalidate>
          <div class="ge-field-wrap">
            <label class="ge-label" for="ge-name">Full Name</label>
            <input class="ge-input" type="text" id="ge-name" placeholder="Jane Smith" required autocomplete="name">
          </div>
          <div class="ge-field-wrap">
            <label class="ge-label" for="ge-email-s">Email</label>
            <input class="ge-input" type="email" id="ge-email-s" placeholder="jane@email.com" required autocomplete="email">
          </div>
          <div class="ge-field-wrap">
            <label class="ge-label" for="ge-pass-s">Password</label>
            <div class="ge-pw-wrap">
              <input class="ge-input" type="password" id="ge-pass-s" placeholder="Min 6 characters" required minlength="6">
              <button type="button" class="ge-pw-toggle" id="ge-pw-toggle-s" aria-label="Show password">Show</button>
            </div>
          </div>
          <div class="ge-error" id="ge-signup-error" hidden></div>
          <button class="btn-primary ge-submit-btn" type="submit">Create Account</button>
        </form>
        <p class="ge-modal-switch">Already have an account? <button class="ge-link-btn" id="ge-to-login">Log in</button></p>`;
      document.getElementById('ge-modal-close')?.addEventListener('click', () => Auth.closeModal());
      document.getElementById('ge-to-login')?.addEventListener('click', () => Auth._renderModalView('login'));
      const toggleS = document.getElementById('ge-pw-toggle-s');
      toggleS?.addEventListener('click', () => {
        const inp = document.getElementById('ge-pass-s');
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        toggleS.textContent = show ? 'Hide' : 'Show';
      });
        document.getElementById('ge-signup-form')?.addEventListener('submit', e => {
          e.preventDefault();
          const nameEl  = document.getElementById('ge-name');
          const emailEl = document.getElementById('ge-email-s');
          const passEl  = document.getElementById('ge-pass-s');
          const errEl   = document.getElementById('ge-signup-error');
          
          const name  = nameEl.value.trim();
          const email = emailEl.value.trim();
          const pass  = passEl.value;

          if (!name || !email || !pass) {
            errEl.textContent = 'Please complete all fields.';
            errEl.hidden = false; return;
          }
          if (!isValidEmail(email)) {
            errEl.textContent = 'Please enter a valid email address.';
            errEl.hidden = false; return;
          }
          if (pass.length < 6) {
            errEl.textContent = 'Password must be at least 6 characters.';
            errEl.hidden = false; return;
          }
        const result = Auth.signUp(name, email, pass);
        if (result.error) { errEl.textContent = result.error; errEl.hidden = false; return; }
        Auth.closeModal();
        showToast(`Welcome, ${result.user.name}!`, 'success');
        setTimeout(() => Auth.openOnboarding(), 600);
      });

    } else if (view === 'login') {
      box.innerHTML = `
        <button class="ge-modal-close" id="ge-modal-close">&times;</button>
        <div class="ge-modal-brand">GetEmployed</div>
        <h2 class="ge-modal-title">Welcome back</h2>
        <p class="ge-modal-sub">Log in to see your personalised feed.</p>
        <form id="ge-login-form" novalidate>
          <div class="ge-field-wrap">
            <label class="ge-label" for="ge-email-l">Email</label>
            <input class="ge-input" type="email" id="ge-email-l" placeholder="jane@email.com" required autocomplete="email">
          </div>
          <div class="ge-field-wrap">
            <label class="ge-label" for="ge-pass-l">Password</label>
            <div class="ge-pw-wrap">
              <input class="ge-input" type="password" id="ge-pass-l" placeholder="Your password" required>
              <button type="button" class="ge-pw-toggle" id="ge-pw-toggle-l" aria-label="Show password">Show</button>
            </div>
          </div>
          <div class="ge-error" id="ge-login-error" hidden></div>
          <button class="btn-primary ge-submit-btn" type="submit">Log In</button>
        </form>
        <p class="ge-modal-switch">Don't have an account? <button class="ge-link-btn" id="ge-to-signup">Sign up free</button></p>`;
      document.getElementById('ge-modal-close')?.addEventListener('click', () => Auth.closeModal());
      document.getElementById('ge-to-signup')?.addEventListener('click', () => Auth._renderModalView('signup'));
      const toggleL = document.getElementById('ge-pw-toggle-l');
      toggleL?.addEventListener('click', () => {
        const inp = document.getElementById('ge-pass-l');
        const show = inp.type === 'password';
        inp.type = show ? 'text' : 'password';
        toggleL.textContent = show ? 'Hide' : 'Show';
      });
      document.getElementById('ge-login-form')?.addEventListener('submit', e => {
        e.preventDefault();
        const email = document.getElementById('ge-email-l').value;
        const pass  = document.getElementById('ge-pass-l').value;
        const errEl = document.getElementById('ge-login-error');
        const result = Auth.signIn(email, pass);
        if (result.error) { errEl.textContent = result.error; errEl.hidden = false; return; }
        Auth.closeModal();
        const p = Auth.prefs;
        if (!p || !p.onboarded) {
          setTimeout(() => Auth.openOnboarding(), 400);
        } else {
          showToast(`Welcome back, ${result.user.name}!`, 'success');
          window.dispatchEvent(new CustomEvent('ge:authchange', { detail: result.user }));
        }
      });
    }
    setTimeout(() => box.querySelector('input')?.focus(), 100);
  },

  openOnboarding() {
    let ow = document.getElementById('ge-onboarding');
    if (!ow) {
      ow = document.createElement('div');
      ow.id = 'ge-onboarding';
      ow.className = 'ge-modal-overlay';
      ow.innerHTML = `<div class="ge-modal-box ge-onboarding-box" id="ge-ob-box"></div>`;
      document.body.appendChild(ow);
    }
    ow.hidden = false;
    document.body.style.overflow = 'hidden';
    Auth._renderOnboardingStep(1);
  },

  closeOnboarding() {
    const ow = document.getElementById('ge-onboarding');
    if (ow) ow.hidden = true;
    document.body.style.overflow = '';
  },

  _renderOnboardingStep(step) {
    const box = document.getElementById('ge-ob-box');
    if (!box) return;
    const user = Auth.user;

    if (step === 1) {
      box.innerHTML = `
        <div class="ge-ob-progress"><div class="ge-ob-bar" style="width:33%"></div></div>
        <p class="ge-ob-step">Step 1 of 3</p>
        <h2 class="ge-modal-title">Hi, ${escHtml(user?.name?.split(' ')[0] || 'there')}!</h2>
        <p class="ge-modal-sub">Which areas are you interested in?</p>
        <div class="ge-chip-grid" id="ge-cat-chips">
          ${[
            { val:'tech',       label:'Technology' },
            { val:'finance',    label:'Finance' },
            { val:'marketing',  label:'Marketing' },
            { val:'healthcare', label:'Life Sciences' },
            { val:'engineering',label:'Engineering' },
            { val:'design',     label:'Design' },
            { val:'legal',      label:'Legal' },
            { val:'other',      label:'Other' },
          ].map(c => `<button class="ge-chip" data-val="${c.val}">${c.label}</button>`).join('')}
        </div>
        <div class="ge-error" id="ge-ob-err1" hidden>Pick at least one interest.</div>
        <button class="btn-primary ge-submit-btn" id="ge-ob-next1">Next</button>`;

      box.querySelectorAll('.ge-chip').forEach(btn => {
        btn.addEventListener('click', () => btn.classList.toggle('ge-chip--active'));
      });
      document.getElementById('ge-ob-next1').addEventListener('click', () => {
        const selected = [...box.querySelectorAll('.ge-chip--active')].map(b => b.dataset.val);
        if (!selected.length) { document.getElementById('ge-ob-err1').hidden = false; return; }
        Auth.savePrefs({ categories: selected });
        Auth._renderOnboardingStep(2);
      });

    } else if (step === 2) {
      box.innerHTML = `
        <div class="ge-ob-progress"><div class="ge-ob-bar" style="width:66%"></div></div>
        <p class="ge-ob-step">Step 2 of 3</p>
        <h2 class="ge-modal-title">Where are you based?</h2>
        <p class="ge-modal-sub">We'll prioritise roles in your area.</p>
        <div class="ge-chip-grid" id="ge-loc-chips">
          ${['London','Manchester','Birmingham','Edinburgh','Bristol','Leeds','Remote','Anywhere'].map(
            l => `<button class="ge-chip" data-val="${l}">${l}</button>`
          ).join('')}
        </div>
        <div class="ge-field-wrap" style="margin-top:1rem;">
          <label class="ge-label" for="ge-loc-custom">Or type a city</label>
          <input class="ge-input" type="text" id="ge-loc-custom" placeholder="e.g. Oxford">
        </div>
        <button class="btn-primary ge-submit-btn" id="ge-ob-next2">Next</button>`;

      box.querySelectorAll('.ge-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          box.querySelectorAll('.ge-chip').forEach(b => b.classList.remove('ge-chip--active'));
          btn.classList.add('ge-chip--active');
        });
      });
      document.getElementById('ge-ob-next2').addEventListener('click', () => {
        const chip   = box.querySelector('.ge-chip--active')?.dataset.val || '';
        const custom = document.getElementById('ge-loc-custom').value.trim();
        Auth.savePrefs({ location: custom || chip || 'Anywhere' });
        Auth._renderOnboardingStep(3);
      });

    } else if (step === 3) {
      box.innerHTML = `
        <div class="ge-ob-progress"><div class="ge-ob-bar" style="width:100%"></div></div>
        <p class="ge-ob-step">Step 3 of 3</p>
        <h2 class="ge-modal-title">Minimum salary?</h2>
        <p class="ge-modal-sub">We'll filter out roles that don't match.</p>
        <div class="ge-chip-grid">
          ${[
            { val:0,     label:'Any salary' },
            { val:20000, label:'£20k+' },
            { val:30000, label:'£30k+' },
            { val:40000, label:'£40k+' },
            { val:60000, label:'£60k+' },
            { val:80000, label:'£80k+' },
          ].map(s => `<button class="ge-chip" data-val="${s.val}">${s.label}</button>`).join('')}
        </div>
        <button class="btn-primary ge-submit-btn" id="ge-ob-finish">See My Jobs</button>`;

      box.querySelectorAll('.ge-chip').forEach(btn => {
        btn.addEventListener('click', () => {
          box.querySelectorAll('.ge-chip').forEach(b => b.classList.remove('ge-chip--active'));
          btn.classList.add('ge-chip--active');
        });
      });
      document.getElementById('ge-ob-finish').addEventListener('click', () => {
        const val = parseInt(box.querySelector('.ge-chip--active')?.dataset.val || '0');
        Auth.savePrefs({ salaryMin: val, onboarded: true });
        Auth.closeOnboarding();
        showToast('Your feed is personalised!', 'success');
        window.dispatchEvent(new CustomEvent('ge:authchange', { detail: Auth.user }));
      });
    }
  },

  openPrefsModal() {
    let dd = document.getElementById('ge-dropdown');
    if (dd) dd.hidden = true;

    Auth.openModal('__prefs__');
    const box = document.getElementById('ge-modal-box');
    if (!box) return;
    const p = Auth.prefs || {};

    box.innerHTML = `
      <button class="ge-modal-close" id="ge-modal-close">&times;</button>
      <div class="ge-modal-brand">GetEmployed</div>
      <h2 class="ge-modal-title">Your Preferences</h2>
      <p class="ge-modal-sub">Update how we match roles for you.</p>

      <p class="ge-label" style="margin-bottom:0.5rem;">Interests</p>
      <div class="ge-chip-grid" id="ge-pref-cats">
        ${[
          { val:'tech',       label:'Technology' },
          { val:'finance',    label:'Finance' },
          { val:'marketing',  label:'Marketing' },
          { val:'healthcare', label:'Life Sciences' },
          { val:'engineering',label:'Engineering' },
          { val:'design',     label:'Design' },
          { val:'legal',      label:'Legal' },
          { val:'other',      label:'Other' },
        ].map(c => `<button class="ge-chip ${(p.categories||[]).includes(c.val)?'ge-chip--active':''}" data-val="${c.val}">${c.label}</button>`).join('')}
      </div>

      <div class="ge-field-wrap" style="margin-top:1.2rem;">
        <label class="ge-label" for="ge-pref-loc">Preferred Location</label>
        <input class="ge-input" type="text" id="ge-pref-loc" value="${escHtml(p.location||'')}" placeholder="e.g. London">
      </div>

      <p class="ge-label" style="margin:1rem 0 0.5rem;">Minimum Salary</p>
      <div class="ge-chip-grid" id="ge-pref-salary">
        ${[{val:0,label:'Any'},{val:20000,label:'£20k+'},{val:30000,label:'£30k+'},{val:40000,label:'£40k+'},{val:60000,label:'£60k+'},{val:80000,label:'£80k+'}]
          .map(s => `<button class="ge-chip ${(p.salaryMin||0)===s.val?'ge-chip--active':''}" data-val="${s.val}">${s.label}</button>`).join('')}
      </div>

      <button class="btn-primary ge-submit-btn" id="ge-pref-save" style="margin-top:1.5rem;">Save Preferences</button>`;

    document.getElementById('ge-modal-close')?.addEventListener('click', () => Auth.closeModal());
    box.querySelectorAll('#ge-pref-cats .ge-chip').forEach(btn =>
      btn.addEventListener('click', () => btn.classList.toggle('ge-chip--active'))
    );
    box.querySelectorAll('#ge-pref-salary .ge-chip').forEach(btn =>
      btn.addEventListener('click', () => {
        box.querySelectorAll('#ge-pref-salary .ge-chip').forEach(b => b.classList.remove('ge-chip--active'));
        btn.classList.add('ge-chip--active');
      })
    );
    document.getElementById('ge-pref-save')?.addEventListener('click', () => {
      const cats   = [...box.querySelectorAll('#ge-pref-cats .ge-chip--active')].map(b => b.dataset.val);
      const loc    = document.getElementById('ge-pref-loc').value.trim();
      const salary = parseInt(box.querySelector('#ge-pref-salary .ge-chip--active')?.dataset.val || '0');
      Auth.savePrefs({ categories: cats, location: loc, salaryMin: salary });
      Auth.closeModal();
      showToast('Preferences saved! Refreshing your feed…', 'success');
      window.dispatchEvent(new CustomEvent('ge:authchange', { detail: Auth.user }));
    });
  },
};

document.addEventListener('DOMContentLoaded', () => {
  const navbarRight = document.querySelector('.navbar-right');
  if (navbarRight && !document.getElementById('navbar-auth-area')) {
    const area = document.createElement('div');
    area.id = 'navbar-auth-area';
    area.style.cssText = 'display:flex;align-items:center;gap:0.5rem;margin-left:0.75rem;';
    navbarRight.insertBefore(area, navbarRight.firstChild);
  }
  Auth.updateNav();

  const btt = document.createElement('button');
  btt.id = 'ge-btt';
  btt.innerHTML = '↑';
  btt.setAttribute('aria-label', 'Back to top');
  document.body.appendChild(btt);
  window.addEventListener('scroll', () => {
    btt.classList.toggle('ge-btt--visible', window.scrollY > 500);
  }, { passive: true });
  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { Auth.closeModal(); Auth.closeOnboarding(); }
  });
});

export { Auth, showToast };
