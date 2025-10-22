# Batik NFT Implementation with Barcode/Serial Number

## Overview

This implementation adds a barcode and serial number system to authenticate real-world Batik assets as NFTs. All metadata including the serial number and barcode are stored on IPFS (Pinata), making it cost-effective and scalable.

## What Was Changed

### 1. **New Utility Functions** (`utils/generateSerialNumber.js`)

Created helper functions to generate unique serial numbers and barcodes:

- **Serial Number Format**: `BATIK-YYYY-XXXXXX` (e.g., `BATIK-2025-123456`)
- **Barcode Format**: 13-digit numeric barcode (EAN-13 compatible)
- **Auto-generation**: Uses timestamp-based sequence numbers

### 2. **Updated NFT Context** (`context/NFTContext.js`)

- Modified `createNFT()` function to accept additional parameters:
  - `serialNumber`
  - `barcodeNumber`
  - `origin` (e.g., Yogyakarta, Solo)
  - `patternType` (e.g., Parang, Kawung)
- Enhanced metadata structure with `attributes` array:

  ```json
  {
    "name": "Batik Name",
    "description": "Description",
    "image": "ipfs://...",
    "attributes": [
      { "trait_type": "Serial Number", "value": "BATIK-2025-123456" },
      { "trait_type": "Barcode", "value": "2025123456000" },
      { "trait_type": "Asset Type", "value": "Batik" },
      { "trait_type": "Authentication Date", "value": "2025-10-22T..." },
      { "trait_type": "Origin", "value": "Yogyakarta" },
      { "trait_type": "Pattern Type", "value": "Parang" }
    ]
  }
  ```

- Updated all fetch functions to retrieve `attributes` from IPFS metadata

### 3. **Enhanced Create NFT Page** (`pages/create-nft.js`)

- Auto-generates serial number and barcode on page load
- Added new input fields:
  - **Batik Name**
  - **Origin/Region**
  - **Pattern Type**
- Displays read-only authentication details:
  - Serial Number (auto-generated)
  - Barcode Number (auto-generated)
- Updated page title to "Create New Batik NFT"

### 4. **Enhanced NFT Details Page** (`pages/nft-details.js`)

- Added "Authentication Details" section
- Displays all NFT attributes in a grid layout
- Special formatting:
  - Barcode displayed in monospace font
  - Authentication Date formatted as readable date
- Only shows if attributes exist

### 5. **Fixed Creator Card** (`components/CreatorCard.jsx`)

- Changed ETH display from 2 decimals to 4 decimals (0.0000)
- Shows more precise creator earnings

## How It Works

### Creating a Batik NFT

1. User visits "Create NFT" page
2. System auto-generates:
   - Serial Number: `BATIK-2025-123456`
   - Barcode: `2025123456000`
3. User uploads Batik image
4. User fills in:
   - Batik name
   - Description
   - Origin/Region
   - Pattern Type
   - Price
5. System uploads:
   - Image to IPFS (Pinata)
   - Metadata (with all attributes) to IPFS (Pinata)
6. Smart contract mints NFT with IPFS metadata URI

### Viewing Batik NFT Details

1. User clicks on an NFT
2. System fetches metadata from IPFS
3. Displays all authentication details including:
   - Serial Number
   - Barcode
   - Asset Type
   - Authentication Date
   - Origin
   - Pattern Type

## Integration with Physical Batik

### Print QR Code/Barcode

You can print the serial number as a QR code or barcode on:

- Physical Batik fabric tag
- Certificate of Authenticity
- Packaging

### Verification Process

1. Customer scans QR code/barcode on physical Batik
2. System looks up serial number on blockchain
3. Displays NFT details to verify authenticity
4. Shows owner history and current owner

## Next Steps (Optional Enhancements)

### 1. Barcode Image Generator

Install a library like `bwip-js` or `jsbarcode`:

```bash
npm install jsbarcode
```

Generate barcode image on Create NFT page and display it for printing.

### 2. Verification Scanner App

Create a simple scanner page:

- Scan QR code/barcode
- Look up serial number
- Display NFT authentication details

### 3. Printable Certificate Generator

Generate PDF certificate with:

- Batik image
- Serial number
- QR code/Barcode
- Owner information
- Authentication date

### 4. Backend Database (Production)

Replace timestamp-based sequence with database counter:

```javascript
// Instead of: Date.now() % 1000000
// Use: Get last sequence from database + 1
```

## File Structure

```
utils/
  └── generateSerialNumber.js  (NEW)
context/
  └── NFTContext.js             (UPDATED)
pages/
  ├── create-nft.js             (UPDATED)
  └── nft-details.js            (UPDATED)
components/
  └── CreatorCard.jsx           (UPDATED)
```

## Testing

1. Create a new Batik NFT with all fields
2. Check console logs for serial number and barcode
3. View NFT details to see authentication section
4. Check IPFS metadata to verify attributes are stored

## Production Deployment

Before deploying:

1. Replace `generateSequenceNumber()` with database-backed counter
2. Consider adding barcode validation
3. Add error handling for duplicate serial numbers
4. Implement barcode scanner verification page

## Smart Contract Note

**No smart contract changes required!** The smart contract only stores the `tokenURI` (IPFS link), and all the metadata (including serial number, barcode, origin, etc.) is stored in IPFS. This approach:

- ✅ Saves gas fees
- ✅ Allows flexible metadata structure
- ✅ Easy to extend with more attributes
- ✅ No need to redeploy contract

When you want to redeploy with a new version, just deploy the existing contract to a new address and update the address in `context/constants.js`.
