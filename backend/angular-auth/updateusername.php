<?php
// Enable CORS (Optional, for development purposes)
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

// Read data from POST request
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
$newName = isset($data['newName']) ? $conn->real_escape_string($data['newName']) : '';

// Check if email and new name are provided
if (empty($email) || empty($newName)) {
    echo json_encode(["status" => "error", "message" => "Email and new name are required."]);
    exit;
}

// Update the username in the database
$sql = "UPDATE users SET name = ? WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $newName, $email);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Username updated successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update username."]);
}

$stmt->close();
$conn->close();
?>
