from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import tempfile
import os
import urllib.parse
from typing import List, Dict, Any
from totp_decoder import TOTPDecoderMigration

app = FastAPI(title="TOTP QR Code Decoder", version="1.0.0")

# Enable CORS for web frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "TOTP QR Code Decoder API"}

@app.post("/decode")
async def decode_qr_code(file: UploadFile = File(...)):
    """
    Decode TOTP QR code from uploaded image
    """
    try:
        # Validate file type
        if not file.content_type or not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=os.path.splitext(file.filename or "")[1]) as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        try:
            # Initialize decoder and process image
            decoder = TOTPDecoderMigration()
            qr_type, accounts = decoder.process_image(temp_file_path)
            
            if not accounts:
                return JSONResponse(
                    status_code=400,
                    content={"error": "No QR code found or unable to decode"}
                )
            
            # Generate TOTP codes and OTP Auth URLs for each account
            for account in accounts:
                try:
                    current_code = decoder.generate_totp_code(
                        account['secret'],
                        account.get('algorithm', 'SHA1'),
                        int(account.get('digits', '6')),
                        int(account.get('period', '30'))
                    )
                    account['current_code'] = current_code
                    
                    # Generate OTP Auth URL
                    issuer = account.get('issuer', '')
                    account_name = account.get('account', '')
                    secret = account['secret']
                    algorithm = account.get('algorithm', 'SHA1')
                    digits = account.get('digits', '6')
                    period = account.get('period', '30')
                    
                    # Format label for URL
                    if issuer and account_name:
                        label = f"{issuer}:{account_name}"
                    elif account_name:
                        label = account_name
                    else:
                        label = "Unknown"
                    
                    # Create OTP Auth URL
                    otpauth_url = f"otpauth://totp/{urllib.parse.quote(label)}?secret={secret}&issuer={urllib.parse.quote(issuer or '')}&algorithm={algorithm}&digits={digits}&period={period}"
                    account['otpauth_url'] = otpauth_url
                    
                except Exception as e:
                    print(f"Error generating TOTP code for {account.get('account', 'unknown')}: {e}")
                    account['current_code'] = 'ERROR'
                    account['otpauth_url'] = ''
            
            return {
                "success": True,
                "qr_type": qr_type,
                "accounts": accounts
            }
            
        finally:
            # Clean up temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
                
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content={"error": f"Processing error: {str(e)}"}
        )

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)