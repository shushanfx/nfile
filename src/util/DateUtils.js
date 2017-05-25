var getIntValue = function(ss, defaultValue) {
    try {
        return parseInt(ss, 10);
    } catch (e) {
        return defaultValue;
    }
};
var getWidthString = function(num) {
    return num < 10 ? ("0" + num) : num;
};

function getFriendlyTimeFromString(str, now) {
    var currentTime = new Date(now);
    var arr = str.split(/\s+/gi);
    var temp = 0,
        arr1, arr2, oldTime, delta;

    if (arr.length >= 2) {
        arr1 = arr[0].split(/[\/\-]/gi);
        arr2 = arr[1].split(":");
        oldTime = new Date();
        oldTime.setYear(getIntValue(arr1[0], currentTime.getFullYear()));
        oldTime.setMonth(getIntValue(arr1[1], currentTime.getMonth() + 1) - 1);
        oldTime.setDate(getIntValue(arr1[2], currentTime.getDate()));

        oldTime.setHours(getIntValue(arr2[0], currentTime.getHours()));
        oldTime.setMinutes(getIntValue(arr2[1], currentTime.getMinutes()));
        oldTime.setSeconds(getIntValue(arr2[2], currentTime.getSeconds()));

        delta = currentTime.getTime() - oldTime.getTime();

        if (delta <= 6000) {
            return "1分钟内";
        } else if (delta < 60 * 60 * 1000) {
            return Math.floor(delta / (60 * 1000)) + "分钟前";
        } else if (delta < 24 * 60 * 60 * 1000) {
            return Math.floor(delta / (60 * 60 * 1000)) + "小时前";
        } else if (delta < 3 * 24 * 60 * 60 * 1000) {
            return Math.floor(delta / (24 * 60 * 60 * 1000)) + "天前";
        } else if (currentTime.getFullYear() != oldTime.getFullYear()) {
            return [getWidthString(oldTime.getFullYear()), getWidthString(oldTime.getMonth() + 1), getWidthString(oldTime.getDate())].join("-")
        } else {
            return [getWidthString(oldTime.getMonth() + 1), getWidthString(oldTime.getDate())].join("-");
        }
    }
    return "";
}

function getFriendlyTime(date, now) {
    var currentTime = null,
        oldTime = null,
        delta = null;
    if (typeof date == "string") {
        return getFriendlyTimeFromString(date);
    }
    currentTime = new Date(now);
    oldTime = date;

    delta = currentTime.getTime() - oldTime.getTime();
    if (delta <= 6000) {
        return "1分钟内";
    } else if (delta < 60 * 60 * 1000) {
        return Math.floor(delta / (60 * 1000)) + "分钟前";
    } else if (delta < 24 * 60 * 60 * 1000) {
        return Math.floor(delta / (60 * 60 * 1000)) + "小时前";
    } else if (delta < 3 * 24 * 60 * 60 * 1000) {
        return Math.floor(delta / (24 * 60 * 60 * 1000)) + "天前";
    } else if (currentTime.getFullYear() != oldTime.getFullYear()) {
        return [getWidthString(oldTime.getFullYear()), getWidthString(oldTime.getMonth() + 1), getWidthString(oldTime.getDate())].join("-")
    } else {
        return [getWidthString(oldTime.getMonth() + 1), getWidthString(oldTime.getDate())].join("-");
    }
}

function inNDays(date, days) {
    if (!days || Number.isNaN(days) || days <= 0) {
        days = 1;
    }
    var curDate = new Date();
    var dalta = curDate.getTime() - date.getTime();

    if (dalta <= days * 1000 * 3600 * 24) {
        return true;
    }
    return false;
}


module.exports.getFriendlyTime = getFriendlyTime;
module.exports.getFriendlyTimeFromString = getFriendlyTimeFromString;
module.exports.inNDays = inNDays;