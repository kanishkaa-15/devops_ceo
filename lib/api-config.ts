export const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000/api'
  : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export const SOCKET_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:5000';
