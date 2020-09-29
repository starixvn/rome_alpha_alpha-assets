(function () {
    var languageElId = '#language',
        dataKey = 'currentlanguage',
        language = window.$(languageElId).data(dataKey)
            || window.parent.$(languageElId).data(dataKey)
            || window.top.$(languageElId).data(dataKey);

    switch (language) {
        case 'en-US':
            moment.locale('en');
            break;
        case 'ja-JP':
            moment.locale('ja');
            break;
        case 'ko-KR':
            moment.locale('ko');
            break;
        case 'th-TH':
            moment.locale('th');
            break;
        case 'vi-VN':
            moment.locale('vi');
            break;
        case 'zh-CN':
            moment.locale('zh-cn');
            break;
        case 'zh-TW':
            moment.locale('zh-tw');
            break;
        default:
            moment.locale('en');
            break;
    }
})();