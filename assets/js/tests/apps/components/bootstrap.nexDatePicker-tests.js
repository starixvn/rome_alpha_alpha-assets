/// <reference path="../../../components/bootstrap.nexDatePicker/bootstrap.nexDatePicker.js" />

describe("NexDatePickerHelper_", function () {
    describe("getShortDateString", function () {
        it("Day Less Than 10 -> Returns Correct String", function () {
            // arrange
            var currentDate = new Date(2017, 0, 1);
            var expectedShortDateString = "01/01/2017";

            // act
            var actualShortDateString = NexDatePickerHelper.getShortDateString(currentDate);

            // assert
            expect(actualShortDateString).toBe(expectedShortDateString);
        });
        it("Day From 10 -> Returns Correct String", function () {
            // arrange
            var currentDate = new Date(2017, 0, 10);
            var expectedShortDateString = "01/10/2017";

            // act
            var actualShortDateString = NexDatePickerHelper.getShortDateString(currentDate);

            // assert
            expect(actualShortDateString).toBe(expectedShortDateString);
        });
        it("Month Less Than 10 -> Returns Correct String", function () {
            // arrange
            var currentDate = new Date(2017, 0, 11);
            var expectedShortDateString = "01/11/2017";

            // act
            var actualShortDateString = NexDatePickerHelper.getShortDateString(currentDate);

            // assert
            expect(actualShortDateString).toBe(expectedShortDateString);
        });
        it("Month From Oct -> Returns Correct String", function () {
            // arrange
            var currentDate = new Date(2017, 9, 1);
            var expectedShortDateString = "10/01/2017";

            // act
            var actualShortDateString = NexDatePickerHelper.getShortDateString(currentDate);

            // assert
            expect(actualShortDateString).toBe(expectedShortDateString);
        });
    });
    describe("getDateStr", function () {
        it("Date is Falsy value -> Returns Empty", function () {
            // arrange
            var expectedDateString = "";

            // act
            var actualDateString = NexDatePickerHelper.getDateStr();

            // assert
            expect(actualDateString).toBe(expectedDateString);
        });
        it("Date Less Than 10 -> Returns Padding 0", function () {
            // arrange
            var date = 1;
            var expectedDateString = "01";

            // act
            var actualDateString = NexDatePickerHelper.getDateStr(date);

            // assert
            expect(actualDateString).toBe(expectedDateString);
        });
        it("Date From 10 -> Returns Date", function () {
            // arrange
            var date = 10;
            var expectedDateString = "10";

            // act
            var actualDateString = NexDatePickerHelper.getDateStr(date);

            // assert
            expect(actualDateString).toBe(expectedDateString);
        });
    });
    describe("getDateRangeOfCurrentWeek", function () {
        function testGetDateRangeOfCurrentWeek(today, expectedFromDate) {
            // arrange
            var expectedDateRangeOfCurrentWeek = [expectedFromDate, today];

            // act
            var actualDateRangeOfCurrentWeek = NexDatePickerHelper.getDateRangeOfCurrentWeek(today);

            // assert
            expect(actualDateRangeOfCurrentWeek[0]).toEqual(expectedDateRangeOfCurrentWeek[0]);
            expect(actualDateRangeOfCurrentWeek[1]).toEqual(expectedDateRangeOfCurrentWeek[1]);
        }

        it("Sunday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 8), new Date(2017, 0, 2));
        });
        it("Monday -> Returns [This Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 9), new Date(2017, 0, 9));
        });
        it("Tuesday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 10), new Date(2017, 0, 9));
        });
        it("Wednesday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 11), new Date(2017, 0, 9));
        });
        it("Thursday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 12), new Date(2017, 0, 9));
        });
        it("Friday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 13), new Date(2017, 0, 9));
        });
        it("Saturday -> Returns [Last Monday -> Current Date]", function () {
            testGetDateRangeOfCurrentWeek(new Date(2017, 0, 14), new Date(2017, 0, 9));
        });
    });
    describe("getDateRangeOfLastWeek", function () {
        function testGetDateRangeOfLastWeek(today, expectedDateRangeOfLastWeek) {
            // act
            var actualDateRangeOfLastWeek = NexDatePickerHelper.getDateRangeOfLastWeek(today);

            // assert
            expect(actualDateRangeOfLastWeek[0]).toEqual(expectedDateRangeOfLastWeek[0]);
            expect(actualDateRangeOfLastWeek[1]).toEqual(expectedDateRangeOfLastWeek[1]);
        }

        it("Sunday -> Returns [Monday of two weeks ago -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 8), [new Date(2016, 11, 26), new Date(2017, 0, 1)]);
        });
        it("Monday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 9), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
        it("Tuesday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 10), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
        it("Wednesday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 11), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
        it("Thursday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 12), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
        it("Friday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 13), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
        it("Saturday -> Returns [Last Monday -> Last Sunday]", function () {
            testGetDateRangeOfLastWeek(new Date(2017, 0, 14), [new Date(2017, 0, 2), new Date(2017, 0, 8)]);
        });
    });
    describe("getDateRangeOfCurrentMonth", function () {
        function testGetDateRangeOfCurrentMonth(today, expectedDateRangeOfCurrentMonth) {
            // act
            var actualDateRangeOfCurrentMonth = NexDatePickerHelper.getDateRangeOfCurrentMonth(today);

            // assert
            expect(actualDateRangeOfCurrentMonth[0]).toEqual(expectedDateRangeOfCurrentMonth[0]);
            expect(actualDateRangeOfCurrentMonth[1]).toEqual(expectedDateRangeOfCurrentMonth[1]);
        }

        it("Start Month -> Returns [Start Month -> Today]", function () {
            testGetDateRangeOfCurrentMonth(new Date(2017, 0, 1), [new Date(2017, 0, 1), new Date(2017, 0, 1)]);
        });
        it("End Month -> Returns [Start Month -> End Month]", function () {
            testGetDateRangeOfCurrentMonth(new Date(2017, 0, 31), [new Date(2017, 0, 1), new Date(2017, 0, 31)]);
        });
        it("Not Start/End Month -> Returns [Start Month -> Today]", function () {
            testGetDateRangeOfCurrentMonth(new Date(2017, 0, 12), [new Date(2017, 0, 1), new Date(2017, 0, 12)]);
        });
    });
    describe("getDateRangeOfLastMonth", function () {
        function testGetDateRangeOfLastMonth(today, expectedDateRangeOfLastMonth) {
            // act
            var actualDateRangeOfLastMonth = NexDatePickerHelper.getDateRangeOfLastMonth(today);

            // assert
            expect(actualDateRangeOfLastMonth[0]).toEqual(expectedDateRangeOfLastMonth[0]);
            expect(actualDateRangeOfLastMonth[1]).toEqual(expectedDateRangeOfLastMonth[1]);
        }

        it("Januray -> Returns [Dec of Last Year]", function () {
            testGetDateRangeOfLastMonth(new Date(2017, 0, 1), [new Date(2016, 11, 1), new Date(2016, 11, 31)]);
        });
        it("Feb to Dec -> Returns [Last Month]", function () {
            testGetDateRangeOfLastMonth(new Date(2017, 1, 1), [new Date(2017, 0, 1), new Date(2017, 0, 31)]);
            testGetDateRangeOfLastMonth(new Date(2017, 2, 1), [new Date(2017, 1, 1), new Date(2017, 1, 28)]);
            testGetDateRangeOfLastMonth(new Date(2017, 10, 1), [new Date(2017, 9, 1), new Date(2017, 9, 31)]);
            testGetDateRangeOfLastMonth(new Date(2017, 11, 1), [new Date(2017, 10, 1), new Date(2017, 10, 30)]);
        });
    });
    describe("getTotalDayOfMonth", function () {
        function testGetTotalDayOfMonth(month, year, expectedTotalDayOfMonth) {
            // act
            var actualTotalDayOfMonth = NexDatePickerHelper.getTotalDayOfMonth(month, year);

            // assert
            expect(actualTotalDayOfMonth).toBe(expectedTotalDayOfMonth);
        }

        it("Not Feb -> Returns correct Total Day Of Month (30/31)", function () {
            testGetTotalDayOfMonth(1, 2017, 31);
            testGetTotalDayOfMonth(3, 2017, 31);
            testGetTotalDayOfMonth(5, 2017, 31);
            testGetTotalDayOfMonth(7, 2017, 31);
            testGetTotalDayOfMonth(8, 2017, 31);
            testGetTotalDayOfMonth(10, 2017, 31);
            testGetTotalDayOfMonth(12, 2017, 31);

            testGetTotalDayOfMonth(4, 2017, 30);
            testGetTotalDayOfMonth(6, 2017, 30);
            testGetTotalDayOfMonth(9, 2017, 30);
            testGetTotalDayOfMonth(11, 2017, 30);
        });
        it("Feb of Non-Leap Year -> Returns 28", function () {
            testGetTotalDayOfMonth(2, 2017, 28);
            testGetTotalDayOfMonth(2, 2100, 28);
        });
        it("Feb of Leap Year -> Returns 29", function () {
            testGetTotalDayOfMonth(2, 2016, 29);
            testGetTotalDayOfMonth(2, 2400, 29);
        });
    });

    describe("correctDateInRange", function () {
        it("Not set min Date/Not set Max Date -> Returns input date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = undefined;
            var maxDate = undefined;

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(inputDate);
        });

        it("Not set min Date/Input Date less than Max Date -> Returns input date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = undefined;
            var maxDate = new Date(2017, 0, 14);

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(inputDate);
        });
        it("Not set min Date/Input Date greater than Max Date -> Returns max date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = undefined;
            var maxDate = new Date(2017, 0, 12);

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(maxDate);
        });

        it("Not set max Date/Input Date less than Min Date -> Returns min date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = new Date(2017, 0, 14);
            var maxDate = undefined;

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(minDate);
        });
        it("Not set max Date/Input Date greater than Min Date -> Returns input date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = new Date(2017, 0, 12);
            var maxDate = undefined;

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(inputDate);
        });

        it("Set min/max Date; input Date less than min date -> Returns min date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = new Date(2017, 0, 14);
            var maxDate = new Date(2017, 0, 14);

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(minDate);
        });
        it("Set min/max Date; min date <= input date <= max date -> Returns input date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 13);
            var minDate = new Date(2017, 0, 12);
            var maxDate = new Date(2017, 0, 14);

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(inputDate);
        });
        it("Set min/max Date; max date < input date -> Returns max date", function () {
            // arrange
            var inputDate = new Date(2017, 0, 15);
            var minDate = new Date(2017, 0, 12);
            var maxDate = new Date(2017, 0, 14);

            // act
            var actualDate = NexDatePickerHelper.correctDateInRange(inputDate, minDate, maxDate);

            // assert
            expect(actualDate).toEqual(maxDate);
        });
    });

    describe("isLeapYear", function () {
        it("year%400=0 -> Returns true", function () {
            // arrange
            var year = 2000;

            // act
            var isLeapYear = NexDatePickerHelper.isLeapYear(year);

            // assert
            expect(isLeapYear).toBeTruthy();
        });
        it("year%400!=0 && year%100==0 -> Returns false", function () {
            // arrange
            var year = 2100;

            // act
            var isLeapYear = NexDatePickerHelper.isLeapYear(year);

            // assert
            expect(isLeapYear).toBeFalsy();
        });
        it("year%100!=0 && year%4==0 -> Returns true", function () {
            // arrange
            var year = 2016;

            // act
            var isLeapYear = NexDatePickerHelper.isLeapYear(year);

            // assert
            expect(isLeapYear).toBeTruthy();
        });
        it("year%4!=0 -> Returns false", function () {
            // arrange
            var year = 2017;

            // act
            var isLeapYear = NexDatePickerHelper.isLeapYear(year);

            // assert
            expect(isLeapYear).toBeFalsy();
        });
    });

    describe("isAfterFromDateOfDateRange", function () {
        it("date is after today, range option is today => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 14);
            var optionValue = NexDatePickerHelper.rangeOption.today;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is today, range option is today => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 13);
            var optionValue = NexDatePickerHelper.rangeOption.today;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is before today, range option is today => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 11);
            var optionValue = NexDatePickerHelper.rangeOption.yesterday;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is before yesterday, range option is yesterday => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 5);
            var optionValue = NexDatePickerHelper.rangeOption.yesterday;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is yesterday, range option is yesterday => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 12);
            var optionValue = NexDatePickerHelper.rangeOption.yesterday;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after yesterday, range option is yesterday => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 13);
            var date = new Date(2017, 1, 13);
            var optionValue = NexDatePickerHelper.rangeOption.yesterday;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before this week, range option is this week => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 12);
            var optionValue = NexDatePickerHelper.rangeOption.thisWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is this week, range option is this week => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 13);
            var optionValue = NexDatePickerHelper.rangeOption.thisWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after this week, range option is this week => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 14);
            var optionValue = NexDatePickerHelper.rangeOption.thisWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before last week, range option is last week => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 1);
            var optionValue = NexDatePickerHelper.rangeOption.lastWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is last week, range option is last week => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 6);
            var optionValue = NexDatePickerHelper.rangeOption.lastWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after last week, range option is last week => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 14);
            var optionValue = NexDatePickerHelper.rangeOption.lastWeek;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before this month, range option is this month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 0, 1);
            var optionValue = NexDatePickerHelper.rangeOption.thisMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is start of this month, range option is this month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 1);
            var optionValue = NexDatePickerHelper.rangeOption.thisMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after this month, range option is this month => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 15);
            var optionValue = NexDatePickerHelper.rangeOption.thisMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before last month, range option is last month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2016, 11, 1);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is start of last month, range option is last month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 0, 1);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after last month, range option is last month => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 2);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before since last month, range option is since last month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2016, 11, 1);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is start of since last month, range option is since last month => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 0, 1);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });

        it("date is after since last month, range option is since last month => return true", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 2);
            var optionValue = NexDatePickerHelper.rangeOption.lastMonth;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeTruthy();
        });

        it("date is before today, range option is specific date => return false", function () {
            // arrange
            var currentDate = new Date(2017, 1, 15);
            var date = new Date(2017, 1, 10);
            var optionValue = NexDatePickerHelper.rangeOption.specificDate;

            // act
            var isAfter = NexDatePickerHelper.isAfterFromDateOfDateRange(date, currentDate, optionValue);

            // assert
            expect(isAfter).toBeFalsy();
        });
    });
});