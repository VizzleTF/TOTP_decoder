# TOTP QR Code Decoder

A Python script for decoding TOTP (Time-based One-Time Password) QR codes from images and extracting authentication information.

## Features

- Decode TOTP QR codes from images and screenshots
- Extract all TOTP parameters (secret, issuer, algorithm, period)
- Support for Google Authenticator migration QR codes (otpauth-migration://)
- Generate current TOTP codes
- Handle multiple accounts from a single migration QR code
- Command-line interface
- High accuracy QR code recognition using OpenCV

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

## Usage

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
├── totp_decoder.py     # Main script
├── requirements.txt    # Dependencies
├── README.md          # Documentation
├── test_decoder.py    # Tests
├── OtpMigration.proto # Protobuf schema
└── OtpMigration_pb2.py # Generated protobuf classes
```

## How It Works

1. **Image Loading**: Loads image using OpenCV
2. **QR Code Detection**: Uses OpenCV QR code detector for recognition
3. **URL Parsing**: Extracts parameters from `otpauth://` or `otpauth-migration://` URLs
4. **Code Generation**: Creates current TOTP code using PyOTP
5. **Output**: Displays all information in a readable format

## Troubleshooting

### QR Code Not Recognized

- Ensure the QR code is clearly visible in the image
- Try increasing image resolution
- Check that the QR code is not cropped
- Make sure the image is not too blurry

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

## Security

⚠️ **Important**: 
- TOTP secret keys are confidential information
- Do not share secrets with third parties
- Delete QR code screenshots after use
- Use this script only for your own accounts

## License

MIT License

## Contributing

Pull requests and issues are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests if necessary
4. Ensure code follows project style
5. Create a pull request

## Support

If you have questions or issues:

1. Check the "Troubleshooting" section
2. Create an issue in the repository
3. Include sample image and full error text