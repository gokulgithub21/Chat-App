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

$userEmail = isset($_GET['user_email']) ? $conn->real_escape_string($_GET['user_email']) : '';

if (empty($userEmail)) {
    echo json_encode(["status" => "error", "message" => "User email is required."]);
    exit;
}

// Fetch groups where the user is either the creator or a member
$sql = "SELECT g.id, g.group_name, g.group_description, g.group_avatar, 
               GROUP_CONCAT(DISTINCT c.email) AS group_members 
        FROM groupchat g 
        JOIN group_members gm ON g.id = gm.group_id 
        JOIN contacts c ON gm.contact_id = c.id
        WHERE c.email = ? OR g.created_by_email = ?
        GROUP BY g.id";

$stmt = $conn->prepare($sql);
$stmt->bind_param("ss", $userEmail, $userEmail);
$stmt->execute();
$result = $stmt->get_result();

$groups = [];
while ($row = $result->fetch_assoc()) {
    $groups[] = $row;
}

// Debugging: Log output
file_put_contents("debug_groups.log", print_r($groups, true));

echo json_encode(["status" => "success", "groups" => $groups]);

$stmt->close();
$conn->close();
?>
