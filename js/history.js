// History/Submissions Management
class HistoryManager {
  static init() {
    this.initializeHistoryModal();
  }
  
  static initializeHistoryModal() {
    const historyModal = document.getElementById('historyModal');
    const closeHistoryModal = document.getElementById('closeHistoryModal');
    const clearHistoryBtn = document.getElementById('clearHistoryBtn');
    const exportHistoryBtn = document.getElementById('exportHistoryBtn');
    
    // Close History Modal
    if (closeHistoryModal) {
      closeHistoryModal.addEventListener('click', () => {
        historyModal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside
    if (historyModal) {
      historyModal.addEventListener('click', (event) => {
        if (event.target === historyModal) {
          historyModal.style.display = 'none';
        }
      });
    }
    
    // Clear History Button
    if (clearHistoryBtn) {
      clearHistoryBtn.addEventListener('click', async () => {
        const confirmed = await Toast.confirm(
          'Are you sure you want to delete ALL submissions? This action cannot be undone.',
          'Delete All',
          'Cancel'
        );
        
        if (confirmed) {
          const success = await Database.clearAllSubmissions();
          if (success) {
            Toast.show('All submissions cleared', 'success');
            this.loadSubmissions();
          } else {
            Toast.show('Failed to clear submissions', 'error');
          }
        }
      });
    }
    
    // Export History Button
    if (exportHistoryBtn) {
      exportHistoryBtn.addEventListener('click', async () => {
        const csvData = await Database.exportToCSV();
        if (csvData) {
          this.downloadCSV(csvData, 'poster_submissions.csv');
          Toast.show('Export completed', 'success');
        } else {
          Toast.show('No data to export', 'warning');
        }
      });
    }
  }
  
  static async loadSubmissions() {
    const historyContent = document.getElementById('historyContent');
    if (!historyContent) return;
    
    historyContent.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 20px;">Loading submissions...</p>';
    
    try {
      const submissions = await Database.getSubmissions();
      const statistics = await Database.getStatistics();
      
      if (submissions.length === 0) {
        historyContent.innerHTML = `
                    <div style="text-align: center; padding: 40px 20px;">
                        <i class="fas fa-inbox" style="font-size: 48px; color: var(--text-secondary); margin-bottom: 20px;"></i>
                        <h3 style="color: var(--text-secondary); margin-bottom: 10px;">No Submissions Yet</h3>
                        <p style="color: var(--text-secondary);">Complete and save your first form submission to see it here.</p>
                    </div>
                `;
        return;
      }
      
      let html = `
                <div style="background: var(--bg-tertiary); padding: 10px; border-radius: 6px; margin-bottom: 15px;">
                    <div style="display: flex; justify-content: space-between; font-size: 12px;">
                        <span>Total: <strong>${statistics.total}</strong></span>
                        <span>Submitted: <strong>${statistics.submitted}</strong></span>
                        <span>Drafts: <strong>${statistics.drafts}</strong></span>
                        <span>Avg. Progress: <strong>${statistics.avg_progress}%</strong></span>
                    </div>
                </div>
            `;
      
      submissions.forEach(submission => {
        const date = new Date(submission.created_at).toLocaleDateString();
        const time = new Date(submission.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const statusClass = `status-${submission.status}`;
        const statusLabel = submission.status === 'draft' ? 'Draft' : 'Submitted';
        
        html += `
                    <div class="history-item" data-id="${submission.id}">
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <div>
                                <div class="history-date">${date} at ${time}</div>
                                <div class="history-project">${submission.project_name || 'Untitled Project'}</div>
                            </div>
                            <div>
                                <span class="history-status ${statusClass}">${statusLabel}</span>
                                <span style="font-size: 11px; color: var(--text-secondary); margin-left: 8px;">${submission.progress}%</span>
                            </div>
                        </div>
                        <div style="margin-top: 8px; font-size: 12px; color: var(--text-secondary);">
                            ${submission.tagline || 'No tagline'}
                        </div>
                        <div style="margin-top: 8px; display: flex; gap: 8px;">
                            <button class="btn btn-outline load-submission" style="padding: 4px 8px; font-size: 11px;" data-id="${submission.id}">
                                <i class="fas fa-edit"></i> Load
                            </button>
                            <button class="btn btn-outline delete-submission" style="padding: 4px 8px; font-size: 11px;" data-id="${submission.id}">
                                <i class="fas fa-trash"></i> Delete
                            </button>
                        </div>
                    </div>
                `;
      });
      
      historyContent.innerHTML = html;
      
      // Add event listeners to buttons
      document.querySelectorAll('.load-submission').forEach(button => {
        button.addEventListener('click', (e) => {
          e.stopPropagation();
          const id = button.getAttribute('data-id');
          if (window.app) {
            window.app.loadSubmission(id);
            document.getElementById('historyModal').style.display = 'none';
          }
        });
      });
      
      document.querySelectorAll('.delete-submission').forEach(button => {
        button.addEventListener('click', async (e) => {
          e.stopPropagation();
          const id = button.getAttribute('data-id');
          
          const confirmed = await Toast.confirm(
            'Delete this submission?',
            'Delete',
            'Cancel'
          );
          
          if (confirmed) {
            const success = await Database.deleteSubmission(id);
            if (success) {
              Toast.show('Submission deleted', 'success');
              this.loadSubmissions();
            } else {
              Toast.show('Failed to delete submission', 'error');
            }
          }
        });
      });
      
      // Click on history item to load
      document.querySelectorAll('.history-item').forEach(item => {
        item.addEventListener('click', (e) => {
          if (!e.target.classList.contains('btn')) {
            const id = item.getAttribute('data-id');
            if (window.app) {
              window.app.loadSubmission(id);
              document.getElementById('historyModal').style.display = 'none';
            }
          }
        });
      });
      
    } catch (error) {
      console.error('Load submissions failed:', error);
      historyContent.innerHTML = `
                <div style="text-align: center; padding: 40px 20px; color: var(--danger);">
                    <i class="fas fa-exclamation-circle" style="font-size: 48px; margin-bottom: 20px;"></i>
                    <h3>Error Loading Submissions</h3>
                    <p>Please try again later.</p>
                </div>
            `;
    }
  }
  
  static downloadCSV(data, filename) {
    const blob = new Blob([data], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}

// Make HistoryManager available globally
window.HistoryManager = HistoryManager;