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