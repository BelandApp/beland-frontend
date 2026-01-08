import { useState } from "react";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { notify } from "src/hooks/notification/notify.external";
import { authService, getBackendErrorMessage } from "src/services";

export const useResetPassword = () => {
  const [step, setStep] = useState<"email" | "code" | "password">("email");
  const [loading, setLoading] = useState(false);
  const { navigate } = useCustomNavigation();
  const [FormData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    confirmPassword: "",
  });
  // --ACTIONS--
  const handleMail = async (email: string) => {
    setFormData({ ...FormData, email });
    try {
      setLoading(true);
      const res = await authService.sendCodeToEmailForgotPassword(email);
      setStep("code");
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };
  const handleCode = async (code: string) => {
    setFormData({ ...FormData, code });
    try {
      setLoading(true);
      const res = await authService.checkCode({
        email: FormData.email,
        code,
      });
      setStep("password");
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };
  const handlePassword = async (password: string) => {
    setFormData({ ...FormData, password, confirmPassword: password });
    try {
      setLoading(true);
      await authService.resetPassword({
        email: FormData.email,
        code: FormData.code,
        password: password,
        confirmPassword: password,
      });
      notify.success({ message: "Contraseña actualizada" });
      navigate("Login");
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message });
    } finally {
      setLoading(false);
    }
  };
  const handleStepBack = () => {
    setStep("email");
  };
  const handleReSendCode = async () => {
    if (!FormData.email) {
      notify.error({ message: "Debes indicar tu correo" });
      return;
    }
    await authService.sendCodeToEmailForgotPassword(FormData.email);
    notify.info({ message: "Verifica tu correo" });
  };
  return {
    step,
    FormData,
    handleMail,
    handleCode,
    handlePassword,
    handleStepBack,
    handleReSendCode,
    isLoading: loading,
  };
};
