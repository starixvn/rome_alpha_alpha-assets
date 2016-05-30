(function ($) {
    $.fn.tinyDraggable = function (options) {
        var settings = $.extend({ handle: 0, exclude: 0 }, options);
        return this.each(function () {
            var dx, dy, el = $(this), handle = settings.handle ? $(settings.handle, el) : el;
            var $body = $('body');
            var $mask = $('#modal-draggable-mask');
            if ($mask.length === 0) {
                $mask = $('<div id="modal-draggable-mask" style="display:none;"></div>');
                $body.append($mask);
            }
            handle.on({
                mousedown: function (e) {
                    if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) return;
                    e.preventDefault();
                    var os = el.offset(); dx = e.pageX - os.left, dy = e.pageY - os.top;
                    var currentWidth = el.width();
                    var currentHeight = el.height();
                    $mask.css({
                        width: currentWidth + "px",
                        height: currentHeight + "px",
                        display: "block"
                    });
                    $mask.data('current-popup', el.attr('id'));
                    $body.on('mousemove.drag#' + el.attr('id'), function (e) {
                        $mask.offset({ top: e.pageY - dy, left: e.pageX - dx });
                    });
                },
                mouseup: function (e) {
                    var currentPopupId = $mask.data('current-popup');
                    $body.off('mousemove.drag#' + el.attr('id'));
                    $('#' + currentPopupId).offset($mask.offset());
                    $mask.hide();
                }
            });

            $mask.off('mouseup.drag').on('mouseup.drag', function () {
                var currentPopupId = $mask.data('current-popup');
                $body.off('mousemove.drag#' + el.attr('id'));
                $('#' + currentPopupId).offset($mask.offset());
                $mask.hide();
            });
        });
    }
}(jQuery));