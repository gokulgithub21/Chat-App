<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

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
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Read input data
$data = json_decode(file_get_contents("php://input"), true);
$group_id = isset($data['group_id']) ? intval($data['group_id']) : 0;
$user_email = isset($data['user_email']) ? $conn->real_escape_string($data['user_email']) : '';

if (!$group_id || empty($user_email)) {
    echo json_encode(["status" => "error", "message" => "Invalid group ID or email"]);
    exit;
}

// Check if user exists in contacts
$sql = "SELECT id FROM contacts WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows == 0) {
    echo json_encode(["status" => "error", "message" => "User not found in contacts"]);
    exit;
}

$row = $result->fetch_assoc();
$contact_id = $row['id'];

// Check if user is already a member of the group
$sql = "SELECT * FROM group_members WHERE group_id = ? AND contact_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $group_id, $contact_id);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "User is already a group member"]);
    exit;
}

// Insert into group_members
$sql = "INSERT INTO group_members (group_id, contact_id) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $group_id, $contact_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "User added successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to add user"]);
}

$conn->close();
?>
