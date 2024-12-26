"use strict";
(function ($) {
    function FanexMultiSelect(element, options) {
        element.prev().is("#" + dropdownContainerId) && element.prev().remove();
        element.next().is("#" + dropdownContainerId) && element.next().remove();

        options.disabled = element.attr("disabled") === "disabled";
        this.options = $.extend({}, this._defaults, options);
        this.$multiselect = element;
        this.multiselectId = element.attr("id") || this._generateUniqueId();

        // ----- initialize
        this.isOpenning = false;
        this.isHasGroup = this._isHasGroup(this.options.listData);
        var dropdownContainerId = "fanex-multiselect-options-" + this.multiselectId;

        var html = [
            this._renderButton(),
            '<div class="fanex-multiselect-options fanex-multiselect-treeview fanex-multiselect-shadow',
            !this.options.showFilter ? ' multiselect-nosearch' : '',
            '" id="', dropdownContainerId, '">'
        ];
        if (this.options.listData.length) {
            html.push(this._renderFilterAndSelectAll(), this._renderCheckboxContainer());
        } else {
            html.push(this._renderFilterAndSelectAllNoItem());
        }
        html.push("</div>");

        // Global Variables
        this.$multiselect = this.$multiselect
            .after(html.join(""))
            .next("#" + this.multiselectId);
        this.$buttonText = this.$multiselect.find("#interface-button-" + this.multiselectId);
        this.$dropdownContainer = this.$multiselect.next("#" + dropdownContainerId).hide();
        this.$selectAll = this.$dropdownContainer.find("#select-all-checkbox-" + this.multiselectId);
        this.$checkboxContainer = this.$dropdownContainer.find("ul.first-group");
        this.$listItem = this.$dropdownContainer.find("ul.fanex-multiselect-ul-group");
        //this.$listGroupCheckBox = this.$dropdownContainer.find("label.fanex-multiselect-group-mark input[type=checkbox]");
        this.$mainParentGroup = this.$dropdownContainer.find("ul.first-group > li > div.fanex-multiselect-div");

        var $listLabelExceptSelectAll = this.$checkboxContainer.find("label");
        this.$allCheckBoxesWithoutGroupExceptSelectAll = $listLabelExceptSelectAll.not(".fanex-multiselect-group-mark").find("input[type=checkbox]");

        this._registerEvents();

        // update the number of selected elements when the page initially loads, and use that as the defaultValue.
        // necessary for form resets when options are pre-selected.
        this.$buttonText.defaultValue = this._updateSelected();
        this._updateSelectAll();

        // open by default
        this.options.state === "open" && this.$dropdownContainer.trigger("open", [false]);
        element.remove();
    }

    FanexMultiSelect.prototype = {
        constructor: FanexMultiSelect,

        getCheckedValues: function () {
            var checked = [];
            this._getCheckboxesWithoutGroup(":checked").each(function (_, item) {
                checked.push(item.value);
            });

            return checked.join();
        },

        getUncheckedValues: function () {
            var unchecked = [];
            this._getCheckboxesWithoutGroup(":not(:checked)").each(function (_, item) {
                unchecked.push(item.value);
            });

            return unchecked.join();
        },

        getAllValues: function () {
            var allValues = {};
            this._getCheckboxesWithoutGroup().each(function (_, item) {
                allValues[item.value] = item.checked;
            });

            return allValues;
        },

        showAllItems: function (value) {
            var matchedItems = value
                ? this.$checkboxContainer.find("li.hide-item-global input[type=checkbox]")
                : this.$checkboxContainer.find("li:not(.hide-item-global) input[type=checkbox]");
            matchedItems.length && this._showHideCheckboxes(value, matchedItems);
        },

        showItemsByValues: function (values) {
            var query = [];
            values.forEach(function (value) {
                query.push('[value="' + value + '"]');
            });

            this._showCheckboxes(this.$checkboxContainer.find("li label:not(.fanex-multiselect-group-mark) input[type=checkbox]" + query.join()));
        },

        showItemsByCustomAttributes: function (attributes) {
            this._showCheckboxes(this.getItemsByCustomAttributes(attributes));
        },

        hideItemsByValues: function (values) {
            var query = [];
            values.forEach(function (value) {
                query.push('[value="' + value + '"]');
            });

            this._hideCheckboxes(this.$checkboxContainer.find("li label:not(.fanex-multiselect-group-mark) input[type=checkbox]" + query.join()));
        },

        hideItemsByCustomAttributes: function (attributes) {
            this._hideCheckboxes(this.getItemsByCustomAttributes(attributes));
        },

        getItemsByCustomAttributes: function (attributes) {
            var query = [];
            Object.keys(attributes).forEach(function (key) {
                query.push('[data-', key.toLowerCase(), '="', attributes[key], '"]');
            });

            return this.$checkboxContainer.find("input[type=checkbox]" + query.join(""));
        },

        uncheck: function (uncheckValues) {
            if (!this.options.multiple) {
                // In single selection mode at least on option needs to be selected
                return;
            }

            if (!$.isArray(uncheckValues)) {
                uncheckValues = [uncheckValues];
            }

            const uncheckValuesObject = {};
            uncheckValues.forEach(function (item) { uncheckValuesObject[item] = true; });
            this._getCheckboxesWithoutGroup().each(function (_, item) {
                if (uncheckValuesObject.hasOwnProperty(item.value)) {
                    item.checked = true;
                    $(item).trigger("click");
                }
            });
        },

        disable: function (value) {
            value
                ? this.$multiselect.addClass("fanex-multiselect-state-disabled")
                : this.$multiselect.removeClass("fanex-multiselect-state-disabled");
        },

        addError: function (value) {
            value
                ? this.$multiselect.addClass("error")
                : this.$multiselect.removeClass("error");
        },

        getUncheckedProductIds: function () {
            var productIdsObject = {};
            var checkboxes = this._getCheckboxesWithoutGroup();
            checkboxes.filter(":not(:checked)").each(function (_, item) {
                productIdsObject[$(item).data("productid")] = true;
            });

            var productIds = Object.keys(productIdsObject);
            if (productIds.length) {
                checkboxes.filter(":checked").each(function (_, item) {
                    var productId = $(item).data("productid");
                    if (productIdsObject.hasOwnProperty(productId)) {
                        productIdsObject[productId] = false;
                    }
                });

                productIds.length = 0;
                Object.keys(productIdsObject).forEach(function (key) {
                    productIdsObject[key] && productIds.push(key);
                });
            }

            return productIds;
        },

        /* Private Functions */
        _defaults: {
            showTooltip: true,
            showFilter: false,
            filterPlaceHolder: "Search...",
            noItemFoundText: "No item found",
            showSelectAll: true,
            selectAllText: "Select All",
            customSelectAllText: "All (#)",
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

        _generateUniqueId: function () {
            return Math.random().toString(36).substr(2);
        },

        _isHasGroup: function (listData) {
            for (var i = 0, max = listData.length; i < max; i++) {
                if (listData[i].items && listData[i].items.length > 0) {
                    return true;
                }
            }

            return false;
        },

        _renderButton: function () {
            var buttonId = "interface-button-" + this.multiselectId;

            return [
                '<a id="',
                this.multiselectId,
                '" class="fanex-multiselect fanex-multiselect-widget fanex-multiselect-state-default',
                this.options.disabled ? " fanex-multiselect-state-disabled" : "",
                '">',
                '<input type="text" readonly="readonly" class="fanex-multiselect-state-default" value="',
                this.options.noneSelectedText,
                '" id="',
                buttonId,
                '" /><span class="fanex-multiselect-icon fanex-multiselect-icon-triangle-1-s"></span></a>'
            ].join("");
        },

        _renderFilterAndSelectAll: function () {
            var html = [];
            if (this.options.showFilter) {
                var filterId = "filter-input-" + this.multiselectId,
                    iconDeleteId = "filter-icon-delete-" + this.multiselectId,
                    noDataTextId = "no-data-text-div-" + this.multiselectId;
                html.push(
                    '<div class="fanex-multiselect-filter">',
                    '<input type="text" id="',
                    filterId,
                    '" placeholder = "',
                    this.options.filterPlaceHolder,
                    '" autocomplete="off"/><span class="icon-close" id="',
                    iconDeleteId,
                    '"></span></div><div id="',
                    noDataTextId,
                    '" class="no-data-text" style="display:none;">',
                    this.options.noItemFoundText,
                    "</div>");
            }

            if (this.options.showSelectAll) {
                var selectAllId = "select-all-checkbox-" + this.multiselectId,
                    collapseExpandAllId = "collapse-expand-all-icon-" + this.multiselectId;
                html.push(
                    '<div class="custom-ui-widget-header">',
                    '<ul class="fanex-multiselect-helper-reset" style="overflow-y:hidden;">',
                    '<li style="display:inline;" class="show-item">',
                    '<label class="fanex-multiselect-check-all">',
                    '<input type="checkbox" id="',
                    selectAllId,
                    '"/>',
                    this.options.selectAllText,
                    "</label></li>");
                if (this.isHasGroup) {
                    html.push(
                        '<li id="',
                        collapseExpandAllId,
                        '" class="fanex-multiselect-icon-dropdown fanex-multiselect-icon-',
                        this.options.expandGroupsByDefault ? 'collapse' : 'expand', '">&nbsp;</li>');
                }

                html.push("</ul></div>");
            }

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

        _renderCheckboxContainer: function () {
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
                var tempGroup = listData[i];
                html.push(
                    this._renderCheckbox({
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

        _renderCheckbox: function (row) {
            var tempHtml = [],
                dataId = row.data.id || "",
                title = row.data.text || "",
                value = row.data.value || "",
                name = row.data.name || value,
                checkboxId =
                    "fanex-multiselect-" +
                    this.multiselectId +
                    "-" +
                    dataId +
                    "-option-" +
                    row.groupId,
                isDisabled = row.data.disabled === true,
                isVisible = typeof row.data.visible === "undefined" || row.data.visible === true,
                labelClasses = row.data.cssClass || "",
                liClasses = "rtLI show-item",
                divClasses = "fanex-multiselect-div",
                groupIdAttr = "fanex-multiselect-option-group-" + row.groupId,
                attributes = row.data.attributes || {},
                isHasChild = row.hasChild || false;

            if (value) {
                liClasses +=
                    (isDisabled ? " fanex-multiselect-disabled" : "") +
                    (row.isLastChild ? " rtLast" : "") +
                    (row.index === 0 && isHasChild ? " rtFirst" : "") +
                    (isVisible ? "" : " hide-item-global") +
                    (isHasChild ? " fanex-multiselect-li-group" : "");
                tempHtml.push('<li class="', liClasses, '" data-content-text="', title.toLowerCase(), '">');

                if (this.isHasGroup) {
                    divClasses += row.isLastChild
                        ? " rtBot"
                        : row.index === 0
                            ? " rtMid rtSelected"
                            : " rtMid";
                    tempHtml.push('<div class="', divClasses, '">');
                    isHasChild
                        && tempHtml.push(
                            '<span class="collapseClass rtMinus" data-group-show="',
                            this.options.expandGroupsByDefault !== false,
                            '"></span>');
                } else {
                    if (!isHasChild && this.isHasGroup) {
                        divClasses += !this.isHasGroup
                            ? ""
                            : row.isLastChild
                                ? " rtBot"
                                : " rtMid";
                    }

                    tempHtml.push('<div class="', divClasses, '">');
                }

                labelClasses += isDisabled ? " fanex-multiselect-state-disabled" : "";
                labelClasses += isHasChild && this.isHasGroup ? " fanex-multiselect-group-mark" : "";
                tempHtml.push(
                    '<label class="', labelClasses, '">',
                    '<input class="show-item" type="', this.options.multiple ? "checkbox" : "radio",
                    '" id="', checkboxId,
                    '" name="', name,
                    '" value="', value,
                    '" title="', title,
                    '" childgroupid="',
                    row.parentGroupId,
                    '" data-is-group="', isHasChild, '"',
                    this.options.isCheckAll ? ' checked="checked"' : "",
                    row.data.checked ? ' checked="checked"' : "",
                    isDisabled ? ' disabled="disabled"' : "",
                    dataId ? ' data-item-id="' + dataId + '"' : ""
                );
                Object.keys(attributes).forEach(function (key) {
                    tempHtml.push(' data-', key.toLowerCase(), '="', attributes[key], '"');
                });
                tempHtml.push('/>', title, '</label></div>');

                if (isHasChild) {
                    tempHtml.push('<ul class="fanex-multiselect-ul-group custom-multi-select-rtUL" childgroupid="', groupIdAttr, '">');

                    var children = row.data.items;
                    for (var j = 0, childrenLength = children.length; j < childrenLength; j++) {
                        var childItem = children[j];
                        tempHtml.push(
                            this._renderCheckbox({
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
                options = me.options,
                $noSearchFound = this.$dropdownContainer.find("#no-data-text-div-" + this.multiselectId),
                $selectAllContainer = this.$dropdownContainer.find(".custom-ui-widget-header"),
                $collapseExpandAll = $selectAllContainer.find("#collapse-expand-all-icon-" + this.multiselectId),
                $allLabel = this.$dropdownContainer.find("label"),
                $listItem = this.$dropdownContainer.find("ul.fanex-multiselect-ul-group");
            // handle seach filter textbox
            if (options.showFilter) {
                const $filterInput = this.$dropdownContainer.find("#filter-input-" + this.multiselectId);
                $filterInput
                    .off()
                    .on("keyup", function () {
                        var filterVal = this.value.toLowerCase();
                        if (filterVal.length) {
                            $listItem
                                .find("li")
                                .removeAttr("data-dont-hide-me")
                                .removeClass("show-item")
                                .find("div")
                                .removeClass("high-light-item")
                                .find("input")
                                .removeClass("show-item");

                            var dontHideElements = $listItem
                                .find('li[data-content-text*="' + filterVal + '"]')
                                .removeClass("hide-item")
                                .addClass("show-item")
                                .attr("data-dont-hide-me", "true");

                            dontHideElements.find("input").addClass("show-item");
                            if (dontHideElements.length > 0) {
                                me._handleExpandAll($collapseExpandAll);
                                $noSearchFound.hide();
                                $selectAllContainer.show();
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
                                $selectAllContainer.hide();
                                $noSearchFound.show();
                            }

                            $listItem
                                .find('li[data-dont-hide-me!="true"]')
                                .addClass("hide-item");
                        } else {
                            $noSearchFound.hide();
                            $selectAllContainer.show();
                            $listItem
                                .find("li")
                                .removeAttr("data-dont-hide-me")
                                .removeClass("hide-item")
                                .addClass("show-item")
                                .find("div")
                                .removeClass("high-light-item")
                                .find("input")
                                .addClass("show-item");
                        }

                        $listItem.find("li:not(.hide-item-global) input.show-item:checked").each(function () {
                            var inputShowItem = $(this);
                            var grantParent = inputShowItem.parent().parent();
                            if (grantParent.next().find("li").length === 0) {
                                me._updateParentSelected(grantParent);
                            }
                        });
                        $listItem
                            .find("li:not(.hide-item-global) input.show-item:not(:checked)")
                            .each(function () {
                                var inputShowItem = $(this);
                                if (!inputShowItem.closest("li").hasClass("hide-item-global")) {
                                    me._removeParentSelected(
                                        $(this).parent().parent().parent().parent()
                                    );
                                }
                            });
                    });

                this.$dropdownContainer.find("#filter-icon-delete-" + this.multiselectId)
                    .off()
                    .click(function () {
                        if ($filterInput.val().length > 0) {
                            $filterInput.val("");
                            $filterInput.trigger("keyup");
                        }
                    });
            }

            // handle Select All
            if (options.showSelectAll) {
                this.$selectAll.click(function () {
                    me._handleSelectAll(this.checked);
                    me.options.onCheckAll.call(this);
                });
            }

            // handle collapse/expand All
            if (this.isHasGroup) {
                $collapseExpandAll.click(function () {
                    $collapseExpandAll.hasClass("fanex-multiselect-icon-collapse")
                        ? me._handleCollapseAll($collapseExpandAll)
                        : me._handleExpandAll($collapseExpandAll);
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
            }

            // handle button events
            me.$multiselect.click(function (e) {
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
                                $allLabel
                                    .find('input[ischeck="true"]')
                                    .prop("checked", true);
                                if (me.isOpenning) {
                                    $allLabel
                                        .find('input[ischeck!="true"]')
                                        .prop("checked", false);
                                }
                            }

                            $allLabel.find("input").removeAttr("isCheck");
                            me.isOpenning = false;
                        }

                        //me._updateSelected();

                        if (targetId && (targetId === 'html' || targetId !== this.multiselectId) && me.isOpenning) {
                            options.onLeave.call(me.$multiselect);
                            me.isOpenning = false;
                        }
                    }
                },
                open: function (e, closeOthers) {
                    // bail if this widget is disabled
                    if (me.$multiselect.hasClass("fanex-multiselect-state-disabled")) {
                        return;
                    }

                    // use position() if inside ui-widget-content, because offset() won't cut it.
                    var offset = me.$multiselect.position(),
                        $container = me.$dropdownContainer.find("ul:last"),
                        top;

                    // hide all other options
                    if (closeOthers || typeof closeOthers === "undefined") {
                        $("div.fanex-multiselect-options").trigger("close", [true, true, "html"]);
                    }

                    // calculate positioning
                    if (options.position === "middle") {
                        top = offset.top +
                            me.$multiselect.height() / 2 -
                            me.$dropdownContainer.outerHeight() / 2;
                    } else if (options.position === "top") {
                        top = offset.top - me.$dropdownContainer.outerHeight() - 7;
                    } else {
                        top = offset.top + me.$multiselect.outerHeight();
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
                        $allLabel
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
            $listItem.each(function () {
                var $this = $(this);

                // handle chilren checkbox event
                var childrenNodes = $this.find('li.show-item input[childgroupid="' + $this.attr("childgroupid") + '"]');
                childrenNodes.click(function () {
                    var current = $(this);
                    me._handleCheckboxClick(current, $this);
                    !current.data("is-group") && options.onCheck.call(this);
                });

                // handle group checkbox click event
                $this
                    .prev("div:not(.custom-ui-widget-header)")
                    .children()
                    .not("span.collapseClass")
                    .find("input")
                    .click(function () {
                        var checked = this.checked;
                        $(this)
                            .closest(".fanex-multiselect-div")
                            .next()
                            .find("li.show-item:not(.hide-item-global) input.show-item:not(:disabled)")
                            .prop("checked", checked);
                        if (checked) {
                            me._updateParentSelected($this);
                            me._updateSelectAll();
                        } else {
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
            this._getAllCheckboxes(".show-item").prop("checked", checked);
            this._updateSelected();
        },

        _handleCollapseAll: function (collapseExpandAll) {
            collapseExpandAll
                .removeClass("fanex-multiselect-icon-collapse")
                .addClass("fanex-multiselect-icon-expand");
            this.$checkboxContainer
                .find("ul.fanex-multiselect-ul-group:visible")
                .hide();
            this.$checkboxContainer
                .find("span.collapseClass")
                .removeClass("rtMinus")
                .addClass("rtPlus");
        },

        _handleExpandAll: function (collapseExpandAll) {
            this.$checkboxContainer
                .find("ul.fanex-multiselect-ul-group:hidden")
                .show();
            this.$checkboxContainer
                .find("span.collapseClass")
                .removeClass("rtPlus")
                .addClass("rtMinus");
            collapseExpandAll
                .removeClass("fanex-multiselect-icon-expand")
                .addClass("fanex-multiselect-icon-collapse");
        },

        _handleCheckboxClick: function (checkbox, parent, childrenNodes) {
            parent = parent || checkbox.closest("ul.fanex-multiselect-ul-group");
            if (checkbox.is(":checked")) {
                childrenNodes = childrenNodes || parent.find('li.show-item:not(.hide-item-global) input[childgroupid="' + parent.attr("childgroupid") + '"]');
                var currentGroup = parent,
                    currentChildSelected = childrenNodes.filter(".show-item").filter(":checked").length,
                    currentChildLength = childrenNodes.filter(".show-item").length;
                if (currentChildLength === currentChildSelected) {
                    currentGroup.prev().find("input").prop("checked", true);
                    this._updateParentSelected(parent);
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
            if (!this._getCheckboxesWithoutGroup(":not(:checked)").length) {
                this.$selectAll.prop("checked", true);
                //this.$listGroupCheckBox.prop("checked", true);
            }
        },

        _updateSelected: function () {
            var options = this.options,
                $inputs = this._getCheckboxesWithoutGroup(),
                $checked = $inputs.filter(":checked"),
                numChecked = $checked.length,
                value = "";

            if (numChecked === 0) {
                value = options.noneSelectedText;
            } else {
                if ($inputs.length === numChecked) {
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
                if (tooltipValue.length) {
                    this.$multiselect.attr("original-title", tooltipValue);
                    this.$multiselect.attr("title", tooltipValue);
                }
            }

            this.$buttonText.val(value);
            return value;
        },

        _getCheckboxesWithoutGroup: function (query) {
            return this.$checkboxContainer.find("li:not(.hide-item-global,.fanex-multiselect-li-group) label:not(.fanex-multiselect-group-mark) input[type=checkbox]" + (query || ""));
        },

        _getAllCheckboxes: function (query) {
            return this.$checkboxContainer.find("li:not(.hide-item-global) input[type=checkbox]" + (query || ""));
        },

        _showCheckboxes: function (items) {
            if (items.length) {
                this._showHideCheckboxes(true, items);
                this.disable(false);
            }
        },

        _hideCheckboxes: function (items) {
            if (items.length) {
                this._showHideCheckboxes(false, items);
                this.disable(this._getAllCheckboxes().length === 0);
            }
        },

        _showHideCheckboxes: function (value, checkboxes) {
            var me = this;
            checkboxes.each(function (_, checkbox) {
                checkbox.checked = value;
                me._showHideCheckboxParent(value, $(checkbox).closest(".rtLI"));
                //me._handleCheckboxClick($checkbox);
            });

            this._updateSelected();
            this._updateSelectAll();
        },

        _showHideCheckboxParent: function (value, li) {
            var contentText;
            if (value) {
                li.removeClass("hide-item-global");
                contentText = li.data("content-text-hide");
                li.attr("data-content-text", contentText).removeAttr("data-content-text-hide");
            } else {
                li.addClass("hide-item-global");
                contentText = li.data("content-text");
                li.attr("data-content-text-hide", contentText).removeAttr("data-content-text");
            }
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
