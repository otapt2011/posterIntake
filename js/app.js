// Main Application Initialization
class PosterIntakeApp {
  constructor() {
    this.db = null;
    this.currentSubmissionId = null;
    this.isInitialized = false;
  }
  
  async init() {
    try {
      // Initialize database first
      this.db = await Database.init();
      
      // Initialize all modules
      ThemeManager.init();
      FormManager.init();
      UIManager.init();
      HistoryManager.init();
      
      // Setup event listeners
      this.setupEventListeners();
      
      // Hide splash screen after initialization
      setTimeout(() => {
        this.hideSplashScreen();
        this.loadLastDraft();
      }, 2000);
      
      this.isInitialized = true;
      console.log('App initialized successfully');
      
    } catch (error) {
      console.error('App initialization failed:', error);
      Toast.show('Failed to initialize app. Please refresh.', 'error');
    }
  }
  
  setupEventListeners() {
    // Save button
    document.getElementById('saveBtn').addEventListener('click', () => {
      this.saveCurrentForm();
    });
    
    // Save from preview
    document.getElementById('saveFromPreviewBtn').addEventListener('click', () => {
      this.saveCurrentForm();
    });
    
    // Load draft button
    document.getElementById('loadDraftBtn').addEventListener('click', () => {
      this.loadLastDraft();
    });
    
    // Auto-save on form changes (debounced)
    let saveTimeout;
    document.querySelectorAll('input, select, textarea').forEach(element => {
      element.addEventListener('input', () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
          this.autoSaveDraft();
        }, 2000);
      });
    });
    
    // Window beforeunload - warn about unsaved changes
    window.addEventListener('beforeunload', (e) => {
      if (FormManager.isDirty()) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    });
  }
  
  async saveCurrentForm() {
    const formData = FormManager.getFormData();
    const progress = FormManager.getProgress();
    
    if (progress < 50) {
      const confirmed = await Toast.confirm(
        'Form is less than 50% complete. Save anyway?',
        'Save Draft',
        'Cancel'
      );
      if (!confirmed) return;
    }
    
    try {
      const submissionId = await this.db.saveSubmission(formData);
      this.currentSubmissionId = submissionId;
      
      Toast.show('Submission saved successfully!', 'success');
      FormManager.markAsClean();
      this.updateSaveStatus('Saved just now');
      
      // Refresh history if modal is open
      if (document.getElementById('historyModal').style.display === 'flex') {
        HistoryManager.loadSubmissions();
      }
      
      return submissionId;
    } catch (error) {
      console.error('Save failed:', error);
      Toast.show('Failed to save submission', 'error');
    }
  }
  
  async autoSaveDraft() {
    if (!FormManager.isDirty()) return;
    
    const formData = FormManager.getFormData();
    formData.status = 'draft';
    
    try {
      await this.db.saveSubmission(formData, true); // Save as draft
      FormManager.markAsClean();
      this.updateSaveStatus('Auto-saved');
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }
  
  async loadLastDraft() {
    try {
      const drafts = await this.db.getSubmissions('draft');
      if (drafts.length > 0) {
        const latestDraft = drafts[drafts.length - 1];
        const confirmed = await Toast.confirm(
          `Load draft "${latestDraft.project_name}" from ${new Date(latestDraft.created_at).toLocaleDateString()}?`,
          'Load Draft',
          'Cancel'
        );
        
        if (confirmed) {
          FormManager.loadFormData(latestDraft);
          this.currentSubmissionId = latestDraft.id;
          Toast.show('Draft loaded successfully', 'success');
          this.updateSaveStatus('Draft loaded');
        }
      } else {
        Toast.show('No drafts found', 'info');
      }
    } catch (error) {
      console.error('Load draft failed:', error);
    }
  }
  
  async loadSubmission(id) {
    try {
      const submission = await this.db.getSubmission(id);
      if (submission) {
        FormManager.loadFormData(submission);
        this.currentSubmissionId = id;
        Toast.show('Submission loaded', 'success');
        this.updateSaveStatus('Loaded from history');
      }
    } catch (error) {
      console.error('Load submission failed:', error);
    }
  }
  
  updateSaveStatus(text) {
    const statusElement = document.getElementById('saveStatus');
    if (statusElement) {
      statusElement.textContent = text;
      statusElement.style.color = 'var(--success)';
      
      setTimeout(() => {
        if (FormManager.isDirty()) {
          statusElement.textContent = 'Unsaved changes';
          statusElement.style.color = 'var(--warning)';
        } else {
          statusElement.textContent = 'All changes saved';
          statusElement.style.color = 'var(--success)';
        }
      }, 5000);
    }
  }
  
  hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (splashScreen) {
      splashScreen.style.opacity = '0';
      splashScreen.style.transition = 'opacity 0.3s ease';
      
      setTimeout(() => {
        splashScreen.style.display = 'none';
        Toast.show('App ready! Start filling the form.', 'success', 3000);
      }, 300);
    }
  }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.app = new PosterIntakeApp();
  window.app.init();
});

// Make app available globally
window.PosterIntakeApp = PosterIntakeApp;