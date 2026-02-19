// Authentication JavaScript
/* global users, admin, saveUsers */

// Track authentication state
let isLoginMode = true;
let isOtpMode = false;
let otpTimer = null;
let otpTimeLeft = 60;
let passwordValidation = {
    length: false,
    uppercase: false,
    number: false,
    special: false
};

document.addEventListener('DOMContentLoaded', function () {
    setupAuthEventListeners();

    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    /* 
    if (savedUser && window.location.pathname.includes('login.html')) {
        window.location.href = 'user-dashboard.html';
    }
    */
});

function setupAuthEventListeners() {
    // Detect modern login page (single form with id="email", uses handleLoginModern inline)
    const isModernLoginPage = document.getElementById('loginForm') && !document.getElementById('loginEmail');
    if (isModernLoginPage) {
        // Modern login (login.html) uses inline onsubmit and switchTab/toggleAuthMode - skip duplicate handlers
        return;
    }

    // Form submissions (legacy auth pages with loginEmail / signupForm)
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', handleSignup);
    }

    // Switch between login and signup (only when separate signup form exists)
    const switchLink = document.getElementById('switchLink');
    if (switchLink && signupForm) {
        switchLink.addEventListener('click', toggleAuthMode);
    }

    // OTP method toggle
    const passwordMethodBtn = document.getElementById('passwordMethodBtn');
    const otpMethodBtn = document.getElementById('otpMethodBtn');
    const sendOtpBtn = document.getElementById('sendOtpBtn');

    if (passwordMethodBtn) {
        passwordMethodBtn.addEventListener('click', () => switchLoginMethod(false));
    }
    if (otpMethodBtn) {
        otpMethodBtn.addEventListener('click', () => switchLoginMethod(true));
    }
    if (sendOtpBtn) {
        sendOtpBtn.addEventListener('click', sendOtp);
    }

    // Password validation and show/hide functionality
    setupPasswordValidation();
    setupPasswordToggle();

    // Real-time validation
    const inputs = document.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

function setupPasswordValidation() {
    const signupPassword = document.getElementById('signupPassword');
    const confirmPassword = document.getElementById('confirmPassword');
    const submitBtn = document.getElementById('signupSubmitBtn');

    if (signupPassword) {
        signupPassword.addEventListener('input', function () {
            validatePassword(this.value);
            updateSubmitButton();
        });
    }

    if (confirmPassword) {
        confirmPassword.addEventListener('input', function () {
            validatePasswordMatch();
            updateSubmitButton();
        });
    }
}

// Validate password complexity
function validatePassword(password) {
    // Regular expressions for password validation
    const lengthRegex = /.{8,}/;
    const uppercaseRegex = /[A-Z]/;
    const numberRegex = /[0-9]/;
    const specialRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    // Update validation state
    passwordValidation.length = lengthRegex.test(password);
    passwordValidation.uppercase = uppercaseRegex.test(password);
    passwordValidation.number = numberRegex.test(password);
    passwordValidation.special = specialRegex.test(password);

    // Update UI
    updateRequirement('lengthReq', passwordValidation.length);
    updateRequirement('uppercaseReq', passwordValidation.uppercase);
    updateRequirement('numberReq', passwordValidation.number);
    updateRequirement('specialReq', passwordValidation.special);

    // Update input styling
    const passwordInput = document.getElementById('signupPassword');
    const formGroup = passwordInput.parentElement.parentElement;

    if (isPasswordValid()) {
        passwordInput.classList.remove('error');
        passwordInput.classList.add('success');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
    } else {
        passwordInput.classList.remove('success');
        passwordInput.classList.add('error');
        formGroup.classList.remove('success');
        formGroup.classList.add('error');
    }
}

function updateRequirement(elementId, isValid) {
    const element = document.getElementById(elementId);
    if (!element) return;

    const icon = element.querySelector('i');

    if (isValid) {
        element.classList.remove('invalid');
        element.classList.add('valid');
        icon.className = 'fas fa-check';
    } else {
        element.classList.remove('valid');
        element.classList.add('invalid');
        icon.className = 'fas fa-times';
    }
}

function isPasswordValid() {
    return passwordValidation.length &&
        passwordValidation.uppercase &&
        passwordValidation.number &&
        passwordValidation.special;
}

function validatePasswordMatch() {
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    const formGroup = confirmInput.parentElement.parentElement;

    if (confirmPassword && password !== confirmPassword) {
        confirmInput.classList.add('error');
        confirmInput.classList.remove('success');
        formGroup.classList.add('error');
        formGroup.classList.remove('success');
        showFieldError('confirmPassword', 'Passwords do not match');
        return false;
    } else if (confirmPassword && password === confirmPassword) {
        confirmInput.classList.remove('error');
        confirmInput.classList.add('success');
        formGroup.classList.remove('error');
        formGroup.classList.add('success');
        clearFieldError('confirmPassword');
        return true;
    }
    return false;
}

function updateSubmitButton() {
    const submitBtn = document.getElementById('signupSubmitBtn');
    const name = document.getElementById('signupName').value.trim();
    const email = document.getElementById('signupEmail').value.trim();
    const passwordMatch = validatePasswordMatch();

    if (name && email && isPasswordValid() && passwordMatch) {
        submitBtn.disabled = false;
        submitBtn.classList.remove('disabled');
    } else {
        submitBtn.disabled = true;
        submitBtn.classList.add('disabled');
    }
}

function setupPasswordToggle() {
    // Signup password toggle
    const signupPasswordToggle = document.getElementById('signupPasswordToggle');
    if (signupPasswordToggle) {
        signupPasswordToggle.addEventListener('click', function () {
            togglePasswordVisibility('signupPassword', 'signupPasswordToggle');
        });
    }

    // Confirm password toggle
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    if (confirmPasswordToggle) {
        confirmPasswordToggle.addEventListener('click', function () {
            togglePasswordVisibility('confirmPassword', 'confirmPasswordToggle');
        });
    }
}

function togglePasswordVisibility(inputId, toggleId) {
    const input = document.getElementById(inputId);
    const toggle = document.getElementById(toggleId);
    const icon = toggle.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function switchLoginMethod(useOtp) {
    isOtpMode = useOtp;

    const passwordMethodBtn = document.getElementById('passwordMethodBtn');
    const otpMethodBtn = document.getElementById('otpMethodBtn');
    const passwordMethod = document.getElementById('passwordMethod');
    const otpMethod = document.getElementById('otpMethod');
    const loginPassword = document.getElementById('loginPassword');
    const otpInput = document.getElementById('otpInput');

    if (useOtp) {
        passwordMethodBtn.classList.remove('active');
        otpMethodBtn.classList.add('active');
        passwordMethod.style.display = 'none';
        otpMethod.style.display = 'block';
        if (loginPassword) loginPassword.removeAttribute('required');
        if (otpInput) otpInput.setAttribute('required', 'required');
    } else {
        passwordMethodBtn.classList.add('active');
        otpMethodBtn.classList.remove('active');
        passwordMethod.style.display = 'block';
        otpMethod.style.display = 'none';
        if (loginPassword) loginPassword.setAttribute('required', 'required');
        if (otpInput) otpInput.removeAttribute('required');
    }
}

// Simulate MFA flow with countdown
function sendOtp() {
    const email = document.getElementById('loginEmail').value;
    const sendOtpBtn = document.getElementById('sendOtpBtn');
    const otpTimer = document.getElementById('otpTimer');
    const timerCount = document.getElementById('timerCount');

    if (!email) {
        showFieldError('loginEmail', 'Please enter your email first');
        return;
    }

    // Simulate sending OTP
    sendOtpBtn.style.display = 'none';
    otpTimer.style.display = 'block';

    showNotification('OTP sent to your email! Demo OTP: 123456', 'success');

    // Start countdown
    otpTimeLeft = 60;
    const countdown = setInterval(() => {
        otpTimeLeft--;
        timerCount.textContent = otpTimeLeft;

        if (otpTimeLeft <= 0) {
            clearInterval(countdown);
            sendOtpBtn.style.display = 'block';
            otpTimer.style.display = 'none';
        }
    }, 1000);
}

function toggleAuthMode(e) {
    e.preventDefault();

    const loginForm = document.getElementById('loginForm');
    const signupForm = document.getElementById('signupForm');
    // Modern login page has single form only - don't hide it
    if (!signupForm || !loginForm) return;

    const authTitle = document.getElementById('authTitle');
    const authSubtitle = document.getElementById('authSubtitle');
    const switchText = document.getElementById('switchText');
    const switchLink = document.getElementById('switchLink');

    isLoginMode = !isLoginMode;

    if (isLoginMode) {
        loginForm.style.display = 'block';
        signupForm.style.display = 'none';
        authTitle.textContent = 'Welcome Back';
        authSubtitle.textContent = 'Sign in to your account';
        switchText.innerHTML = 'Don\'t have an account? ';
        switchLink.textContent = 'Sign up here';
    } else {
        loginForm.style.display = 'none';
        signupForm.style.display = 'block';
        authTitle.textContent = 'Create Account';
        authSubtitle.textContent = 'Join SmartPrice Monitor today';
        switchText.innerHTML = 'Already have an account? ';
        switchLink.textContent = 'Sign in here';
    }

    // Clear any existing errors
    clearAllErrors();
}

function handleLogin(e) {
    e.preventDefault();

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const otp = document.getElementById('otpInput') ? document.getElementById('otpInput').value : '';
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validate inputs
    if (!validateLoginForm()) {
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        let loginSuccess = false;
        let user = null;

        if (isOtpMode) {
            // OTP login
            if (otp === '123456') {
                // Find user by email for OTP login
                user = users.find(u => u.email === email);
                if (user) {
                    loginSuccess = true;
                } else {
                    showFieldError('loginEmail', 'No account found with this email');
                }
            } else {
                showFieldError('otpInput', 'Invalid OTP. Demo OTP is 123456');
            }
        } else {
            // Password login
            user = users.find(u => u.email === email);
            if (user) {
                if (user.password === password) {
                    loginSuccess = true;
                } else {
                    showFieldError('loginPassword', 'Incorrect password');
                }
            } else {
                showFieldError('loginEmail', 'No account found with this email');
            }
        }

        if (loginSuccess && user) {
            // Login successful
            currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));

            const method = isOtpMode ? 'OTP' : 'password';
            showNotification(`Login successful with ${method}!`, 'success');

            // Redirect after short delay
            setTimeout(() => {
                if (user.role === 'admin') {
                    window.location.href = 'admin.html';
                } else {
                    window.location.href = 'user-dashboard.html';
                }
            }, 1000);
        } else {
            showNotification('Login failed. Please check your credentials.', 'error');
        }

        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 1500);
}

// Save user to LocalStorage
function handleSignup(e) {
    e.preventDefault();

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Validate inputs
    if (!validateSignupForm()) {
        return;
    }

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        // Comprehensive validation: Check if user already exists by email
        const existingEmail = users.find(u => u.email.toLowerCase() === email.toLowerCase());

        // Also check for reserved admin emails
        const reservedEmails = ['admin@monitor.com', 'admin@smartprice.com'];
        const isReservedEmail = reservedEmails.some(reserved => email.toLowerCase() === reserved.toLowerCase());

        if (isReservedEmail) {
            showFieldError('signupEmail', 'This email is reserved for system use');
            showNotification('Cannot create account with reserved email address.', 'error');
        } else if (existingEmail) {
            showFieldError('signupEmail', 'An account with this email already exists');
            showNotification('Account already exists. Please use a different email or login instead.', 'error');
        } else {
            // Create new user with unique ID based on timestamp
            const newUser = {
                id: Date.now(), // Use timestamp for unique ID
                name: name,
                email: email,
                password: password,
                role: 'user',
                orders: [],
                profileImage: null,
                createdAt: new Date().toISOString(), // Track account creation date
                preferences: {
                    theme: 'light',
                    preferredPlatform: 'flipkart'
                }
            };

            users.push(newUser);
            saveUsers();
            currentUser = newUser;
            localStorage.setItem('currentUser', JSON.stringify(newUser));

            showNotification('Account created successfully! Welcome to SmartPrice Monitor.', 'success');

            // Redirect after short delay
            setTimeout(() => {
                window.location.href = 'user-dashboard.html';
            }, 1000);
        }

        // Remove loading state
        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 1500);
}

function validateLoginForm() {
    let isValid = true;

    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword') ? document.getElementById('loginPassword').value : '';
    const otp = document.getElementById('otpInput') ? document.getElementById('otpInput').value : '';

    // Clear previous errors
    clearAllErrors();

    // Validate email
    if (!email) {
        showFieldError('loginEmail', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'Please enter a valid email');
        isValid = false;
    }

    // Validate password or OTP based on mode
    if (isOtpMode) {
        if (!otp) {
            showFieldError('otpInput', 'OTP is required');
            isValid = false;
        } else if (otp.length !== 6) {
            showFieldError('otpInput', 'OTP must be 6 digits');
            isValid = false;
        }
    } else {
        if (!password) {
            showFieldError('loginPassword', 'Password is required');
            isValid = false;
        }
    }

    return isValid;
}

function validateSignupForm() {
    let isValid = true;

    const name = document.getElementById('signupName').value;
    const email = document.getElementById('signupEmail').value;
    const password = document.getElementById('signupPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    // Clear previous errors
    clearAllErrors();

    // Validate name
    if (!name.trim()) {
        showFieldError('signupName', 'Full name is required');
        isValid = false;
    } else if (name.trim().length < 2) {
        showFieldError('signupName', 'Name must be at least 2 characters');
        isValid = false;
    }

    // Validate email
    if (!email) {
        showFieldError('signupEmail', 'Email is required');
        isValid = false;
    } else if (!isValidEmail(email)) {
        showFieldError('signupEmail', 'Please enter a valid email');
        isValid = false;
    }

    // Validate password using new validation system
    if (!password) {
        showFieldError('signupPassword', 'Password is required');
        isValid = false;
    } else if (!isPasswordValid()) {
        showFieldError('signupPassword', 'Password does not meet the requirements');
        isValid = false;
    }

    // Validate confirm password
    if (!confirmPassword) {
        showFieldError('confirmPassword', 'Please confirm your password');
        isValid = false;
    } else if (password !== confirmPassword) {
        showFieldError('confirmPassword', 'Passwords do not match');
        isValid = false;
    }

    return isValid;
}

function validateField(e) {
    const field = e.target;
    const fieldId = field.id;
    const value = field.value;

    clearFieldError(fieldId);

    switch (fieldId) {
        case 'loginEmail':
        case 'signupEmail':
            if (value && !isValidEmail(value)) {
                showFieldError(fieldId, 'Please enter a valid email');
            } else if (value) {
                showFieldSuccess(fieldId);
            }
            break;

        case 'signupName':
            if (value && value.trim().length < 2) {
                showFieldError(fieldId, 'Name must be at least 2 characters');
            } else if (value.trim()) {
                showFieldSuccess(fieldId);
            }
            break;

        case 'signupPassword':
            if (value && value.length < 6) {
                showFieldError(fieldId, 'Password must be at least 6 characters');
            } else if (value) {
                showFieldSuccess(fieldId);
            }
            break;

        case 'confirmPassword':
            const password = document.getElementById('signupPassword').value;
            if (value && value !== password) {
                showFieldError(fieldId, 'Passwords do not match');
            } else if (value && value === password) {
                showFieldSuccess(fieldId);
            }
            break;
    }
}

function clearFieldError(fieldId) {
    if (typeof fieldId === 'object') {
        fieldId = fieldId.target.id;
    }

    const field = document.getElementById(fieldId);
    if (!field) return;

    const formGroup = field.parentElement;

    field.classList.remove('error', 'success');
    formGroup.classList.remove('error', 'success');

    const existingError = formGroup.querySelector('.error-message');
    const existingSuccess = formGroup.querySelector('.success-message');

    if (existingError) {
        existingError.remove();
    }
    if (existingSuccess) {
        existingSuccess.remove();
    }
}

function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const formGroup = field.parentElement;

    field.classList.add('error');
    formGroup.classList.add('error');

    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;

    formGroup.appendChild(errorDiv);
}

function showFieldSuccess(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    const formGroup = field.parentElement;

    field.classList.add('success');
    formGroup.classList.add('success');

    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = '<i class="fas fa-check"></i> Looks good!';

    formGroup.appendChild(successDiv);
}

function clearAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message, .success-message');
    errorMessages.forEach(msg => msg.remove());

    const fields = document.querySelectorAll('input');
    fields.forEach(field => {
        field.classList.remove('error', 'success');
        if (field.parentElement) {
            field.parentElement.classList.remove('error', 'success');
        }
    });
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function fillUserCredentials() {
    document.getElementById('loginEmail').value = 'john@example.com';
    if (!isOtpMode) {
        const passwordField = document.getElementById('loginPassword');
        if (passwordField) {
            passwordField.value = 'user123';
        }
    } else {
        const otpField = document.getElementById('otpInput');
        if (otpField) {
            otpField.value = '123456';
        }
    }
}

// Admin Login Functions
function handleAdminLogin(e) {
    e.preventDefault();

    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    // Show loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Simulate API call
    setTimeout(() => {
        if (username === admin.username && password === admin.password) {
            // Admin login successful
            const adminUser = { ...admin, profileImage: 'https://via.placeholder.com/150' };
            localStorage.setItem('currentAdmin', JSON.stringify(adminUser));
            showNotification('Admin login successful!', 'success');

            setTimeout(() => {
                window.location.href = 'admin-dashboard.html';
            }, 1000);
        } else {
            showFieldError('adminPassword', 'Invalid username or password');
            showNotification('Invalid admin credentials', 'error');
        }

        submitBtn.classList.remove('loading');
        submitBtn.disabled = false;
    }, 1500);
}

function fillAdminCredentials() {
    document.getElementById('adminUsername').value = 'smartpricemonitor';
    document.getElementById('adminPassword').value = 'smartpricemonitor12345';
}