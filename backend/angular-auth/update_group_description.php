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

// Check if data is coming from JSON or POST
$data = json_decode(file_get_contents("php://input"), true);

if ($_SERVER["REQUEST_METHOD"] === "POST" && isset($_POST['group_id']) && isset($_POST['group_description'])) {
    $group_id = $conn->real_escape_string($_POST['group_id']);
    $group_description = $conn->real_escape_string($_POST['group_description']);
} elseif (!empty($data['group_id']) && !empty($data['group_description'])) {
    $group_id = $conn->real_escape_string($data['group_id']);
    $group_description = $conn->real_escape_string($data['group_description']);
} else {
    echo json_encode(["status" => "error", "message" => "Missing group ID or description."]);
    exit;
}

// Update group description
$query = "UPDATE groupchat SET group_description = '$group_description' WHERE id = '$group_id'";

if ($conn->query($query) === TRUE) {
    echo json_encode(["status" => "success", "message" => "Group description updated."]);
} else {
    echo json_encode(["status" => "error", "message" => "Failed to update description."]);
}

$conn->close();
?>
