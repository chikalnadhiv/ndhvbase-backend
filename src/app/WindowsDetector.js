'use client';
import { useEffect } from 'react';

export default function WindowsDetector() {
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.userAgent.indexOf("Win") !== -1) {
      document.documentElement.classList.add("is-windows");
    }
  }, []);
  return null;
}
