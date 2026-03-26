<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>You've Got a Match!</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9fafb;
        }
        .container {
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            text-align: center;
            padding: 40px 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: 700;
        }
        .emoji {
            font-size: 48px;
            margin-bottom: 10px;
        }
        .content {
            padding: 40px 30px;
        }
        .match-card {
            background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
            border: 2px solid #e5e7eb;
        }
        .company-logo {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            margin: 0 auto 20px;
            object-fit: cover;
            border: 3px solid white;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        .company-name {
            font-size: 24px;
            font-weight: 700;
            color: #1f2937;
            margin: 10px 0;
        }
        .job-title {
            font-size: 18px;
            color: #4b5563;
            font-weight: 500;
        }
        .match-badge {
            display: inline-block;
            background: #10b981;
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            margin-top: 15px;
        }
        .cta-button {
            display: inline-block;
            background: #4F46E5;
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            margin: 30px 0;
            font-weight: 600;
            font-size: 16px;
            transition: background 0.3s;
        }
        .cta-button:hover {
            background: #4338ca;
        }
        .info-box {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            border-radius: 6px;
            margin: 20px 0;
        }
        .info-box p {
            margin: 0;
            color: #92400e;
        }
        .next-steps {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .next-steps h3 {
            margin-top: 0;
            color: #1f2937;
        }
        .step {
            margin: 10px 0;
            padding-left: 30px;
            position: relative;
        }
        .step:before {
            content: "→";
            position: absolute;
            left: 0;
            color: #4F46E5;
            font-weight: bold;
            font-size: 18px;
        }
        .footer {
            text-align: center;
            padding: 30px 20px;
            color: #6b7280;
            font-size: 14px;
            background: #f9fafb;
        }
        .divider {
            height: 1px;
            background: #e5e7eb;
            margin: 30px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="emoji">🎉</div>
            <h1>It's a Match!</h1>
        </div>
        
        <div class="content">
            <p>Hi {{ $applicantName }},</p>
            
            <p>Exciting news! <strong>{{ $companyName }}</strong> is interested in your application!</p>
            
            <div class="match-card">
                @if($companyLogo)
                    <img src="{{ $companyLogo }}" alt="{{ $companyName }}" class="company-logo">
                @endif
                <div class="company-name">{{ $companyName }}</div>
                <div class="job-title">{{ $jobTitle }}</div>
                <div class="match-badge">✓ Matched</div>
            </div>
            
            <div class="info-box">
                <p><strong>What does this mean?</strong> The hiring team at {{ $companyName }} has reviewed your profile and they're interested in learning more about you!</p>
            </div>
            
            <div class="next-steps">
                <h3>What happens next?</h3>
                <div class="step">The hiring team will review your full application</div>
                <div class="step">They'll reach out with interview details if it's a good fit</div>
                <div class="step">Keep an eye on your notifications for updates</div>
            </div>
            
            <div style="text-align: center;">
                <a href="{{ $jobUrl }}" class="cta-button">
                    View Job Details
                </a>
            </div>
            
            <div class="divider"></div>
            
            <p style="color: #6b7280; font-size: 14px;">
                <strong>Pro tip:</strong> Make sure your profile is complete and up-to-date to make the best impression!
            </p>
            
            <p>Good luck! 🍀</p>
            <p>— The JobSwipe Team</p>
        </div>
        
        <div class="footer">
            <p>You're receiving this because {{ $companyName }} expressed interest in your application.</p>
            <p>© {{ date('Y') }} JobSwipe. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
