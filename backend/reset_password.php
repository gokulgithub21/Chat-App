<?php
// Ensure this file is being served as PHP (with .php extension)

// Include the necessary headers to handle content properly
header("Content-Type: text/html; charset=UTF-8");

// Use PHPMailer (you can keep it if you want to send an email confirmation after resetting)
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Get the email from the query parameter
if (!isset($_GET['email']) || empty($_GET['email'])) {
    echo "Invalid request. Email is missing.";
    exit;
}

$email = $_GET['email'];

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";
$conn = new mysqli($host, $username, $password, $database);

// Check database connection
if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

// Check if the email exists in the database
$sql = "SELECT email FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo "Email not found in our system.";
    exit;
}

// Handle password reset form submission (POST request)
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $newPassword = isset($_POST['password']) ? $_POST['password'] : '';
    $confirmPassword = isset($_POST['confirm_password']) ? $_POST['confirm_password'] : '';

    // Validate password inputs
    if (empty($newPassword) || empty($confirmPassword)) {
        echo "Password and confirm password are required.";
        exit;
    }

    if ($newPassword !== $confirmPassword) {
        echo "Passwords do not match.";
        exit;
    }

    // Hash the new password before saving it
    $hashedPassword = password_hash($newPassword, PASSWORD_BCRYPT);

    // Update the password in the database
    $updateSql = "UPDATE users SET password = ? WHERE email = ?";
    $stmt = $conn->prepare($updateSql);
    $stmt->bind_param("ss", $hashedPassword, $email);
    if ($stmt->execute()) {
        echo "Password reset successfully. You can now log in with your new password.";
    } else {
        echo "Failed to update password. Please try again later.";
    }
    exit;
}

?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password</title>
</head>
<body>

<h2>Reset Password</h2>

<form method="POST">
    <label for="password">New Password:</label>
    <input type="password" name="password" id="password" required>
    <br><br>
    <label for="confirm_password">Confirm Password:</label>
    <input type="password" name="confirm_password" id="confirm_password" required>
    <br><br>
    <button type="submit">Reset Password</button>
</form>

</body>
</html>

<?php
// Close database connection
$stmt->close();
$conn->close();
?>
