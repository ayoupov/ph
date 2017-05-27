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

function changeLang(lang, firstTime) {
    PH.lang = lang;
    $("#projects_menu .project-menu-title").html(PH.labels[lang].projects);
    $("#about .about-title").html(PH.labels[lang].about);
    $("#about .about-desc").html(PH.labels[lang].about_desc);
    $("#projects_desc").html(PH.labels[lang].projects_desc);

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
    $(".lang-select a").on('click', function () {
        var newLang = PH.lang == 'en' ? 'pl' : 'en';
        changeLang(newLang);
    })
}