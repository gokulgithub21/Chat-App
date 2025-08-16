<?php
session_start(); // Start session

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

if (isset($_SESSION['user_email'])) {
    echo json_encode(["status" => "success", "email" => $_SESSION['user_email']]);
} else {
    echo json_encode(["status" => "error", "message" => "No active session found."]);
}
?>
