import { emailStyles } from "./styles";

const emailHeader = `
    <div class="email-header">
        <div class="logo">Bloks</div>
        <div class="tagline">Personal Learning Project</div>
    </div>
`;

const emailFooter = `
    <div class="email-footer">
        <div class="footer-text">
            <p><strong>Bloks</strong> - A personal learning project built to master full-stack development.</p>
            <p>This is a portfolio project demonstrating modern web development practices.</p>
        </div>
        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
        </div>
    </div>
`;

export const twoFactorTokenTemplate = (token: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bloks Email Templates</title>
        <style>
            ${emailStyles}
        </style>
    </head>
    <body>
    <div id="twofa" class="template active">
            <div class="email-container">
                ${emailHeader}
                
                <div class="email-content">
                    <div class="greeting">Hello there! 👋</div>
                    
                    <div class="message">
                        <p>You've requested a two-factor authentication code for your Bloks account. Here's your secure verification code:</p>
                    </div>
                    
                    <div class="token-container">
                        <div class="token-label">Your 2FA Code</div>
                        <div class="token-code">${token}</div>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Security Note:</strong> This code will expire in 5 minutes. If you didn't request this code, please ignore this email and ensure your account is secure.</p>
                    </div>
                    
                    <div class="message">
                        <p>Simply enter this code in the verification field to complete your login process.</p>
                    </div>
                </div>
                
                ${emailFooter}
            </div>
        </div>
    </body>
    </html>
`;

export const passwordResetTemplate = (resetLink: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bloks Email Templates</title>
        <style>
            ${emailStyles}
        </style>
    </head>
    <body>
    <div id="reset" class="template active">
            <div class="email-container">
                ${emailHeader}
                
                <div class="email-content">
                    <div class="greeting">Password Reset Request 🔐</div>
                    
                    <div class="message">
                        <p>We received a request to reset your password for your Bloks account. If you made this request, click the button below to create a new password:</p>
                    </div>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${resetLink}" class="button">Reset Your Password</a>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Important:</strong> This link will expire in 5 minutes for security reasons. If you didn't request a password reset, you can safely ignore this email.</p>
                    </div>
                    
                    <div class="message">
                        <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0a0a0a; background: #f4f4f5; padding: 12px; border-radius: 4px; font-family: monospace;">${resetLink}</p>
                    </div>
                </div>
                
                ${emailFooter}
            </div>
        </div>
    </body>
    </html>
`;

export const verificationTemplate = (confirmLink: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Bloks Email Templates</title>
        <style>
            ${emailStyles}
        </style>
    </head>
    <body>
    <div id="verify" class="template active">
            <div class="email-container">
                ${emailHeader}
                
                <div class="email-content">
                    <div class="greeting">Welcome to Bloks! 🎉</div>
                    
                    <div class="message">
                        <p>Thank you for signing up for Bloks! To complete your registration and start exploring our note-taking platform, please verify your email address by clicking the button below:</p>
                    </div>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${confirmLink}" class="button">Verify Your Email</a>
                    </div>
                    
                    <div class="message">
                        <p>Once verified, you'll be able to:</p>
                        <ul style="margin-left: 20px; color: #525252;">
                            <li>Create and organize your notes</li>
                            <li>Collaborate with others</li>
                            <li>Access all platform features</li>
                            <li>Customize your workspace</li>
                        </ul>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Verification Link:</strong> This link will expire in 5 minutes. If you didn't create an account with us, please ignore this email.</p>
                    </div>
                    
                    <div class="message">
                        <p>If the button doesn't work, copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0a0a0a; background: #f4f4f5; padding: 12px; border-radius: 4px; font-family: monospace;">${confirmLink}</p>
                    </div>
                </div>
                
                ${emailFooter}
            </div>
        </div>
    </body>
    </html>
`;
