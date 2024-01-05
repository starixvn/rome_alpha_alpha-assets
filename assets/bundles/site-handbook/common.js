/*!
 * jQuery Cookie Plugin v1.4.1
 * https://github.com/carhartl/jquery-cookie
 *
 * Copyright 2006, 2014 Klaus Hartl
 * Released under the MIT license
 */
(function (factory) {
	if (typeof define === 'function' && define.amd) {
		// AMD (Register as an anonymous module)
		define(['jquery'], factory);
	} else if (typeof exports === 'object') {
		// Node/CommonJS
		module.exports = factory(require('jquery'));
	} else {
		// Browser globals
		factory(jQuery);
	}
}(function ($) {

	var pluses = /\+/g;

	function encode(s) {
		return config.raw ? s : encodeURIComponent(s);
	}

	function decode(s) {
		return config.raw ? s : decodeURIComponent(s);
	}

	function stringifyCookieValue(value) {
		return encode(config.json ? JSON.stringify(value) : String(value));
	}

	function parseCookieValue(s) {
		if (s.indexOf('"') === 0) {
			// This is a quoted cookie as according to RFC2068, unescape...
			s = s.slice(1, -1).replace(/\\"/g, '"').replace(/\\\\/g, '\\');
		}

		try {
			// Replace server-side written pluses with spaces.
			// If we can't decode the cookie, ignore it, it's unusable.
			// If we can't parse the cookie, ignore it, it's unusable.
			s = decodeURIComponent(s.replace(pluses, ' '));
			return config.json ? JSON.parse(s) : s;
		} catch(e) {}
	}

	function read(s, converter) {
		var value = config.raw ? s : parseCookieValue(s);
		return $.isFunction(converter) ? converter(value) : value;
	}

	var config = $.cookie = function (key, value, options) {

		// Write

		if (arguments.length > 1 && !$.isFunction(value)) {
			options = $.extend({}, config.defaults, options);

			if (typeof options.expires === 'number') {
				var days = options.expires, t = options.expires = new Date();
				t.setMilliseconds(t.getMilliseconds() + days * 864e+5);
			}

			return (document.cookie = [
				encode(key), '=', stringifyCookieValue(value),
				options.expires ? '; expires=' + options.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
				options.path    ? '; path=' + options.path : '',
				options.domain  ? '; domain=' + options.domain : '',
				options.secure  ? '; secure' : ''
			].join(''));
		}

		// Read

		var result = key ? undefined : {},
			// To prevent the for loop in the first place assign an empty array
			// in case there are no cookies at all. Also prevents odd result when
			// calling $.cookie().
			cookies = document.cookie ? document.cookie.split('; ') : [],
			i = 0,
			l = cookies.length;

		for (; i < l; i++) {
			var parts = cookies[i].split('='),
				name = decode(parts.shift()),
				cookie = parts.join('=');

			if (key === name) {
				// If second argument (value) is a function it's a converter...
				result = read(cookie, value);
				break;
			}

			// Prevent storing a cookie that we couldn't decode.
			if (!key && (cookie = read(cookie)) !== undefined) {
				result[name] = cookie;
			}
		}

		return result;
	};

	config.defaults = {};

	$.removeCookie = function (key, options) {
		// Must not alter options, thus extending a fresh object...
		$.cookie(key, '', $.extend({}, options, { expires: -1 }));
		return !$.cookie(key);
	};

}));

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