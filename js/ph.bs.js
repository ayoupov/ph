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

    PH.isMobile = (window.matchMedia && window.matchMedia('only screen and (max-width: 767px)').matches);

    // first ui init
    PH.$prj_menu = $("#project_menu");
    PH.$about = $("#about");
    PH.$contacts = $("#contacts");
    PH.$subscribe = $("#subscribe");
    initUI();

    // init lang settings
    langInit();
    initLangEvents();

    // load data

    var prjs;
    $.ajax('/ph/data/ph.json', {
        error: function(xhr, status, error) {
            //var err = eval("(" + xhr.responseText + ")");
            //console.log(err.Message);
            console.log(error);
        },
        success: function (res) {
            // init labels
            PH.labels = res.labels;
            // init prjs
            prjs = res.projects;
            prjs.forEach(datify);

            // sort by beginning
            prjs.sort(sortPrjByStart);
            populateCalendar(prjs);
            emulateScroll();
            PH.is_scrolling = false;
            var savedDayId = Cookies.get('date');
            //if (savedDayId && savedDayId != 'undefined')
            //    scrollDayListTo(savedDayId, true);
            //else {
                var today = "day" + dayIdFromDate(new Date());
                if ($("#" + today).length > 0)
                    scrollDayListTo(today, true);
            //}
            // initWindowSizeChange goes to animation
            //initWindowSizeChange(); // also reselects central element and therefore starts bg if needed
            // init langs (have to have prjs inited already)
            changeLang(PH.lang, true);
        }
    })
});
