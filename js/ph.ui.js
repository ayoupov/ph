function initUI() {
    window.scrollTo(0,1);
    initAbout();
    initContacts();
    initSubscribe();
    if (PH.isMobile)
        initSlick();
    $('.hidden-first').removeClass('hidden-first');
    $('.animate-div').hide();
}

function initSlick(){
    $('.viewport').slick({
        arrows: false,
        dots: false,
        speed: 0,
        infinite: false,
        slide: '.slide',
        slidesToShow: 1,
        slidesToScroll: 1
    });
    $('.viewport').slick('slickGoTo', 1, true);
}

function initAbout() {
    var $desc = PH.$about.find(".about-desc");
    $desc.hide();
    PH.$about
        .on('mouseenter', function () {
            $desc.fadeIn(COMMON_FADE_TIMEOUT);
        }).on('mouseleave', function () {
        $desc.fadeOut(COMMON_FADE_TIMEOUT);
    });

}
function initSubscribe() {
    var $desc = PH.$subscribe.find(".subscribe-desc");
    $desc.hide();
    PH.$subscribe
        .on('mouseenter', function () {
            $desc.fadeIn(COMMON_FADE_TIMEOUT);
        }).on('mouseleave', function () {
        var $descinput = $desc.find('input');
        if ($descinput.is(':focus'))
        {
            $descinput.one('blur', function(){
                $desc.fadeOut(COMMON_FADE_TIMEOUT);
            });
        } else
        $desc.fadeOut(COMMON_FADE_TIMEOUT);
    });

}


function initContacts() {
    var $desc = PH.$contacts.find(".contacts-desc");
    var $title = PH.$contacts.find('.contacts-title');
    $desc.hide();
    PH.$contacts
        .on('mouseenter', function () {
            $desc.fadeIn(COMMON_FADE_TIMEOUT);
            $title.html("<a href='http://parerga.site'>&copy; PARERGA</a>");
        }).on('mouseleave', function () {
        $desc.fadeOut(COMMON_FADE_TIMEOUT);
        //$title.html("&copy; 2017 PARERGA");
        $title.html("&copy; PARERGA");
    });

}

function initProjectMenu() {
    var $prev = PH.$prj_menu.find(".project-list");
    if ($prev.length)
        $prev.remove();
    var $ul = $("<ul class='project-list'/>");
    PH.$prj_menu.append($ul);
    PH.prjs.forEach(function (prj) {
        var html = prj[PH.lang].title;
        if (prj.from.getTime() == prj.to.getTime())
            html += " (" + dateToPrjListStr(prj.from) + ")";
        var $li = $("<li>").addClass("project-list-item").html(html);
        $li.on('click', function () {
            scrollDayListTo("day" + dayIdFromDate(prj.from));
            scrollDayList(0);
        });
        $ul.append($li);
    });
    $ul.hide();
    PH.$prj_menu
        .on('mouseenter', function () {
            $ul.fadeIn(COMMON_FADE_TIMEOUT);
        }).on('mouseleave', function () {
        $ul.fadeOut(COMMON_FADE_TIMEOUT);
    });
}
