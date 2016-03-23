<?php

$dir = "./imagesCampagne";
$youpubers = [];


if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            list($idCampagne, $idYoupuber, $youpuber, $date, $codeImage) = split("_", $file);
            $youpuberObj = new stdClass();
            $youpuberObj->id = $idYoupuber;
            $youpuberObj->youpuber = $youpuber;
            $youpuberObj->idCampagne = $idCampagne;
            $youpuberObj->date = $date;
            $youpuberObj->url = "imagesCampagne/".$file;

            array_push($youpubers, $youpuberObj);

        }
        $youpubers = json_encode($youpubers);
        print_r($youpubers);
        closedir($dh);
    }
} else {
    echo "Not dir";
}
