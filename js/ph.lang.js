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
    debugPrint("L0");
    var cookiesetlang;
    var lang = cookiesetlang = Cookies.get('lang');
    debugPrint("L1");
    if (!lang) {
        var host = location.host;
        lang = host.indexOf("proste") >= 0 ? ("pl") : (host.indexOf("simple") >= 0 ? "en" : null);
    }
    if (!lang)
        lang = navigator.languages
            ? firstSupportedLang(navigator.languages)
            : (window.navigator.language || navigator.language || navigator.userLanguage);
    debugPrint("L2");
    debugPrint(lang);
    if (!lang)
        lang = 'en';
    if (lang.length > 2)
        lang = lang.substr(0, 2);
    debugPrint(lang);
    if (lang.toLowerCase() != 'en' && lang.toLowerCase() != 'pl')
        lang = 'en';
    PH.lang = lang; // main lang selector
    if (cookiesetlang != lang)
        Cookies.set('lang', lang);
    debugPrint("L3");
}

function changeLang(lang, firstTime) {
    PH.lang = lang;
    $("#projects_menu .project-menu-title").html(PH.labels[lang].projects);
    $("#about .about-title").html(PH.labels[lang].about);
    $("#about .about-desc").html(PH.labels[lang].about_desc);
    $(".overall-container").html(PH.labels[lang].about_desc);
    $("#projects_desc").html(PH.labels[lang].projects_desc);
    document.title = PH.labels[lang].title;

    $(".calendar-month-label").each(function () {
        var $m = $(this);
        $m.html(getMonthName([$m.data('month-idx')]));
    });

    initProjectMenu();

    // update <a> selection
    $(".lang-select a").html(lang == 'en' ? 'PL' : 'EN');
    Cookies.set('lang', lang);

    // fixme: if other than central slide
    if (PH.isMobile && !firstTime) {
        $(".mobile-prj-desc").remove();
        $(PH.prjs).each(function () {
            var prj = this;
            var prjid = prj.id;
            var $stripe = $(".project-stripe[data-prjid='" + prjid + "']");
            attachMobilePrj($stripe, prj, prjid);
            //$(".mobile-prj-desc[data-prjid='" + prjid + "']").html(prj[PH.lang].title + " / " + prj[PH.lang].location)
        });
        if ($(".calendar-list li:within-viewport").length > 0)
            scrollDayList(0);
    }

}

function initLangEvents() {
    debugPrint("iL");
    $(".lang-select a").on('click', function () {
        var newLang = PH.lang == 'en' ? 'pl' : 'en';
        changeLang(newLang);
    })
}