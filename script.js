// Validation des données chargées
let loadedData;
try {
    loadedData = JSON.parse(localStorage.getItem('overtimeData'));
} catch (e) {
    console.error("Erreur de lecture des données", e);
}
let entries = Array.isArray(loadedData) ? loadedData : [];

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
        // Validation simple de la structure de l'entrée
        if (!entry || typeof entry.value !== 'number' || typeof entry.type !== 'string') return acc;
        return entry.type === 'plus' ? acc + entry.value : acc - entry.value;
    }, 0);

    // Affichage du total
    totalDisplay.innerText = formatTime(totalMinutes);
    totalDisplay.className = 'balance-value ' + (totalMinutes >= 0 ? 'positive' : 'negative');

    // Affichage de l'historique
    historyList.innerHTML = '';
    entries.slice().reverse().forEach((entry, index) => {
        // Ignorer les entrées malformées pour l'affichage
        if (!entry || typeof entry.value !== 'number' || !entry.date) return;

        const realIndex = entries.length - 1 - index;
        const li = document.createElement('li');
        li.className = `history-item ${entry.type === 'plus' ? 'item-plus' : 'item-minus'}`;

        // Construction sécurisée du DOM
        const divInfo = document.createElement('div');

        const strong = document.createElement('strong');
        strong.textContent = entry.type === 'plus' ? 'Heures faites' : 'Heures récupérées';

        const br = document.createElement('br');

        const small = document.createElement('small');
        small.textContent = entry.date;

        divInfo.appendChild(strong);
        divInfo.appendChild(br);
        divInfo.appendChild(small);

        const divAction = document.createElement('div');

        const spanValue = document.createElement('span');
        spanValue.textContent = `${entry.type === 'plus' ? '+' : '-'}${Math.floor(entry.value / 60)}h${(entry.value % 60).toString().padStart(2, '0')}`;

        const btnDelete = document.createElement('button');
        btnDelete.className = 'delete-btn';
        btnDelete.textContent = '×';
        btnDelete.onclick = () => deleteEntry(realIndex);

        divAction.appendChild(spanValue);
        divAction.appendChild(btnDelete);

        li.appendChild(divInfo);
        li.appendChild(divAction);

        historyList.appendChild(li);
    });
}

function exportToCSV() {
    if (entries.length === 0) {
        alert("Aucune donnée à exporter.");
        return;
    }

    // En-têtes du CSV
    let csvContent = "Date;Type;Heures;Total\n";

    entries.forEach(entry => {
        // Validation basique
        if (!entry || typeof entry.value !== 'number') return;

        const typeLabel = entry.type === 'plus' ? 'Heures faites' : 'Heures récupérées';
        const hoursStr = `${Math.floor(entry.value / 60)}h${(entry.value % 60).toString().padStart(2, '0')}`;

        let row = [
            entry.date,
            typeLabel,
            hoursStr,
            "" // Colonne Total vide comme dans l'exemple
        ];

        csvContent += row.join(";") + "\n";
    });

    // Création du blob avec BOM pour support UTF-8 (accents Excel)
    const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);

    link.setAttribute("href", url);
    link.setAttribute("download", `heures_supp_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('exportBtn').addEventListener('click', exportToCSV);

form.addEventListener('submit', (e) => {
    e.preventDefault();
    const h = parseInt(document.getElementById('hours').value) || 0;
    const m = parseInt(document.getElementById('minutes').value) || 0;

    const newEntry = {
        type: document.querySelector('input[name="entryType"]:checked').value,
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
