/* =============================================
   MEDI-CONNECT — Application Logic
   ============================================= */

'use strict';

// ─── State ───────────────────────────────────────────────────────────────────
let appData = null;
let currentRole = null;
let currentView = null;
let selectedDoctor = 'Dr. Reynolds';

// ─── Boot ────────────────────────────────────────────────────────────────────
async function init() {
  try {
    const res = await fetch('./data.json');
    if (!res.ok) throw new Error('Failed to load data.json');
    appData = await res.json();
  } catch (err) {
    console.error('Data load error:', err);
    showToast('⚠ Could not load app data. Using fallback.');
    appData = getFallbackData();
  }

  startClock();
  initDocSelector();
}

// ─── Clock ───────────────────────────────────────────────────────────────────
function startClock() {
  const el = document.getElementById('live-time');
  if (!el) return;
  const tick = () => {
    const now = new Date();
    el.textContent = now.toLocaleTimeString('en-ZA', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };
  tick();
  setInterval(tick, 1000);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
function login(role) {
  currentRole = role;
  const userData = appData[role];

  document.getElementById('login-view').classList.remove('active-view');
  document.getElementById('login-view').classList.add('hidden');
  document.getElementById('app-layout').classList.remove('hidden');

  // User badge in sidebar
  const badge = document.getElementById('user-badge');
  badge.innerHTML = `
    <div class="user-badge-avatar ${getBadgeAvatarClass(role)}">${userData.initials}</div>
    <div class="user-badge-info">
      <div class="user-badge-name">${userData.name}</div>
      <div class="user-badge-role">${userData.role}</div>
    </div>
  `;

  // Header avatar
  const ha = document.getElementById('header-avatar');
  ha.textContent = userData.initials;

  // Build nav
  buildNav(role);

  // Default view
  const defaultView = appData.navigation[role][0].items[0].id;
  switchView(defaultView);
}

function logout() {
  currentRole = null;
  currentView = null;

  document.getElementById('app-layout').classList.add('hidden');
  document.getElementById('login-view').classList.remove('hidden');
  document.getElementById('login-view').classList.add('active-view');

  document.getElementById('dynamic-nav').innerHTML = '';
  hideAllSections();
}

// ─── Navigation ──────────────────────────────────────────────────────────────
function buildNav(role) {
  const nav = document.getElementById('dynamic-nav');
  nav.innerHTML = '';

  const sections = appData.navigation[role];
  sections.forEach(section => {
    const label = document.createElement('div');
    label.className = 'nav-section-label';
    label.textContent = section.section;
    nav.appendChild(label);

    section.items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = 'nav-item';
      btn.id = `nav-${item.id}`;
      btn.innerHTML = `
        <div class="nav-icon">${getNavIcon(item.icon)}</div>
        <span>${item.label}</span>
      `;
      btn.addEventListener('click', () => switchView(item.id));
      nav.appendChild(btn);
    });
  });
}

function switchView(viewId) {
  hideAllSections();

  // Activate section
  const section = document.getElementById(viewId);
  if (section) {
    section.classList.remove('hidden');
    // re-trigger animation
    section.style.animation = 'none';
    section.offsetHeight; // reflow
    section.style.animation = '';
  }

  currentView = viewId;

  // Update nav active state
  document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${viewId}`);
  if (activeNav) activeNav.classList.add('active');

  // Update page title
  const titles = {
    'patient-dashboard': 'Dashboard',
    'education-portal': 'Health Education',
    'messaging-portal': 'Messages',
    'doctor-dashboard': 'Dashboard',
    'admin-dashboard': 'Analytics',
  };
  document.getElementById('page-title').textContent = titles[viewId] || 'Dashboard';

  // Populate data on first switch
  populateView(viewId);

  // Close mobile menu if open
  document.querySelector('.sidebar')?.classList.remove('open');
}

function hideAllSections() {
  document.querySelectorAll('.view-section').forEach(el => {
    el.classList.add('hidden');
    el.classList.remove('active-view');
  });
}

// ─── Populate Views ───────────────────────────────────────────────────────────
function populateView(viewId) {
  switch (viewId) {
    case 'patient-dashboard':
      populatePatientDashboard();
      break;
    case 'education-portal':
      populateEducation();
      break;
    case 'messaging-portal':
      populateChat();
      break;
    case 'doctor-dashboard':
      populateDoctorDashboard();
      break;
    case 'admin-dashboard':
      populateAdminDashboard();
      break;
  }
}

// Patient Dashboard
function populatePatientDashboard() {
  const patient = appData.patient;
  document.getElementById('patient-name').textContent = patient.name;

  const list = document.getElementById('patient-appts-list');
  list.innerHTML = '';

  appData.appointments.forEach(appt => {
    list.innerHTML += `
      <div class="list-item">
        <div class="item-avatar ${appt.avatarClass}">${appt.doctorInitials}</div>
        <div class="item-text">
          <div class="item-title">${appt.doctor}</div>
          <div class="item-meta">${appt.displayDate} · ${appt.time} · ${appt.reason}</div>
        </div>
        <span class="item-badge badge-upcoming">${capitalise(appt.status)}</span>
      </div>
    `;
  });

  // Set today's date as min for date picker
  const dateInput = document.getElementById('booking-date');
  if (dateInput && !dateInput.value) {
    const today = new Date().toISOString().split('T')[0];
    dateInput.min = today;
    dateInput.value = today;
  }
}

// Education Portal
function populateEducation(filter = '') {
  const grid = document.getElementById('education-list');
  grid.innerHTML = '';

  const colorMap = {
    blue: { bg: 'var(--accent-blue-dim)', color: 'var(--accent-blue)', border: 'rgba(77,159,255,0.2)' },
    teal: { bg: 'var(--accent-teal-dim)', color: 'var(--accent-teal)', border: 'rgba(0,212,170,0.2)' },
    amber: { bg: 'rgba(255,179,71,0.12)', color: 'var(--accent-amber)', border: 'rgba(255,179,71,0.2)' },
    coral: { bg: 'rgba(255,107,107,0.12)', color: 'var(--accent-coral)', border: 'rgba(255,107,107,0.2)' },
  };

  const filtered = appData.educationResources.filter(r =>
    r.title.toLowerCase().includes(filter.toLowerCase()) ||
    r.category.toLowerCase().includes(filter.toLowerCase())
  );

  if (filtered.length === 0) {
    grid.innerHTML = `<p style="color:var(--text-tertiary);font-size:0.9rem;grid-column:1/-1;">No resources match your search.</p>`;
    return;
  }

  filtered.forEach(res => {
    const c = colorMap[res.categoryColor] || colorMap.teal;
    grid.innerHTML += `
      <div class="edu-card" onclick="showToast('Opening: ${res.title}')">
        <span class="edu-cat-badge" style="background:${c.bg};color:${c.color};border:1px solid ${c.border};">${res.category}</span>
        <div class="edu-title">${res.title}</div>
        <div class="edu-meta">${res.readTime} · ${res.author}</div>
        <span class="edu-arrow">→</span>
      </div>
    `;
  });
}

// Messaging
function populateChat() {
  const history = document.getElementById('chat-history');
  if (history.children.length > 0) return; // already populated

  appData.chatMessages.forEach(msg => {
    history.innerHTML += `
      <div class="chat-msg ${msg.type}">
        <div class="msg-sender">${msg.sender}</div>
        <div class="msg-text">${msg.text}</div>
      </div>
    `;
  });

  history.scrollTop = history.scrollHeight;
}

// Doctor Dashboard
function populateDoctorDashboard() {
  const schedList = document.getElementById('doctor-schedule-list');
  schedList.innerHTML = '';

  appData.todaySchedule.forEach(item => {
    const badgeClass = {
      'checked-in': 'badge-checked-in',
      'upcoming': 'badge-upcoming',
      'pending': 'badge-pending',
    }[item.status] || 'badge-upcoming';

    const badgeLabel = {
      'checked-in': 'Checked In',
      'upcoming': 'Upcoming',
      'pending': 'Pending',
    }[item.status] || item.status;

    schedList.innerHTML += `
      <div class="schedule-item">
        <div class="schedule-time">${item.time}</div>
        <div class="item-avatar ${item.avatarClass}">${item.patientInitials}</div>
        <div class="schedule-info">
          <div class="schedule-name">${item.patientName}</div>
          <div class="schedule-reason">${item.reason}</div>
        </div>
        <span class="item-badge ${badgeClass}">${badgeLabel}</span>
      </div>
    `;
  });

  const patList = document.getElementById('patient-records-list');
  patList.innerHTML = '';

  appData.patients.forEach(pat => {
    patList.innerHTML += `
      <div class="list-item">
        <div class="item-avatar ${pat.avatarClass}">${pat.initials}</div>
        <div class="item-text">
          <div class="item-title">${pat.name}</div>
          <div class="item-meta">Last visit: ${pat.lastVisit} · ${pat.condition}</div>
        </div>
      </div>
    `;
  });
}

// Admin Dashboard
function populateAdminDashboard() {
  const actList = document.getElementById('admin-activity-list');
  if (actList.children.length === 0) {
    appData.activityLog.forEach(log => {
      actList.innerHTML += `
        <div class="list-item">
          <div class="item-avatar dr1" style="border-radius:8px;">${getActivityIcon(log.icon)}</div>
          <div class="item-text">
            <div class="item-title">${log.title}</div>
            <div class="item-meta">${log.meta}</div>
          </div>
          <div style="display:flex;align-items:center;gap:0.75rem;flex-shrink:0;">
            <span class="item-badge ${log.badgeClass}">${log.time}</span>
          </div>
        </div>
      `;
    });
  }

  // Animate stat counters
  animateCounter('stat-appts', 142);
  animateCounter('stat-patients', 89);
}

// ─── Booking ──────────────────────────────────────────────────────────────────
function bookAppointment() {
  const date = document.getElementById('booking-date').value;
  const time = document.getElementById('booking-time').value;

  if (!date) {
    showToast('Please select a date for your appointment.');
    return;
  }

  const formatted = new Date(date + 'T00:00:00').toLocaleDateString('en-ZA', {
    day: 'numeric', month: 'long', year: 'numeric'
  });

  showToast(`✓ Appointment booked with ${selectedDoctor} on ${formatted} at ${time}`);

  // Add to appointment list optimistically
  const list = document.getElementById('patient-appts-list');
  const initials = selectedDoctor.split('.')[1]?.trim()[0] || '?';
  const avatarClasses = { 'Dr. Reynolds': 'dr1', 'Dr. Patel': 'dr2', 'Dr. Kim': 'dr3' };
  const avatar = avatarClasses[selectedDoctor] || 'dr1';

  const item = document.createElement('div');
  item.className = 'list-item';
  item.style.animation = 'fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) forwards';
  item.innerHTML = `
    <div class="item-avatar ${avatar}">${initials}</div>
    <div class="item-text">
      <div class="item-title">${selectedDoctor}</div>
      <div class="item-meta">${formatted} · ${time}</div>
    </div>
    <span class="item-badge badge-upcoming">Upcoming</span>
  `;
  list.appendChild(item);
}

// ─── Doctor Selector ──────────────────────────────────────────────────────────
function initDocSelector() {
  document.addEventListener('click', e => {
    const opt = e.target.closest('.doc-option');
    if (!opt) return;
    document.querySelectorAll('.doc-option').forEach(o => o.classList.remove('selected'));
    opt.classList.add('selected');
    selectedDoctor = opt.dataset.doc;
  });
}

// ─── Messaging ────────────────────────────────────────────────────────────────
function sendMessage() {
  const input = document.getElementById('msg-input');
  const text = input.value.trim();
  if (!text) return;

  const history = document.getElementById('chat-history');
  const msg = document.createElement('div');
  msg.className = 'chat-msg sent';
  msg.innerHTML = `
    <div class="msg-sender">You</div>
    <div class="msg-text">${escapeHtml(text)}</div>
  `;
  history.appendChild(msg);
  history.scrollTop = history.scrollHeight;
  input.value = '';

  // Simulated reply after a short delay
  setTimeout(() => {
    const reply = document.createElement('div');
    reply.className = 'chat-msg received';
    reply.innerHTML = `
      <div class="msg-sender">Dr. Reynolds</div>
      <div class="msg-text">Thanks for your message. I'll get back to you shortly.</div>
    `;
    history.appendChild(reply);
    history.scrollTop = history.scrollHeight;
  }, 1200);
}

// ─── Education Filter ─────────────────────────────────────────────────────────
function filterResources(value) {
  populateEducation(value);
}

// ─── Mobile Menu ──────────────────────────────────────────────────────────────
function toggleMobileMenu() {
  document.querySelector('.sidebar').classList.toggle('open');
}

// ─── Toast ────────────────────────────────────────────────────────────────────
let toastTimer = null;

function showToast(message) {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 400);
  }, 3500);
}

// ─── Counter Animation ────────────────────────────────────────────────────────
function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el || el.dataset.animated) return;
  el.dataset.animated = 'true';

  const duration = 1200;
  const start = performance.now();

  const step = (now) => {
    const progress = Math.min((now - start) / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
  };

  requestAnimationFrame(step);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function capitalise(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getBadgeAvatarClass(role) {
  return { patient: 'dr1', doctor: 'dr2', admin: 'dr3' }[role] || 'dr1';
}

function getNavIcon(icon) {
  const icons = {
    home: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z"/><path d="M9 21V12h6v9"/></svg>`,
    book: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    message: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`,
    chart: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  };
  return icons[icon] || icons.home;
}

function getActivityIcon(type) {
  const icons = {
    appt: '📅',
    checkin: '✓',
    record: '📋',
    msg: '✉',
  };
  return icons[type] || '•';
}

// ─── Fallback data (if JSON fails to load) ────────────────────────────────────
function getFallbackData() {
  return {
    patient: { name: 'Sarah Connor', initials: 'SC', role: 'Patient' },
    doctor: { name: 'Dr. Reynolds', initials: 'DR', role: 'Doctor' },
    admin: { name: 'Admin User', initials: 'AU', role: 'Administrator' },
    appointments: [],
    todaySchedule: [],
    patients: [],
    educationResources: [],
    chatMessages: [],
    activityLog: [],
    navigation: {
      patient: [{ section: 'Main', items: [{ id: 'patient-dashboard', label: 'Dashboard', icon: 'home' }] }],
      doctor: [{ section: 'Main', items: [{ id: 'doctor-dashboard', label: 'Dashboard', icon: 'home' }] }],
      admin: [{ section: 'Main', items: [{ id: 'admin-dashboard', label: 'Analytics', icon: 'chart' }] }],
    },
  };
}

// ─── Start ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);