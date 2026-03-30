<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Code</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">JobSwipe</h1>
    </div>
    
    <div style="background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0;">Password Reset Request</h2>
        
        <p>You requested to reset your password. Use the verification code below to proceed:</p>
        
        <div style="background: white; padding: 20px; text-align: center; border-radius: 8px; margin: 25px 0; border: 2px dashed #667eea;">
            <p style="margin: 0; color: #666; font-size: 14px; margin-bottom: 10px;">Your verification code:</p>
            <h1 style="margin: 0; color: #667eea; font-size: 36px; letter-spacing: 8px; font-weight: bold;">{{ $code }}</h1>
        </div>
        
        <p style="color: #666; font-size: 14px;">
            <strong>This code will expire in 10 minutes.</strong>
        </p>
        
        <p style="color: #666; font-size: 14px;">
            If you didn't request a password reset, please ignore this email or contact support if you have concerns.
        </p>
        
        <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">
        
        <p style="color: #999; font-size: 12px; text-align: center; margin: 0;">
            © {{ date('Y') }} JobSwipe. All rights reserved.
        </p>
    </div>
</body>
</html>
