// Form Data Management
class FormManager {
    static init() {
        this.formDirty = false;
        this.eventDatePicker = null;
        this.eventTimePicker = null;
        this.deadlinePicker = null;
        
        this.initializeDatePickers();
        this.initializeFileUploads();
        this.initializeProgressTracking();
        this.initializeAutoSave();
    }

    static initializeDatePickers() {
        // Event Date Picker
        this.eventDatePicker = flatpickr("#eventDate", {
            dateFormat: "M d, Y",
            minDate: "today",
            onChange: () => this.markAsDirty()
        });

        // Event Time Picker
        this.eventTimePicker = flatpickr("#eventTime", {
            enableTime: true,
            noCalendar: true,
            dateFormat: "h:i K",
            onChange: () => this.markAsDirty()
        });

        // Deadline Picker
        this.deadlinePicker = flatpickr("#finalDeadline", {
            dateFormat: "M d, Y",
            minDate: "today",
            onChange: () => this.markAsDirty()
        });
    }

    static initializeFileUploads() {
        const logoFile = document.getElementById('logoFile');
        const logoFileList = document.getElementById('logoFileList');
        const sponsorLogos = document.getElementById('sponsorLogos');
        const sponsorFileList = document.getElementById('sponsorFileList');

        if (logoFile) {
            logoFile.addEventListener('change', function() {
                if (this.files.length > 0) {
                    const fileName = this.files[0].name.length > 30 
                        ? this.files[0].name.substring(0, 27) + '...' 
                        : this.files[0].name;
                    logoFileList.textContent = fileName;
                    logoFileList.style.color = 'var(--primary)';
                } else {
                    logoFileList.textContent = 'No file selected';
                    logoFileList.style.color = 'var(--text-secondary)';
                }
                FormManager.markAsDirty();
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
                FormManager.markAsDirty();
            });
        }
    }

    static initializeProgressTracking() {
        const requiredFields = [
            'projectName', 'tagline', 'eventDate', 'eventTime', 'venueLink', 'primaryGoal',
            'targetAudience', 'designMood', 'ctaText', 'brandColors', 'brandFonts',
            'posterDimensions', 'finalDeadline'
        ];

        // Update progress on input
        document.querySelectorAll('input, select, textarea').forEach(element => {
            element.addEventListener('input', () => this.updateProgress());
            element.addEventListener('change', () => this.updateProgress());
        });

        // Initial progress update
        setTimeout(() => this.updateProgress(), 100);
    }

    static updateProgress() {
        const requiredFields = [
            'projectName', 'tagline', 'eventDate', 'eventTime', 'venueLink', 'primaryGoal',
            'targetAudience', 'designMood', 'ctaText', 'brandColors', 'brandFonts',
            'posterDimensions', 'finalDeadline'
        ];

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

        // Check checkboxes
        const formatCheckboxes = document.querySelectorAll('input[type="checkbox"][value]:checked');
        if (formatCheckboxes.length > 0) filledCount++;

        const platformCheckboxes = document.querySelectorAll('input[type="checkbox"][value="Social Media"], input[type="checkbox"][value="Print"], input[type="checkbox"][value="Website"]:checked');
        if (platformCheckboxes.length > 0) filledCount++;

        const totalRequired = requiredFields.length + 2;
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

    static getFormData() {
        const logoFile = document.getElementById('logoFile');
        const sponsorLogos = document.getElementById('sponsorLogos');

        // Get checkbox values
        const getCheckboxValues = (selector) => {
            const checkboxes = document.querySelectorAll(selector);
            const values = [];
            checkboxes.forEach(cb => {
                if (cb.checked) values.push(cb.value);
            });
            return values;
        };

        return {
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
            fileFormats: getCheckboxValues('input[type="checkbox"][value]'),
            usagePlatforms: getCheckboxValues('input[type="checkbox"][value="Social Media"], input[type="checkbox"][value="Print"], input[type="checkbox"][value="Website"]'),
            logoFile: logoFile?.files?.length > 0 ? logoFile.files[0].name : '',
            sponsorLogos: sponsorLogos?.files?.length > 0 ? `${sponsorLogos.files.length} files` : ''
        };
    }

    static loadFormData(data) {
        // Helper function to set value safely
        const setValue = (id, value) => {
            const element = document.getElementById(id);
            if (element && value !== undefined && value !== null) {
                element.value = value;
            }
        };

        // Set text inputs
        setValue('projectName', data.project_name);
        setValue('tagline', data.tagline);
        setValue('venueLink', data.venue_link);
        setValue('targetAudience', data.target_audience);
        setValue('ctaText', data.cta_text);
        setValue('brandColors', data.brand_colors);
        setValue('brandFonts', data.brand_fonts);
        setValue('contactPerson', data.contact_person);
        setValue('hashtags', data.hashtags);
        setValue('qrCodeUrl', data.qr_code_url);
        setValue('eventType', data.event_type);
        setValue('budgetRange', data.budget_range);
        setValue('inspirationLinks', data.inspiration_links);

        // Set select inputs
        setValue('primaryGoal', data.primary_goal);
        setValue('designMood', data.design_mood);
        setValue('posterDimensions', data.poster_dimensions);
        setValue('printingResponsibility', data.printing_responsibility);
        setValue('revisionRounds', data.revision_rounds);

        // Set date pickers
        if (data.event_date && this.eventDatePicker) {
            this.eventDatePicker.setDate(data.event_date);
        }
        if (data.event_time && this.eventTimePicker) {
            this.eventTimePicker.setDate(data.event_time);
        }
        if (data.final_deadline && this.deadlinePicker) {
            this.deadlinePicker.setDate(data.final_deadline);
        }

        // Set checkboxes
        if (data.file_formats) {
            const formats = data.file_formats.split(',');
            document.querySelectorAll('input[type="checkbox"][value]').forEach(cb => {
                cb.checked = formats.includes(cb.value);
            });
        }

        if (data.usage_platforms) {
            const platforms = data.usage_platforms.split(',');
            document.querySelectorAll('input[type="checkbox"][value="Social Media"], input[type="checkbox"][value="Print"], input[type="checkbox"][value="Website"]').forEach(cb => {
                cb.checked = platforms.includes(cb.value);
            });
        }

        // Update file list displays
        if (data.logo_file) {
            const logoFileList = document.getElementById('logoFileList');
            if (logoFileList) {
                logoFileList.textContent = data.logo_file;
                logoFileList.style.color = 'var(--primary)';
            }
        }

        if (data.sponsor_logos) {
            const sponsorFileList = document.getElementById('sponsorFileList');
            if (sponsorFileList) {
                sponsorFileList.textContent = data.sponsor_logos;
                sponsorFileList.style.color = 'var(--primary)';
            }
        }

        // Update progress
        setTimeout(() => this.updateProgress(), 100);
        this.markAsClean();
    }

    static clearForm() {
        // Clear all inputs
        document.querySelectorAll('input[type="text"], input[type="url"], textarea').forEach(el => {
            el.value = '';
        });

        // Clear file inputs
        document.querySelectorAll('input[type="file"]').forEach(el => {
            el.value = '';
        });

        // Reset checkboxes
        document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = cb.id === 'formatPDF' || cb.id === 'formatJPG' || cb.id === 'platformSocial';
        });

        // Reset selects
        document.querySelectorAll('select').forEach(select => {
            select.selectedIndex = 0;
        });

        // Clear date pickers
        if (this.eventDatePicker) this.eventDatePicker.clear();
        if (this.eventTimePicker) this.eventTimePicker.clear();
        if (this.deadlinePicker) this.deadlinePicker.clear();

        // Clear file displays
        document.getElementById('logoFileList').textContent = 'No file selected';
        document.getElementById('sponsorFileList').textContent = 'No files selected';

        // Update progress
        this.updateProgress();
        this.markAsDirty();
    }

    static getProgress() {
        return this.updateProgress();
    }

    static markAsDirty() {
        this.formDirty = true;
    }

    static markAsClean() {
        this.formDirty = false;
    }

    static isDirty() {
        return this.formDirty;
    }

    static initializeAutoSave() {
        // Auto-save every 30 seconds if dirty
        setInterval(() => {
            if (this.isDirty() && window.app) {
                window.app.autoSaveDraft();
            }
        }, 30000);
    }
}

// Make FormManager available globally
window.FormManager = FormManager;