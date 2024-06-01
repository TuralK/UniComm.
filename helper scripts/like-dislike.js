document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.voting').forEach(function(div) {
        const answerId = div.dataset.answerId;
        console.log("Answer ID: ", answerId); // Debug line to check if answerId is coming through
        div.querySelector('.like-button').addEventListener('click', function() {
            sendVote('like', answerId, div);
        });

        div.querySelector('.dislike-button').addEventListener('click', function() {
            sendVote('dislike', answerId, div);
        });
    });
});

function sendVote(vote, answerId, div) {
    // Optimistically update the UI
    const likeCount = div.querySelector('.like-count');
    const dislikeCount = div.querySelector('.dislike-count');
    
    if (vote === 'like') {
        likeCount.textContent = parseInt(likeCount.textContent) + 1;
    } else if (vote === 'dislike') {
        dislikeCount.textContent = parseInt(dislikeCount.textContent) + 1;
    }

    fetch(`http://localhost:3000/${answerId}/vote?vote=${vote}`, {
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
        // Ensure the counts are updated with data from the server
        likeCount.textContent = data.likes;
        dislikeCount.textContent = data.dislikes;
    })
    .catch(error => {
        console.error('Error recording vote:', error);
        // Handle error, revert optimistic update if needed
        if (vote === 'like') {
            likeCount.textContent = parseInt(likeCount.textContent) - 1;
        } else if (vote === 'dislike') {
            dislikeCount.textContent = parseInt(dislikeCount.textContent) - 1;
        }
    });
}