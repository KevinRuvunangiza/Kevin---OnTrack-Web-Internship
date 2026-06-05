/**
 * MEDI-CONNECT - PHASE 1 PROTOTYPE LOGIC
 * Handles mock data injection, SPA routing, and role-based access control.
 */

// ==========================================
// MOCK DATABASE 
// ==========================================
const db = {
    patients: [
        { id: "P-101", name: "John Doe", age: 34, history: "Hypertension" },
        { id: "P-102", name: "Jane Smith", age: 28, history: "Asthma" },
        { id: "P-103", name: "Michael Ross", age: 45, history: "None" }
    ],
    appointments: [
        { doctor: "Dr. Reynolds", date: "Oct 24", time: "10:00 AM", status: "Upcoming" },
        { doctor: "Dr. Patel", date: "Nov 02", time: "02:30 PM", status: "Upcoming" }
    ],
    doctorSchedule: [
        { patient: "John Doe", reason: "Follow-up", time: "09:00 AM", status: "Checked In" },
        { patient: "Jane Smith", reason: "Prescription Renewal", time: "11:15 AM", status: "Pending" }
    ],
    resources: [
        { title: "Managing Blood Pressure", category: "Cardiology" },
        { title: "Dietary Guidelines for 2026", category: "Wellness" },
        { title: "Understanding Asthma Triggers", category: "Respiratory" },
        { title: "Mental Health Basics", category: "Psychology" }
    ],
    messages: [
        { sender: "Dr. Reynolds", text: "Your test results look great. Keep up the diet.", type: "received" },
        { sender: "You", text: "Thank you, doctor! Will do.", type: "sent" }
    ],
    adminStats: { appts: 142, patients: 89, activity: ["System backup completed.", "New user registered: P-104", "API sync successful."] }
};

// ==========================================
// SPA ROUTING & ROLE MANAGEMENT
// ==========================================
let currentRole = null;

const navConfig = {
    patient: [
        { label: "Dashboard", target: "patient-dashboard" },
        { label: "Health Education", target: "education-portal" },
        { label: "Secure Messaging", target: "messaging-portal" }
    ],
    doctor: [
        { label: "Dashboard & Records", target: "doctor-dashboard" },
        { label: "Secure Messaging", target: "messaging-portal" }
    ],
    admin: [
        { label: "System Analytics", target: "admin-dashboard" }
    ]
};

/**
 * Handles the login flow, sets the role, and builds the UI.
 */
function login(role) {
    currentRole = role;
    
    // Hide Login, Show App
    document.getElementById('login-view').classList.add('hidden');
    document.getElementById('app-layout').classList.remove('hidden');
    
    // Set Header Info
    const names = { patient: "Sarah Connor", doctor: "Dr. Reynolds", admin: "System Admin" };
    document.getElementById('user-greeting').innerText = `Welcome, ${names[role]}`;

    buildNavigation(role);
    renderData();
}

function logout() {
    currentRole = null;
    document.getElementById('app-layout').classList.add('hidden');
    document.getElementById('login-view').classList.remove('hidden');
}

/**
 * Dynamically creates the sidebar navigation based on user role.
 */
function buildNavigation(role) {
    const navMenu = document.getElementById('dynamic-nav');
    navMenu.innerHTML = ''; // Clear previous

    const links = navConfig[role];
    links.forEach((link, index) => {
        const item = document.createElement('div');
        item.className = `nav-item ${index === 0 ? 'active' : ''}`;
        item.innerText = link.label;
        item.onclick = () => switchView(link.target, item);
        navMenu.appendChild(item);
    });

    // Auto-load the first view
    switchView(links[0].target, navMenu.firstChild);
}

/**
 * Handles switching between different bento-grid views.
 */
function switchView(targetId, navElement) {
    // Update active state on nav
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if(navElement) navElement.classList.add('active');

    // Hide all views, show target
    document.querySelectorAll('.view-section').forEach(view => {
        if(view.id !== 'login-view') view.classList.add('hidden');
    });
    document.getElementById(targetId).classList.remove('hidden');

    // Close mobile menu if open
    document.querySelector('.sidebar').classList.remove('open');
}

function toggleMobileMenu() {
    document.querySelector('.sidebar').classList.toggle('open');
}

// ==========================================
// DOM DATA INJECTION
// ==========================================

function renderData() {
    // 1. Patient Data
    const apptContainer = document.getElementById('patient-appts-list');
    apptContainer.innerHTML = db.appointments.map(a => `
        <div class="list-item">
            <div>
                <div class="item-title">${a.doctor}</div>
                <div class="item-meta">${a.date} at ${a.time}</div>
            </div>
            <span class="text-muted">${a.status}</span>
        </div>
    `).join('');

    const eduContainer = document.getElementById('education-list');
    eduContainer.innerHTML = db.resources.map(r => `
        <div class="resource-card">
            <div class="item-title mb-4">${r.title}</div>
            <div class="item-meta">Category: ${r.category}</div>
        </div>
    `).join('');

    const chatContainer = document.getElementById('chat-history');
    chatContainer.innerHTML = db.messages.map(m => `
        <div class="chat-msg ${m.type}">
            <div class="item-meta mb-4">${m.sender}</div>
            <div>${m.text}</div>
        </div>
    `).join('');

    // 2. Doctor Data
    const docSchedule = document.getElementById('doctor-schedule-list');
    docSchedule.innerHTML = db.doctorSchedule.map(s => `
        <div class="list-item">
            <div>
                <div class="item-title">${s.patient}</div>
                <div class="item-meta">${s.reason}</div>
            </div>
            <span class="${s.status === 'Checked In' ? 'text-success' : 'text-muted'}">${s.status}</span>
        </div>
    `).join('');

    const recordsContainer = document.getElementById('patient-records-list');
    recordsContainer.innerHTML = db.patients.map(p => `
        <div class="list-item">
            <div>
                <div class="item-title">${p.name}</div>
                <div class="item-meta">ID: ${p.id} | Age: ${p.age}</div>
            </div>
            <span class="text-muted">${p.history}</span>
        </div>
    `).join('');

    // 3. Admin Data
    document.getElementById('stat-appts').innerText = db.adminStats.appts;
    document.getElementById('stat-patients').innerText = db.adminStats.patients;
    
    const activityContainer = document.getElementById('admin-activity-list');
    activityContainer.innerHTML = db.adminStats.activity.map(act => `
        <div class="list-item">
            <div class="item-title">${act}</div>
            <div class="item-meta">Just now</div>
        </div>
    `).join('');
}