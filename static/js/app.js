document.addEventListener('DOMContentLoaded', () => {
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const navItems = document.querySelectorAll('.nav-item');
    const moduleContainers = document.querySelectorAll('.module-container');
    const moduleTitle = document.getElementById('moduleTitle');

    // Sidebar Toggle for Mobile
    menuToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Navigation Logic
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Remove active class from all nav items
            navItems.forEach(nav => nav.classList.remove('active'));
            
            // Add active class to clicked nav item
            item.classList.add('active');

            // Hide all modules
            moduleContainers.forEach(container => container.classList.remove('active'));

            // Show selected module
            const targetModuleId = item.getAttribute('data-target');
            const targetContainer = document.getElementById(targetModuleId);
            if (targetContainer) {
                targetContainer.classList.add('active');
            }

            // Update Header Title
            moduleTitle.textContent = item.querySelector('span').textContent;

            // Close sidebar on mobile after clicking
            if (window.innerWidth <= 768) {
                sidebar.classList.remove('open');
            }
        });
    });
});
