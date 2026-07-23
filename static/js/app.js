// Core Application Router and State Manager

const App = {
    rootElement: document.getElementById('app-root'),
    currentModule: null,

    init() {
        this.setupNavigation();
        this.checkAuth();
        this.handleRoute();

        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Setup Mobile Toggle
        const menuToggle = document.getElementById('menuToggle');
        const sidebar = document.getElementById('sidebar');
        if(menuToggle && sidebar) {
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('open');
            });
        }
    },

    checkAuth() {
        const token = localStorage.getItem('access_token');
        if (!token) {
            window.location.href = '/login';
        }
    },

    setupNavigation() {
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const target = item.getAttribute('data-target');
                if (target) {
                    window.location.hash = target;
                }
                
                // Close sidebar on mobile after clicking
                const sidebar = document.getElementById('sidebar');
                if (window.innerWidth <= 768 && sidebar) {
                    sidebar.classList.remove('open');
                }
            });
        });
    },

    updateActiveNav(route) {
        document.querySelectorAll('.nav-item').forEach(nav => {
            nav.classList.remove('active');
            if (nav.getAttribute('data-target') === route) {
                nav.classList.add('active');
            }
        });
    },

    async handleRoute() {
        let route = window.location.hash.replace('#', '') || 'dashboard';
        this.updateActiveNav(route);
        
        try {
            // Dynamically import the module
            const modulePath = `/static/js/modules/${route}.js`;
            
            // Note: In a real prod environment we might bundle these, 
            // but for this vanilla architecture dynamic imports work well.
            const module = await import(modulePath);
            
            // Clean up previous module if it has a cleanup function
            if (this.currentModule && typeof this.currentModule.cleanup === 'function') {
                this.currentModule.cleanup();
            }

            // Render new module
            if (this.rootElement) {
                this.rootElement.innerHTML = ''; // Clear current
                const content = await module.render();
                this.rootElement.appendChild(content);
                
                if (typeof module.afterRender === 'function') {
                    module.afterRender();
                }
            }

            this.currentModule = module;
        } catch (error) {
            console.error(`Failed to load module ${route}:`, error);
            if (this.rootElement) {
                this.rootElement.innerHTML = `
                    <div class="content-card" style="text-align:center; padding-top: 50px;">
                        <i class="fa-solid fa-triangle-exclamation" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
                        <h2>Module Not Found</h2>
                        <p style="color: var(--text-muted); margin-top:10px;">The module "${route}" could not be loaded or is under construction.</p>
                    </div>
                `;
            }
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
