import { useState } from "react";

export const useValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  /** Nombre: al menos 3 letras (sin números o símbolos) */
  const validateName = (name: string) =>
    /^[A-Za-zÀ-ÿ\s]{3,}$/.test(name.trim());

  /** Email: formato estándar */
  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  /** Password: una mayúscula, una minúscula, un número, un caracter especial y mínimo 6 caracteres */
  const validatePassword = (password: string) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*._\-])[A-Za-z\d!@#$%^&*._\-]{6,}$/.test(
      password
    );

  /** Número de teléfono: validación sencilla sin prefijo todavía */
  const validatePhone = (phone: string) =>
    /^\+?[1-9]\d{1,3}\d{6,14}$/.test(phone.replace(/\s+/g, ""));

  /** Validación genérica de formulario */
  const validateForm = (data: {
    name?: string;
    email?: string;
    phone?: string;
    password?: string;
  }) => {
    const newErrors: Record<string, string> = {};
    if (data.name !== undefined && !validateName(data.name))
      newErrors.name = "El nombre debe tener al menos 3 letras.";

    if (data.email !== undefined && !validateEmail(data.email))
      newErrors.email = "El email no es válido.";

    if (data.phone !== undefined && !validatePhone(data.phone))
      newErrors.phone = "El número de teléfono no es válido.";

    if (data.password !== undefined && !validatePassword(data.password))
      newErrors.password =
        "La contraseña debe tener al menos 6 caracteres, una mayúscula, una minúscula y un símbolo.";

    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };

  /** Permite limpiar errores manualmente si hace falta */
  const clearErrors = () => {
    setErrors({});
    setIsValid(true);
  };

  return {
    errors,
    isValid,
    validateName,
    validateEmail,
    validatePhone,
    validatePassword,
    validateForm,
    clearErrors,
  };
};
