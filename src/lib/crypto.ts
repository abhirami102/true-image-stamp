// Cryptographic utilities for image provenance certification
// Uses Web Crypto API for SHA-256 hashing and RSA-PSS signing

export interface ProvenanceMetadata {
  issuer: string;
  version: string;
  timestamp: number;
  image_hash: string;
  signature: string;
  algorithm: string;
}

export interface VerificationResult {
  status: 'authentic' | 'modified' | 'forged' | 'uncertified';
  metadata?: ProvenanceMetadata;
  message: string;
}

// Generate RSA key pair (in production, private key would be on server/HSM)
let cachedKeyPair: CryptoKeyPair | null = null;

export async function getKeyPair(): Promise<CryptoKeyPair> {
  if (cachedKeyPair) return cachedKeyPair;
  
  cachedKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-PSS",
      modulusLength: 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["sign", "verify"]
  );
  return cachedKeyPair;
}

// Compute SHA-256 hash of image pixel data
export async function computeImageHash(imageData: ArrayBuffer): Promise<string> {
  const hashBuffer = await crypto.subtle.digest("SHA-256", imageData);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

// Sign a hash with the private key
export async function signHash(hash: string, privateKey: CryptoKey): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(hash);
  const signature = await crypto.subtle.sign(
    { name: "RSA-PSS", saltLength: 32 },
    privateKey,
    data
  );
  return btoa(String.fromCharCode(...new Uint8Array(signature)));
}

// Verify signature with public key
export async function verifySignature(
  hash: string,
  signature: string,
  publicKey: CryptoKey
): Promise<boolean> {
  const encoder = new TextEncoder();
  const data = encoder.encode(hash);
  const sigBytes = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
  return crypto.subtle.verify(
    { name: "RSA-PSS", saltLength: 32 },
    publicKey,
    sigBytes,
    data
  );
}

// Metadata marker used to embed/extract from image
const METADATA_MARKER = "IMG_PROVENANCE_V1:";
const METADATA_END = ":END_PROVENANCE";

// Embed provenance metadata into image file as a trailing data block
export function embedMetadata(imageBuffer: ArrayBuffer, metadata: ProvenanceMetadata): ArrayBuffer {
  const metadataStr = METADATA_MARKER + JSON.stringify(metadata) + METADATA_END;
  const encoder = new TextEncoder();
  const metaBytes = encoder.encode(metadataStr);
  
  const combined = new Uint8Array(imageBuffer.byteLength + metaBytes.byteLength);
  combined.set(new Uint8Array(imageBuffer), 0);
  combined.set(metaBytes, imageBuffer.byteLength);
  return combined.buffer;
}

// Extract provenance metadata from image file
export function extractMetadata(imageBuffer: ArrayBuffer): ProvenanceMetadata | null {
  const decoder = new TextDecoder();
  const str = decoder.decode(imageBuffer);
  const startIdx = str.lastIndexOf(METADATA_MARKER);
  if (startIdx === -1) return null;
  
  const endIdx = str.indexOf(METADATA_END, startIdx);
  if (endIdx === -1) return null;
  
  const jsonStr = str.substring(startIdx + METADATA_MARKER.length, endIdx);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

// Get the raw image data (without any appended metadata) for hashing
export function getImageData(imageBuffer: ArrayBuffer): ArrayBuffer {
  const decoder = new TextDecoder();
  const str = decoder.decode(imageBuffer);
  const markerIdx = str.lastIndexOf(METADATA_MARKER);
  if (markerIdx === -1) return imageBuffer;
  return imageBuffer.slice(0, markerIdx);
}

// Full certification pipeline
export async function certifyImage(file: File): Promise<{ certifiedBlob: Blob; metadata: ProvenanceMetadata }> {
  const keyPair = await getKeyPair();
  const arrayBuffer = await file.arrayBuffer();
  
  // Hash the raw image
  const imageHash = await computeImageHash(arrayBuffer);
  
  // Sign the hash
  const signature = await signHash(imageHash, keyPair.privateKey);
  
  // Create metadata
  const metadata: ProvenanceMetadata = {
    issuer: "image-provenance-platform",
    version: "1.0",
    timestamp: Date.now(),
    image_hash: imageHash,
    signature,
    algorithm: "RSA-PSS-2048",
  };
  
  // Embed metadata
  const certifiedBuffer = embedMetadata(arrayBuffer, metadata);
  const certifiedBlob = new Blob([certifiedBuffer], { type: file.type || "image/png" });
  
  return { certifiedBlob, metadata };
}

// Full verification pipeline
export async function verifyImage(file: File): Promise<VerificationResult> {
  const keyPair = await getKeyPair();
  const arrayBuffer = await file.arrayBuffer();
  
  // Extract metadata
  const metadata = extractMetadata(arrayBuffer);
  if (!metadata) {
    return { status: 'uncertified', message: 'No authenticity credentials found in this image.' };
  }
  
  // Get original image data and recompute hash
  const rawImageData = getImageData(arrayBuffer);
  const recomputedHash = await computeImageHash(rawImageData);
  
  // Check hash match
  if (recomputedHash !== metadata.image_hash) {
    return { status: 'modified', metadata, message: 'Image has been modified after certification. The pixel data no longer matches the recorded hash.' };
  }
  
  // Verify signature
  try {
    const isValid = await verifySignature(metadata.image_hash, metadata.signature, keyPair.publicKey);
    if (!isValid) {
      return { status: 'forged', metadata, message: 'Digital signature is invalid. The certification credentials may be fabricated.' };
    }
  } catch {
    return { status: 'forged', metadata, message: 'Signature verification failed. Credentials appear to be forged.' };
  }
  
  return { status: 'authentic', metadata, message: 'This image is certified authentic. The digital signature and hash are valid.' };
}
