<?php
header("Access-Control-Allow-Origin: http://localhost:4200"); 
header("Access-Control-Allow-Methods: POST, GET, OPTIONS, DELETE, PUT"); 
header("Access-Control-Allow-Headers: Content-Type, Authorization");


// groupchat.php

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

// Create a connection
$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

// Read incoming data (POST request)
$data = json_decode(file_get_contents("php://input"), true);

// Validate required fields
if (empty($data['groupName']) || empty($data['userEmail']) || empty($data['selectedContacts'])) {
    echo json_encode(["status" => "error", "message" => "Missing required fields."]);
    exit;
}

// Get group name, description, and selected contacts
$groupName = $conn->real_escape_string($data['groupName']);
$groupDescription = $conn->real_escape_string($data['groupDescription']);
$userEmail = $conn->real_escape_string($data['userEmail']);
$selectedContacts = $data['selectedContacts']; // This is an array of contact ids

// Create the group in the database
$sql = "INSERT INTO groupchat (group_name, group_description, created_by_email) VALUES ('$groupName', '$groupDescription', '$userEmail')";
if ($conn->query($sql) === TRUE) {
    $groupId = $conn->insert_id; // Get the last inserted group id

    // Now add the contacts to the group (create group-members relationship)
    foreach ($selectedContacts as $contactId) {
        $sqlMember = "INSERT INTO group_members (group_id, contact_id) VALUES ($groupId, $contactId)";
        $conn->query($sqlMember);
    }

    echo json_encode(["status" => "success", "message" => "Group created successfully"]);
} else {
    echo json_encode(["status" => "error", "message" => "Error creating group: " . $conn->error]);
}

$conn->close();
?>

