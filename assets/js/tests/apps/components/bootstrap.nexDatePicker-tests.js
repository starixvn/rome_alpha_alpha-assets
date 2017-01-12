describe("NexDatePickerHelper_", function () {
    describe("getDateRangeOfCurrentWeek", function () {
        it("Sunday -> Returns Start Date from Last Monday", function () {
            // arrange
            var currentDate = new Date(2017, 11, 1);
            var expectedShortDateString = "12/01/2017";

            // act
            var actualShortDateString = NexDatePickerHelper.getShortDateString(currentDate);

            // assert
            expect(actualShortDateString).toBe(expectedShortDateString);
        });
    });
});
