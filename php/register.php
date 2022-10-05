    <?php

define('HOST', 'localhost');
define('DB_NAME', 'lp_iot');
define('USER', 'lp_iot');
define('PASS', '');


try {
    $db = new PDO("mysql:host=" . HOST . ';dbname=' . DB_NAME, USER, PASS);
    $db -> setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

    $prepare = $db->prepare("INSERT INTO user (pseudo, password) VALUES (?, ?);");
    $prepare->execute(array($_POST['register_pseudo'], $_POST['register_password']));

    $bool = $prepare->fetch();

    echo 1;
} catch (PDOException $error) {
    echo 0;
}
?>