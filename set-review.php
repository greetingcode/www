<?php
/********************************************
//set-review.php
https://griffis.edumedia.ca/mad9022/reviewr/reviews/set/

Author: 	Steve Griffith
Updated: 	Feb 28, 2016
Description: 
Connect to the mad9022_w16 database and
insert, update, or delete a single review that 
matches a specific UUID as determined by the 
Cordova device plugin plus the review_id

Requires
$_POST['UUID'] - from Cordova
$_POST['action'] - insert | update | delete

For update and delete
$_POST['review_id']

For insert and update
$_POST['title'] - varchar 40
$_POST['review_txt'] - varchar 255
$_POST['rating'] - integer 1 - 5
$_POST['img'] - base64 encoded string - Text


********************************************/
require_once("includes/db.inc.php");


function respond($data, $code, $msg) {
    header("Content-type: application/json");
	echo '{"code":' . $code . ',"message":"'. $msg .'", "review_details":';
    echo json_encode($data);
	echo '}';
	$pdo = null;
	exit();
}

if (isset($_POST['uuid']) && !empty($_POST['uuid']) && isset($_POST['action']) && in_array($_POST['action'], array("insert","update","delete")) ) {
	$action = trim($_POST['action']);
	
	switch($action){
		case 'delete':
			if(isset($_POST['review_id']) && ctype_digit($_POST['review_id']) ){
				$rs = $pdo->prepare("DELETE FROM reviews WHERE uuid=? AND review_id=? LIMIT 1");
    			$rs->execute(array(trim($_POST['uuid']), (int) $_POST['review_id'] ));
				$count = $rs->rowCount();
				if($count == 0){
					respond(array(), 0, "Review no longer exists.");
				}else{
					respond(array(), 0, "Review has been removed.");
				}
			}else{
				respond(array(), 222, "Missing required parameters.");
			}
			break;
		case 'insert':
			if(isset($_POST['title']) && isset($_POST['review_txt']) && isset($_POST['img']) && isset($_POST['rating']) && ctype_digit($_POST['rating']) ){
				
				$rs = $pdo->prepare("INSERT INTO reviews(uuid, title, review_txt, rating, img) VALUES(?, ?, ?, ?, ?)");
				$uuid = trim($_POST['uuid']);
				$title = trim($_POST['title']);
				$review_txt = trim($_POST['review_txt']);
				$rating = (int) $_POST['rating'];
				$img = $_POST['img'];
				$img = preg_replace('/\s/',  '+', $img);
				
    			$rs->execute(array($uuid, $title, $review_txt, $rating, $img));
				if($rs && $rs->rowCount() == 1){
					//
					$id = $pdo->lastInsertId();
					respond(array("id"=>(int) $id, "title"=>$title), 0, "Review $id has been added.");
				}else{
					$arr = $rs->errorInfo();
					respond(array(), 333, "DB Error: Failed to add new review. " . $arr[1] . " " . $arr[2]);
				}
			}else{
				respond(array(), 222, "Missing required parameters.");
			}
			break;
		case 'update':
			if(isset($_POST['review_id']) && ctype_digit($_POST['review_id']) && isset($_POST['title']) && isset($_POST['review_txt']) && isset($_POST['img']) && isset($_POST['rating']) && ctype_digit($_POST['rating']) ){
				
				$rs = $pdo->prepare("UPDATE reviews SET title=?, review_txt=?, rating=?, img=? WHERE review_id=? and uuid=?");
    			$rs->execute(array($_POST['title'], $_POST['review_txt'], (int) $_POST['rating'], $_POST['img'], (int)$_POST['review_id'], trim($_POST['uuid'])));
				if($rs && $rs->rowCount() == 1){
					respond(array(), 0, "Review has been updated.");
				}else{
					respond(array(), 333, "DB Error: Failed to update review");
				}
			}else{
				respond(array(), 222, "Missing required parameters.");
			}
			break;
	
	}
    
}else{
	respond(array(), 222, "Missing required parameters.");
}
?>