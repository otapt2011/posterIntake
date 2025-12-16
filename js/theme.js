// Theme Management
class ThemeManager {
  static init() {
    this.themeButtons = document.querySelectorAll('.theme-btn');
    this.body = document.body;
    
    // Load saved theme or use system
    const savedTheme = localStorage.getItem('theme') || 'system';
    this.setTheme(savedTheme);
    
    // Add event listeners
    this.themeButtons.forEach(button => {
      button.addEventListener('click', () => {
        const theme = button.getAttribute('data-theme');
        this.setTheme(theme);
        localStorage.setItem('theme', theme);
        Toast.show(`Theme changed to ${theme} mode`, 'success', 2000);
        
        // Save to database
        if (window.Database) {
          Database.updateSetting('theme', theme);
        }
      });
    });
  }
  
  static setTheme(theme) {
    // Remove all theme classes
    this.body.classList.remove('light-theme', 'dark-theme', 'system-theme');
    
    // Add the selected theme class
    this.body.classList.add(`${theme}-theme`);
    
    // Update active button
    this.themeButtons.forEach(btn => {
      btn.classList.remove('active');
      if (btn.getAttribute('data-theme') === theme) {
        btn.classList.add('active');
      }
    });
    
    // Force reflow to ensure theme changes
    void this.body.offsetWidth;
  }
  
  static getCurrentTheme() {
    if (this.body.classList.contains('light-theme')) return 'light';
    if (this.body.classList.contains('dark-theme')) return 'dark';
    return 'system';
  }
}

// Make ThemeManager available globally
window.ThemeManager = ThemeManager;