function sendVote(vote,answerId) {
    fetch(`/${answerId}/vote?vote=${vote}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Voting is interrupted by an error');
      }
      return response.json();
    })
    .then(data => {
      console.log(`Vote recorded for answer ${answerId}:`, data);
      //data contains json of likes and dislikes
      
    })
    .catch(error => {
      console.error('Error recording vote:', error);
      // Handle error, show message, etc.
    });
  }

document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.voting').forEach(function(div) {
        div.querySelectorAll('.btn').forEach(function(button){
            button.addEventListener('click', function() {
                console.log("tıklandı");
                });
        })
    });
});