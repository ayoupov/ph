/**
 * Created by ayoupov on 02.05.2017.
 */

var debugPrint = function () {
};

$(function () {
    // video fixes
    var vid = $("#bgvid")[0];

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion)').matches) {
        vid.removeAttribute("autoplay");
        vid.pause();
    }

    PH.isMobile = (window.matchMedia && window.matchMedia('only screen and (max-width: 767px)').matches);

    // first ui init
    PH.$prj_menu = $("#project_menu");
    PH.$about = $("#about");
    PH.$contacts = $("#contacts");
    PH.$subscribe = $("#subscribe");
    initUI();
    debugPrint("UI");
    // init lang settings
    langInit();
    initLangEvents();
    //debugPrint("L");
    // load data

    var prjs;
    $.ajax('/data/ph.json', {
        dataType: "json",
        error: function (xhr, status, error) {
            //var err = eval("(" + xhr.responseText + ")");
            //console.log(err.Message);
            console.log(error);
            //debugPrint(error);
        },
        success: function (res) {
            if (!PH.isMobile) {
                preloadImages(res);
                initVideo(res);
                initAudio(res);
            }
            //debugPrint("S");
            // init labels
            PH.labels = res.labels;
            // init prjs
            prjs = res.projects;
            prjs.forEach(datify);
            //debugPrint("D");
            // sort by beginning
            prjs.sort(sortPrjByStart);
            populateCalendar(prjs);
            //debugPrint("P");
            emulateScroll();
            //debugPrint("Sc");
            PH.is_scrolling = false;
            var today = "day" + dayIdFromDate(new Date());
            if ($("#" + today).length > 0)
                scrollDayListTo(today, true);
            //debugPrint("T");
            changeLang(PH.lang, true);
        }
    })
});
