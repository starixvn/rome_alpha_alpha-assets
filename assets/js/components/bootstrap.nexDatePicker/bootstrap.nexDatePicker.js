/* File Created: November 14, 2012 */
/// <reference path="../jquery-1.8.2.js" />
/// <reference path="../jquery-ui-1.9.1.js" />

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
            var dateRange = {
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

        if (typeof options === 'object' || !options) {
            return methods.createNexDatePicker.apply(this, arguments);
        }
    };

    $.fn.nexDatePicker.defaults = {
        //// nexDatePickerType can be single, daterange, quickchoose
        nexDatePickerType: "quickchoose",
        datePickerFormat: {
            dateFormat: "M dd, yy"
        },
        subDatePickerStyle: "",
        onSelectDatePicker: function () { },
        onQuickChooseChange: function () { },
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
            var me = this,
                options = this.Options,
                ids = options.nexDatePickerType === "single" ?
                    "#from-date-container" :
                    "#from-date-container, #to-date-container";

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
                        case NexDatePickerHelper.rangeOption.olderThan3Months:
                            dateRange = NexDatePickerHelper.getDateRangeOfCurrentMonth(fDate);
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