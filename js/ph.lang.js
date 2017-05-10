function firstSupportedLang(langarr) {
    var fsl = null;
    langarr.forEach(function (l) {
        if ((l.toLowerCase() == 'en' || l.toLowerCase() == 'pl') && !fsl)
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
    //$("#contacts").html(PH.labels[lang].contacts);
    $("#projects").html(PH.labels[lang].projects);
    $("#about").html(PH.labels[lang].about);
    $("#contacts_desc").html(PH.labels[lang].contacts_desc);
    $("#projects_desc").html(PH.labels[lang].projects_desc);
    $("#about_desc").html(PH.labels[lang].about_desc);
    
    // update <a> selection
    $("#lang_select a").removeClass('active');
    $("#lang_select a[data-l=" + lang + ']').addClass('active');
    Cookies.set('lang', lang);
}

function initLangEvents(){
    $("#lang_select a").on('click', function(){
        if (!$(this).is('.active')){
            changeLang($(this).data('l'), PH.labels);
        }
    })
}