/*
* monPickr - jQuery Plugin
* Just a simple month picker
*
* Examples and documentation at: http://update.later
*
* Copyright (c) 2012
*
* Version: 0.0.3 (2 Mar 2012)
* Requires: jQuery v1.7+
*/

(function ($) {
    var shortMonthsInYear = [],
        longMonthsInYear = [];
    Date.prototype.toStringFormat = function (format) {
        var year = this.getFullYear(),
            month = this.getMonth(),
            day = this.getDate(),
            result = format;

        function strMonth(value) {
            var monthArrayIndex = parseInt(value);
            return shortMonthsInYear[monthArrayIndex] || value;
        }

        function strLongMonth(value) {
            var monthArrayIndex = parseInt(value);
            return longMonthsInYear[monthArrayIndex] || value;
        }

        result = result.replace(/yyyy/g, year);
        result = result.replace(/yy/g, year.toString().substr(2));

        result = result.replace(/MMMM/g, strLongMonth(month));
        result = result.replace(/MMM/g, strMonth(month));
        result = result.replace(/MM/g, month < 9 ? '0' + (month + 1) : (month + 1));

        result = result.replace(/dd/g, day < 10 ? '0' + day : day);

        return result;
    };

    var today = null,
        thisYear = null,
        thisMonth = null,
        thisDay = null,
        firstDayThisYear = null,
        firstDayThisMonth = null,
        lastDayThisMonth = null,
        logger = { log: function () { } },

    /*
    * Private methods
    */

        isInteger = function (value, writeLogToConsole) {
            var isValid = Math.ceil(value) == Math.floor(value);

            if (writeLogToConsole && !isValid) logger.log('Oops! "' + value + '" is an invalid Integer');

            return isValid;
        },

        isValidDate = function (value, writeLogToConsole) {
            var _value = new Date(value),
                isValid = isInteger(_value.getDate()) && isInteger(_value.getMonth()) && isInteger(_value.getFullYear());

            if (writeLogToConsole && !isValid) logger.log('Oops! "' + value + '" is an invalid Date');

            return isValid;
        },

        _getData = function (target) {
            var data = $(target).data('monPickr');
            if (!data) {
                logger.log('Oops! No data of monPickr is available');
                return null;
            }
            return data;
        },

        _validateMonth = function (minDate, maxDate, year, month) {
            var minYear = minDate.getFullYear(),
                minMonth = minDate.getMonth(),
                maxYear = maxDate.getFullYear(),
                maxMonth = maxDate.getMonth(),

                outOfLowBoundary = year < minYear || (year == minYear && month < minMonth),
                outOfHighBoundary = year > maxYear || (year == maxYear && month > maxMonth);

            return !outOfLowBoundary && !outOfHighBoundary;
        },

        _validateDate = function (minDate, maxDate, year, month, date) {
            // Re-new the params cauz of time ignorance
            var minDayInMonth = new Date(year, month, _getMinDayInMonth(minDate, year, month)),
                maxDayInMonth = new Date(year, month, _getMaxDayInMonth(maxDate, year, month)),
                date = new Date(date.getFullYear(), date.getMonth(), date.getDate());

            return minDate <= date && date <= maxDayInMonth;
        },

        _checkReachBound = function (data, year, month) {
            // diable next/prev button if the selected month reach the bound
            var nextMonth = new Date(year, month + 1, 1),
                prevMonth = new Date(year, month - 1, 1);

            if (!_validateMonth(data.minDate, data.maxDate, nextMonth.getFullYear(), nextMonth.getMonth())) data.btnNext.addClass('ui-state-disabled');
            else data.btnNext.removeClass('ui-state-disabled');

            if (!_validateMonth(data.minDate, data.maxDate, prevMonth.getFullYear(), prevMonth.getMonth())) data.btnPrev.addClass('ui-state-disabled');
            else data.btnPrev.removeClass('ui-state-disabled');
        },

        _setMonth = function (data, year, month) {
            data.year = year;
            data.month = month;
        },

        _setMonthLabel = function (data) {
            data.lblSelectedMonth.val(new Date(data.year, data.month, 1).toStringFormat(data.monthFormat));
        },

        _selectMonth = function (data, year, month) {
            // invokes handler (if any) just before the event change month
            if (typeof data.beforeChangeMonth == 'function') data.beforeChangeMonth();
            else { logger.log('Oops! beforeChangeMonth event\'s handler (which has type "' + typeof data.beforeChangeMonth + '") is not a function'); }

            // highlight selected month
            data.dropDown.find('.month-wrap a[month].selected').removeClass('selected').parent().removeClass('ui-state-active');
            data.dropDown.find('.month-wrap[year=' + year + '] a[month=' + (month + 1) + ']:first').addClass('selected').parent().addClass('ui-state-active');

            _setMonth(data, year, month);
            _setMonthLabel(data);

            // if selected year differs from current year then hide current year and show selected one
            if (data.dropDown.find('.month-wrap.selected').attr('year') != year) {
                _hideCurrentYear(data);
                _showSelectedYear(data, year);
                data.dropDown.find('.year a.selected:first').parent().addClass('selected');
            }

            if (data.showDateRange && data.fromDayId && data.toDayId) {
                var minDayInMonth = _getMinDayInMonth(data.minDate, data.year, data.month),
                    maxDayInMonth = _getMaxDayInMonth(data.maxDate, data.year, data.month);

                // change fromDate and toDate
                _selectDay(data, data.ddlFromDate, minDayInMonth, true);
                _selectDay(data, data.ddlToDate, maxDayInMonth, false);

                // re-render fromDay & toDay range
                var limitDayRange = function (idx) {
                    var $this = $(this),
                    day = idx + 1;

                    if (day < minDayInMonth || maxDayInMonth < day) $this.hide();
                    else $this.show();
                };

                data.ddlFromDate.dropDown.find('li').each(limitDayRange);
                data.ddlToDate.dropDown.find('li').each(limitDayRange);
            }

            if (!data.showDateRange) {
                data.fromDate = new Date(data.year, data.month, 1);
                data.toDate = new Date(data.year, data.month, 1);
            }

            _checkReachBound(data, year, month);

            // invokes handler (if any) just after the event change month
            if (typeof data.afterChangeMonth == 'function') data.afterChangeMonth();
            else { logger.log('Oops! afterChangeMonth event\'s handler (which has type "' + typeof data.afterChangeMonth + '") is not a function'); }
        },

        _setDay = function (data, value, isFromDay) {
            if (isFromDay) {
                data.fromDay = parseInt(value, 10);
                data.fromDate = new Date(data.year, data.month, value);

                // if fromDate greater than toDate then assign toDate to fromDate and vice versa
                if (data.fromDate > data.toDate) {
                    data.toDate = data.fromDate;
                    data.toDay = data.fromDay;
                    _setDayLabel(data.ddlToDate, data.toDay);
                }
            } else {
                data.toDay = parseInt(value, 10);
                data.toDate = new Date(data.year, data.month, value);

                // if fromDate greater than toDate then assign toDate to fromDate and vice versa
                if (data.fromDate > data.toDate) {
                    data.fromDate = data.toDate;
                    data.fromDay = data.toDay;
                    _setDayLabel(data.ddlFromDate, data.fromDay);
                }
            }
        },

        _setDayLabel = function (target, value) {
            target.find('.daypickr-selected-day').val(value);
        },

        _selectDay = function (data, target, value, isFromDay) {
            // invokes handler (if any) just before the event change day
            if (typeof data.beforeChangeDay == 'function') data.beforeChangeDay();
            else { logger.log('Oops! beforeChangeDay event\'s handler (which has type "' + typeof data.beforeChangeDay + '") is not a function'); }

            _setDayLabel(target, value);
            _setDay(data, value, isFromDay);

            // invokes handler (if any) just after the event change day
            if (typeof data.afterChangeDay == 'function') data.afterChangeDay();
            else { logger.log('Oops! afterChangeDay event\'s handler (which has type "' + typeof data.afterChangeDay + '") is not a function'); }
        },

        _getMinDayInMonth = function (minDate, year, month) {
            var _firstDayOfMonth = new Date(year, month, 1),
                _minDate = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate());

            return _minDate > _firstDayOfMonth ? _minDate.getDate() : 1;
        },

        _getMaxDayInMonth = function (maxDate, year, month) {
            var _lastDayOfMonth = new Date(year, month + 1, 0),
                _maxDate = new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate());

            return _lastDayOfMonth > _maxDate ? _maxDate.getDate() : _lastDayOfMonth.getDate();
        },

        _hideCurrentYear = function (data) {
            // collapse current year
            var currentMonthWrap = data.dropDown.find('.month-wrap.selected').eq(0);

            if (data.dropDown.is(':hidden')) {
                currentMonthWrap.hide();
            } else {
                currentMonthWrap.slideUp(data.showYearSpeed);
            }

            currentMonthWrap.removeClass('selected');
            data.dropDown.find('.year .selected').eq(0).removeClass('selected').parent().removeClass('selected');
        },

        _showSelectedYear = function (data, year) {
            var target = data.dropDown.find('.month-wrap[year=' + year + ']').eq(0);

            target.prev('.year').find('a[year]').eq(0).addClass('selected');
            target.addClass('selected').slideDown(data.showYearSpeed);
        },

        _showDropDown = function (data, target) {
            target.dropDown.slideDown(data.showDropDownSpeed);
        },

        _hideDropDown = function (data, target) {
            target.dropDown.slideUp(data.showDropDownSpeed);
        },

    _methods = {
        init: function (options) {
            if ($.isFunction((options = options || {}).log)) logger.log = options.log;

            if (!this.length) { // if the initial DOM does not exist
                logger.log('Oops! DOM element "' + this.selector + '" does not exist');
                return;
            }

            if (options.today && !isValidDate(options.today, true)) return;

            today = options.today ? new Date(options.today) : new Date();
            thisYear = today.getFullYear();
            thisMonth = today.getMonth();
            thisDay = today.getDate();
            firstDayThisYear = new Date(thisYear, 0, 1);
            firstDayThisMonth = new Date(thisYear, thisMonth, 1);
            lastDayThisMonth = new Date(thisYear, thisMonth + 1, 0);

            if (options.month) {
                var crrMonth = new Date(options.month);
                var currentYear = crrMonth.getFullYear();
                var currentMonth = crrMonth.getMonth();
                currentDay = crrMonth.getDate();
                firstDayThisYear = new Date(currentYear, 0, 1);
                firstDayThisMonth = new Date(currentYear, currentMonth, 1);
                lastDayThisMonth = new Date(currentYear, currentMonth + 1, 0);
            }

            // Create some defaults, extending them with any options that were provided
            var settings = $.extend({
                shortMonthsInYear: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
                longMonthsInYear: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                minDate: firstDayThisYear,
                maxDate: today,
                month: today,

                showDateRange: true,
                autoGenerateDateRange: true,
                fromDay: firstDayThisMonth.getDate(),
                toDay: lastDayThisMonth <= today ? lastDayThisMonth.getDate() : today.getDate(),
                fromDayId: null, // required if showDateRange is true & autoGenerateDateRange is false
                toDayId: null, // required if showDateRange is true & autoGenerateDateRange is false
                fromDayLabel: 'from',
                toDayLabel: 'to',

                expandYearOnhover: false,
                expandDayOnhover: false,
                showYearSpeed: 110,
                showDropDownSpeed: 10,

                disabled: false,
                sortDesc: false,
                monthFormat: 'MMM yyyy',
                nextText: 'Next Month',
                prevText: 'Previous Month',
                width: 144,
                dropDownMaxHeight: 400,
                zIndex: 9999,

                beforeChangeMonth: function () { },
                afterChangeMonth: function () { },
                beforeChangeDay: function () { },
                afterChangeDay: function () { }
            }, options);

            shortMonthsInYear = settings.shortMonthsInYear;
            longMonthsInYear = settings.longMonthsInYear;

            //#region VALIDATES INPUT VALUES

            // Validates minDate & maxDate
            if (!isValidDate(settings.minDate, true) || !isValidDate(settings.maxDate, true)) return;

            // Convert minDate & maxDate to Date type for easier later using
            settings.minDate = new Date(settings.minDate);
            settings.maxDate = new Date(settings.maxDate);

            // Validtes selected month
            if (!isValidDate(settings.month, true)) return;

            // Convert selected month to Date type for easier later using
            settings.month = new Date(settings.month);

            var year = settings.month.getFullYear(),
                month = settings.month.getMonth();

            // Make sure selected month are not out of range (minDate ~ maxDate)
            if (!_validateMonth(settings.minDate, settings.maxDate, year, month)) {
                logger.log('Oops! Selected month (' + settings.month.toStringFormat('MM/yyyy') +
                    ') is out of range (' + settings.minDate.toStringFormat('MM/yyyy') + ' ~ ' + settings.maxDate.toStringFormat('MM/yyyy') + ')');
                return;
            }

            // Makes sure selected fromDate & toDate are not out of Range (minDate ~ maxDate)
            var fromDate = new Date(year, month, settings.fromDay),
                toDate = new Date(year, month, settings.toDay);

            if (!_validateDate(settings.minDate, settings.maxDate, year, month, fromDate)) {
                logger.log('Oops! fromDate (' + fromDate.toStringFormat('MMM dd, yyyy') + ') is out of range');
                return;
            }

            if (!_validateDate(settings.minDate, settings.maxDate, year, month, toDate)) {
                logger.log('Oops! toDate (' + toDate.toStringFormat('MMM dd, yyyy') + ') is out of range');
                return;
            }

            settings.year = year;

            //#endregion VALIDATES INPUT VALUES

            return this.each(function () {
                var $this = $(this),
                    data = $this.data('monPickr');

                // Initialize the plugin if it hasn't
                if (!data) {
                    $this.data('monPickr', {
                        target: $this,

                        minDate: settings.minDate,
                        maxDate: settings.maxDate,
                        originalYear: settings.year,
                        originalMonth: settings.month.getMonth(),
                        year: settings.month.getFullYear(),
                        month: settings.month.getMonth(),

                        showDateRange: settings.showDateRange,
                        autoGenerateDateRange: settings.autoGenerateDateRange,
                        originalFromDay: settings.fromDay,
                        originalToDay: settings.toDay,
                        fromDay: settings.fromDay,
                        toDay: settings.toDay,
                        fromDate: fromDate,
                        toDate: toDate,
                        fromDayId: settings.fromDayId,
                        toDayId: settings.toDayId,
                        fromDayLabel: settings.fromDayLabel,
                        toDayLabel: settings.toDayLabel,

                        expandYearOnhover: settings.expandYearOnhover,
                        expandDayOnhover: settings.expandDayOnhover,
                        showYearSpeed: settings.showYearSpeed,
                        showDropDownSpeed: settings.showDropDownSpeed,

                        disabled: settings.disabled,
                        sortDesc: settings.sortDesc,
                        monthFormat: settings.monthFormat,
                        nextText: settings.nextText,
                        prevText: settings.prevText,
                        width: settings.width,
                        dropDownMaxHeight: settings.dropDownMaxHeight,
                        zIndex: settings.zIndex,

                        beforeChangeMonth: settings.beforeChangeMonth,
                        afterChangeMonth: settings.afterChangeMonth,
                        beforeChangeDay: settings.beforeChangeDay,
                        afterChangeDay: settings.afterChangeDay
                    });

                    data = $this.data('monPickr')
                }

                //#region INIT DOM ELEMENTS

                //#region Month Picker

                $this.addClass('monpickr monpickr-arrows ui-widget ui-widget-header ui-helper-clearfix ui-corner-all').width(data.width + 8);
                data.btnPrev = $('<a href="javascript:;" class="prev monpickr-prev ui-corner-all" title="' + data.prevText + '"><span class="ui-icon ui-icon-circle-triangle-w">Prev</span></a>');
                data.btnNext = $('<a href="javascript:;" class="next monpickr-next ui-corner-all" title="' + data.nextText + '"><span class="ui-icon ui-icon-circle-triangle-e">Next</span></a>');
                data.lblSelectedMonth = $('<input type="text" class="monpickr-selected-month monpickr-input ui-widget-content" readonly="readonly" />').width(data.width + 2).height(18);
                _setMonthLabel(data);
                $this.append(data.btnPrev, data.lblSelectedMonth, data.btnNext);

                $this.wrap('<div class="monpickr-wrap" style="z-index: ' + data.zIndex + '" />');
                data.wrap = $this.parents('.monpickr-wrap');
                data.wrap.wrap('<div class="monpickr-wrap-parent" style="position: relative" />')
                    .css({ 'position': 'absolute' }).parent().width(data.wrap.outerWidth()).height(data.wrap.outerHeight());

                data.dropDown = $('<div class="monpickr-dropdown ui-monpickr ui-widget ui-helper-clearfix ui-widget-content ui-corner-all" />')
                    .width(data.width).css({ maxHeight: data.dropDownMaxHeight });

                var currentYear = data.minDate.getFullYear(),
                    currentMonth = data.minDate.getMonth(),
                    minYear = data.minDate.getFullYear(),
                    minMonth = data.minDate.getMonth(),
                    maxYear = data.maxDate.getFullYear(),
                    maxMonth = data.maxDate.getMonth(),
                    dropDownInner, temp;

                dropDownInner = '<ul class="ui-widget-content">';

                if (data.sortDesc) {
                    currentYear = data.maxDate.getFullYear();
                    currentMonth = data.maxDate.getMonth();

                    while (currentYear > minYear || (currentYear == minYear && currentMonth >= minMonth)) {
                        temp = currentYear == data.year ? 'selected' : '';
                        temp += data.expandYearOnhover ? ' hover' : '';

                        dropDownInner +=
                        '<li class="year ui-corner-all ' + temp + '">' +
                            '<a year="' + currentYear + '" class="' + temp + '" href="javascript:;">' +
                                currentYear +
                            '</a>' +
                        '</li>';

                        if (currentYear == data.year) {
                            dropDownInner += '<li class="month-wrap ui-corner-all selected" year="' + currentYear + '" style="display: list-item"><ul>';
                        } else {
                            dropDownInner += '<li class="month-wrap ui-corner-all" year="' + currentYear + '"><ul>';
                        }

                        while ((currentYear > minYear || (currentYear == minYear && currentMonth >= minMonth)) && currentMonth >= 0) {
                            var isThisMonthSelected = currentYear == data.year && currentMonth == data.month,
                                liClass = isThisMonthSelected ? 'ui-state-active' : '',
                                aClass = currentYear == data.year && currentMonth == data.month ? 'class="selected"' : '';

                            dropDownInner +=
                            '<li class="ui-corner-all ' + liClass + '">' +
                                '<a month="' + (currentMonth + 1) + '" ' + aClass + ' href="javascript:;">' +
                                    new Date(currentYear, currentMonth).toStringFormat('MMMM') + '</a>' +
                            '</li>';

                            currentMonth--;
                        }

                        dropDownInner += '</ul></li>';

                        currentYear--;
                        currentMonth = 11;
                    }
                } else {
                    while (currentYear < maxYear || (currentYear == maxYear && currentMonth <= maxMonth)) {
                        temp = currentYear == data.year ? 'selected' : '';
                        temp += data.expandYearOnhover ? ' hover' : '';

                        dropDownInner +=
                        '<li class="year ui-corner-all ' + temp + '">' +
                            '<a year="' + currentYear + '" class="' + temp + '" href="javascript:;">' +
                                currentYear +
                            '</a>' +
                        '</li>';

                        if (currentYear == data.year) {
                            dropDownInner += '<li class="month-wrap ui-corner-all selected" year="' + currentYear + '" style="display: list-item"><ul>';
                        } else {
                            dropDownInner += '<li class="month-wrap ui-corner-all" year="' + currentYear + '"><ul>';
                        }

                        while ((currentYear < maxYear || (currentYear == maxYear && currentMonth <= maxMonth)) && currentMonth < 12) {
                            var isThisMonthSelected = currentYear == data.year && currentMonth == data.month,
                                liClass = isThisMonthSelected ? 'ui-state-active' : '',
                                aClass = currentYear == data.year && currentMonth == data.month ? 'class="selected"' : '';

                            dropDownInner +=
                            '<li class="ui-corner-all ' + liClass + '">' +
                                '<a month="' + (currentMonth + 1) + '" ' + aClass + ' href="javascript:;">' +
                                    new Date(currentYear, currentMonth).toStringFormat('MMMM') + '</a>' +
                            '<li>';

                            currentMonth++;
                        }

                        dropDownInner += '</ul></li>';

                        currentYear++;
                        currentMonth = 0;
                    }
                }

                dropDownInner += '</ul>';

                data.dropDown.append(dropDownInner);
                $this.after(data.dropDown);

                _checkReachBound(data, year, month);

                //#region Events

                // Toggle the dropdown when users click on selected month label
                data.wrap.on('click.monpickr', function (e) {
                    if ($(e.target).hasClass('monpickr-selected-month')) {
                        if (data.dropDown.is(':hidden')) {
                            _showDropDown(data, data);
                        } else {
                            _hideDropDown(data, data);
                        }
                    }
                    e.stopPropagation();
                });

                // Collapse all dropdowns when users click outside the picker
                $('html').on('click.monpickr', function () {
                    _hideDropDown(data, data);
                });

                // Toggle a dropdown when users click/hover on its "the year" link
                var expectedEvent = data.expandYearOnhover ? 'mouseenter' : 'click';
                data.dropDown.on(expectedEvent + '.monpickr', '.year a', function () {
                    var $this = $(this), year = $this.attr('year'),
                        thisIsNotSelected = $this.hasClass('selected') == false;

                    switch (expectedEvent) {
                        case 'mouseenter':
                            {
                                if (thisIsNotSelected) {
                                    _hideCurrentYear(data);
                                    _showSelectedYear(data, year); // expand this
                                }
                            } break;
                        case 'click':
                            {
                                _hideCurrentYear(data);

                                if (thisIsNotSelected) {
                                    // We have to expand "the year" which was clicked.
                                    // Else means this is the current year itself --> we don't need to expand it
                                    _showSelectedYear(data, year);
                                }

                                data.dropDown.find('.year a.selected:first').parent().addClass('selected');
                            } break;
                    }
                });

                // Change current month when users select a month
                data.dropDown.on('click.monpickr', '.month-wrap a[month]', function () {
                    var $this = $(this);
                    _selectMonth(data, $this.parents('.month-wrap').attr('year'), $this.attr('month') - 1);
                    _hideDropDown(data, data);
                });

                // hover styles for list elements
                data.dropDown.on('hover.monpickr', '.year', function () { $(this).toggleClass('ui-state-hover'); });
                data.dropDown.on('hover.monpickr', '.month-wrap li', function () { $(this).toggleClass('ui-state-hover'); });

                var disableInput = function (e) {
                    switch (e.keyCode) {
                        case 9: break; //tab
                        default: return false;
                    }
                };

                // disable any key stroke but tab
                data.lblSelectedMonth.on('keydown.monpickr', disableInput);

                // Move to next month when users click next button
                data.btnNext
                    .on('hover.monpickr', function () { $(this).toggleClass('ui-state-hover'); })
                    .on('click.monpickr', function () {
                        var nextMonth = data.month + 1,
                            year = data.year;

                        if (nextMonth > 11) {
                            nextMonth = 0;
                            year++;
                        }

                        if (_validateMonth(data.minDate, data.maxDate, year, nextMonth)) {
                            _selectMonth(data, year, nextMonth);
                        }
                    });

                // Move to previous month when users click prev button
                data.btnPrev
                    .on('hover.monpickr', function () { $(this).toggleClass('ui-state-hover'); })
                    .on('click.monpickr', function () {
                        var prevMonth = data.month - 1,
                            year = data.year;

                        if (prevMonth < 0) {
                            prevMonth = 11;
                            year--;
                        }

                        if (_validateMonth(data.minDate, data.maxDate, year, prevMonth)) {
                            _selectMonth(data, year, prevMonth);
                        }
                    });

                //#endregion Events

                //#endregion Month Picker

                //#region Day Picker

                if (data.showDateRange) { // Renders date range component (fromDate & toDate)
                    var renderDayPicker = function (data, dayPickr, dayPickrId, selectedDay) {
                        dayPickr = $('#' + dayPickrId);

                        if (dayPickr.length > 0) {
                            dayPickr.addClass('daypickr monpickr-arrows ui-widget ui-widget-header ui-helper-clearfix ui-corner-all')
                                .append('<input type="text" style="height: 18px;" class="daypickr-selected-day monpickr-input ui-widget-content" value="' + selectedDay + '" />')
                                .append('<a class="monpickr-down ui-corner-all" href="javascript:;"><span class="ui-icon ui-icon-circle-triangle-s"></span></a>')
                                .wrap('<div class="daypickr-wrap" style="z-index: ' + data.zIndex + '" />');

                            dayPickr.wrap = dayPickr.parents('.daypickr-wrap')
                                .wrap('<div class="daypickr-wrap-parent" style="position: relative" />')
                                .css({ 'position': 'absolute' });
                            dayPickr.wrap.parent().width(dayPickr.wrap.outerWidth()).height(dayPickr.wrap.outerHeight());
                            dayPickr.dropDown = $('<div style="overflow-x:hidden;" class="daypickr-dropdown ui-monpickr ui-widget ui-helper-clearfix ui-widget-content ui-corner-all" />');

                            var currentDay = 1,
                                minDay = _getMinDayInMonth(data.minDate, data.year, data.month),
                                maxDay = _getMaxDayInMonth(data.maxDate, data.year, data.month),
                                dayPickrDropDown;

                            dayPickrDropDown = '<ul class="ui-widget-content">';

                            while (currentDay <= 31) {
                                temp = currentDay < minDay || currentDay > maxDay ? 'style="display: none"' : '';
                                dayPickrDropDown += '<li class="ui-corner-all" ' + temp + '><a href="javascript:;">' + currentDay + '</a></li>';
                                currentDay++;
                            }

                            dayPickrDropDown += '</ul>';

                            dayPickr.dropDown.append(dayPickrDropDown);
                            dayPickr.after(dayPickr.dropDown);

                            return dayPickr;
                        } else {
                            logger.log('Oops! fromDayId (' + data.fromDayId + ') or toDayId (' + data.toDayId + ') does not exist');
                        }
                    };

                    if (data.autoGenerateDateRange) {
                        var token = (new Date()).getTime();

                        data.fromDayId = 'fromDay' + token;
                        data.toDayId = 'toDay' + token;

                        data.target.parents('.monpickr-wrap-parent').css({ float: 'left' }).wrap('<div class="monpickr-super-wrapper" />')
                            .after('<div id="' + data.toDayId + '" />')
                            .after('<div class="monpickr-label separator">' + data.toDayLabel + '</div>')
                            .after('<div id="' + data.fromDayId + '" />')
                            .after('<div class="monpickr-label">' + data.fromDayLabel + '</div>');
                    }

                    if (data.fromDayId && data.toDayId) {
                        data.ddlFromDate = renderDayPicker(data, data.ddlFromDate, data.fromDayId, data.fromDay);
                        data.ddlToDate = renderDayPicker(data, data.ddlToDate, data.toDayId, data.toDay);

                        if (data.autoGenerateDateRange) {
                            data.target.parents('.monpickr-super-wrapper:first').find('.daypickr-wrap-parent').css({ float: 'left' });
                        }

                        //#region Events

                        var dayExpectedEvent = data.expandDayOnhover ? 'hover' : 'click',
                        toggleDayPickr = function (e) {
                            if (data.isClosingDropDown) {
                                data.isClosingDropDown = false;
                                return;
                            }

                            var target = e.data.target;

                            if (target.dropDown.is(':hidden')) {
                                _showDropDown(data, target);
                            } else {
                                _hideDropDown(data, target);
                            }
                            e.stopPropagation();
                        };

                        // Toggle the day picker dropdown when users click/hover on selected day label
                        data.ddlFromDate.wrap.on(dayExpectedEvent, { target: data.ddlFromDate }, toggleDayPickr);
                        data.ddlToDate.wrap.on(dayExpectedEvent, { target: data.ddlToDate }, toggleDayPickr);

                        if (!data.expandDayOnhover) {
                            // Collapse all day picker dropdowns when users click outside the picker
                            $('html').on('click.monpickr', function () {
                                _hideDropDown(data, data.ddlFromDate);
                                _hideDropDown(data, data.ddlToDate);
                            });
                        }

                        var changeCurrentDay = function (e) {
                            var $this = $(this),
                            selectedDay = $this.find('a').html();

                            // prevent conflict when closing day dropdown
                            if (data.expandDayOnhover) data.isClosingDropDown = true;

                            $this.parents('.daypickr-dropdown').hide();
                            _selectDay(data, e.data.target, selectedDay, e.data.isFromDay);

                            e.stopPropagation();
                        };

                        // Change current fromDay/toDay when users select a day
                        data.ddlFromDate.dropDown
                        .on('hover.monpickr', 'li', function () { $(this).toggleClass('ui-state-hover'); })
                        .on('click.monpickr', 'li', { target: data.ddlFromDate, isFromDay: true }, changeCurrentDay);
                        data.ddlToDate.dropDown
                        .on('hover.monpickr', 'li', function () { $(this).toggleClass('ui-state-hover'); })
                        .on('click.monpickr', 'li', { target: data.ddlToDate, isFromDay: false }, changeCurrentDay);

                        // hover styles for list elements
                        data.ddlFromDate.on('hover.monpickr', '.monpickr-down', function () { $(this).toggleClass('ui-state-hover'); });
                        data.ddlToDate.on('hover.monpickr', '.monpickr-down', function () { $(this).toggleClass('ui-state-hover'); });

                        // disable any key stroke but tab
                        data.ddlFromDate.find('input').on('keydown.monpickr', disableInput);
                        data.ddlToDate.find('input').on('keydown.monpickr', disableInput);

                        //#endregion Events
                    }
                }

                //#endregion Day Picker

                //#endregion INIT DOM ELEMENTS
            });
        },

        // Returns the current month or null if the invoker's data does not exist
        // format may be '' which tell this to use default format
        getMonth: function (format) {
            var data = _getData(this);
            if (!data) return null;

            if (format != undefined) {
                format = format.length > 0 ? format : data.monthFormat;
                return new Date(data.year, data.month).toStringFormat(format);
            } else {
                return data.month + 1;
            }
        },

        // Sets the current month for the month picker.
        // value may be a Date object or a string but it must be a full date (include year, month & day)
        setMonth: function (value) {
            var data = _getData(this);
            if (!data) return;

            var year, month, _value = value;

            if ((typeof value).toLowerCase() != 'object') {
                _value = new Date(_value);
            }

            year = _value.getFullYear();
            month = _value.getMonth();

            if (isInteger(year) && isInteger(month)) {
                if (_validateMonth(data.minDate, data.maxDate, year, month)) {
                    _selectMonth(data, year, month);
                } else {
                    logger.log('Oops! Can\'t set month because input (' + value.toString() +
                        ') is out of range (' + data.minDate.toStringFormat('MMM - yyyy') + ' ~ ' + data.maxDate.toStringFormat('MMM - yyyy') + ')');
                }
            } else {
                logger.log('Oops! Can\'t set month because of invalid input (' + value.toString() + ')');
            }
        },

        // Returns the current fromDate or null if the invoker's data does not exist
        // format may be '' which tell this to use default format
        getFromDate: function (format) {
            var data = _getData(this);
            if (!data) return null;

            if (format != undefined) {
                format = format.length > 0 ? format : data.monthFormat;
                return data.fromDate.toStringFormat(format);
            }

            return data.fromDate;
        },

        // Returns the current toDate or null if the invoker's data does not exist
        // format may be '' which tell this to use default format
        getToDate: function (format) {
            var data = _getData(this);
            if (!data) return null;

            if (format != undefined) {
                format = format.length > 0 ? format : data.monthFormat;
                return data.toDate.toStringFormat(format);
            }

            return data.toDate;
        },

        // Sets the current fromDay
        setFromDay: function (value) {
            var data = _getData(this);
            if (!data) return;

            var selectedDate = new Date(data.year, data.month, value);

            if (isInteger(value) && _validateDate(data.minDate, data.maxDate, data.year, data.month, selectedDate)) {
                _selectDay(data, data.ddlFromDate, value, true);
            } else {
                logger.log('Oops! input value (' + value + ') is invalid');
            }
        },

        // Sets the current toDay
        setToDay: function (value) {
            var data = _getData(this);
            if (!data) return;

            var selectedDate = new Date(data.year, data.month, value);

            if (isInteger(value) && _validateDate(data.minDate, data.maxDate, data.year, data.month, selectedDate)) {
                _selectDay(data, data.ddlToDate, value, false);
            } else {
                logger.log('Oops! input value (' + value + ') is invalid');
            }
        },

        // Resets picker to its original initial state
        reset: function () {
            var data = _getData(this);
            if (!data) return;

            _selectMonth(data, data.originalYear, data.originalMonth);
        }
    };

    /*
    * Public methods
    */

    $.fn.monPickr = function (method) {
        if (_methods[method]) { // call a method but init
            return _methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        } else if (typeof method === 'object' || !method) { // call init method
            return _methods.init.apply(this, arguments);
        } else { //
            logger.log('Oops! Method "' + method + '" does not exist on jQuery.monPickr');
        }
    };
})(jQuery);