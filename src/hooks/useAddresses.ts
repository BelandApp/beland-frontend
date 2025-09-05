import { useState, useEffect, useCallback } from "react";
import {
  addressService,
  UserAddress,
  CreateAddressRequest,
  UpdateAddressRequest,
} from "../services/addressService";
import { useAuth } from "./AuthContext";

// Hook para manejar direcciones del usuario
export const useAddresses = () => {
  const [addresses, setAddresses] = useState<UserAddress[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Cargar direcciones del usuario
  const loadAddresses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      const userAddresses = await addressService.getUserAddresses();
      setAddresses(userAddresses);
    } catch (err: any) {
      console.error("Error loading addresses:", err);
      setError(err.message || "Error al cargar direcciones");
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Crear nueva dirección
  const createAddress = useCallback(
    async (addressData: CreateAddressRequest) => {
      try {
        setLoading(true);
        setError(null);

        // Validar datos antes de enviar
        const validationErrors = addressService.validateAddress(addressData);
        if (validationErrors.length > 0) {
          setError(validationErrors.join(", "));
          return null;
        }

        const newAddress = await addressService.createAddress(addressData);

        // Recargar direcciones después de crear
        await loadAddresses();
        return newAddress;
      } catch (err: any) {
        console.error("Error creating address:", err);
        setError(err.message || "Error al crear dirección");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadAddresses]
  );

  // Actualizar dirección existente
  const updateAddress = useCallback(
    async (addressId: string, addressData: UpdateAddressRequest) => {
      try {
        setLoading(true);
        setError(null);

        const updatedAddress = await addressService.updateAddress(
          addressId,
          addressData
        );

        // Recargar direcciones después de actualizar
        await loadAddresses();
        return updatedAddress;
      } catch (err: any) {
        console.error("Error updating address:", err);
        setError(err.message || "Error al actualizar dirección");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [loadAddresses]
  );

  // Eliminar dirección
  const deleteAddress = useCallback(
    async (addressId: string) => {
      try {
        setLoading(true);
        setError(null);

        await addressService.deleteAddress(addressId);

        // Recargar direcciones después de eliminar
        await loadAddresses();
        return true;
      } catch (err: any) {
        console.error("Error deleting address:", err);
        setError(err.message || "Error al eliminar dirección");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadAddresses]
  );

  // Marcar dirección como predeterminada
  const setDefaultAddress = useCallback(
    async (addressId: string) => {
      try {
        setLoading(true);
        setError(null);

        await addressService.setDefaultAddress(addressId);

        // Recargar direcciones después de cambiar predeterminada
        await loadAddresses();
        return true;
      } catch (err: any) {
        console.error("Error setting default address:", err);
        setError(err.message || "Error al establecer dirección predeterminada");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [loadAddresses]
  );

  // Obtener dirección predeterminada
  const getDefaultAddress = useCallback(() => {
    return addresses.find((addr) => addr.isDefault) || null;
  }, [addresses]);

  // Obtener dirección por ID
  const getAddressById = useCallback(
    (addressId: string) => {
      return addresses.find((addr) => addr.id === addressId) || null;
    },
    [addresses]
  );

  // Validar dirección
  const validateAddress = useCallback(
    (addressData: Partial<CreateAddressRequest>) => {
      return addressService.validateAddress(addressData);
    },
    []
  );

  // Formatear dirección para mostrar
  const formatAddress = useCallback((address: UserAddress) => {
    const parts = [address.addressLine1];

    if (address.addressLine2) {
      parts.push(address.addressLine2);
    }

    parts.push(address.city);

    if (address.state) {
      parts.push(address.state);
    }

    if (address.postalCode) {
      parts.push(address.postalCode);
    }

    parts.push(address.country);

    return parts.join(", ");
  }, []);

  // Cargar direcciones cuando el usuario esté disponible
  useEffect(() => {
    if (user) {
      loadAddresses();
    }
  }, [user, loadAddresses]);

  return {
    addresses,
    loading,
    error,
    loadAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
    getAddressById,
    validateAddress,
    formatAddress,
  };
};
