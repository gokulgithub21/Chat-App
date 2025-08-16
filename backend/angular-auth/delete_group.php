<?php
// Allow CORS for frontend communication
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");
header("Content-Type: application/json");

// Handle preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0); // End the preflight request
}

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

// Read JSON data from the POST request
$data = json_decode(file_get_contents("php://input"), true);

// Get the group ID and user email from the request
$group_id = $data['group_id'] ?? null;
$user_email = $data['user_email'] ?? null;  // Ensure that user_email is passed from frontend

if (!$group_id || !$user_email) {
    echo json_encode(['status' => 'error', 'message' => 'Group ID and User Email are required.']);
    exit;
}

// Query to get the group creator's email
$query = "SELECT created_by_email FROM groupchat WHERE id = ?";
$stmt = $conn->prepare($query);
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();
$group = $result->fetch_assoc();

if (!$group) {
    echo json_encode(['status' => 'error', 'message' => 'Group not found.']);
    exit;
}

// Check if the logged-in user is the creator of the group
if ($group['created_by_email'] !== $user_email) {
    echo json_encode(['status' => 'error', 'message' => 'You are not the creator of this group.']);
    exit;
}

// Begin transaction to ensure both actions (delete group and delete group members) are executed atomically
$conn->begin_transaction();

try {
    // Step 1: Delete the group from the groupchat table
    $delete_group_sql = "DELETE FROM groupchat WHERE id = ?";
    $stmt = $conn->prepare($delete_group_sql);
    $stmt->bind_param("i", $group_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete group: " . $stmt->error);
    }

    // Step 2: Optionally delete members from the group_members table
    $delete_members_sql = "DELETE FROM group_members WHERE group_id = ?";
    $stmt = $conn->prepare($delete_members_sql);
    $stmt->bind_param("i", $group_id);
    if (!$stmt->execute()) {
        throw new Exception("Failed to delete group members: " . $stmt->error);
    }

    // Commit the transaction
    $conn->commit();
    echo json_encode(['status' => 'success', 'message' => 'Group and its members deleted successfully.']);
} catch (Exception $e) {
    // If an error occurs, rollback the transaction
    $conn->rollback();
    echo json_encode(['status' => 'error', 'message' => 'Failed to delete the group. Error: ' . $e->getMessage()]);
}
?>
