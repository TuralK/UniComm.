document.addEventListener('DOMContentLoaded', function() {
	document.querySelectorAll('.voting').forEach(function(div) {
		const answerId = div.dataset.answerId;
		const idsCookie = getCookie('ids');
		const decodedCookie = idsCookie ? JSON.parse(decodeURIComponent(idsCookie)) : {};

		if (decodedCookie[answerId] === 'dislike') {
			div.querySelector('.dislike-button').classList.add('clicked');
			div.querySelector('.dislike-button').innerHTML = '<i class="ri-thumb-down-fill"></i>';
		}
		if (decodedCookie[answerId] === 'like') {
			div.querySelector('.like-button').classList.add('clicked');
			div.querySelector('.like-button').innerHTML = '<i class="ri-thumb-up-fill"></i>';
		}

		div.querySelector('.like-button').addEventListener('click', function() {
			handleVote('like', answerId, div);
		});

		div.querySelector('.dislike-button').addEventListener('click', function() {
			handleVote('dislike', answerId, div);
		});
	});
});

function handleVote(vote, answerId, div) {
	const likeButton = div.querySelector('.like-button');
	const dislikeButton = div.querySelector('.dislike-button');

	const isActive = (vote === 'like' && likeButton.classList.contains('clicked')) ||
		(vote === 'dislike' && dislikeButton.classList.contains('clicked')) ?
		'yes' : 'no';

	// Optimistically update the UI
	if (isActive === 'yes') {
		likeButton.classList.remove('clicked');
		dislikeButton.classList.remove('clicked');
		likeButton.innerHTML = '<i class="ri-thumb-up-line"></i>';
		dislikeButton.innerHTML = '<i class="ri-thumb-down-line"></i>';
	} else {
		likeButton.classList.remove('clicked');
		dislikeButton.classList.remove('clicked');
		if (vote === 'like') {
			likeButton.classList.add('clicked');
			likeButton.innerHTML = '<i class="ri-thumb-up-fill"></i>'; // Black thumb-up icon
			dislikeButton.innerHTML = '<i class="ri-thumb-down-line"></i>';
		} else {
			dislikeButton.classList.add('clicked');
			dislikeButton.innerHTML = '<i class="ri-thumb-down-fill"></i>'; // Black thumb-down icon
			likeButton.innerHTML = '<i class="ri-thumb-up-line"></i>';
		}
	}

	sendVote(vote, answerId, div, isActive);
}

function sendVote(vote, answerId, div, isActive) {
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
		likeCount.textContent = data.likes;
		dislikeCount.textContent = data.dislikes;
		updateCookie(answerId, isActive === 'yes' ? null : vote);
	})
	.catch(error => {
		console.error('Error recording vote:', error);
	});
}

function updateCookie(answerId, vote) {
	const idsCookie = getCookie('ids');
	const decodedCookie = idsCookie ? JSON.parse(decodeURIComponent(idsCookie)) : {};
	if (vote) {
		decodedCookie[answerId] = vote;
	} else {
		delete decodedCookie[answerId];
	}
	document.cookie = `ids=${encodeURIComponent(JSON.stringify(decodedCookie))};path=/;max-age=${60*60*24*30};`; // Set cookie for 30 days
}

function getCookie(name) {
	const value = `; ${document.cookie}`;
	const parts = value.split(`; ${name}=`);
	if (parts.length === 2) return parts.pop().split(';').shift();
	return null;
}