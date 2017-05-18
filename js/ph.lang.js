function firstSupportedLang(langarr) {
    var fsl = null;
    langarr.forEach(function (l) {
        if ((l.toLowerCase() == 'pl' || l.toLowerCase() == 'en') && !fsl)
            fsl = l.toLowerCase();
    });
    return fsl;
}

function langInit() {
// lang works
    var cookiesetlang;
    var lang = cookiesetlang = Cookies.get('lang');
    if (!lang)
        lang = navigator.languages
            ? firstSupportedLang(navigator.languages)
            : (navigator.language || navigator.userLanguage);
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    if (lang.toLowerCase() != 'en' && lang.toLowerCase() != 'pl')
        lang = 'en';
    PH.lang = lang; // main lang selector
    if (cookiesetlang != lang)
        Cookies.set('lang', lang);
}

function changeLang(lang) {
    PH.lang = lang;
    $("#projects_menu .project-menu-title").html(PH.labels[lang].projects);
    $("#about .about-title").html(PH.labels[lang].about);
    $("#about .about-desc").html(PH.labels[lang].about_desc);
    $("#projects_desc").html(PH.labels[lang].projects_desc);

    $(".calendar-month-label").each(function(){
        var $m = $(this);
        $m.html(MONTH_NAMES[lang][$m.data('month-idx')]);
    });

    initProjectMenu();

    // update <a> selection
    $("#lang_select a").html(lang == 'en' ? 'PL' : 'EN');
    Cookies.set('lang', lang);
}

function initLangEvents(){
    $("#lang_select a").on('click', function(){
        var newLang = PH.lang == 'en' ? 'pl' : 'en';
        changeLang(newLang);
    })
}