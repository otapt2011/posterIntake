// ========== TOAST NOTIFICATION SYSTEM ==========
class Toast {
    static show(message, type = 'info', duration = 3000) {
        const container = document.getElementById('toastContainer');
        if (!container) return;
        
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        // Map type to icon
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle',
            confirm: 'fas fa-question-circle'
        };
        
        toast.innerHTML = `
            <i class="${icons[type] || 'fas fa-info-circle'} toast-icon"></i>
            <div class="toast-content">${message}</div>
            <button class="toast-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        container.appendChild(toast);
        
        // Close button
        toast.querySelector('.toast-close').addEventListener('click', () => {
            toast.remove();
        });
        
        // Auto remove after duration
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => toast.remove(), 300);
                }
            }, duration);
        }
        
        return toast;
    }
    
    static confirm(message, confirmText = 'Confirm', cancelText = 'Cancel') {
        return new Promise((resolve) => {
            const container = document.getElementById('toastContainer');
            if (!container) {
                resolve(false);
                return;
            }
            
            const toast = document.createElement('div');
            toast.className = 'toast confirm';
            
            toast.innerHTML = `
                <i class="fas fa-question-circle toast-icon"></i>
                <div class="toast-content">
                    ${message}
                    <div class="toast-actions">
                        <button class="toast-action-btn cancel">${cancelText}</button>
                        <button class="toast-action-btn confirm">${confirmText}</button>
                    </div>
                </div>
                <button class="toast-close">
                    <i class="fas fa-times"></i>
                </button>
            `;
            
            container.appendChild(toast);
            
            // Close button
            toast.querySelector('.toast-close').addEventListener('click', () => {
                toast.remove();
                resolve(false);
            });
            
            // Add event listeners
            toast.querySelector('.cancel').addEventListener('click', () => {
                toast.remove();
                resolve(false);
            });
            
            toast.querySelector('.confirm').addEventListener('click', () => {
                toast.remove();
                resolve(true);
            });
        });
    }
}

// ========== COMPACT SPLASH SCREEN ==========
let splashCountdown = 5; // Reduced from 10 to 5 seconds
let countdownInterval;

function startSplashCountdown() {
    const countdownElement = document.getElementById('countdown');
    if (!countdownElement) return;
    
    countdownElement.textContent = splashCountdown;
    
    countdownInterval = setInterval(() => {
        splashCountdown--;
        countdownElement.textContent = splashCountdown;
        
        if (splashCountdown <= 0) {
            hideSplashScreen();
        }
    }, 1000);
}

function hideSplashScreen() {
    const splashScreen = document.getElementById('splashScreen');
    if (!splashScreen) return;
    
    splashScreen.style.opacity = '0';
    splashScreen.style.transition = 'opacity 0.3s ease';
    
    setTimeout(() => {
        splashScreen.style.display = 'none';
        clearInterval(countdownInterval);
        
        // Show welcome toast
        Toast.show('Welcome! Start filling out the form.', 'info', 3000);
    }, 300);
}



// ========== FIXED THEME MANAGEMENT ==========
let themeButtons, eventDatePicker, eventTimePicker, deadlinePicker;
let logoFile, logoFileList, sponsorLogos, sponsorFileList;

function initializeTheme() {
    themeButtons = document.querySelectorAll('.theme-btn');
    const body = document.body;
    
    // Load saved theme or use system
    const savedTheme = localStorage.getItem('theme') || 'system';
    setTheme(savedTheme);
    
    // Add event listeners to theme buttons
    themeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const theme = this.getAttribute('data-theme');
            setTheme(theme);
            localStorage.setItem('theme', theme);
            Toast.show(`Theme changed to ${theme} mode`, 'success', 2000);
        });
    });
}

function setTheme(theme) {
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('light-theme', 'dark-theme', 'system-theme');
    
    // Add the selected theme class
    body.classList.add(`${theme}-theme`);
    
    // Update active button
    themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-theme') === theme) {
            btn.classList.add('active');
        }
    });
    
    // Force reflow to ensure theme changes
    void document.body.offsetWidth;
}

// ========== TAB NAVIGATION ==========
function initializeTabs() {
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

// ========== CALENDAR WIDGETS ==========
function initializeDatePickers() {
    eventDatePicker = flatpickr("#eventDate", {
        dateFormat: "M d, Y",
        minDate: "today",
        theme: "dark",
        onChange: function() {
            updateProgress();
        }
    });
    
    eventTimePicker = flatpickr("#eventTime", {
        enableTime: true,
        noCalendar: true,
        dateFormat: "h:i K",
        theme: "dark",
        onChange: function() {
            updateProgress();
        }
    });
    
    deadlinePicker = flatpickr("#finalDeadline", {
        dateFormat: "M d, Y",
        minDate: "today",
        theme: "dark",
        onChange: function() {
            updateProgress();
        }
    });
}

// ========== FILE UPLOAD HANDLERS ==========
function initializeFileUploads() {
    logoFile = document.getElementById('logoFile');
    logoFileList = document.getElementById('logoFileList');
    sponsorLogos = document.getElementById('sponsorLogos');
    sponsorFileList = document.getElementById('sponsorFileList');
    
    if (logoFile) {
        logoFile.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileName = this.files[0].name.length > 30 
                    ? this.files[0].name.substring(0, 27) + '...' 
                    : this.files[0].name;
                logoFileList.textContent = `${fileName}`;
                logoFileList.style.color = 'var(--primary)';
            } else {
                logoFileList.textContent = 'No file selected';
                logoFileList.style.color = 'var(--text-secondary)';
            }
            updateProgress();
        });
    }
    
    if (sponsorLogos) {
        sponsorLogos.addEventListener('change', function() {
            if (this.files.length > 0) {
                const fileCount = this.files.length;
                sponsorFileList.textContent = `${fileCount} file(s) selected`;
                sponsorFileList.style.color = 'var(--primary)';
            } else {
                sponsorFileList.textContent = 'No files selected';
                sponsorFileList.style.color = 'var(--text-secondary)';
            }
        });
    }
}

// ========== PROGRESS TRACKING ==========
const requiredFields = [
    'projectName', 'tagline', 'eventDate', 'eventTime', 'venueLink', 'primaryGoal',
    'targetAudience', 'designMood', 'ctaText', 'brandColors', 'brandFonts',
    'posterDimensions', 'finalDeadline'
];

function updateProgress() {
    let filledCount = 0;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            if (field.type === 'file') {
                if (field.files.length > 0) filledCount++;
            } else if (field.value && field.value.trim() !== '') {
                filledCount++;
            }
        }
    });
    
    // Check checkboxes (at least one file format selected)
    const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][value]:checked');
    if (formatCheckboxes.length > 0) filledCount++;
    
    // Check platform checkboxes (at least one selected)
    const platformCheckboxes = document.querySelectorAll('input[type="checkbox"][value="Social Media"], input[type="checkbox"][value="Print"], input[type="checkbox"][value="Website"]:checked');
    if (platformCheckboxes.length > 0) filledCount++;
    
    const totalRequired = requiredFields.length + 2; // +2 for checkbox groups
    const percentage = Math.round((filledCount / totalRequired) * 100);
    
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (progressFill) progressFill.style.width = `${percentage}%`;
    if (progressText) progressText.textContent = `${percentage}%`;
    
    // Update progress bar color
    if (progressFill) {
        if (percentage < 30) {
            progressFill.style.background = 'var(--danger)';
        } else if (percentage < 70) {
            progressFill.style.background = 'var(--warning)';
        } else if (percentage < 100) {
            progressFill.style.background = 'var(--success)';
        } else {
            progressFill.style.background = 'var(--primary)';
        }
    }
    
    return percentage;
}

function initializeProgressTracking() {
    // Update progress on input
    document.querySelectorAll('input, select, textarea').forEach(element => {
        element.addEventListener('input', updateProgress);
        element.addEventListener('change', updateProgress);
    });
}

// ========== FIXED CLEAR FORM FUNCTIONALITY ==========
async function clearForm() {
    const confirmed = await Toast.confirm(
        'Are you sure you want to clear all form data? This action cannot be undone.',
        'Yes, Clear All',
        'Cancel'
    );
    
    if (confirmed) {
        // Clear text inputs, textareas, and selects
        document.querySelectorAll('input[type="text"], input[type="url"], input[type="email"], input[type="tel"], textarea').forEach(element => {
            element.value = '';
        });
        
        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(element => {
            element.value = '';
        });
        
        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Reset default checkboxes
        document.getElementById('formatPDF').checked = true;
        document.getElementById('formatJPG').checked = true;
        document.getElementById('platformSocial').checked = true;
        
        // Reset select elements to first option
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });
        
        // Clear file display text
        if (logoFileList) {
            logoFileList.textContent = 'No file selected';
            logoFileList.style.color = 'var(--text-secondary)';
        }
        
        if (sponsorFileList) {
            sponsorFileList.textContent = 'No files selected';
            sponsorFileList.style.color = 'var(--text-secondary)';
        }
        
        // Clear date pickers
        if (eventDatePicker) eventDatePicker.clear();
        if (eventTimePicker) eventTimePicker.clear();
        if (deadlinePicker) deadlinePicker.clear();
        
        // Update progress
        updateProgress();
        
        Toast.show('Form cleared successfully!', 'success', 3000);
    }
}

// ========== PREVIEW FUNCTIONALITY ==========
let previewModal, closeModal, closePreviewBtn, modalBody;
let previewBtn, clearBtn, screenshotBtns;

function initializeFormActions() {
    previewBtn = document.getElementById('previewBtn');
    clearBtn = document.getElementById('clearBtn');
    previewModal = document.getElementById('previewModal');
    closeModal = document.getElementById('closeModal');
    closePreviewBtn = document.getElementById('closePreviewBtn');
    modalBody = document.getElementById('modalBody');
    screenshotBtns = document.querySelectorAll('#screenshotBtn');
    
    // Clear Form Button
    if (clearBtn) {
        clearBtn.addEventListener('click', clearForm);
    }
    
    // Preview Button - ALWAYS OPEN MODAL
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            const progress = updateProgress();
            
            // ALWAYS OPEN MODAL REGARDLESS OF PROGRESS
            if (previewModal) {
                previewModal.style.display = 'flex';
                generatePreview(progress);
                
                // Show toast if incomplete
                if (progress < 100) {
                    Toast.show(`Form is ${progress}% complete. Some fields are missing.`, 'warning', 4000);
                    highlightMissingFields();
                } else {
                    Toast.show('Preview generated! Use device screenshot shortcut.', 'info', 4000);
                }
            }
        });
    }
    
    // Close Modal functions
    function closePreviewModal() {
        if (previewModal) {
            previewModal.style.display = 'none';
        }
    }
    
    if (closeModal) closeModal.addEventListener('click', closePreviewModal);
    if (closePreviewBtn) closePreviewBtn.addEventListener('click', closePreviewModal);
    
    // Close modal when clicking outside
    if (previewModal) {
        previewModal.addEventListener('click', function(event) {
            if (event.target === previewModal) {
                closePreviewModal();
            }
        });
    }
    
    // Screenshot Buttons
    if (screenshotBtns.length > 0) {
        screenshotBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                Toast.show('Ready for screenshot! Windows/Linux: Ctrl+Shift+S | Mac: Cmd+Shift+4', 'info', 5000);
                
                // Add screenshot guide to modal
                const guide = document.createElement('div');
                guide.className = 'screenshot-guide';
                guide.innerHTML = `
                    <div style="background: var(--warning); color: white; padding: 10px; margin-bottom: 10px; border-radius: 4px; font-size: 12px;">
                        <i class="fas fa-camera"></i> Screenshot Guide: Use device screenshot shortcut
                    </div>
                `;
                
                if (modalBody && modalBody.firstChild) {
                    modalBody.insertBefore(guide, modalBody.firstChild);
                    
                    // Remove guide after 5 seconds
                    setTimeout(() => {
                        if (guide.parentElement) {
                            guide.remove();
                        }
                    }, 5000);
                }
            });
        });
    }
}

function highlightMissingFields() {
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
                
                // Remove highlight after 3 seconds
                setTimeout(() => {
                    field.classList.remove('missing-field');
                }, 3000);
            }
        }
    });
}

// ========== PREVIEW GENERATION ==========
function generatePreview(progress) {
    if (!modalBody) return;
    
    // Get all form values
    const formData = {
        projectName: document.getElementById('projectName')?.value || '',
        tagline: document.getElementById('tagline')?.value || '',
        eventDate: document.getElementById('eventDate')?.value || '',
        eventTime: document.getElementById('eventTime')?.value || '',
        venueLink: document.getElementById('venueLink')?.value || '',
        primaryGoal: document.getElementById('primaryGoal')?.value || '',
        targetAudience: document.getElementById('targetAudience')?.value || '',
        designMood: document.getElementById('designMood')?.value || '',
        ctaText: document.getElementById('ctaText')?.value || '',
        brandColors: document.getElementById('brandColors')?.value || '',
        brandFonts: document.getElementById('brandFonts')?.value || '',
        posterDimensions: document.getElementById('posterDimensions')?.value || '',
        finalDeadline: document.getElementById('finalDeadline')?.value || '',
        contactPerson: document.getElementById('contactPerson')?.value || '',
        revisionRounds: document.getElementById('revisionRounds')?.value || '2',
        hashtags: document.getElementById('hashtags')?.value || '',
        qrCodeUrl: document.getElementById('qrCodeUrl')?.value || '',
        printingResponsibility: document.getElementById('printingResponsibility')?.value || '',
        eventType: document.getElementById('eventType')?.value || '',
        budgetRange: document.getElementById('budgetRange')?.value || '',
        inspirationLinks: document.getElementById('inspirationLinks')?.value || '',
        logoFile: logoFile?.files?.length > 0 ? 
            (logoFile.files[0].name.length > 20 ? 
                logoFile.files[0].name.substring(0, 17) + '...' : 
                logoFile.files[0].name) : 
            'Not uploaded',
        sponsorLogos: sponsorLogos?.files?.length > 0 ? 
            `${sponsorLogos.files.length} file(s)` : 
            'None',
        fileFormats: getSelectedCheckboxValues('input[type="checkbox"][value]'),
        usagePlatforms: getSelectedCheckboxValues('input[type="checkbox"][value="Social Media"], input[type="checkbox"][value="Print"], input[type="checkbox"][value="Website"]')
    };
    
    // Map display names for preview
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
    
    const printingMap = {
        'designer': 'Designer handles printing',
        'client': 'Client handles printing',
        'tbd': 'To be determined'
    };
    
    const eventTypeMap = {
        'concert': 'Concert / Music Festival',
        'conference': 'Conference / Seminar',
        'workshop': 'Workshop / Training',
        'product_launch': 'Product Launch'
    };
    
    // Generate HTML for preview with progress warning
    let previewHTML = '';
    
    // Add warning if incomplete
    if (progress < 100) {
        previewHTML += `
            <div class="preview-warning">
                <h3><i class="fas fa-exclamation-triangle"></i> Incomplete Form (${progress}%)</h3>
                <p>Some required fields are missing. Preview may be incomplete.</p>
            </div>
        `;
    }
    
    previewHTML += `
        <div class="preview-section">
            <h3><i class="fas fa-info-circle"></i> Project Overview</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>Project Name</h4>
                    <p>${truncateText(formData.projectName, 40) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Tagline</h4>
                    <p>${truncateText(formData.tagline, 40) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Date & Time</h4>
                    <p>${formData.eventDate || '<em class="empty-field">Not set</em>'} ${formData.eventTime ? 'at ' + formData.eventTime : ''}</p>
                </div>
                <div class="preview-item">
                    <h4>Venue / Link</h4>
                    <p>${truncateText(formData.venueLink, 40) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Primary Goal</h4>
                    <p>${goalMap[formData.primaryGoal] || '<em class="empty-field">Not selected</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Call-to-Action</h4>
                    <p>${truncateText(formData.ctaText, 30) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                ${formData.eventType ? `
                <div class="preview-item">
                    <h4>Event Type</h4>
                    <p>${eventTypeMap[formData.eventType] || formData.eventType}</p>
                </div>
                ` : ''}
                ${formData.budgetRange ? `
                <div class="preview-item">
                    <h4>Budget Range</h4>
                    <p>${formData.budgetRange}</p>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="preview-section">
            <h3><i class="fas fa-users"></i> Audience & Design</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>Target Audience</h4>
                    <p>${truncateText(formData.targetAudience, 50) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Design Mood</h4>
                    <p>${moodMap[formData.designMood] || '<em class="empty-field">Not selected</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Brand Colors</h4>
                    <p>${truncateText(formData.brandColors, 40) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Brand Fonts</h4>
                    <p>${truncateText(formData.brandFonts, 40) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Logo File</h4>
                    <p>${formData.logoFile}</p>
                </div>
                <div class="preview-item">
                    <h4>Sponsor Logos</h4>
                    <p>${formData.sponsorLogos}</p>
                </div>
            </div>
        </div>
        
        <div class="preview-section">
            <h3><i class="fas fa-cog"></i> Technical Specs</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>Poster Dimensions</h4>
                    <p>${dimensionMap[formData.posterDimensions] || '<em class="empty-field">Not selected</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>File Formats</h4>
                    <p>${formData.fileFormats.join(', ') || '<em class="empty-field">None selected</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Usage Platforms</h4>
                    <p>${formData.usagePlatforms.join(', ') || '<em class="empty-field">None selected</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Final Deadline</h4>
                    <p>${formData.finalDeadline || '<em class="empty-field">Not set</em>'}</p>
                </div>
                ${formData.hashtags ? `
                <div class="preview-item">
                    <h4>Hashtags</h4>
                    <p>${truncateText(formData.hashtags, 40)}</p>
                </div>
                ` : ''}
                ${formData.qrCodeUrl ? `
                <div class="preview-item">
                    <h4>QR Code URL</h4>
                    <p>${truncateText(formData.qrCodeUrl, 40)}</p>
                </div>
                ` : ''}
            </div>
        </div>
        
        <div class="preview-section">
            <h3><i class="fas fa-handshake"></i> Review & Approval</h3>
            <div class="preview-grid">
                <div class="preview-item">
                    <h4>Contact Person</h4>
                    <p>${truncateText(formData.contactPerson, 50) || '<em class="empty-field">Not provided</em>'}</p>
                </div>
                <div class="preview-item">
                    <h4>Revision Rounds</h4>
                    <p>${formData.revisionRounds || '2 Rounds'}</p>
                </div>
                ${formData.printingResponsibility ? `
                <div class="preview-item">
                    <h4>Printing Responsibility</h4>
                    <p>${printingMap[formData.printingResponsibility] || formData.printingResponsibility}</p>
                </div>
                ` : ''}
                ${formData.inspirationLinks ? `
                <div class="preview-item">
                    <h4>Inspiration Links</h4>
                    <p>${truncateText(formData.inspirationLinks.replace(/\n/g, ', '), 80)}</p>
                </div>
                ` : ''}
            </div>
        </div>
    `;
    
    modalBody.innerHTML = previewHTML;
    
    // Ensure modal fits viewport
    setTimeout(() => {
        const modalBodyEl = document.querySelector('.modal-body');
        if (modalBodyEl) {
            if (modalBodyEl.scrollHeight > modalBodyEl.clientHeight) {
                modalBodyEl.style.overflowY = 'auto';
            } else {
                modalBodyEl.style.overflowY = 'visible';
            }
        }
    }, 100);
}

// ========== HELPER FUNCTIONS ==========
function truncateText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength - 3) + '...';
}

function getSelectedCheckboxValues(selector) {
    const checkboxes = document.querySelectorAll(selector);
    const values = [];
    checkboxes.forEach(checkbox => {
        if (checkbox.checked) {
            values.push(checkbox.value);
        }
    });
    return values;
}

// ========== INITIAL SAMPLE DATA ==========
function initializeSampleData() {
    // Set initial values only if form is empty
    const projectName = document.getElementById('projectName');
    if (projectName && !projectName.value) {
        const today = new Date();
        const nextWeek = new Date(today);
        nextWeek.setDate(today.getDate() + 7);
        
        if (eventDatePicker) eventDatePicker.setDate(nextWeek);
        if (eventTimePicker) eventTimePicker.setDate('18:00');
        if (deadlinePicker) deadlinePicker.setDate(today);
        
        //document.getElementById('projectName').value = 'Summer Music Festival 2024';
        //document.getElementById('tagline').value = 'The Ultimate Summer Experience';
        //document.getElementById('venueLink').value = 'Central Park, New York City';
        //document.getElementById('primaryGoal').value = 'sell_tickets';
        //document.getElementById('targetAudience').value = 'Young adults (18-35), Music enthusiasts';
        //document.getElementById('designMood').value = 'energetic_playful';
        //document.getElementById('ctaText').value = 'Get Your Tickets Now!';
        //document.getElementById('brandColors').value = '#6366f1 (Primary), #8b5cf6 (Secondary)';
        //document.getElementById('brandFonts').value = 'Inter (Primary), Montserrat (Headings)';
        //document.getElementById('posterDimensions').value = '18x24';
        //document.getElementById('contactPerson').value = 'Jane Smith | jane@example.com | (555) 123-4567';
        //document.getElementById('hashtags').value = '#SummerFest2024 #MusicFestival';
        //document.getElementById('qrCodeUrl').value = 'https://summerfest2024.com/tickets';
        //document.getElementById('printingResponsibility').value = 'client';
        //document.getElementById('eventType').value = 'concert';
        //document.getElementById('budgetRange').value = '$1000 - $2500';
        //document.getElementById('inspirationLinks').value = 'https://pinterest.com/board/music-fest-posters';
        
        // Update progress
        updateProgress();
    }
}

// ========== PREVENT ZOOM ON INPUT FOCUS ==========
function preventZoomOnFocus() {
    document.addEventListener('touchstart', function(event) {
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA' || event.target.tagName === 'SELECT') {
            event.target.style.fontSize = '14px';
        }
    }, { passive: true });
}

// ========== MAIN INITIALIZATION ==========
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first to prevent flash
    initializeTheme();
    
    // Start splash screen
    startSplashCountdown();
    
    // Manual close button for splash
    const startBtn = document.getElementById('startBtn');
    if (startBtn) {
        startBtn.addEventListener('click', hideSplashScreen);
    }
    
    // Initialize all components
    initializeTabs();
    initializeDatePickers();
    initializeFileUploads();
    initializeProgressTracking();
    initializeFormActions();
    preventZoomOnFocus();
    
    // Initialize sample data (only if form is empty)
    setTimeout(() => {
        if (document.getElementById('splashScreen')?.style.display !== 'none') {
            // Still showing splash, delay sample data
            setTimeout(initializeSampleData, 500);
        } else {
            initializeSampleData();
        }
    }, 100);
    
    // Viewport fitting for responsive text truncation
    window.addEventListener('resize', function() {
        document.querySelectorAll('.truncate').forEach(el => {
            if (el.scrollWidth > el.clientWidth) {
                el.title = el.textContent;
            }
        });
    });
});

// Make Toast class available globally
window.Toast = Toast;