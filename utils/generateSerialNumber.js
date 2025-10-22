/**
 * Generate unique serial number for Batik NFT
 * Format: BATIK-YYYY-XXXXXX
 * Example: BATIK-2025-000001
 */
export const generateSerialNumber = (sequence) => {
  const year = new Date().getFullYear();
  const paddedSequence = String(sequence).padStart(6, '0');
  return `BATIK-${year}-${paddedSequence}`;
};

/**
 * Generate barcode number (EAN-13 format)
 * Converts serial number to 13-digit barcode
 */
export const generateBarcodeNumber = (serialNumber) => {
  // Extract numeric parts from serial number
  const numericPart = serialNumber.replace(/\D/g, ''); // Remove non-digits
  // Pad to 13 digits (EAN-13 format)
  return numericPart.padStart(13, '0').slice(0, 13);
};

/**
 * Validate serial number format
 * Returns true if format matches BATIK-YYYY-XXXXXX
 */
export const validateSerialNumber = (serialNumber) => {
  const pattern = /^BATIK-\d{4}-\d{6}$/;
  return pattern.test(serialNumber);
};

/**
 * Generate sequence number based on timestamp
 * In production, this should come from a database counter
 */
export const generateSequenceNumber = () => Date.now() % 1000000; // Last 6 digits of timestamp
