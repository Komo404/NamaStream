// ===========================================
// Quando informação for alterada no popup, salva a informação do DB da API Chrome.Storage (local)
// ===========================================

const channelIDs = [
  // Canais
  // Ex: {name: "nak", channelId: "UCfGiBuBA0H7FNbtP4LMP8-g"}
];

let disabledChannels = new Set();
let pinnedChannels   = [];

const views   = document.querySelectorAll('.view');
const backBtn = document.getElementById('back-btn');
const title   = document.getElementById('popup-title');

const viewTitles = {
    'view-default':  'Channels Dashboard',
    'view-channels': 'Channels',
    'view-layout':   'Layout',
};

function showView(viewId) {
    views.forEach(v => v.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    title.textContent = viewTitles[viewId];

    backBtn.classList.toggle('hidden', viewId === 'view-default'); // Mostra seta de voltar em qualquer view que não seja a padrão
}

document.querySelectorAll('.action-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => showView(btn.dataset.target));
});


backBtn.addEventListener('click', () => showView('view-default'));
document.getElementById('close-btn').addEventListener('click', () => window.close());


const sortToggle = document.getElementById('sort-by-branch');
sortToggle.addEventListener('click', () => {
    const isOn = sortToggle.dataset.on === 'true';
    sortToggle.dataset.on = String(!isOn);
    // TODO: salvar no chrome.storage e aplicar na newtab
});

document.querySelectorAll('#view-default .check-row input').forEach(cb => {
    cb.addEventListener('change', () => {
        // TODO: salvar no chrome.storage
        // Estrutura: chrome.storage.local.set({ [cb.id]: cb.checked })
        console.log(`${cb.id} →`, cb.checked);
    });
});

function renderChannelGrid() {
    const grid = document.getElementById('yt-channel-grid');
    grid.innerHTML = '';

    channelIDs.forEach(channel => {
        const card = document.createElement('div');
        card.className = 'channel-card';
        if (disabledChannels.has(channel.channelId)) card.classList.add('disabled');

        const avatar = document.createElement('div');
        avatar.className = 'ch-avatar';

        const name = document.createElement('span');
        name.className = 'ch-name';
        name.textContent = channel.name;

        card.appendChild(avatar);
        card.appendChild(name);

        const pinIndex = pinnedChannels.indexOf(channel.channelId);
        if (pinIndex !== -1) {
            const badge = document.createElement('span');
            badge.className = 'pin-badge';
            badge.textContent = pinIndex + 1;
            card.appendChild(badge);
        }

        card.addEventListener('click', () => {
            if (disabledChannels.has(channel.channelId)) {
                disabledChannels.delete(channel.channelId);
            } else {
                disabledChannels.add(channel.channelId);
            }
            renderChannelGrid();
            // TODO: persistir no chrome.storage
        });

        card.addEventListener('contextmenu', (e) => { // Clique direito → toggle pin
            e.preventDefault();
            const idx = pinnedChannels.indexOf(channel.channelId);
            if (idx !== -1) {
                pinnedChannels.splice(idx, 1); // remove pin
            } else {
                pinnedChannels.push(channel.channelId); // adiciona no fim
            }
            renderChannelGrid();
            // TODO: persistir no chrome.storage
        });

        grid.appendChild(card);
    });
}


const layoutCheckboxes = document.querySelectorAll('#view-layout .check-row input');

const previewLabels = {
    'layout-streams-yt':     'Streams YT',
    'layout-agenda':         'Agenda',
    'layout-streams-twitch': 'Streams Twitch',
    'layout-vertical-twitch': 'Vertical Twitch',
};

function updateLayoutPreview() {
    const preview = document.getElementById('layout-preview');
    preview.innerHTML = '';

    layoutCheckboxes.forEach(cb => {
        if (!cb.checked) return;

        const block = document.createElement('div');
        block.className = 'preview-block';
        if (cb.id === 'layout-vertical-twitch') block.classList.add('preview-vertical');
        block.textContent = previewLabels[cb.id];
        preview.appendChild(block);
    });

    if (preview.children.length === 0) {
        preview.innerHTML = '<span style="color:var(--text-dim);font-size:11px;margin:auto">Nenhum elemento ativo</span>';
    }
}

layoutCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateLayoutPreview);
});

document.addEventListener('DOMContentLoaded', () => {
    showView('view-default');
    renderChannelGrid();
    updateLayoutPreview();
    // TODO: carregar estado salvo do chrome.storage e aplicar nos checkboxes, disabledChannels, pinnedChannels
});