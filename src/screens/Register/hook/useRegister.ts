import { useState } from "react";
import { useValidation } from "src/hooks/form/useValidation";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { RegisterFormData } from "../RegisterScreen";
import { authService, getBackendErrorMessage } from "src/services";
import { showErrorAlert, showSuccessAlert } from "src/utils/alertHelpers";

export const useRegister = () => {
  const [step, setStep] = useState<"register" | "code">("register");
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useCustomNavigation();
  const { validateForm, errors } = useValidation();
  const [FormData, setFormData] = useState<RegisterFormData>({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    address: "",
    country: "",
    city: "",
  });
  const [alert, setAlert] = useState<{
    visible: boolean;
    title: string;
    message: string;
    type?: "success" | "error" | "info";
  }>({ visible: false, title: "", message: "", type: "error" });

  const onChangeText = (name: string, value: string) => {
    setFormData({
      ...FormData,
      [name]: value,
    });
  };
  const handleStepBack = () => {
    setStep("register");
  };
  const handleRegister = async () => {
    FormData.username = FormData.full_name.split(" ").join("");
    FormData.confirmPassword = FormData.password;
    const isValid = validateForm(FormData);
    if (!isValid) {
      setIsLoading(false);
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }
    try {
      setIsLoading(true);
      const success = await authService.registerUser(FormData);
      if (!success) {
        setAlert({
          visible: true,
          title: "Error",
          message: "No pudimos registrarte, intenta nuevamente",
          type: "error",
        });
      }
      setStep("code");
    } catch (error) {
      setAlert({
        visible: true,
        title: "Error",
        message: "No se pudo completar el Registro",
        type: "error",
      });
      console.error("[REGISTER] Error en Register:", error);
    } finally {
      setIsLoading(false);
    }
  };
  const handleReSendCode = async () => {
    try {
      if (!FormData.email) return;
      await authService.resendRegisterCode(FormData.email);
       showSuccessAlert({
         title: "Enviado",
         message: "Nuevo código enviado",
       });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      showErrorAlert({
        title: "Error",
        message: message,
      });
    }
  };
  const handleVerifyCode = async (code: string) => {
    try {
      await authService.checkRegisterCode({ email: FormData.email, code });
      showSuccessAlert({
        title: "Listo",
        message: "Registro exitoso",
      })
      await authService.loginWithEmail(FormData.email, FormData.password);
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      showErrorAlert({
        title: "Error",
        message: message,
      });
    }
  };
  return {
    step,
    isLoading,
    FormData,
    errors,
    onChangeText,
    alert,
    handleRegister,
    navigate,
    setAlert,
    handleStepBack,
    handleReSendCode,
    handleVerifyCode,
  };
};
