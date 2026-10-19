<?php

$host = "sql306.infinityfree.com";
$dbname = "if0_43109182_votify";
$username = "if0_43109182";
$password = "Kamu nanya123";

$conn = new mysqli(
    $host,
    $username,
    $password,
    $dbname
);

if ($conn->connect_error) {
    die("Database connection failed: " . $conn->connect_error);
}

$conn->set_charset("utf8mb4");
?>