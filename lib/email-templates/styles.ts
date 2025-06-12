export const emailStyles = `
    /* Reset and base styles */
    * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
    }
    
    body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
        line-height: 1.6;
        color: #0a0a0a;
        background-color: #ffffff;
    }
    
    /* Email container */
    .email-container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #ffffff;
        border: 1px solid #e4e4e7;
        border-radius: 8px;
        overflow: hidden;
    }
    
    /* Header */
    .email-header {
        background-color: #0a0a0a;
        color: #ffffff;
        padding: 32px 24px;
        text-align: center;
    }
    
    .logo {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: -0.025em;
        margin-bottom: 8px;
    }
    
    .tagline {
        font-size: 14px;
        color: #a1a1aa;
        font-weight: 400;
    }
    
    /* Content */
    .email-content {
        padding: 40px 24px;
    }
    
    .greeting {
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 24px;
        color: #0a0a0a;
    }
    
    .message {
        font-size: 16px;
        line-height: 1.7;
        color: #525252;
        margin-bottom: 32px;
    }
    
    /* Token display */
    .token-container {
        background-color: #f4f4f5;
        border: 2px dashed #d4d4d8;
        border-radius: 8px;
        padding: 24px;
        text-align: center;
        margin: 24px 0;
    }
    
    .token-label {
        font-size: 14px;
        color: #71717a;
        margin-bottom: 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
        font-weight: 500;
    }
    
    .token-code {
        font-size: 32px;
        font-weight: 700;
        color: #0a0a0a;
        letter-spacing: 0.1em;
        font-family: 'Courier New', monospace;
    }
    
    /* Button styles */
    .button {
        display: inline-block;
        background-color: #0a0a0a;
        color: #ffffff;
        padding: 14px 28px;
        text-decoration: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        text-align: center;
        transition: background-color 0.2s ease;
        border: 2px solid #0a0a0a;
    }
    
    .button:hover {
        background-color: #262626;
        border-color: #262626;
    }
    
    .button-secondary {
        background-color: #ffffff;
        color: #0a0a0a;
        border: 2px solid #e4e4e7;
    }
    
    .button-secondary:hover {
        background-color: #f4f4f5;
    }
    
    /* Warning/Info boxes */
    .info-box {
        background-color: #f8fafc;
        border-left: 4px solid #0a0a0a;
        padding: 16px 20px;
        margin: 24px 0;
        border-radius: 0 8px 8px 0;
    }
    
    .info-box p {
        margin: 0;
        font-size: 14px;
        color: #525252;
    }
    
    /* Footer */
    .email-footer {
        background-color: #fafafa;
        padding: 32px 24px;
        text-align: center;
        border-top: 1px solid #e4e4e7;
    }
    
    .footer-text {
        font-size: 14px;
        color: #71717a;
        line-height: 1.6;
    }
    
    .footer-links {
        margin-top: 16px;
    }
    
    .footer-links a {
        color: #0a0a0a;
        text-decoration: none;
        margin: 0 12px;
        font-weight: 500;
    }
    
    .footer-links a:hover {
        text-decoration: underline;
    }
    
    /* Responsive */
    @media (max-width: 600px) {
        .email-container {
            margin: 0;
            border-radius: 0;
            border-left: none;
            border-right: none;
        }
        
        .email-header,
        .email-content,
        .email-footer {
            padding-left: 16px;
            padding-right: 16px;
        }
        
        .token-code {
            font-size: 24px;
        }
        
        .button {
            width: 100%;
            box-sizing: border-box;
        }
    }
    
    /* Template selector */
    .template-selector {
        max-width: 800px;
        margin: 20px auto;
        padding: 20px;
        background: #f8fafc;
        border-radius: 8px;
    }
    
    .template-selector h2 {
        margin-bottom: 16px;
        color: #0a0a0a;
    }
    
    .template-buttons {
        display: flex;
        gap: 12px;
        flex-wrap: wrap;
        margin-bottom: 20px;
    }
    
    .template-btn {
        padding: 8px 16px;
        background: #0a0a0a;
        color: white;
        border: none;
        border-radius: 6px;
        cursor: pointer;
        font-size: 14px;
    }
    
    .template-btn:hover {
        background: #262626;
    }
    
    .template-btn.active {
        background: #525252;
    }
    
    .template {
        display: none;
    }
    
    .template.active {
        display: block;
    }
`;
