// import crypto from 'crypto';

// For frontend build, use simple base64 encoding
// In production backend, use proper encryption

export function encrypt(text: string): string {
  return btoa(text); // Simple base64 for demo
}

export function decrypt(text: string): string {
  return atob(text); // Simple base64 decode for demo
}
