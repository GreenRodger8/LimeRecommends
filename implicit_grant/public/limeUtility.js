//Requires jQuery

limeUtility = (function () {
    let utility = {};

    utility.fillSelect = function fillSelect(selectQuery, optionArray) {
        for (option of optionArray) {
            htmlOption = '<option value=' + '\"' + option.value + '\"> ' + option.display + '</option>';
            $(selectQuery).append(htmlOption)
        }
    };

    return utility;
})();