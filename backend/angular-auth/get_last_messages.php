<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

error_reporting(E_ALL);
ini_set('display_errors', 1);

// Database Connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Define encryption key & IV (MUST MATCH YOUR ENCRYPTION SCRIPT)
define('ENCRYPTION_KEY', hex2bin('29cff0977689e403bfdde64085875a3b2d0f5322c3a2ada85186bbb30251fa98'));
define('ENCRYPTION_IV', '6374842587786268');

function decryptMessage($encryptedMessage) {
    return openssl_decrypt($encryptedMessage, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}

// ✅ Ensure user_email is provided
if (!isset($_GET['user_email'])) {
    echo json_encode(["status" => "error", "message" => "Missing user_email parameter"]);
    exit;
}

$user_email = $_GET['user_email'];

// ✅ Fetch last messages per contact
$sqlMessages = "SELECT sender_email, receiver_email, message, file_url, deleted, timestamp 
                FROM messages 
                WHERE receiver_email = ? OR sender_email = ? 
                ORDER BY timestamp DESC";

$stmtMessages = $conn->prepare($sqlMessages);
if (!$stmtMessages) {
    die(json_encode(["status" => "error", "message" => "SQL Error (Messages): " . $conn->error]));
}
$stmtMessages->bind_param("ss", $user_email, $user_email);
$stmtMessages->execute();
$messagesResult = $stmtMessages->get_result();

$lastMessages = [];
$contactLastMessage = [];

while ($row = $messagesResult->fetch_assoc()) {
    // ✅ Handle deleted messages
    if ($row['deleted']) {
        $row['message'] = "This message was deleted";
    } 
    // ✅ Handle file messages
    elseif (!empty($row['file_url'])) {
        $row['message'] = "📎 File Sent";
    }
    // ✅ Handle normal text messages
    else {
        $row['message'] = decryptMessage($row['message']);
    }

    // Identify the contact (other user in the conversation)
    $contactEmail = ($row['sender_email'] === $user_email) ? $row['receiver_email'] : $row['sender_email'];

    // Store only the most recent message per contact
    if (!isset($contactLastMessage[$contactEmail])) {
        $contactLastMessage[$contactEmail] = $row;
    }
}

// Convert associative array to indexed array
$lastMessages = array_values($contactLastMessage);

// ✅ Fetch last group messages with sender name
$sqlGroupMessages = "SELECT gm.group_id, gm.sender_email, u.name AS sender_name, gm.message, gm.file_url, gm.deleted, gm.timestamp 
                     FROM group_messages gm
                     JOIN users u ON gm.sender_email = u.email
                     ORDER BY gm.timestamp DESC";

$stmtGroupMessages = $conn->prepare($sqlGroupMessages);
if (!$stmtGroupMessages) {
    die(json_encode(["status" => "error", "message" => "SQL Error (Group Messages): " . $conn->error]));
}
$stmtGroupMessages->execute();
$groupMessagesResult = $stmtGroupMessages->get_result();

$lastGroupMessages = [];

while ($row = $groupMessagesResult->fetch_assoc()) {
    // ✅ Handle deleted messages
    if ($row['deleted']) {
        $row['message'] = $row['sender_name'] .": This message was deleted";
    } 
    // ✅ Handle file messages
    elseif (!empty($row['file_url'])) {
        $row['message'] = $row['sender_name'] .": 📎 File Sent";
    }
    // ✅ Handle normal text messages with sender name
    else {
        $row['message'] = $row['sender_name'] . ": " . decryptMessage($row['message']);
    }

    // Store only the most recent message per group
    if (!isset($lastGroupMessages[$row['group_id']])) {
        $lastGroupMessages[$row['group_id']] = $row;
    }
}

// ✅ Final JSON Response
echo json_encode([
    "status" => "success",
    "lastMessages" => $lastMessages,
    "lastGroupMessages" => $lastGroupMessages
]);

$conn->close();
?>