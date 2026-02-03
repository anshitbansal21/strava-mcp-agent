/**
 * HTML pages for OAuth flow
 * These are served by the local HTTP server
 */

/**
 * Setup page - where users enter their Strava API credentials
 */
export function setupPage(): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connect Strava</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    h1 {
      color: #333;
      margin-bottom: 10px;
      font-size: 24px;
    }
    .subtitle {
      color: #666;
      margin-bottom: 30px;
      font-size: 14px;
    }
    .info-box {
      background: #f0f7ff;
      border-left: 4px solid #2196F3;
      padding: 15px;
      margin-bottom: 25px;
      border-radius: 4px;
      font-size: 14px;
      line-height: 1.6;
    }
    .info-box a {
      color: #2196F3;
      text-decoration: none;
      font-weight: 500;
    }
    .info-box a:hover {
      text-decoration: underline;
    }
    label {
      display: block;
      margin-bottom: 8px;
      color: #333;
      font-weight: 500;
      font-size: 14px;
    }
    input {
      width: 100%;
      padding: 12px;
      border: 2px solid #e0e0e0;
      border-radius: 6px;
      font-size: 14px;
      transition: border-color 0.3s;
      margin-bottom: 20px;
    }
    input:focus {
      outline: none;
      border-color: #667eea;
    }
    button {
      width: 100%;
      padding: 14px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    }
    button:active {
      transform: translateY(0);
    }
    .error {
      background: #ffebee;
      border-left: 4px solid #f44336;
      color: #c62828;
      padding: 12px;
      margin-top: 15px;
      border-radius: 4px;
      font-size: 14px;
      display: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🏃 Connect to Strava</h1>
    <p class="subtitle">Enter your Strava API credentials to continue</p>
    
    <div class="info-box">
      <strong>Need API credentials?</strong><br>
      1. Go to <a href="https://www.strava.com/settings/api" target="_blank">strava.com/settings/api</a><br>
      2. Create an app (if you haven't already)<br>
      3. Set <strong>Authorization Callback Domain</strong> to: <code>localhost</code><br>
      4. Copy your Client ID and Client Secret
    </div>
    
    <form id="authForm" method="POST" action="/auth/start">
      <div>
        <label for="clientId">Client ID</label>
        <input 
          type="text" 
          id="clientId" 
          name="clientId" 
          required 
          placeholder="12345"
          pattern="[0-9]+"
          title="Client ID should be a number"
        >
      </div>
      
      <div>
        <label for="clientSecret">Client Secret</label>
        <input 
          type="text" 
          id="clientSecret" 
          name="clientSecret" 
          required 
          placeholder="abc123..."
          pattern="[a-f0-9]{40}"
          title="Client Secret should be a 40-character hex string"
        >
      </div>
      
      <button type="submit">Continue to Strava →</button>
    </form>
    
    <div id="error" class="error"></div>
  </div>
  
  <script>
    // Client-side validation
    document.getElementById('authForm').addEventListener('submit', function(e) {
      const clientId = document.getElementById('clientId').value;
      const clientSecret = document.getElementById('clientSecret').value;
      const errorDiv = document.getElementById('error');
      
      if (!clientId || !clientSecret) {
        e.preventDefault();
        errorDiv.textContent = 'Both fields are required';
        errorDiv.style.display = 'block';
        return;
      }
      
      errorDiv.style.display = 'none';
    });
  </script>
</body>
</html>
  `;
}

/**
 * Success page - shown after successful authentication
 */
export function successPage(athleteName?: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connected!</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .success-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 15px;
      font-size: 28px;
    }
    p {
      color: #666;
      line-height: 1.6;
      margin-bottom: 10px;
    }
    .athlete-name {
      color: #11998e;
      font-weight: 600;
      font-size: 20px;
      margin: 20px 0;
    }
    .note {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 6px;
      margin-top: 25px;
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="success-icon">✅</div>
    <h1>Successfully Connected!</h1>
    ${athleteName ? `<div class="athlete-name">Welcome, ${athleteName}!</div>` : ''}
    <p>Your Strava account is now connected.</p>
    <p>You can close this window and return to Claude.</p>
    <div class="note">
      Your credentials have been securely saved.<br>
      You won't need to authenticate again unless you disconnect.
    </div>
  </div>
  
  <script>
    // Auto-close after 3 seconds
    setTimeout(() => {
      window.close();
    }, 3000);
  </script>
</body>
</html>
  `;
}

/**
 * Error page - shown if something goes wrong
 */
export function errorPage(message: string): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Error</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 12px;
      padding: 40px;
      max-width: 500px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    .error-icon {
      font-size: 64px;
      margin-bottom: 20px;
    }
    h1 {
      color: #333;
      margin-bottom: 15px;
      font-size: 24px;
    }
    .message {
      color: #666;
      line-height: 1.6;
      margin-bottom: 25px;
    }
    button {
      padding: 12px 24px;
      background: #f5576c;
      color: white;
      border: none;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
    }
    button:hover {
      background: #d64456;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="error-icon">❌</div>
    <h1>Authentication Failed</h1>
    <div class="message">${message}</div>
    <button onclick="window.close()">Close Window</button>
  </div>
</body>
</html>
  `;
}