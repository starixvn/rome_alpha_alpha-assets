(function () {
    var languageElId = '#language',
        dataKey = 'currentlanguage',
        language = window.$(languageElId).data(dataKey)
            || window.parent.$(languageElId).data(dataKey)
            || window.top.$(languageElId).data(dataKey),
        locale = {
            'en-US': 'en',
            'ja-JP': 'ja',
            'ko-KR': 'ko',
            'th-TH': 'th',
            'vi-VN': 'vi',
            'zh-CN': 'zh-cn',
            'zh-TW': 'zh-tw',
            'default': 'en'
        };

    moment.locale(locale[language] || locale.default);
})();