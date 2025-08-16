<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

date_default_timezone_set('Asia/Kolkata');
// ✅ Database connection
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'chatapp';

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// ✅ Read JSON input
$inputJSON = file_get_contents('php://input');
$input = json_decode($inputJSON, true);

if (!$input || !isset($input['messageIds'])) {
    echo json_encode(["status" => "error", "message" => "Invalid request. No message IDs provided."]);
    exit;
}

// ✅ Decode message IDs
$messageIds = json_decode($input['messageIds'], true);
if (!is_array($messageIds) || count($messageIds) === 0) {
    echo json_encode(["status" => "error", "message" => "No valid message IDs found."]);
    exit;
}


$deletedText = "This message was deleted";
$deletionTime = date("Y-m-d H:i:s"); // ✅ Correct timestamp format

// ✅ Convert array to SQL placeholders
$placeholders = implode(',', array_fill(0, count($messageIds), '?'));
$query = "UPDATE messages SET message = ?, file_url = NULL, deleted = 1, deleted_at = ? WHERE id IN ($placeholders)";

$stmt = $conn->prepare($query);
if (!$stmt) {
    echo json_encode(["status" => "error", "message" => "SQL prepare failed: " . $conn->error]);
    exit;
}

$types = "ss" . str_repeat('i', count($messageIds));
$params = array_merge([$deletedText, $deletionTime], $messageIds);

// ✅ Dynamically bind parameters
$stmt->bind_param($types, ...$params);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Messages marked as deleted"]);
} else {
    echo json_encode(["status" => "error", "message" => "Deletion failed: " . $stmt->error]);
}

$stmt->close();
$conn->close();
?>
