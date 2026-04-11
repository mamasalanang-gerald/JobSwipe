<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Verify Your Email</title>
</head>

<body style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px;">

    <h2 style="color: #1a1a1a;">Verify your email</h2>

    <p style="color: #444; font-size: 16px;">
        Enter this code in the JobSwipe app to verify your email address.
        This code expires in <strong>10 minutes</strong>.
    </p>

    <div style="background: #f5f5f5; border-radius: 8px; padding: 24px; text-align: center; margin: 24px 0;">
        <span style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: #1a1a1a;">
            {{ $code }}
        </span>
    </div>

    <p style="color: #888; font-size: 14px;">
        If you did not request this, you can safely ignore this email.
    </p>

</body>

</html>