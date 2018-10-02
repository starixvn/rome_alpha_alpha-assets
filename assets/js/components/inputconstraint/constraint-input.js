function ConstraintInput() {
    this.bind = function (selector, maxlength) {
        $(selector).keypress(function (e) {
            var _this = $(this);
            if ((_this.val().length >= maxlength) &&
                ((e.charCode >= 48 && e.charCode <= 57) || e.charCode == 69 || e.charCode == 101 || e.charCode == 46 || e.charCode == 43 || e.charCode == 45)) {
                return false;
            }
        });
    };
}