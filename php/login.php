<?php

define('HOST', 'localhost');
define('DB_NAME', 'lp_iot');
define('USER', 'lp_iot');
define('PASS', '');


try {
    $db = new PDO("mysql:host=" . HOST . ';dbname=' . DB_NAME, USER, PASS);
    $db -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $prepare = $db->prepare("SELECT * FROM user WHERE pseudo = ? AND password = ?;");
    $prepare->execute(array($_POST['login_pseudo'], $_POST['login_password']));

    $tab = $prepare->fetch();

    echo json_encode([$tab][0]);
} catch (PDOException $error) {
    echo $error;
}
?>