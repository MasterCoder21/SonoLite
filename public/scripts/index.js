function updateImageModal(item) {
    document.getElementById("modal-image").src = item.textContent;
    document.getElementById("modal-input").value = item.textContent;
    document.getElementById("modal-prev").value = item.textContent;
}

async function updateEntry() {
    let prev = document.getElementById("modal-prev");
    let prevValue = prev.value;
    let curr = document.getElementById("modal-input");
    let currValue = curr.value;
    if (prevValue === currValue) {
        return;
    }
    const pattern = /^(https?:\/\/)?[^\s]+\.(jpe?g|png)$/i;
    if (!pattern.test(currValue)) {
        alert('Please only provide links to images.');
        return;
    }
    for (let i = 0; i < serverBanners.children.length; i++) {
        if (serverBanners.children[i].querySelector('.form-check-label').textContent === currValue) {
            alert('That item has already been added to the list.');
            return;
        }
    }
    let toUpdate = document.getElementById(`label${prevValue}`);
    toUpdate.id = `label${currValue}`;
    toUpdate.textContent = currValue;
    // let button = document.getElementById(`view${prevValue}`);
    // button.onclick = `updateImageModal(document.getElementById(label${currValue}}))`;

    await updateBanners();
}
// Skins, backgrounds, particles, effects, engines, banners

// == Begin Skins ==
const serverSkinsInput = document.getElementById('server-skins-input');
const serverSkinsAdd = document.getElementById('server-skins-add');
const serverSkins = document.getElementById('server-skins');
serverSkinsAdd.addEventListener('click', function () {
    const value = serverSkinsInput.value.trim();
    if (value) {
        const pattern = /^https?:\/\/[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${value}<button type="button" class="btn btn-danger btn-sm">&times;</button>`;
        serverSkins.appendChild(li);
        serverSkinsInput.value = '';
    }
});
serverSkins.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const li = event.target.parentNode;
        serverSkins.removeChild(li);
    }
});
// == End Skins ==
// == Begin Backgrounds ==
const serverBackgroundsInput = document.getElementById('server-backgrounds-input');
const serverBackgroundsAdd = document.getElementById('server-backgrounds-add');
const serverBackgrounds = document.getElementById('server-backgrounds');
serverBackgroundsAdd.addEventListener('click', function () {
    const value = serverBackgroundsInput.value.trim();
    if (value) {
        const pattern = /^https?:\/\/[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${value}<button type="button" class="btn btn-danger btn-sm">&times;</button>`;
        serverBackgrounds.appendChild(li);
        serverBackgroundsInput.value = '';
    }
});
serverBackgrounds.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const li = event.target.parentNode;
        serverBackgrounds.removeChild(li);
    }
});
// == End Backgrounds ==
// == Begin Particles ==
const serverParticlesInput = document.getElementById('server-particles-input');
const serverParticlesAdd = document.getElementById('server-particles-add');
const serverParticles = document.getElementById('server-particles');
serverParticlesAdd.addEventListener('click', function () {
    const value = serverParticlesInput.value.trim();
    if (value) {
        const pattern = /^https?:\/\/[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${value}<button type="button" class="btn btn-danger btn-sm">&times;</button>`;
        serverParticles.appendChild(li);
        serverParticlesInput.value = '';
    }
});
serverParticles.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const li = event.target.parentNode;
        serverParticles.removeChild(li);
    }
});
// == End Particles ==
// == Begin Effects ==
const serverEffectsInput = document.getElementById('server-effects-input');
const serverEffectsAdd = document.getElementById('server-effects-add');
const serverEffects = document.getElementById('server-effects');
serverEffectsAdd.addEventListener('click', function () {
    const value = serverEffectsInput.value.trim();
    if (value) {
        const pattern = /^https?:\/\/[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${value}<button type="button" class="btn btn-danger btn-sm">&times;</button>`;
        serverEffects.appendChild(li);
        serverEffectsInput.value = '';
    }
});
serverEffects.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const li = event.target.parentNode;
        serverEffects.removeChild(li);
    }
});
// == End Effects ==
// == Begin Engines ==
const serverEnginesInput = document.getElementById('server-engines-input');
const serverEnginesAdd = document.getElementById('server-engines-add');
const serverEngines = document.getElementById('server-engines');
serverEnginesAdd.addEventListener('click', function () {
    const value = serverEnginesInput.value.trim();
    if (value) {
        const pattern = /^https?:\/\/[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `${value}<button type="button" class="btn btn-danger btn-sm">&times;</button>`;
        serverEngines.appendChild(li);
        serverEnginesInput.value = '';
    }
});
serverEngines.addEventListener('click', function (event) {
    if (event.target.tagName === 'BUTTON') {
        const li = event.target.parentNode;
        serverEngines.removeChild(li);
    }
});
// == End Engines ==
// == Begin Banners ==
const serverBannersInput = document.getElementById('server-banners-input');
const serverBannersAdd = document.getElementById('server-banners-add');
const serverBanners = document.getElementById('server-banners');
const index = serverBanners.children.length;
serverBannersAdd.addEventListener('click', async function () {
    const value = serverBannersInput.value.trim();
    if (value) {
        const pattern = /^(https?:\/\/)?[^\s]+\.(jpe?g|png)$/i;
        if (!pattern.test(value)) {
            alert('Please only provide links to images.');
            return;
        }
        for (let i = 0; i < serverBanners.children.length; i++) {
            if (serverBanners.children[i].querySelector('.form-check-label').textContent === value) {
                alert('That item has already been added to the list.');
                return;
            }
        }
        const li = document.createElement('li');
        li.className = 'list-group-item d-flex justify-content-between align-items-center';
        li.innerHTML = `
              <div class="form-check">
                <input type="radio" class="form-check-input" name="item" id="item${index}" data-index="${index}">
                <label class="form-check-label" for="item${index}" id="label${value}" style="display:none;">${value}</label>
                <button type="button" class="btn btn-primary btn-sm" data-index="${index}" data-bs-toggle="modal" data-bs-target="#imageModal" onclick="updateImageModal(document.getElementById('label${value}'))">View</button>
                </div>
              <p>Click to view or edit server banner.</p>
              <button type="button" class="btn btn-danger btn-sm" data-index="${index}">&times;</button>
            `;
        serverBanners.appendChild(li);
        serverBannersInput.value = '';
        await saveBanners();
    }
});
serverBanners.addEventListener('click', async function (event) {
    if (event.target.tagName === 'INPUT') {
        await saveBanners();
    }
    if (event.target.tagName === 'BUTTON' && event.target.textContent !== 'View') {
        const li = event.target.parentNode;
        serverBanners.removeChild(li);
        await saveBanners();
    }
});
// == End Banners ==

document.getElementById("jacketLimit").oninput = function () {
    if (this.value < 1) {
        this.value = 1;
    }
    if (this.value > 100) {
        this.value = 100;
    }
}
document.getElementById("musicLimit").oninput = function () {
    if (this.value < 1) {
        this.value = 1;
    }
    if (this.value > 100) {
        this.value = 100;
    }
}
document.getElementById("dataLimit").oninput = function () {
    if (this.value < 1) {
        this.value = 1;
    }
    if (this.value > 100) {
        this.value = 100;
    }
}
document.getElementById("ppe").addEventListener("change", function (e) {
    let checked = document.getElementById("ppe").checked;
    let pwd = prompt(`Please enter the password to ${checked ? "enable" : "disable"} password protection:`);
    if (pwd === null) {
        document.getElementById("ppe").checked = !checked;
        return;
    }

    let response = fetch('/post/checkpwd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: pwd,
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.status === "ok") {
                // e.preventDefault();
                document.getElementById("pwdButton").disabled = !document.getElementById("ppe").checked;
                alert(`Password protection has been ${checked ? "enabled" : "disabled"}.  Click \"Keep\" to save.`)
            } else {
                alert("Incorrect password.");
                document.getElementById("ppe").checked = !checked;
                document.getElementById("pwdButton").disabled = !document.getElementById("ppe").checked;
            }
        });
});
async function saveBanners() {
    let serverBannersList = document.querySelector('#server-banners');
    let serverBannersItems = serverBannersList.querySelectorAll('.list-group-item');
    let serverBannersValues = [];
    let selectedIndex = -1;

    for (let i = 0; i < serverBannersItems.length; i++) {
        // Change query selecting to work with modal popup viewer.
        let label = serverBannersItems[i].querySelector('.form-check-label');
        serverBannersValues.push(label.textContent);
        let radioButton = serverBannersItems[i].querySelector('.form-check-input');
        if (radioButton.checked) {
            selectedIndex = i;
        }
    }


    let response = await fetch('/post/config', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            serverSettings: {
                serverTitle: document.getElementById('server-title').value,
                serverSkins: [],
                serverBackgrounds: [],
                serverParticles: [],
                serverEffects: [],
                serverEngines: [],
                serverBanners: serverBannersValues,
                selectedBannerIndex: selectedIndex,
            },
            port: parseInt(document.getElementById('port').value),
            downloadPath: document.getElementById('downloadPath').value,
            passwordProtectionEnabled: document.getElementById('ppe').checked,
            fileLimits: {
                jacketLimit: parseInt(document.getElementById('jacketLimit').value),
                musicLimit: parseInt(document.getElementById('musicLimit').value),
                dataLimit: parseInt(document.getElementById('dataLimit').value),
            }
        })
    })
    if ((await response.json())['status'] === 'ok') {
        // alert('Saved.')
        window.location.reload()
    } else {
        // alert('Failed to save.')
    }
}
async function saveConfig() {
    let passwordChanged = document.getElementById('pwdChanged').changed === "true" ? true : false;
    let serverBannersList = document.querySelector('#server-banners');
    let serverBannersItems = serverBannersList.querySelectorAll('.list-group-item');
    let serverBannersValues = [];
    let selectedIndex = -1;

    for (let i = 0; i < serverBannersItems.length; i++) {
        // Change query selecting to work with modal popup viewer.
        let label = serverBannersItems[i].querySelector('.form-check-label');
        serverBannersValues.push(label.textContent);
        let radioButton = serverBannersItems[i].querySelector('.form-check-input');
        if (radioButton.checked) {
            selectedIndex = i;
        }
    }
    if (passwordChanged) {
        let response = await fetch('/post/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serverSettings: {
                    serverTitle: document.getElementById('server-title').value,
                    serverSkins: [],
                    serverBackgrounds: [],
                    serverParticles: [],
                    serverEffects: [],
                    serverEngines: [],
                    serverBanners: serverBannersValues,
                    selectedBannerIndex: selectedIndex,
                },
                port: parseInt(document.getElementById('port').value),
                downloadPath: document.getElementById('downloadPath').value,
                passwordProtectionEnabled: document.getElementById('ppe').checked,
                password: document.getElementById('pwd').value,
                fileLimits: {
                    jacketLimit: parseInt(document.getElementById('jacketLimit').value),
                    musicLimit: parseInt(document.getElementById('musicLimit').value),
                    dataLimit: parseInt(document.getElementById('dataLimit').value),
                }
            })
        })
        if ((await response.json())['status'] === 'ok') {
            alert('Saved.')
            window.location.reload()
        } else {
            alert('Failed to save.')
        }
    } else {
        let response = await fetch('/post/config', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                serverSettings: {
                    serverTitle: document.getElementById('server-title').value,
                    serverSkins: [],
                    serverBackgrounds: [],
                    serverParticles: [],
                    serverEffects: [],
                    serverEngines: [],
                    serverBanners: serverBannersValues,
                    selectedBannerIndex: selectedIndex,
                },
                port: parseInt(document.getElementById('port').value),
                downloadPath: document.getElementById('downloadPath').value,
                passwordProtectionEnabled: document.getElementById('ppe').checked,
                fileLimits: {
                    jacketLimit: parseInt(document.getElementById('jacketLimit').value),
                    musicLimit: parseInt(document.getElementById('musicLimit').value),
                    dataLimit: parseInt(document.getElementById('dataLimit').value),
                }
            })
        })
        if ((await response.json())['status'] === 'ok') {
            alert('Saved.')
            window.location.reload()
        } else {
            alert('Failed to save.')
        }
    }
}
async function changePassword() {
    let oldPwdInput = prompt("Enter in the old password:");
    if (oldPwdInput === null) {
        alert("Password change cancelled.");
        return;
    }
    let response = await fetch('/post/checkpwd', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            password: oldPwdInput,
        })
    })
    let status = (await response.json())['status']
    if (status === 'ok') {
        let newPwdInput = prompt("Enter the new password:");
        if (newPwdInput === null) {
            alert("Password change cancelled.");
            return;
        }
        let newPwdInputVerify = prompt("Verify the new password:");
        if (newPwdInputVerify === null) {
            alert("Password change cancelled.");
            return;
        }
        if (newPwdInput === newPwdInputVerify) {
            document.getElementById('pwd').value = newPwdInput;
            document.getElementById('pwdChanged').changed = "true";
            alert("Password successfully changed.  Click \"Keep\" to save.");
        } else {
            alert("The passwords do not match.");
        }
    } else {
        alert("The password that you entered does not match the old password.");
    }
}