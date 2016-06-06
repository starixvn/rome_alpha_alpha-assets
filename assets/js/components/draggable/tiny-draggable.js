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
                var markOffset = $mask.offset();
                $('#' + $mask.data('current-popup')).offset(markOffset);

                $mask.hide();
                if ($('iframe#main').length > 0) {
                    $('iframe#main').contents().off('mousemove.drag');
                }

                if ($('popup-iframe').length > 0) {
                    $('popup-iframe').contents().off('mousemove.drag');
                }

                $('body').off('mousemove.drag');
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
                        width: currentWidth + "px",
                        height: currentHeight + "px",
                        display: "block"
                    })
                        .data('current-popup', handle.attr('id'))
                        .offset({ top: e.pageY - dy, left: e.pageX - dx });

                    $('body').off('mousemove.drag').on('mousemove.drag', function (e) {
                        $mask.offset({ top: e.pageY - dy, left: e.pageX - dx });
                    });

                    if ($('iframe#main').length > 0) {
                        $('iframe#main').contents().off('mousemove.drag').on('mousemove.drag', function (e) {
                            var $this = $('iframe#main');
                            var iframeOffset = $('iframe#main').offset();
                            $mask.offset({ top: e.pageY - dy - $('iframe#main').contents().scrollTop() + iframeOffset.top, left: e.pageX - dx + iframeOffset.left });
                            //window.console.log($mask.offset());
                        });
                    }

                    if ($('#popup-iframe').length > 0) {
                        $('#popup-iframe').contents().off('mousemove.drag').on('mousemove.drag', function (e) {
                            var $this = $('#popup-iframe');
                            var iframeOffset = $this.offset();
                            $mask.offset({ top: e.pageY - dy - $this.contents().scrollTop() + iframeOffset.top, left: e.pageX - dx + iframeOffset.left });
                            //window.console.log($mask.offset());
                        });
                    }
                },
                mouseup: movePopup
            });

            $mask.off('mouseup.drag').on('mouseup.drag', movePopup);
        });
    }
}(jQuery));