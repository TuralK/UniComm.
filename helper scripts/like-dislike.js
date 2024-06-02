document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.voting').forEach(function(div) {
        const answerId = div.dataset.answerId;
        console.log("Answer ID: ", answerId); // Debug line to check if answerId is coming through
        const idsCookie = getCookie('ids');
        const decodedCookie = JSON.parse(decodeURIComponent(idsCookie));
        if (decodedCookie[answerId] === 'dislike') {div.querySelector('.dislike-button').style.backgroundColor = 'blue';}
        if(decodedCookie[answerId]==='like'){div.querySelector('.like-button').style.backgroundColor = 'blue';};
        div.querySelector('.like-button').addEventListener('click', function() {
            const idsCookie = getCookie('ids');
            const decodedCookie = JSON.parse(decodeURIComponent(idsCookie));
            let isActive="";
            if(div.querySelector('.like-button').style.backgroundColor =='blue'){isActive='yes';}
            else{isActive='no';}
            sendVote('like', answerId, div,isActive);
            if(decodedCookie[answerId]==='like' && isActive=='yes'){div.querySelector('.like-button').style.backgroundColor = 'buttonface';}
            else{div.querySelector('.like-button').style.backgroundColor = 'blue';
            div.querySelector('.dislike-button').style.backgroundColor = 'buttonface';}
            
        });
        div.querySelector('.dislike-button').addEventListener('click', function() {
            let isActive="";
            if(div.querySelector('.dislike-button').style.backgroundColor =='blue'){isActive='yes';}
            else{isActive='no';}
            sendVote('dislike', answerId, div,isActive);
            const idsCookie = getCookie('ids');
            const decodedCookie = JSON.parse(decodeURIComponent(idsCookie));
            if (decodedCookie[answerId] === 'dislike' && isActive=='yes') {div.querySelector('.dislike-button').style.backgroundColor = 'buttonface';}
            else{div.querySelector('.dislike-button').style.backgroundColor = 'blue';
            div.querySelector('.like-button').style.backgroundColor = 'buttonface';}
            
        });
    });
});

function sendVote(vote, answerId, div,isActive) {
    // Optimistically update the UI
    const likeCount = div.querySelector('.like-count');
    const dislikeCount = div.querySelector('.dislike-count');

    fetch(`/${answerId}/vote?vote=${vote}&isActive=${isActive}`, {
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
    });
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }