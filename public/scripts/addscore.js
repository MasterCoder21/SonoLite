async function addScore() {
	let jacketData = null;
	let musicData = null;
	var scoreData = null;
	const jacketSelector = document.getElementById('addscore_jacket');
	const jacketFileList = jacketSelector.files;
	const jacketFile = jacketFileList[0];

	const musicSelector = document.getElementById('addscore_music');
	const musicFileList = musicSelector.files;
	const musicFile = musicFileList[0];

	const scoreSelector = document.getElementById('addscore_score');
	const scoreFileList = scoreSelector.files;
	const scoreFile = scoreFileList[0];

	jacketData = await readFile(jacketFile, 'image');
	musicData = await readFile(musicFile, 'audio');
	scoreData = await readFile(scoreFile, 'text');

	let response = await fetch('/post/add', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: Date.now(),
			title: document.getElementById('addscore_title').value,
			artists: document.getElementById('addscore_artists').value,
			author: document.getElementById('addscore_author').value,
			genre: document.getElementById('addscore_genre').value,
			description: document.getElementById('addscore_description').value,
			difficulty: document.getElementById('addscore_difficulty').value,
			jacket: jacketData,
			jacketPath: document.getElementById('addscore_jacket').value,
			music: musicData,
			score: scoreData,
			type: 'local',
			verification: document.getElementById('verification').value,
		})
	})
	let status = (await response.json())['status']
	if (status === 'ok') {
		alert('Added score.')
		window.location.href = '/add'
	} else {
		alert('Failed to add score. -- ' + status)
	}
}

async function editScore() {
	let response = await fetch('/post/edit', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			id: document.getElementById('addscore_id').value,
			title: document.getElementById('addscore_title').value,
			artists: document.getElementById('addscore_artists').value,
			author: document.getElementById('addscore_author').value,
			genre: document.getElementById('addscore_genre').value,
			description: document.getElementById('addscore_description').value,
			difficulty: document.getElementById('addscore_difficulty').value,
			verification: document.getElementById('verification').value,
			type: document.getElementById('addscore_type').value,
		})
	})
	let status = (await response.json())['status']
	if (status === 'ok') {
		alert('Edited score.')
		window.location.href = '/levels'
	} else {
		alert('Failed to add score. -- ' + status)
	}
}

async function readFile(file, typ) {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		switch (typ) {
			case 'image':
				// reader.readAsDataURL(file);
				// reader.readAsArrayBuffer(file);
				reader.readAsDataURL(file);
				break;
			case 'audio':
				// reader.readAsDataURL(file);
				// reader.readAsArrayBuffer(file);
				reader.readAsDataURL(file);
				break;
			case 'text':
				reader.readAsText(file);
				break;
		}
	});
}

// Fetch score list for a given page
async function getScores(page) {
	const serverURLObject = document.getElementById('server-url');
	const serverURL = serverURLObject.value;

	if (serverURL === '') {
		return;
	}

	if (!serverURL.startsWith('http://') && !serverURL.startsWith('https://')) {
		alert('Please provide a valid server URL!  (Don\'t exclude the http(s)://)\n\nExample: https://servers.sonolus.com/pjsekai');
		return;
	}

	let levels = {};

	await fetch(`/get?url=${serverURL + `/sonolus/levels/list?page=${page}`}`)
		.then(response => response.json())
		.then(data => {
			levels = data;
		})
		.catch(err => {
			var alertDiv = document.createElement('div');

			// add Bootstrap classes to the div element
			alertDiv.classList.add('alert', 'alert-danger', 'alert-dismissible', 'fade', 'show');

			// set the message text
			alertDiv.textContent = 'Failed to fetch levels from ' + serverURL;

			// add the alertDiv to the DOM
			var container = document.getElementById('import-charts-body'); // replace 'container' with the ID of the element where you want to insert the alert
			container.insertBefore(alertDiv, container.firstChild);
			return;
		});
	
	return levels;
}

// Add the fetched scores to a preview modal
function showScores(scores) {
	const serverURLObject = document.getElementById('server-url');
	const serverURL = serverURLObject.value;
	
	const modalBody = document.getElementById('import-charts-body');

	let importedChartsList = document.createElement('div');
	importedChartsList.id = 'imported-charts';
	importedChartsList.classList.add('container', 'px-1');

	scores.items.forEach(function(item) {
		let previewCard = document.createElement('div');
		previewCard.classList.add('card', 'p-4', 'm-2', 'w-100');
		previewCard.innerHTML = `<div class="row gx-1"><div class="col"><img class="float-left" src="${item.cover.url}" width="64" height="64" style="float:left;"><div><p class="chart-preview-text"><strong>Title: </strong>${item.title}</p><p class="chart-preview-text"><strong>Name: </strong>${item.name}</p><p class="chart-preview-text"><strong>Artists: </strong>${item.artists}</p><p class="chart-preview-text"><strong>Author: </strong>${item.author}</p></div></div></div>`; // <div class="col"></div>

		let addButton = document.createElement('button');
		addButton.classList.add('btn', 'btn-secondary');
		addButton.innerHTML = 'Import';
		addButton.addEventListener('click', async function(event) {
			let response = await fetch('/post/add', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: item.name,
					rating: item.rating,
					title: item.title,
					artists: item.artists,
					author: item.author,
					cover: item.cover.url,
					bgm: item.bgm.url,
					preview: item.preview.url,
					data: serverURL + item.data.url,
					type: 'imported',
					verification: document.getElementById('verification').value,
				})
			});
			let status = (await response.json())['status'];
			if (status === 'ok') {
				alert('Imported score.');
			} else {
				alert('Failed to import score. -- ' + status);
			}
		});
		previewCard.appendChild(addButton);

		importedChartsList.appendChild(previewCard);
	});

	modalBody.appendChild(importedChartsList);
}

// Main function for the score import UI
async function importScores() {
	document.getElementById('import-button').disabled = true;
	let scores = await getScores(0);

	const modalBody = document.getElementById('import-charts-body');

	const pageInputLabel = document.createElement('label');
	pageInputLabel.id = 'page-number-label';
	pageInputLabel.for = 'page-number';
	pageInputLabel.innerHTML = 'Page';
	modalBody.appendChild(pageInputLabel);

	const pageInput = document.createElement('input');
	pageInput.id = 'page-number';
	pageInput.type = 'number';
	pageInput.value = 1;
	pageInput.step = 1;
	pageInput.min = 1;
	pageInput.max = scores.pageCount;
	pageInput.classList.add('form-control');
	pageInput.addEventListener("keydown", function(event) {
		event.preventDefault();
	});
	pageInput.addEventListener("mousewheel", function(event) {
		event.preventDefault();
	});
	pageInput.addEventListener("input", async function(event) {
		document.getElementById('imported-charts').remove();
		let scores2 = await getScores(event.target.value - 1);
		showScores(scores2);
	});
	modalBody.appendChild(pageInput);

	showScores(scores);
}