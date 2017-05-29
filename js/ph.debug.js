debugPrint = function(message){
    if (!PH.$debug)
        PH.$debug = $(".debug-print");
    if (PH.$debug.length)
        PH.$debug.html(PH.$debug.html() + message);
    console.log(message);
};