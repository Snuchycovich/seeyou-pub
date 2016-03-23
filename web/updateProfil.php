<?php

$postdata = file_get_contents("php://input");
$request = json_decode($postdata);
$youpuber = $request->youpuber;
$route = $request->route;
/*$youpuber = $_POST['youpuber'];
$route = $_POST['route'];*/

/*$file = fopen("jsonData/profiles.json", "a+") or die("Unable to open file!");
$profiles = [];
$profile = new stdClass();
//$profile->youpuber = $youpuber;
$profile->data = $route;

array_push($profiles, $profile);
$profiles = json_encode($profiles);
fwrite($file, $profiles);
fclose($file);*/
appendToFile("jsonData/profiles.json", $route);
exec("find jsonData/profiles.json -type f -exec chmod 0644 {} +");
echo "ok";
//print_r($profiles);

function appendToFile($file, $data = "")
{
    if (file_exists($file)) {
        $inp = file_get_contents($file);
        $data = json_decode($data);
        $tempArray = json_decode($inp, true);
        
        if (isset($tempArray) && !empty($tempArray)) {
            foreach ($tempArray as $key => $youpuber) {
                //print_r($youpuber['name']);
                if ($youpuber['name'] == $data->name) {
                    unset($tempArray[$key]);
                }
            }
            print_r($tempArray);
            array_push($tempArray, $data);
        } else {
            $tempArray=[$data];
        }
            
        $jsonData = json_encode($tempArray);
        file_put_contents($file, $jsonData);
    } else {
        echo json_encode(["error"=>"not exists"]);
    }
}
