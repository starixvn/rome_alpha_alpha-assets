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
        specificDate: 7
    }
};

(function () {
    //// Method expose for user use
    var methods = {
        createNexDatePicker: function (opts) {
            opts = $.extend({}, $.fn.nexDatePicker.defaults, opts);
            return this.each(function () {
                return new NexDatePicker(this, opts);
            });
        },
        getSingleDate: function () {
            return $(this).parent().find(".ui_nexdatepicker_fromdate").val();
        },
        getDateRange: function () {
            var $this = $(this).parent();
            var dateRange =
            {
                FromDate: $this.find(".ui_nexdatepicker_fromdate").val(),
                ToDate: $this.find(".ui_nexdatepicker_todate").val()
            };

            return dateRange;
        }
    };

    $.fn.nexDatePicker = function (options) {
        if (methods[options]) {
            return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof options === 'object' || !options) {
            return methods.createNexDatePicker.apply(this, arguments);
        }
        else {
            //throw error
        }
    };

    $.fn.nexDatePicker.defaults = {
        //// nexDatePickerType can be single, daterange, quickchoose
        nexDatePickerType: "quickchoose",
        datePickerFormat:
        {
            dateFormat: "M dd, yy"
        },
        subDatePickerStyle: "",
        onSelectDatePicker: function () {
        },
        onQuickChooseChange: function () {
        },
        minDate: null,
        ConstraintFromTo: 0
    };

    var NexDatePicker = function (select, options) {
        this.Options = options;
        this.$select = $(select);
        this.$dropDownList = null;
        this.$firstDatePicker = null;
        this.$secondDatePicker = null;
        this.$datePickers = null;
        this.CurrentDate = options.currentDate;

        //// Get Yesterday
        this.Yesterday = new Date(this.CurrentDate);
        this.Yesterday.setDate(this.CurrentDate.getDate() - 1);
        //// Start Render
        this.Initialize();

        //// Hide Container
        return this.$select;
    };

    NexDatePicker.prototype = {
        Initialize: function () {
            var me = this;
            var options = this.Options;
            //// Start render and Save Element Object
            me.$parent = me.$select.parent();
            me.$dropDownList = me.$parent.find("#dropdown-daterange");
            me.$firstDatePicker = me.$parent.find("#from-date-container");
            me.$secondDatePicker = me.$parent.find("#to-date-container");
            me.$userRangeLavel = me.$dropDownList.find("#range-label");
            me.$userRangeOptionHidden = me.$dropDownList.find("#hidden-range-option");

            //// Format Date Picker
            me.FormatDatePicker();

            //// Add Event
            me.AddEvent();

            me.CorrectOptionWithMinDate();
        },
        FormatDatePicker: function () {
            var me = this;
            var options = this.Options;
            var ids = "";
            if (options.nexDatePickerType === "single") {
                ids += "#from-date-container";
            }
            else {
                ids += "#from-date-container, #to-date-container";
            }
            this.$datePickers = me.$parent.find(ids);

            moment.locale('en', {
                week: { dow: 1 } // Monday is the first day of the week
            });

            this.$datePickers.datepicker({
                allowInputToggle: true,
                format: options.datePickerFormat.dateFormat,
                parseInputDate: function (inputDate) {
                    return typeof inputDate === "string" ?
                        moment((new Date(inputDate)).toISOString()) :
                        moment(inputDate.toISOString());
                }
            }).on('dp.change', function (date) {
                if (date.date.format('YYYY MM DD') !== date.oldDate.format('YYYY MM DD')) {
                    var specificDateOption = me.$dropDownList.find("a.range-option[data-value='7']");
                    me.$userRangeLavel.html(specificDateOption.html());
                    me.$userRangeOptionHidden.val(specificDateOption.attr("data-value"));
                }

                if (this.id === "from-date-container") {
                    me.$secondDatePicker.data("DateTimePicker").minDate((new Date(me.$firstDatePicker.find("input").val())).toISOString());
                } else {
                    me.$firstDatePicker.data("DateTimePicker").maxDate((new Date(me.$secondDatePicker.find("input").val())).toISOString());
                }

                options.onSelectDatePicker(date);

                if (options.ConstraintFromTo != 0) {
                    var currentDate = new Date(date.date);
                    if (this.id === "from-date-container") {
                        var minToDate = moment(currentDate).add(parseInt(options.ConstraintFromTo), 'months');
                        var toDate = new Date(me.$secondDatePicker.find("input").val());
                        if (minToDate < toDate) {
                            me.$secondDatePicker.data("DateTimePicker").date(minToDate);
                        }
                    }
                    else {
                        var maxFromDate = moment(currentDate).add(parseInt(-options.ConstraintFromTo), 'months');
                        var fromDate = new Date(me.$firstDatePicker.find("input").val());
                        if (maxFromDate > fromDate) {
                            me.$firstDatePicker.data("DateTimePicker").date(maxFromDate);
                        }
                    }

                }
            });

            var fd = new Date(this.$firstDatePicker.find("input").val());
            var td = new Date(this.$secondDatePicker.find("input").val());

            me.$firstDatePicker.data("DateTimePicker").date(fd);
            if (options.nexDatePickerType !== "single") {
                me.$secondDatePicker.data("DateTimePicker").date(td);
                me.CheckSetMinDate();
                me.CheckSetMaxDate();
            }
        },
        CheckSetMinDate: function () {
            var me = this;
            if (me.Options.minDate !== null) {
                me.$firstDatePicker.data("DateTimePicker").minDate((new Date(me.Options.minDate)).toISOString());
                me.$secondDatePicker.data("DateTimePicker").minDate((new Date(me.Options.minDate)).toISOString());
            }
        },
        CheckSetMaxDate: function () {
            var me = this;
            if (me.Options.maxDate !== null) {
                me.$firstDatePicker.data("DateTimePicker").maxDate((new Date(me.Options.maxDate)).toISOString());
                me.$secondDatePicker.data("DateTimePicker").maxDate((new Date(me.Options.maxDate)).toISOString());
            }
        },
        AddEvent: function () {
            var me = this;
            var options = this.Options;
            if (options.nexDatePickerType !== "single") {
                me.$dropDownList.find(".dropdown-menu").on("click", "a.range-option", function (e) {
                    e.preventDefault();
                    var $this = $(this);
                    var selectValue = parseInt($this.attr("data-value"));
                    var dt = new Date(me.CurrentDate);
                    var fDate = new Date(me.CurrentDate);
                    var tDate = new Date(me.CurrentDate);
                    var dateRange = [fDate, tDate];
                    switch (selectValue) {
                        case NexDatePickerHelper.rangeOption.today:
                            dateRange = [dt, dt];
                            break;
                        case NexDatePickerHelper.rangeOption.yesterday:
                            dateRange = [me.Yesterday, me.Yesterday];
                            break;
                        case NexDatePickerHelper.rangeOption.thisWeek:
                            dateRange = NexDatePickerHelper.getDateRangeOfCurrentWeek(fDate);
                            break;
                        case NexDatePickerHelper.rangeOption.lastWeek:
                            dateRange = NexDatePickerHelper.getDateRangeOfLastWeek(fDate);
                            break;
                        case NexDatePickerHelper.rangeOption.thisMonth:
                            dateRange = NexDatePickerHelper.getDateRangeOfCurrentMonth(fDate);
                            break;
                        case NexDatePickerHelper.rangeOption.lastMonth:
                            dateRange = NexDatePickerHelper.getDateRangeOfLastMonth(fDate);
                            break;
                        case NexDatePickerHelper.rangeOption.sinceLastMonth:
                            fDate = new Date(dt.getFullYear(), dt.getMonth() - 1, 1);
                            dateRange = [fDate, dt];
                            break;
                        case NexDatePickerHelper.rangeOption.specificDate:
                            fDate = me.$firstDatePicker.data("DateTimePicker").date();
                            tDate = me.$secondDatePicker.data("DateTimePicker").date();
                            dateRange = [fDate, tDate];
                            break;
                        default:
                            var options = $(this).find("option[value=" + selectValue + "]");
                            fDate = new Date(options.attr("data-fDate"));
                            tDate = new Date(options.attr("data-tDate"));
                            if (fDate && tDate) {
                                dateRange = [fDate, tDate];
                            }

                            break;
                    }

                    fDate = NexDatePickerHelper.correctDateInRange(dateRange[0], me.Options.minDate, me.Options.maxDate);
                    tDate = NexDatePickerHelper.correctDateInRange(dateRange[1], me.Options.minDate, me.Options.maxDate);

                    me.$firstDatePicker.data("DateTimePicker").maxDate(false);
                    me.$secondDatePicker.data("DateTimePicker").maxDate(false);

                    me.$firstDatePicker.data("DateTimePicker").date(fDate);
                    me.$secondDatePicker.data("DateTimePicker").date(tDate);
                    me.CheckSetMinDate();
                    me.CheckSetMaxDate();

                    me.$userRangeOptionHidden.val(selectValue);
                    me.$userRangeLavel.html($this.html());

                    me.Options.onQuickChooseChange(selectValue);
                });
            }
        },
        CorrectOptionWithMinDate: function () {
            var me = this;
            if (me.Options.minDate) {
                me.$dropDownList.find(".dropdown-menu a.range-option").each(
                    function (index, rangeOption) {
                        var $rangeOption = $(rangeOption);

                        var rangeOptionValue = parseInt($rangeOption.attr("data-value"));

                        if (NexDatePickerHelper.isAfterFromDateOfDateRange(me.Options.minDate, me.Options.currentDate, rangeOptionValue)) {
                            $rangeOption.remove();
                        }
                    });
            }
        }
    };
}(jQuery));