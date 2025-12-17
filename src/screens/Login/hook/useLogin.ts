import { useState } from "react";
import { useAuth } from "src/context";
import { useCustomNavigation, useUserValidation } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage } from "src/services";

export const useLogin = () => {
  const { navigate } = useCustomNavigation();
  const { validateForm, errors } = useUserValidation();
  const { handleAuth0Login, loginWithEmail, isAuthenticated, isLoading } =
    useAuth();
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (isAuthenticated) navigate("MainTabs", { screen: "Home" });
  const handleLogin = async () => {
    try {
      const isValid = validateForm(FormData);
      if (!isValid) return;
      const res = await loginWithEmail(FormData.email, FormData.password);
      if (!res.token) throw new Error("Credenciales incorrectas");
      notify.success({ message: "Login exitoso" });
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };

  const handleLoginAuth0 = async () => {
    try {
      await handleAuth0Login();
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };
  // Elimino funciones innecesarias
  return {
    FormData,
    errors,
    setFormData,
    handleLoginAuth0,
    handleLogin,
    navigate,
    isLoading,
    isAuthenticated,
  };
};
