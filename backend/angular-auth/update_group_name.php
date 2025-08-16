<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

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

// Get input values
$groupId = isset($_POST['group_id']) ? intval($_POST['group_id']) : 0;
$groupName = isset($_POST['group_name']) ? trim($_POST['group_name']) : '';

if ($groupId <= 0 || empty($groupName)) {
    echo json_encode(["status" => "error", "message" => "Invalid group ID or name."]);
    exit;
}

// Update group name in database
$sql = "UPDATE groupchat SET group_name = ? WHERE id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $groupName, $groupId);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Group name updated successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update group name."]);
}

$stmt->close();
$conn->close();
?>
