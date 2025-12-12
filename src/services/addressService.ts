import { CoreApiService } from "@/services/core/ApiService";
const core = new CoreApiService();

// Types para direcciones de usuario
export interface UserAddress {
  id: string;
  user_id: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface CreateAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  country: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault: boolean;
}

export interface UpdateAddressRequest {
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
  isDefault?: boolean;
}

class AddressService {
  // Obtener todas las direcciones del usuario
  async getUserAddresses(): Promise<UserAddress[]> {
    try {
      const response = await core.get(`/user-address`);

      // El backend puede retornar el array directamente o dentro de varias propiedades
      // Soportamos: response (array), response.addresses, response.data, response.items, response.results
      let addressesRaw: any = [];
      if (Array.isArray(response)) {
        // Algunos backends devuelven [items, meta] -> p.ej. [ [addresses], total ]
        if (Array.isArray(response[0])) {
          addressesRaw = response[0];
        } else {
          // Si el backend retorna [UserAddress[], number], entonces response[0] son las direcciones
          addressesRaw = response[0] || [];
        }
      } else if (Array.isArray((response as any).addresses)) {
        addressesRaw = (response as any).addresses;
      } else if (Array.isArray((response as any).data)) {
        addressesRaw = (response as any).data;
      } else if (Array.isArray((response as any).items)) {
        addressesRaw = (response as any).items;
      } else if (Array.isArray((response as any).results)) {
        addressesRaw = (response as any).results;
      } else if (response && Array.isArray((response as any).data?.items)) {
        addressesRaw = (response as any).data.items;
      } else if (response && Array.isArray((response as any).data?.results)) {
        addressesRaw = (response as any).data.results;
      } else {
        // Fallback: try to pick any array-valued prop
        const anyArrayProp = Object.keys(response || {}).find((k) =>
          Array.isArray((response as any)[k])
        );
        addressesRaw = anyArrayProp ? (response as any)[anyArrayProp] : [];
      }

      // Aplanar cualquier anidamiento accidental y devolver
      const flattened = Array.isArray(addressesRaw)
        ? (addressesRaw as any[]).flat(Infinity)
        : [];

      return (flattened || []).map(this.mapAddressResponse);
    } catch (error) {
      console.error("Error getting user addresses:", error);
      throw error;
    }
  }

  // Crear nueva dirección
  async createAddress(data: CreateAddressRequest): Promise<UserAddress> {
    try {
      const response = await core.post(`/user-address`, data);

      // Normalize possible wrapped responses. Backend might return:
      // - the address object directly
      // - { data: address }
      // - { address: address }
      // - [address] or [[address], meta]
      let addressRaw: any = response;
      if (response && typeof response === "object") {
        if (
          (response as any).data &&
          typeof (response as any).data === "object" &&
          !Array.isArray((response as any).data)
        ) {
          addressRaw = (response as any).data;
        } else if ((response as any).address) {
          addressRaw = (response as any).address;
        } else if (Array.isArray(response)) {
          if (
            response.length > 0 &&
            Array.isArray(response[0]) &&
            response[0].length > 0
          ) {
            addressRaw = response[0][0];
          } else if (response.length > 0 && typeof response[0] === "object") {
            addressRaw = response[0];
          }
        }
      }

      return this.mapAddressResponse(addressRaw);
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  }

  // Actualizar dirección existente
  async updateAddress(
    addressId: string,
    data: UpdateAddressRequest
  ): Promise<UserAddress> {
    try {
      const response = await core.put(`/user-address/${addressId}`, data);
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  }

  // Eliminar dirección
  async deleteAddress(addressId: string): Promise<void> {
    try {
      await core.delete(`/user-address/${addressId}`);
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  }

  // Obtener dirección por ID
  async getAddressById(addressId: string): Promise<UserAddress> {
    try {
      const response = await core.get(`/user-address/${addressId}`);
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error getting address by ID:", error);
      throw error;
    }
  }

  // Helper para mapear respuesta del backend
  private mapAddressResponse(response: any): UserAddress {
    const r = response || {};
    return {
      id: r.id,
      user_id: r.user_id,
      addressLine1:
        r.addressLine1 || r.address_line_1 || r.street || r.address || "",
      addressLine2:
        r.addressLine2 || r.address_line_2 || r.additionalInfo || "",
      city: r.city || r.town || "",
      state: r.state || r.province || "",
      country: r.country || "",
      postalCode: r.postalCode || r.postal_code || r.zip || "",
      latitude:
        r.latitude !== undefined ? parseFloat(String(r.latitude)) : undefined,
      longitude:
        r.longitude !== undefined ? parseFloat(String(r.longitude)) : undefined,
      isDefault: !!(r.isDefault || r.is_default),
      created_at: r.created_at ? new Date(r.created_at) : new Date(),
      updated_at: r.updated_at ? new Date(r.updated_at) : new Date(),
    };
  }

  // Validar formato de dirección
  validateAddress(address: Partial<CreateAddressRequest>): string[] {
    const errors: string[] = [];

    if (!address.addressLine1?.trim()) {
      errors.push("La dirección es requerida");
    }

    if (!address.city?.trim()) {
      errors.push("La ciudad es requerida");
    }

    if (!address.country?.trim()) {
      errors.push("El país es requerido");
    }

    if (address.latitude && (address.latitude < -90 || address.latitude > 90)) {
      errors.push("Latitud inválida");
    }

    if (
      address.longitude &&
      (address.longitude < -180 || address.longitude > 180)
    ) {
      errors.push("Longitud inválida");
    }

    return errors;
  }

  // Marcar dirección como predeterminada
  async setDefaultAddress(addressId: string): Promise<UserAddress> {
    try {
      const response = await core.put(`/user-address/${addressId}/default`);
      return this.mapAddressResponse(response);
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  }
}

export const addressService = new AddressService();
