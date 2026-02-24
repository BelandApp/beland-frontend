import { useState } from "react";
import { useUserValidation } from "@/hooks";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { RegisterFormData } from "../RegisterScreen";
import { authService, getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import { useAuth } from "src/context";

export const useRegister = () => {
  const [step, setStep] = useState<"register" | "prevRegister" | "code">(
    "register",
  );
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useCustomNavigation();
  const { validateForm, errors } = useUserValidation();
  const { loginWithEmail } = useAuth();
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
    // Generate username from full_name if not provided
    if (!FormData.username) {
      FormData.username = FormData.full_name.split(" ").join("");
    }

    // Validate password confirmation
    if (FormData.password !== FormData.confirmPassword) {
      notify.error({ message: "Las contraseñas no coinciden" });
      return;
    }

    // Validate password strength
    if (FormData.password.length < 8) {
      notify.error({
        message: "La contraseña debe tener al menos 8 caracteres",
      });
      return;
    }

    const isValid = validateForm(FormData);
    if (!isValid) {
      setIsLoading(false);
      notify.error({ message: "Debes completar todos los campos requeridos" });
      return;
    }

    try {
      setIsLoading(true);
      await authService.registerUser(FormData);
      notify.info({ message: "Verifica tu correo electrónico" });
      setStep("code");
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    } finally {
      setIsLoading(false);
    }
  };
  const handlePrevRegister = async () => {
    if (!FormData.email) {
      notify.error({ message: "Falta ingresar tu correo" });
      return;
    }
    const isValid = validateForm({ email: FormData.email });
    if (!isValid) {
      return;
    }
    await authService.resendRegisterCode(FormData.email);
    setStep("code");
  };
  const handleReSendCode = async () => {
    try {
      if (!FormData.email) return;
      await authService.resendRegisterCode(FormData.email);
      notify.info({ message: "Verifica tu correo" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };
  const handleVerifyCode = async (code: string) => {
    try {
      await authService.checkRegisterCode({ email: FormData.email, code });
      notify.success({ message: "Registro exitoso, vamos a loguearte" });
      await loginWithEmail(FormData.email, FormData.password);
      navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    }
  };
  return {
    step,
    setStep,
    isLoading,
    FormData,
    errors,
    onChangeText,
    handleRegister,
    navigate,
    handleStepBack,
    handleReSendCode,
    handleVerifyCode,
    handlePrevRegister,
  };
};
