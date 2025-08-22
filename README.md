# TOTP QR Code Decoder

A modern, fully client-side web application for decoding TOTP (Time-based One-Time Password) QR codes from images. Everything runs securely in your browser!

## 🌐 Use it online
### [https://totp-decoder.vercel.app](https://totp-decoder.vercel.app/)

*Or deploy your own copy:* 
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/VizzleTF/TOTP_decoder)

## Features

- 🔐 **Fully Client-Side**: All processing in browser - no data sent to servers
- 📷 **QR Code Decoding**: Decode TOTP QR codes from images and screenshots
- 📱 **Google Authenticator Migration**: Support for migration QR codes (otpauth-migration://)
- ⏰ **Live TOTP Generation**: Generate current TOTP codes in real-time
- 👥 **Multiple Accounts**: Handle multiple accounts from migration QR codes
- 📁 **Drag & Drop**: Simply drag images or paste with Ctrl+V (Cmd+V on Mac)
- 📋 **One-click Copy**: Copy TOTP codes and OTP Auth URLs
- 📱 **Mobile Friendly**: Responsive design for all devices

## Usage

1. **Upload QR code**: Drag & drop image, click to select, or paste with Ctrl+V
2. **View results**: Automatic decoding shows account info, current TOTP codes, and OTP Auth URLs
3. **Copy codes**: Click copy buttons for TOTP codes or URLs
4. **Migration support**: Multiple accounts from Google Authenticator migration QR codes

## Supported Formats

**Images**: PNG, JPG, JPEG, BMP, TIFF, WebP

**QR Codes**:
- `otpauth://totp/` - Standard TOTP format
- `otpauth-migration://` - Google Authenticator migration format
- Parameters: secret, issuer, algorithm (SHA1/SHA256/SHA512), digits (6/8), period

## Project Structure

```
TOTPdecode/
├── web/                    # React web application
│   ├── src/
│   │   ├── App.jsx         # Main React component
│   │   ├── totpDecoder.js  # Core TOTP decoding logic
│   │   ├── otpMigration.js # Migration protobuf decoder
│   │   ├── main.jsx        # React entry point
│   │   └── index.css       # Global styles
│   ├── public/
│   │   └── vite.svg        # Vite logo
│   ├── package.json        # Web app dependencies
│   ├── vite.config.js      # Vite configuration
│   ├── tailwind.config.js  # Tailwind CSS config
│   ├── postcss.config.js   # PostCSS config
│   └── index.html          # HTML template
├── package.json            # Root package.json
├── vercel.json             # Deployment config
├── .vercelignore           # Vercel ignore rules
├── test_qr_code.png        # Test QR code image
└── README.md               # Project documentation
```

## Data Processing Flow

The application implements a pipeline architecture for processing QR code images through to TOTP code generation:

```mermaid
flowchart TD
    A[Image File Upload] --> B[Load Image to Canvas]
    B --> C[Extract ImageData]
    C --> D[QR Code Detection]
    D --> E{QR Code Found?}
    E -->|No| F[Error: No QR code found]
    E -->|Yes| G[Parse QR Data]
    G --> H{QR Code Type?}
    H -->|otpauth://totp/| I[Parse Standard TOTP URL]
    H -->|otpauth-migration://| J[Parse Migration Data]
    H -->|Other| K[Error: Unsupported format]
    
    I --> L[Extract Account Info]
    J --> M[Decode Base64 Data]
    M --> N[Parse Protobuf Payload]
    N --> O[Extract Multiple Accounts]
    O --> P[Convert Secrets to Base32]
    
    L --> Q[Generate TOTP Code]
    P --> Q
    Q --> R[Display Results]
    
    style A fill:#e1f5fe
     style R fill:#c8e6c9
     style F fill:#ffcdd2
     style K fill:#ffcdd2
```

## Security Model

The application implements a zero-trust security model where all sensitive operations occur exclusively within the user's browser environment:

```mermaid
flowchart TB
    subgraph External["External Environment"]
        U[User Image Input]
        EXT["❌ No External Services"]
        NET["❌ No Network Communication"]
        STORE["❌ No Data Persistence"]
    end
    
    subgraph Browser["Browser Security Boundary"]
        subgraph Memory["Browser Memory Only"]
            IMG[Image Processing<br/>Canvas API]
            QR[QR Code Decoding<br/>jsQR]
            TOTP[TOTP Generation<br/>totp-generator]
            MEM["🔒 Temporary Memory"]
        end
        
        subgraph Security["Security Guarantees"]
            G1["✅ TOTP secrets never leave browser"]
            G2["✅ No server communication"]
            G3["✅ No persistent storage"]
            G4["✅ Local cryptographic operations"]
        end
    end
    
    U --> IMG
    IMG --> QR
    QR --> TOTP
    TOTP --> MEM
    MEM -.-> G1
    MEM -.-> G2
    MEM -.-> G3
    MEM -.-> G4
    
    style Browser fill:#e8f5e8,stroke:#4caf50,stroke-width:3px
    style Memory fill:#fff3e0,stroke:#ff9800,stroke-width:2px
    style Security fill:#f3e5f5,stroke:#9c27b0,stroke-width:2px
    style External fill:#ffebee,stroke:#f44336,stroke-width:2px
    style U fill:#e3f2fd
    style MEM fill:#fff9c4
    style EXT fill:#ffcdd2
    style NET fill:#ffcdd2
    style STORE fill:#ffcdd2
```