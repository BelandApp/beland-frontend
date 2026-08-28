import { useCallback, useEffect, useState } from "react";
import { Camera } from "expo-camera";

export const useCameraPermission = () => {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const checkPermission = useCallback(async () => {
    const permission = await Camera.getCameraPermissionsAsync();

    if (permission.status === "granted") {
      setHasPermission(true);
      return;
    }

    setHasPermission(false);
  }, []);

  const requestPermission = useCallback(async () => {
    const permission = await Camera.requestCameraPermissionsAsync();

    setHasPermission(permission.status === "granted");
  }, []);

  useEffect(() => {
    void checkPermission();
  }, [checkPermission]);

  return {
    hasPermission,
    requestPermission,
  };
};
