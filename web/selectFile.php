<?php

$dir = "data";
$files = [];
// Open a directory, and read its contents
if (is_dir($dir)) {
    if ($dh = opendir($dir)) {
        while (($file = readdir($dh)) !== false) {
            if ($file == '.' || $file == '..') {
                continue;
            }
            
            $newFile = new stdClass();
            
            $year = substr($file, -8, 4);
            $month = substr($file, -4, 2);
            $day = substr($file, -2);
            $fileDate = $month."-".$day."-".$year;
            
            $newFile->file = $file;
            $newFile->date = $fileDate;
            
            array_push($files, $newFile);

        }
        $files = json_encode($files);
        print_r($files);
        closedir($dh);
    }
} else {
    echo "Not dir";
}
