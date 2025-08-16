<?php
// Enable CORS (For development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Database connection
$host = "localhost";
$username = "root"; 
$password = ""; 
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Get data from Angular request
$data = json_decode(file_get_contents("php://input"), true);
$name = isset($data['name']) ? $conn->real_escape_string($data['name']) : '';
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
$user_email = isset($data['user_email']) ? $conn->real_escape_string($data['user_email']) : ''; // Logged-in user's email

// Validate inputs
if (empty($name) || empty($email) || empty($user_email)) {
    echo json_encode(["status" => "error", "message" => "Name, email, and user email are required."]);
    exit;
}

// Check if the email exists in the users table
$check_user_sql = "SELECT email FROM users WHERE email = ?";
$stmt = $conn->prepare($check_user_sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$user_result = $stmt->get_result();

if ($user_result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "User not found."]);
    exit;
}

// Check if the contact already exists in the contacts table for the given user
$check_contact_sql = "SELECT id FROM contacts WHERE email = ? AND user_email = ?";
$stmt = $conn->prepare($check_contact_sql);
$stmt->bind_param("ss", $email, $user_email);
$stmt->execute();
$contact_result = $stmt->get_result();

if ($contact_result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Contact already exists."]);
    exit;
}

// Insert contact into database with the user's email
$sql = "INSERT INTO contacts (name, email, user_email) VALUES (?, ?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("sss", $name, $email, $user_email);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Contact saved."]);
} else {
    echo json_encode(["status" => "error", "message" => "Error: " . $conn->error]);
}

// Close connection
$stmt->close();
$conn->close();
?>
