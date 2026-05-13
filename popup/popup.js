// 
// Quando informação for alterada no popup, salva a informação do DB da API Chrome.Storage (local)
// 

const channelIDs = [
  // Coloque os canais aqui (mesmos IDs do backend)
  // Ex: {name: "nak", channelId: "UCfGiBuBA0H7FNbtP4LMP8-g"}
];

const translations = {
    "en": {
        "enable_disable_channels": "Enable / Disable Channels",
        "sort_by_group": "Sort by Group",
        "layout_options": "Layout Options",
        "youtube_streams": "YouTube Streams",
        "twitch_streams": "Twitch Streams",
        "youtube_channels": "YouTube Channels",
        "left_right_click": "Left click: toggle · Right click: pin",
        "twitch_channels": "Twitch Channels",
        "coming_soon": "Coming soon",
        "firefox_logo": "Firefox Logo",
        "firefox_wordmark": "Firefox Wordmark",
        "search_bar": "Search Bar",
        "vertical_twitch": "Vertical Twitch Bar",
        "resizable_bars": "Resizable Bars",
        "done_repositioning": "Done Repositioning",
        "reposition_bars": "Reposition Bars",
        "reset_pos": "Reset pos"
    },
    "pt-BR": {
        "enable_disable_channels": "Habilitar / Desabilitar Canais",
        "sort_by_group": "Ordenar por grupo",
        "layout_options": "Opções de Layout",
        "youtube_streams": "Lives do YouTube",
        "twitch_streams": "Lives da Twitch",
        "youtube_channels": "YouTube Channels",
        "left_right_click": "Click esquerdo: ativar · Click direito: Fixar",
        "twitch_channels": "Canais da Twitch",
        "coming_soon": "Em breve",
        "firefox_logo": "Logo Firefox",
        "firefox_wordmark": "Texto Firefox",
        "search_bar": "Barra de Pesquisa",
        "vertical_twitch": "Twitch vertical",
        "resizable_bars": "Barras redimensionáveis",
        "done_repositioning": "Terminar Reposicionamento",
        "reposition_bars": "Reposicionar barras",
        "reset_pos": "Resetar Posições"
    }
}

const userLanguage = navigator.language || 'en';
const lang = translations[userLanguage] ? userLanguage : 'en';

let disabledChannels = new Set();
let pinnedChannels = [];

const views = document.querySelectorAll('.view');
const backBtn = document.getElementById('back-btn');
const title = document.getElementById('popup-title');


const viewTitles = {
    'view-default':  'NamaStream Settings',
    'view-channels': 'Channels',
    'view-layout':   'Layout',
};

document.querySelectorAll('#view-default .check-row input').forEach(checkbox => { // Troca a visibilidade das barras (On/Off) no storage e na UI
    checkbox.addEventListener('change', () => {
        chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
    });

    chrome.storage.local.get(checkbox.id, (result) => {
        if (result[checkbox.id] !== undefined) {
            checkbox.checked = result[checkbox.id];
        }
    });
});


// ============ GRID CANAIS ============

function renderChannelGrid() 
{
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
            chrome.storage.local.set({ disabledChannels: Array.from(disabledChannels) });
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
            chrome.storage.local.set({ pinnedChannels });
        });

        grid.appendChild(card);
    });
}

// ============ SORT BY GEN ============

const sortToggle = document.getElementById('sort-by-gen');
sortToggle.addEventListener('click', () => {
    const isOn = sortToggle.dataset.on === 'true';
    sortToggle.dataset.on = String(!isOn);
    // TODO: salvar no chrome.storage e aplicar na newtab
});

// ============ OPÇÕES DE LAYOUT ============

const layoutCheckboxes = document.querySelectorAll('#view-layout .check-row input');
const repositionBtn = document.getElementById('reposition-mode-btn');

layoutCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', () => {
        chrome.storage.local.set({ [checkbox.id]: checkbox.checked });
    });
});

repositionBtn.addEventListener('click', () => {
    chrome.storage.local.get('repositionMode', (result) => {
        const next = !result.repositionMode;
        chrome.storage.local.set({ repositionMode: next });
        repositionBtn.classList.toggle('active', next);
        repositionBtn.textContent = next ? translations[lang]["done_repositioning"] : translations[lang]["reposition_bars"];
    });
});

// ============ PADRÃO DO POPUP ============

function renderPage(viewId) 
{
    views.forEach(view => view.classList.remove('active'));
    document.getElementById(viewId).classList.add('active');

    title.textContent = viewTitles[viewId];

    backBtn.classList.toggle('hidden', viewId === 'view-default');
}
function applyTranslations() 
{
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (translations[lang][key]) el.textContent = translations[lang][key];
    });
}

document.querySelectorAll('.action-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => renderPage(btn.dataset.target));
});

backBtn.addEventListener('click', () => renderPage('view-default'));
document.getElementById('close-btn').addEventListener('click', () => window.close());

document.addEventListener('DOMContentLoaded', () => {
    renderPage('view-default');
    applyTranslations();

    chrome.storage.local.get(['layout-vertical-twitch', 'layout-firefox-logo', 'layout-firefox-wordmark', 'layout-search-bar', 'layout-resizable-bar'], (result) => {
        document.getElementById('layout-firefox-logo').checked = result['layout-firefox-logo'] ?? true;
        document.getElementById('layout-firefox-wordmark').checked = result['layout-firefox-wordmark'] ?? true;
        document.getElementById('layout-search-bar').checked = result['layout-search-bar'] ?? true;
        document.getElementById('layout-vertical-twitch').checked = result['layout-vertical-twitch'] || false;
        document.getElementById('layout-resizable-bar').checked = result['layout-resizable-bar'] || false;
    });

    chrome.storage.local.get(['disabledChannels', 'pinnedChannels'], (result) => {
        disabledChannels = new Set(result.disabledChannels || []);
        pinnedChannels = result.pinnedChannels || [];
        renderChannelGrid();
    });
    
    chrome.storage.local.get('repositionMode', (result) => {
        repositionBtn.classList.toggle('active', result.repositionMode === true);
        repositionBtn.textContent = result.repositionMode ?  translations[lang]["done_repositioning"] : translations[lang]["reposition_bars"];
    });

    document.getElementById('reset-bar-positions').addEventListener('click', () => {
        chrome.storage.local.set({ barPositions: {} });
    });
});