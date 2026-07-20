import { useState } from "react";
import { useAuth } from "src/context";
import { useCustomNavigation, useUserValidation } from "src/hooks";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage } from "src/services";
import { userService } from "src/services/user/user.service";

export const useLogin = () => {
  const { navigate } = useCustomNavigation();
  const { validateForm, errors } = useUserValidation();
  const [showLocalLogin, setShowLocalLogin] = useState(false);
  const [showPhoneModal, setShowPhoneModal] = useState(false);
  const [phone, setPhone] = useState("");
  const { handleAuth0Login, loginWithEmail, isAuthenticated, status } =
    useAuth();
  const [FormData, setFormData] = useState({
    email: "",
    password: "",
  });

  if (isAuthenticated) navigate("MainTabs", { screen: "Home" });
  const handleLogin = async () => {
    try {
      const isValid = validateForm({ email: FormData.email });
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
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };

  const handleAddPhone = async () => {
    try {
      const isValid = validateForm({ phone: phone });
      if (!isValid) return;
      await userService.updateUser({ phone });
      notify.success({ message: "Teléfono ingresado correctamente" });
      setTimeout(() => {
        setShowPhoneModal(false);
      }, 300);
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };
  return {
    FormData,
    showLocalLogin,
    showPhoneModal,
    phone,
    setPhone,
    errors,
    setFormData,
    handleLoginAuth0,
    handleLogin,
    navigate,
    status,
    isAuthenticated,
    handleAddPhone,
    setShowLocalLogin,
    setShowPhoneModal,
  };
};
