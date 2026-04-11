<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Welcome to JobSwipe</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            padding: 30px 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 8px 8px 0 0;
        }
        .content {
            background: #ffffff;
            padding: 30px;
            border: 1px solid #e5e7eb;
            border-top: none;
        }
        .cta-button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 6px;
            margin: 20px 0;
            font-weight: 600;
        }
        .features {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .feature-item {
            margin: 10px 0;
            padding-left: 25px;
            position: relative;
        }
        .feature-item:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
        }
        .footer {
            text-align: center;
            padding: 20px;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Welcome to JobSwipe! 🎉</h1>
    </div>
    
    <div class="content">
        <p>Hi {{ $userName }},</p>
        
        <p>Welcome to JobSwipe - where finding your perfect {{ $userRole === 'applicant' ? 'job' : 'candidate' }} is as easy as swiping right!</p>
        
        @if($userRole === 'applicant')
            <div class="features">
                <h3>Here's what you can do:</h3>
                <div class="feature-item">Swipe through personalized job matches</div>
                <div class="feature-item">Apply to jobs with a single swipe</div>
                <div class="feature-item">Get interview invitations directly</div>
                <div class="feature-item">Track your applications in real-time</div>
            </div>
            
            <p>Ready to find your dream job? Complete your profile to get better matches and stand out to employers!</p>
        @else
            <div class="features">
                <h3>Here's what you can do:</h3>
                <div class="feature-item">Post job openings in minutes</div>
                <div class="feature-item">Review prioritized applicants</div>
                <div class="feature-item">Send interview invitations instantly</div>
                <div class="feature-item">Manage your hiring pipeline efficiently</div>
            </div>
            
            <p>Ready to find your perfect candidates? Create your first job posting and start reviewing applicants!</p>
        @endif
        
        <div style="text-align: center;">
            <a href="{{ $dashboardUrl }}" class="cta-button">
                Go to Dashboard
            </a>
        </div>
        
        <p>If you have any questions, feel free to reach out to our support team.</p>
        
        <p>Happy {{ $userRole === 'applicant' ? 'job hunting' : 'hiring' }}!</p>
        <p>— The JobSwipe Team</p>
    </div>
    
    <div class="footer">
        <p>You're receiving this email because you signed up for JobSwipe.</p>
        <p>© {{ date('Y') }} JobSwipe. All rights reserved.</p>
    </div>
</body>
</html>
