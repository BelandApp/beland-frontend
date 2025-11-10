import { useState } from "react";
import { useValidation } from "src/hooks/form/useValidation";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { RegisterFormData } from "../RegisterScreen";
import { authService } from "src/services";

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
      setAlert({
        visible: true,
        title: "Error",
        message: "Por favor completa todos los campos",
        type: "error",
      });
      return;
    }
    try {
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
    }
  };
  const handleReSendCode = async () => {
    if (!FormData.email) return;
    await authService.sendCodeToEmail(FormData.email);
    //  TODO notificar al usuario
  };
  const handleVerifyCode = async (code: string) => {
    await authService.checkRegisterCode({ email: FormData.email, code });
    // TODO notificar registracion exitosa
    await authService.loginWithEmail(FormData.email, FormData.password);
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
