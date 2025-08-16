<?php
// Enable CORS (For development)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET");
header("Content-Type: application/json");

// Database connection
$host = "localhost";
$username = "root"; 
$password = ""; 
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Get user email from request
$user_email = isset($_GET['user_email']) ? $conn->real_escape_string($_GET['user_email']) : '';

if (empty($user_email)) {
    echo json_encode(["status" => "error", "message" => "User email is required."]);
    exit;
}

// Fetch contacts with their profile images
$sql = "SELECT c.id, c.name, c.email, u.avatar 
        FROM contacts c 
        JOIN users u ON c.email = u.email 
        WHERE c.user_email = ? 
        ORDER BY c.created_at DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $user_email);
$stmt->execute();
$result = $stmt->get_result();

$contacts = [];
while ($row = $result->fetch_assoc()) {
    $contacts[] = $row;
}

echo json_encode($contacts);

$stmt->close();
$conn->close();
?>
