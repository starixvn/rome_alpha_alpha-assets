/* File Created: November 14, 2012 */
/// <reference path="../jquery-1.8.2.js" />
/// <reference path="../jquery-ui-1.9.1.js" />

//// Helper for Calculation Date
var NexDatePickerHelper = NexDatePickerHelper ||
{
    getShortDateString: function (date) {
        // month is 0 based (0 - 11)
        var strDate = NexDatePickerHelper.getDateStr(date.getMonth() + 1) + "/";
        strDate += NexDatePickerHelper.getDateStr(date.getDate()) + "/";
        strDate += NexDatePickerHelper.getDateStr(date.getFullYear());
        return strDate;
    },
    getDateStr: function (date) {
        if (!date) {
            return '';
        }
        if (date < 10) {
            return '0' + date.toString();
        }
        return date.toString();
    },
    getDateRangeOfCurrentWeek: function (today) {
        var date = new Date(today);
        var lastDate = new Date(today);
        var baseDate = NexDatePickerHelper.getBaseDateOfWeek(date);
        var startDate = new Date(date.setDate(baseDate));

        return [startDate, lastDate];
    },
    getDateRangeOfLastWeek: function (today) {
        var baseDateOfCurrentWeek = NexDatePickerHelper.getBaseDateOfWeek(new Date(today)); // Monday
        var baseDateOfLastWeek = baseDateOfCurrentWeek - 7; // Seek 7 days

        var lastWeek = new Date(today);
        lastWeek.setDate(baseDateOfLastWeek);
        var startDate = NexDatePickerHelper.getShortDateString(lastWeek);

        lastWeek.setDate(lastWeek.getDate() + 6); // Seek 6 days: Monday->Sunday
        var endDate = NexDatePickerHelper.getShortDateString(lastWeek);

        return [new Date(startDate), new Date(endDate)];
    },
    getDateRangeOfCurrentMonth: function (today) {
        today = new Date(today);
        var startDate = new Date(today);
        startDate.setDate(1);
        startDate.setMonth(today.getMonth());
        var endDate = new Date(today.setMonth(today.getMonth()));
        return [startDate, endDate];
    },
    getDateRangeOfLastMonth: function (today) {
        var currentDate = new Date(today);
        var currentMonth = currentDate.getMonth();
        var currentYear = currentDate.getFullYear();
        var lastYear = currentDate.getFullYear() - 1;
        var startDate = new Date();
        var endDate = new Date();

        //// If Current month is Jan, so switch to Last year
        if (currentMonth == 0) {
            startDate = new Date(lastYear, 11, 1);
            endDate = new Date(lastYear, 11, 31);
        }
        else {
            var month = currentMonth - 1;
            startDate = new Date(currentYear, month, 1);
            endDate = new Date(currentYear,
                                month,
            //// Add 1 month because month of JS is 0 > 11
                                NexDatePickerHelper.getTotalDayOfMonth(month + 1, currentYear)
                                );
        }

        return [startDate, endDate];
    },
    getTotalDayOfMonth: function (month, year) {
        //// Note Month fomr 1 > 12
        var m = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month != 2) return m[month - 1];

        if (NexDatePickerHelper.isLeapYear(year)) return m[1] + 1;

        return m[1];
    },
    correctDateInRange: function (inputDate, minDate, maxDate) {
        if (minDate && inputDate < minDate) {
            return minDate;
        }

        if (maxDate && maxDate < inputDate) {
            return maxDate;
        }

        return inputDate;
    },
    isLeapYear: function (year) {
        return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    },
    getBaseDateOfWeek: function (date) {
        // Base date from Monday
        var day = date.getDay();            // Sun:0 -> Sat:6

        return day === 0                    // Sun:0: default of system
            ? date.getDate() - 6            // Sunday<-Mon: 6
            : date.getDate() - day + 1;     // other days<-Mon: date.getDay() - 1
    },
    isAfterFromDateOfDateRange: function (date, currentDate, dateRangeOption) {
        var currentDate = new Date(currentDate);
        var dateRange = [currentDate, currentDate];
        switch (dateRangeOption) {
            case NexDatePickerHelper.rangeOption.today:
                dateRange = [currentDate, currentDate];
                break;

            case NexDatePickerHelper.rangeOption.yesterday:
                var yesterday = new Date(currentDate);
                yesterday.setDate(currentDate.getDate() - 1);
                dateRange = [yesterday, yesterday];
                break;

            case NexDatePickerHelper.rangeOption.thisWeek:
                dateRange = NexDatePickerHelper.getDateRangeOfCurrentWeek(currentDate);
                break;

            case NexDatePickerHelper.rangeOption.lastWeek:
                dateRange = NexDatePickerHelper.getDateRangeOfLastWeek(currentDate);
                break;

            case NexDatePickerHelper.rangeOption.thisMonth:
                dateRange = NexDatePickerHelper.getDateRangeOfCurrentMonth(currentDate);
                break;

            case NexDatePickerHelper.rangeOption.lastMonth:
                dateRange = NexDatePickerHelper.getDateRangeOfLastMonth(currentDate);
                break;

            case NexDatePickerHelper.rangeOption.sinceLastMonth:
                var firstDayOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                dateRange = [firstDayOfLastMonth, currentDate];
                break;

            case NexDatePickerHelper.rangeOption.olderThan3Months:
                dateRange = NexDatePickerHelper.getDateRangeOfCurrentMonth(currentDate);
                break;

            default:
                return false;
        }

        return date > dateRange[0];
    },
    rangeOption:
    {
        today: 0,
        yesterday: 1,
        thisWeek: 2,
        lastWeek: 3,
        thisMonth: 4,
        lastMonth: 5,
        sinceLastMonth: 6,
        specificDate: 7,
        olderThan3Months: 8
    }
};