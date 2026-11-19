/**
 * ============================================================================
 * TASKFLOW - MODERN PRODUCTIVITY & TASK PLANNER
 * Pure Vanilla JavaScript (ES6+) Implementation
 * 
 * Features:
 * - State Management & Single Source of Truth
 * - Robust LocalStorage Persistence with Safe Parsing
 * - Complete CRUD Operations with Custom Modals
 * - Strict Input Validation & XSS Prevention (textContent)
 * - Multi-criteria Filtering (Status, Priority, Category, Search)
 * - Dynamic Real-time Sorting
 * - Reactive Statistics & Progress Calculations
 * - Toast Notification System
 * - Accessible Event Delegation & Keyboard Navigation
 * ============================================================================
 */

(function () {
  'use strict';

  // --------------------------------------------------------------------------
  // 1. CONSTANTS & INITIAL DATA
  // --------------------------------------------------------------------------
  const STORAGE_KEY = 'taskflow_tasks_v1';
  const VIEW_STORAGE_KEY = 'taskflow_view_mode';

  // Helper to format date string YYYY-MM-DD
  const getFormattedDateString = (offsetDays = 0) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // High quality default sample tasks for initial load and demo testing
  const SAMPLE_TASKS = [
    {
      id: 'task_sample_1',
      title: 'Finalize Q4 Product Roadmap & Feature Specs',
      description: 'Review cross-functional team feedback, prioritize high-impact SaaS workflows, and align sprint milestones.',
      priority: 'high',
      category: 'work',
      dueDate: getFormattedDateString(0), // Due Today
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      completedAt: null
    },
    {
      id: 'task_sample_2',
      title: 'Review System Architecture & Database Indexes',
      description: 'Analyze query performance logs, verify execution plans, and optimize indexing on task collections.',
      priority: 'high',
      category: 'work',
      dueDate: getFormattedDateString(1), // Tomorrow
      completed: false,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      completedAt: null
    },
    {
      id: 'task_sample_3',
      title: 'Complete 45-Minute Morning Cardiovascular Workout',
      description: 'Interval running session followed by 15 minutes of dynamic stretching and hydration.',
      priority: 'medium',
      category: 'health',
      dueDate: getFormattedDateString(0), // Due Today
      completed: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      completedAt: new Date(Date.now() - 3600000 * 4).toISOString()
    },
    {
      id: 'task_sample_4',
      title: 'Audit Monthly Cloud Subscriptions & Invoices',
      description: 'Verify billing statements for cloud hosting, DNS services, and developer licensing across departments.',
      priority: 'medium',
      category: 'finance',
      dueDate: getFormattedDateString(3), // In 3 days
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
      completedAt: null
    },
    {
      id: 'task_sample_5',
      title: 'Study TypeScript 5.4 Advanced Generics & Utility Types',
      description: 'Work through practical exercises on conditional typing, mapped types, and template literal type inference.',
      priority: 'low',
      category: 'study',
      dueDate: getFormattedDateString(5),
      completed: false,
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      completedAt: null
    },
    {
      id: 'task_sample_6',
      title: 'Organize Home Office Workspace & Cable Management',
      description: 'Clean desktop surface, mount power strips, and adjust monitor ergonomics.',
      priority: 'low',
      category: 'personal',
      dueDate: getFormattedDateString(-1), // Overdue
      completed: true,
      createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
      completedAt: new Date(Date.now() - 86400000 * 2).toISOString()
    }
  ];

  // --------------------------------------------------------------------------
  // 2. APPLICATION STATE
  // --------------------------------------------------------------------------
  const state = {
    tasks: [],
    filters: {
      view: 'all',          // 'all' | 'active' | 'completed' | 'today' | 'upcoming'
      priority: 'all',      // 'all' | 'high' | 'medium' | 'low'
      category: 'all',      // 'all' | 'work' | 'personal' | 'study' | 'finance' | 'health' | 'other'
      searchQuery: '',      // string
      sortBy: 'due-asc'     // 'due-asc' | 'due-desc' | 'priority-desc' | 'priority-asc' | 'created-desc' | 'created-asc' | 'title-asc'
    },
    viewMode: 'list',       // 'list' | 'grid'
    editingTaskId: null,
    deletingTaskId: null
  };

  // --------------------------------------------------------------------------
  // 3. DOM ELEMENT REFERENCES
  // --------------------------------------------------------------------------
  const DOM = {
    // Header & Navigation
    sidebar: document.getElementById('sidebar'),
    sidebarOverlay: document.getElementById('sidebarOverlay'),
    sidebarToggleBtn: document.getElementById('sidebarToggleBtn'),
    sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
    sidebarAddTaskBtn: document.getElementById('sidebarAddTaskBtn'),
    resetSampleDataBtn: document.getElementById('resetSampleDataBtn'),
    currentDateText: document.getElementById('currentDateText'),
    searchInput: document.getElementById('searchInput'),
    clearSearchBtn: document.getElementById('clearSearchBtn'),
    openAddTaskModalBtn: document.getElementById('openAddTaskModalBtn'),
    greetingText: document.getElementById('greetingText'),

    // Statistics Elements
    statTotal: document.getElementById('statTotal'),
    statActive: document.getElementById('statActive'),
    statCompleted: document.getElementById('statCompleted'),
    statRate: document.getElementById('statRate'),
    statMiniProgressBar: document.getElementById('statMiniProgressBar'),
    mainProgressBarFill: document.getElementById('mainProgressBarFill'),
    mainProgressBarAria: document.getElementById('mainProgressBarAria'),
    progressSummaryText: document.getElementById('progressSummaryText'),
    progressPercentageBadge: document.getElementById('progressPercentageBadge'),

    // Badges in Sidebar
    badgeAll: document.getElementById('badgeAll'),
    badgeActive: document.getElementById('badgeActive'),
    badgeCompleted: document.getElementById('badgeCompleted'),
    badgeToday: document.getElementById('badgeToday'),
    badgeUpcoming: document.getElementById('badgeUpcoming'),
    countWork: document.getElementById('countWork'),
    countPersonal: document.getElementById('countPersonal'),
    countStudy: document.getElementById('countStudy'),
    countFinance: document.getElementById('countFinance'),
    countHealth: document.getElementById('countHealth'),
    countOther: document.getElementById('countOther'),

    // Filter Controls
    filterPriority: document.getElementById('filterPriority'),
    filterCategory: document.getElementById('filterCategory'),
    sortBy: document.getElementById('sortBy'),
    viewListBtn: document.getElementById('viewListBtn'),
    viewGridBtn: document.getElementById('viewGridBtn'),
    clearCompletedBtn: document.getElementById('clearCompletedBtn'),
    activeFiltersBar: document.getElementById('activeFiltersBar'),
    activeFilterTags: document.getElementById('activeFilterTags'),
    resetAllFiltersBtn: document.getElementById('resetAllFiltersBtn'),

    // Task List Container & Header
    currentViewTitle: document.getElementById('currentViewTitle'),
    taskCountChip: document.getElementById('taskCountChip'),
    taskList: document.getElementById('taskList'),
    emptyState: document.getElementById('emptyState'),
    emptyStateTitle: document.getElementById('emptyStateTitle'),
    emptyStateDesc: document.getElementById('emptyStateDesc'),
    emptyStateActionBtn: document.getElementById('emptyStateActionBtn'),
    emptyStateResetFilterBtn: document.getElementById('emptyStateResetFilterBtn'),

    // Task Modal
    taskModal: document.getElementById('taskModal'),
    taskModalBackdrop: document.getElementById('taskModalBackdrop'),
    modalTitle: document.getElementById('modalTitle'),
    modalSubtitle: document.getElementById('modalSubtitle'),
    modalCloseBtn: document.getElementById('modalCloseBtn'),
    modalCancelBtn: document.getElementById('modalCancelBtn'),
    modalSubmitBtn: document.getElementById('modalSubmitBtn'),
    modalSubmitText: document.getElementById('modalSubmitText'),
    modalHeaderIcon: document.getElementById('modalHeaderIcon'),
    taskForm: document.getElementById('taskForm'),
    taskIdInput: document.getElementById('taskIdInput'),
    taskTitleInput: document.getElementById('taskTitleInput'),
    taskDescInput: document.getElementById('taskDescInput'),
    taskCategoryInput: document.getElementById('taskCategoryInput'),
    taskDueDateInput: document.getElementById('taskDueDateInput'),
    titleCharCount: document.getElementById('titleCharCount'),
    descCharCount: document.getElementById('descCharCount'),
    titleError: document.getElementById('titleError'),
    descError: document.getElementById('descError'),

    // Delete Confirmation Modal
    deleteModal: document.getElementById('deleteModal'),
    deleteModalBackdrop: document.getElementById('deleteModalBackdrop'),
    deleteTaskPreviewTitle: document.getElementById('deleteTaskPreviewTitle'),
    cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
    confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),

    // Clear Completed Modal
    clearCompletedModal: document.getElementById('clearCompletedModal'),
    clearCompletedModalBackdrop: document.getElementById('clearCompletedModalBackdrop'),
    clearCompletedCountChip: document.getElementById('clearCompletedCountChip'),
    cancelClearCompletedBtn: document.getElementById('cancelClearCompletedBtn'),
    confirmClearCompletedBtn: document.getElementById('confirmClearCompletedBtn'),

    // Toast Container
    toastContainer: document.getElementById('toastContainer')
  };

  // --------------------------------------------------------------------------
  // 4. LOCAL STORAGE MANAGEMENT
  // --------------------------------------------------------------------------
  const Storage = {
    loadTasks: () => {
      try {
        const serialized = localStorage.getItem(STORAGE_KEY);
        if (!serialized) {
          // Initialize with demo sample tasks on first launch
          Storage.saveTasks(SAMPLE_TASKS);
          return [...SAMPLE_TASKS];
        }
        const parsed = JSON.parse(serialized);
        if (Array.isArray(parsed)) {
          return parsed;
        }
        return [...SAMPLE_TASKS];
      } catch (err) {
        console.error('Error loading tasks from LocalStorage, falling back to samples:', err);
        return [...SAMPLE_TASKS];
      }
    },

    saveTasks: (tasks) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
      } catch (err) {
        console.error('Failed to save tasks to LocalStorage:', err);
        Toast.show('Storage quota exceeded or unavailable', 'error');
      }
    },

    loadViewMode: () => {
      try {
        return localStorage.getItem(VIEW_STORAGE_KEY) || 'list';
      } catch {
        return 'list';
      }
    },

    saveViewMode: (mode) => {
      try {
        localStorage.setItem(VIEW_STORAGE_KEY, mode);
      } catch (e) {
        console.warn('Could not save view mode preference:', e);
      }
    }
  };

  // --------------------------------------------------------------------------
  // 5. TOAST NOTIFICATION SYSTEM
  // --------------------------------------------------------------------------
  const Toast = {
    show: (message, type = 'success', duration = 3500) => {
      if (!DOM.toastContainer) return;

      const toast = document.createElement('div');
      toast.className = `toast toast-${type}`;
      toast.setAttribute('role', 'alert');

      // Determine icon based on type
      let iconName = 'check-circle';
      if (type === 'error') iconName = 'alert-circle';
      if (type === 'warning') iconName = 'alert-triangle';
      if (type === 'info') iconName = 'info';

      // Assemble content safely
      const icon = document.createElement('i');
      icon.setAttribute('data-lucide', iconName);
      icon.className = 'toast-icon';

      const msgSpan = document.createElement('span');
      msgSpan.className = 'toast-message';
      msgSpan.textContent = message; // textContent prevents injection

      const closeBtn = document.createElement('button');
      closeBtn.className = 'toast-close-btn';
      closeBtn.setAttribute('aria-label', 'Dismiss notification');
      closeBtn.innerHTML = '<i data-lucide="x"></i>';

      toast.appendChild(icon);
      toast.appendChild(msgSpan);
      toast.appendChild(closeBtn);

      DOM.toastContainer.appendChild(toast);

      // Initialize icons in toast
      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: toast });
      }

      // Animate in
      requestAnimationFrame(() => {
        toast.classList.add('show');
      });

      // Dismiss handler
      let timeoutId = null;
      const dismiss = () => {
        if (timeoutId) clearTimeout(timeoutId);
        toast.classList.remove('show');
        toast.addEventListener('transitionend', () => {
          if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
          }
        }, { once: true });
      };

      closeBtn.addEventListener('click', dismiss);
      timeoutId = setTimeout(dismiss, duration);
    }
  };

  // --------------------------------------------------------------------------
  // 6. DATE & TIME UTILITIES
  // --------------------------------------------------------------------------
  const DateUtils = {
    getTodayStr: () => {
      const now = new Date();
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    },

    formatDisplayDate: (isoStringOrDate) => {
      if (!isoStringOrDate) return 'No due date';
      
      // Parse YYYY-MM-DD
      const [year, month, day] = isoStringOrDate.split('-').map(Number);
      if (!year || !month || !day) return isoStringOrDate;

      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
      });
    },

    getRelativeStatus: (dueDateStr) => {
      if (!dueDateStr) return { text: 'No due date', status: 'none', isOverdue: false };

      const todayStr = DateUtils.getTodayStr();
      
      if (dueDateStr === todayStr) {
        return { text: 'Due Today', status: 'today', isOverdue: false };
      }

      const today = new Date(todayStr);
      const due = new Date(dueDateStr);
      const diffTime = due.getTime() - today.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        return { text: 'Due Tomorrow', status: 'future', isOverdue: false };
      }
      if (diffDays > 1) {
        return { text: `Due in ${diffDays} days`, status: 'future', isOverdue: false };
      }
      if (diffDays === -1) {
        return { text: 'Overdue (Yesterday)', status: 'overdue', isOverdue: true };
      }
      return { text: `Overdue by ${Math.abs(diffDays)} days`, status: 'overdue', isOverdue: true };
    },

    initHeaderClock: () => {
      const updateClock = () => {
        const now = new Date();
        const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
        if (DOM.currentDateText) {
          DOM.currentDateText.textContent = now.toLocaleDateString('en-US', options);
        }

        // Dynamic greeting based on hour
        const hour = now.getHours();
        let greeting = 'Good evening';
        if (hour < 12) greeting = 'Good morning';
        else if (hour < 18) greeting = 'Good afternoon';
        
        if (DOM.greetingText) {
          DOM.greetingText.textContent = `${greeting}, Alex! 👋`;
        }
      };

      updateClock();
      setInterval(updateClock, 60000);
    }
  };

  // --------------------------------------------------------------------------
  // 7. INPUT SANITIZATION & VALIDATION
  // --------------------------------------------------------------------------
  const Validation = {
    sanitize: (str) => {
      if (typeof str !== 'string') return '';
      return str.trim();
    },

    validateTask: (title, description) => {
      let isValid = true;
      const errors = { title: '', desc: '' };

      const cleanTitle = Validation.sanitize(title);
      if (!cleanTitle) {
        errors.title = 'Task title is required and cannot be empty.';
        isValid = false;
      } else if (cleanTitle.length > 100) {
        errors.title = 'Title must be 100 characters or fewer.';
        isValid = false;
      }

      if (description && description.length > 500) {
        errors.desc = 'Description must be 500 characters or fewer.';
        isValid = false;
      }

      return { isValid, errors, cleanTitle };
    },

    updateCharCounters: () => {
      if (DOM.titleCharCount && DOM.taskTitleInput) {
        const len = DOM.taskTitleInput.value.length;
        DOM.titleCharCount.textContent = `${len} / 100`;
        DOM.titleCharCount.style.color = len > 90 ? '#ef4444' : 'var(--slate-400)';
      }

      if (DOM.descCharCount && DOM.taskDescInput) {
        const len = DOM.taskDescInput.value.length;
        DOM.descCharCount.textContent = `${len} / 500`;
        DOM.descCharCount.style.color = len > 450 ? '#ef4444' : 'var(--slate-400)';
      }
    },

    clearErrors: () => {
      if (DOM.titleError) DOM.titleError.textContent = '';
      if (DOM.descError) DOM.descError.textContent = '';
      if (DOM.taskTitleInput) DOM.taskTitleInput.classList.remove('has-error');
      if (DOM.taskDescInput) DOM.taskDescInput.classList.remove('has-error');
    }
  };

  // --------------------------------------------------------------------------
  // 8. CRUD CORE OPERATIONS
  // --------------------------------------------------------------------------
  const TaskManager = {
    createTask: (title, description, priority, category, dueDate) => {
      const newTask = {
        id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8),
        title: title,
        description: description || '',
        priority: priority || 'medium',
        category: category || 'work',
        dueDate: dueDate || '',
        completed: false,
        createdAt: new Date().toISOString(),
        completedAt: null
      };

      state.tasks.unshift(newTask);
      Storage.saveTasks(state.tasks);
      render();
      Toast.show('Task created successfully!', 'success');
      return newTask;
    },

    updateTask: (id, updates) => {
      const taskIndex = state.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return;

      state.tasks[taskIndex] = {
        ...state.tasks[taskIndex],
        ...updates
      };

      Storage.saveTasks(state.tasks);
      render();
      Toast.show('Task updated successfully!', 'success');
    },

    toggleTaskCompletion: (id) => {
      const task = state.tasks.find(t => t.id === id);
      if (!task) return;

      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;

      Storage.saveTasks(state.tasks);
      render();

      if (task.completed) {
        Toast.show(`Task marked as completed! 🎉`, 'success');
      } else {
        Toast.show('Task reopened', 'info');
      }
    },

    deleteTask: (id) => {
      const taskIndex = state.tasks.findIndex(t => t.id === id);
      if (taskIndex === -1) return;

      const deletedTitle = state.tasks[taskIndex].title;
      state.tasks.splice(taskIndex, 1);

      Storage.saveTasks(state.tasks);
      render();
      Toast.show(`Deleted "${deletedTitle.slice(0, 30)}${deletedTitle.length > 30 ? '...' : ''}"`, 'info');
    },

    clearAllCompleted: () => {
      const originalCount = state.tasks.length;
      state.tasks = state.tasks.filter(t => !t.completed);
      const deletedCount = originalCount - state.tasks.length;

      Storage.saveTasks(state.tasks);
      render();
      Toast.show(`Cleared ${deletedCount} completed task${deletedCount === 1 ? '' : 's'}`, 'info');
    },

    resetToSampleData: () => {
      state.tasks = [...SAMPLE_TASKS];
      Storage.saveTasks(state.tasks);
      render();
      Toast.show('Reset demo tasks successfully!', 'success');
    }
  };

  // --------------------------------------------------------------------------
  // 9. FILTERING, SEARCHING & SORTING LOGIC
  // --------------------------------------------------------------------------
  const getFilteredAndSortedTasks = () => {
    const todayStr = DateUtils.getTodayStr();
    const query = state.filters.searchQuery.toLowerCase().trim();

    // 1. Filter
    let result = state.tasks.filter(task => {
      // View / Status Filter
      if (state.filters.view === 'active' && task.completed) return false;
      if (state.filters.view === 'completed' && !task.completed) return false;
      if (state.filters.view === 'today') {
        if (task.dueDate !== todayStr) return false;
      }
      if (state.filters.view === 'upcoming') {
        if (!task.dueDate || task.dueDate <= todayStr) return false;
      }

      // Priority Filter
      if (state.filters.priority !== 'all' && task.priority !== state.filters.priority) {
        return false;
      }

      // Category Filter
      if (state.filters.category !== 'all' && task.category !== state.filters.category) {
        return false;
      }

      // Search Query Filter
      if (query) {
        const titleMatch = task.title.toLowerCase().includes(query);
        const descMatch = (task.description || '').toLowerCase().includes(query);
        if (!titleMatch && !descMatch) return false;
      }

      return true;
    });

    // 2. Sort
    const priorityWeight = { high: 3, medium: 2, low: 1 };

    result.sort((a, b) => {
      switch (state.filters.sortBy) {
        case 'due-asc': {
          // Tasks without due date come last
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }
        case 'due-desc': {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return b.dueDate.localeCompare(a.dueDate);
        }
        case 'priority-desc': {
          const diff = (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
          return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
        }
        case 'priority-asc': {
          const diff = (priorityWeight[a.priority] || 0) - (priorityWeight[b.priority] || 0);
          return diff !== 0 ? diff : b.createdAt.localeCompare(a.createdAt);
        }
        case 'created-desc': {
          return b.createdAt.localeCompare(a.createdAt);
        }
        case 'created-asc': {
          return a.createdAt.localeCompare(b.createdAt);
        }
        case 'title-asc': {
          return a.title.localeCompare(b.title);
        }
        default:
          return 0;
      }
    });

    return result;
  };

  // --------------------------------------------------------------------------
  // 10. STATISTICS & COUNTERS CALCULATION
  // --------------------------------------------------------------------------
  const updateStatistics = () => {
    const total = state.tasks.length;
    const completed = state.tasks.filter(t => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;

    // Today & Upcoming counts
    const todayStr = DateUtils.getTodayStr();
    const todayCount = state.tasks.filter(t => t.dueDate === todayStr).length;
    const upcomingCount = state.tasks.filter(t => t.dueDate && t.dueDate > todayStr).length;

    // Category counts
    const countsByCategory = {
      work: 0,
      personal: 0,
      study: 0,
      finance: 0,
      health: 0,
      other: 0
    };

    state.tasks.forEach(t => {
      if (countsByCategory[t.category] !== undefined) {
        countsByCategory[t.category]++;
      }
    });

    // Update Dashboard Stat Cards
    if (DOM.statTotal) DOM.statTotal.textContent = total;
    if (DOM.statActive) DOM.statActive.textContent = active;
    if (DOM.statCompleted) DOM.statCompleted.textContent = completed;
    if (DOM.statRate) DOM.statRate.textContent = `${rate}%`;

    // Progress Bars
    if (DOM.statMiniProgressBar) {
      DOM.statMiniProgressBar.style.width = `${rate}%`;
    }
    if (DOM.mainProgressBarFill) {
      DOM.mainProgressBarFill.style.width = `${rate}%`;
    }
    if (DOM.mainProgressBarAria) {
      DOM.mainProgressBarAria.setAttribute('aria-valuenow', rate);
    }
    if (DOM.progressSummaryText) {
      DOM.progressSummaryText.textContent = `${completed} of ${total} tasks completed`;
    }
    if (DOM.progressPercentageBadge) {
      DOM.progressPercentageBadge.textContent = `${rate}% Done`;
    }

    // Sidebar Badges
    if (DOM.badgeAll) DOM.badgeAll.textContent = total;
    if (DOM.badgeActive) DOM.badgeActive.textContent = active;
    if (DOM.badgeCompleted) DOM.badgeCompleted.textContent = completed;
    if (DOM.badgeToday) DOM.badgeToday.textContent = todayCount;
    if (DOM.badgeUpcoming) DOM.badgeUpcoming.textContent = upcomingCount;

    // Sidebar Category Badges
    if (DOM.countWork) DOM.countWork.textContent = countsByCategory.work;
    if (DOM.countPersonal) DOM.countPersonal.textContent = countsByCategory.personal;
    if (DOM.countStudy) DOM.countStudy.textContent = countsByCategory.study;
    if (DOM.countFinance) DOM.countFinance.textContent = countsByCategory.finance;
    if (DOM.countHealth) DOM.countHealth.textContent = countsByCategory.health;
    if (DOM.countOther) DOM.countOther.textContent = countsByCategory.other;

    // Enable / Disable Clear Completed button
    if (DOM.clearCompletedBtn) {
      DOM.clearCompletedBtn.disabled = completed === 0;
      DOM.clearCompletedBtn.style.opacity = completed === 0 ? '0.5' : '1';
      DOM.clearCompletedBtn.style.cursor = completed === 0 ? 'not-allowed' : 'pointer';
    }
  };

  // --------------------------------------------------------------------------
  // 11. DOM RENDERING ENGINE (SAFE & ACCESSIBLE)
  // --------------------------------------------------------------------------
  const renderTaskCard = (task) => {
    const card = document.createElement('article');
    card.className = `task-card priority-${task.priority}-card${task.completed ? ' is-completed' : ''}`;
    card.setAttribute('role', 'listitem');
    card.dataset.id = task.id;

    // 1. Left Checkbox Column
    const checkboxCol = document.createElement('div');
    checkboxCol.className = 'task-checkbox-col';

    const checkboxLabel = document.createElement('label');
    checkboxLabel.className = 'task-checkbox-label';
    checkboxLabel.setAttribute('title', task.completed ? 'Mark as incomplete' : 'Mark as complete');

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = task.completed;
    checkbox.dataset.action = 'toggle-complete';
    checkbox.dataset.id = task.id;
    checkbox.setAttribute('aria-label', `Mark task "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`);

    const customCheckmark = document.createElement('div');
    customCheckmark.className = 'custom-checkmark';
    // Clean SVG checkmark
    customCheckmark.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
    `;

    checkboxLabel.appendChild(checkbox);
    checkboxLabel.appendChild(customCheckmark);
    checkboxCol.appendChild(checkboxLabel);

    // 2. Center Content Column
    const bodyCol = document.createElement('div');
    bodyCol.className = 'task-body-col';

    const titleRow = document.createElement('div');
    titleRow.className = 'task-header-row';

    const titleEl = document.createElement('h3');
    titleEl.className = 'task-title';
    titleEl.textContent = task.title; // STRICT: textContent prevents HTML injection / XSS

    titleRow.appendChild(titleEl);
    bodyCol.appendChild(titleRow);

    // Description (if available)
    if (task.description && task.description.trim() !== '') {
      const descEl = document.createElement('p');
      descEl.className = 'task-description';
      descEl.textContent = task.description; // STRICT: textContent prevents XSS
      bodyCol.appendChild(descEl);
    }

    // Metadata Row: Badges & Due Date
    const metaRow = document.createElement('div');
    metaRow.className = 'task-meta-row';

    // Priority Badge
    const priorityBadge = document.createElement('span');
    priorityBadge.className = `badge badge-priority-${task.priority}`;
    priorityBadge.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    metaRow.appendChild(priorityBadge);

    // Category Badge
    const categoryBadge = document.createElement('span');
    categoryBadge.className = `badge badge-category badge-category-${task.category}`;
    categoryBadge.textContent = task.category.charAt(0).toUpperCase() + task.category.slice(1);
    metaRow.appendChild(categoryBadge);

    // Due Date Badge
    if (task.dueDate) {
      const dateInfo = DateUtils.getRelativeStatus(task.dueDate);
      const dueDateBadge = document.createElement('span');
      dueDateBadge.className = `badge-due-date ${dateInfo.isOverdue && !task.completed ? 'is-overdue' : (dateInfo.status === 'today' && !task.completed ? 'is-today' : 'is-future')}`;
      
      const calendarIcon = document.createElement('i');
      calendarIcon.setAttribute('data-lucide', dateInfo.isOverdue && !task.completed ? 'alert-circle' : 'calendar');
      
      const dateText = document.createElement('span');
      dateText.textContent = `${dateInfo.text} (${DateUtils.formatDisplayDate(task.dueDate)})`;

      dueDateBadge.appendChild(calendarIcon);
      dueDateBadge.appendChild(dateText);
      metaRow.appendChild(dueDateBadge);
    }

    bodyCol.appendChild(metaRow);

    // 3. Right Actions Column (Edit, Delete)
    const actionsCol = document.createElement('div');
    actionsCol.className = 'task-actions-col';

    // Edit Button
    const editBtn = document.createElement('button');
    editBtn.className = 'action-btn action-btn-edit';
    editBtn.dataset.action = 'edit-task';
    editBtn.dataset.id = task.id;
    editBtn.setAttribute('title', 'Edit task');
    editBtn.setAttribute('aria-label', `Edit task: ${task.title}`);
    editBtn.innerHTML = '<i data-lucide="pencil"></i>';

    // Delete Button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'action-btn action-btn-delete';
    deleteBtn.dataset.action = 'delete-task';
    deleteBtn.dataset.id = task.id;
    deleteBtn.setAttribute('title', 'Delete task');
    deleteBtn.setAttribute('aria-label', `Delete task: ${task.title}`);
    deleteBtn.innerHTML = '<i data-lucide="trash-2"></i>';

    actionsCol.appendChild(editBtn);
    actionsCol.appendChild(deleteBtn);

    // Assemble Card
    card.appendChild(checkboxCol);
    card.appendChild(bodyCol);
    card.appendChild(actionsCol);

    return card;
  };

  const updateActiveFilterPills = () => {
    if (!DOM.activeFiltersBar || !DOM.activeFilterTags) return;

    const tags = [];

    if (state.filters.priority !== 'all') {
      tags.push({ key: 'priority', label: `Priority: ${state.filters.priority}` });
    }
    if (state.filters.category !== 'all') {
      tags.push({ key: 'category', label: `Category: ${state.filters.category}` });
    }
    if (state.filters.searchQuery) {
      tags.push({ key: 'search', label: `Search: "${state.filters.searchQuery}"` });
    }

    if (tags.length === 0) {
      DOM.activeFiltersBar.classList.add('hidden');
      DOM.activeFilterTags.innerHTML = '';
      return;
    }

    DOM.activeFiltersBar.classList.remove('hidden');
    DOM.activeFilterTags.innerHTML = '';

    tags.forEach(item => {
      const chip = document.createElement('span');
      chip.className = 'filter-tag-chip';
      chip.textContent = item.label;

      const removeBtn = document.createElement('span');
      removeBtn.className = 'filter-tag-close';
      removeBtn.setAttribute('role', 'button');
      removeBtn.setAttribute('tabindex', '0');
      removeBtn.setAttribute('aria-label', `Remove filter ${item.label}`);
      removeBtn.innerHTML = '<i data-lucide="x"></i>';

      removeBtn.addEventListener('click', () => {
        if (item.key === 'priority') {
          state.filters.priority = 'all';
          DOM.filterPriority.value = 'all';
          updateSidebarPriorityPillSelection();
        } else if (item.key === 'category') {
          state.filters.category = 'all';
          DOM.filterCategory.value = 'all';
          updateSidebarCategoryPillSelection();
        } else if (item.key === 'search') {
          state.filters.searchQuery = '';
          DOM.searchInput.value = '';
          DOM.clearSearchBtn.classList.add('hidden');
        }
        render();
      });

      chip.appendChild(removeBtn);
      DOM.activeFilterTags.appendChild(chip);
    });
  };

  const updateSidebarViewSelection = () => {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
      const view = item.dataset.view;
      if (view === state.filters.view) {
        item.classList.add('active');
        item.setAttribute('aria-current', 'page');
      } else {
        item.classList.remove('active');
        item.removeAttribute('aria-current');
      }
    });

    // Also update current view title in header info
    const viewTitles = {
      all: 'All Tasks',
      active: 'Active Tasks',
      completed: 'Completed Tasks',
      today: "Today's Tasks",
      upcoming: 'Upcoming Tasks'
    };
    if (DOM.currentViewTitle) {
      DOM.currentViewTitle.textContent = viewTitles[state.filters.view] || 'All Tasks';
    }

    // Sync tab buttons
    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach(tab => {
      const tabView = tab.dataset.tab;
      if (tabView === state.filters.view) {
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
      } else {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
      }
    });
  };

  const updateSidebarCategoryPillSelection = () => {
    const pills = document.querySelectorAll('.cat-pill');
    pills.forEach(p => {
      if (p.dataset.category === state.filters.category) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    if (DOM.filterCategory) {
      DOM.filterCategory.value = state.filters.category;
    }
  };

  const updateSidebarPriorityPillSelection = () => {
    const pills = document.querySelectorAll('.priority-pill');
    pills.forEach(p => {
      if (p.dataset.priority === state.filters.priority) {
        p.classList.add('active');
      } else {
        p.classList.remove('active');
      }
    });
    if (DOM.filterPriority) {
      DOM.filterPriority.value = state.filters.priority;
    }
  };

  const render = () => {
    // 1. Calculate & update stats
    updateStatistics();

    // 2. Filter & sort
    const tasksToDisplay = getFilteredAndSortedTasks();

    // 3. Update counter chip
    if (DOM.taskCountChip) {
      DOM.taskCountChip.textContent = `${tasksToDisplay.length} task${tasksToDisplay.length === 1 ? '' : 's'}`;
    }

    // 4. Update Active Filter Badges
    updateActiveFilterPills();
    updateSidebarViewSelection();

    // 5. Render Tasks or Empty State
    if (!DOM.taskList || !DOM.emptyState) return;

    // Apply view mode (list or grid)
    if (state.viewMode === 'grid') {
      DOM.taskList.classList.add('task-grid-mode');
      DOM.viewGridBtn.classList.add('active');
      DOM.viewListBtn.classList.remove('active');
    } else {
      DOM.taskList.classList.remove('task-grid-mode');
      DOM.viewListBtn.classList.add('active');
      DOM.viewGridBtn.classList.remove('active');
    }

    DOM.taskList.innerHTML = '';

    if (tasksToDisplay.length === 0) {
      DOM.taskList.classList.add('hidden');
      DOM.emptyState.classList.remove('hidden');

      // Adjust empty state message based on circumstances
      if (state.tasks.length === 0) {
        DOM.emptyStateTitle.textContent = 'No tasks in your planner yet';
        DOM.emptyStateDesc.textContent = 'Get started by creating your first task or load demo tasks to test features.';
        DOM.emptyStateActionBtn.classList.remove('hidden');
        DOM.emptyStateResetFilterBtn.classList.add('hidden');
      } else {
        DOM.emptyStateTitle.textContent = 'No tasks match your filters';
        DOM.emptyStateDesc.textContent = 'Try adjusting your search query, priority, or category filters.';
        DOM.emptyStateActionBtn.classList.add('hidden');
        DOM.emptyStateResetFilterBtn.classList.remove('hidden');
      }
    } else {
      DOM.emptyState.classList.add('hidden');
      DOM.taskList.classList.remove('hidden');

      const fragment = document.createDocumentFragment();
      tasksToDisplay.forEach(task => {
        fragment.appendChild(renderTaskCard(task));
      });
      DOM.taskList.appendChild(fragment);
    }

    // Re-initialize Lucide Icons across all rendered elements
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  // --------------------------------------------------------------------------
  // 12. MODAL CONTROLS & MANAGEMENT
  // --------------------------------------------------------------------------
  const Modal = {
    openTaskModal: (taskIdToEdit = null) => {
      Validation.clearErrors();
      state.editingTaskId = taskIdToEdit;

      if (taskIdToEdit) {
        // Edit mode
        const task = state.tasks.find(t => t.id === taskIdToEdit);
        if (!task) return;

        DOM.modalTitle.textContent = 'Edit Task';
        DOM.modalSubtitle.textContent = 'Update your task details and milestones.';
        DOM.modalSubmitText.textContent = 'Save Changes';
        DOM.taskIdInput.value = task.id;
        DOM.taskTitleInput.value = task.title;
        DOM.taskDescInput.value = task.description || '';
        DOM.taskCategoryInput.value = task.category || 'work';
        DOM.taskDueDateInput.value = task.dueDate || '';

        // Select priority radio
        const priorityRadio = document.querySelector(`input[name="taskPriority"][value="${task.priority}"]`);
        if (priorityRadio) priorityRadio.checked = true;

        if (DOM.modalHeaderIcon) {
          DOM.modalHeaderIcon.setAttribute('data-lucide', 'pencil');
        }
      } else {
        // Create mode
        DOM.modalTitle.textContent = 'Create New Task';
        DOM.modalSubtitle.textContent = 'Fill in the details to plan and track your task.';
        DOM.modalSubmitText.textContent = 'Create Task';
        DOM.taskForm.reset();
        DOM.taskIdInput.value = '';

        // Set default priority
        const defaultPriority = document.getElementById('priorityMedium');
        if (defaultPriority) defaultPriority.checked = true;

        if (DOM.modalHeaderIcon) {
          DOM.modalHeaderIcon.setAttribute('data-lucide', 'plus');
        }
      }

      Validation.updateCharCounters();

      DOM.taskModal.classList.add('is-open');
      DOM.taskModal.setAttribute('aria-hidden', 'false');
      
      // Auto-focus title input
      setTimeout(() => {
        DOM.taskTitleInput.focus();
      }, 50);

      if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons({ root: DOM.taskModal });
      }
    },

    closeTaskModal: () => {
      DOM.taskModal.classList.remove('is-open');
      DOM.taskModal.setAttribute('aria-hidden', 'true');
      state.editingTaskId = null;
      Validation.clearErrors();
    },

    openDeleteModal: (taskId) => {
      const task = state.tasks.find(t => t.id === taskId);
      if (!task) return;

      state.deletingTaskId = taskId;
      DOM.deleteTaskPreviewTitle.textContent = task.title;

      DOM.deleteModal.classList.add('is-open');
      DOM.deleteModal.setAttribute('aria-hidden', 'false');
      DOM.confirmDeleteBtn.focus();
    },

    closeDeleteModal: () => {
      DOM.deleteModal.classList.remove('is-open');
      DOM.deleteModal.setAttribute('aria-hidden', 'true');
      state.deletingTaskId = null;
    },

    openClearCompletedModal: () => {
      const completedCount = state.tasks.filter(t => t.completed).length;
      if (completedCount === 0) {
        Toast.show('No completed tasks to clear.', 'info');
        return;
      }

      DOM.clearCompletedCountChip.textContent = `${completedCount} completed task${completedCount === 1 ? '' : 's'} will be deleted`;
      DOM.clearCompletedModal.classList.add('is-open');
      DOM.clearCompletedModal.setAttribute('aria-hidden', 'false');
      DOM.confirmClearCompletedBtn.focus();
    },

    closeClearCompletedModal: () => {
      DOM.clearCompletedModal.classList.remove('is-open');
      DOM.clearCompletedModal.setAttribute('aria-hidden', 'true');
    }
  };

  // --------------------------------------------------------------------------
  // 13. EVENT DELEGATION & LISTENERS
  // --------------------------------------------------------------------------
  const setupEventListeners = () => {
    
    // --- 1. Task List Event Delegation ---
    DOM.taskList.addEventListener('click', (e) => {
      // Toggle complete checkbox click
      const toggleTarget = e.target.closest('[data-action="toggle-complete"]');
      if (toggleTarget) {
        const id = toggleTarget.dataset.id;
        if (id) TaskManager.toggleTaskCompletion(id);
        return;
      }

      // Edit Task button click
      const editBtn = e.target.closest('[data-action="edit-task"]');
      if (editBtn) {
        const id = editBtn.dataset.id;
        if (id) Modal.openTaskModal(id);
        return;
      }

      // Delete Task button click
      const deleteBtn = e.target.closest('[data-action="delete-task"]');
      if (deleteBtn) {
        const id = deleteBtn.dataset.id;
        if (id) Modal.openDeleteModal(id);
        return;
      }
    });

    // --- 2. Add / Edit Task Form Submission & Input Validation ---
    DOM.taskForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const rawTitle = DOM.taskTitleInput.value;
      const rawDesc = DOM.taskDescInput.value;
      const category = DOM.taskCategoryInput.value;
      const dueDate = DOM.taskDueDateInput.value;

      const priorityChecked = document.querySelector('input[name="taskPriority"]:checked');
      const priority = priorityChecked ? priorityChecked.value : 'medium';

      const validation = Validation.validateTask(rawTitle, rawDesc);

      if (!validation.isValid) {
        if (validation.errors.title) {
          DOM.titleError.textContent = validation.errors.title;
          DOM.taskTitleInput.classList.add('has-error');
          DOM.taskTitleInput.focus();
        }
        if (validation.errors.desc) {
          DOM.descError.textContent = validation.errors.desc;
          DOM.taskDescInput.classList.add('has-error');
        }
        return;
      }

      // Valid: Execute Create or Update
      if (state.editingTaskId) {
        TaskManager.updateTask(state.editingTaskId, {
          title: validation.cleanTitle,
          description: Validation.sanitize(rawDesc),
          category: category,
          priority: priority,
          dueDate: dueDate
        });
      } else {
        TaskManager.createTask(
          validation.cleanTitle,
          Validation.sanitize(rawDesc),
          priority,
          category,
          dueDate
        );
      }

      Modal.closeTaskModal();
    });

    // Real-time validation clearing & char count
    DOM.taskTitleInput.addEventListener('input', () => {
      Validation.updateCharCounters();
      if (DOM.taskTitleInput.value.trim().length > 0) {
        DOM.titleError.textContent = '';
        DOM.taskTitleInput.classList.remove('has-error');
      }
    });

    DOM.taskDescInput.addEventListener('input', () => {
      Validation.updateCharCounters();
      if (DOM.taskDescInput.value.length <= 500) {
        DOM.descError.textContent = '';
        DOM.taskDescInput.classList.remove('has-error');
      }
    });

    // --- 3. Modal Opening & Closing Triggers ---
    DOM.openAddTaskModalBtn.addEventListener('click', () => Modal.openTaskModal());
    if (DOM.sidebarAddTaskBtn) DOM.sidebarAddTaskBtn.addEventListener('click', () => Modal.openTaskModal());
    if (DOM.emptyStateActionBtn) DOM.emptyStateActionBtn.addEventListener('click', () => Modal.openTaskModal());

    DOM.modalCloseBtn.addEventListener('click', Modal.closeTaskModal);
    DOM.modalCancelBtn.addEventListener('click', Modal.closeTaskModal);
    DOM.taskModalBackdrop.addEventListener('click', Modal.closeTaskModal);

    // Delete Modal
    DOM.cancelDeleteBtn.addEventListener('click', Modal.closeDeleteModal);
    DOM.deleteModalBackdrop.addEventListener('click', Modal.closeDeleteModal);
    DOM.confirmDeleteBtn.addEventListener('click', () => {
      if (state.deletingTaskId) {
        TaskManager.deleteTask(state.deletingTaskId);
        Modal.closeDeleteModal();
      }
    });

    // Clear Completed Modal
    DOM.clearCompletedBtn.addEventListener('click', Modal.openClearCompletedModal);
    DOM.cancelClearCompletedBtn.addEventListener('click', Modal.closeClearCompletedModal);
    DOM.clearCompletedModalBackdrop.addEventListener('click', Modal.closeClearCompletedModal);
    DOM.confirmClearCompletedBtn.addEventListener('click', () => {
      TaskManager.clearAllCompleted();
      Modal.closeClearCompletedModal();
    });

    // Reset Sample Data
    DOM.resetSampleDataBtn.addEventListener('click', () => {
      if (confirm('Load sample tasks? This will restore the default demonstration data.')) {
        TaskManager.resetToSampleData();
      }
    });

    // Empty state reset filter button
    DOM.emptyStateResetFilterBtn.addEventListener('click', () => {
      resetAllFilters();
    });

    // --- 4. Search Bar Handling ---
    DOM.searchInput.addEventListener('input', (e) => {
      state.filters.searchQuery = e.target.value;
      if (state.filters.searchQuery.length > 0) {
        DOM.clearSearchBtn.classList.remove('hidden');
      } else {
        DOM.clearSearchBtn.classList.add('hidden');
      }
      render();
    });

    DOM.clearSearchBtn.addEventListener('click', () => {
      DOM.searchInput.value = '';
      state.filters.searchQuery = '';
      DOM.clearSearchBtn.classList.add('hidden');
      DOM.searchInput.focus();
      render();
    });

    // --- 5. Navigation Views (Sidebar & Tabs) ---
    document.querySelector('.nav-list').addEventListener('click', (e) => {
      const navItem = e.target.closest('.nav-item');
      if (!navItem) return;

      const view = navItem.dataset.view;
      if (view) {
        state.filters.view = view;
        render();
        closeMobileSidebar();
      }
    });

    document.querySelector('.filter-tabs').addEventListener('click', (e) => {
      const tab = e.target.closest('.filter-tab');
      if (!tab) return;

      const tabView = tab.dataset.tab;
      if (tabView) {
        state.filters.view = tabView;
        render();
      }
    });

    // --- 6. Category Filter (Dropdown & Sidebar Pills) ---
    DOM.filterCategory.addEventListener('change', (e) => {
      state.filters.category = e.target.value;
      updateSidebarCategoryPillSelection();
      render();
    });

    document.getElementById('sidebarCategoryPills').addEventListener('click', (e) => {
      const pill = e.target.closest('.cat-pill');
      if (!pill) return;

      const category = pill.dataset.category;
      if (category) {
        state.filters.category = category;
        updateSidebarCategoryPillSelection();
        render();
        closeMobileSidebar();
      }
    });

    // --- 7. Priority Filter (Dropdown & Sidebar Pills) ---
    DOM.filterPriority.addEventListener('change', (e) => {
      state.filters.priority = e.target.value;
      updateSidebarPriorityPillSelection();
      render();
    });

    document.getElementById('sidebarPriorityPills').addEventListener('click', (e) => {
      const pill = e.target.closest('.priority-pill');
      if (!pill) return;

      const priority = pill.dataset.priority;
      if (priority) {
        state.filters.priority = priority;
        updateSidebarPriorityPillSelection();
        render();
        closeMobileSidebar();
      }
    });

    // --- 8. Sort Dropdown ---
    DOM.sortBy.addEventListener('change', (e) => {
      state.filters.sortBy = e.target.value;
      render();
    });

    // --- 9. View Mode Toggle (List vs Grid) ---
    DOM.viewListBtn.addEventListener('click', () => {
      state.viewMode = 'list';
      Storage.saveViewMode('list');
      render();
    });

    DOM.viewGridBtn.addEventListener('click', () => {
      state.viewMode = 'grid';
      Storage.saveViewMode('grid');
      render();
    });

    // --- 10. Reset All Filters Button ---
    if (DOM.resetAllFiltersBtn) {
      DOM.resetAllFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // --- 11. Mobile Drawer Navigation ---
    const openMobileSidebar = () => {
      DOM.sidebar.classList.add('is-open');
      DOM.sidebarOverlay.classList.add('is-open');
      document.body.style.overflow = 'hidden';
    };

    const closeMobileSidebar = () => {
      DOM.sidebar.classList.remove('is-open');
      DOM.sidebarOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
    };

    DOM.sidebarToggleBtn.addEventListener('click', openMobileSidebar);
    DOM.sidebarCloseBtn.addEventListener('click', closeMobileSidebar);
    DOM.sidebarOverlay.addEventListener('click', closeMobileSidebar);

    // --- 12. Keyboard Shortcuts ---
    window.addEventListener('keydown', (e) => {
      // Don't intercept shortcuts when user is typing inside an input/textarea/select
      const isInputActive = ['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName);

      // ESC: Close open modals
      if (e.key === 'Escape') {
        if (DOM.taskModal.classList.contains('is-open')) {
          Modal.closeTaskModal();
          return;
        }
        if (DOM.deleteModal.classList.contains('is-open')) {
          Modal.closeDeleteModal();
          return;
        }
        if (DOM.clearCompletedModal.classList.contains('is-open')) {
          Modal.closeClearCompletedModal();
          return;
        }
        if (DOM.sidebar.classList.contains('is-open')) {
          closeMobileSidebar();
          return;
        }
      }

      // N: Open Add Task Modal (when not inside form)
      if ((e.key === 'n' || e.key === 'N') && !isInputActive && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        Modal.openTaskModal();
        return;
      }

      // /: Focus Search (when not inside form)
      if (e.key === '/' && !isInputActive) {
        e.preventDefault();
        DOM.searchInput.focus();
        DOM.searchInput.select();
        return;
      }
    });
  };

  const resetAllFilters = () => {
    state.filters.view = 'all';
    state.filters.priority = 'all';
    state.filters.category = 'all';
    state.filters.searchQuery = '';
    DOM.searchInput.value = '';
    DOM.clearSearchBtn.classList.add('hidden');
    DOM.filterPriority.value = 'all';
    DOM.filterCategory.value = 'all';
    updateSidebarCategoryPillSelection();
    updateSidebarPriorityPillSelection();
    render();
    Toast.show('All filters reset', 'info');
  };

  // --------------------------------------------------------------------------
  // 14. APPLICATION INITIALIZATION
  // --------------------------------------------------------------------------
  const init = () => {
    // 1. Initialize clock & date
    DateUtils.initHeaderClock();

    // 2. Load stored tasks & view mode
    state.tasks = Storage.loadTasks();
    state.viewMode = Storage.loadViewMode();

    // 3. Set minimum selectable date to today for due date input
    if (DOM.taskDueDateInput) {
      DOM.taskDueDateInput.setAttribute('min', DateUtils.getTodayStr());
    }

    // 4. Attach event listeners
    setupEventListeners();

    // 5. Initial Render
    render();

    // 6. Welcome toast on first run
    setTimeout(() => {
      Toast.show('Welcome to TaskFlow! Organize and track your goals with ease.', 'info', 4000);
    }, 600);
  };

  // Run on DOM Content Loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
