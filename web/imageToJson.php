<?php

$dir = "./imagesCampagne";
$youpubers = [];


if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($youpuber = readdir($dh)) !== false) {
            if ($youpuber == '.' || $youpuber == '..') {
                continue;
            }
            list($idCampagne, $idYoupuber, $youpuber, $date, $codeImage) = split("_", $youpuber);
            $youpuberObj = new stdClass();
            $youpuberObj->id = $idYoupuber;
            $youpuberObj->youpuber = $youpuber;
            $youpuberObj->idCampagne = $idCampagne;
            $youpuberObj->date = $date;
            $youpuberObj->url = "/imagesCampagne/".$youpuber;

            array_push($youpubers, $youpuberObj);

        }
        $youpubers = json_encode($youpubers);
        print_r($youpubers);
        closedir($dh);
    }
} else {
    echo "Not dir";
}
