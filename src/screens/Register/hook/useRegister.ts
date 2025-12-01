import { useState } from "react";
import { useUserValidation } from "@/hooks";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { RegisterFormData } from "../RegisterScreen";
import { authService, getBackendErrorMessage } from "src/services";
import { notify } from "src/hooks/notification/notify.external";
import {  useAuth } from "src/context";

export const useRegister = () => {
  const [step, setStep] = useState<"register" | "code">("register");
  const [isLoading, setIsLoading] = useState(false);
  const { navigate } = useCustomNavigation();
  const { validateForm, errors } = useUserValidation();
  const {loginWithEmail} =useAuth()
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
    FormData.username = FormData.full_name.split(" ").join("");
    FormData.confirmPassword = FormData.password;
    const isValid = validateForm(FormData);
    if (!isValid) {
      setIsLoading(false);
      notify.error({message:"Debes completar todos los campos"});
      return;
    }
    try {
      setIsLoading(true);
      await authService.registerUser(FormData);
      notify.info({ message: "Verifica tu correo" });
      setStep("code");
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({message});
    } finally {
      setIsLoading(false);
    }
  };
  const handleReSendCode = async () => {
    try {
      if (!FormData.email) return;
      await authService.resendRegisterCode(FormData.email);
      notify.info({ message: "Verifica tu correo" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({message});
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
       notify.error({message});
    }
  };
  return {
    step,
    isLoading,
    FormData,
    errors,
    onChangeText,
    handleRegister,
    navigate,
    handleStepBack,
    handleReSendCode,
    handleVerifyCode,
  };
};
