function initUI() {
    window.scrollTo(0, 1);
    initAbout();
    initContacts();
    initSubscribe();
    if (PH.isMobile) {
        initSlick();
    }
    $('.hidden-first').removeClass('hidden-first');
    $('.animate-div').hide();
}

function bgImages(cv) {
    if (cv.background && cv.background.type == 'image')
        return cv.background.url;
}

var preloadedImages = [];

function preloadImages(data) {
    var bgs = data.projects.map(bgImages);
    for (var i = 0; i < bgs.length; i++) {
        if (bgs[i]) {
            preloadedImages[i] = new Image();
            preloadedImages[i].src = bgs[i];
        }
    }
}

function initAudio(data) {
    var src = [];
    if (data.audio && data.audio.url)
        src.push(data.audio.url);
    else {
        var pre = "/assets/sound/";
        src = [pre + "bumblebees.mp3", pre + "bumblebees.webm"]
    }
    PH.sound = new Howl({
        src: src,
        loop: true,
        volume: 1
    });
    PH.sound_id = PH.sound.play();
    var $mutebtn = $("#mutebtn");
    $mutebtn.on('click', function(){
        if (PH.sound.playing(PH.sound_id))
            PH.sound.pause(PH.sound_id);
        else
            PH.sound.play(PH.sound_id);
        var $mblink = $("a", $mutebtn);
        if ($mblink.hasClass('active'))
            $mblink.html("||");
        else
            $mblink.html("|>");
        $mblink.toggleClass("active");
    })
}

function initVideo(data) {
    if (data.video && data.video.from == "vimeo") {
        var vmid = extractVimeoId(data.video.url);
        var src = "https://player.vimeo.com/video/" + vmid + "?loop=1&byline=0&title=0";
        var $container = $("#vimeo_video_bg");
        var $iframe = $("<iframe class='vimeo' src='" + src + "' frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen>");
        //var $iframe = $("<iframe frameborder='0' webkitallowfullscreen mozallowfullscreen allowfullscreen>");
        $iframe.hide();
        $container.empty();
        $container.append($iframe);
        PH.vimeoPlayer = new Vimeo.Player($iframe);
        PH.vimeoPlayer.setVolume(0);
        PH.vimeoPlayer.loadVideo(vmid).then(function (id) {
            PH.vimeoPlayer.play();
            $iframe.show();
            //vidfluid();
        });
        //PH.vimeoPlayer.play();
    } else {
        var $s1 = $('<source src="/assets/bg/bg.webm" type="video/webm">');
        var $s2 = $('<source src="/assets/bg/bg.mp4" type="video/mp4">');
        $("#bgvid").attr("poster", "/assets/bg/bg_placeholder.png")
            .css({
                "background": "url('/assets/bg/bg_placeholder.png') no-repeat",
                "background-size": "cover"
            })
            .append($s1).append($s2);
    }
}

function initSlick() {
    var $viewport = $('.viewport');
    $viewport.slick({
        arrows: false,
        dots: false,
        speed: 500,
        infinite: false,
        slide: '.slide',
        slidesToShow: 1,
        slidesToScroll: 1
    });
    $viewport.slick('slickGoTo', 1, true);
    $(".overall-title.swiper").on('click tap', function () {
        //$viewport.slick('slickGoTo', 2, false);
        $viewport.slick('slickNext');
    });
    $(".credits-footer.swiper").on('click tap', function () {
        //$viewport.slick('slickGoTo', 0, false);
        $viewport.slick('slickPrev');
    });
    $viewport.on('afterChange', function (slick, currentSlide) {
        if (currentSlide.currentSlide == 1)
            scrollDayList(0);
    });
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
        if ($descinput.is(':focus')) {
            $descinput.one('blur', function () {
                $desc.fadeOut(COMMON_FADE_TIMEOUT);
            });
        } else
            $desc.fadeOut(COMMON_FADE_TIMEOUT);
    });
    PH.$subscribe.on('click', function(){
        var lastPrj = PH.prjs[PH.prjs.length - 1];
        scrollDayListTo("day" + dayIdFromDate(lastPrj.from), false, true, lastPrj);
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
        //if (prj.from.getTime() == prj.to.getTime())
        //    html += " (" + dateToPrjListStr(prj.from) + ")";
        var $li = $("<li>").addClass("project-list-item").html(html);
        $li.on('click', function () {
            scrollDayListTo("day" + dayIdFromDate(prj.from), false, true, prj);
            //scrollDayList(0);
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
