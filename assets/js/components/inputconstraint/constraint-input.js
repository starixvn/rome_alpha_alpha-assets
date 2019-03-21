/*only input number */
function ConstraintInput() {
    this.bind = function (selector) {
        $(selector).keypress(function (e) {
            var _this = $(this);
            _this.val(_this.val().replace(/[^\d].+/, ""));
            if ((e.which < 48 || e.which > 57)) {
                e.preventDefault();
            }
        });
    };
}