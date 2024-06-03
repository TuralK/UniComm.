const registerForm = document.querySelector('form.register__form');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const duplicateError = document.querySelector('.duplicate.error');
    const emailError = document.querySelector('.email.error');
    const passwordError = document.querySelector('.password.error');
    const loadingMessage = document.querySelector('.loading-message');
    const gap_1 = document.querySelector('.gap_1');
    const gap_2 = document.querySelector('.gap_2');

    // Reset errors
    duplicateError.textContent = '';
    emailError.textContent = '';
    passwordError.textContent = '';

    // Hide all error messages
    document.querySelectorAll('.error').forEach(error => {
        error.style.display = 'none';
    });
    gap_1.style.display = 'block';
    gap_2.style.display = 'block';

    // Show loading message
    loadingMessage.style.display = 'block';

    // Get form values
    const email = registerForm.querySelector('#email').value;
    const username = registerForm.querySelector('#username').value;
    const password = registerForm.querySelector('#password').value;
    const university = registerForm.querySelector('#university').value;
    const faculty = registerForm.querySelector('#faculty').value;
    const department = registerForm.querySelector('#department').value;
    const studentFile = registerForm.querySelector('#studentFile').files[0];

    // Create FormData object
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('university', university);
    formData.append('faculty', faculty);
    formData.append('department', department);
    formData.append('studentFile', studentFile);

    try {
        const res = await fetch('/register', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();

        // Hide loading message
        loadingMessage.style.display = 'none';

        if (data.errors) {
            duplicateError.textContent = data.errors.duplicate;
            emailError.textContent = data.errors.email;
            passwordError.textContent = data.errors.password;
            // Show only the latest error
            if (duplicateError.textContent !== '') {
                duplicateError.style.display = 'block';
                gap_1.style.display = 'none';
            } else if (emailError.textContent !== '') {
                emailError.style.display = 'block';
                gap_1.style.display = 'none';
            } else if (passwordError.textContent !== '') {
                passwordError.style.display = 'block';
                gap_2.style.display = 'none';
            }
        } else {
            if (data.message === "registration pending...") {
                alert(data.message);
            }
            location.assign("/");
        }

    } catch (err) {
        loadingMessage.style.display = 'none';
        emailError.textContent = 'Failed to communicate with the server';
        emailError.style.display = 'block';
    }
});
