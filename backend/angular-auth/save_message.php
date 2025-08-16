<?php

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

date_default_timezone_set("Asia/Kolkata");

// Database connection
$host = 'localhost';
$user = 'root';
$password = '';
$database = 'chatapp';

$conn = new mysqli($host, $user, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

$conn->query("SET time_zone = '+05:30'");
// Encryption key (must match get_messages.php)
define('ENCRYPTION_KEY', hex2bin('29cff0977689e403bfdde64085875a3b2d0f5322c3a2ada85186bbb30251fa98')); 
define('ENCRYPTION_IV', '6374842587786268');

// Function to encrypt message
function encryptMessage($message) {
    return openssl_encrypt($message, 'AES-256-CBC', ENCRYPTION_KEY, 0, ENCRYPTION_IV);
}

// Handle text message & file upload
$sender_email = $_POST['sender_email'] ?? '';
$sender_name = $_POST['sender_name'] ?? 'Unknown';
$message = $_POST['message'] ?? '';
$group_id = $_POST['group_id'] ?? null;
$receiver_email = $_POST['receiver_email'] ?? null;
$timestamp = date("Y-m-d H:i:s");

// **File Upload Handling** (Keep original filename)
$fileUrl = null;
if (!empty($_FILES['file']['name'])) {
    $targetDir = realpath(__DIR__) . "/uploads/msg_files/"; // ✅ Ensure correct path
    if (!file_exists($targetDir)) {
        mkdir($targetDir, 0777, true);
    }

    $fileName = basename($_FILES["file"]["name"]);
    $targetFilePath = $targetDir . $fileName;
    $fileType = strtolower(pathinfo($targetFilePath, PATHINFO_EXTENSION));

    // **Allowed file types**
    $allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'doc', 'docx', 'mp4', 'mp3', 'wav', 'txt', 'zip'];
    if (!in_array($fileType, $allowedTypes)) {
        echo json_encode(["status" => "error", "message" => "File type not allowed"]);
        exit;
    }

    if (move_uploaded_file($_FILES["file"]["tmp_name"], $targetFilePath)) {
        $fileUrl = "http://localhost/angular-auth/uploads/msg_files/" . $fileName; // ✅ Correct file path
    } else {
        echo json_encode(["status" => "error", "message" => "File upload failed"]);
        exit;
    }
}

// **Encrypt message only if it exists**
if (!empty($message)) {
    $message = encryptMessage($message);
}

// **Insert into database**
if ($group_id) {
    $query = "INSERT INTO group_messages (group_id, sender_email, sender_name, message, file_url, timestamp) VALUES (?, ?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("isssss", $group_id, $sender_email, $sender_name, $message, $fileUrl, $timestamp);
} elseif ($receiver_email) {
    $query = "INSERT INTO messages (sender_email, receiver_email, message, file_url, timestamp) VALUES (?, ?, ?, ?, ?)";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("sssss", $sender_email, $receiver_email, $message, $fileUrl, $timestamp);
} else {
    echo json_encode(["status" => "error", "message" => "Invalid request"]);
    exit;
}

// **Execute query**
if ($stmt->execute()) {
    $message_id = $stmt->insert_id;  // ✅ Get the message ID
    echo json_encode([
        "status" => "success",
        "fileUrl" => $fileUrl,
        "message_id" => $message_id,
        "timestamp" => $timestamp, 
        "message" => "Message sent successfully"
    ]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to save message: " . $stmt->error]);
}

$conn->close();
?>
