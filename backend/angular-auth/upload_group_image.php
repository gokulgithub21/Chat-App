<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Validate request
if (!isset($_FILES['image']) || !isset($_POST['group_id'])) {
    die(json_encode(["status" => "error", "message" => "Missing required data (image or group_id)."]));
}

$group_id = intval($_POST['group_id']); // Convert to integer
$target_dir = "uploads/group_images/";
if (!is_dir($target_dir)) {
    mkdir($target_dir, 0777, true);
}

// Generate unique filename
$file_name = uniqid() . "_" . basename($_FILES["image"]["name"]);
$target_file = $target_dir . $file_name;
$image_url = "http://localhost/angular-auth/" . $target_file;

// Move the uploaded file
if (move_uploaded_file($_FILES["image"]["tmp_name"], $target_file)) {
    // Debugging output
    error_log("Image uploaded to: " . $target_file);

    // Update database record
    $stmt = $conn->prepare("UPDATE groupchat SET group_avatar = ? WHERE id = ?");
    if (!$stmt) {
        error_log("Prepare statement failed: " . $conn->error); // Log database preparation error
        die(json_encode(["status" => "error", "message" => "Prepare statement failed: " . $conn->error]));
    }

    $stmt->bind_param("si", $image_url, $group_id);
    if ($stmt->execute()) {
        if ($stmt->affected_rows > 0) {
            echo json_encode(["status" => "success", "imageUrl" => $image_url]);
        } else {
            error_log("No rows affected. Group ID might not exist or already have the same image URL.");
            echo json_encode(["status" => "error", "message" => "No rows affected. Check if the Group ID exists."]);
        }
    } else {
        error_log("Database update failed: " . $stmt->error); // Log database execution error
        die(json_encode(["status" => "error", "message" => "Database update failed: " . $stmt->error]));
    }

    $stmt->close();
} else {
    error_log("File upload failed.");
    die(json_encode(["status" => "error", "message" => "File upload failed."]));
}

$conn->close();
?>
