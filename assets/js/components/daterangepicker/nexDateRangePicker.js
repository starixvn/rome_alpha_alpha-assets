(function ($) {
    $.fn.nexDateRangePicker = function (options) {
        var defaults = {
            // builtin options:
            autoApply: true,
            linkedCalendars: false,
            locale: {
                format: 'MM/DD/YYYY',
                applyLabel: this.data('applylabel'),
                cancelLabel: this.data('cancellabel')
            },
            maxDate: this.data('maxdate'),
            minDate: this.data('mindate'),
            startDate: this.data('startdate'),
            endDate: this.data('enddate'),
            buttonClasses: '',
            applyButtonClasses: 'btn-submit',
            cancelButtonClasses: 'btn-default',
            // custom options:
            currentDate: this.val(),
            onChange: function () { },
            onQuickChooseChange: function () { },
            fromDateElId: 'from-date',
            toDateElId: 'to-date',
            prefinedRangeElId: 'dropdown-daterange',
            userRangeLabelElId: 'range-label',
            userRangeOptionHiddenElId: 'hidden-range-option'
        };

        this.extend(defaults, options);

        return this.each(function () {
            return new NexDateRangePicker(this, defaults);
        });
    };

    var NexDateRangePicker = function (selectorEl, options) {
        this.$dateRangePickerEl = $(selectorEl);

        this.$fromDateEl = $(transformId(options.fromDateElId));
        this.$toDateEl = $(transformId(options.toDateElId));
        this.$prefinedRangeEl = $(transformId(options.prefinedRangeElId));
        this.$userRangeLabelEl = this.$prefinedRangeEl.find(transformId(options.userRangeLabelElId));
        this.$userRangeOptionHiddenEl = this.$prefinedRangeEl.find(transformId(options.userRangeOptionHiddenElId));

        this.options = options;

        this.init();

        return this.$dateRangePickerEl;
    };

    NexDateRangePicker.prototype = {
        init: function () {
            this.render();
            this.registerEvents();
        },

        render: function () {
            var self = this;

            self.$dateRangePickerEl.daterangepicker(self.options, function (start, end, label) {
                var specificDateOption = self.$prefinedRangeEl.find("a.range-option[data-value='7']");
                self.$userRangeLabelEl.html(specificDateOption.html());
                self.$userRangeOptionHiddenEl.val(specificDateOption.attr("data-value"));

                var format = self.options.locale.format;
                self.$fromDateEl.val(start.format(format));
                self.$toDateEl.val(end.format(format));

                self.options.onChange(start, end, label);
            });
        },

        registerEvents: function () {
            var self = this;

            self.$prefinedRangeEl.find(".dropdown-menu").on("click", "a.range-option", function (event) {
                event.preventDefault();

                var $this = $(this);
                var selectedValue = parseInt($this.attr("data-value"));
                var currentDate = new Date(self.options.currentDate);

                var today = moment(currentDate);
                var yesterday = moment(currentDate).subtract(1, 'days');
                var thisWeekStartDate = moment(currentDate).startOf('isoWeek');
                var lastWeekStartDate = moment(currentDate).subtract(1, 'weeks').startOf('isoWeek');
                var lastWeekEndDate = moment(currentDate).subtract(1, 'weeks').endOf('isoWeek');
                var thisMonthStartDate = moment(currentDate).startOf('month');
                var lastMonthStartDate = moment(currentDate).subtract(1, 'month').startOf('month');
                var lastMonthEndDate = moment(currentDate).subtract(1, 'month').endOf('month');

                switch (selectedValue) {
                    case NexDatePickerHelper.rangeOption.today:
                        self.updateDateRange(today, today);
                        break;
                    case NexDatePickerHelper.rangeOption.yesterday:
                        self.updateDateRange(yesterday, yesterday);
                        break;
                    case NexDatePickerHelper.rangeOption.thisWeek:
                        self.updateDateRange(thisWeekStartDate, today);
                        break;
                    case NexDatePickerHelper.rangeOption.lastWeek:
                        self.updateDateRange(lastWeekStartDate, lastWeekEndDate);
                        break;
                    case NexDatePickerHelper.rangeOption.thisMonth:
                        self.updateDateRange(thisMonthStartDate, today);
                        break;
                    case NexDatePickerHelper.rangeOption.lastMonth:
                        self.updateDateRange(lastMonthStartDate, lastMonthEndDate);
                        break;
                    case NexDatePickerHelper.rangeOption.sinceLastMonth:
                        self.updateDateRange(lastMonthStartDate, today);
                        break;
                    case NexDatePickerHelper.rangeOption.specificDate:
                        break;
                    case NexDatePickerHelper.rangeOption.olderThan3Months:
                        self.updateDateRange(thisMonthStartDate, today);
                        break;
                    default:
                        break;
                }

                self.$userRangeOptionHiddenEl.val(selectedValue);
                self.$userRangeLabelEl.html($this.html());

                self.options.onQuickChooseChange(selectedValue);
            });
        },

        updateDateRange: function (startDateMmt, endDateMmt) {
            var format = this.options.locale.format;

            if (startDateMmt && startDateMmt.isValid()) {
                var startDate = startDateMmt.format(format);
                this.$fromDateEl.val(startDate);
                this.$dateRangePickerEl.data('daterangepicker').setStartDate(startDate);
            }

            if (endDateMmt && endDateMmt.isValid()) {
                var endDate = endDateMmt.format(format);
                this.$toDateEl.val(endDate);
                this.$dateRangePickerEl.data('daterangepicker').setEndDate(endDate);
            }
        }
    };

    var transformId = function (id) {
        return '#' + id;
    };
}(jQuery));