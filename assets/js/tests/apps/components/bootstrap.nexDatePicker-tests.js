describe("NexDatePickerHelper_", function () {
    function compareDate(actualDate, expectedDate) {
        expect(NexDatePickerHelper.getShortDateString(actualDate)).toBe(NexDatePickerHelper.getShortDateString(expectedDate));
    }

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
            compareDate(actualDateRangeOfCurrentWeek[0], expectedDateRangeOfCurrentWeek[0]);
            compareDate(actualDateRangeOfCurrentWeek[1], expectedDateRangeOfCurrentWeek[1]);
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
            compareDate(actualDateRangeOfLastWeek[0], expectedDateRangeOfLastWeek[0]);
            compareDate(actualDateRangeOfLastWeek[1], expectedDateRangeOfLastWeek[1]);
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
            compareDate(actualDateRangeOfCurrentMonth[0], expectedDateRangeOfCurrentMonth[0]);
            compareDate(actualDateRangeOfCurrentMonth[1], expectedDateRangeOfCurrentMonth[1]);
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
});
