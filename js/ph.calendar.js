var sortPrjByStart = function (a, b) {
    return a.from.getTime() - b.from.getTime();
};

var sortPrjByEnd = function (a, b) {
    if (!a.to || !b.to)
        return 0;
    return a.to.getTime() - b.to.getTime();
};

var datify = function (prj) {
    prj.from = new Date(prj.from);
    prj.to = prj.to ? new Date(prj.to) :
        (prj.from.getTime() - new Date().getTime() >= 0) ? prj.from : new Date();
};

var monthToRoman = function (monthIdx) {
    return ROMAN_MONTHS[monthIdx];
};

function getMonthName(idx) {
    var lang = PH.lang;
    if (!lang)
        lang = 'en';
    return MONTH_NAMES[lang][idx];
}

function dayIdFromDate(date) {
    return "" +
        monthIdFromDate(date) + '-' +
        ((date.getUTCDate() < 10 ? "0" : "") + date.getUTCDate());

}

function monthIdFromDate(date) {
    return "" +
        date.getUTCFullYear() + '-' +
        ((date.getUTCMonth() < 9 ? "0" : "") + (date.getUTCMonth() + 1));
}

function dateFromDayId(dayId) {
    return new Date(dayId.substr(3));
}

function dateToPrjListStr(date) {
    return "" + date.getUTCDate() + " " +
        monthToRoman(date.getUTCMonth()) + " " +
        date.getUTCFullYear();
}

function populateCalendar(prjs) {
    // init projects
    if (prjs) {
        //prjs.each(fixEndDates);
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
        while (i < timeSpan + EXTRA_DAYS_AFTER) {
            var curDate = new Date(firstPrj.from.getTime() + i * DAY_IN_MILLIS);
            var curDay = curDate.getUTCDate();
            var curDayLabel = (curDay < 10 ? "0" : "") + curDay;
            var dayId = "day" + dayIdFromDate(curDate);
            $daylist.append($("<li>").html(curDayLabel).addClass("calendar-day-label").attr("id", dayId));
            i++;
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

        // add project stripes

        var l = 0, r = 0;

        prjs.forEach(function (prj, idx) {
            prj.id = idx;
            if (prj.position == 'left') {
                addToLeft(prj, idx, l);
                l++;
            }
            else {
                addToRight(prj, idx, r);
                r++;
            }
        });

        if (PH.isMobile)
            repositionMobilePrjDescs();

        // preinit prj_desc

        PH.$prj_desc = $("#prj_desc");
        PH.$prj_desc.hide();

        // add prjdesc clear event
        if (!PH.isMobile)
            $(document).on('click', function (e) {
                //console.log(e);
                var $target = $(e.target);
                var $clickedStripe = $(".project-stripe.clicked");
                if ($clickedStripe.length) {
                    var sameStripe = $clickedStripe.is($target);
                    if (!sameStripe)
                        clearPrjDesc(PH.prjs[$clickedStripe.data('prjid')]);
                }
            });
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

var positionPrjDescTweakLeft = PRJ_STRIPE_MARGIN;
function attachPrjDesc($elem, prj, position, team) {
    PH.$prj_desc.empty();
    var $desc = $("<div class='project-description'/>");
    var $title = $("<div class='title'/>").html(prj.title);
    var $location = null;
    if (prj.location)
        $location = $("<div class='location'/>").html(prj.location);
    var desc = "";
    if (prj.description)
        desc += prj.description;
    if (team) {
        var label;
        if (team.split(',').length > 1)
            label = PH.labels[PH.lang].team;
        else
            label = PH.labels[PH.lang].author;
        desc += "<br><br>" + label + team;
    }
    var $content = $("<div class='description' />").html(desc);
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
        PH.$prj_desc.css('left', $elem.offset().left - PH.$prj_desc.width() - PRJ_STRIPE_MARGIN - PRJ_STRIPE_WIDTH * 2);
        PH.$prj_desc.removeClass('right');
    } else {
        PH.$prj_desc.css('left', $elem.offset().left + PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH * 5);
        PH.$prj_desc.addClass('right');
    }
}

function showBackground(prj) {
    if (!PH.is_scrolling) {
        //if (PH.vimeoPlayer)
        //    PH.vimeoPlayer.pause();
        var $prjBg = $("#prj_bg");
        var $bgvid = $("#bgvid");
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
                $prjBg.empty();
                $prjBg.append(iframe);
                $bgvid.fadeOut(COMMON_FADE_TIMEOUT);
                $prjBg.fadeIn(COMMON_FADE_TIMEOUT);
            }
        } else if (prj.background.type == 'image') {
            var src = prj.background.url;
            var $bg = $("<div class='prj_bg_div'>");
            if (src && $("#prj_bg iframe").attr('src') != src) {
                $prjBg.empty();
                $bg.css({
                    "background-image": "url(" + src + ")",
                    "background-position-x": "center",
                    "background-position-y": "center",
                    "-webkit-background-size": "cover",
                    "-moz-background-size": "cover",
                    "-o-background-size": "cover",
                    "background-size": "cover"
                });
                $prjBg.append($bg);
                $bgvid.fadeOut(COMMON_FADE_TIMEOUT);
                $prjBg.fadeIn(COMMON_FADE_TIMEOUT);
            }
        }
    }
}

function hideBackground(prj) {
    if (!PH.is_scrolling) {
        //if (PH.vimeoPlayer)
        //    PH.vimeoPlayer.play();
        $("#bgvid").fadeIn(COMMON_FADE_TIMEOUT);
        $("#prj_bg").fadeOut(COMMON_FADE_TIMEOUT, function () {
            if ($("#prj_bg iframe").length) $("#prj_bg iframe").attr('src', '');      // not working anyway :-\
            $("#prj_bg").empty();
        });
    }
}

function onPrjHoverStartEvent($stripe, prj, clicked) {
    var $clickedStripe = $(".project-stripe.clicked");
    if (!$clickedStripe.length) {
        // blur project stripes
        $(".project-stripe").not($stripe).addClass("blur");
        //if we need to change bg change it
        //if (prj.background && prj.background.type && (!prj.background.when || prj.background.when == 'hover')) {
        if (prj.background && prj.background.type) {
            showBackground(prj);
        }
        // position project description
        attachPrjDesc($stripe, prj[PH.lang], prj.position, prj.team);
        if (clicked)
            $stripe.addClass('clicked');
        PH.$prj_desc.fadeIn(COMMON_FADE_TIMEOUT);
    }
}

function clearPrjDesc(prj) {
    $(".project-stripe").removeClass("blur").removeClass('clicked');
    var cond = prj.background && prj.background.type && prj.background.when == 'scroll';
    if (!cond)
        hideBackground(prj);
    PH.$prj_desc.fadeOut(COMMON_FADE_TIMEOUT);
}

function onPrjHoverEndEvent($stripe, prj) {
    //if (!$stripe.is('.clicked')) {
    //    clearPrjDesc(prj);
    //}
    var $clickedStripe = $(".project-stripe.clicked");
    if (!$clickedStripe.length) {
        clearPrjDesc(prj);
    }
}

function repositionMobilePrjDescs($centralLabel) {
    var $central = $centralLabel || getCentralLabel();
    //console.log($central);
    $(".mobile-prj-desc:visible").each(function () {
        var h = $(this).width(); // rotated
        $(this).css('top', $central[0].offsetTop + DAY_ITEM_SIZE);
        //$(this).css('top', $central.offset().top + DAY_ITEM_SIZE / 2);
    })
}

function attachMobilePrj($stripe, prj, prjid) {
    //$(".mobile-prj-desc").hide();
    var $mobilePrjDesc = $("<div data-prjid='" + prjid + "'>")
        .html(prj[PH.lang].title + " / " + prj[PH.lang].location)
        .addClass("mobile-prj-desc hidden-first " + ((prj.position == 'right') ? 'rotated-cw' : 'rotated-ccw'));

    PH.$daylist.append($mobilePrjDesc);

    var thisLeft = parseFloat($stripe.css('left'));
    if (prj.position == 'left')
        thisLeft -= $mobilePrjDesc.width() / 2 + MOBILE_PRJ_STRIPE_WIDTH + 4;
    else
        thisLeft -= $mobilePrjDesc.width() / 2 - $mobilePrjDesc.height() - MOBILE_PRJ_STRIPE_WIDTH - 4;

    //var thisLeft = parseFloat($stripe.css('left')) +
    //    ((prj.position == 'right') ? (1) : (-1)) * (MOBILE_PRJ_STRIPE_MARGIN + MOBILE_PRJ_STRIPE_WIDTH);
    $mobilePrjDesc.css({
        left: thisLeft
    });
}

var TOP_MAGIC = 7;

function addStripe(prj, prjid, posObj, isRight) {
    var $stripe = $("<div class='project-stripe' data-prjid='" + prjid + "'>");
    $stripe.css(posObj);
    if (isRight)
        $stripe.addClass('right');
    // append events and data
    $stripe.data('prjid', prjid);  // to extract the project
    if (!PH.isMobile) {
        $stripe.on('mouseenter', function () {
            onPrjHoverStartEvent($stripe, prj);
        });
        $stripe.on('mouseleave', function () {
            onPrjHoverEndEvent($stripe, prj);
        });
        $stripe.on('click', function () {
            onPrjHoverStartEvent($stripe, prj, true);
        });
    } else {
        attachMobilePrj($stripe, prj, prjid);
        //repositionMobilePrjDescs();
    }
    PH.$daylist.append($stripe);
}

function addToLeft(prj, prjid, before) {
    // determine position
    var overlappers = leftOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var overlap_shift = PH.isMobile ? (MOBILE_PRJ_STRIPE_MARGIN + MOBILE_PRJ_STRIPE_WIDTH) : (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH);
    //var l = CALENDAR_WIDTH / 2 - DAY_WIDTH / 2 - ((overlappers + 1) * overlap_shift);
    var l = $("#calendar").width() / 2 - DAY_WIDTH / 2 - ((overlappers + 1) * overlap_shift);
    var w = PH.isMobile ? MOBILE_PRJ_STRIPE_WIDTH : PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top;
    var h = DAY_ITEM_SIZE / 2;
    var isEvent = prj.from.getTime() == prj.to.getTime();
    if (!isEvent)
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    if (isEvent)
        t += TOP_MAGIC;
    else
        t += TOP_MAGIC * 2;
    addStripe(prj, prjid, {
        left: l,
        width: w,
        top: t,
        height: h
    });
}

function addToRight(prj, prjid, before) {
    // determine position
    var overlappers = rightOverlaps(prj, before); // calc overlappers for this project (look up all the previous && check dates)
    var overlap_shift = PH.isMobile ? (MOBILE_PRJ_STRIPE_MARGIN + MOBILE_PRJ_STRIPE_WIDTH) : (PRJ_STRIPE_MARGIN + PRJ_STRIPE_WIDTH);
    //var l = CALENDAR_WIDTH / 2 + DAY_WIDTH / 2 + ((overlappers + 1) * overlap_shift);
    var l = $("#calendar").width() / 2 + DAY_WIDTH / 2 + ((overlappers + 1) * overlap_shift);
    var w = PH.isMobile ? MOBILE_PRJ_STRIPE_WIDTH : PRJ_STRIPE_WIDTH;
    var t = $("li#day" + dayIdFromDate(prj.from)).offset().top + TOP_MAGIC;
    var h = DAY_ITEM_SIZE / 2;
    var isEvent = prj.from.getTime() == prj.to.getTime();
    if (!isEvent)
        h = $("li#day" + dayIdFromDate(prj.to)).offset().top - t;
    if (isEvent)
        t += TOP_MAGIC;
    else
        t += TOP_MAGIC * 2;
    addStripe(prj, prjid, {
        left: l,
        width: w,
        top: t,
        height: h
    }, true);
}


function getCentralLabel() {
    // todo: change to scrolltop selection
    //return $(document.elementFromPoint($(document).width() / 2, $(document).height() / 2 - DAY_ITEM_SIZE)); // x, y
    var $current = $("li.calendar-day-label", PH.$daylist).filter(":within-viewport");
    return $($current.get(Math.floor(($current.length - 1) / 2)));
}


function findProjects(thisDate) {
    //var res = [];
    var tempPrjs = PH.prjs.filter(function (prj) {
        return prj.from.getTime() - thisDate.getTime() <= 0 && prj.to.getTime() - thisDate.getTime() >= 0;
    });
    //return res;
    return tempPrjs;
}

function clearCentral() {
}

function addCentral($li, date) {
    $('li', PH.$daylist).removeClass('selected');
    $(".calendar-month-label,.calendar-year-label").remove();
    $li.addClass('selected');
    var utcMonth = date.getUTCMonth();
    var $month = $('<li>').addClass('calendar-month-label').html(getMonthName(utcMonth)).data('month-idx', utcMonth);
    $li.prepend($month);
    var $year = $('<li>').addClass('calendar-year-label').html(date.getUTCFullYear());
    $li.append($year);
}

function scrollDayList(delta) {
    //clear central
    PH.$daylist.scrollTop(PH.$daylist.scrollTop() + delta * DAY_ITEM_SIZE);
    var $li = getCentralLabel();
    if ($li && $li.length) {
        var selectedDayId = $li.attr('id');
        var thisDate = dateFromDayId(selectedDayId);
        addCentral($li, thisDate);
        var prjsOnThisDay = findProjects(thisDate);
        // show bg
        if (!PH.isMobile) {
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
                //else
                //    hideBackground();
            }
            else
                hideBackground();
        } else {
            $(".mobile-prj-desc").hide();
            // mobile show projects
            $(prjsOnThisDay).each(function () {
                $(".mobile-prj-desc[data-prjid=" + this.id + "]").show();
            });
            if (prjsOnThisDay.length) {
                repositionMobilePrjDescs($li);
            }
        }
        // unnecessary as we don't need to store it anymore
        //Cookies.set('date', selectedDayId);
    }
    //}
}

//var swipeHandler = function (event, phase, direction, distance, duration, fingerCount, fingerData, currentDirection) {
//    //console.log(event);
//    var delta = phase == 'up' ? 1 : -1;
//    delta *= Math.floor(distance / (DAY_ITEM_SIZE + 20)) - 1;
//    scrollDayList(delta);
//};

var hammerPanHandler = function (event) {
    //console.log(event);
    if (event.type == "pan" && (event.additionalEvent == 'panup' || event.additionalEvent == 'pandown' )) {
        var deltaY = event.deltaY;
        var delta = (deltaY) ? ( Math.abs(deltaY) / -deltaY ) : 0;
        //delta *= Math.floor(distance / (DAY_ITEM_SIZE + 20)) - 1;
        scrollDayList(delta);
    }
};

function clearFixedStripe() {
    // clear fixed stripe
    var $clickedStripe = $(".project-stripe.clicked");
    if ($clickedStripe.length) {
        clearPrjDesc(PH.prjs[$clickedStripe.data('prjid')]);
    }

}

function emulateScroll() {
    PH.$daylist.on('mousewheel DOMMouseScroll', function (event) {
        var delta = Math.max(-1, Math.min(1, (event.originalEvent.wheelDelta || -event.originalEvent.detail))) * -1;
        clearFixedStripe();
        scrollDayList(delta);
    });
    if (PH.isMobile) {
        var hm = new Hammer(PH.$daylist[0]);
        hm.get('pan').set({
            direction: Hammer.DIRECTION_VERTICAL
            //, threshold: 5
        });
        hm.on('pan', hammerPanHandler);
    }

    PH.$down.on('click', function () {
        scrollDayList(1);
        if (!PH.isMobile)
            clearFixedStripe();
    });
    PH.$up.on('click', function () {
        scrollDayList(-1);
        if (!PH.isMobile)
            clearFixedStripe();
    });
}

var SCROLL_DAYLIST_TO_ANIM = 600;

function approachGoalDay(dayId, firstTimeAnimation) {
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
        animatePH2();
    }
}

function scrollProjectSelect(prj) {
    scrollDayList(0);
    $(".project-stripe[data-prjid=" + prj.id + "]").click();
    //if (prj.background)
    //    showBackground(prj);
}

function scrollDayListTo(dayId, firstTimeAnimation, tryToAnimate, prj) {
    PH.is_scrolling = true;
    var quickFindTop = $("#" + dayId)[0].offsetTop - $(window).height() / 2 - $('.nav-button').height() / 2;
    if (quickFindTop) {
        var speed = (!tryToAnimate) ? 0 : SCROLL_DAYLIST_TO_ANIM;
        //    PH.$daylist.scrollTop(quickFindTop);
        //else
        PH.$daylist.animate({scrollTop: quickFindTop}, speed, function () {
            // approach
            approachGoalDay(dayId, firstTimeAnimation);
            if (!firstTimeAnimation)
                scrollDayList(0); // start bg
            if (prj && !firstTimeAnimation) {
                scrollProjectSelect(prj);
            }
        });
    }
    else {
        PH.$daylist.scrollTop(0);
        approachGoalDay(dayId, firstTimeAnimation);
        if (prj && !firstTimeAnimation) {
            scrollProjectSelect(prj);
        }
    }
}


function windowSizeChange() {
    if (PH.isMobile) {
        document.body.height = window.innerHeight;
        $(".mobile-ui-fix").css('height', window.innerHeight);
    }
    var $selectedDay = $('li.selected', PH.$daylist);
    PH.$daylist.css('height', $(window).height() - 2 * $(".nav-button").height());
    var dayId = null;
    if ($selectedDay.length > 0) {
        dayId = $selectedDay.attr('id');
    }
    // fixme: or not
    //if (dayId)
    //    scrollDayListTo(dayId);
    //else
    scrollDayList(0);

}

function initWindowSizeChange() {
    $(window).on('resize', windowSizeChange);
    windowSizeChange();
}

var $animDayLabel = null;
var positionTweakLeft = 8;
var positionTweakTop = -4;
function animatePH2() {
    // hide stripes
    $(".project-stripe").hide();

    var $animDiv = $("#animatePH2Div_" + PH.lang);
    //animRepos($animDiv);
    $animDiv.removeClass('hidden');
    $animDiv.css({
        'left': ($(window).width() - $animDiv.width()) / 2 + positionTweakLeft,
        'top': ($(window).height()) / 2 - $(".nav-button").height() - $animDiv.height() / 2 - TOP_MAGIC + positionTweakTop
    });
    $animDayLabel = getCentralLabel();
    $animDayLabel.css({opacity: 0});
    $animDiv.fadeIn(100, function () {
        fadeOutMax2($animDiv);
    });
}

// first animation block

var FINAL_PH_FADEOUT = 2000, STARTING_DELAY = 1000;

var once = false;

function fadeOutMax2($cont) {
    animRepos($cont);
    var $thisLetters = $(".anim-letter.fade", $cont);
    $thisLetters.delay(STARTING_DELAY).animate({
        width: 0,
        opacity: 0
    }, {
        duration: FINAL_PH_FADEOUT,
        easing: 'linear',
        complete: function () {
            if ($animDayLabel) {
                $animDayLabel.animate(
                    {
                        opacity: 1
                    }, {
                        duration: FINAL_PH_FADEOUT,
                        complete: function () {
                            if (!once) {
                                $('.animate-div').hide();
                                initWindowSizeChange();
                                once = true;
                            }
                        }
                    });
                $(".project-stripe").show(FINAL_PH_FADEOUT);
            }

            $cont.fadeOut({
                duration: FINAL_PH_FADEOUT,
                easing: 'linear',
                complete: function () {
                }
            });

        }
    });
}

function animRepos($cont) {
    $cont.delay(STARTING_DELAY).animate({
        'left': $(window).width() / 2 - $('.anim-letter', $cont).width()
    }, {
        duration: FINAL_PH_FADEOUT,
        easing: 'linear'
    });
}
