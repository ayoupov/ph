// init cache
var PH = {};

var ROMAN_MONTHS = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

var MONTH_NAMES = {
    "pl": ["stycz.", "luty", "mar.", "kwiec.", "maj", "czerw.", "lip.", "sierp.", "wrzes.", "pazdz.", "listop.", "grudz."],
    "en": ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
};

var EXTRA_DAYS_BEFORE = 14, EXTRA_DAYS_AFTER = 14;
var PRJ_STRIPE_MARGIN = 64, PRJ_STRIPE_WIDTH = 6;
var DAY_IN_MILLIS = 1000 * 60 * 60 * 24;
var PRJ_DESC_WIDTH = 250;

var COMMON_FADE_TIMEOUT = 300;
var DAY_WIDTH = 60;
var CALENDAR_WIDTH = 800;

var DAY_ITEM_SIZE = 32;
var MONTH_ITEM_SIZE = 29;

