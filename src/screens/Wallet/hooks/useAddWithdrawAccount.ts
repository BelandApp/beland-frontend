import { useEffect, useState } from "react";
import { Alert } from "react-native";
import { WithdrawService, WithdrawAccountType } from "services";

type UseAddWithdrawAccountOpts = {
  visible?: boolean;
  onAdd?: () => void;
  onClose?: () => void;
};

function useAddWithdrawAccount(opts: UseAddWithdrawAccountOpts = {}) {
  const { visible, onAdd, onClose } = opts;

  // Loading / data
  const [accountTypes, setAccountTypes] = useState<WithdrawAccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [selectedType, setSelectedType] = useState("");
  const [holderName, setHolderName] = useState("");
  const [holderDocument, setHolderDocument] = useState("");
  const [holderDocumentType, setHolderDocumentType] = useState<
    "DNI" | "CUIT" | "CUIL" | "CEDULA" | "RUC" | "NIT" | ""
  >("");
  const [bankCode, setBankCode] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [country, setCountry] = useState<
    "ARGENTINA" | "COLOMBIA" | "ECUADOR" | ""
  >("");
  const [currency, setCurrency] = useState<"ARS" | "USD" | "COP" | "">("");
  const [cbu, setCbu] = useState("");
  const [alias, setAlias] = useState("");
  const [provider, setProvider] = useState("");
  const [phone, setPhone] = useState("");

  // Errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (visible) loadAccountTypes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const loadAccountTypes = async () => {
    try {
      setLoading(true);
      const resp = await WithdrawService.getWithdrawAccountTypes();
      setAccountTypes(Array.isArray(resp) ? resp : []);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudieron cargar los tipos de cuenta");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setHolderName("");
    setHolderDocument("");
    setHolderDocumentType("");
    setSelectedType("");
    setBankCode("");
    setBankName("");
    setAccountNumber("");
    setCountry("");
    setCurrency("");
    setCbu("");
    setAlias("");
    setProvider("");
    setPhone("");
    setErrors({});
  };

  const validateForm = (overrides?: {
    country?: string;
    currency?: string;
    holderDocumentType?: string;
    selectedType?: string;
    cbu?: string;
    alias?: string;
  }) => {
    const e: Record<string, string> = {};

    const _holderName = holderName?.trim() || "";
    const _holderDocument =
      holderDocument?.replace(/[^0-9]/g, "")?.trim() || "";
    const _bankCode = bankCode?.trim() || "";
    const _bankName = bankName?.trim() || "";
    const _cbu = (overrides?.cbu ?? cbu)?.replace(/[^0-9]/g, "")?.trim() || "";
    const _alias = (overrides?.alias ?? alias)?.trim() || "";
    const _provider = provider?.trim() || "";
    const _phone = phone?.trim() || "";

    const countryVal = overrides?.country ?? country;
    const currencyVal = overrides?.currency ?? currency;
    const holderDocTypeVal =
      overrides?.holderDocumentType ?? holderDocumentType;
    const selectedTypeVal = overrides?.selectedType ?? selectedType;

    if (!selectedTypeVal) e.selectedType = "Seleccione el tipo de cuenta";
    if (!_holderName) e.holderName = "Nombre del titular requerido";
    if (!_holderDocument) e.holderDocument = "Documento requerido";
    else if (_holderDocument.length < 7)
      e.holderDocument = "Debe tener al menos 7 dígitos";
    if (!holderDocTypeVal) e.holderDocumentType = "Tipo de documento requerido";

    // Si es cuenta bancaria
    const acctCode =
      accountTypes.find((t) => t.id === selectedTypeVal)?.code || "";
    if (acctCode && ["BANK", "CORRIENTE", "AHORRO"].includes(acctCode)) {
      if (!_bankCode) e.bankCode = "Código de banco requerido";
      if (!_bankName) e.bankName = "Nombre de banco requerido";
      // CBU obligatorio para Argentina
      if (countryVal === "ARGENTINA") {
        if (!_cbu) e.cbu = "CBU requerido para Argentina";
        else if (_cbu.length !== 22)
          e.cbu = "El CBU debe tener exactamente 22 dígitos";
      }
    }

    if (!countryVal) e.country = "Seleccione país";
    if (
      (countryVal === "ECUADOR" || countryVal === "COLOMBIA") &&
      !accountNumber?.trim()
    ) {
      e.accountNumber = "Número de cuenta requerido";
    }
    if (!currencyVal) e.currency = "Seleccione moneda";

    // BANK: necesita CBU o Alias cuando no es Argentina
    if (acctCode === "BANK") {
      if (countryVal !== "ARGENTINA") {
        if (!_cbu && !_alias) e.cbu = "Ingrese CBU o Alias";
        else if (_cbu && _cbu.length !== 22)
          e.cbu = "El CBU debe tener exactamente 22 dígitos";
      }
    }

    // WALLET
    if (acctCode === "WALLET") {
      if (!_provider) e.provider = "Proveedor requerido";
      if (!_phone) e.phone = "Teléfono requerido";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (overrides?: {
    country?: string;
    currency?: string;
    holderDocumentType?: string;
    selectedType?: string;
    cbu?: string;
    alias?: string;
  }) => {
    if (!validateForm(overrides)) return;
    try {
      setSubmitting(true);

      const _holderName = holderName?.trim() || "";
      const _holderDocument =
        holderDocument?.replace(/[^0-9]/g, "")?.trim() || "";
      const _bankCode = bankCode?.trim() || "";
      const _bankName = bankName?.trim() || "";
      const _cbu =
        (overrides?.cbu ?? cbu)?.replace(/[^0-9]/g, "")?.trim() || "";
      const _alias = (overrides?.alias ?? alias)?.trim() || "";
      const _provider = provider?.trim() || "";
      const _phone = phone?.replace(/\D/g, "")?.trim() || "";

      const countryVal = overrides?.country ?? country;
      const currencyVal = overrides?.currency ?? currency;
      const selectedTypeVal = overrides?.selectedType ?? selectedType;

      const payload: any = {
        withdraw_account_type_id: selectedTypeVal,
        country: countryVal,
        currency: currencyVal,
        // bankCode: _bankCode,
        bankName: _bankName,
        holderName: _holderName,
        holderDocument: _holderDocument,
        holderDocumentType: overrides?.holderDocumentType ?? holderDocumentType,
      };

      if (
        (countryVal === "ECUADOR" || countryVal === "COLOMBIA") &&
        accountNumber?.trim()
      ) {
        payload.accountNumber = accountNumber.trim();
      }

      if (_cbu) payload.cbu = _cbu;
      if (_alias) payload.alias = _alias;

      // WALLET fields
      if (
        accountTypes.find((t) => t.id === selectedTypeVal)?.code === "WALLET"
      ) {
        if (_provider) payload.provider = _provider;
        if (_phone) payload.phone = _phone;
      }

      // eslint-disable-next-line no-console
      console.log("createWithdrawAccount payload:", payload);

      await WithdrawService.createWithdrawAccount(payload);
      onAdd?.();
      resetForm();
      onClose?.();
    } catch (err: any) {
      console.error(err);
      const message = err?.message || "No se pudo crear la cuenta";
      Alert.alert("Error", message);
    } finally {
      setSubmitting(false);
    }
  };

  return {
    accountTypes,
    loading,
    submitting,
    selectedType,
    setSelectedType,
    holderName,
    setHolderName,
    holderDocument,
    setHolderDocument,
    holderDocumentType,
    setHolderDocumentType,
    bankCode,
    setBankCode,
    bankName,
    setBankName,
    accountNumber,
    setAccountNumber,
    country,
    setCountry,
    currency,
    setCurrency,
    cbu,
    setCbu,
    alias,
    setAlias,
    provider,
    setProvider,
    phone,
    setPhone,
    errors,
    setErrors,
    validateForm,
    handleSubmit,
    resetForm,
  } as const;
}

export default useAddWithdrawAccount;
