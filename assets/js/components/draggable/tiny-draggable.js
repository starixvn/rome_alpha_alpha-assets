(function ($) {
    $.fn.tinyDraggable = function (options) {
        var settings = $.extend({ handle: 0, exclude: 'button.icon.icon-close.close' }, options);

        return this.each(function () {
            var dx, dy, el = $(this), handle = settings.handle ? $(settings.handle, el) : el,
                $body = $('body'),
                $mask = $('#modal-draggable-mask');

            if ($mask.length === 0) {
                $mask = $('<div id="modal-draggable-mask" style="display:none;"></div>');
                $body.append($mask);
            }

            var movePopup = function (keyEvent) {
                if (keyEvent.which === 3) { //// If mouse right
                    return;
                }

                var currentPopupId = $mask.data('current-popup');
                $body.off('mousemove.drag#' + el.attr('id'));
                $('#' + currentPopupId).offset($mask.offset());
                $mask.hide();
            };

            handle.on({
                mousedown: function (e) {
                    if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) {
                        return;
                    }

                    if (e.which === 3) { //// If mouse right
                        return;
                    }
                    e.preventDefault();
                    var os = el.offset(); dx = e.pageX - os.left, dy = e.pageY - os.top;
                    var currentWidth = el.width();
                    var currentHeight = el.height();

                    $mask.css({
                        width: currentWidth - 55 + "px",
                        height: currentHeight + "px",
                        display: "block"
                    })
                        .data('current-popup', el.attr('id'))
                        .offset({ top: e.pageY - dy, left: e.pageX - dx });

                    $body.on('mousemove.drag#' + el.attr('id'), function (e) {
                        $mask.offset({ top: e.pageY - dy, left: e.pageX - dx });
                    });
                },
                mouseup: movePopup
            });

            $mask.off('mouseup.drag').on('mouseup.drag', movePopup);
        });
    }
}(jQuery));