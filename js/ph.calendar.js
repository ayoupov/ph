var sortPrjByStart = function (a, b) {
    return a.from.getTime() - b.from.getTime();
};

var sortPrjByEnd = function (a, b) {
    return a.to.getTime() - b.to.getTime();
};

var datify = function (prj) {
    prj.from = new Date(prj.from);
    prj.to = prj.to ? new Date(prj.to) : new Date();
};

var monthToRoman = function (monthIdx) {
    return ROMAN_MONTHS[monthIdx];
};

function getMonthName(idx) {
    var lang = PH.lang
    if (!lang)
        lang = 'en';
    return MONTH_NAMES[lang][idx];
}

function dayIdFromDate(date) {
    return "" +
        monthIdFromDate(date) + '-' +
        ((date.getDate() < 10 ? "0" : "") + date.getDate());

}

function monthIdFromDate(date) {
    return "" +
        date.getFullYear() + '-' +
        ((date.getMonth() < 10 ? "0" : "") + (date.getMonth() + 1));
}

function dateFromDayId(dayId) {
    return new Date(dayId.substr(3));
}

function dateToPrjListStr(date) {
    return "" + date.getDate() + " " +
        monthToRoman(date.getMonth()) + " " +
        date.getFullYear();
}

function populateCalendar(prjs) {
    // init projects
    if (prjs) {

        PH.$months = $("#months");
        PH.$monthlist = $("<div/>").addClass("month-list");

        PH.prjs = prjs;
        // determine the earliest project and timespan
        var firstPrj = prjs[0];
        var tempPrjs = prjs.slice();
        tempPrjs.sort(sortPrjByEnd);
        var lastPrj = tempPrjs[prjs.length - 1];
        var timeSpan = Math.ceil((lastPrj.to - firstPrj.from) / DAY_IN_MILLIS);
        // populate calendar
        var $daylist = $("<ul/>").addClass("calendar-list");
        var i = -EXTRA_DAYS_BEFORE; // days before the first prj
        PH.total_days = timeSpan + EXTRA_DAYS_BEFORE + EXTRA_DAYS_AFTER;
        PH.total_months = 0;
        var oldYear = 0;
        var oldMonth = 0;
        while (i < timeSpan + EXTRA_DAYS_AFTER) {
            var curDate = new Date(firstPrj.from.getTime() + i * DAY_IN_MILLIS);
            var curYear = curDate.getFullYear();
            var curMonth = curDate.getMonth();
            var curDay = curDate.getUTCDate();
            if (curYear != oldYear) {
                $daylist.append($("<li>").html(curYear).addClass("calendar-year-label"));
            }
            if (curMonth != oldMonth) {
                $daylist.append($("<li>").html(getMonthName(curMonth)).addClass("calendar-month-label").data('month-idx', curMonth));

                // fill months
                var $month = $("<div>").addClass("month-item").html(monthToRoman(curMonth) + " " + curYear).attr('id', "mon" + monthIdFromDate(curDate));
                PH.$monthlist.append($month);
                PH.total_months++;
            }
            var curDayLabel = (curDay < 10 ? "0" : "") + curDay;
            var dayId = "day" + dayIdFromDate(curDate);
            $daylist.append($("<li>").html(curDayLabel).addClass("calendar-day-label").attr("id", dayId));
            i++;
            oldYear = curYear;
            oldMonth = curMonth;
        }

        var $up = $("<div class='nav-button button-up' id='calendar_up'/>"); // .html('up');
        var $down = $("<div class='nav-button button-down' id='calendar_down'/>"); //.html('down');

        var $c = $("#calendar");
        $c.append($up);
        $c.append($daylist);
        $c.append($down);
        PH.$daylist = $daylist;
        PH.$up = $up;
        PH.$down = $down;

        PH.$daylist.css('height', $(window).height() - 2 * $(".nav-button").height());

        var $m_up = $("<div class='nav-button button-up' id='months_up'/>"); //.html('up');
        var $m_down = $("<div class='nav-button button-down' id='months_down'/>"); //.html('down');
        PH.$m_up = $m_up;
        PH.$m_down = $m_down;

        PH.$months.append($m_up);
        PH.$months.append(PH.$monthlist);
        PH.$months.append($m_down);

        // add project stripes

        var l = 0, r = 0;

        prjs.forEach(function (prj, idx) {
            if (prj.position == 'left') {
                addToLeft(prj, idx, l);
                l++;
            }
            else {
                addToRight(prj, idx, r);
                r++;
            }
        });

        // preinit prj_desc

        PH.$prj_desc = $("#prj_desc");
        PH.$prj_desc.hide();

        // init project-menu
        initProjectMenu();
    }
}

function takeLeft(prj) {
    return prj.position == 'left';
}

function takeRight(prj) {
    return prj.position == 'right';
}

function overlapCount(prj, prjs) {
    var overlaps = 0;
    prjs.forEach(function (curprevprj) {
        var overlap_condition = Math.max(curprevprj.from, prj.from) <= Math.min(curprevprj.to, prj.to);
        if (overlap_condition)
            overlaps++;
    });
    return overlaps;
}

function leftOverlaps(prj, before) {
    var lprjs = PH.prjs.filter(takeLeft);
    var lpbefore = lprjs.slice(0, before);
    return overlapCount(prj, lpbefore);
}

function rightOverlaps(prj, before) {
    var rprjs = PH.prjs.filter(takeRight);
    var rpbefore = rprjs.slice(0, before);
    return overlapCount(prj, rpbefore);
}

function extractYoutubeId(url) {
    var split = url.split("v=")[1];
    return split.split("&")[0];
}

function extractVimeoId(url) {
    var split = url.split("/");
    return split[split.length - 1].split("?")[0];
}

function attachPrjDesc($elem, prj, position) {
    PH.$prj_desc.empty();
    var $desc = $("<div class='project-description'/>");
    var $title = $("<div class='title'/>").html(prj.title);
    var $location = null;
    if (prj.location)
        $location = $("<div class='location'/>").html(prj.location);
    var $content = $("<div class='description' />").html(prj.description);
    $desc.append($title);
    if ($location)
        $desc.append($location);
    $desc.append($content);
    PH.$prj_desc.append($desc);

    //var thisTop = $elem.position().top + PH.$daylist.scrollTop() + $elem.height() / 2;
    var thisTop = ($(window).height() - PH.$prj_desc.height() - DAY_ITEM_SIZE ) / 2;
    PH.$prj_desc.css({
        left: '',
        right: '',
        top: thisTop,
        maxWidth: PRJ_DESC_WIDTH
    });

    if (position == 'left') {
        PH.$prj_desc.css('left', $elem.offset().left - PH.$prj_desc.width() - PRJ_STRIPE_MARGIN)
    } else {
        PH.$prj_desc.css('left', $elem.offset().left + PRJ_STRIPE_MARGIN)
    }
}

function showBackground(prj) {
    if (!PH.is_scrolling) {
        if (prj.background.type == 'video') {
            var src = null;
            if (prj.background.from == 'youtube' || !prj.background.from) {
                var ytid = extractYoutubeId(prj.background.url);
                src = "https://www.youtube.com/embed/" + ytid + "?controls=0&showinfo=0&rel=0&autoplay=1&loop=1&playlist=" + ytid;
            } else if (prj.background.from == 'vimeo') {
                var vmid = extractVimeoId(prj.background.url);
                src = "https://player.vimeo.com/video/" + vmid + "?autoplay=1&loop=1&byline=0&title=0";
            }
            if (src && $("#prj_bg iframe").attr('src') != src) {
                var iframe = $("<iframe src='" + src + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen>");
                $("#prj_bg").empty();
                $("#prj_bg").append(iframe);
                $("#bgvid").fadeOut(COMMON_FADE_TIMEOUT);
                $("#prj_bg").fadeIn(COMMON_FADE_TIMEOUT);
            }
        } else if (prj.background.type == 'image') {
            var src = prj.background.url;
            var img = $("<img src='" + src + "'>");
            if (src && $("#prj_bg iframe").attr('src') != src) {
                $("#prj_bg").empty();
                $("#prj_bg").append(img);
                $("#bgvid").fadeOut(COMMON_FADE_TIMEOUT);
                $("#prj_bg").fadeIn(COMMON_FADE_TIMEOUT);
            }
        }
    }
}

function hideBackground(prj) {
    if (!PH.is_scrolling) {
        $("#bgvid").fadeIn(COMMON_FADE_TIMEOUT);
        $("#prj_bg").fadeOut(COMMON_FADE_TIMEOUT, function () {
            if ($("#prj_bg iframe").length) $("#prj_bg iframe").attr('src', '');      // not working anyway :-\
            $("#prj_bg").empty();
        });
    }
}

function onPrjHoverStartEvent($elem, prj) {
    // blur project stripes
    $(".project-stripe").not($elem).addClass("blur");
    //if we need to change bg change it
    //if (prj.background && prj.background.type && (!prj.background.when || prj.background.when == 'hover')) {
    if (prj.background && prj.background.type) {
        showBackground(prj);
    }
    // position project description
    attachPrjDesc($elem, prj[PH.lang], prj.position);
    PH.$prj_desc.fadeIn(COMMON_FADE_TIMEOUT);
}

function onPrjHoverEndEvent($elem, prj) {
    $(".project-stripe").removeClass("blur");
    var cond = prj.background && prj.background.type && prj.background.when == 'scroll';
    if (!cond)
        hideBackground(prj);
    PH.$prj_desc.fadeOut(COMMON_FADE_TIMEOUT);
}

var TOP_MAGIC = 7;

function addStripe(posObj)
{
    var $stripe = $("<div class='project-stripe'>");
    $stripe.css(posObj);
    // append events and data
    $stripe.data('prjid', prjid);  // to extract the project
    $stripe.on('mouseenter', function () {
        onPrjHoverStartEvent($stripe, prj);
    });
    $stripe.on('mouseleave', function () {
        onPrjHoverEndEvent($stripe, prj);
    });
    PH.$daylist.append($stripe);
}

function addToLeft(prj, prjid, before) {
    // determine position
    var overlappers = leftOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var l = CALENDAR_WIDTH / 2 - DAY_WIDTH / 2 - ((overlappers + 1) * (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH));
    var w = PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top;
    var h = DAY_ITEM_SIZE / 2;
    var isEvent = prj.from.getTime() == prj.to.getTime();
    if (!isEvent)
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    if (isEvent)
        t += TOP_MAGIC;
    else
        t+= TOP_MAGIC * 2;
    addStripe({
        left: l,
        width: w,
        top: t,
        height: h
    });
}

function addToRight(prj, prjid, before) {
    // determine position
    var overlappers = rightOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var l = CALENDAR_WIDTH / 2 + DAY_WIDTH / 2 + ((overlappers + 1) * (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH));
    var w = PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top + TOP_MAGIC;
    var h = DAY_ITEM_SIZE / 2;
    var isEvent = prj.from.getTime() == prj.to.getTime();
    if (!isEvent)
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    if (isEvent)
        t += TOP_MAGIC;
    else
        t+= TOP_MAGIC * 2;
    addStripe({
        left: l,
        width: w,
        top: t,
        height: h
    });
}


function getCentralLabel() {
    return $(document.elementFromPoint($(document).width() / 2, $(document).height() / 2 - DAY_ITEM_SIZE)); // x, y
}

function getCentralMonthLabel() {
    return $(document.elementFromPoint($(document).width() - 30, $(document).height() / 2 + MONTH_ITEM_SIZE)); // x, y
}

function findProjects(dayId) {
    //var res = [];
    var thisDate = dateFromDayId(dayId);
    var tempPrjs = PH.prjs.filter(function (prj) {
        return prj.from.getTime() - thisDate.getTime() <= 0 && prj.to.getTime() - thisDate.getTime() >= 0;
    });
    //return res;
    return tempPrjs;
}

function scrollDayList(delta) {
    $('li', PH.$daylist).removeClass('selected');
    PH.$daylist.scrollTop(PH.$daylist.scrollTop() + delta * DAY_ITEM_SIZE);
    // update central selection
    var $li = getCentralLabel();
    if ($li) {
        while ($li.hasClass('calendar-year-label') || $li.hasClass('calendar-month-label')) {
            PH.$daylist.scrollTop(PH.$daylist.scrollTop() + delta * DAY_ITEM_SIZE);
            $li = getCentralLabel();
        }
        $li.addClass('selected');
        // todo: optimize
        var selectedDayId = $li.attr('id');
        scrollMonthListTo(dayIdToMonthId(selectedDayId));
        // show bg
        var prjsOnThisDay = findProjects(selectedDayId);
        if (prjsOnThisDay.length) {
            var prjBgToShow = null;
            // filter all the projects with onscroll bg
            prjsOnThisDay = prjsOnThisDay.filter(function (prj) {
                return prj.background && prj.background.when == 'scroll';
            });
            if (prjsOnThisDay.length) {
                prjsOnThisDay.sort(sortPrjByStart);
                prjBgToShow = prjsOnThisDay[prjsOnThisDay.length - 1];
                showBackground(prjBgToShow);
            }
            else
                hideBackground();
        }
        else
            hideBackground();
    }
}

function scrollMonthList(delta) {
    $('div.month-item', PH.$monthlist).removeClass('selected');
    PH.$monthlist.scrollTop(PH.$monthlist.scrollTop() + delta * MONTH_ITEM_SIZE);
    // update central selection
    var $monthdiv = getCentralMonthLabel();
    if ($monthdiv)
        $monthdiv.addClass('selected');
}

function emulateScroll() {
    PH.$daylist.on('mousewheel DOMMouseScroll', function (event) {
        var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail))) * -1;
        scrollDayList(delta);
        Cookies.set('date', $('.calendar-day-label.selected').attr('id'))
    });
    PH.$down.on('click', function () {
        scrollDayList(1);
        Cookies.set('date', $('.calendar-day-label.selected').attr('id'))
    });
    PH.$up.on('click', function () {
        scrollDayList(-1);
        Cookies.set('date', $('.calendar-day-label.selected').attr('id'))
    });
    PH.$monthlist.on('mousewheel DOMMouseScroll', function (event) {
        var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail))) * -1;
        scrollMonthList(delta);
    });
    PH.$m_down.on('click', function () {
        scrollMonthList(1);
    });
    PH.$m_up.on('click', function () {
        scrollMonthList(-1);
    });
}

function dayIdToMonthId(dayId) {
    return "mon" + monthIdFromDate(dateFromDayId(dayId));
}

function scrollDayListTo(dayId, firstTimeAnimation) {
    PH.is_scrolling = true;
    scrollMonthListTo(dayIdToMonthId(dayId));
    //PH.$daylist.scrollTop(0);
    var quickFindTop = $("#" + dayId)[0].offsetTop - $(window).height() / 2 - $(".nav-button", PH.$daylist).height() / 2;
    PH.$daylist.scrollTop(quickFindTop);
    var i = 0;
    while (getCentralLabel().attr('id') != dayId && i < PH.total_days) {
        i++;
        scrollDayList(1);
    }
    if (i >= PH.total_days) {
        PH.$daylist.scrollTop(0);
        scrollDayList(0);
    }
    PH.is_scrolling = false;
    if (firstTimeAnimation) {
        animatePH();
    }
}

function scrollMonthListTo(monthId) {
    PH.$monthlist.scrollTop(0);
    var i = 0;
    while (getCentralMonthLabel().attr('id') != monthId && i < PH.total_months) {
        i++;
        scrollMonthList(1);
    }
    if (i >= PH.total_months) {
        PH.$monthlist.scrollTop(0);
        scrollMonthList(0);
    }
}

function windowSizeChange() {
    var $selectedDay = $('li.selected', PH.$daylist);
    PH.$daylist.css('height', $(window).height() - 2 * $(".nav-button").height());
    var dayId = null;
    if ($selectedDay.length > 0) {
        dayId = $selectedDay.attr('id');
    }
    scrollDayList(0);
    if (dayId)
        scrollDayListTo(dayId);
    //scrollMonthList(0);
}

function initWindowSizeChange() {
    $(window).on('resize', windowSizeChange);
    windowSizeChange();
}

var $animDayLabel = null;
function animatePH() {
    var $animDiv = $("#animatePHDiv_" + PH.lang);
    //animRepos($animDiv);
    $animDiv.removeClass('hidden');
    $animDiv.fadeIn(100, function () {
        fadeOutMax($animDiv);
    });
    $animDayLabel = getCentralLabel();
    $animDayLabel.css({opacity: 0});
}

var LETTER_FADE_SPEED = 400, FINAL_PH_FADEOUT = 1000;

var genmax = 0, once = false;

function fadeOutMax($cont) {
    var max = 0;
    $(".anim-letter:visible", $cont).each(function () {
        var locmax = $(this).data('fade');
        if (locmax && locmax > max) {
            max = locmax;
        }
    });
    if (max) {
        $(".anim-letter[data-fade=" + max + "]", $cont).fadeOut(LETTER_FADE_SPEED, function () {
            fadeOutMax($cont);
        });
        if (genmax == 0) {
            genmax = max;
            $cont.css({
                'left': ($(window).width() - $cont.width()) / 2,
                'top': ($(window).height()) / 2 - $(".nav-button").height() - $cont.height() / 2 - TOP_MAGIC
            });
            animRepos($cont);
        }
    } else {
        $cont.fadeOut(FINAL_PH_FADEOUT, function () {
            if ($animDayLabel) {
                $animDayLabel.animate({opacity: 1}, FINAL_PH_FADEOUT, function () {
                    if (!once) {
                        initWindowSizeChange();
                        once = true;
                    }
                });
            }
        });
    }
}

function animRepos($cont) {
    $cont.animate({
        'left': $(window).width() / 2 - $('.anim-letter', $cont).width()
    }, LETTER_FADE_SPEED * genmax);
}
