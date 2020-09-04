//Requires jQuery

limeRequest = (function () {
    let limeRequest = {};

    limeRequest.getCurators = function getCurators(onSuccess) {
        $.ajax({
            type: "GET",
            url: '/curators/',
            success: onSuccess
        });
    };

    limeRequest.putCurator = function putCurator(access_token, onSuccess) {
        $.ajax({
            type: "PUT",
            url: '/curator/',
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            success: onSuccess
        });
    };

    limeRequest.getRecommendation = function getRecommendation(access_token, selectedOption, onSuccess) {
        $.ajax({
            type: "GET",
            url: '/recommendation/' + selectedOption,
            headers: {
                'Authorization': 'Bearer ' + access_token
            },
            dataType: "json",
            success: onSuccess
        });
    };

    return limeRequest;
})();