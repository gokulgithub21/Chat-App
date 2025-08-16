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

// Encryption key (must match save_message.php)
define('ENCRYPTION_KEY', hex2bin('29cff0977689e403bfdde64085875a3b2d0f5322c3a2ada85186bbb30251fa98'));  
define('ENCRYPTION_IV', '6374842587786268');

// Function to decrypt message
function decryptMessage($encryptedMessage) {
    return $encryptedMessage ? openssl_decrypt($encryptedMessage, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV) : null;
}

// Get parameters
$user_email = $_GET['user_email'] ?? '';
$contact_email = $_GET['contact_email'] ?? '';

if (empty($user_email) || empty($contact_email)) {
    echo json_encode(["status" => "error", "message" => "Missing user or contact email."]);
    exit;
}

// Fetch messages
$query = "SELECT id, sender_email, message, file_url, timestamp, deleted, deleted_at FROM messages 
          WHERE (sender_email = ? AND receiver_email = ?) 
          OR (sender_email = ? AND receiver_email = ?) 
          ORDER BY timestamp ASC";


$stmt = $conn->prepare($query);
$stmt->bind_param("ssss", $user_email, $contact_email, $contact_email, $user_email);
$stmt->execute();
$result = $stmt->get_result();

$messages = [];
while ($row = $result->fetch_assoc()) {
    $messages[] = [
        "id" => $row["id"],
        "sender_email" => $row["sender_email"],
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
