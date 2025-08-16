<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php';

// Database connection
$host = "localhost";
$username = "root";
$password = "";
$database = "chatapp";

$conn = new mysqli($host, $username, $password, $database);

// Check database connection
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => "Database connection failed: " . $conn->connect_error]));
}

// Get the email from the POST request
$data = json_decode(file_get_contents("php://input"), true);
$email = isset($data['email']) ? $conn->real_escape_string($data['email']) : '';

// Validate email
if (empty($email)) {
    echo json_encode(["status" => "error", "message" => "Email is required."]);
    exit;
}

// Check if email exists in the database
$sql = "SELECT email FROM users WHERE email = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(["status" => "error", "message" => "Email not found."]);
    exit;
}

// Send email using PHPMailer
$mail = new PHPMailer(true);
try {
    // SMTP Configuration
    $mail->isSMTP();
    $mail->Host       = 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = 'gokuls0608@gmail.com';  // Your Gmail address
    $mail->Password   = 'zjym qwwv ikap kvyp';  // Use Google App Password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = 587;

    // Email Content
    $mail->setFrom('gokuls0608@gmail.com', 'ChatApp Support');
    $mail->addAddress($email);  // Recipient's email address
    $mail->Subject = 'Password Reset Request';
    
    // HTML Email Template
    $mail->isHTML(true);
    $mail->Body    = "
        <h2>Password Reset Request</h2>
        <p>We received a request to reset your password. If you requested a password reset, click the link below:</p>
        <p><a href='http://localhost/reset_password.php?email=$email' style='background: #28a745; padding: 10px 20px; color: #fff; text-decoration: none;'>Reset Password</a></p>
        <p>If you did not request this, please ignore this email.</p>
    ";

    // Send the email
    $mail->send();
    echo json_encode(["status" => "success", "message" => "Reset link sent to your email."]);
} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Mailer Error: {$mail->ErrorInfo}"]);
}

// Close database connection
$stmt->close();
$conn->close();
?>
