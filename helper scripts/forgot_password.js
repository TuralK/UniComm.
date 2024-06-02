// forgot_password.js
document.addEventListener('DOMContentLoaded', () => {
	const forgotPasswordLink = document.getElementById('forgotPasswordLink');
	const forgotPasswordModal = document.getElementById('forgotPasswordModal');
	const closeModal = document.querySelector('.modal .close');
	const forgotPasswordForm = document.getElementById('forgotPasswordForm');
	const errorDiv = document.querySelector('.forgot-password.error');
  
	forgotPasswordLink.addEventListener('click', () => {
	  forgotPasswordModal.style.display = 'block';
	});
  
	closeModal.addEventListener('click', () => {
	  forgotPasswordModal.style.display = 'none';
	});
  
	window.addEventListener('click', (event) => {
	  if (event.target == forgotPasswordModal) {
		forgotPasswordModal.style.display = 'none';
	  }
	});
  
	forgotPasswordForm.addEventListener('submit', async (e) => {
	  e.preventDefault();
	  errorDiv.textContent = '';
	  const email = document.getElementById('forgotPasswordEmail').value;
	  
	  try {
		const res = await fetch('/forgotPassword', {
		  method: 'POST',
		  body: JSON.stringify({ email }),
		  headers: { 'Content-Type': 'application/json' }
		});
		const data = await res.json();
		if (data.error) {
		  errorDiv.textContent = data.error;
		} else {
		  errorDiv.textContent = 'Password reset link has been sent.';
		}
	  } catch (err) {
		errorDiv.textContent = 'Failed to communicate with the server';
	  }
	});
  });
  