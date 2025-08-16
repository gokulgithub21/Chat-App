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

// Check if email is provided
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Email is required."]);
    exit;
}

// Fetch user details (excluding avatar)
$sql = "SELECT name, email, phoneno FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();
    echo json_encode(["status" => "success", "user" => $user]);
} else {
    echo json_encode(["status" => "error", "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
