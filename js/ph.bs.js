/**
 * Created by ayoupov on 02.05.2017.
 */

$(function () {
    // video fixes
    var vid = $("#bgvid")[0];

    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion)').matches) {
        vid.removeAttribute("autoplay");
        vid.pause();
    }

    // init lang settings
    langInit();
    initLangEvents();

    // load data

    var prjs;
    $.ajax('/ph/data/ph.json', {
        success: function (res) {
            // init labels
            PH.labels = res.labels;
            PH.$prj_menu = $("#project_menu");
            // init prjs
            prjs = res.projects;
            prjs.forEach(datify);
            // sort by beginning
            prjs.sort(sortPrjByStart);
            populateCalendar(prjs);
            emulateScroll();
            PH.is_scrolling = false;
            var savedDayId = Cookies.get('date');
            if (savedDayId)
                scrollDayListTo(savedDayId);
            else {
                var today = "day" + dayIdFromDate(new Date());
                if ($("#" + today).length > 0)
                    scrollDayListTo(today);
            }
            initWindowSizeChange(); // also reselects central element and therefore starts bg if needed
            // init langs (have to have prjs inited already)
            changeLang(PH.lang);
        }
    })
});
