/* ============================================
   Obi Reminder - Application Logic
   ============================================ */

// API Configuration
const API_BASE = '/api';

// State
const state = {
    currentPage: 'dashboard',
    pet: null,
    user: null,
    schedules: [],
    templates: [],
    logs: [],
};

// ============ Initialization ============
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNavigation();
    initEmergencyButton();
    initManageForms();
    loadDashboard();
});

// ============ Theme ============
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);

    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    updateThemeIcon(next);
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-icon');
    icon.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// ============ Navigation ============
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.dataset.page;
            navigateTo(page);
        });
    });

    // Handle hash on load
    const hash = window.location.hash.slice(1);
    if (hash && ['dashboard', 'schedules', 'templates', 'logs', 'manage'].includes(hash)) {
        navigateTo(hash);
    }
}

function navigateTo(page) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.page === page);
    });

    // Update pages
    document.querySelectorAll('.page').forEach(p => {
        p.classList.toggle('active', p.id === page);
    });

    state.currentPage = page;
    window.location.hash = page;

    // Load page data
    switch (page) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'schedules':
            loadSchedules();
            break;
        case 'templates':
            loadTemplates();
            break;
        case 'logs':
            loadLogs();
            break;
        case 'manage':
            loadManage();
            break;
    }
}

// ============ API Helpers ============
async function api(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showToast('Gagal terhubung ke server', 'error');
        throw error;
    }
}

// ============ Dashboard ============
async function loadDashboard() {
    try {
        // Load pet data
        const pets = await api('/pets');
        if (pets.length > 0) {
            state.pet = pets[0];
            state.user = pets[0].user;

            document.getElementById('petName').textContent = state.pet.name;
            document.getElementById('petSpecies').textContent = state.pet.species;
            document.getElementById('petTank').textContent = state.pet.tankLiters;
        }

        // Load schedules for next reminder
        const schedules = await api('/schedules');
        state.schedules = schedules;
        updateNextReminder(schedules);

        // Load logs for stats and recent activity
        const logs = await api('/logs?limit=10');
        state.logs = logs;
        updateStats(logs);
        updateRecentActivity(logs);

    } catch (error) {
        console.error('Failed to load dashboard:', error);
    }
}

function updateNextReminder(schedules) {
    const nextReminderEl = document.getElementById('nextReminder');
    const nextTypeEl = document.getElementById('nextReminderType');

    if (schedules.length === 0) {
        nextReminderEl.textContent = 'Tidak ada jadwal';
        nextTypeEl.textContent = '-';
        return;
    }

    // Find next scheduled time based on cron
    const enabledSchedules = schedules.filter(s => s.enabled);
    if (enabledSchedules.length === 0) {
        nextReminderEl.textContent = 'Semua jadwal nonaktif';
        nextTypeEl.textContent = '-';
        return;
    }

    // Simple: show the first enabled schedule
    const next = enabledSchedules[0];
    nextTypeEl.textContent = next.template.title;

    // Calculate approximate time (simplified)
    const cronParts = next.cron.split(' ');
    const hour = parseInt(cronParts[1]) || 9;
    nextReminderEl.textContent = `${hour.toString().padStart(2, '0')}:00`;
}

function updateStats(logs) {
    const sent = logs.filter(l => l.status === 'sent').length;
    const completed = logs.filter(l => l.status === 'completed').length;

    document.getElementById('totalSent').textContent = logs.length;
    document.getElementById('totalCompleted').textContent = completed;
}

function updateRecentActivity(logs) {
    const container = document.getElementById('recentLogs');

    if (logs.length === 0) {
        container.innerHTML = '<p class="loading">Belum ada aktivitas</p>';
        return;
    }

    container.innerHTML = logs.slice(0, 5).map(log => `
        <div class="activity-item">
            <div class="activity-status ${log.status}">
                ${getStatusEmoji(log.status)}
            </div>
            <div class="activity-info">
                <div class="activity-title">${log.template?.title || 'Unknown'}</div>
                <div class="activity-time">${formatDate(log.sentAt)}</div>
            </div>
        </div>
    `).join('');
}

function getStatusEmoji(status) {
    const emojis = {
        sent: '✅',
        completed: '🎉',
        failed: '❌',
        snoozed: '⏰',
    };
    return emojis[status] || '📨';
}

function formatDate(dateStr) {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;

    if (diff < 60000) return 'Baru saja';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} menit lalu`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} jam lalu`;

    return date.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============ Emergency ============
function initEmergencyButton() {
    const btn = document.getElementById('emergencyBtn');
    const modal = document.getElementById('confirmModal');
    const cancelBtn = document.getElementById('cancelEmergency');
    const confirmBtn = document.getElementById('confirmEmergency');

    btn.addEventListener('click', () => {
        modal.classList.add('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    confirmBtn.addEventListener('click', async () => {
        modal.classList.remove('active');
        await triggerEmergency();
    });

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

async function triggerEmergency() {
    if (!state.pet) {
        showToast('Pet tidak ditemukan', 'error');
        return;
    }

    try {
        const result = await api(`/emergency/${state.pet.id}`, { method: 'POST' });

        if (result.success) {
            showToast('🚨 Pengingat darurat terkirim!', 'success');
            // Refresh logs
            if (state.currentPage === 'dashboard') {
                loadDashboard();
            }
        } else {
            showToast('Gagal mengirim: ' + (result.error || 'Unknown error'), 'error');
        }
    } catch (error) {
        showToast('Gagal mengirim pengingat darurat', 'error');
    }
}

// ============ Schedules ============
async function loadSchedules() {
    const container = document.getElementById('schedulesList');
    container.innerHTML = '<p class="loading">Memuat jadwal...</p>';

    try {
        const schedules = await api('/schedules');
        state.schedules = schedules;

        if (schedules.length === 0) {
            container.innerHTML = '<p class="loading">Belum ada jadwal</p>';
            return;
        }

        container.innerHTML = schedules.map(schedule => `
            <div class="schedule-card ${schedule.enabled ? '' : 'disabled'}" data-id="${schedule.id}">
                <div class="schedule-info">
                    <div class="schedule-icon">${getScheduleIcon(schedule.template.key)}</div>
                    <div class="schedule-details">
                        <h4>${schedule.template.title}</h4>
                        <code class="schedule-cron">${schedule.cron}</code>
                    </div>
                </div>
                <label class="toggle">
                    <input type="checkbox" ${schedule.enabled ? 'checked' : ''} 
                           onchange="toggleSchedule('${schedule.id}')">
                    <span class="toggle-slider"></span>
                </label>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = '<p class="loading">Gagal memuat jadwal</p>';
    }
}

function getScheduleIcon(key) {
    const icons = {
        daily: '📋',
        bi_daily: '💧',
        weekly: '🧹',
        bi_weekly: '🔄',
        emergency: '🚨',
    };
    return icons[key] || '📅';
}

async function toggleSchedule(id) {
    try {
        await api(`/schedules/${id}/toggle`, { method: 'POST' });
        showToast('Jadwal diperbarui', 'success');
        await loadSchedules();
    } catch (error) {
        showToast('Gagal memperbarui jadwal', 'error');
        await loadSchedules();
    }
}

// ============ Templates ============
async function loadTemplates() {
    const container = document.getElementById('templatesList');
    container.innerHTML = '<p class="loading">Memuat template...</p>';

    try {
        const templates = await api('/templates');
        state.templates = templates;

        if (templates.length === 0) {
            container.innerHTML = '<p class="loading">Belum ada template</p>';
            return;
        }

        container.innerHTML = templates.map(template => `
            <article class="template-card">
                <div class="template-header">
                    <h4>${template.title}</h4>
                    <div class="template-key">${template.key}</div>
                </div>
                <div class="template-body">${template.body}</div>
            </article>
        `).join('');

    } catch (error) {
        container.innerHTML = '<p class="loading">Gagal memuat template</p>';
    }
}

// ============ Logs ============
async function loadLogs(filter = '') {
    const tbody = document.getElementById('logsTableBody');
    tbody.innerHTML = '<tr><td colspan="4" class="loading">Memuat log...</td></tr>';

    try {
        const logs = await api('/logs?limit=50');
        let filtered = logs;

        if (filter) {
            filtered = logs.filter(l => l.status === filter);
        }

        if (filtered.length === 0) {
            tbody.innerHTML = '<tr><td colspan="4" class="loading">Tidak ada log</td></tr>';
            return;
        }

        tbody.innerHTML = filtered.map(log => `
            <tr>
                <td>${formatDate(log.sentAt)}</td>
                <td>${log.template?.title || '-'}</td>
                <td><span class="badge badge-${log.status}">${getStatusEmoji(log.status)} ${log.status}</span></td>
                <td>${log.note || '-'}</td>
            </tr>
        `).join('');

    } catch (error) {
        tbody.innerHTML = '<tr><td colspan="4" class="loading">Gagal memuat log</td></tr>';
    }
}

// Init log filter
document.getElementById('logFilter')?.addEventListener('change', (e) => {
    loadLogs(e.target.value);
});

// ============ Manage Page ============
async function loadManage() {
    await Promise.all([loadUsersList(), loadPetsList()]);
}

async function loadUsersList() {
    const container = document.getElementById('usersList');
    container.innerHTML = '<p class="loading">Memuat pengguna...</p>';

    try {
        const users = await api('/users');
        state.users = users;

        if (users.length === 0) {
            container.innerHTML = '<p class="loading">Belum ada pengguna</p>';
            return;
        }

        container.innerHTML = users.map(user => `
            <div class="list-item">
                <div class="list-item-icon">👤</div>
                <div class="list-item-info">
                    <div class="list-item-name">${user.name}</div>
                    <div class="list-item-detail">${user.phoneE164}</div>
                </div>
            </div>
        `).join('');

        // Update pet owner dropdown
        const ownerSelect = document.getElementById('petOwner');
        ownerSelect.innerHTML = '<option value="">Pilih pemilik...</option>' +
            users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');

    } catch (error) {
        container.innerHTML = '<p class="loading">Gagal memuat pengguna</p>';
    }
}

async function loadPetsList() {
    const container = document.getElementById('petsList');
    container.innerHTML = '<p class="loading">Memuat cupang...</p>';

    try {
        const pets = await api('/pets');

        if (pets.length === 0) {
            container.innerHTML = '<p class="loading">Belum ada cupang</p>';
            return;
        }

        container.innerHTML = pets.map(pet => `
            <div class="list-item">
                <div class="list-item-icon">🐠</div>
                <div class="list-item-info">
                    <div class="list-item-name">${pet.name}</div>
                    <div class="list-item-detail">${pet.species} • ${pet.tankLiters}L • ${pet.user?.name || '-'}</div>
                </div>
            </div>
        `).join('');

    } catch (error) {
        container.innerHTML = '<p class="loading">Gagal memuat cupang</p>';
    }
}

function initManageForms() {
    // Add User Modal
    const addUserBtn = document.getElementById('addUserBtn');
    const addUserModal = document.getElementById('addUserModal');
    const cancelAddUser = document.getElementById('cancelAddUser');
    const addUserForm = document.getElementById('addUserForm');

    addUserBtn?.addEventListener('click', () => {
        addUserModal.classList.add('active');
    });

    cancelAddUser?.addEventListener('click', () => {
        addUserModal.classList.remove('active');
        addUserForm.reset();
    });

    addUserModal?.addEventListener('click', (e) => {
        if (e.target === addUserModal) {
            addUserModal.classList.remove('active');
            addUserForm.reset();
        }
    });

    addUserForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createUser();
    });

    // Add Pet Modal
    const addPetBtn = document.getElementById('addPetBtn');
    const addPetModal = document.getElementById('addPetModal');
    const cancelAddPet = document.getElementById('cancelAddPet');
    const addPetForm = document.getElementById('addPetForm');

    addPetBtn?.addEventListener('click', () => {
        addPetModal.classList.add('active');
    });

    cancelAddPet?.addEventListener('click', () => {
        addPetModal.classList.remove('active');
        addPetForm.reset();
    });

    addPetModal?.addEventListener('click', (e) => {
        if (e.target === addPetModal) {
            addPetModal.classList.remove('active');
            addPetForm.reset();
        }
    });

    addPetForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await createPet();
    });
}

async function createUser() {
    const name = document.getElementById('userName').value.trim();
    const phone = document.getElementById('userPhone').value.trim();

    if (!name || !phone) {
        showToast('Lengkapi semua field', 'error');
        return;
    }

    // Format phone number
    let phoneE164 = phone;
    if (!phoneE164.startsWith('+')) {
        phoneE164 = '+' + phoneE164;
    }

    try {
        const result = await api('/users', {
            method: 'POST',
            body: JSON.stringify({ name, phoneE164 }),
        });

        if (result.id) {
            showToast('✅ Pengguna berhasil ditambahkan!', 'success');
            document.getElementById('addUserModal').classList.remove('active');
            document.getElementById('addUserForm').reset();
            await loadManage();
        } else {
            showToast('Gagal menambahkan pengguna', 'error');
        }
    } catch (error) {
        showToast('Gagal menambahkan pengguna', 'error');
    }
}

async function createPet() {
    const userId = document.getElementById('petOwner').value;
    const name = document.getElementById('petNameInput').value.trim();
    const species = document.getElementById('petSpeciesInput').value.trim() || 'Betta';
    const tankLiters = parseFloat(document.getElementById('petTankInput').value) || 2.6;

    if (!userId || !name) {
        showToast('Lengkapi semua field', 'error');
        return;
    }

    try {
        const result = await api('/pets', {
            method: 'POST',
            body: JSON.stringify({ userId, name, species, tankLiters }),
        });

        if (result.id) {
            showToast('✅ Cupang berhasil ditambahkan dengan jadwal otomatis!', 'success');
            document.getElementById('addPetModal').classList.remove('active');
            document.getElementById('addPetForm').reset();
            await loadManage();
        } else {
            showToast('Gagal menambahkan cupang', 'error');
        }
    } catch (error) {
        showToast('Gagal menambahkan cupang', 'error');
    }
}

// ============ Toast ============
function showToast(message, type = '') {
    const toast = document.getElementById('toast');
    const msgEl = toast.querySelector('.toast-message');

    msgEl.textContent = message;
    toast.className = 'toast active ' + type;

    setTimeout(() => {
        toast.classList.remove('active');
    }, 3000);
}

// Make toggleSchedule available globally
window.toggleSchedule = toggleSchedule;
