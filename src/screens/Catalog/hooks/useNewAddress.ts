import { useRef, useState } from "react";
import { useAuth } from "src/context";
import { useAddressValidation } from "src/hooks/form/useAddressValidation";
import { notify } from "src/hooks/notification/notify.external";
import { getBackendErrorMessage } from "src/services";
import * as mapboxService from "src/services/mapboxService";
import { DeliveryAddress } from "src/types";
type UseNewAddressProps = {
  initialAddress?: DeliveryAddress;
  onCreateAddress: (address: DeliveryAddress) => void;
  onCreateAndSubmit: (address: DeliveryAddress) => void;
};
export const useNewAddress = ({
  initialAddress,
  onCreateAddress,
  onCreateAndSubmit,
}: UseNewAddressProps) => {
  const [mapPickerVisible, setMapPickerVisible] = useState(false);
  const { user } = useAuth();
  const [FormData, setFormData] = useState<DeliveryAddress>(
    initialAddress || {
      street: "",
      city: user?.city || "",
      state: user?.state || "",
      zipCode: "",
      country: user?.country || "Ecuador",
      phone: user?.phone || "",
      additionalInfo: "",
    },
  );
  const onChangeText = (name: string, value: string) => {
    setFormData({
      ...FormData,
      [name]: value,
    });
  };
  const { errors, validateForm } = useAddressValidation();
  const handleMapPicker = async (coords: any) => {
    try {
      const normalized = await mapboxService.reverseGeocode(
        coords.latitude,
        coords.longitude,
      );
      setFormData((prev) => ({
        ...prev,
        latitude: coords.latitude,
        longitude: coords.longitude,
        street: normalized?.street || prev.street,
        city: normalized?.city || prev.city,
        state: normalized?.region || prev.state,
        zipCode: normalized?.postcode || prev.zipCode,
        country: normalized?.country || prev.country,
      }));
      notify.success({ message: "Ubicación seleccionada correctamente" });
    } catch (error) {
      const message = getBackendErrorMessage(error);
      notify.error({ message: message || "Error al obtener la dirección" });
    } finally {
      setMapPickerVisible(false);
    }
  };

  const handleCreateAddress = async () => {
    console.log(FormData);
    const isFormValid = validateForm(FormData);
    if (!isFormValid) {
      notify.error({
        message: "Por favor corrige los errores en el formulario",
      });
      return;
    }
    try {
      // Validate the address via Mapbox geocoding if available
      if (FormData.street && FormData.city && FormData.country) {
        const fullAddress = `${FormData.street}, ${FormData.city}, ${
          FormData.state || ""
        }, ${FormData.country}`.trim();
        const geocoded = await mapboxService.forwardGeocode(fullAddress, {
          country: "EC",
        });

        if (geocoded) {
          // Address validated successfully
          onCreateAddress(FormData);
          return;
        }
      }

      // If validation failed or no address data, just proceed
      // This allows the flow to work even when geocoding is not available
      onCreateAddress(FormData);
    } catch (e) {
      const message = getBackendErrorMessage(e);
      notify.error({ message });
    }
  };
  const handleCreateAndSubmit = async () => {
    handleCreateAddress();
    onCreateAndSubmit(FormData);
  };

  return {
    FormData,
    onChangeText,
    errors,
    handleCreateAndSubmit,
    handleCreateAddress,
    mapPickerVisible,
    setMapPickerVisible,
    handleMapPicker,
  };
};
