// Reservations Page Functionality
document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservationForm');
    const dateInput = document.getElementById('date');
    const timeSelect = document.getElementById('time');
    const guestsSelect = document.getElementById('guests');

    // Set minimum date to today
    const today = new Date();
    const maxDate = new Date();
    maxDate.setMonth(maxDate.getMonth() + 3); // Allow bookings up to 3 months in advance
    
    dateInput.min = today.toISOString().split('T')[0];
    dateInput.max = maxDate.toISOString().split('T')[0];

    // Update available times based on selected date
    dateInput.addEventListener('change', function() {
        updateAvailableTimes();
    });

    function updateAvailableTimes() {
        const selectedDate = new Date(dateInput.value);
        const dayOfWeek = selectedDate.getDay(); // 0 = Sunday, 1 = Monday, etc.
        
        // Clear current options
        timeSelect.innerHTML = '<option value="">Select Time</option>';
        
        let availableTimes = [];
        
        if (dayOfWeek === 0) { // Sunday
            availableTimes = [
                { time: '16:00', display: '4:00 PM' },
                { time: '16:30', display: '4:30 PM' },
                { time: '17:00', display: '5:00 PM' },
                { time: '17:30', display: '5:30 PM' },
                { time: '18:00', display: '6:00 PM' },
                { time: '18:30', display: '6:30 PM' },
                { time: '19:00', display: '7:00 PM' },
                { time: '19:30', display: '7:30 PM' },
                { time: '20:00', display: '8:00 PM' },
                { time: '20:30', display: '8:30 PM' }
            ];
        } else { // Monday-Saturday
            availableTimes = [
                { time: '17:00', display: '5:00 PM' },
                { time: '17:30', display: '5:30 PM' },
                { time: '18:00', display: '6:00 PM' },
                { time: '18:30', display: '6:30 PM' },
                { time: '19:00', display: '7:00 PM' },
                { time: '19:30', display: '7:30 PM' },
                { time: '20:00', display: '8:00 PM' },
                { time: '20:30', display: '8:30 PM' },
                { time: '21:00', display: '9:00 PM' },
                { time: '21:30', display: '9:30 PM' }
            ];
        }
        
        // Add time options
        availableTimes.forEach(timeSlot => {
            const option = document.createElement('option');
            option.value = timeSlot.time;
            option.textContent = timeSlot.display;
            timeSelect.appendChild(option);
        });
    }

    // Form submission
    reservationForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Basic validation
        if (!validateForm()) {
            return;
        }
        
        // Collect form data
        const formData = new FormData(this);
        const reservationData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            date: formData.get('date'),
            time: formData.get('time'),
            guests: formData.get('guests'),
            special_requests: formData.get('specialRequests'),
            submitted_at: new Date().toISOString()
        };
        
        // Show loading state
        const submitBtn = document.querySelector('.reservation-submit-btn');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        submitBtn.disabled = true;
        
        // Submit to Supabase
        try {
            const { data, error } = await supabase
                .from(TABLES.RESERVATIONS)
                .insert([{
                    ...reservationData,
                    status: 'pending'
                }])
                .select();

            if (error) throw error;

            // Show success message
            showNotification('Reservation submitted successfully! We\'ll confirm within 2 hours.', 'success');
            
            // Reset form
            this.reset();
            
            // Update available times
            updateAvailableTimes();
            
        } catch (error) {
            console.error('Error submitting reservation:', error);
            showNotification('Failed to submit reservation. Please try again.', 'error');
        } finally {
            // Reset button
            submitBtn.innerHTML = originalText;
            submitBtn.disabled = false;
        }
    });

    function validateForm() {
        const requiredFields = ['name', 'email', 'phone', 'date', 'time', 'guests'];
        let isValid = true;
        
        requiredFields.forEach(fieldName => {
            const field = document.getElementById(fieldName);
            const value = field.value.trim();
            
            if (!value) {
                showFieldError(field, 'This field is required');
                isValid = false;
            } else {
                clearFieldError(field);
            }
        });
        
        // Email validation
        const emailField = document.getElementById('email');
        const emailValue = emailField.value.trim();
        if (emailValue && !isValidEmail(emailValue)) {
            showFieldError(emailField, 'Please enter a valid email address');
            isValid = false;
        }
        
        // Phone validation (if provided)
        const phoneField = document.getElementById('phone');
        const phoneValue = phoneField.value.trim();
        if (phoneValue && !isValidPhone(phoneValue)) {
            showFieldError(phoneField, 'Please enter a valid phone number');
            isValid = false;
        }
        
        // Date validation
        const dateField = document.getElementById('date');
        const selectedDate = new Date(dateField.value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            showFieldError(dateField, 'Please select a future date');
            isValid = false;
        }
        
        return isValid;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
    }

    function showFieldError(field, message) {
        // Remove existing error
        clearFieldError(field);
        
        // Add error styling
        field.style.borderColor = '#A4161A';
        field.style.boxShadow = '0 0 0 3px rgba(164, 22, 26, 0.1)';
        
        // Create error message
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.textContent = message;
        errorDiv.style.color = '#A4161A';
        errorDiv.style.fontSize = '0.8rem';
        errorDiv.style.marginTop = '0.25rem';
        errorDiv.style.fontWeight = '500';
        
        field.parentNode.appendChild(errorDiv);
    }

    function clearFieldError(field) {
        field.style.borderColor = '#E5E5E5';
        field.style.boxShadow = 'none';
        
        const existingError = field.parentNode.querySelector('.field-error');
        if (existingError) {
            existingError.remove();
        }
    }

    // Real-time validation
    const formFields = reservationForm.querySelectorAll('input, select, textarea');
    formFields.forEach(field => {
        field.addEventListener('blur', function() {
            const value = this.value.trim();
            
            if (this.hasAttribute('required') && !value) {
                showFieldError(this, 'This field is required');
            } else if (this.type === 'email' && value && !isValidEmail(value)) {
                showFieldError(this, 'Please enter a valid email address');
            } else if (this.name === 'phone' && value && !isValidPhone(value)) {
                showFieldError(this, 'Please enter a valid phone number');
            } else if (this.name === 'phone' && this.hasAttribute('required') && !value) {
                showFieldError(this, 'This field is required');
            } else {
                clearFieldError(this);
            }
        });
        
        field.addEventListener('input', function() {
            clearFieldError(this);
        });
    });

    // Notification function
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Add styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 10px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 400px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
        `;

        // Set background color based on type
        const colors = {
            success: '#51CF66',
            error: '#FF6B6B',
            info: '#339AF0'
        };
        notification.style.background = colors[type] || colors.info;

        document.body.appendChild(notification);

        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }

    // Add CSS animations for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

    // Initialize available times
    updateAvailableTimes();
}); 