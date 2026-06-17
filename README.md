# qr-code-generator-
# QuickQR - Smart QR Code Generator
QuickQR is a fast, responsive, and aesthetically premium client-side web application designed to generate, customize, and manage QR codes instantly. It features a modern dark/light mode interface with glassmorphic visuals, fluid animations, and real-time generation.
## Features
- **Instant Generation**: As you type or paste links and text, the QR code renders in real-time.
- **Visual Customization**:
  - Adjust foreground (QR modules) and background colors using reactive color pickers.
  - Choose QR image sizes (from 128px to 1024px).
  - Set custom Error Correction levels (Low, Medium, Quartile, High) for scanning resilience.
- **Quick Download**: Export the generated QR code instantly as a high-resolution PNG.
- **Smart History Stack**: Automatically remembers your last 5 unique QR codes locally (using `localStorage`). Re-load or remove them anytime.
- **Copy & Reset Controls**: Instantly copy text input or reset all fields and options to defaults.
- **Responsive & Accessible**: Optimized layout for smartphones, tablets, and desktop computers.
- **Vibrant UX**: Smooth hover animations, theme transitions, and custom animated status toast alerts.
## Project Structure
```
QuickQR/
├── index.html   # Main HTML5 entrypoint and semantic layout
├── style.css    # Responsive styles, glassmorphism theme variables, and keyframe animations
├── script.js    # Client-side QR rendering, LocalStorage history state, and UI logic
└── README.md    # Documentation and deployment guides
```
## Local Setup
Since this application is 100% serverless and client-side, it has zero installation requirements!
### Option A: Standard Direct Open
1. Download or clone this directory.
2. Double-click `index.html` to open it in any web browser.
### Option B: Local Live Server (Recommended)
1. Open the project folder in VS Code, Antigravity IDE, or any terminal editor.
2. Spin up a local server. For example:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Or using Node.js / npx
   npx serve .
   ```
3. Open `http://localhost:8000` or `http://localhost:3000` in your browser.
## Deployment Guide (Vercel)
This application is ready for Vercel deployment. Since it is a static web app, Vercel hosts it for free with zero-configuration:
### Using GitHub Integration (Recommended)
1. Push this folder to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and sign in.
3. Click **Add New** > **Project**.
4. Import your GitHub repository.
5. Vercel will auto-detect the HTML project. Keep all default build options as is (no build commands needed).
6. Click **Deploy**. Your app is live in seconds!
### Using Vercel CLI
1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Run the deployment command in the project directory:
   ```bash
   vercel
   ```
3. Follow the terminal prompts, select defaults, and get a staging link.
4. Run `vercel --prod` to promote the app to production.
