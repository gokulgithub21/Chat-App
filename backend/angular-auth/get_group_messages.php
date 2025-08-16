<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Database connection
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'chatapp';

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed"]));
}

// Encryption key (must match save_message.php)
define('ENCRYPTION_KEY', hex2bin('29cff0977689e403bfdde64085875a3b2d0f5322c3a2ada85186bbb30251fa98')); 
define('ENCRYPTION_IV', '6374842587786268');

// Function to decrypt message
function decryptMessage($encryptedMessage) {
    return $encryptedMessage ? openssl_decrypt($encryptedMessage, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV) : null;
}

// Validate group ID
if (!isset($_GET['group_id'])) {
    echo json_encode(["status" => "error", "message" => "Missing group ID"]);
    exit;
}

$group_id = intval($_GET['group_id']);

// Fetch group messages
$query = "SELECT gm.id, gm.sender_email, gm.message, gm.file_url, gm.timestamp, gm.deleted, gm.deleted_at, u.name AS sender_name 
          FROM group_messages gm 
          JOIN users u ON gm.sender_email = u.email
          WHERE gm.group_id = ? 
          ORDER BY gm.timestamp ASC";


$stmt = $conn->prepare($query);
$stmt->bind_param("i", $group_id);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = [
        "id" => $row["id"],
        "sender_email" => $row["sender_email"],
        "sender_name" => $row["sender_name"],
        "message" => (isset($row["deleted"]) && $row["deleted"] == 1) ? "This message was deleted" : decryptMessage($row["message"]),
        "file_url" => (!empty($row["file_url"]) && (!isset($row["deleted"]) || $row["deleted"] == 0)) 
            ? "http://localhost/angular-auth/uploads/msg_files/" . basename($row["file_url"]) 
            : null,
           "timestamp" => $row["timestamp"],
        "deleted" => (int) $row["deleted"],
        "deleted_at" => $row["deleted_at"]
    ];
    
}

echo json_encode(["status" => "success", "messages" => $messages]);

$conn->close();
?>
