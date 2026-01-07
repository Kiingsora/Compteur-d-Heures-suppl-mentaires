let entries = JSON.parse(localStorage.getItem('overtimeData')) || [];

const form = document.getElementById('hourForm');
const historyList = document.getElementById('history');
const totalDisplay = document.getElementById('totalBalance');

function saveAndRender() {
    localStorage.setItem('overtimeData', JSON.stringify(entries));
    render();
}

function formatTime(totalMinutes) {
    const absMinutes = Math.abs(totalMinutes);
    const h = Math.floor(absMinutes / 60);
    const m = absMinutes % 60;
    const sign = totalMinutes < 0 ? "-" : (totalMinutes > 0 ? "+" : "");
    return `${sign}${h}h${m.toString().padStart(2, '0')}`;
}

function render() {
    // Calcul du total
    let totalMinutes = entries.reduce((acc, entry) => {
        return entry.type === 'plus' ? acc + entry.value : acc - entry.value;
    }, 0);

    // Affichage du total
    totalDisplay.innerText = formatTime(totalMinutes);
    totalDisplay.className = 'balance-value ' + (totalMinutes >= 0 ? 'positive' : 'negative');

    // Affichage de l'historique
    historyList.innerHTML = '';
    entries.slice().reverse().forEach((entry, index) => {
        const realIndex = entries.length - 1 - index;
        const li = document.createElement('li');
        li.className = `history-item ${entry.type === 'plus' ? 'item-plus' : 'item-minus'}`;
        li.innerHTML = `
        <div>
            <strong>${entry.type === 'plus' ? 'Heures faites' : 'Heures récupérées'}</strong><br>
            <small>${entry.date}</small>
        </div>
        <div>
            <span>${entry.type === 'plus' ? '+' : '-'}${Math.floor(entry.value / 60)}h${(entry.value % 60).toString().padStart(2, '0')}</span>
            <button class="delete-btn" onclick="deleteEntry(${realIndex})">×</button>
        </div>
    `;
        historyList.appendChild(li);
    });
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const h = parseInt(document.getElementById('hours').value) || 0;
    const m = parseInt(document.getElementById('minutes').value) || 0;

    const newEntry = {
        type: document.getElementById('type').value,
        value: (h * 60) + m,
        date: new Date().toLocaleDateString('fr-FR')
    };

    entries.push(newEntry);
    form.reset();
    saveAndRender();
});

function deleteEntry(index) {
    entries.splice(index, 1);
    saveAndRender();
}

// Premier rendu au chargement
render();
