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

// Check database connection
if ($conn->connect_error) {
    echo json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]);
    exit;
}

// Parse incoming JSON request
$data = json_decode(file_get_contents("php://input"), true);

// Validate input data
$user_email = $data['user_email'] ?? null;
$group_id = $data['group_id'] ?? null;
$sender_email = $data['sender_email'] ?? null;

if (!$user_email) {
    echo json_encode(["status" => "error", "message" => "User email is required"]);
    exit;
}

try {
    // Handle group messages
    if ($group_id) {
        $sql = "UPDATE group_messages 
                SET read_status = 1 
                WHERE group_id = ? AND sender_email != ? AND read_status = 0";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("SQL preparation error: " . $conn->error);
        }
        $stmt->bind_param("is", $group_id, $user_email);
    } 
    // Handle direct messages
    else if ($sender_email) {
        $sql = "UPDATE messages 
                SET read_status = 1 
                WHERE receiver_email = ? AND sender_email = ? AND read_status = 0";
        $stmt = $conn->prepare($sql);
        if (!$stmt) {
            throw new Exception("SQL preparation error: " . $conn->error);
        }
        $stmt->bind_param("ss", $user_email, $sender_email);
    } else {
        echo json_encode(["status" => "error", "message" => "Sender email is required for direct messages"]);
        exit;
    }

    // Execute query and check result
    if ($stmt->execute()) {
        $affectedRows = $stmt->affected_rows;
        echo json_encode([
            "status" => "success",
            "message" => $affectedRows > 0 ? "Messages marked as read" : "No unread messages",
            "affectedRows" => $affectedRows
        ]);
    } else {
        throw new Exception("Failed to update messages: " . $stmt->error);
    }
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => $e->getMessage()]);
} finally {
    // Close the prepared statement and database connection
    if (isset($stmt)) {
        $stmt->close();
    }
    $conn->close();
}
?>
