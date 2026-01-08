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

function parseTime(input) {
    input = input.toString().replace(',', '.').toLowerCase().trim();

    // Format: 1h30 or 1:30
    if (input.includes('h') || input.includes(':')) {
        const parts = input.split(/[h:]/);
        const h = parseInt(parts[0]) || 0;
        const m = parseInt(parts[1]) || 0;
        return (h * 60) + m;
    }

    // Format: 1.50 -> 1h50 (Request: "1.50 je veux que ça fasse 1h50")
    if (input.includes('.')) {
        const parts = input.split('.');
        const h = parseInt(parts[0]) || 0;
        // If user types 1.5, we interpret as 1h50 ? Or 1h05?
        // Usually, 1.50 -> 50 mins. 1.5 -> 5 mins or 50 mins?
        // Given "1.50" request, let's treat the part after dot as strict minutes string.
        // "50" -> 50. "5" -> 5.
        // So 1.5 will be 1h05. 1.50 will be 1h50.
        // Let's check string length? No, let's just parse the integer.
        // "1.50" -> parts[1] is "50". parseInt("50") = 50.
        // "1.5" -> parts[1] is "5". parseInt("5") = 5.
        // Wait, often users mean 1.5 as 1h30 (half). But user specifically asked 1.50 = 1h50.
        // This implies a direct H.MM notation.
        // So 1.5 should probably be 1h5? Or 1h50? 
        // If I write 1.5 it looks like 1h + 5min.
        // If I write 1.50 it looks like 1h + 50min.
        // Let's implement strict parsing of the decimal part as minutes.

        let mStr = parts[1] || "0";
        // Correction: if user types "1.5", in H.MM notation, it's ambiguous.
        // But "1.50" is clearly 50.
        // Let's assume the decimal part represents the minutes directly.
        let m = parseInt(mStr);
        // If someone types 1.5, it interprets as 1h05.
        // If they want 1h50 they must type 1.50.
        // This seems to align with the "1.50 = 1h50" request.

        return (h * 60) + m;
    }

    // Format: 90 (Minutes only)
    return parseInt(input) || 0;
}

document.getElementById('exportBtn').addEventListener('click', exportToCSV);

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const timeInput = document.getElementById('timeInput').value;
    const totalMinutes = parseTime(timeInput);

    if (totalMinutes === 0) return; // Basic validation

    const newEntry = {
        type: document.querySelector('input[name="entryType"]:checked').value,
        value: totalMinutes,
        date: new Date().toLocaleDateString('fr-FR')
    };

    entries.push(newEntry);

    // On sauvegarde la sélection actuelle avant le reset
    const savedType = newEntry.type;

    form.reset();

    // On rétablit la sélection après le reset
    const radios = document.getElementsByName('entryType');
    radios.forEach(radio => {
        if (radio.value === savedType) {
            radio.checked = true;
        }
    });

    saveAndRender();
});

function deleteEntry(index) {
    entries.splice(index, 1);
    saveAndRender();
}

// Premier rendu au chargement
render();

// Logic for Help Modal
const modal = document.getElementById("helpModal");
const btn = document.getElementById("helpLink");
const span = document.getElementsByClassName("close-modal")[0];

if (btn) {
    btn.onclick = function (e) {
        e.preventDefault();
        modal.style.display = "block";
    }
}

if (span) {
    span.onclick = function () {
        modal.style.display = "none";
    }
}

window.onclick = function (event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
}
