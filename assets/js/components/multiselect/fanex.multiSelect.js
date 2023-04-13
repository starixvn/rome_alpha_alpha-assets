"use strict";
(function ($) {
    function FanexMultiSelect(element, options) {
        options.disabled = element.attr("disabled") === "disabled";
        this.options = $.extend({}, this._defaults, options);
        this.$multiSelect = element;
        var multiSelectId = element.attr("id");

        // ----- initialize
        this.isOpenning = false;
        this.browser = this._detectBrowser();
        this.isHasGroup = this._isHasGroup(this.options.listData);
        var dropdownContainerId = "fanex-multiselect-options-" + multiSelectId;

        var html = [
            this._renderButton(multiSelectId, dropdownContainerId),
            '<div class="fanex-multiselect-options fanex-multiselect-treeview fanex-multiselect-shadow" id="', dropdownContainerId, '">'
        ];
        if (this.options.listData.length) {
            html.push(this._renderFilterAndSelectAll(), this._renderCheckboxContainer(multiSelectId));
        } else {
            html.push(this._renderFilterAndSelectAllNoItem());
        }
        html.push("</div>");

        // Global Variables
        this.$multiSelect = this.$multiSelect
            .after(html.join(""))
            .next("#" + multiSelectId);
        this.$dropdownContainer = this.$multiSelect.next("#" + dropdownContainerId).hide();
        this.$noSearchFound = this.$dropdownContainer.find(".no-data-text");
        this.$selectAllContainer = this.$dropdownContainer.find("div.custom-ui-widget-header");
        this.$selectAll = this.$selectAllContainer.find(".fanex-multiselect-check-all > input[type=checkbox]");
        this.$checkboxContainer = this.$dropdownContainer.find("ul.first-group");
        this.$allLabel = this.$dropdownContainer.find("label");
        this.$listItem = this.$dropdownContainer.find("ul.fanex-multiselect-ul-group");
        this.$listGroupCheckBox = this.$dropdownContainer.find("label.fanex-multiselect-group-mark input[type=checkbox]");
        this.$mainParentGroup = this.$dropdownContainer.find("ul.first-group > li > div.fanex-multiselect-div");

        var $listLabelExceptSelectAll = this.$checkboxContainer.find("label");
        this.$allCheckBoxesExceptSelectAll = $listLabelExceptSelectAll.not(".fanex-multiselect-state-disabled").find("input[type=checkbox]");
        this.$allCheckBoxesWithoutGroupExceptSelectAll = $listLabelExceptSelectAll.not(".fanex-multiselect-group-mark").find("input[type=checkbox]");

        this._registerEvents();

        // update the number of selected elements when the page initially loads, and use that as the defaultValue.
        // necessary for form resets when options are pre-selected.
        this.$multiSelect.find("input[type=text]").defaultValue = this._updateSelected();
        this._updateSelectAll();

        // open by default
        this.options.state === "open" && this.$dropdownContainer.trigger("open", [false]);
        element.remove();
    }

    FanexMultiSelect.prototype = {
        constructor: FanexMultiSelect,

        getSelectedValues: function () {
            var selected = [];
            this.$allCheckBoxesWithoutGroupExceptSelectAll.filter(":checked").each(function (_, item) {
                selected.push(item.value);
            });

            return selected.join();
        },

        getAllValues: function () {
            var allValues = {};
            this.$allCheckBoxesWithoutGroupExceptSelectAll.each(function (_, item) {
                allValues[item.value] = item.checked;
            });

            return allValues;
        },

        getItemsByCustomAttributes: function (attributes) {
            var query = [];
            Object.keys(attributes).forEach(function (key) {
                query.push('[data-', key.toLowerCase(), '="', attributes[key], '"]');
            });

            return this.$allCheckBoxesExceptSelectAll.filter(query.join(""));
        },

        getSelectedItemsByCustomAttributes: function (attributes) {
            var query = [":checked"];
            Object.keys(attributes).forEach(function (key) {
                query.push('[data-', key.toLowerCase(), '="', attributes[key], '"]');
            });

            return this.$allCheckBoxesExceptSelectAll.filter(query.join(""));
        },

        select: function (selectValues) {
            var me = this;
            if (!$.isArray(selectValues)) {
                selectValues = [selectValues];
            }

            var selectValuesObject = selectValues.reduce((prevItem, item) => (prevItem[item] = true, prevItem), {});
            this.$allCheckBoxesExceptSelectAll.each(function (_, item) {
                if (selectValuesObject.hasOwnProperty(item.value)) {
                    item.checked = true;
                    me._handleCheckboxClick($(item));
                }
            });
        },

        selectByCustomAttributes: function (attributes) {
            var matchedItems = this.getItemsByCustomAttributes(attributes);
            if (matchedItems.length) {
                var me = this;
                matchedItems.each(function (_, item) {
                    item.checked = true;
                    me._handleCheckboxClick($(item));
                });
            }
        },

        deselect: function (deselectValues) {
            if (!this.options.multiple) {
                // In single selection mode at least on option needs to be selected
                return;
            }

            var me = this;
            if (!$.isArray(deselectValues)) {
                deselectValues = [deselectValues];
            }

            var deselectValuesObject = deselectValues.reduce((prevItem, item) => (prevItem[item] = true, prevItem), {});
            this.$allCheckBoxesExceptSelectAll.each(function (_, item) {
                if (deselectValuesObject.hasOwnProperty(item.value)) {
                    item.checked = false;
                    me._handleCheckboxClick($(item));
                }
            });
        },

        deselectByCustomAttributes: function (attributes) {
            var matchedItems = this.getItemsByCustomAttributes(attributes);
            if (matchedItems.length) {
                var me = this;
                matchedItems.each(function (_, item) {
                    item.checked = false;
                    me._handleCheckboxClick($(item));
                });
            }
        },

        setSelectAll: function (checked) {
            this.$selectAll.prop("checked", checked);
            this._handleSelectAll(checked);
        },

        /* Private Functions */
        _detectBrowser: function () {
            //// multiSelect Scroller
            var matchedBrowser, browserDectect;

            // Use of jQuery.browser is frowned upon.
            // More details: http://api.jquery.com/jQuery.browser
            // jQuery.uaMatch maintained for back-compat
            function ubMatch(ua) {
                ua = ua.toLowerCase();

                var match =
                    /(chrome)[ \/]([\w.]+)/.exec(ua) ||
                    /(webkit)[ \/]([\w.]+)/.exec(ua) ||
                    /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
                    /(msie) ([\w.]+)/.exec(ua) ||
                    (ua.indexOf("compatible") < 0 &&
                        /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua)) ||
                    [];

                return {
                    browserDectect: match[1] || "",
                    version: match[2] || "0"
                };
            }

            matchedBrowser = ubMatch(navigator.userAgent);
            browserDectect = {};

            if (matchedBrowser.browserDectect) {
                browserDectect[matchedBrowser.browserDectect] = true;
                browserDectect.version = matchedBrowser.version;
            }

            // Chrome is Webkit, but Webkit is also Safari.
            if (browserDectect.chrome) {
                browserDectect.webkit = true;
            } else if (browserDectect.webkit) {
                browserDectect.safari = true;
            }

            return browserDectect;
        },

        _defaults: {
            showTooltip: true,
            tooltipNoItem: "Select None",
            showFilter: false,
            filterPlaceHolder: "Search...",
            noItemFoundText: "No item found",
            showSelectAll: true,
            selectAllText: "Select All",
            useCustomSelectAllText: true,
            customSelectAllText: "Select All (#)",
            noItemText: "No item",
            noneSelectedText: "Select items (0)",
            selectedText: "Select items (#)",
            maxHeight: 400,
            minWidth: 200,
            position: "bottom" /* top|middle|bottom */,
            duration: 10,
            disabled: false,
            state: "closed",
            multiple: true,
            expandGroupsByDefault: true,
            isCheckAll: false,
            showParentSelectedText: false,
            isRetrieveDataAfterClose: false,
            listData: [],
            onOpen: function () { },
            onLeave: function () { },
            onCheck: function () { },
            onCheckAll: function () { }
        },

        _isHasGroup: function (listData) {
            for (var i = 0, max = listData.length; i < max; i++) {
                if (listData[i].items && listData[i].items.length > 0) {
                    return true;
                }
            }

            return false;
        },

        _renderButton: function (multiSelectId, dropdownContainerId) {
            this.$multiSelect.prev().is("div#" + dropdownContainerId) && this.$multiSelect.prev().remove();
            this.$multiSelect.next().is("div#" + dropdownContainerId) && this.$multiSelect.next().remove();

            return [
                '<a id="',
                multiSelectId,
                '" class="fanex-multiselect fanex-multiselect-widget fanex-multiselect-state-default',
                this.options.disabled ? " fanex-multiselect-state-disabled" : "",
                '">',
                '<input type="text" readonly="readonly" class="fanex-multiselect-state-default" value="',
                this.options.noneSelectedText,
                '" /><span class="fanex-multiselect-icon fanex-multiselect-icon-triangle-1-s"></span></a>'
            ].join("");
        },

        _renderFilterAndSelectAll: function () {
            var html = this.options.showFilter
                ? [
                    '<div class="fanex-multiselect-filter">',
                    '<input type="text" placeholder="',
                    this.options.filterPlaceHolder,
                    '" autocomplete="off"/></div>',
                    '<div class="no-data-text" style="display:none;">',
                    this.options.noItemFoundText,
                    "</div>"
                ] : [];

            html.push(
                '<div class="custom-ui-widget-header"', this.options.showSelectAll ? "" : ' style="display:none;"', ">",
                '<ul class="fanex-multiselect-helper-reset" style="overflow-y:hidden;">',
                '<li style="display:inline;" class="show-item">',
                '<label class="fanex-multiselect-check-all">',
                '<input type="checkbox" />', this.options.selectAllText, "</label></li>",
            );

            this.isHasGroup
                && html.push('<li class="fanex-multiselect-icon-dropdown fanex-multiselect-icon-', this.options.expandGroupsByDefault ? 'collapse' : 'expand', '">&nbsp;</li>');

            html.push("</ul></div>");
            return html.join("");
        },

        _renderFilterAndSelectAllNoItem: function () {
            return [
                '<div class="fanex-multiselect-widget-header fanex-multiselect-helper-clearfix ',
                'fanex-multiselect-corner-all fanex-multiselect-header custom-ui-widget-header">',
                '<ul class="fanex-multiselect-helper-reset fanex-multiselect-checkboxes-head" style="overflow-y:hidden;">',
                '<li style="display:inline;"><label class="fanex-multiselect-corner-all">', this.options.noItemText, "</label></li>",
                '</ul></div>'
            ].join("");
        },

        _renderCheckboxContainer: function (multiSelectId) {
            this.numGroup = 0;
            var groupIdAttr = "fanex-multiselect-option-group-0";
            var html = [
                '<ul class="first-group rtUL',
                this.isHasGroup ? " rtLines" : "",
                ' fanex-multiselect-ul-group" childgroupid="',
                groupIdAttr,
                '">'
            ];

            var listData = this.options.listData;
            for (var i = 0, max = listData.length; i < max; i++) {
                this.numGroup++;
                var tempGroup = listData[i];
                html.push(
                    this._renderCheckbox(multiSelectId, {
                        data: tempGroup,
                        index: i,
                        hasChild: tempGroup.items && tempGroup.items.length > 0,
                        isLastChild: i === max - 1,
                        parentGroupId: groupIdAttr,
                        groupId: "0-" + i
                    })
                );
            }

            html.push("</ul>");
            return html.join("");
        },

        _renderCheckbox: function (multiSelectId, row) {
            var tempHtml = [],
                dataId = row.data.id || "",
                title = row.data.text || "",
                value = row.data.value || "",
                name = row.data.name || value,
                inputId =
                    "fanex-multiselect-" +
                    multiSelectId +
                    "-" +
                    dataId +
                    "-option-" +
                    row.groupId,
                isDisabled = typeof row.data.enable !== "undefined" && !row.data.enable,
                labelClasses = row.data.cssClass || "",
                liClasses = "rtLI show-item",
                divClasses = "fanex-multiselect-div",
                groupIdAttr = "fanex-multiselect-option-group-" + row.groupId,
                attributes = row.data.attributes || {};
            row.hasChild = row.hasChild || false;

            if (value) {
                liClasses +=
                    (isDisabled ? " fanex-multiselect-disabled" : "") +
                    (row.isLastChild ? " rtLast" : "") +
                    (row.index === 0 && row.hasChild ? " rtFirst" : "");
                tempHtml.push('<li class="', liClasses, '" data-content-text="', title.toLowerCase(), '">');

                if (this.isHasGroup) {
                    divClasses += row.isLastChild
                        ? " rtBot"
                        : row.index === 0
                            ? " rtMid rtSelected"
                            : " rtMid";
                    tempHtml.push('<div class="', divClasses, '">');
                    row.hasChild
                        && tempHtml.push(
                            '<span class="collapseClass rtMinus" data-group-show="',
                            this.options.expandGroupsByDefault !== false,
                            '"></span>');
                } else {
                    if (!row.hasChild && this.isHasGroup) {
                        divClasses += !this.isHasGroup
                            ? ""
                            : row.isLastChild
                                ? " rtBot"
                                : " rtMid";
                        tempHtml.push('<div class="', divClasses, '">');
                    } else {
                        tempHtml.push('<div class="', divClasses, '" style="margin-left:10px;">');
                    }
                }

                labelClasses += isDisabled ? " fanex-multiselect-state-disabled" : "";
                labelClasses += row.hasChild && this.isHasGroup ? " fanex-multiselect-group-mark" : "";
                tempHtml.push(
                    '<label class="', labelClasses, '">',
                    '<input class="show-item" type="', this.options.multiple ? "checkbox" : "radio",
                    '" id="', inputId,
                    '" name="', name,
                    '" value="', value,
                    '" title="', title,
                    '" childgroupid="',
                    row.parentGroupId,
                    '" data-is-group="', row.hasChild, '"',
                    this.options.isCheckAll ? ' checked="checked"' : "",
                    row.data.checked ? ' checked="checked"' : "",
                    isDisabled ? ' disabled="disabled"' : "",
                    dataId ? ' data-item-id="' + dataId + '"' : ""
                );
                Object.keys(attributes).forEach(function (key) {
                    tempHtml.push(' data-', key.toLowerCase(), '="', attributes[key], '"');
                });
                tempHtml.push('/>', title, '</label></div>');

                if (row.hasChild) {
                    tempHtml.push('<ul class="fanex-multiselect-ul-group custom-multi-select-rtUL" childgroupid="', groupIdAttr, '">');

                    var children = row.data.items;
                    for (var j = 0, childrenLength = children.length; j < childrenLength; j++) {
                        var childItem = children[j];
                        tempHtml.push(
                            this._renderCheckbox(multiSelectId, {
                                data: childItem,
                                index: j,
                                hasChild: childItem.items && childItem.items.length > 0,
                                isLastChild: j === childrenLength - 1,
                                parentGroupId: groupIdAttr,
                                groupId: row.groupId + "-" + j
                            })
                        );
                    }

                    tempHtml.push("</ul>");
                }

                tempHtml.push("</li>");
            }

            return tempHtml.join("");
        },

        _registerEvents: function () {
            var me = this,
                options = me.options;
            // handle seach filter textbox
            if (options.showFilter) {
                this.$dropdownContainer.find(".fanex-multiselect-filter > input[type=text]")
                    .off()
                    .on("keyup", function () {
                        var $this = $(this);
                        var filterVal = $this.val().toLowerCase();
                        if (filterVal.length) {
                            me.$listItem
                                .find("li")
                                .removeAttr("data-dont-hide-me")
                                .removeClass("show-item")
                                .find("div")
                                .removeClass("high-light-item")
                                .find("input")
                                .removeClass("show-item");

                            var dontHideElements = me.$listItem
                                .find('li[data-content-text*="' + filterVal + '"]')
                                .removeClass("hide-item")
                                .addClass("show-item")
                                .attr("data-dont-hide-me", "true");

                            dontHideElements.find("input").addClass("show-item");
                            if (dontHideElements.length > 0) {
                                me.$noSearchFound.hide();
                                me.$selectAllContainer.show();
                                dontHideElements.each(function () {
                                    var dontHideElement = $(this);
                                    dontHideElement
                                        .children()
                                        .first()
                                        .addClass("high-light-item");

                                    var prevParent = dontHideElement.parent().prev();
                                    var grandParent = dontHideElement.parent().parent();

                                    while (grandParent.hasClass("rtLI")) {
                                        grandParent
                                            .removeClass("hide-item")
                                            .addClass("show-item")
                                            .attr("data-dont-hide-me", "true");
                                        prevParent.find("input").addClass("show-item");
                                        prevParent = grandParent.parent().prev();
                                        grandParent = grandParent.parent().parent();
                                    }

                                    dontHideElement
                                        .find("li.rtLI")
                                        .removeClass("hide-item")
                                        .addClass("show-item")
                                        .attr("data-dont-hide-me", "true")
                                        .find("input")
                                        .addClass("show-item");
                                });
                            } else {
                                me.$selectAllContainer.hide();
                                me.$noSearchFound.show();
                            }

                            me.$listItem
                                .find('li[data-dont-hide-me!="true"]')
                                .addClass("hide-item");
                        } else {
                            me.$noSearchFound.hide();
                            me.$selectAllContainer.show();
                            me.$listItem
                                .find("li")
                                .removeAttr("data-dont-hide-me")
                                .removeClass("hide-item")
                                .addClass("show-item")
                                .find("div")
                                .removeClass("high-light-item")
                                .find("input")
                                .addClass("show-item");
                        }

                        me.$listItem.find("input.show-item:checked").each(function () {
                            var inputShowItem = $(this);
                            var grantParent = inputShowItem.parent().parent();
                            if (grantParent.next().find("li").length === 0) {
                                me._updateParentSelected(grantParent);
                            }
                        });
                        me.$listItem
                            .find("input.show-item:not(:checked)")
                            .each(function () {
                                me._removeParentSelected(
                                    $(this).parent().parent().parent().parent()
                                );
                            });
                    });
            }

            // handle Select All
            this.$selectAll.click(function () {
                me._handleSelectAll(this.checked);
                me.options.onCheckAll.call(this);
            });

            // handle collapse/expand All
            this.$selectAllContainer.find(".fanex-multiselect-icon-dropdown").click(function () {
                var $this = $(this);
                if ($this.hasClass("fanex-multiselect-icon-collapse")) {
                    $this
                        .removeClass("fanex-multiselect-icon-collapse")
                        .addClass("fanex-multiselect-icon-expand");
                    me.$checkboxContainer
                        .find("ul.fanex-multiselect-ul-group:visible")
                        .hide();
                    me.$checkboxContainer
                        .find("span.collapseClass")
                        .removeClass("rtMinus")
                        .addClass("rtPlus");
                } else {
                    me.$checkboxContainer
                        .find("ul.fanex-multiselect-ul-group:hidden")
                        .show();
                    me.$checkboxContainer
                        .find("span.collapseClass")
                        .removeClass("rtPlus")
                        .addClass("rtMinus");
                    $this
                        .removeClass("fanex-multiselect-icon-expand")
                        .addClass("fanex-multiselect-icon-collapse");
                }
            });

            // handle collapse/expand icon
            this.$dropdownContainer.find("span.collapseClass").each(function () {
                var $this = $(this);
                $this.click(function () {
                    if ($this.hasClass("rtMinus")) {
                        $this.removeClass("rtMinus").addClass("rtPlus");
                    } else {
                        $this.removeClass("rtPlus").addClass("rtMinus");
                    }
                    $this.parent().next().toggle();
                });

                if (!$this.data("group-show")) {
                    $this.removeClass("rtMinus").addClass("rtPlus");
                    $this.parent().next().hide();
                }
            });

            // handle button events
            me.$multiSelect.click(function (e) {
                if (me.$dropdownContainer.is(":hidden")) {
                    me.$dropdownContainer.trigger("open");
                } else {
                    me.$dropdownContainer.trigger("close", [true, true, me.$dropdownContainer.attr("id")]);
                }
            });

            // handle dropdown container events
            me.$dropdownContainer.bind({
                close: function (e, others, isRetrieveData, targetId) {
                    if (me.$dropdownContainer.css("display") !== "none") {
                        others = others || false;

                        // hides all other options but the one clicked
                        if (others) {
                            $("div.fanex-multiselect-options").filter(":visible").slideUp(options.duration);
                        } else {
                            me.$dropdownContainer.slideUp(options.duration);
                        }

                        if (options.isRetrieveDataAfterClose) {
                            isRetrieveData = isRetrieveData || false;
                            if (isRetrieveData) {
                                me.$allLabel
                                    .find('input[ischeck="true"]')
                                    .prop("checked", true);
                                if (me.isOpenning) {
                                    me.$allLabel
                                        .find('input[ischeck!="true"]')
                                        .prop("checked", false);
                                }
                            }

                            me.$allLabel.find("input").removeAttr("isCheck");
                            me.isOpenning = false;
                        }

                        me._updateSelected();

                        if (targetId && (targetId === 'html' || targetId !== me.$multiSelect.attr("id")) && me.isOpenning) {
                            options.onLeave.call(me.$multiSelect);
                            me.isOpenning = false;
                        }
                    }
                },
                open: function (e, closeOthers) {
                    // bail if this widget is disabled
                    if (me.$multiSelect.hasClass("fanex-multiselect-state-disabled")) {
                        return;
                    }

                    // use position() if inside ui-widget-content, because offset() won't cut it.
                    var offset = me.$multiSelect.position(),
                        $container = me.$dropdownContainer.find("ul:last"),
                        top;

                    // hide all other options
                    if (closeOthers || typeof closeOthers === "undefined") {
                        $("div.fanex-multiselect-options").trigger("close", [true, true, "html"]);
                    }

                    // calculate positioning
                    if (options.position === "middle") {
                        top = offset.top +
                            me.$multiSelect.height() / 2 -
                            me.$dropdownContainer.outerHeight() / 2;
                    } else if (options.position === "top") {
                        top = offset.top - me.$dropdownContainer.outerHeight() - 7;
                    } else {
                        top = offset.top + me.$multiSelect.outerHeight();
                    }
                    top += 3; // padding extra 3px to seperate options with multi select div

                    // show the options div + position it
                    me.$dropdownContainer.css({
                        position: "absolute",
                        top: top + "px",
                        left: offset.left + "px",
                        width: options.minWidth + "px"
                    }).slideDown(options.duration);

                    // set the scroll of the checkbox container
                    $container.scrollTop(0);

                    // set the height of the checkbox container
                    if (options.maxHeight) {
                        if (options.maxHeight <= me.$checkboxContainer.height()) {
                            me.$checkboxContainer.css("max-height", options.maxHeight);
                        }
                    }

                    if (options.isRetrieveDataAfterClose) {
                        me.$allLabel
                            .find("input")
                            .filter(":checked")
                            .attr("ischeck", "true");
                    }

                    me.isOpenning = true;
                    options.onOpen.call();
                },
                click: function (e) { e.stopPropagation(); }
            });

            // checkbox click event handle
            me.$listItem.each(function () {
                var $this = $(this);

                // handler chilren checkbox event
                var childrenNodes = $this.find('li.show-item input[childgroupid="' + $this.attr("childgroupid") + '"]');
                childrenNodes.click(function () {
                    var current = $(this);
                    me._handleCheckboxClick(current, $this, childrenNodes);
                    !current.data("is-group") && options.onCheck.call(this);
                });

                // handle group checkbox click event
                $this
                    .prev("div:not(.custom-ui-widget-header)")
                    .children()
                    .not("span.collapseClass")
                    .find("input")
                    .click(function () {
                        if ($(this).prop("checked")) {
                            $(this)
                                .parent()
                                .parent()
                                .next()
                                .find("li.show-item input.show-item:not(:disabled)")
                                .prop("checked", true);
                            me._updateParentSelected($this);
                            me._updateSelectAll();
                        } else {
                            $(this)
                                .parent()
                                .parent()
                                .next()
                                .find("li.show-item input.show-item:not(:disabled)")
                                .prop("checked", false);
                            me.$selectAll.prop("checked", false);
                        }

                        options.onCheck.call(this);
                        me._updateSelected();
                    });
            });

            //// Register windows delegate event for closing milti select
            $(document).delegate("html", "click", function (e) {
                var $target = $(e.target);
                if (!$target.closest("div.fanex-multiselect-options").length
                    && !$target.parent().hasClass("fanex-multiselect")
                    && !$target.hasClass("exeption-multiselect-click")) {
                    $("div.fanex-multiselect-options").trigger("close", [true, true, $target.attr("id") || "html"]);
                }
            });
        },

        _handleSelectAll: function (checked) {
            this.$allCheckBoxesExceptSelectAll.filter(".show-item").prop("checked", checked);
            this._updateSelected();
        },

        _handleCheckboxClick: function (checkbox, parent, childrenNodes) {
            parent = parent || checkbox.closest("ul.fanex-multiselect-ul-group");
            if (checkbox.is(":checked")) {
                childrenNodes = childrenNodes || parent.find('li.show-item input[childgroupid="' + parent.attr("childgroupid") + '"]');
                var currentGroup = parent,
                    currentChildSelected = childrenNodes.filter(".show-item").filter(":checked").length,
                    currentChildLength = childrenNodes.filter(".show-item").length;
                if (currentChildLength === currentChildSelected) {
                    currentGroup.prev().find("input").prop("checked", true);
                    this._updateParentSelected(parent/*current.parent().parent().parent().parent()*/);
                }

                this._updateSelectAll();
            } else {
                this._removeParentSelected(parent);
            }

            this._updateSelected();
        },

        _removeParentSelected: function (currentGroup) {
            if (currentGroup.hasClass("fanex-multiselect-ul-group")
                && currentGroup.length > 0) {
                if (currentGroup.prev().find("input").prop("checked")) {
                    currentGroup.prev().find("input").prop("checked", false);
                    this.$selectAll.prop("checked", false);
                }

                this._removeParentSelected(currentGroup.parent().parent());
            }
        },

        _updateParentSelected: function (currentGroup) {
            var parentGroup = currentGroup.parent().parent();
            if (parentGroup.prop("tagName").toLowerCase() === "ul"
                && parentGroup.length > 0) {
                var currentChildren = parentGroup.find("li.show-item > div > label > input.show-item"),
                    currentChildSelected = currentChildren.filter(":checked").length;
                if (currentChildren.length === currentChildSelected) {
                    parentGroup.prev().find("input").prop("checked", true);
                }

                this._updateParentSelected(parentGroup);
            }
        },

        _updateSelectAll: function () {
            if (this.numGroup === this.$checkboxContainer.find('input[childgroupid="fanex-multiselect-option-group-0"]').filter(":checked").length) {
                this.$selectAll.prop("checked", true);
                this.$listGroupCheckBox.prop("checked", true);
            }
        },

        _updateSelected: function () {
            var options = this.options,
                $inputs = this.$allCheckBoxesWithoutGroupExceptSelectAll,
                $checked = $inputs.filter(":checked"),
                value = "",
                numChecked = $checked.length;

            if (numChecked === 0) {
                value = options.noneSelectedText;
            } else {
                if (options.useCustomSelectAllText && $inputs.length === numChecked) {
                    if (typeof options.customSelectAllText === "function") {
                        value = options.customSelectAllText();
                    } else {
                        value = options.customSelectAllText.replace("#", numChecked);
                    }
                } else {
                    if (options.showParentSelectedText) {
                        $checked = this.$mainParentGroup.find("input:checked");
                        numChecked = $checked.length;
                    }

                    if (numChecked > 0) {
                        var arrayItemChecked = [];
                        for (var i = 0; i < numChecked; i++) {
                            arrayItemChecked.push($checked[i].title);
                        }
                        value = arrayItemChecked.join(", ");
                        if (value.length * 8 > options.minWidth) {
                            value = options.selectedText.replace("#", numChecked);
                        }
                    } else {
                        value = options.noneSelectedText;
                    }
                }
            }

            // Update tooltip
            if (options.showTooltip) {
                var tooltipValue = $checked
                    .map(function () {
                        return this.title;
                    })
                    .get()
                    .join(", ");
                if (tooltipValue === "") {
                    tooltipValue = options.tooltipNoItem;
                }
                this.$multiSelect.attr("original-title", tooltipValue);
                this.$multiSelect.attr("title", tooltipValue);
            }

            this.$multiSelect.find("input").val(value);
            return value;
        }
    };

    $.fn.fanexMultiSelect = function (option, parameter) {
        var data;
        if (typeof option === "string") {
            data = this.data("fanexMultiSelect");
            return data[option](parameter);
        }

        return this.each(function () {
            var $this = $(this);
            data = $this.data("fanexMultiSelect");

            if (!data) {
                var options = typeof option === "object" && option;
                data = new FanexMultiSelect($this, options);
                $this.data("fanexMultiSelect", data);
            }
        });

        //return this.each(function () {
        //    var $this = $(this);
        //    var data = $this.data("fanexMultiSelect");

        //    if (!data) {
        //        var options = typeof option === "object" && option;
        //        data = new FanexMultiSelect($this, options);
        //        $this.data("fanexMultiSelect", data);
        //    }

        //    typeof option === "string" && typeof data[option] === "function" && data[option].apply(data, parameter);
        //});
    };

    $.fn.fanexMultiSelect.Constructor = FanexMultiSelect;
})(window.jQuery);
