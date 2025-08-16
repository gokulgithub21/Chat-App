<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

$data = json_decode(file_get_contents("php://input"), true);
$user_email = isset($data['user_email']) ? $conn->real_escape_string($data['user_email']) : '';
$contact_email = isset($data['contact_email']) ? $conn->real_escape_string($data['contact_email']) : '';

if (empty($user_email) || empty($contact_email)) {
    echo json_encode(["status" => "error", "message" => "Missing email information."]);
    exit;
}

// Delete contact from database
$query = "DELETE FROM contacts WHERE user_email = '$user_email' AND email = '$contact_email'";
if ($conn->query($query)) {
    echo json_encode(["status" => "success", "message" => "Contact deleted."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to delete contact."]);
}

$conn->close();
?>
