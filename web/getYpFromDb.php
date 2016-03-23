<?php

$youPubersArray = [];
$youPuberObj = new stdClass();

$servername = "localhost";
$username = "root";
$password = "Chateau47";

try {
    $conn = new PDO("mysql:host=$servername;dbname=seeyoupub-old", $username, $password);
    // set the PDO error mode to exception
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $stmt = $conn->prepare(
        "SELECT LoginYP.IdYouPuber, LoginYP.Login, InfosYP.Adresse, InfosYP.CP, InfosYP.Ville, InfosYP.Parking 
    FROM LoginYP INNER JOIN InfosYP ON LoginYP.IdYouPuber = InfosYP.IdYouPuber ORDER BY Login"
    );
    $stmt->execute();

    $res = $stmt->setFetchMode(PDO::FETCH_ASSOC);
    foreach (new RecursiveArrayIterator($stmt->fetchAll()) as $k => $v) {
        
        $login = trim(mb_convert_encoding($v['Login'], 'utf-8', 'HTML-ENTITIES'));
        $youPuberObj->$login = new stdClass();
        $youPuberObj->$login->youpuber = trim(mb_convert_encoding($v['Login'], 'utf-8'));
        $youPuberObj->$login->adresse = trim(mb_convert_encoding($v['Adresse'], 'utf-8'));
        $youPuberObj->$login->cp = trim($v['CP']);
        $youPuberObj->$login->ville = trim(mb_convert_encoding($v['Ville'], 'utf-8'));
        $youPuberObj->$login->parking = trim(mb_convert_encoding($v['Parking'], 'utf-8'));

        /*$youPuberObj->id = $v['IdYouPuber'];
        $youPuberObj->login = mb_convert_encoding($v['Login'], 'utf-8');
        $youPuberObj->adresse = mb_convert_encoding($v['Adresse'], 'utf-8');
        $youPuberObj->cp = $v['CP'];
        $youPuberObj->Ville = mb_convert_encoding($v['Ville'], 'utf-8');
        $youPuberObj->Parking = mb_convert_encoding($v['Parking'], 'utf-8');*/

        //array_push($youPubersArray, $youPuberObj);
    }
    //var_dump(json_encode($youPubersArray));
    print_r(json_encode($youPuberObj));
    

    //echo "Connected successfully";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
$conn = null;
