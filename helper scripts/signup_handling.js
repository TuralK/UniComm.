document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.btn').forEach(function(button) {
        button.addEventListener('click', function() {
            const studentId = this.getAttribute('data-id');
            const action = this.getAttribute('data-action');
            const isApproved = action === 'approve';

            fetch(`/admin/student/${studentId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ isApproved: isApproved })
            })
            .then(response => response.json())
            .then(data => {
                if (data.message) {
                    alert(data.message);
                    window.location.href = '/displayFiles';
                } else {
                    alert('Action failed: ' + (data.errors || 'Unknown error'));
                }
            })
            .catch(error => {
                console.error('Error processing the request:', error);
                alert('An error occurred. Please try again later.');
            });
        });
    });
});