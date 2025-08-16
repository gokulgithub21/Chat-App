<?php
// Enable CORS (Optional, for development purposes)
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

// Check if a file is uploaded
if (isset($_FILES['file'])) {
    $file = $_FILES['file'];
    $uploadDir = 'uploads/'; // Folder to store uploaded images

    if ($file['error'] !== UPLOAD_ERR_OK) {
        echo json_encode(["status" => "error", "message" => "File upload failed."]);
        exit;
    }

    $fileName = uniqid() . '-' . basename($file['name']);
    $targetFile = $uploadDir . $fileName;

    if (move_uploaded_file($file['tmp_name'], $targetFile)) {
        // File moved successfully
        $avatarUrl = 'http://localhost/angular-auth/' . $targetFile;

        // Assuming you have the user's email from POST or other means
        $email = $_POST['email']; // You should send this in the request

        updateAvatarInDatabase($email, $avatarUrl);

        echo json_encode(["status" => "success", "avatarUrl" => $avatarUrl]);
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to move uploaded file."]);
    }
} else {
    echo json_encode(["status" => "error", "message" => "No file uploaded."]);
}


// Function to update avatar URL in the database
// Function to update avatar URL in the database
function updateAvatarInDatabase($email, $avatarUrl) {
    // Database connection
    $host = "localhost";
    $username = "root";
    $password = "";
    $database = "chatapp";

    $conn = new mysqli($host, $username, $password, $database);

    if ($conn->connect_error) {
        die(json_encode(["status" => "error", "message" => "Database connection failed."]));
    }

    $email = $conn->real_escape_string($email);
    $avatarUrl = $conn->real_escape_string($avatarUrl);

    // Update avatar URL in the database
    $sql = "UPDATE users SET avatar = ? WHERE email = ?";
    $stmt = $conn->prepare($sql);
    if ($stmt === false) {
        echo json_encode(["status" => "error", "message" => "SQL query preparation failed: " . $conn->error]);
        exit;
    }

    $stmt->bind_param("ss", $avatarUrl, $email);
    if ($stmt->execute()) {
        $stmt->close();
        $conn->close();
    } else {
        echo json_encode(["status" => "error", "message" => "Failed to update avatar URL in the database."]);
        exit;
    }
}


?>
