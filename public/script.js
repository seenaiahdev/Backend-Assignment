// =============================================================
// Student Project Management - vanilla JS frontend
// Talks to the same-origin REST API. No frameworks used.
// =============================================================

const API = "/api";

// --- Simple state stored in localStorage ---
const store = {
  get token() {
    return localStorage.getItem("token");
  },
  set token(v) {
    v ? localStorage.setItem("token", v) : localStorage.removeItem("token");
  },
  get name() {
    return localStorage.getItem("name") || "";
  },
  set name(v) {
    v ? localStorage.setItem("name", v) : localStorage.removeItem("name");
  },
};

// --- Element shortcuts ---
const $ = (id) => document.getElementById(id);

// --- Toast helper ---
let toastTimer;
function toast(message, type = "success") {
  const el = $("toast");
  el.textContent = message;
  el.className = `toast toast-${type}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add("hidden"), 3000);
}

// --- API wrapper: attaches JWT, parses JSON, throws on error ---
async function api(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (store.token) headers.Authorization = `Bearer ${store.token}`;

  const res = await fetch(API + path, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // Token expired / invalid -> force logout
    if (res.status === 401 && store.token) logout(true);
    throw new Error(data.message || "Something went wrong");
  }
  return data;
}

// =============================================================
// View switching
// =============================================================
function showAuth() {
  $("authView").classList.remove("hidden");
  $("dashView").classList.add("hidden");
  $("userBox").classList.add("hidden");
}

function showDashboard() {
  $("authView").classList.add("hidden");
  $("dashView").classList.remove("hidden");
  $("userBox").classList.remove("hidden");
  $("userGreeting").textContent = `Hi, ${store.name || "there"}`;
  loadProjects();
}

// =============================================================
// Auth: tabs, login, register, logout
// =============================================================
document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    const isLogin = tab.dataset.tab === "login";
    $("loginForm").classList.toggle("hidden", !isLogin);
    $("registerForm").classList.toggle("hidden", isLogin);
  });
});

$("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const data = await api("/auth/register", {
      method: "POST",
      body: {
        name: f.name.value.trim(),
        email: f.email.value.trim(),
        password: f.password.value,
      },
    });
    store.token = data.token;
    store.name = data.user.name;
    f.reset();
    toast("Account created 🎉");
    showDashboard();
  } catch (err) {
    toast(err.message, "error");
  }
});

$("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;
  try {
    const data = await api("/auth/login", {
      method: "POST",
      body: { email: f.email.value.trim(), password: f.password.value },
    });
    store.token = data.token;
    // Login response doesn't include the name; derive a friendly label from email.
    store.name = f.email.value.split("@")[0];
    f.reset();
    toast("Logged in 👋");
    showDashboard();
  } catch (err) {
    toast(err.message, "error");
  }
});

$("logoutBtn").addEventListener("click", () => logout());

function logout(expired = false) {
  store.token = null;
  store.name = null;
  showAuth();
  if (expired) toast("Session expired, please log in again", "error");
}

// =============================================================
// Projects: list, create, update, delete
// =============================================================
async function loadProjects() {
  try {
    const { projects } = await api("/projects");
    renderProjects(projects);
  } catch (err) {
    toast(err.message, "error");
  }
}

function renderProjects(projects) {
  const list = $("projectList");
  list.innerHTML = "";
  $("emptyState").classList.toggle("hidden", projects.length > 0);

  projects.forEach((p) => {
    const card = document.createElement("div");
    card.className = "project-card";

    const tech = (p.technologies || [])
      .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
      .join("");

    const statusClass = "status-" + (p.status || "Planning").replace(/\s+/g, "");

    const links = [];
    if (p.githubUrl) links.push(`<a href="${p.githubUrl}" target="_blank" rel="noopener">GitHub</a>`);
    if (p.deployedUrl) links.push(`<a href="${p.deployedUrl}" target="_blank" rel="noopener">Live</a>`);

    card.innerHTML = `
      <span class="status ${statusClass}">${escapeHtml(p.status || "Planning")}</span>
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.description || "")}</p>
      <div class="tech-tags">${tech}</div>
      <div class="card-links">${links.join("")}</div>
      <div class="card-actions">
        <button class="btn btn-ghost btn-sm" data-edit="${p._id}">Edit</button>
        <button class="btn btn-danger btn-sm" data-delete="${p._id}">Delete</button>
      </div>
    `;

    // Attach data for the edit button
    card.querySelector("[data-edit]").addEventListener("click", () => openModal(p));
    card.querySelector("[data-delete]").addEventListener("click", () => deleteProject(p._id));

    list.appendChild(card);
  });
}

async function deleteProject(id) {
  if (!confirm("Delete this project? This cannot be undone.")) return;
  try {
    await api(`/projects/${id}`, { method: "DELETE" });
    toast("Project deleted");
    loadProjects();
  } catch (err) {
    toast(err.message, "error");
  }
}

// --- Modal handling ---
function openModal(project = null) {
  const form = $("projectForm");
  form.reset();
  if (project) {
    $("modalTitle").textContent = "Edit Project";
    form.id.value = project._id;
    form.title.value = project.title || "";
    form.description.value = project.description || "";
    form.technologies.value = (project.technologies || []).join(", ");
    form.githubUrl.value = project.githubUrl || "";
    form.deployedUrl.value = project.deployedUrl || "";
    form.status.value = project.status || "Planning";
  } else {
    $("modalTitle").textContent = "New Project";
    form.id.value = "";
  }
  $("modalOverlay").classList.remove("hidden");
}

function closeModal() {
  $("modalOverlay").classList.add("hidden");
}

$("newProjectBtn").addEventListener("click", () => openModal());
$("cancelModal").addEventListener("click", closeModal);
$("modalOverlay").addEventListener("click", (e) => {
  if (e.target === $("modalOverlay")) closeModal();
});

$("projectForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target;

  const payload = {
    title: f.title.value.trim(),
    description: f.description.value.trim(),
    technologies: f.technologies.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    githubUrl: f.githubUrl.value.trim(),
    deployedUrl: f.deployedUrl.value.trim(),
    status: f.status.value,
  };

  try {
    if (f.id.value) {
      await api(`/projects/${f.id.value}`, { method: "PUT", body: payload });
      toast("Project updated");
    } else {
      await api("/projects", { method: "POST", body: payload });
      toast("Project created");
    }
    closeModal();
    loadProjects();
  } catch (err) {
    toast(err.message, "error");
  }
});

// --- Small helper to avoid HTML injection in rendered content ---
function escapeHtml(str = "") {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// =============================================================
// Boot: show the right view based on saved token
// =============================================================
if (store.token) {
  showDashboard();
} else {
  showAuth();
}
