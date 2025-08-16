<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check database connection
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Database connection failed: " . $conn->connect_error
    ]);
    exit;
}

// Get user_email from query parameter
$user_email = $_GET['user_email'] ?? '';
if (empty($user_email)) {
    http_response_code(400);
    echo json_encode([
        "status" => "error",
        "message" => "User email is required"
    ]);
    exit;
}

$user_email = $conn->real_escape_string($user_email);

// Initialize response arrays
$private_counts = [];
$group_counts = [];
$total_private_count = 0;
$total_group_count = 0;

// Fetch unread private messages for each contact
$sql_private_details = "
    SELECT sender_email AS email, COUNT(*) AS count 
    FROM messages 
    WHERE receiver_email = ? AND read_status = 0 
    GROUP BY sender_email
";

$stmt_private_details = $conn->prepare($sql_private_details);
if ($stmt_private_details) {
    $stmt_private_details->bind_param("s", $user_email);
    $stmt_private_details->execute();
    $result_private_details = $stmt_private_details->get_result();

    while ($row = $result_private_details->fetch_assoc()) {
        $private_counts[] = [
            "email" => $row['email'],
            "count" => (int)$row['count']
        ];
    }
    $stmt_private_details->close();

    // Calculate total unread private messages
    $total_private_count = array_sum(array_column($private_counts, 'count'));
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error preparing private messages query: " . $conn->error
    ]);
    exit;
}

// Fetch unread group messages for the user
$sql_group_details = "
    SELECT 
    gc.id AS group_id, 
    gc.group_name, 
    COUNT(gm.id) AS count 
FROM group_messages gm
INNER JOIN group_members gmbr ON gm.group_id = gmbr.group_id
INNER JOIN groupchat gc ON gm.group_id = gc.id
INNER JOIN contacts c ON c.id = gmbr.contact_id
WHERE c.email = ? AND gm.read_status = 0
GROUP BY gc.id, gc.group_name
";

$stmt_group_details = $conn->prepare($sql_group_details);
if ($stmt_group_details) {
    $stmt_group_details->bind_param("s", $user_email);
    $stmt_group_details->execute();
    $result_group_details = $stmt_group_details->get_result();

    while ($row = $result_group_details->fetch_assoc()) {
        $group_counts[] = [
            "group_id" => (int)$row['group_id'],
            "group_name" => $row['group_name'],
            "count" => (int)$row['count']
        ];
    }
    $stmt_group_details->close();

    // Calculate total unread group messages
    $total_group_count = array_sum(array_column($group_counts, 'count'));
} else {
    http_response_code(500);
    echo json_encode([
        "status" => "error",
        "message" => "Error preparing group messages query: " . $conn->error
    ]);
    exit;
}

// Return JSON response with total and detailed unread counts
echo json_encode([
    "status" => "success",
    "unread_private_count" => $total_private_count,
    "private_counts" => $private_counts,
    "unread_group_count" => $total_group_count,
    "group_counts" => $group_counts
]);

$conn->close();
?>
