import { useCallback, useEffect, useState } from "react";
import { notify } from "src/hooks/notification/notify.external";
import { ConfigService } from "src/services/config/Config.service";
export interface Location extends RawLocation {
  id: string;
}
export interface RawLocation {
  name: string;
  latitude: string;
  longitude: string;
}
export const useConfig = () => {
  const [locations, SetLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalLocation, setModalLocation] = useState<Location | null>(null);
  const [temporalLocation, setTemporalLocation] = useState<Location>({
    id: "0",
    name: "",
    latitude: "",
    longitude: "",
  });
  useEffect(() => {
    loadLocations();
  }, []);
  const loadLocations = async () => {
    setLoading(true);
    try {
      const res = await ConfigService.getLocation();
      SetLocations(res.data);
    } catch (error) {}
    setLoading(false);
  };
  const refreshLocations = async () => {
    setLoading(true);
    await loadLocations();
    setLoading(false);
  };
  const openCreateModal = () => {
    setModalLocation(temporalLocation);
  };
  const openEditModal = (location: Location) => {
    setModalLocation(location);
    setTemporalLocation(location);
  };
  const setField = useCallback(
    <K extends keyof Location>(key: K, value: Location[K]) => {
      setTemporalLocation((s) => ({ ...s, [key]: value }));
    },
    [],
  );
  const closeModal = () => {
    setModalLocation(null);
    setTemporalLocation({
      id: "0",
      name: "",
      latitude: "",
      longitude: "",
    });
  };
  const createLocation = async () => {
    const rawLocation = {
      name: temporalLocation.name,
      longitude: temporalLocation.longitude,
      latitude: temporalLocation.latitude,
    };
    const res = await ConfigService.createLocation(rawLocation);
    if (res.success) {
      refreshLocations();
      notify.success({ message: "Ubicación creada correctamente" });
    } else {
      notify.error({ message: res.message });
    }
  };
  const updateLocation = async () => {
    const res = await ConfigService.updateLocation(
      temporalLocation.id,
      temporalLocation,
    );
    if (res.success) {
      refreshLocations();
      notify.success({ message: "Ubicación actualizada correctamente" });
    } else {
      notify.error({ message: res.message });
    }
  };
  const deleteLocation = async (id: string) => {
    const res = await ConfigService.deleteLocation(id);
    if (res.success) {
      refreshLocations();
      notify.success({ message: "Ubicación eliminada correctamente" });
    } else {
      notify.error({ message: res.message });
    }
  };
  return {
    locations,
    loading,
    refreshLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    modalLocation,
    openCreateModal,
    openEditModal,
    closeModal,
    setField,
    temporalLocation,
  };
};
