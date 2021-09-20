(function ($) {
    $.fn.tinyDraggable = function (options) {
        var settings = $.extend({ handle: 0, exclude: 'button.icon.icon-close.close' }, options);
        var maxMobileLeft = 1000;
        var canMove = true;

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

                $.each($("iframe"), function (index, iframeObject) {
                    try {
                        var iframeContent = iframeObject.contentWindow || iframeObject.contentDocument;
                        $(iframeContent.document).off('mousemove.drag touchmove.drag');
                    } catch (e) {
                    }
                });

                if (!$mask.is(":visible")) {
                    return;
                }

                $('body').off('mousemove.drag touchmove.drag');

                var markOffset = $mask.offset();

                if (canMove) {
                    $('#' + $mask.data('current-popup')).offset(markOffset);
                }

                $mask.hide();
            };
            var getResizableCursor = function (el) {
                if (el.hasClass("resizable-r")) {
                    return "e-resize";
                }

                if (el.hasClass("resizable-b")) {
                    return "s-resize";
                }

                return "none";
            };

            handle.on({
                mousedown: function (e) {
                    canMove = !settings.resizeElement || !~$.inArray(e.target, $(settings.resizeElement, el));
                    if (canMove) {
                        $mask.css("cursor", "move");
                    } else {
                        $mask.css("cursor", getResizableCursor($(e.target)));
                    }

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

                    $.each($("iframe"), function (index, iframeObject) {
                        try {
                            var iframeContent = iframeObject.contentWindow || iframeObject.contentDocument;
                            var currentIframe = $(iframeObject);
                            $(iframeContent.document)
                                .off('mousemove.drag')
                                .on('mousemove.drag', function (e) {
                                    var iframeOffset = currentIframe.offset();
                                    $mask.offset({ top: e.pageY - dy - currentIframe.contents().scrollTop() + iframeOffset.top, left: e.pageX - dx + iframeOffset.left });
                                });
                        } catch (e) {
                        }
                    });
                },
                mouseup: movePopup,
                touchstart: function (e) {
                    canMove = !settings.resizeElement || !~$.inArray(e.target, $(settings.resizeElement, el));
                    if (canMove) {
                        $mask.css("cursor", "move");
                    } else {
                        $mask.css("cursor", getResizableCursor($(e.target)));
                    }

                    if (settings.exclude && ~$.inArray(e.target, $(settings.exclude, el))) {
                        return;
                    }

                    if (e.which === 3) { //// If mouse right
                        return;
                    }

                    e.preventDefault();

                    var os = el.offset();
                    dx = e.originalEvent.touches[0].pageX - os.left;
                    dy = e.originalEvent.touches[0].pageY - os.top;
                    var currentWidth = el.width();
                    var currentHeight = el.height();

                    $mask.css({
                        width: currentWidth + "px",
                        height: currentHeight + "px",
                        display: "block"
                    })
                        .data('current-popup', handle.attr('id'))
                        .offset(
                        {
                            top: e.originalEvent.touches[0].pageY - dy,
                            left: e.originalEvent.touches[0].pageX - dx
                        });

                    $('body').off('touchmove.drag')
                        .on('touchmove.drag', function (e) {
                            var newLeft = e.originalEvent.touches[0].pageX - dx;

                            if (newLeft > maxMobileLeft) {
                                return;
                            }

                            $mask.offset(
                                {
                                    top: e.originalEvent.touches[0].pageY - dy,
                                    left: newLeft
                                });
                        });

                    $.each($("iframe"), function (index, iframeObject) {
                        try {
                            var iframeContent = iframeObject.contentWindow || iframeObject.contentDocument;
                            var currentIframe = $(iframeObject);
                            $(iframeContent.document).off('touchmove.drag')
                                .on('touchmove.drag', function (e) {
                                    var iframeOffset = currentIframe.offset();
                                    var newLeft = e.originalEvent.touches[0].pageX - dx + iframeOffset.left;

                                    if (newLeft > maxMobileLeft) {
                                        return;
                                    }

                                    $mask.offset(
                                        {
                                            top: e.originalEvent.touches[0].pageY - dy - currentIframe.contents().scrollTop() + iframeOffset.top,
                                            left: e.originalEvent.touches[0].pageX - dx + iframeOffset.left
                                        });
                                });
                        } catch (e) {
                        }
                    });
                },
                touchend: movePopup
            });

            $mask.off('mouseup.drag touchend.drag').on('mouseup.drag touchend.drag', movePopup);
        });
    }
}(jQuery));