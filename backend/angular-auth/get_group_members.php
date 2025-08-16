<?php
header("Access-Control-Allow-Origin: http://localhost:4200");
header("Access-Control-Allow-Methods: GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed."]));
}

$groupId = isset($_GET['group_id']) ? $conn->real_escape_string($_GET['group_id']) : '';

if (empty($groupId)) {
    echo json_encode(["status" => "error", "message" => "Group ID is required."]);
    exit;
}

// Fetch group creator details and description
$sql_creator = "SELECT g.group_description, u.name AS creator_name, u.email AS creator_email, u.avatar AS creator_avatar
                FROM groupchat g
                JOIN users u ON g.created_by_email = u.email
                WHERE g.id = ?";

$stmt_creator = $conn->prepare($sql_creator);
$stmt_creator->bind_param("i", $groupId);
$stmt_creator->execute();
$result_creator = $stmt_creator->get_result();
$creator = $result_creator->fetch_assoc();

// If creator is not found, set default values
if (!$creator) {
    $creator = [
        "creator_name" => "Unknown",
        "creator_email" => "",
        "creator_avatar" => "/default_profile.png",
        "group_description" => "No description available"
    ];
}

// Fetch group members with their contact_id (needed for removal)
$sql_members = "SELECT c.id AS contact_id, u.name, u.email, u.avatar 
                FROM group_members gm
                JOIN contacts c ON gm.contact_id = c.id
                JOIN users u ON c.email = u.email
                WHERE gm.group_id = ?";

$stmt_members = $conn->prepare($sql_members);
$stmt_members->bind_param("i", $groupId);
$stmt_members->execute();
$result_members = $stmt_members->get_result();

$members = [];
while ($row = $result_members->fetch_assoc()) {
    $members[] = [
        "id" => $row['contact_id'],  // Include the contact_id
        "name" => $row['name'],
        "email" => $row['email'],
        "avatar" => $row['avatar'] ?? "/default_profile.png"
    ];
}

// Return JSON response including group description
echo json_encode([
    "status" => "success",
    "creator" => $creator, 
    "description" => $creator["group_description"],  // Include the description
    "members" => $members  
]);

$stmt_creator->close();
$stmt_members->close();
$conn->close();
?>
