<?php
// Enable CORS (Optional, for development purposes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Start the session (if needed)
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Database credentials
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

// Create a database connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}
?>
