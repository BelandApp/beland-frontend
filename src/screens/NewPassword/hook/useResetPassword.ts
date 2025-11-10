import { useState } from "react";
import { useCustomNavigation } from "src/hooks/navigation/useCustomNavigation";
import { authService } from "src/services";

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
    setLoading(true);
    const res = await authService.sendCodeToEmail(email);
    setLoading(false);
    if (!res) return;
    //  TODO notificar al usuario
    setStep("code");
  };
  const handleCode = async (code: string) => {
    setFormData({ ...FormData, code });
    setLoading(true);
    const res = await authService.checkCode({
      email: FormData.email,
      code: FormData.code,
    });
    setLoading(false);
    if (!res) return;
    //  TODO notificar al usuario
    setStep("password");
  };
  const handlePassword = async (password: string) => {
    setFormData({ ...FormData, password, confirmPassword: password });
    setLoading(true);
    const res = await authService.resetPassword(FormData);
    setLoading(false);
    if (!res) return;
    //  TODO notificar al usuario
    navigate("MainTabs");
  };
  const handleStepBack = () => {
    setStep("email");
  };
  const handleReSendCode = async () => {
    if (!FormData.email) return;
    await authService.sendCodeToEmail(FormData.email);
    //  TODO notificar al usuario
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
