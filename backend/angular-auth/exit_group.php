<?php
// Allow CORS for frontend communication
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// ✅ Check connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// ✅ Read JSON data from POST request
$data = json_decode(file_get_contents("php://input"), true);
$group_id = $data['group_id'] ?? null;
$user_email = $data['user_email'] ?? null;

// ✅ Validate input
if (!$group_id || !$user_email) {
    echo json_encode(["status" => "error", "message" => "Group ID and User Email are required."]);
    exit;
}

// ✅ Check if user exists in contacts
$query_user = "SELECT id FROM contacts WHERE email = ?";
$stmt_user = $conn->prepare($query_user);
$stmt_user->bind_param("s", $user_email);
$stmt_user->execute();
$result_user = $stmt_user->get_result();
$user = $result_user->fetch_assoc();

if (!$user) {
    echo json_encode(["status" => "error", "message" => "User not found in contacts."]);
    exit;
}

$contact_id = $user['id'];

// ✅ Check if user is the group creator
$query_creator = "SELECT created_by_email FROM groupchat WHERE id = ?";
$stmt_creator = $conn->prepare($query_creator);
$stmt_creator->bind_param("i", $group_id);
$stmt_creator->execute();
$result_creator = $stmt_creator->get_result();
$group = $result_creator->fetch_assoc();

if (!$group) {
    echo json_encode(["status" => "error", "message" => "Group not found."]);
    exit;
}

if ($group['created_by_email'] === $user_email) {
    echo json_encode(["status" => "error", "message" => "Group creators cannot exit the group."]);
    exit;
}

// ✅ Remove user from `group_members` table
$delete_member_sql = "DELETE FROM group_members WHERE group_id = ? AND contact_id = ?";
$stmt = $conn->prepare($delete_member_sql);
$stmt->bind_param("ii", $group_id, $contact_id);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Exit from the group successfully."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to exit from the group."]);
}

// ✅ Close connection
$conn->close();
?>
