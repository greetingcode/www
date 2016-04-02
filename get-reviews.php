<?php
/********************************************
//get-reviews.php
https://griffis.edumedia.ca/mad9022/reviewr/reviews/get/

Author: 	Steve Griffith
Updated: 	Feb 28, 2016
Description: 
Connect to the mad9022_w16 database and
return the id, title and rating for all the reviews 
that match a specific UUID as determined by 
the Cordova device plugin

Requires
$_POST['uuid']

Returns JSON object with 
code - 0 if no problems
message - text message
reviews - Array of objects with review_id, title, and rating ONLY

********************************************/
require_once("includes/db.inc.php");

function respond($data, $code, $msg) {
    header("Content-type: application/json");
	echo '{"code":' . $code . ',"message":"'. $msg .'", "reviews":';
    echo json_encode($data);
	echo '}';
	exit();
}


if (isset($_REQUEST['uuid']) && !empty($_REQUEST['uuid']) ) {
	
    $rs = $pdo->prepare("SELECT review_id, title, rating FROM reviews WHERE uuid=?");
    $rs->execute(array(trim($_REQUEST['uuid'])));
	
	if($rs){
		if($rs->rowCount() > 0){
			$rows = $rs->fetchAll(PDO::FETCH_ASSOC);
			$output = array_map(function($row) {
				return array(
					"id" => (int) $row["review_id"],
					"title" => (string) $row["title"],
					"rating" => (int) $row["rating"] 
				);
			}, $rows);
			respond($output, 0, "All the reviews for your device.");
		}else{
			respond(array(), 0, "No reviews available for your device.");
		}
	}else{
		respond(array(), 333, "Failed to retrieve reviews for your device.");	
	}
}else{
	respond(array(), 222, "Missing required parameters.");
}
?>