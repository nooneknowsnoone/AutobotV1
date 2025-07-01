document.getElementById('agreeCheckbox').addEventListener('change', function () {
  document.getElementById('submitButton').disabled = !this.checked;
});

let Commands = [{ 'commands': [] }, { 'handleEvent': [] }];

function showAds() {
  const ads = ["", "", ""];
  const index = Math.floor(Math.random() * ads.length);
  if (ads[index]) window.location.href = ads[index];
}

function measurePing() {
  const xhr = new XMLHttpRequest();
  const startTime = Date.now();
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) {
      const pingTime = Date.now() - startTime;
      document.getElementById("ping").textContent = pingTime + " ms";
    }
  };
  xhr.open("GET", location.href + "?t=" + new Date().getTime());
  xhr.send();
}

function updateTime() {
  const now = new Date();
  const options = { timeZone: 'Asia/Manila', hour12: true, hour: '2-digit', minute: '2-digit', second: '2-digit' };
  document.getElementById('time').textContent = now.toLocaleTimeString('en-US', options);
}

setInterval(measurePing, 1000);
setInterval(updateTime, 1000);
updateTime();

async function State() {
  const jsonInput = document.getElementById('json-data');
  const button = document.getElementById('submitButton');
  if (!Commands[0].commands.length) return showResult('Please select at least one command.');
  try {
    button.style.display = 'none';
    const State = JSON.parse(jsonInput.value);
    const response = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        state: State,
        commands: Commands,
        prefix: document.getElementById('inputOfPrefix').value,
        admin: document.getElementById('inputOfAdmin').value
      })
    });
    const data = await response.json();
    showResult(data.message);
    showAds();
  } catch (err) {
    showResult("Invalid JSON or server error.");
  } finally {
    setTimeout(() => button.style.display = 'block', 4000);
  }
}

function showResult(message) {
  const resultContainer = document.getElementById('result');
  resultContainer.innerHTML = `<h5>${message}</h5>`;
  resultContainer.style.display = 'block';
}

async function commandList() {
  try {
    const response = await fetch('/commands');
    const { commands, handleEvent } = await response.json();
    [commands, handleEvent].forEach((list, i) => {
      list.forEach((cmd, index) => {
        const container = createCommand(i === 0 ? listOfCommands : listOfCommandsEvent, index + 1, cmd, i === 0 ? 'commands' : 'handleEvent');
        (i === 0 ? listOfCommands : listOfCommandsEvent).appendChild(container);
      });
    });
  } catch (e) {
    console.error("Error loading commands", e);
  }
}

function createCommand(container, order, command, type) {
  const div = document.createElement('div');
  div.classList.add('form-check');
  div.onclick = toggleCheckbox;
  div.innerHTML = `
    <input type="checkbox" class="form-check-input ${type}">
    <label class="form-check-label ${type}">${order}. ${command}</label>
  `;
  return div;
}

function toggleCheckbox() {
  const types = [
    { input: '.commands', label: '.commands', array: Commands[0].commands },
    { input: '.handleEvent', label: '.handleEvent', array: Commands[1].handleEvent }
  ];
  types.forEach(({ input, label, array }) => {
    const checkbox = this.querySelector(input);
    const labelText = this.querySelector(label);
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      const command = labelText.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
      if (checkbox.checked) {
        labelText.classList.add('disable');
        if (!array.includes(command)) array.push(command);
      } else {
        labelText.classList.remove('disable');
        const index = array.indexOf(command);
        if (index !== -1) array.splice(index, 1);
      }
    }
  });
}

function selectAllCommands() {
  const checkboxes = document.querySelectorAll('.form-check-input.commands');
  const allChecked = Array.from(checkboxes).every(c => c.checked);
  checkboxes.forEach(c => {
    c.checked = !allChecked;
    const label = c.nextElementSibling;
    label.classList.toggle('disable', !allChecked);
    const cmd = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    if (!allChecked) Commands[0].commands.push(cmd);
    else Commands[0].commands = Commands[0].commands.filter(item => item !== cmd);
  });
}

function selectAllEvents() {
  const checkboxes = document.querySelectorAll('.form-check-input.handleEvent');
  const allChecked = Array.from(checkboxes).every(c => c.checked);
  checkboxes.forEach(c => {
    c.checked = !allChecked;
    const label = c.nextElementSibling;
    label.classList.toggle('disable', !allChecked);
    const cmd = label.textContent.replace(/^\d+\.\s/, '').split(" ")[0];
    if (!allChecked) Commands[1].handleEvent.push(cmd);
    else Commands[1].handleEvent = Commands[1].handleEvent.filter(item => item !== cmd);
  });
}

commandList();