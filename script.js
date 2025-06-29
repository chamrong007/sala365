// --- Service Worker Registration ---
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        console.log('ServiceWorker registration successful with scope: ', registration.scope);
      })
      .catch(err => {
        console.log('ServiceWorker registration failed: ', err);
      });
  });
}


// --- Mobile menu toggle ---
const menuBtn = document.getElementById('menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const mobileCoursesBtn = document.getElementById('mobile-courses-btn');
const mobileCoursesDropdown = document.getElementById('mobile-courses-dropdown');
const mobileCoursesArrow = document.getElementById('mobile-courses-arrow');

menuBtn.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
});

mobileCoursesBtn.addEventListener('click', () => {
    mobileCoursesDropdown.classList.toggle('open');
    mobileCoursesArrow.classList.toggle('rotate-180');
});

// --- Course Detail Modal ---
const courseWrappers = document.querySelectorAll('.course-wrapper');

courseWrappers.forEach(wrapper => {
    const targetId = wrapper.dataset.target;
    if(!targetId) return;

    const modal = document.getElementById(targetId);
    if (!modal) return;
    
    const closeModalBtn = modal.querySelector('.close-modal-btn');
    
    wrapper.addEventListener('click', (event) => {
        if (event.target.closest('a')) {
            return;
        }
        modal.classList.add('open');
    });
    
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('open');
    });
    
    modal.addEventListener('click', (e) => {
         if(e.target === modal) {
             modal.classList.remove('open');
        }
    });
});

// --- Tab Functionality for Modals---
function setupTabs(modalId) {
    const detailModal = document.querySelector(modalId);
    if (detailModal) {
        const tabButtons = detailModal.querySelectorAll('.tab-btn');
        const tabContents = detailModal.querySelectorAll('.tab-content');

        if(tabButtons.length > 0) {
            tabButtons.forEach(button => {
                button.addEventListener('click', () => {
                    tabButtons.forEach(btn => btn.classList.remove('active'));
                    tabContents.forEach(content => content.classList.remove('active'));
                    button.classList.add('active');
                    detailModal.querySelector(`#${button.dataset.tab}`).classList.add('active');
                });
            });
        }
    }
}

// Setup tabs for all modals that have them
setupTabs('#detail-overlay-1');
setupTabs('#detail-overlay-2');
