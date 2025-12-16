// UI Interactions Management
class UIManager {
  static init() {
    this.initializeTabs();
    this.initializeModals();
    this.initializeButtons();
    this.initializeToasts();
    this.preventZoomOnFocus();
  }
  
  static initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabButtons.forEach(button => {
      button.addEventListener('click', function() {
        const tabId = this.getAttribute('data-tab');
        
        // Update active button
        tabButtons.forEach(btn => btn.classList.remove('active'));
        this.classList.add('active');
        
        // Show active tab pane
        tabPanes.forEach(pane => {
          pane.classList.remove('active');
          if (pane.id === tabId) {
            pane.classList.add('active');
          }
        });
      });
    });
  }
  
  static initializeModals() {
    // Preview Modal
    const previewModal = document.getElementById('previewModal');
    const closeModal = document.getElementById('closeModal');
    const previewBtn = document.getElementById('previewBtn');
    const screenshotBtn = document.getElementById('screenshotBtn');
    
    // Preview Button
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        const progress = FormManager.getProgress();
        
        if (previewModal) {
          previewModal.style.display = 'flex';
          this.generatePreview(progress);
          
          if (progress < 100) {
            Toast.show(`Form is ${progress}% complete. Some fields are missing.`, 'warning', 4000);
            this.highlightMissingFields();
          } else {
            Toast.show('Preview generated! Use device screenshot shortcut.', 'info', 4000);
          }
        }
      });
    }
    
    // Close Preview Modal
    if (closeModal) {
      closeModal.addEventListener('click', () => {
        previewModal.style.display = 'none';
      });
    }
    
    // Close modal when clicking outside
    if (previewModal) {
      previewModal.addEventListener('click', (event) => {
        if (event.target === previewModal) {
          previewModal.style.display = 'none';
        }
      });
    }
    
    // Screenshot Button
    if (screenshotBtn) {
      screenshotBtn.addEventListener('click', () => {
        Toast.show('Ready for screenshot! Windows/Linux: Ctrl+Shift+S | Mac: Cmd+Shift+4', 'info', 5000);
        
        // Add screenshot guide to modal
        const guide = document.createElement('div');
        guide.className = 'screenshot-guide';
        guide.innerHTML = `
                    <div style="background: var(--warning); color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; font-size: 12px;">
                        <i class="fas fa-camera"></i> Screenshot Guide: Use device screenshot shortcut
                    </div>
                `;
        
        const modalBody = document.getElementById('modalBody');
        if (modalBody && modalBody.firstChild) {
          modalBody.insertBefore(guide, modalBody.firstChild);
          
          setTimeout(() => {
            if (guide.parentElement) {
              guide.remove();
            }
          }, 5000);
        }
      });
    }
  }
  
  static initializeButtons() {
    // Clear Button
    const clearBtn = document.getElementById('clearBtn');
    if (clearBtn) {
      clearBtn.addEventListener('click', async () => {
        const confirmed = await Toast.confirm(
          'Are you sure you want to clear all form data? This action cannot be undone.',
          'Yes, Clear All',
          'Cancel'
        );
        
        if (confirmed) {
          FormManager.clearForm();
          Toast.show('Form cleared successfully!', 'success', 3000);
        }
      });
    }
    
    // History Button
    const historyBtn = document.getElementById('historyBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        const historyModal = document.getElementById('historyModal');
        if (historyModal) {
          historyModal.style.display = 'flex';
          if (window.HistoryManager) {
            HistoryManager.loadSubmissions();
          }
        }
      });
    }
  }
  
  static initializeToasts() {
    // Toast class is already defined globally in original script
    // We'll just ensure it's available
    if (typeof Toast === 'undefined') {
      // Define Toast if not already defined
      window.Toast = {
        show: function(message, type = 'info', duration = 3000) {
          console.log(`[${type.toUpperCase()}] ${message}`);
          alert(message); // Fallback
        },
        confirm: function(message, confirmText = 'Confirm', cancelText = 'Cancel') {
          return Promise.resolve(confirm(message));
        }
      };
    }
  }
  
  static generatePreview(progress) {
    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;
    
    const formData = FormManager.getFormData();
    
    // Map display names
    const goalMap = {
      'sell_tickets': 'Sell Tickets',
      'drive_registrations': 'Drive Registrations',
      'build_awareness': 'Build Awareness',
      'product_launch': 'Product Launch',
      'brand_promotion': 'Brand Promotion'
    };
    
    const moodMap = {
      'elegant_formal': 'Elegant & Formal',
      'energetic_playful': 'Energetic & Playful',
      'modern_minimal': 'Modern & Minimal',
      'vintage_retro': 'Vintage & Retro',
      'bold_edgy': 'Bold & Edgy',
      'friendly_warm': 'Friendly & Warm'
    };
    
    const dimensionMap = {
      '18x24': '18x24 inches (Standard Print)',
      '24x36': '24x36 inches (Large Print)',
      '1080x1350': '1080x1350px (Instagram)',
      '1200x628': '1200x628px (Facebook)',
      'custom': 'Custom Size'
    };
    
    // Generate preview HTML
    let previewHTML = '';
    
    if (progress < 100) {
      previewHTML += `
                <div class="preview-warning">
                    <h3><i class="fas fa-exclamation-triangle"></i> Incomplete Form (${progress}%)</h3>
                    <p>Some required fields are missing. Preview may be incomplete.</p>
                </div>
            `;
    }
    
    // Add preview sections (similar to original, but modularized)
    previewHTML += this.generatePreviewSection('Project Overview', [
      { label: 'Project Name', value: formData.projectName },
      { label: 'Tagline', value: formData.tagline },
      { label: 'Date & Time', value: `${formData.eventDate} ${formData.eventTime ? 'at ' + formData.eventTime : ''}` },
      { label: 'Venue / Link', value: formData.venueLink },
      { label: 'Primary Goal', value: goalMap[formData.primaryGoal] },
      { label: 'Call-to-Action', value: formData.ctaText }
    ]);
    
    // Add more sections as needed...
    
    modalBody.innerHTML = previewHTML;
  }
  
  static generatePreviewSection(title, items) {
    let html = `<div class="preview-section">
            <h3><i class="fas fa-info-circle"></i> ${title}</h3>
            <div class="preview-grid">`;
    
    items.forEach(item => {
      html += `
                <div class="preview-item">
                    <h4>${item.label}</h4>
                    <p>${item.value || '<em class="empty-field">Not provided</em>'}</p>
                </div>
            `;
    });
    
    html += '</div></div>';
    return html;
  }
  
  static highlightMissingFields() {
    const requiredFields = [
      'projectName', 'tagline', 'eventDate', 'eventTime', 'venueLink', 'primaryGoal',
      'targetAudience', 'designMood', 'ctaText', 'brandColors', 'brandFonts',
      'posterDimensions', 'finalDeadline'
    ];
    
    // Remove previous highlights
    document.querySelectorAll('.missing-field').forEach(el => {
      el.classList.remove('missing-field');
    });
    
    // Highlight missing required fields
    requiredFields.forEach(fieldId => {
      const field = document.getElementById(fieldId);
      if (field) {
        let isEmpty = false;
        
        if (field.type === 'file') {
          isEmpty = field.files.length === 0;
        } else if (field.type === 'checkbox' || field.type === 'radio') {
          return;
        } else {
          isEmpty = !field.value || field.value.trim() === '';
        }
        
        if (isEmpty) {
          field.classList.add('missing-field');
          field.scrollIntoView({ behavior: 'smooth', block: 'center' });
          
          setTimeout(() => {
            field.classList.remove('missing-field');
          }, 3000);
        }
      }
    });
  }
  
  static preventZoomOnFocus() {
    document.addEventListener('touchstart', function(event) {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
        event.target.style.fontSize = '14px';
      }
    }, { passive: true });
  }
}

// Make UIManager available globally
window.UIManager = UIManager;