//Requires jQuery

limeUtility = (function () {
    let utility = {};

    utility.fillSelect = function fillSelect(selectQuery, optionArray) {
        for (option of optionArray) {
            htmlOption = '<option value=' + '\"' + option.value + '\"> ' + option.display + '</option>';
            $(selectQuery).append(htmlOption)
        }
    };

    utility.loopAjax = function loopAjax(options, onSuccess) {
        options.success = (response) => {
            let newOptions = onSuccess(options, response);
            if (newOptions === null) return;
            else $.ajax(newOptions);
        }
        $.ajax(options);
    };

    return utility;
})();