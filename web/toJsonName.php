<?php

$details = array();
$obj = new stdClass();

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$file = $request->file;
$usr = $request->name;
$inter = $request->inter;
$index = 0;
$currentDate = 0;

$fichier = fopen("data/".$file, "r");

// Lecture du fichier ligne par ligne
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    
    //filtrage par fichier mal formaté
    $lineRight = preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne);
    if ($ligne != "" || $lineRight === false) {
        $ligne = preg_replace('!\s+!', ' ', $ligne);
        list($name, $date, $lat, $lng) = split(" ", $ligne);

        // filtrage par youpuber
        if ($name == $usr) {
            $arrayDetails = array('date' => $date, 'latitud' => $lat, 'longitud' => $lng);
            $arrayName = array('name' => $name, 'details' => array());
            $currentName = $name;
            
            //filtrage des points chaque minute
            if ($index == 0) {
                array_push($details, $arrayDetails);
                $currentDate = $date;
            }
            if ($index != 0 && $date > $currentDate + $inter) {
                $currentDate = $date;
                array_push($details, $arrayDetails);
            }
            $index++;
        }
        $obj->name = $usr;
        $obj->details = $details;
        
    }
}


// fermeture du fichier
fclose($fichier);
//encodage Json Array to String
$jsonObj = json_encode($obj);
//envoie des données
echo $jsonObj;
