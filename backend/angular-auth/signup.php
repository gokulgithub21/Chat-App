<?php
require('db.php');

// Read data from POST request
$data = json_decode(file_get_contents("php://input"), true);
$name = $data['name'];
$email = $data['email'];
$phoneno = $data['phoneno'];
$password = $data['password'];

// Check if email already exists
$sql = "SELECT * FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    echo json_encode(["status" => "error", "message" => "Email already exists"]);
} else {
    // Hash the password
    $hashedPassword = password_hash($password, PASSWORD_DEFAULT);

    // Insert user into database
    $sql = "INSERT INTO users (name, email, phoneno, password) VALUES (?, ?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("ssss", $name, $email, $phoneno, $hashedPassword);

    if ($stmt->execute()) {
        echo json_encode(["status" => "success", "message" => "User registered successfully"]);
    } else {
        echo json_encode(["status" => "error", "message" => "Error in registration"]);
    }
}

$stmt->close();
$conn->close();
?>
