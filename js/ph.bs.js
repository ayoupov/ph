/**
 * Created by ayoupov on 02.05.2017.
 */

$(function(){
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
        success: function(res) {
            // init labels
            PH.labels = res.labels;
            changeLang(PH.lang);
            // init prjs
            prjs = res.projects;
            prjs.forEach(datify);
            // sort by beginning
            prjs.sort(sortPrjByStart);
            populateCalendar(prjs);
            emulateScroll();
            initWindowSizeChange();
            var savedDayId = Cookies.get('date');
            if (savedDayId)
                scrollDayListTo(savedDayId);
            else {
                var today = "#day" + dayIdFromDate(new Date());
                if ($(today).length > 0)
                    scrollDayListTo(today);
            }
        }
    })
});
