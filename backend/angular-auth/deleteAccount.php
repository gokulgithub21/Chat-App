<?php
// Enable CORS for API requests (Remove this in production)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

// Read incoming data
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';

// Validate input
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Email is required."]);
    exit;
}

// **Delete user-related data from all tables**
$conn->query("DELETE FROM contacts WHERE user_email = '$email' OR email = '$email'");
$conn->query("DELETE FROM group_members WHERE contact_id IN (SELECT id FROM contacts WHERE email = '$email')");
$conn->query("DELETE FROM groupchat WHERE created_by_email = '$email'");
$conn->query("DELETE FROM users WHERE email = '$email'");

// Check if the deletion was successful
if ($conn->affected_rows > 0) {
    echo json_encode(["status" => "success", "message" => "Account deleted successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "No data found for the given email."]);
}

// Close connection
$conn->close();
?>
