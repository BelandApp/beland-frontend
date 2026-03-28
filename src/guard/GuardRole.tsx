import { useEffect } from "react";
import { useAuth, UserRole } from "src/context";
import { useCustomNavigation } from "src/hooks";
import {
  DeepLinkService,
  SetIntentType,
} from "src/services/deepLink/deepLink.service";

type GuardProps = {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
  intent?: SetIntentType;
};

export const Guard = ({
  children,
  roles,
  fallback = null,
  intent,
}: GuardProps) => {
  const { isAuthenticated, hasRole, status } = useAuth();
  const { navigate } = useCustomNavigation();
  useEffect(() => {
    const handleIntent = async () => {
      if (!isAuthenticated && intent) {
        await DeepLinkService.setIntent(intent);
        navigate("Login");
      }
    };

    if (status !== "checking") {
      handleIntent();
    }
  }, [isAuthenticated, status]);

  if (!isAuthenticated) return fallback;

  if (roles && !hasRole(roles)) return fallback;

  return <>{children}</>;
};
