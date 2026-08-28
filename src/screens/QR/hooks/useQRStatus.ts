import { useState } from "react";

export const useQRStatus = () => {
  const [scanned, setScanned] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleCamera = () => {
    setIsActive(!isActive);
    if (!isActive) {
      setScanned(false);
    }
  };

  const startProcessing = () => {
    setScanned(true);
    setIsActive(false);
    setLoading(true);
  };

  const restoreScanner = () => {
    setLoading(false);
    setScanned(false);
    setIsActive(true);
  };

  const stopProcessing = () => {
    setLoading(false);
  };
  return {
    scanned,
    isActive,
    loading,
    handleCamera,
    startProcessing,
    restoreScanner,
    stopProcessing,
  };
};
