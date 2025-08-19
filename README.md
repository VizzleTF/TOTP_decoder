# TOTP QR Code Decoder

A comprehensive solution for decoding TOTP (Time-based One-Time Password) QR codes from images, available both as a Python command-line tool and a modern web application.

## 🚀 Try it Online

**Live Demo**: [https://totp-decoder.vercel.app/](https://totp-decoder.vercel.app/)

No installation required! Simply visit the link above to start decoding TOTP QR codes directly in your browser.

## Features

### Core Features
- Decode TOTP QR codes from images and screenshots
- Extract all TOTP parameters (secret, issuer, algorithm, period)
- Support for Google Authenticator migration QR codes (otpauth-migration://)
- Generate current TOTP codes
- Handle multiple accounts from a single migration QR code
- High accuracy QR code recognition using OpenCV

### Web Application Features
- 🌐 **Modern Web Interface**: Clean, responsive UI built with React + Vite + Tailwind CSS
- 📁 **Drag & Drop**: Simply drag QR code images onto the interface
- 📋 **Clipboard Support**: Paste images directly with Ctrl+V (Cmd+V on Mac)
- 📱 **Mobile Friendly**: Responsive design that works on all devices
- 🔄 **Real-time Processing**: Instant QR code decoding and TOTP generation
- 📋 **One-click Copy**: Copy TOTP codes and OTP Auth URLs with a single click
- ⚡ **Fast & Secure**: Client-server architecture with local processing

## Installation

### Requirements

- Python 3.7+
- pip

### Install Dependencies

```bash
git clone <repository-url>
cd TOTPdecode
pip install -r requirements.txt
```

### Alternative Installation

```bash
pip install opencv-python pyotp protobuf
```

## Web Application Deployment

### Quick Start

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd TOTPdecode
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Install Node.js dependencies**:
   ```bash
   cd web
   npm install
   cd ..
   ```

4. **Start the backend server**:
   ```bash
   python3 app.py
   ```
   The API server will start on `http://localhost:8000`

5. **Start the frontend development server** (in a new terminal):
   ```bash
   cd web
   npm run dev
   ```
   The web application will be available at `http://localhost:5173`

### Production Deployment

#### Backend (FastAPI)
```bash
# Install production dependencies
pip install uvicorn[standard]

# Run with Uvicorn
uvicorn app:app --host 0.0.0.0 --port 8000

# Or with Gunicorn (recommended for production)
pip install gunicorn
gunicorn app:app -w 4 -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

#### Frontend (React)
```bash
cd web

# Build for production
npm run build

# Serve with a static file server (e.g., nginx, Apache, or serve)
npm install -g serve
serve -s dist -l 3000
```

### Vercel Deployment

For serverless deployment on Vercel:

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Deploy to Vercel:**
   ```bash
   # Login to Vercel
   vercel login
   
   # Deploy the application
   vercel
   ```

3. **Configuration:**
   - The `vercel.json` file is already configured
   - Backend runs as serverless functions in `/api`
   - Frontend is built and served statically from `/web`

4. **Environment Setup:**
   - No additional environment variables needed
   - All processing happens client-side and in serverless functions

### Docker Deployment (Optional)

Create a `docker-compose.yml` file:
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8000:8000"
    volumes:
      - .:/app
    working_dir: /app
    command: uvicorn app:app --host 0.0.0.0 --port 8000
  
  frontend:
    build: ./web
    ports:
      - "3000:3000"
    depends_on:
      - backend
```

Then run:
```bash
docker-compose up -d
```

### Environment Configuration

Create a `.env` file in the root directory:
```env
# Backend configuration
FASTAPI_HOST=0.0.0.0
FASTAPI_PORT=8000
CORS_ORIGINS=http://localhost:5173,http://localhost:3000

# Frontend configuration (in web/.env)
VITE_API_URL=http://localhost:8000
```

## Usage

### Web Application

1. **Open your browser** and navigate to the web application URL
2. **Upload a QR code image** by:
   - Dragging and dropping an image file onto the upload area
   - Clicking the upload area to select a file
   - Pasting an image from clipboard with Ctrl+V (Cmd+V on Mac)
3. **View results**: The application will automatically decode the QR code and display:
   - TOTP account information (issuer, account name)
   - Current TOTP code
   - OTP Auth URL for easy import
   - Technical parameters (algorithm, digits, period)
4. **Copy information**: Use the copy buttons to copy TOTP codes or OTP Auth URLs

### Command Line Interface

```bash
python totp_decoder.py <image_path>
```

### Examples

```bash
python totp_decoder.py screenshot.png
python totp_decoder.py migration_export.jpg
python totp_decoder.py --help
```

### Example Output

```
Processing image: screenshot.png
Found QR code: otpauth://totp/Google:user@example.com?secret=JBSWY3DP...

==================================================
TOTP INFORMATION
==================================================
Issuer: Google
Account: user@example.com
Secret: JBSWY3DPEHPK3PXP
Algorithm: SHA1
Digits: 6
Period (sec): 30

Current code: 123456

Original URL:
otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google
==================================================
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
├── totp_decoder.py       # Core TOTP decoder library
├── app.py                # FastAPI web server (local development)
├── requirements.txt      # Python dependencies
├── README.md             # Documentation
├── test_decoder.py       # Tests
├── OtpMigration.proto    # Protobuf schema
├── OtpMigration_pb2.py   # Generated protobuf classes
├── api/                  # Vercel serverless functions
│   ├── index.py          # FastAPI serverless handler
│   ├── requirements.txt  # API dependencies
│   └── OtpMigration_pb2.py # Protobuf classes for serverless
└── web/                  # React web application
    ├── package.json      # Node.js dependencies
    ├── vite.config.js    # Vite configuration
    ├── tailwind.config.js # Tailwind CSS configuration
    ├── index.html        # HTML template
    ├── src/
    │   ├── App.jsx       # Main React component
    │   ├── main.jsx      # React entry point
    │   └── index.css     # Global styles
    └── dist/             # Production build (generated)
```

## How It Works

### Command Line Tool
1. **Image Loading**: Loads image using OpenCV
2. **QR Code Detection**: Uses OpenCV QR code detector for recognition
3. **URL Parsing**: Extracts parameters from `otpauth://` or `otpauth-migration://` URLs
4. **Code Generation**: Creates current TOTP code using PyOTP
5. **Output**: Displays all information in a readable format

### Web Application Architecture
1. **Frontend (React)**: Modern web interface with drag-and-drop support
2. **Backend (FastAPI)**: RESTful API server for image processing
3. **Image Processing**: Same OpenCV-based QR code detection as CLI tool
4. **Real-time Generation**: TOTP codes and OTP Auth URLs generated on-demand
5. **Secure Communication**: CORS-enabled API with local processing

## API Documentation

The web application provides a simple REST API:

### POST /decode

Decodes a QR code image and returns TOTP information.

**Request:**
- Method: `POST`
- Content-Type: `multipart/form-data`
- Body: Form data with `file` field containing the image

**Response:**
```json
{
  "success": true,
  "qr_type": "otpauth",
  "accounts": [
    {
      "secret": "JBSWY3DPEHPK3PXP",
      "issuer": "Google",
      "account": "user@example.com",
      "algorithm": "SHA1",
      "digits": 6,
      "period": 30,
      "current_code": "123456",
      "otpauth_url": "otpauth://totp/Google:user@example.com?secret=JBSWY3DPEHPK3PXP&issuer=Google&algorithm=SHA1&digits=6&period=30"
    }
  ]
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "No QR code found in image"
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "healthy"
}
```

## Troubleshooting

### QR Code Not Recognized

- Ensure the QR code is clearly visible in the image
- Try increasing image resolution
- Check that the QR code is not cropped
- Make sure the image is not too blurry
- For web app: Try refreshing the page and uploading again

### Web Application Issues

#### Backend Server Won't Start
```bash
# Check if port 8000 is already in use
lsof -i :8000

# Kill existing process if needed
kill -9 <PID>

# Start server on different port
uvicorn app:app --host 0.0.0.0 --port 8001
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Try with different Node.js version (use nvm)
nvm use 18
npm install
```

#### CORS Issues
- Ensure backend is running on correct port
- Check that frontend is configured to use correct API URL
- Verify CORS settings in `app.py`

#### File Upload Issues
- Check file size (max 10MB)
- Ensure image format is supported (PNG, JPG, JPEG, BMP, TIFF, WebP)
- Try different image or browser

### Installation Issues

```bash
pip install opencv-python-headless
pip install --upgrade pip setuptools wheel
```

### Dependency Issues

```bash
python -m venv venv
source venv/bin/activate  # Linux/macOS
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

### Node.js Issues

```bash
# Install Node.js (recommended version 16+)
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Or download from nodejs.org
```

## Security

⚠️ **Important Security Considerations**: 

### General Security
- TOTP secret keys are confidential information
- Do not share secrets with third parties
- Delete QR code screenshots after use
- Use this tool only for your own accounts

### Web Application Security
- **Local Processing**: All QR code processing happens locally on your server
- **No Data Storage**: Images and secrets are not stored on disk
- **Memory Cleanup**: Sensitive data is cleared from memory after processing
- **HTTPS Recommended**: Use HTTPS in production to encrypt data in transit
- **Network Security**: Consider running behind a reverse proxy (nginx/Apache)
- **Access Control**: Implement authentication if deploying publicly

### Production Security Checklist
- [ ] Use HTTPS/TLS certificates
- [ ] Configure proper CORS origins
- [ ] Set up firewall rules
- [ ] Use environment variables for configuration
- [ ] Regular security updates for dependencies
- [ ] Monitor server logs for suspicious activity
- [ ] Consider rate limiting for API endpoints

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

### Development Setup

```bash
# Clone and setup
git clone <your-fork>
cd TOTPdecode

# Backend development
pip install -r requirements.txt
python3 app.py

# Frontend development
cd web
npm install
npm run dev
```

### Code Style
- **Python**: Follow PEP 8, use type hints where possible
- **JavaScript/React**: Use ESLint and Prettier configurations
- **CSS**: Use Tailwind CSS utility classes

## Support

If you have questions or issues:

1. Check the "Troubleshooting" section
2. For web app issues: Check browser console and server logs
3. Create an issue in the repository with:
   - Full error message
   - Sample image (if applicable)
   - Browser/OS information (for web app)
   - Steps to reproduce
4. For urgent issues: Include "[URGENT]" in the issue title