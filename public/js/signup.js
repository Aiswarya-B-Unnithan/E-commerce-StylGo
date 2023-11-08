document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('registrationForm');
    const fullNameInput = document.getElementById('fullName');
    const mobileNumberInput = document.getElementById('mobileNo');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const passwordrepeat = document.getElementById('repeat');
  
    // Event listener for full name validation
    fullNameInput.addEventListener('input', function () {
      const fullNameValue = fullNameInput.value.trim();
      const fullNameError = document.getElementById('fullNameError');
  
      if (!fullNameValue.match(/^[a-zA-Z\s]+$/)) {
        fullNameError.textContent = 'Invalid full name format';
      } else {
        fullNameError.textContent = ''; // Clear error message
      }
    });
    // Event listener for mobile number validation
    mobileNumberInput.addEventListener('input', function () {
      const mobileNumberValue = mobileNumberInput.value.trim();
      const mobileNumberError = document.getElementById('mobileNoError');
  
      if (!validator.isMobilePhone(mobileNumberValue, 'any', { strictMode: false })) {
        mobileNumberError.textContent = 'Invalid mobile number';
      } else {
        mobileNumberError.textContent = ''; // Clear error message
      }
    });
  
    // Event listener for email validation
    emailInput.addEventListener('input', function () {
      const emailError = document.getElementById('emailError');
  
      if (!emailInput.checkValidity()) {
        emailError.textContent = 'Invalid email address';
      } else {
        emailError.textContent = ''; // Clear error message
      }
    });
  
    // Event listener for password validation
    passwordInput.addEventListener('input', function () {
      const passwordValue = passwordInput.value;
      const passwordError = document.getElementById('passwordError');
  
      if (passwordValue.length < 8) {
        passwordError.textContent = 'Password must be at least 8 characters long';
      } else {
        passwordError.textContent = ''; // Clear error message
      }
    });
  // Event listener for password repeat validation
  passwordrepeat.addEventListener('input', function () {
    const passwordValue = passwordInput.value;
    const passwordError = document.getElementById('repeatError');

    if (passwordValue.length < 8) {
      passwordError.textContent = 'Password must be at least 8 characters long';
    } else {
      passwordError.textContent = ''; // Clear error message
    }
  });

    // Form submission
    form.addEventListener('submit', function (event) {
      event.preventDefault(); // Prevent the form from submitting
  
      // Check if there are any error messages present
      const errorMessages = form.querySelectorAll('.error');
      const hasErrors = Array.from(errorMessages).some((error) => error.textContent);
  
      if (!hasErrors) {
        // If no errors, submit the form to the server
        form.submit();
      }
    });
  });