import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  ScrollView,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
} from "react-native";
import { useNotify } from "src/hooks";
import * as mapboxService from "src/services/mapboxService";
import { EventPass, EventPassType } from "src/services/AdminApiService";
import { useEventForm } from "../../hooks/useEventForm";
import EventDateCard from "src/screens/DashboardUser/components/eventos/EventDateCard";
import { AddressMapPicker } from "@/components";
import { SafeAreaView } from "react-native-safe-area-context";

interface Props {
  visible: boolean;
  onClose: () => void;
  onSuccess: (event: EventPass) => void;
  editingEvent?: EventPass | null;
  eventTypes: EventPassType[];
}

export default function EventFormModal({
  visible,
  onClose,
  onSuccess,
  editingEvent,
  eventTypes,
}: Props) {
  const notify = useNotify();
  const [suggestions, setSuggestions] = useState<
    mapboxService.MapboxSuggestion[]
  >([]);
  const deriveCity = (s: mapboxService.MapboxSuggestion) => {
    if (!s || !s.context) return "";
    // prefer place -> locality -> region
    // @ts-ignore
    return (
      (s.context.place && (s.context.place.name as string)) ||
      // @ts-ignore
      (s.context.locality && (s.context.locality.name as string)) ||
      // @ts-ignore
      (s.context.region && (s.context.region.name as string)) ||
      ""
    );
  };
  const [query, setQuery] = useState("");
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [showEndTime, setShowEndTime] = useState(false);
  const debounceRef = useRef<number | null>(null);

  const {
    form,
    setField,
    reset,
    pickImages,
    removeImage,
    submit,
    validateForm,
    // setters for dates moved to the hook
    setEventDate,
    setEventEndDate,
    loading,
    errors,
  } = useEventForm({
    code: `EVT-${Date.now()}`,
    name: "",
    description: "",
    type_id: eventTypes?.[0]?.id || "",
    event_place: "",
    event_city: "",
    address: "",
    latitude: undefined,
    longitude: undefined,
    event_date: new Date(),
    limit_tickets: 100,
    price_usd: 0,
    discount: 0,
    is_refundable: true,
    refund_days_limit: 3,
    is_active: true,
  });

  const prevPriceRef = useRef<number>(0);

  useEffect(() => {
    const p = Number(form.price_usd) || 0;
    if (p > 0) prevPriceRef.current = p;
  }, [form.price_usd]);

  useEffect(() => {
    if (editingEvent) {
      setField("code", editingEvent.code as any);
      setField("name", editingEvent.name as any);
      setField("description", (editingEvent as any).description || "");
      setField(
        "type_id",
        (editingEvent as any).type_id || eventTypes?.[0]?.id || "",
      );
      setField("event_place", editingEvent.event_place || "");
      setField("event_city", editingEvent.event_city || "");
      setField("address", (editingEvent as any).address || "");
      setField("latitude", (editingEvent as any).latitude as any);
      setField("longitude", (editingEvent as any).longitude as any);
      setField("event_date", new Date(editingEvent.event_date) as any);
      if ((editingEvent as any).end_sale_date) {
        setField(
          "end_sale_date",
          new Date((editingEvent as any).end_sale_date) as any,
        );
      }
      setField("limit_tickets", editingEvent.limit_tickets as any);
      setField(
        "price_usd",
        parseFloat((editingEvent as any).price_usd as any) || (0 as any),
      );

      const existingImages: string[] = [];
      if ((editingEvent as any).image_url)
        existingImages.push((editingEvent as any).image_url);
      if (Array.isArray((editingEvent as any).images_urls))
        existingImages.push(...((editingEvent as any).images_urls || []));
      setField("images", existingImages as any);
    } else {
      reset();
      setField("code", `EVT-${Date.now()}` as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingEvent]);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!query || query.trim().length < 2) {
      setSuggestions([]);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      try {
        const items = await mapboxService.searchAddressSuggestions(query, {
          language: "es",
          limit: 6,
        });
        setSuggestions(items || []);
      } catch (e) {
        setSuggestions([]);
      }
    }, 300) as unknown as number;
  }, [query]);

  const onPick = async () => {
    await pickImages(notify);
  };

  const onSubmit = async () => {
    try {
      if (typeof submit !== "function") {
        if (notify?.error)
          notify.error({ message: "Error interno: submit no disponible" });
        return;
      }

      await submit({ editingEvent, notify, onSuccess, onClose, eventTypes });
    } catch (e) {
      // errors handled in hook
    }
  };

  const onMapSelect = async (coords: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      setField("latitude", coords.latitude as any);
      setField("longitude", coords.longitude as any);
      const place = await mapboxService.reverseGeocode(
        coords.latitude,
        coords.longitude,
      );
      if (place) {
        setField("address", place.full_address as any);
        // prefer a street+number when available (reverseGeocode returns `street` with number)
        setField("event_place", (place.street || place.name) as any);
        setField("event_city", place.city as any);
        // ensure we use the coordinates returned by reverseGeocode
        setField("latitude", place.coordinates.latitude as any);
        setField("longitude", place.coordinates.longitude as any);
      }
      setShowMapPicker(false);
    } catch (e) {
      console.error(e);
      setShowMapPicker(false);
    }
  };

  // helpers to sanitize numeric inputs
  const onlyDigits = (s: string) => s.replace(/\D/g, "");

  const handleTicketsChange = (t: string) => {
    const digits = onlyDigits(t);
    setField("limit_tickets", (digits ? parseInt(digits, 10) : 0) as any);
  };

  const handlePriceChange = (t: string) => {
    let sanitized = t.replace(/[^0-9.]/g, "");
    const parts = sanitized.split(".");
    if (parts.length > 2) sanitized = `${parts[0]}.${parts.slice(1).join("")}`;
    if (sanitized.includes(".")) {
      const [i, d] = sanitized.split(".");
      sanitized = `${i}.${d.slice(0, 2)}`;
    }
    const v = parseFloat(sanitized) || 0;
    if (v > 0) prevPriceRef.current = v;
    setField("price_usd", v as any);
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <SafeAreaView className="flex-1 bg-background-light">
        <View className="flex-row items-center justify-between px-4 py-3 border-b border-gray-200">
          <TouchableOpacity onPress={onClose} className="p-2 rounded-full">
            <Text className="text-lg">✕</Text>
          </TouchableOpacity>
          <Text className="text-lg font-bold">
            {editingEvent ? "Editar evento" : "Crear evento"}
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          className="px-4"
          contentContainerStyle={{ paddingBottom: 160 }}
        >
          <View className="mt-4 space-y-6 lg:flex-row lg:space-x-6 lg:items-start">
            <View className="lg:flex-2">
              <TouchableOpacity
                onPress={onPick}
                className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-100 h-48 items-center justify-center overflow-hidden"
              >
                {form.images && form.images.length > 0 ? (
                  <Image
                    source={{ uri: form.images[0] }}
                    className="absolute inset-0 w-full h-full opacity-30"
                    resizeMode="cover"
                  />
                ) : null}
                <View className="z-10 items-center justify-center">
                  <View className="w-14 h-14 bg-white rounded-full items-center justify-center mb-2">
                    <Text className="text-2xl text-primary">📷</Text>
                  </View>
                  <Text className="text-lg font-semibold">
                    Agregar foto de portada
                  </Text>
                  <Text className="text-sm text-text-secondary-light">
                    Recomendado 1200x600 px
                  </Text>
                  <View className="px-2 py-0.5 bg-orange-100 rounded">
                    <Text className="text-xs text-accent-orange">
                      Requerido
                    </Text>
                  </View>
                  {errors.images && (
                    <Text className="text-sm text-red-600">
                      {errors.images}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>

              {/* Thumbnails of selected images */}
              {form.images && form.images.length > 0 ? (
                <ScrollView horizontal className="mt-3 space-x-3">
                  {form.images.map((uri: string, idx: number) => (
                    <View
                      key={`${uri}-${idx}`}
                      className="w-20 h-20 rounded overflow-hidden relative"
                    >
                      <Image
                        source={{ uri }}
                        className="w-20 h-20"
                        resizeMode="cover"
                      />
                      <TouchableOpacity
                        onPress={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-black bg-opacity-50 rounded-full p-1"
                      >
                        <Text className="text-white text-xs">✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </ScrollView>
              ) : null}

              <View className="bg-surface-light rounded-2xl p-6 mt-6 shadow-soft">
                <Text className="text-sm font-bold text-text-secondary-light mb-1">
                  Nombre del evento
                </Text>
                <TextInput
                  value={form.name as any}
                  onChangeText={(t) => setField("name", t as any)}
                  placeholder="p.ej. Summer Vibes Festival"
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 text-xl font-bold"
                />
                {errors?.name ? (
                  <Text className="text-sm text-red-600 mt-2">
                    {errors.name}
                  </Text>
                ) : null}

                <Text className="text-sm font-bold  text-text-secondary-light mt-4 mb-2">
                  Categoría
                </Text>
                <View className="flex-row flex-wrap gap-3">
                  {(eventTypes || []).map((t) => (
                    <TouchableOpacity
                      key={t.id}
                      onPress={() => setField("type_id", t.id as any)}
                      className={`${
                        form.type_id === t.id
                          ? "bg-primary"
                          : "bg-white border border-gray-200"
                      } px-4 py-2 rounded-full`}
                    >
                      <Text
                        className={`${
                          form.type_id === t.id
                            ? "text-white"
                            : "text-text-main-light"
                        }`}
                      >
                        {t.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {errors?.type_id ? (
                  <Text className="text-sm text-red-600 mt-2">
                    {errors.type_id}
                  </Text>
                ) : null}

                <Text className="text-sm text-text-secondary-light mt-4 mb-1">
                  Descripción
                </Text>
                <TextInput
                  value={form.description as any}
                  onChangeText={(t) => setField("description", t as any)}
                  placeholder="Cuenta a la gente qué hace especial a este evento..."
                  className="w-full bg-gray-50 rounded-lg px-4 py-3 h-24 text-text-main-light"
                  multiline
                />

                <Text className="text-sm text-text-secondary-light mt-4 mb-1">
                  Código único del evento
                </Text>
                <View className="relative flex-row items-center bg-gray-50 rounded-lg px-4 py-2">
                  <Text className="text-gray-500 mr-2">#</Text>
                  <Text className="flex-1 text-text-main-light font-bold">
                    {form.code as any}
                  </Text>
                </View>
              </View>
            </View>

            <View className="lg:flex-1 space-y-6 mt-4 lg:mt-0">
              <View className="bg-surface-light rounded-2xl p-4 shadow-soft">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold">Cuándo y dónde</Text>
                  <View className="px-2 py-0.5 bg-orange-100 rounded">
                    <Text className="text-xs text-accent-orange">
                      Requerido
                    </Text>
                  </View>
                </View>

                <View className="bg-gray-50 rounded-xl p-3 border border-gray-100 mb-3">
                  <View className="flex-row gap-2">
                    <View className="flex-1">
                      <EventDateCard
                        label="Fecha inicio"
                        value={form.event_date}
                        onChange={(d) => {
                          // prefer hook setter if available
                          if (typeof (setEventDate as any) === "function") {
                            (setEventDate as any)(d);
                          } else {
                            setField("event_date", d as any);
                          }
                        }}
                      />
                    </View>
                    <View style={{ width: 12 }} />
                    <View className="flex-1">
                      {showEndTime ? (
                        <EventDateCard
                          label="Fecha fin"
                          value={(form as any).end_sale_date || form.event_date}
                          onChange={(d) => {
                            if (
                              typeof (setEventEndDate as any) === "function"
                            ) {
                              (setEventEndDate as any)(d);
                            } else {
                              setField("end_sale_date", d as any);
                            }
                          }}
                        />
                      ) : (
                        <TouchableOpacity
                          onPress={() => setShowEndTime(true)}
                          className="items-center justify-center h-full"
                        >
                          <Text className="text-sm text-text-secondary-light">
                            + Añadir hora de fin
                          </Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
                {errors?.event_date ? (
                  <Text className="text-sm text-red-600 mt-2">
                    {errors.event_date}
                  </Text>
                ) : null}

                <View className="flex-row items-center gap-2">
                  <TextInput
                    value={form.address as any}
                    onChangeText={(t) => {
                      setField("address", t as any);
                      setQuery(t as any);
                    }}
                    placeholder="Agregar ubicación "
                    className="flex-1 pl-3 bg-gray-50 rounded-lg py-3"
                  />
                  <TouchableOpacity
                    onPress={() => setShowMapPicker(true)}
                    className="px-3 py-2 bg-white rounded-lg border border-gray-200"
                  >
                    <Text className="text-primary">Seleccionar en mapa</Text>
                  </TouchableOpacity>
                </View>

                {suggestions.length > 0 && (
                  <View className="bg-white rounded-lg mt-2 p-2 shadow-sm">
                    {suggestions.map((s) => (
                      <TouchableOpacity
                        key={s.id}
                        onPress={() => {
                          // Prefer street name + number when available in suggestion context
                          const streetWithNumber =
                            s.context && (s.context as any).address
                              ? `${(s.context as any).address.street_name} ${
                                  (s.context as any).address.address_number
                                }`
                              : undefined;
                          setField("address", s.full_address as any);
                          setField(
                            "event_place",
                            (streetWithNumber || s.name) as any,
                          );
                          setField("event_city", deriveCity(s) as any);
                          // Coordinates from Mapbox feature center (lat, lng)
                          setField("latitude", s.coordinates.latitude as any);
                          setField("longitude", s.coordinates.longitude as any);
                          setSuggestions([]);
                          setQuery("");
                        }}
                        className="py-2 border-b border-gray-100"
                      >
                        <Text className="font-semibold">{s.name}</Text>
                        <Text className="text-sm text-text-secondary-light">
                          {s.full_address}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>

              <View className="bg-surface-light rounded-2xl p-4 shadow-soft">
                <View className="flex-row justify-between items-center mb-3">
                  <Text className="text-lg font-bold">Entradas</Text>
                  <TouchableOpacity>
                    <Text className="text-primary">Ajustes</Text>
                  </TouchableOpacity>
                </View>

                <View className="space-y-3">
                  <View>
                    <Text className="text-sm text-text-secondary-light mb-1">
                      Número de entradas
                    </Text>
                    <TextInput
                      value={`${(form.limit_tickets as any) || 0}`}
                      onChangeText={handleTicketsChange}
                      className="w-full bg-gray-50 rounded-lg py-2 px-3"
                      keyboardType="numeric"
                    />
                    {errors?.limit_tickets ? (
                      <Text className="text-sm text-red-600 mt-1">
                        {errors.limit_tickets}
                      </Text>
                    ) : null}
                  </View>

                  <View>
                    <Text className="text-sm text-text-secondary-light mb-1">
                      Precio por entrada
                    </Text>
                    <View className="relative">
                      <View className="absolute left-3 top-2">
                        <Text>$</Text>
                      </View>
                      <TextInput
                        value={
                          typeof form.price_usd === "number"
                            ? `${form.price_usd}`
                            : `${(form.price_usd as any) || 0}`
                        }
                        onChangeText={handlePriceChange}
                        className="w-full pl-10 bg-gray-50 rounded-lg py-2"
                        keyboardType="numeric"
                        maxLength={10}
                      />
                      {errors?.price_usd ? (
                        <Text className="text-sm text-red-600 mt-1">
                          {errors.price_usd}
                        </Text>
                      ) : null}
                    </View>
                  </View>

                  <View className="flex-row items-center justify-between pt-2">
                    <View>
                      <Text className="text-sm font-medium">
                        {Number(form.price_usd) === 0
                          ? "Evento gratuito"
                          : "Evento de pago"}
                      </Text>
                      <Text className="text-xs text-text-secondary-light">
                        {Number(form.price_usd) === 0
                          ? "No se requiere pago para la entrada"
                          : "Pago requerido para la entrada"}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        const current = Number(form.price_usd) || 0;
                        if (current === 0) {
                          setField("price_usd", prevPriceRef.current || 1);
                        } else {
                          prevPriceRef.current = current;
                          setField("price_usd", 0 as any);
                        }
                      }}
                      className="items-center"
                    >
                      <View
                        className={`w-14 h-8 rounded-full p-1 ${
                          Number(form.price_usd) === 0
                            ? "bg-gray-200"
                            : "bg-primary"
                        }`}
                      >
                        <View
                          style={{
                            width: 24,
                            height: 24,
                            borderRadius: 12,
                            backgroundColor: "#fff",
                            transform: [
                              {
                                translateX:
                                  Number(form.price_usd) === 0 ? 0 : 22,
                              },
                            ],
                          }}
                        />
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              <View>
                <TouchableOpacity
                  onPress={onSubmit}
                  disabled={loading}
                  className="w-full bg-primary rounded-xl py-4 items-center"
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text className="text-white font-bold">Crear</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
        <AddressMapPicker
          visible={showMapPicker}
          onClose={() => setShowMapPicker(false)}
          initial={
            form.latitude && form.longitude
              ? {
                  latitude: form.latitude as any,
                  longitude: form.longitude as any,
                }
              : null
          }
          onSelect={(coords) => onMapSelect(coords)}
        />
      </SafeAreaView>
    </Modal>
  );
}
