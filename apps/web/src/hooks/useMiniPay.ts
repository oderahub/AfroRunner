"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect if the app is running inside MiniPay
 * MiniPay is a mobile wallet integrated with Opera Mini browser
 */
export function useMiniPay() {
  const [isMiniPay, setIsMiniPay] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if window.ethereum exists and has isMiniPay flag
    if (typeof window !== "undefined") {
      const checkMiniPay = () => {
        // @ts-ignore - MiniPay adds custom property to window.ethereum
        const detected = window.ethereum?.isMiniPay === true;
        setIsMiniPay(detected);
        setIsChecking(false);
      };

      // Check immediately
      checkMiniPay();

      // Also check after a short delay in case ethereum provider loads late
      const timeout = setTimeout(checkMiniPay, 100);

      return () => clearTimeout(timeout);
    } else {
      setIsChecking(false);
    }
  }, []);

  return { isMiniPay, isChecking };
}
