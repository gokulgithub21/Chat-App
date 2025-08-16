<?php

require('db.php');
// Read incoming data
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';
$password = isset($data['password']) ? $conn->real_escape_string($data['password']) : '';

// Input validation
if (empty($email) || empty($password)) {
    echo json_encode(["status" => "error", "message" => "Email and password are required."]);
    exit;
}

// Query to check if user exists
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Verify password
    if (password_verify($password, $user['password'])) {
        echo json_encode([
            "status" => "success",
            "message" => "Login successful",
            "data" => [
                "email" => $user['email'],
                "name" => $user['name'],
                "phoneno" => $user['phoneno'],
                "avatar" => $user['avatar']
            ]
        ]);
    } else {
        echo json_encode(["status" => "error", "message" => "Invalid password."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "User not found."]);
}

$stmt->close();
$conn->close();
?>
