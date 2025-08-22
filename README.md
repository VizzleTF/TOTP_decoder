# TOTP QR Code Decoder

A modern, fully client-side web application for decoding TOTP (Time-based One-Time Password) QR codes from images. No server required - everything runs securely in your browser!

## 🚀 Try it Online

**Live Demo**: [https://totp-decoder.vercel.app/](https://totp-decoder.vercel.app/)

No installation required! Simply visit the link above to start decoding TOTP QR codes directly in your browser.

## Features

### Core Features
- 🔐 **Fully Client-Side**: All processing happens in your browser - no data sent to servers
- 📷 **QR Code Decoding**: Decode TOTP QR codes from images and screenshots
- 🔑 **Complete Parameter Extraction**: Extract all TOTP parameters (secret, issuer, algorithm, period)
- 📱 **Google Authenticator Migration**: Support for Google Authenticator migration QR codes (otpauth-migration://)
- ⏰ **Live TOTP Generation**: Generate current TOTP codes in real-time
- 👥 **Multiple Accounts**: Handle multiple accounts from a single migration QR code
- 🎯 **High Accuracy**: Advanced QR code recognition with multiple decoding strategies

### Web Application Features
- 🌐 **Modern Interface**: Clean, responsive UI built with React + Vite + Tailwind CSS
- 📁 **Drag & Drop**: Simply drag QR code images onto the interface
- 📋 **Clipboard Support**: Paste images directly with Ctrl+V (Cmd+V on Mac)
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔄 **Real-time Processing**: Instant QR code decoding and TOTP generation
- 📋 **One-click Copy**: Copy TOTP codes and OTP Auth URLs with a single click
- 🔒 **Privacy First**: No data leaves your device - completely secure and private

## Local Development

### Requirements

- Node.js 16+ and npm
- Modern web browser

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd TOTPdecode
   ```

2. **Install dependencies**:
   ```bash
   cd web
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:3000`

4. **Build for production**:
   ```bash
   npm run build
   ```
   The built files will be in the `dist` directory.

## Deployment

### Deploy to Vercel

1. **One-click deployment**:
   [![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VizzleTF/TOTP_decoder)

2. **Manual deployment**:
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy from project root
   vercel
   ```

### Deploy to Other Platforms

Since this is a static React application, you can deploy it to any static hosting service:

- **Netlify**: Drag and drop the `web/dist` folder
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Cloudflare Pages**: Connect your repository for automatic deployments

## Usage

### Web Application

1. **Open your browser** and navigate to the web application URL
2. **Upload a QR code image** by:
   - Dragging and dropping an image file onto the upload area
   - Clicking the upload area to select a file
   - Pasting an image from clipboard with Ctrl+V (Cmd+V on Mac)
3. **View results**: The application will automatically decode the QR code and display:
   - TOTP account information (issuer, account name)
   - Current TOTP code (updates every 30 seconds)
   - OTP Auth URL for easy import into other authenticator apps
   - Technical parameters (algorithm, digits, period)
4. **Copy information**: Use the copy buttons to copy TOTP codes or OTP Auth URLs
5. **Multiple accounts**: For Google Authenticator migration QR codes, all accounts will be displayed

### Example Results

**Standard TOTP QR Code:**
```
✅ QR Code Type: Standard TOTP

📱 Account: user@example.com
🏢 Issuer: Google
🔑 Current TOTP: 123456
⚙️ Algorithm: SHA1 | Digits: 6 | Period: 30s

📋 OTP Auth URL:
otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google
```

**Google Authenticator Migration QR Code:**
```
✅ QR Code Type: Google Authenticator Migration
📦 Found 3 accounts

📱 Account 1: user@gmail.com (Google)
🔑 Current TOTP: 456789

📱 Account 2: user@github.com (GitHub)
🔑 Current TOTP: 987654

📱 Account 3: user@aws.com (Amazon Web Services)
🔑 Current TOTP: 321098
```

## Supported Formats

### Image Formats
- PNG
- JPG/JPEG
- BMP
- TIFF
- WebP

### QR Code Formats
- `otpauth://totp/` - Standard TOTP format
- `otpauth-migration://` - Google Authenticator export format (supports multiple accounts)
- Supported parameters:
  - `secret` - Secret key (required)
  - `issuer` - Service issuer
  - `algorithm` - Hash algorithm (SHA1, SHA256, SHA512)
  - `digits` - Number of digits in code (usually 6 or 8)
  - `period` - Code validity period in seconds (usually 30)
- Migration QR codes: Automatic extraction of multiple accounts from protobuf data

## Project Structure

```
TOTPdecode/
├── .gitignore            # Git ignore rules
├── .vercelignore         # Vercel ignore rules
├── vercel.json           # Vercel deployment configuration
├── README.md             # Documentation
├── test_qr_code.png      # Sample QR code for testing
└── web/                  # React web application
    ├── package.json      # Node.js dependencies
    ├── vite.config.js    # Vite configuration
    ├── tailwind.config.js # Tailwind CSS configuration
    ├── postcss.config.js # PostCSS configuration
    ├── index.html        # HTML template
    ├── public/           # Static assets
    │   └── vite.svg      # Vite logo
    ├── src/
    │   ├── App.jsx       # Main React component
    │   ├── main.jsx      # React entry point
    │   ├── index.css     # Global styles
    │   ├── totpDecoder.js # Core TOTP decoding logic
    │   ├── otpMigration.js # Google Authenticator migration protobuf
    │   ├── components/   # React components
    │   └── hooks/        # Custom React hooks
    └── dist/             # Production build (generated)
```

## How It Works

### Client-Side Architecture
1. **Image Processing**: Uses HTML5 Canvas API to load and process images
2. **QR Code Detection**: Utilizes jsQR library for QR code recognition with multiple decoding strategies
3. **URL Parsing**: Extracts parameters from `otpauth://` or `otpauth-migration://` URLs
4. **Protobuf Decoding**: Uses protobufjs to decode Google Authenticator migration data
5. **TOTP Generation**: Creates current TOTP codes using otplib
6. **Real-time Updates**: TOTP codes update automatically every 30 seconds
7. **Privacy First**: All processing happens in your browser - no data sent to servers

### Key Technologies
- **React + Vite**: Modern frontend framework with fast development
- **Tailwind CSS**: Utility-first CSS framework for styling
- **jsQR**: Pure JavaScript QR code decoding library
- **otplib**: JavaScript TOTP/HOTP library
- **protobufjs**: Protocol Buffers for JavaScript
- **Lucide React**: Beautiful icon library

## Troubleshooting

### QR Code Not Recognized

- Ensure the QR code is clearly visible in the image
- Try increasing image resolution
- Check that the QR code is not cropped
- Make sure the image is not too blurry
- For web app: Try refreshing the page and uploading again

## License

MIT License

## Contributing

Pull requests and issues are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests if necessary
4. Ensure code follows project style
5. Test both CLI and web versions
6. Create a pull request