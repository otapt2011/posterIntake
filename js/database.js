// SQLite Database Management
class Database {
    static async init() {
        try {
            // Initialize SQL.js
            const SQL = await initSqlJs({
                locateFile: file => `assets/${file}`
            });
            
            // Create or open database
            this.db = new SQL.Database();
            
            // Create tables if they don't exist
            this.createTables();
            
            console.log('Database initialized successfully');
            return this;
        } catch (error) {
            console.error('Database initialization failed:', error);
            throw error;
        }
    }

    static createTables() {
        // Submissions table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS submissions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                project_name TEXT,
                tagline TEXT,
                event_date TEXT,
                event_time TEXT,
                venue_link TEXT,
                primary_goal TEXT,
                target_audience TEXT,
                design_mood TEXT,
                cta_text TEXT,
                brand_colors TEXT,
                brand_fonts TEXT,
                poster_dimensions TEXT,
                final_deadline TEXT,
                contact_person TEXT,
                revision_rounds TEXT DEFAULT '2',
                hashtags TEXT,
                qr_code_url TEXT,
                printing_responsibility TEXT,
                event_type TEXT,
                budget_range TEXT,
                inspiration_links TEXT,
                file_formats TEXT DEFAULT 'PDF,JPG',
                usage_platforms TEXT DEFAULT 'Social Media',
                logo_file TEXT,
                sponsor_logos TEXT,
                progress INTEGER DEFAULT 0,
                status TEXT DEFAULT 'draft',
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Settings table
        this.db.run(`
            CREATE TABLE IF NOT EXISTS settings (
                key TEXT PRIMARY KEY,
                value TEXT,
                updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Insert default settings if not exist
        this.db.run(`
            INSERT OR IGNORE INTO settings (key, value) VALUES 
            ('theme', 'system'),
            ('auto_save', 'true'),
            ('notifications', 'true')
        `);
    }

    static async saveSubmission(data, isDraft = false) {
        try {
            const now = new Date().toISOString();
            const progress = this.calculateProgress(data);
            
            if (data.id) {
                // Update existing submission
                this.db.run(`
                    UPDATE submissions SET
                        project_name = ?, tagline = ?, event_date = ?, event_time = ?,
                        venue_link = ?, primary_goal = ?, target_audience = ?,
                        design_mood = ?, cta_text = ?, brand_colors = ?, brand_fonts = ?,
                        poster_dimensions = ?, final_deadline = ?, contact_person = ?,
                        revision_rounds = ?, hashtags = ?, qr_code_url = ?,
                        printing_responsibility = ?, event_type = ?, budget_range = ?,
                        inspiration_links = ?, file_formats = ?, usage_platforms = ?,
                        logo_file = ?, sponsor_logos = ?, progress = ?, status = ?,
                        updated_at = ?
                    WHERE id = ?
                `, [
                    data.projectName, data.tagline, data.eventDate, data.eventTime,
                    data.venueLink, data.primaryGoal, data.targetAudience,
                    data.designMood, data.ctaText, data.brandColors, data.brandFonts,
                    data.posterDimensions, data.finalDeadline, data.contactPerson,
                    data.revisionRounds, data.hashtags, data.qrCodeUrl,
                    data.printingResponsibility, data.eventType, data.budgetRange,
                    data.inspirationLinks, data.fileFormats?.join(','), data.usagePlatforms?.join(','),
                    data.logoFile, data.sponsorLogos, progress,
                    isDraft ? 'draft' : 'submitted', now, data.id
                ]);
                
                return data.id;
            } else {
                // Insert new submission
                const result = this.db.run(`
                    INSERT INTO submissions (
                        project_name, tagline, event_date, event_time, venue_link,
                        primary_goal, target_audience, design_mood, cta_text,
                        brand_colors, brand_fonts, poster_dimensions, final_deadline,
                        contact_person, revision_rounds, hashtags, qr_code_url,
                        printing_responsibility, event_type, budget_range,
                        inspiration_links, file_formats, usage_platforms,
                        logo_file, sponsor_logos, progress, status
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    data.projectName, data.tagline, data.eventDate, data.eventTime,
                    data.venueLink, data.primaryGoal, data.targetAudience,
                    data.designMood, data.ctaText, data.brandColors, data.brandFonts,
                    data.posterDimensions, data.finalDeadline, data.contactPerson,
                    data.revisionRounds || '2', data.hashtags, data.qrCodeUrl,
                    data.printingResponsibility, data.eventType, data.budgetRange,
                    data.inspirationLinks, data.fileFormats?.join(','), data.usagePlatforms?.join(','),
                    data.logoFile, data.sponsorLogos, progress,
                    isDraft ? 'draft' : 'submitted'
                ]);
                
                return result.lastInsertRowid;
            }
        } catch (error) {
            console.error('Save submission failed:', error);
            throw error;
        }
    }

    static async getSubmissions(status = null) {
        try {
            let query = 'SELECT * FROM submissions ORDER BY updated_at DESC';
            let params = [];
            
            if (status) {
                query = 'SELECT * FROM submissions WHERE status = ? ORDER BY updated_at DESC';
                params = [status];
            }
            
            const result = this.db.exec(query, params);
            
            if (result.length === 0) return [];
            
            return result[0].values.map(row => {
                const submission = {};
                result[0].columns.forEach((col, index) => {
                    submission[col] = row[index];
                });
                return submission;
            });
        } catch (error) {
            console.error('Get submissions failed:', error);
            return [];
        }
    }

    static async getSubmission(id) {
        try {
            const result = this.db.exec(
                'SELECT * FROM submissions WHERE id = ?',
                [id]
            );
            
            if (result.length === 0) return null;
            
            const submission = {};
            result[0].columns.forEach((col, index) => {
                submission[col] = result[0].values[0][index];
            });
            
            return submission;
        } catch (error) {
            console.error('Get submission failed:', error);
            return null;
        }
    }

    static async deleteSubmission(id) {
        try {
            this.db.run('DELETE FROM submissions WHERE id = ?', [id]);
            return true;
        } catch (error) {
            console.error('Delete submission failed:', error);
            return false;
        }
    }

    static async clearAllSubmissions() {
        try {
            this.db.run('DELETE FROM submissions');
            this.db.run('VACUUM'); // Clean up database
            return true;
        } catch (error) {
            console.error('Clear submissions failed:', error);
            return false;
        }
    }

    static async getStatistics() {
        try {
            const result = this.db.exec(`
                SELECT 
                    COUNT(*) as total,
                    SUM(CASE WHEN status = 'submitted' THEN 1 ELSE 0 END) as submitted,
                    SUM(CASE WHEN status = 'draft' THEN 1 ELSE 0 END) as drafts,
                    AVG(progress) as avg_progress
                FROM submissions
            `);
            
            if (result.length === 0) return { total: 0, submitted: 0, drafts: 0, avg_progress: 0 };
            
            return {
                total: result[0].values[0][0],
                submitted: result[0].values[0][1],
                drafts: result[0].values[0][2],
                avg_progress: Math.round(result[0].values[0][3]) || 0
            };
        } catch (error) {
            console.error('Get statistics failed:', error);
            return { total: 0, submitted: 0, drafts: 0, avg_progress: 0 };
        }
    }

    static calculateProgress(data) {
        const requiredFields = [
            'projectName', 'tagline', 'eventDate', 'eventTime', 'venueLink', 'primaryGoal',
            'targetAudience', 'designMood', 'ctaText', 'brandColors', 'brandFonts',
            'posterDimensions', 'finalDeadline'
        ];
        
        let filledCount = 0;
        requiredFields.forEach(field => {
            if (data[field] && data[field].toString().trim() !== '') {
                filledCount++;
            }
        });
        
        // Check file formats
        if (data.fileFormats && data.fileFormats.length > 0) filledCount++;
        
        // Check usage platforms
        if (data.usagePlatforms && data.usagePlatforms.length > 0) filledCount++;
        
        const totalRequired = requiredFields.length + 2;
        return Math.round((filledCount / totalRequired) * 100);
    }

    static async exportToCSV() {
        try {
            const submissions = await this.getSubmissions();
            if (submissions.length === 0) return null;
            
            const headers = Object.keys(submissions[0]).join(',');
            const rows = submissions.map(sub => 
                Object.values(sub).map(val => 
                    typeof val === 'string' ? `"${val.replace(/"/g, '""')}"` : val
                ).join(',')
            ).join('\n');
            
            return `${headers}\n${rows}`;
        } catch (error) {
            console.error('Export to CSV failed:', error);
            return null;
        }
    }

    static async updateSetting(key, value) {
        try {
            this.db.run(`
                INSERT OR REPLACE INTO settings (key, value, updated_at)
                VALUES (?, ?, CURRENT_TIMESTAMP)
            `, [key, value]);
            return true;
        } catch (error) {
            console.error('Update setting failed:', error);
            return false;
        }
    }

    static async getSetting(key) {
        try {
            const result = this.db.exec(
                'SELECT value FROM settings WHERE key = ?',
                [key]
            );
            
            if (result.length === 0 || result[0].values.length === 0) return null;
            return result[0].values[0][0];
        } catch (error) {
            console.error('Get setting failed:', error);
            return null;
        }
    }
}

// Make database available globally
window.Database = Database;