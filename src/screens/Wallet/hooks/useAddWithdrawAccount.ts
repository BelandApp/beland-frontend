import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { WithdrawService, WithdrawAccountType } from "services";

/* ---------------- OPTIONS ---------------- */

const ALLOW_COUNTRIES_OPTIONS = ["ECUADOR", "ARGENTINA"] as const;
export type AllowCountries = (typeof ALLOW_COUNTRIES_OPTIONS)[number] | null;

export const countriesOptions = ALLOW_COUNTRIES_OPTIONS.map((co) => ({
  label: co,
  value: co,
}));

const ALLOW_DOCUMENT_OPTIONS = [
  "DNI",
  "CUIT",
  "CUIL",
  "CEDULA",
  "RUC",
  "NIT",
] as const;

export type AllowDocuments = (typeof ALLOW_DOCUMENT_OPTIONS)[number] | null;

export const documentOptions = ALLOW_DOCUMENT_OPTIONS.map((doc) => ({
  label: doc,
  value: doc,
}));

const ALLOW_CURRENCY_OPTIONS = ["ARS", "USD", "COP"] as const;
export type AllowCurrency = (typeof ALLOW_CURRENCY_OPTIONS)[number] | null;

export const currencyOptions = ALLOW_CURRENCY_OPTIONS.map((curr) => ({
  label: curr,
  value: curr,
}));

/* ---------------- FORM TYPE ---------------- */

type FormState = {
  selectedType: string;
  holderName: string;
  holderDocument: string;
  holderDocumentType: AllowDocuments;
  bankName: string;
  accountNumber: string;
  country: AllowCountries;
  currency: AllowCurrency;
  cbu: string;
  alias: string;
  provider: string;
  phone: string;
};

const initialForm: FormState = {
  selectedType: "",
  holderName: "",
  holderDocument: "",
  holderDocumentType: null,
  bankName: "",
  accountNumber: "",
  country: null,
  currency: null,
  cbu: "",
  alias: "",
  provider: "",
  phone: "",
};

/* ---------------- HOOK OPTIONS ---------------- */

type UseAddWithdrawAccountOpts = {
  visible?: boolean;
  onAdd?: () => void;
  onClose?: () => void;
};

/* ---------------- HOOK ---------------- */

function useAddWithdrawAccount(opts: UseAddWithdrawAccountOpts = {}) {
  const { visible, onAdd, onClose } = opts;

  const [accountTypes, setAccountTypes] = useState<WithdrawAccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<FormState>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  /* -------- LOAD ACCOUNT TYPES -------- */

  useEffect(() => {
    if (!visible) return;
    loadAccountTypes();
  }, [visible]);

  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const resp = await WithdrawService.getWithdrawAccountTypes();
      const respArray = Array.isArray(resp) ? resp[0] : [];
      setAccountTypes(respArray);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los tipos de cuenta");
    } finally {
      setLoading(false);
    }
  };

  /* -------- HELPERS -------- */

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setErrors({});
  };

  /* -------- OPTIONS PARA PICKER -------- */

  const accountTypeOptions = useMemo(
    () =>
      accountTypes.map((op) => ({
        label: op.name,
        value: op.id,
      })),
    [accountTypes],
  );

  /* -------- VALIDATION -------- */

  const validateForm = () => {
    const e: Record<string, string> = {};

    const acctType = accountTypes.find((t) => t.id === form.selectedType)?.code;

    const holderDocumentClean = form.holderDocument.replace(/\D/g, "");

    if (!form.selectedType) e.selectedType = "Seleccione el tipo de cuenta";
    if (!form.holderName.trim()) e.holderName = "Nombre requerido";

    if (!holderDocumentClean) e.holderDocument = "Documento requerido";
    else if (holderDocumentClean.length < 7)
      e.holderDocument = "Debe tener al menos 7 dígitos";

    if (!form.holderDocumentType)
      e.holderDocumentType = "Tipo de documento requerido";

    if (!form.country) e.country = "Seleccione país";
    if (!form.currency) e.currency = "Seleccione moneda";

    if (acctType === "BANK") {
      if (!form.bankName.trim()) e.bankName = "Banco requerido";

      if (form.country === "ARGENTINA") {
        const cbuClean = form.cbu.replace(/\D/g, "");
        if (!cbuClean) e.cbu = "CBU requerido";
        else if (cbuClean.length !== 22) e.cbu = "El CBU debe tener 22 dígitos";
      }
    }

    if (acctType === "WALLET") {
      if (!form.provider.trim()) e.provider = "Proveedor requerido";
      if (!form.phone.trim()) e.phone = "Teléfono requerido";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  /* -------- SUBMIT -------- */

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      setSubmitting(true);

      const payload: any = {
        withdraw_account_type_id: form.selectedType,
        country: form.country,
        currency: form.currency,
        bankName: form.bankName.trim(),
        holderName: form.holderName.trim(),
        holderDocument: form.holderDocument.replace(/\D/g, ""),
        holderDocumentType: form.holderDocumentType,
      };

      if (form.accountNumber) payload.accountNumber = form.accountNumber.trim();
      if (form.cbu) payload.cbu = form.cbu.replace(/\D/g, "");
      if (form.alias) payload.alias = form.alias.trim();
      if (form.provider) payload.provider = form.provider.trim();
      if (form.phone) payload.phone = form.phone.replace(/\D/g, "");

      await WithdrawService.createWithdrawAccount(payload);

      onAdd?.();
      setTimeout(() => {
        resetForm();
        onClose?.();
      }, 3000);
    } catch (err: any) {
      console.error(err);
      Alert.alert("Error", err?.message || "No se pudo crear la cuenta");
    } finally {
      setSubmitting(false);
    }
  };

  /* -------- RETURN -------- */

  return {
    accountTypes,
    accountTypeOptions,
    loading,
    submitting,
    form,
    errors,
    setField,
    handleSubmit,
    resetForm,
  } as const;
}

export default useAddWithdrawAccount;
