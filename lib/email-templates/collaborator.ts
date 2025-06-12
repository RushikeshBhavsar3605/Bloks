import { emailStyles } from "./styles";

const emailHeader = `
    <div class="email-header">
        <div class="logo">Jotion</div>
        <div class="tagline">Personal Learning Project</div>
    </div>
`;

const emailFooter = `
    <div class="email-footer">
        <div class="footer-text">
            <p><strong>Jotion</strong> - A personal learning project built to master full-stack development and crack MAANG interviews.</p>
            <p>This is a portfolio project demonstrating modern web development practices.</p>
        </div>
        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Contact</a>
        </div>
    </div>
`;

export const collaboratorVerificationTemplate = (confirmLink: string) => `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Jotion Email Templates</title>
        <style>
            ${emailStyles}
        </style>
    </head>
    <body>
    <div id="collab" class="template active">
            <div class="email-container">
                ${emailHeader}
                
                <div class="email-content">
                    <div class="greeting">You're Invited to Collaborate! 🤝</div>
                    
                    <div class="message">
                        <p>Great news! You've been invited to collaborate on a Jotion workspace. This is an exciting opportunity to work together on shared notes and projects.</p>
                    </div>
                    
                    <div style="text-align: center; margin: 32px 0;">
                        <a href="${confirmLink}" class="button">Accept Collaboration</a>
                    </div>
                    
                    <div class="message">
                        <p>As a collaborator, you'll be able to:</p>
                        <ul style="margin-left: 20px; color: #525252;">
                            <li>View and edit shared documents</li>
                            <li>Leave comments and suggestions</li>
                            <li>Access real-time collaboration features</li>
                            <li>Organize content together</li>
                        </ul>
                    </div>
                    
                    <div class="info-box">
                        <p><strong>Getting Started:</strong> Click the button above to accept the invitation and start collaborating. This link will expire in 7 days. If you don't have a Jotion account yet, you'll be prompted to create one.</p>
                    </div>
                    
                    <div class="message">
                        <p>If you're unable to click the button, you can copy and paste this link into your browser:</p>
                        <p style="word-break: break-all; color: #0a0a0a; background: #f4f4f5; padding: 12px; border-radius: 4px; font-family: monospace;">${confirmLink}</p>
                    </div>
                </div>
                
                ${emailFooter}
            </div>
        </div>
    </body>
    </html>
`;
