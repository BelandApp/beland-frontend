import { useState } from "react";

export const useAddressValidation = () => {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isValid, setIsValid] = useState(true);

  const validateStreet = (street: string) => street.trim().length >= 5;
  const validateCity = (city: string) => city.trim().length >= 2;
  const validateState = (state: string) => state.trim().length >= 2;
  const validateZipCode = (zipCode: string) => /^\d{4,10}$/.test(zipCode.trim());
  const validateCountry = (country: string) => country.trim().length >= 2;
   const validatePhone = (phone: string) =>
     /^\+[1-9]\d{7,14}$/.test(phone.replace(/\s+/g, ""));

  const validateForm = (data: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
  }) => {
    const newErrors: Record<string, string> = {};
    if (data.street !== undefined && !validateStreet(data.street))
      newErrors.street = "La dirección debe tener al menos 5 caracteres";
    if (data.city !== undefined && !validateCity(data.city))
      newErrors.city = "La ciudad debe tener al menos 2 caracteres";
    if (data.state !== undefined && !validateState(data.state))
      newErrors.state = "La provincia/estado debe tener al menos 2 caracteres";
    if (data.zipCode !== undefined && !validateZipCode(data.zipCode))
      newErrors.zipCode = "El código postal no es válido";
    if (data.country !== undefined && !validateCountry(data.country))
      newErrors.country = "El país debe tener al menos 2 caracteres";
    if (data.phone !== undefined && !validatePhone(data.phone))
      newErrors.phone = "El número de teléfono no es válido";
    setErrors(newErrors);
    const valid = Object.keys(newErrors).length === 0;
    setIsValid(valid);
    return valid;
  };
  return { errors, isValid, validateForm };
}