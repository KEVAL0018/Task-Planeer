# ⚡ TaskFlow – Modern SaaS Task Planner Web Application

[![Vercel Deployment](https://img.shields.io/badge/Vercel-Deployed-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-4f46e5?style=for-the-badge)](LICENSE)
[![Vanilla JS](https://img.shields.io/badge/Vanilla_JS-ES6+-f7df1e?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5 / CSS3](https://img.shields.io/badge/HTML5_&_CSS3-Responsive-e34f26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)

> **TaskFlow** is an enterprise-grade, modern, and responsive Task Planner and Productivity Dashboard built purely with **HTML5**, **CSS3**, and **Vanilla JavaScript (ES6+)**. Designed with SaaS aesthetic principles inspired by Linear, Asana, and ClickUp, TaskFlow empowers users to organize, prioritize, and track their daily workflow with zero backend dependencies.

---

## 🌟 Key Features

### 📊 Real-Time Productivity Dashboard
- **Dynamic Statistics Cards**: Live calculation of **Total Tasks**, **Active Tasks**, **Completed Tasks**, and **Completion Rate (%)**.
- **Progress Tracking**: Real-time visual progress bar with percentage badges and animated completions.
- **Dynamic Greetings & Live Date**: Real-time localized date display and contextual greetings (Morning / Afternoon / Evening).

### 🛠️ Complete CRUD Operations
- **Create**: Add new tasks with title, rich description, priority (High, Medium, Low), category, and due date.
- **Read**: Instant rendering from persistent storage on startup with high-fidelity demo sample data.
- **Update**: Edit any existing task details via a dedicated modal; instant completion toggle with custom animated checkmarks.
- **Delete**: Remove individual tasks with custom confirmation dialogs, or batch clear all completed tasks.

### 🔍 Advanced Filtering & Sorting
- **Multi-View Tabs**: Seamlessly switch between **All Tasks**, **Active**, **Completed**, **Due Today**, and **Upcoming**.
- **Instant Search**: Real-time debounced search matching task titles and descriptions.
- **Priority Filtering**: Filter by High, Medium, or Low priority.
- **Category Filtering**: Categorize tasks across **Work**, **Personal**, **Study**, **Finance**, **Health**, and **Other**.
- **Multi-Sort Capabilities**:
  - Due Date (Earliest / Latest)
  - Priority (Highest / Lowest)
  - Creation Date (Newest / Oldest)
  - Title (A - Z)
- **Active Filter Chips**: Visual tags for applied filters with one-click individual or global reset.

### 🛡️ Enterprise Security & Input Validation
- **XSS & Injection Prevention**: Strictly employs `textContent` and programmatic DOM construction—never renders unsafe raw `innerHTML` for user content.
- **Form Validation**: Strict client-side checks preventing empty titles, whitespace-only entries, and character limits (100 chars for title, 500 chars for description).
- **Live Character Counters**: Color-coded character counters giving instant feedback.

### 💾 Robust Browser Persistence
- **LocalStorage Synchronization**: Auto-syncs state after every mutation using safe `JSON.stringify()` and guarded `JSON.parse()`.
- **Fault-Tolerant Fallback**: Gracefully handles corrupt or empty storage states with default demonstration records.
- **Demo Mode**: Includes a "Load Demo Tasks" action to populate sample workflows anytime.

### 🎨 Modern SaaS UI / UX
- **Design System**: Built on a modern CSS design token architecture with the **Plus Jakarta Sans** typography and **Lucide Icons**.
- **Dual View Modes**: Switch between **List View** (compact row layout) and **Grid View** (card-based Kanban style).
- **Toast Notifications**: Non-intrusive floating toasts for success, error, info, and warning actions.
- **Fully Responsive**: Flawless responsive layout across 4K displays, laptops, tablets, and smartphones with mobile off-canvas drawer navigation.
- **Keyboard Shortcuts**: Power-user keyboard navigation support (`N` for new task, `/` to focus search, `Escape` to close modals).

---

## 💻 Technologies Used

| Technology | Purpose |
| :--- | :--- |
| **HTML5 (Semantic)** | Accessible document structure (`<aside>`, `<header>`, `<main>`, `<article>`, `<dialog>`) |
| **CSS3 (Modern Tokens)** | Flexbox, CSS Grid, Custom Properties, Glassmorphism backdrop-filters, media queries |
| **Vanilla JavaScript (ES6+)** | State management, DOM manipulation, Event delegation, LocalStorage, Arrow functions |
| **Google Fonts** | Plus Jakarta Sans for clean geometric typography |
| **Lucide Icons** | Modern SVG vector icons via official CDN |
| **Browser LocalStorage** | Client-side offline-first persistence |

---

## 📁 Project Structure

```
Task-Planner/
│
├── index.html              # Main HTML5 application file (Vercel root entry point)
│
├── css/
│   └── style.css           # Complete modular stylesheet & design system
│
├── js/
│   └── script.js           # Vanilla JavaScript application logic & state store
│
├── assets/
│   └── images/
│       ├── logo.svg        # TaskFlow vector brand identity
│       └── favicon.svg     # High-resolution vector favicon
│
└── README.md               # Complete project documentation
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
| :---: | :--- |
| <kbd>N</kbd> | Open **Create New Task** modal |
| <kbd>/</kbd> | Instantly focus and highlight the **Search** input |
| <kbd>Esc</kbd> | Close any open modal dialog or dismiss the mobile sidebar |
| <kbd>Enter</kbd> | Submit task form when focused on inputs |

---

## 🚀 How to Run Locally

Because TaskFlow is built with 100% native web standards, it requires **no node modules, build tools, or compilers**.

### Method 1: Direct Browser Launch
1. Clone or download this repository.
2. Double-click `index.html` or right-click and choose **Open with > Chrome / Edge / Firefox / Safari**.

### Method 2: Live Server (VS Code Extension)
1. Open the project folder in **Visual Studio Code**.
2. Install the **Live Server** extension (`ritwickdey.LiveServer`).
3. Right-click `index.html` and select **"Open with Live Server"**.
4. The application will launch at `http://127.0.0.1:5500`.

### Method 3: Python Built-in HTTP Server
In your terminal or PowerShell inside the project directory:
```bash
# Python 3.x
python -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

---

## 🌐 GitHub Deployment Instructions

Deploy TaskFlow on **GitHub Pages** in under 2 minutes:

1. **Initialize Git Repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: TaskFlow SaaS Task Planner"
   ```

2. **Push to GitHub**:
   ```bash
   git branch -M main
   git remote add origin https://github.com/<your-username>/task-planner.git
   git push -u origin main
   ```

3. **Enable GitHub Pages**:
   - Go to your repository on GitHub.
   - Navigate to **Settings** > **Pages** (under Code and automation).
   - Under **Build and deployment > Source**, select **Deploy from a branch**.
   - Under **Branch**, select `main` and `/ (root)`.
   - Click **Save**.
   - Your site will be live at `https://<your-username>.github.io/task-planner/`.

---

## ⚡ Vercel Deployment Instructions

TaskFlow is optimized for zero-configuration static deployment on **Vercel**:

### Option A: Via Vercel Web Dashboard (Recommended)
1. Push your repository to GitHub or GitLab.
2. Log in to [Vercel](https://vercel.com).
3. Click **"Add New..."** > **"Project"**.
4. Import your `task-planner` repository.
5. In the **Configure Project** screen:
   - **Framework Preset**: Select `Other`.
   - **Root Directory**: `./` (leave default).
   - **Build and Output Settings**: Leave completely blank (no build command needed).
6. Click **Deploy**.
7. Vercel will instantly generate a live production URL (e.g., `https://task-planner-xyz.vercel.app`).

### Option B: Via Vercel CLI
```bash
# Install Vercel CLI globally
npm i -g vercel

# Deploy directly from workspace root
vercel --prod
```

---

## 📸 Screenshots & UI Showcase

### 1. Productivity Dashboard Overview
*Crisp light theme dashboard displaying active metrics, completion progress bar, category filter pills, and task management list.*

### 2. Task Creation & Edit Modal
*Accessible modal featuring live character counters, priority selectors (Low, Medium, High), category badges, and validation alerts.*

### 3. Responsive Mobile View
*Smooth off-canvas navigation drawer, streamlined filter controls, and touch-optimized action buttons.*

---

## 📋 Compliance & Project Verification Checklist

- [x] **Add Task**: Validates input, saves to LocalStorage, dynamically renders card, updates stats.
- [x] **Edit Task**: Pre-populates form, updates state in real-time, displays confirmation toast.
- [x] **Delete Task**: Confirmation modal prevents accidental data loss.
- [x] **Complete Task**: Toggle checkbox triggers strike-through styling, sound-level visual cues, and stat recalculation.
- [x] **Filters**: All, Active, Completed, Due Today, and Upcoming tabs work seamlessly.
- [x] **Search**: Instant search across titles and descriptions with keyboard shortcut `/`.
- [x] **Priority Filters**: Quick filter by High, Medium, or Low.
- [x] **Category Filters**: Dedicated filtering across 6 distinct categories.
- [x] **Persistence**: Full data persistence across browser reloads via LocalStorage.
- [x] **XSS Defense**: `textContent` utilized exclusively for user-generated strings.
- [x] **Zero Dependencies**: Pure HTML5, CSS3, and Vanilla JavaScript (ES6+).
- [x] **Vercel Ready**: Static root `index.html` structure ready for instant deployment.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

**Developed with ❤️ for TaskFlow Task Planner.**
#   T a s k - P l a n e e r  
 