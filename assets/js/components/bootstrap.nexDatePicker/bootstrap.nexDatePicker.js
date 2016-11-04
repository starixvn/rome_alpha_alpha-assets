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
        nexDatePickerType: "single",
        dropDownList:
        {
            Id: "dropDownListId",
            Label: "Date ",
            LabelCss: "lbl-field col_2",
            OptionCss: "edit-field col_5"
        },
        firstDatePicker: {
            Id: "firstDatePickerId",
            Label: "From ",
            InitDate: "",
            LabelCss: "lbl-field col_2",
            TextboxCss: "edit-field col_5"
        },
        secondDatePicker: {
            Id: "secondDatePickerId",
            Label: "To ",
            InitDate: "",
            LabelCss: "lbl-field col_1",
            TextboxCss: "edit-field col_6"
        },
        datePickerFormat:
        {
            changeMonth: true,
            changeYear: true,
            showOtherMonths: true,
            dateFormat: "M dd, yy"
        },
        subDatePickerStyle: "",
        optionItems: [
            { Name: "Today", Value: 0 },
            { Name: "Yesterday", Value: 1 },
            { Name: "Current Week", Value: 2 },
            { Name: "Last Week", Value: 3 },
            { Name: "Current Month", Value: 4 },
            { Name: "Last Month", Value: 5 },
            { Name: "Since Last Month", Value: 6 },
            { Name: "Specific Date", Value: 7 }
        ],
        selectedItem: 5,
        onSelectDatePicker: function () {
        },
        minDate: null
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
        this.$select.css("display", "none");
        return this.$select;
    };

    NexDatePicker.prototype = {
        Initialize: function () {
            var me = this;
            var options = this.Options;
            //// Start render and Save Element Object
            me.$select.after(me.RenderNexDatePicker());
            me.$dropDownList = $("#" + options.dropDownList.Id);
            me.$firstDatePicker = $("#" + options.firstDatePicker.Id + "-container");
            me.$secondDatePicker = $("#" + options.secondDatePicker.Id + "-container");

            //// Format Date Picker
            me.FormatDatePicker();

            //// Add Event
            me.AddEvent();

            //// Trigger Dropdownlist Event
            me.$dropDownList.trigger("change");

            $("#" + options.dropDownList.Id).val(options.selectedItem);
        },
        RenderNexDatePicker: function () {
            var options = this.Options;
            var html = [];
            var firstDatePickerLabelCss = (typeof options.firstDatePicker.LabelCss != "undefined") ? options.firstDatePicker.LabelCss : "";
            var firstDatePickerTextboxCss = (typeof options.firstDatePicker.TextboxCss != "undefined") ? options.firstDatePicker.TextboxCss : "";
            var secondDatePickerLabelCss = (typeof options.secondDatePicker.LabelCss != "undefined") ? options.secondDatePicker.LabelCss : "";
            var secondDatePickerTextboxCss = (typeof options.secondDatePicker.TextboxCss != "undefined") ? options.secondDatePicker.TextboxCss : "";

            //// Render DropdownList time
            if (options.nexDatePickerType == "quickchoose") {
                var selectedItem = options.selectedItem;
                html.push('<div class="'
                    + options.dropDownList.LabelCss
                    + '">'
                    + options.dropDownList.Label
                    + '</div>');
                html.push('<div class="ui_nexdatepicker_edit_field '
                    + options.dropDownList.OptionCss
                    + '">');
                html.push('<select id="' + options.dropDownList.Id +
                                '" class="' + options.dropDownList.Id + '">');
                for (var i = 0; i < options.optionItems.length; i++) {
                    var optionItem = options.optionItems[i];
                    if (selectedItem == optionItem.Value) {
                        html.push('<option value="' + optionItem.Value + '" selected="selected">' + optionItem.Name + '</option>');
                    }
                    else {
                        html.push('<option value="' + optionItem.Value + '">' + optionItem.Name + '</option>');
                    }
                }
                html.push('</select>');
                html.push('</div>');
            }

            //// Render First DatePiker Element
            html.push(
              '<div class="ui_nexdatepicker_lbl_field ' + firstDatePickerLabelCss + '">' + options.firstDatePicker.Label + '</div>'
             + '<div id="' + options.firstDatePicker.Id + '-container" class="input-group date ui_nexdatepicker_edit_field ' + firstDatePickerTextboxCss + ' fromdate">'
                 + '<input type="datetime" id="' + options.firstDatePicker.Id + '" name="' + options.firstDatePicker.Id + '" readonly="readonly" class="ui_nexdatepicker_datetextbox ui_nexdatepicker_fromdate form-control" />\
                    <span class="input-group-addon">\
                        <span class="icon-calendar"></span>\
                    </span>'
             + '</div>'
             );


            //// Render Second DatePicker Element
            if (options.nexDatePickerType != "single") {
                html.push(
                  '<div class="ui_nexdatepicker_lbl_field ' + secondDatePickerLabelCss + '">' + options.secondDatePicker.Label + '</div>'
                 + '<div id="' + options.secondDatePicker.Id + '-container" class="input-group date ui_nexdatepicker_edit_field ' + secondDatePickerTextboxCss + ' todate">'
                         + '<input type="datetime" id="' + options.secondDatePicker.Id + '" name="' + options.secondDatePicker.Id + '" readonly="readonly" class="ui_nexdatepicker_datetextbox ui_nexdatepicker_todate form-control" />\
                            <span class="input-group-addon">\
                                <span class="icon-calendar"></span>\
                            </span>'
                 + '</div>'
                );
            }

            //// Return Html Joined 
            return html.join('');
        },
        FormatDatePicker: function () {
            var me = this;
            var options = this.Options;
            var ids = "";
            if (options.nexDatePickerType == "single") {
                ids += "#" + options.firstDatePicker.Id + "-container";
            }
            else {
                ids += "#" + options.firstDatePicker.Id + "-container" + ", "
                + "#" + options.secondDatePicker.Id + "-container";
            }
            this.$datePickers = $(ids);
            this.DatePickerOnSelect();
            this.$datePickers.datepicker({
                allowInputToggle: true,
                format: options.datePickerFormat.dateFormat,
                parseInputDate: function (inputDate) {
                    return typeof (inputDate) === "string" ?
                        moment((new Date(inputDate)).toISOString()) :
                        moment(inputDate.toISOString());
                }
            }).on('dp.change', function (date) {
                options.datePickerFormat.onSelect(date, this);
            });

            var fd = new Date(options.firstDatePicker.InitDate);
            var td = new Date(options.secondDatePicker.InitDate);

            me.$firstDatePicker.data("DateTimePicker").date(fd);
            if (options.nexDatePickerType != "single") {
                me.$secondDatePicker.data("DateTimePicker").date(td);
                me.CheckSetMinDate();
                me.CheckSetMaxDate();
            }
        },
        CheckSetMinDate: function () {
            var me = this;
            if (me.Options.minDate != null) {
                me.$firstDatePicker.data("DateTimePicker").minDate((new Date(me.Options.minDate)).toISOString());
                me.$secondDatePicker.data("DateTimePicker").minDate((new Date(me.Options.minDate)).toISOString());
            }
        },
        CheckSetMaxDate: function () {
            var me = this;
            if (me.Options.maxDate != null) {
                me.$firstDatePicker.data("DateTimePicker").maxDate((new Date(me.Options.maxDate)).toISOString());
                me.$secondDatePicker.data("DateTimePicker").maxDate((new Date(me.Options.maxDate)).toISOString());
            }
        },
        AddEvent: function () {
            var me = this;
            var options = this.Options;
            if (options.nexDatePickerType != "single") {
                me.$select.parent().on("change", "#" + options.dropDownList.Id, function () {
                    var selectValue = $(this).val();
                    var dt = new Date(me.CurrentDate);
                    var fDate = new Date(me.CurrentDate);
                    var tDate = new Date(me.CurrentDate);
                    var dateRange = [fDate, tDate];
                    switch (parseInt(selectValue)) {
                        case 0:
                            dateRange = [dt, dt];
                            break;
                        case 1:
                            dateRange = [me.Yesterday, me.Yesterday];
                            break;
                        case 2:
                            dateRange = NexDatePickerHelper.getDateRangeOfCurrentWeek(fDate);
                            break;
                        case 3:
                            dateRange = NexDatePickerHelper.getDateRangeOfLastWeek(fDate);
                            break;
                        case 4:
                            dateRange = NexDatePickerHelper.getDateRangeOfCurrentMonth(fDate);
                            break;
                        case 5:
                            dateRange = NexDatePickerHelper.getDateRangeOfLastMonth(fDate);
                            break;
                        case 6:
                            fDate = new Date(dt.getFullYear(), dt.getMonth() - 1, 1);
                            dateRange = [fDate, dt];
                            break;
                        case 7:
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

                    $(this).val(selectValue);
                });
            }
        },
        DatePickerOnSelect: function () {
            var me = this;
            var options = this.Options;
            var $datePickers = this.$datePickers;
            var optionSelect =
            {
                onSelect: function (selectedDate, selectedDatePicker) {
                    var $this = selectedDatePicker;

                    if (options.nexDatePickerType != "single") {
                        var option = ($this.id == options.firstDatePicker.Id + "-container") ? "minDate" : "maxDate";
                        var instance = $($this).data("DateTimePicker");
                        var date = selectedDate;
                        var nothis = $datePickers.not($this);
                        //.datepicker("disable")

                        setTimeout(function () {
                            nothis.datepicker("option", option, date);
                        }, 200);
                        //.datepicker("close");
                        //$(this).datepicker("option", option == "minDate" ? "maxDate" : "minDate", date)
                    }
                    options.onSelectDatePicker(selectedDate);
                    me.$dropDownList.val(7);
                }
            }
            this.Options.datePickerFormat = $.extend({}, this.Options.datePickerFormat, optionSelect);
        }
    }

    //// Helper for Calculation Date
    var NexDatePickerHelper =
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
            var day = date.getDay();
            var diff = date.getDate() - day; // adjust when day is sunday
            var startDate = new Date(date.setDate(diff));

            startDate = date.getMonth() < lastDate.getMonth() ?
                new Date(lastDate.getFullYear(), lastDate.getMonth(), 1) :
                startDate;

            return [startDate, lastDate];
        },
        getDateRangeOfLastWeek: function (today) {
            var lastWeek = new Date(today);
            // set the date to last week's Sunday
            lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() - 7);
            var startDate = NexDatePickerHelper.getShortDateString(lastWeek);
            // set the date to last week's Saturday
            lastWeek.setDate(lastWeek.getDate() + 6);
            var endDate = NexDatePickerHelper.getShortDateString(lastWeek);

            return [new Date(startDate), new Date(endDate)];
        },
        getDateRangeOfCurrentMonth: function (today) {
            var today = new Date(today);
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
            if (year % 4 != 0) return m[1];
            if (year % 100 == 0 && year % 400 != 0) return m[1];
            return m[1] + 1;
        },
        correctDateInRange: function (inputDate, minDate, maxDate) {
            if (minDate && inputDate < minDate) {
                return minDate;
            }

            if (maxDate && maxDate < inputDate) {
                return maxDate;
            }

            return inputDate;
        }
    };
}(jQuery));