
<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");



// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";
$conn = new mysqli($host, $username, $password, $database);

if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

// Get input data
$data = json_decode(file_get_contents("php://input"), true);
$group_id = isset($data['group_id']) ? $data['group_id'] : '';
$contact_id = isset($data['contact_id']) ? $data['contact_id'] : '';

// Log to check if values are being passed correctly
error_log("Received group_id: $group_id, contact_id: $contact_id");

if (empty($group_id) || empty($contact_id)) {
    echo json_encode(["status" => "error", "message" => "Missing required fields: group_id or contact_id."]);
    exit;
}

// Remove the member from the group
$sql = "DELETE FROM group_members WHERE group_id = ? AND contact_id = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("ii", $group_id, $contact_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Member removed successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to remove member."]);
}

$stmt->close();
$conn->close();
?>
