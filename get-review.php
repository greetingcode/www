<?php
/********************************************
//get-review.php
https://griffis.edumedia.ca/mad9022/reviewr/review/get/

Author: 	Steve Griffith
Updated: 	Feb 28, 2016
Description: 
Connect to the mad9022_w16 database and
return the details for a single review that matches 
a specific UUID as determined by the Cordova device 
plugin plus the review_id

Requires
$_POST['uuid']
$_POST['review_id']

Returns JSON object with: 
code - 			0 if no problems
message - 		text message

review_id - 	int 
title - 		string
desc - 			string description
rating - 		int 1 to 5
img - 			base64 string for thumbnail image

********************************************/
require_once("includes/db.inc.php");

function respond($data, $code, $msg) {
    header("Content-type: application/json");
	//header("Content-type: text/plain");
	//echo json_encode($data);
	echo '{"code":' . $code . ',"message":"'. $msg .'", "review_details":';
    echo json_encode($data);
	echo '}';
	exit();
}

if (isset($_POST['uuid']) && !empty($_POST['uuid']) && isset($_POST['review_id']) && ctype_digit($_POST['review_id']) ) {
	
    $rs = $pdo->prepare("SELECT * FROM reviews WHERE uuid=? AND review_id=? LIMIT 1");
    $rs->execute(array(trim($_POST['uuid']), intval($_POST['review_id']) ));
	
	if($rs){
		$row = $rs->fetch(PDO::FETCH_ASSOC);
		//$img = preg_replace('/\+/',  ' ', $row['img']);
		$img = strval($row['img']);
		
		$output = array(
			"id" => intval($row["review_id"]),
			"title" => strval($row["title"]),
			"review_txt" => strval($row["review_txt"]),
			"rating" => intval($row["rating"]),
			"img" => $img
		);
			
		respond($output, 0, "All the details for the review.");
	}else{
		respond(array(), 333, "Failed to retrieve a matching review for your device.");	
	}
}else{
	respond(array(), 222, "Missing required parameters.");
}

?>