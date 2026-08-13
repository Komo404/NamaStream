
export const translations = {
  "en": {
    "watching_now": "Watching Now",
    "hours": " hours",
    "hour": " hour",
    "in_1_minute": "in 1 minute",
    "minutes": " minutes",
    "in": "in ",
    "starts": "Starts",
    "feeling": "Feeling",
    "humidity": "Humidity",
    "wind_speed": "Wind Speed",

    "enable_disable_channels": "Enable / Disable Channels",
    "sort_by_gen": "Sort by Gen",
    "layout_options": "Layout Options",
    "youtube_streams": "YouTube Streams",
    "twitch_streams": "Twitch Streams",
    "youtube_vtubers": "YouTube VTubers",
    "left_right_click": "Left click: toggle · Right click: pin",
    "twitch_vtubers": "Twitch VTubers",
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
    "watching_now": "Assistindo agora",
    "in": "em ",
    "starts": "Começa",
    "hours": " horas",
    "hour": " hora",
    "in_1_minute": "em 1 minuto",
    "minutes": " minutos",
    "feeling": "Sensação",
    "humidity": "Umidade",
    "wind_speed": "Vento",

    "enable_disable_channels": "Habilitar / Desabilitar Canais",
    "sort_by_gen": "Sortear por Gen",
    "layout_options": "Opções de Layout",
    "youtube_streams": "Lives do YouTube",
    "twitch_streams": "Lives da Twitch",
    "youtube_vtubers": "YouTube VTubers",
    "left_right_click": "Click esquerdo: ativar · Click direito: Fixar",
    "twitch_vtubers": "Vtubers da Twitch",
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
};

export const userLanguage = navigator.language || 'en';
export const lang = translations[userLanguage] || translations[userLanguage.split("-")[0]] || translations.en;
export const langCode = Object.keys(translations).includes(userLanguage) ? userLanguage : Object.keys(translations).includes(userLanguage.split("-")[0]) ? userLanguage.split("-")[0] : 'en';