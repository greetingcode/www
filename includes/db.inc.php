<?php
session_start();
ini_set('auto_detect_line_ending', 1);

$dbname = "mad9022_w16";
$dbuser = "mad9022_w16";
$dbpass = "deadpool";
$dbhost = "localhost";

try{
	$pdo = new PDO("mysql:host=" . $dbhost . ";charset=utf8;dbname=" . $dbname, $dbuser, $dbpass);
}catch( PDOException  $err ){
	//write error message to user
	header("Content-type", "application/json");
	echo '{"code":111, "message":"Unable to connect to database"}';
	exit();
}

?>