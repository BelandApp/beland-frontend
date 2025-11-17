import { useState } from "react";
import { useAuth } from "src/context";
import { useCustomNavigation } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage } from "src/services";

export const useLogin = () => {
  const { navigate } = useCustomNavigation();
  const { handleAuth0Login, loginWithEmail, isAuthenticated, isLoading } =
    useAuth();
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (isAuthenticated) navigate("MainTabs", { screen: "Home" });
  const handleLogin = async () => {
    if (!FormData.email.trim() || !FormData.password.trim()) {
      notify.error({message:"Debes ingresar tu correo y contraseña"});
      return;
    }
    try {
      const res = await loginWithEmail(FormData.email, FormData.password);
      if(!res.token) return
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      
    }
  };

  const handleLoginAuth0 = async () => {
    try {
      await handleAuth0Login();
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({message});
    }
  };
  return {
    FormData,
    setFormData,
    handleLoginAuth0,
    handleLogin,
    navigate,
    isLoading,
    isAuthenticated,
  };
};
