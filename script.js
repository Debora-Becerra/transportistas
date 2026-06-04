const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzWZ-C1Grp7hKnsbX87X8WKXSbXqFQmngdgbLERovyKLx1ych5icpSRxIixeTYRnTZY/exec";

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

    // --- Attendance Form Logic ---
    const attendanceForm = document.getElementById('registroForm');
    const attendanceDate = document.getElementById('attendance-date');
    const attendanceDateError = document.getElementById('attendance-date-error');
    const whatsappPhone = document.getElementById('whatsapp-phone');
    const whatsappPhoneError = document.getElementById('whatsapp-phone-error');
    const formMessage = document.getElementById('formMessage');

    function getTodayValue() {
        const today = new Date();
        const timezoneOffset = today.getTimezoneOffset() * 60000;
        return new Date(today.getTime() - timezoneOffset).toISOString().split('T')[0];
    }

    function showDateError(message) {
        attendanceDateError.textContent = message;
        attendanceDate.setAttribute('aria-invalid', 'true');
    }

    function clearDateError() {
        attendanceDateError.textContent = '';
        attendanceDate.removeAttribute('aria-invalid');
    }

    function cleanPhoneValue(value) {
        return value.replace(/\D/g, '');
    }

    function showPhoneError() {
        whatsappPhoneError.textContent = 'Ingresá un número de WhatsApp válido.';
        whatsappPhone.setAttribute('aria-invalid', 'true');
    }

    function clearPhoneError() {
        whatsappPhoneError.textContent = '';
        whatsappPhone.removeAttribute('aria-invalid');
    }

    function getValidPhoneValue() {
        const cleanPhone = cleanPhoneValue(whatsappPhone.value);

        if (cleanPhone.length < 10 || cleanPhone.length > 13) {
            showPhoneError();
            whatsappPhone.focus();
            return '';
        }

        clearPhoneError();
        return cleanPhone;
    }

    if (attendanceForm && attendanceDate) {
        attendanceDate.min = getTodayValue();

        if (whatsappPhone) {
            whatsappPhone.addEventListener('input', clearPhoneError);
        }

        attendanceDate.addEventListener('change', () => {
            clearDateError();

            if (!attendanceDate.value) {
                return;
            }

            const selectedDate = new Date(`${attendanceDate.value}T00:00:00`);
            const selectedDay = selectedDate.getDay();

            if (attendanceDate.value < getTodayValue()) {
                showDateError('No se pueden seleccionar fechas anteriores al día actual.');
                attendanceDate.value = '';
                return;
            }

            if (selectedDay === 0 || selectedDay === 6) {
                showDateError('Las charlas se realizan únicamente de lunes a viernes.');
                attendanceDate.value = '';
            }
        });

        attendanceForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            clearDateError();
            clearPhoneError();
            formMessage.textContent = '';
            formMessage.classList.remove('form-message-error');

            if (!attendanceForm.checkValidity()) {
                attendanceForm.reportValidity();
                return;
            }

            if (attendanceDate.value < getTodayValue()) {
                showDateError('No se pueden seleccionar fechas anteriores al día actual.');
                attendanceDate.value = '';
                attendanceDate.focus();
                return;
            }

            const selectedDate = new Date(`${attendanceDate.value}T00:00:00`);
            const selectedDay = selectedDate.getDay();

            if (selectedDay === 0 || selectedDay === 6) {
                showDateError('Las charlas se realizan únicamente de lunes a viernes.');
                attendanceDate.value = '';
                attendanceDate.focus();
                return;
            }

            const cleanWhatsapp = getValidPhoneValue();

            if (!cleanWhatsapp) {
                return;
            }

            const submitButton = attendanceForm.querySelector('button[type="submit"]');
            const originalButtonText = submitButton.textContent;
            const formData = new FormData(attendanceForm);
            const data = {
                nombre_apellido: formData.get('nombre_apellido'),
                whatsapp: cleanWhatsapp,
                dia_asistencia: formData.get('dia_asistencia'),
                horario_asistencia: formData.get('horario_asistencia'),
                zona: formData.get('zona'),
                tipo_vehiculo: formData.get('tipo_vehiculo'),
                fecha_registro: new Date().toLocaleString("es-AR")
            };

            submitButton.disabled = true;
            submitButton.textContent = 'Enviando...';

            try {
                await fetch(GOOGLE_SCRIPT_URL, {
                    method: "POST",
                    mode: "no-cors",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(data)
                });

                                if (typeof fbq !== "undefined") {
                    fbq("track", "Lead");
                }

                formMessage.textContent = 'Registro enviado correctamente. Te esperamos en la charla informativa.';
                attendanceForm.reset();
                attendanceDate.min = getTodayValue();
            } catch (error) {
                formMessage.textContent = 'No pudimos enviar el registro. Intentá nuevamente más tarde.';
                formMessage.classList.add('form-message-error');
            } finally {
                submitButton.disabled = false;
                submitButton.textContent = originalButtonText;
            }
        });
    }
});
