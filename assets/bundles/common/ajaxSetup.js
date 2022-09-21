$(() => {
    $.ajaxSetup({
        error: function (xhr) {
            switch (xhr.status) {
                case 429:
                    alert('Too many requests');
                    break;
            }
        }
    });
});