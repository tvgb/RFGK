//Loads the modal from the static loginModal.html and toggles it.
$("#loginNavLinkId").click(function () {
    $("#modalDiv").load("static/static_html/loginModal.html", function () {
        $("#loginModal").modal('toggle');
    });
});

$("body").on('click', '#loginButton', function(){
    let email = $("#email").val();
    let password = $("#password").val();

    if (email !== "" && password !== "") {
        login(preformLogin, email, password);
    }
});


//If the login is successful the returned token is added to the session storage.
function preformLogin(data) {
    if (data.message === "Auth successful") {
        window.sessionStorage.setItem('token', data.token);
        $("#adminTab").show();
        $('#loginModal').modal('toggle');
    } else {
        $("#wrongPwOrEmailAlert").show();
    }
}

$("body").on('focus', '#password', function () {
    $("#wrongPwOrEmailAlert").hide();
});
$("body").on('focus', '#email', function () {
    $("#wrongPwOrEmailAlert").hide();
});


//Show the Admin tab if a token is saved in the sessions storage
if (window.sessionStorage.getItem('token') !== null) {
    $("#adminTab").show();
}
