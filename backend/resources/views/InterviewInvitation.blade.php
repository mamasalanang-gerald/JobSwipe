<!-- resources/views/emails/interview-invitation.blade.php -->
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Interview Invitation</title>
</head>
<body>
    <h1>Congratulations, {{ $applicantName }}!</h1>
    
    <p>You've been invited to interview at <strong>{{ $companyName }}</strong> for the position of <strong>{{ $jobTitle }}</strong>.</p>
    
    <div style="background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 8px;">
        <p><strong>Message from the hiring team:</strong></p>
        <p>{{ $message }}</p>
    </div>
    
    <p>
        <a href="{{ $jobUrl }}" style="background: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
            View Job Details
        </a>
    </p>
    
    <p>Good luck!</p>
    <p>— The JobSwipe Team</p>
</body>
</html>
