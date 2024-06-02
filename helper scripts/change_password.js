// change_password.js
document.addEventListener('DOMContentLoaded', () => {
	const form = document.getElementById('changePasswordForm');
	const errorDiv = document.querySelector('.change-password.error');
	const urlParams = new URLSearchParams(window.location.search);
	const token = urlParams.get('token');
  
	form.addEventListener('submit', async (e) => {
	  e.preventDefault();
	  errorDiv.textContent = '';
  
	  const password = form.password.value;
	  const confirmPassword = form.confirmPassword.value;
  
	  try {
		const res = await fetch('/changePassword', {
		  method: 'POST',
		  body: JSON.stringify({ password, confirmPassword, token }),
		  headers: { 'Content-Type': 'application/json' }
		});
		const data = await res.json();
		if (data.error) {
		  errorDiv.textContent = data.error;
		} else {
			alert('Password updated successfully');
			location.assign("/login");
		}
	  } catch (err) {
		errorDiv.textContent = 'Failed to communicate with the server';
	  }
	});
  });
  