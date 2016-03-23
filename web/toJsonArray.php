<?php

$array = array();
// recuperation du nom du fichier
$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$file = $request->file;
$inter = $request->inter;
//$file = "20160116";
//echo $file;
$fichier = fopen("data/".$file, "r");

// Lecture du fichier ligne par ligne
while (!feof($fichier)) {
    $ligne = trim(fgets($fichier));
    $lineRight = preg_match('#^[a-zA-Z0-9].*\s[0-9].*\s-?[0-9].*\s-?[0-9]#', $ligne);
    if ($ligne != "" || $lineRight === false) {
        $ligne = preg_replace('!\s+!', ' ', $ligne);
        list($name, $date, $lat, $lng) = split(" ", $ligne);


        $arrayDetails = array('date' => $date, 'latitud' => $lat, 'longitud' => $lng);
        $arrayName = array('name' => $name, 'details' => array());
        $currentName = $name;

        if (empty($array)) {
            array_push($array, $arrayName);
            array_push($array[0]['details'], $arrayDetails);
            $currentDate = $date;
        } else {
            if (!inArrayR($currentName, $array)) {
                array_push($array, $arrayName);
                $size = sizeof($array) -1;
                array_push($array[$size]['details'], $arrayDetails);
                $currentDate = $date;
            } else {
                for ($i = 0; $i< sizeof($array); $i++) {
                    if ($currentName == $array[$i]['name']) {
                        if ($date > $currentDate + $inter) {
                            $currentDate = $date;
                            array_push($array[$i]['details'], $arrayDetails);
                        }
                    }
                }
            }
        }
    }
}

    /*$details = new stdClass();
    $details->details = array();
    $arrayDetails = array('details' => array());
    $arrayInfo = array('date' => $date, 'latitud' => $lat, 'longitude' => $lng);
    $currentName = $name;
    $item1 = "";

    if(empty($array)) {
        $array = array($name => $details);
        array_push($details->details, $arrayInfo);
    } else {
        if (!objectExists($array, $currentName)){
          $array[$currentName] = array($name = $details);
          array_push($details->details, $arrayInfo);
        } else {
          $a = (object)$array;
          //print_r($a->$name);


        }
    }
  }
}
function objectExists($array, $name) {
    foreach($array as $item) {
      if (property_exists((object)$array, $name)){
          return true;
      } else {
          return false;
      }
    }
}*/
//fonction pour savoir si pair $cle $valeur existe dans un tableau
function inArrayR($var, $array, $strict = false)
{
    foreach ($array as $item) {
        if (($strict ? $item === $var : $item == $var) || (is_array($item) && inArrayR($var, $item, $strict))) {
            return true;
        }
    }
    return false;
}
// fermeture du fichier
fclose($fichier);
//encodage Json Array to String
$jsonArray = json_encode($array);
//envoie des données
echo $jsonArray;
