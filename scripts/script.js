

// Login Button
$("#login-btn").click(function() {
    var pseudo = $("#login_pseudo").val();
    var password = $("#login_password").val();

    // Connection fields empty
    if (isEmpty(pseudo) || isEmpty(password)) {
        alert("Veuillez compléter tout les champs de connexion !");
        return;
    }

    $.ajax({
        type: "POST",
        url: "php/login.php",
        data: {
            login_pseudo: pseudo,
            login_password: password
        },
        success: function(data) {
            let json = JSON.parse(data);

            // Mauvais login/password
            if (json === false) {
                alert("Mauvais Identifiants ou Mot de Passe");
                return;
            }

            showMap();
            alert("Connecté en tant que " + json.pseudo);
        }
    });
});

// Register Button
$("#register-btn").click(function() {
    var pseudo = $("#register_pseudo").val();
    var password = $("#register_password").val();
    var password_confirm = $("#register_password_confirm").val();

    // Register fields empty
    if (isEmpty(pseudo) || isEmpty(password) || isEmpty(password_confirm)) {
        alert("Veuillez compléter tout les champs d'inscription !");
        return;
    }

    // Passwords Differents
    if (password !== password_confirm) {
        alert("Les mots de passes sont différents !");
        return;
    }

    $.ajax({
        type: "POST",
        url: "php/register.php",
        data: {
            register_pseudo: pseudo,
            register_password: password,
            register_password_confirm: password_confirm
        },
        success: function(data) {
            console.log(data)

            // Cannot insert (pseudo duppliqué)
            if (data === '0') {
                alert("Ce nom d'utilisateur est déjà utilisé !");
                return;
            }

            showMap();
            alert("Connecté !");
        }
    });
});

function isEmpty(text) {
    return text.length === 0;
}

function hideMap() {
    $("#map-hider").css("z-index", "-1");
    $("#main").css("display", "block");
}

function showMap() {
    $("#map-hider").css("z-index", "-3");
    $("#main").css("display", "none");
}