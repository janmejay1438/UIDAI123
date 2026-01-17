document.addEventListener('DOMContentLoaded', () => {
    console.log('UIDAI Clone Loaded');

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileToggle) {
        mobileToggle.addEventListener('click', () => {
            const isFlex = getComputedStyle(navLinks).display === 'flex';
            if (isFlex && navLinks.classList.contains('active')) {
                navLinks.style.display = 'none';
                navLinks.classList.remove('active');
            } else {
                navLinks.style.display = 'flex';
                navLinks.style.flexDirection = 'column';
                navLinks.style.position = 'absolute';
                navLinks.style.top = '80px';
                navLinks.style.left = '0';
                navLinks.style.width = '100%';
                navLinks.style.backgroundColor = 'white';
                navLinks.style.padding = '20px';
                navLinks.style.boxShadow = '0 5px 10px rgba(0,0,0,0.1)';
                navLinks.classList.add('active');
            }
        });
    }
});
// Database Simulation
const StorageService = {
    getKey: () => 'uidai_db_v1',

    getAll: () => {
        const data = localStorage.getItem(StorageService.getKey());
        return data ? JSON.parse(data) : [];
    },

    save: (record) => {
        const db = StorageService.getAll();
        db.push(record);
        localStorage.setItem(StorageService.getKey(), JSON.stringify(db));
    },

    findByID: (id) => {
        const db = StorageService.getAll();
        return db.find(item => item.id === id);
    }
};

window.db = StorageService; // Expose to global scope
