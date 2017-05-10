// init cache
var PH = {};

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


var MONTH_NAMES_EN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthName(idx) {
    // todo: en/pl
    return MONTH_NAMES_EN[idx];
}

function dayIdFromDate(date) {
    return "" +
        date.getFullYear() + '-' +
        ((date.getMonth() < 10 ? "0" : "") + date.getMonth()) + '-' +
        ((date.getDate() < 10 ? "0" : "") + date.getDate());

}

var EXTRA_DAYS_BEFORE = 14, EXTRA_DAYS_AFTER = 14;
var PRJ_STRIPE_MARGIN = 64, PRJ_STRIPE_WIDTH = 6;
var DAY_IN_MILLIS = 1000 * 60 * 60 * 24;

function populateCalendar(prjs) {
    // init projects
    if (prjs) {

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
                $daylist.append($("<li>").html(getMonthName(curMonth)).addClass("calendar-month-label"));
            }
            var curDayLabel = (curDay < 10 ? "0" : "") + curDay;
            var dayId = "day" + dayIdFromDate(curDate);
            $daylist.append($("<li>").html(curDayLabel).addClass("calendar-day-label").attr("id", dayId));
            i++;
            oldYear = curYear;
            oldMonth = curMonth;
        }
        var $up = $("<div class='nav-button' id='calendar_up'/>").html('up');
        var $down = $("<div class='nav-button' id='calendar_down'/>").html('down');
        var $c = $("#calendar");
        $c.append($up);
        $c.append($daylist);
        $c.append($down);
        PH.$daylist = $daylist;
        PH.$up = $up;
        PH.$down = $down;

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
        //PH.$prj_desc = $("<div id='prj_desc'/>");
        PH.$prj_desc = $("#prj_desc");
        //PH.$prj_desc.appendTo($daylist);
        PH.$prj_desc.hide();

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

var PRJ_DESC_WIDTH = 250;
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
    var thisTop = ($(window).height() - PH.$prj_desc.height() - DAY_ITEM_SIZE )/ 2;
    PH.$prj_desc.css({
        left: '',
        right: '',
        top : thisTop,
        maxWidth : PRJ_DESC_WIDTH
    });

    if (position == 'left') {
        PH.$prj_desc.css('left', $elem.offset().left - PH.$prj_desc.width() - PRJ_STRIPE_MARGIN)
    } else {
        PH.$prj_desc.css('left', $elem.offset().left + PRJ_STRIPE_MARGIN)
    }
}

var COMMON_FADE_TIMEOUT = 300;

function onPrjHoverStartEvent($elem, prj) {
    // blur project stripes
    $(".project-stripe").not($elem).addClass("blur");
    //if we need to change bg change it
    if (prj.background && prj.background.type && (!prj.background.when || prj.background.when == 'hover')) {
        if (prj.background.type == 'video') {
            var src = null;
            if (prj.background.from == 'youtube' || !prj.background.from) {
                var ytid = extractYoutubeId(prj.background.url);
                src = "https://www.youtube.com/embed/" + ytid + "?controls=0&showinfo=0&rel=0&autoplay=1&loop=1&playlist=" + ytid;
            } else if (prj.background.from == 'vimeo') {
                var vmid = extractVimeoId(prj.background.url);
                src = "https://player.vimeo.com/video/" + vmid + "?autoplay=1&loop=1&byline=0&title=0";
            }
            if (src) {
                var iframe = $("<iframe src='" + src + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen>");
                $("#prj_bg").empty();
                $("#prj_bg").append(iframe);
                $("#bgvid").fadeOut(COMMON_FADE_TIMEOUT);
                $("#prj_bg").fadeIn(COMMON_FADE_TIMEOUT);
            }
        } else if (prj.background.type == 'image') {
            var src = prj.background.url;
            var img = $("<img src='" + src + "'>");
            $("#prj_bg").empty();
            $("#prj_bg").append(img);
            $("#bgvid").fadeOut(COMMON_FADE_TIMEOUT);
            $("#prj_bg").fadeIn(COMMON_FADE_TIMEOUT);
        }
    }
    // position project description
    attachPrjDesc($elem, prj[PH.lang], prj.position);
    PH.$prj_desc.fadeIn(COMMON_FADE_TIMEOUT);
}

function onPrjHoverEndEvent($elem, prj) {
    $(".project-stripe").removeClass("blur");
    $("#bgvid").fadeIn(COMMON_FADE_TIMEOUT);
    $("#prj_bg").fadeOut(COMMON_FADE_TIMEOUT, function () {
        $("#prj_bg").empty();
    });
    PH.$prj_desc.fadeOut(COMMON_FADE_TIMEOUT);
}

var DAY_WIDTH = 60;
var CALENDAR_WIDTH = 800;

function addToLeft(prj, prjid, before) {
    // determine position
    var overlappers = leftOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var l = CALENDAR_WIDTH / 2 - DAY_WIDTH / 2 - ((overlappers + 1) * (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH));
    var w = PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top;
    var h = DAY_ITEM_SIZE / 2;
    if (prj.from.getTime() != prj.to.getTime())
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    var $stripe = $("<div class='project-stripe'>");
    $stripe.css({
        left: l,
        width: w,
        top: t,
        height: h
    });
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

function addToRight(prj, prjid, before) {
    // determine position
    var overlappers = rightOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var l = CALENDAR_WIDTH / 2 + DAY_WIDTH / 2  + ((overlappers + 1) * (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH));
    var w = PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top;
    var h = DAY_ITEM_SIZE / 2;
    if (prj.from.getTime() != prj.to.getTime())
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    var $stripe = $("<div class='project-stripe'>");
    $stripe.css({
        left: l,
        width: w,
        top: t,
        height: h
    });
    // append events and data
    $stripe.data('prjid', prjid);  // to extract the project, candidate for removal
    $stripe.on('mouseenter', function () {
        onPrjHoverStartEvent($stripe, prj);
    });
    $stripe.on('mouseleave', function () {
        onPrjHoverEndEvent($stripe, prj);
    });
    PH.$daylist.append($stripe);
}

var DAY_ITEM_SIZE = 32;

function getCentralLabel() {
    return $(document.elementFromPoint($(document).width() / 2, $(document).height() / 2 - DAY_ITEM_SIZE)); // x, y
}

function getUpperLabel() {
    var i = 2;
    var $d = $(document.elementFromPoint($(document).width() / 2, DAY_ITEM_SIZE * i));
    while (!$d.attr('id') || $d.attr('id').substr(0, 3) != 'day') {
        i++;
        $d = $(document.elementFromPoint($(document).width() / 2, DAY_ITEM_SIZE * i));
    }
    return $d;
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
    }
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
}

function compareDays(id1, id2) {
    var d = new Date(id1.substr(3)) - new Date(id2.substr(3));
    if (d != 0)
        return d / Math.abs(d);
    else
        return 1;
}

function scrollDayListTo(dayId) {
    PH.$daylist.scrollTop(0);
    var i = 0;
    while (getCentralLabel().attr('id') != dayId && i < PH.total_days) {
        i++;
        scrollDayList(1);
    }
    if (i >= PH.total_days) {
        PH.$daylist.scrollTop(0);
        scrollDayList(0);
    }
}

function windowSizeChange() {
    var $selectedDay = $('li.selected', PH.$daylist);
    var dayId = null;
    if ($selectedDay.length > 0) {
        dayId = $selectedDay.attr('id');
    }
    scrollDayList(0);
    if (dayId)
        scrollDayListTo(dayId);
}

function initWindowSizeChange() {
    $(window).on('resize', windowSizeChange);
    windowSizeChange();
}