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

export const userLanguage = navigator.language || 'en';
export const lang = translations[userLanguage] ? userLanguage : 'en';
export { translations };
