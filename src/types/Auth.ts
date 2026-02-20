import { RegisterFormData } from "src/screens/Register/RegisterScreen";

export type ResetPasswordStepProps = {
  onSubmit: (email: string) => void;
  isLoading?: boolean;
};
export interface CodeStepProps extends ResetPasswordStepProps {
  FormData: FormResetPassword;
  onStepBack: () => void;
  onResendCode: () => void;
}

export type FormCodeCheck = { email: string; code: string };
export type FormResetPassword = {
  email: string;
  code?: string;
  password: string;
  confirmPassword: string;
};
