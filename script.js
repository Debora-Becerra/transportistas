document.addEventListener('DOMContentLoaded', () => {
    // --- Mobile Menu Logic ---
    const btn = document.getElementById('mobile-menu-btn');
    const menu = document.getElementById('mobile-menu');

    btn.addEventListener('click', () => {
        menu.classList.toggle('hidden');
    });

    // Close menu when clicking a link
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.add('hidden');
        });
    });

    // --- Navbar Scroll Logic ---
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navbar.classList.add('scrolled', 'shadow-md');
        } else {
            navbar.classList.remove('scrolled', 'shadow-md');
        }
    });

    // --- Map Interaction Logic ---
    const markers = document.querySelectorAll('.map-marker');
    const modal = document.getElementById('map-modal');
    const modalPrice = document.getElementById('modal-price');
    const modalInfo = document.getElementById('modal-info');
    const closeModal = document.getElementById('close-modal');

    // Function to open modal
    function openModal(price, info) {
        modalPrice.textContent = price;
        // Basic logic to determine the message based on price, or use the data-info attribute
        // The prompt asked for: "Valor por paquete entregado", Monto, "Short explanation that values depend on zone"
        // I'll keep the static explanation but maybe add the specific info if needed.
        // For now, the static explanation is "Los valores dependen de la zona asignada." which covers the requirement.
        // We can append the specific zone info if we want.
        modalInfo.textContent = `Los valores dependen de la zona asignada. ${info ? '(' + info + ')' : ''}`;
        
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.classList.add('active'); // Start transition
    }

    // Function to close modal
    function closeModalFunc() {
        modal.classList.remove('active');
        modal.classList.add('pointer-events-none', 'opacity-0');
    }

    markers.forEach(marker => {
        marker.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent bubbling
            const price = marker.getAttribute('data-price');
            const info = marker.getAttribute('data-info');
            openModal(price, info);
        });
    });

    closeModal.addEventListener('click', closeModalFunc);

    // Close modal on click outside
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModalFunc();
        }
    });

    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            closeModalFunc();
        }
    });
});
