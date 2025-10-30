import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Switch,
  TextInput,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import DashboardWrapper from "./components/DashboardWrapper";
import EventFormModal from "./components/eventos/EventFormModal";
import {
  adminApiService,
  EventPass,
  EventPassType,
} from "src/services/AdminApiService";
import { CustomAlert } from "src/components/ui";
import { useCustomAlert } from "src/hooks";

const EventsManagementScreen: React.FC = () => {
  const navigation = useNavigation();
  const [events, setEvents] = useState<EventPass[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchText, setSearchText] = useState("");

  // Paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [totalEvents, setTotalEvents] = useState(0);
  const [hasMorePages, setHasMorePages] = useState(false);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventPass | null>(null);

  // Alerta personalizada
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  // Confirmación de eliminación
  const [confirmDelete, setConfirmDelete] = useState<null | EventPass>(null);

  // Tipos de eventos
  const [eventTypes, setEventTypes] = useState<EventPassType[]>([]);
  const [eventTypesError, setEventTypesError] = useState<string | null>(null);

  // Modal de QR
  const [showQrModal, setShowQrModal] = useState(false);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(
    Dimensions.get("window").width
  );

  useEffect(() => {
    loadInitialData();
    loadEventTypes();

    const onChange = ({ window }: { window: any }) => {
      setWindowWidth(window.width);
    };
    const sub = Dimensions.addEventListener?.("change", onChange);
    return () => {
      if (sub && typeof sub.remove === "function") sub.remove();
    };
  }, []);

  const loadEventTypes = async () => {
    try {
      const response = await adminApiService.getEventPassTypes();
      setEventTypes(response.data || []);
      setEventTypesError(null);
    } catch (error: any) {
      setEventTypesError(
        "No se pudieron cargar los tipos de eventos desde el servidor. " +
          "Esto puede deberse a un problema temporal del backend. " +
          "Los eventos se pueden crear sin especificar tipo por ahora."
      );
      setEventTypes([]);
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);

      await loadEvents(1);
    } catch (error: any) {
      console.error("Error loading initial data:", error);
      Alert.alert(
        "Error de Conexión",
        "No se pudieron cargar los eventos. Verifica tu conexión a internet."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadEvents = async (page: number = 1) => {
    try {
      const response = await adminApiService.getEventPasses(page, 20);

      if (page === 1) {
        setEvents(response.data || []);
      } else {
        setEvents((prev) => [...prev, ...(response.data || [])]);
      }

      setCurrentPage(page);
      setTotalEvents(response.total || 0);
      setHasMorePages(
        (response.data?.length || 0) === 20 && page * 20 < (response.total || 0)
      );
    } catch (error: any) {
      console.error("Error loading events:", error);
      if (page === 1) {
        Alert.alert("Error", "No se pudieron cargar los eventos");
        setEvents([]);
      }
    }
  };

  const handleToggleEventStatus = async (
    eventId: string,
    currentStatus: boolean
  ) => {
    try {
      const newStatus = !currentStatus;

      const result = await adminApiService.toggleEventPassStatus(
        eventId,
        newStatus
      );

      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, is_active: newStatus } : event
        )
      );
    } catch (error: any) {
      console.error("Error toggling event status:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadEvents(1);
    setRefreshing(false);
  };

  const handleLoadMore = () => {
    if (hasMorePages && !loading) {
      loadEvents(currentPage + 1);
    }
  };

  const handleCreateSuccess = (newEvent: EventPass) => {
    setEvents((prev) => [newEvent, ...prev]);
    setTotalEvents((prev) => prev + 1);
  };

  const handleEditSuccess = (updatedEvent: EventPass) => {
    setEvents((prev) =>
      prev.map((event) => (event.id === updatedEvent.id ? updatedEvent : event))
    );
    setEditingEvent(null);
  };

  const handleDeleteEvent = (event: EventPass) => {
    setConfirmDelete(event);
  };

  const confirmDeleteEvent = async () => {
    if (!confirmDelete) return;
    try {
      setLoading(true);
      await adminApiService.deleteEventPass(confirmDelete.id);
      setEvents((prev) => prev.filter((e) => e.id !== confirmDelete.id));
      setTotalEvents((prev) => prev - 1);
      showCustomAlert("Éxito", "Evento eliminado correctamente", "success");
    } catch (error: any) {
      console.error("Error deleting event:", error);
      showCustomAlert("Error", "No se pudo eliminar el evento", "error");
    } finally {
      setLoading(false);
      setConfirmDelete(null);
    }
  };

  const openEditModal = (event: EventPass) => {
    setEditingEvent(event);
    setShowEditModal(true);
  };

  const openQrModal = (qrUrl: string) => {
    setSelectedQr(qrUrl);
    setShowQrModal(true);
  };

  const handleDownloadQr = async () => {
    if (!selectedQr) return;
    const filename = `qr-evento-${Date.now()}.png`;

    if (Platform.OS === "web") {
      try {
        // Create an anchor and trigger download
        const res = await fetch(selectedQr);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Error descargando QR (web):", err);
        Alert.alert("Error", "No se pudo descargar el QR");
      }
    } else {
      try {
        // Usar expo-file-system en nativo (mejor esfuerzo, puede requerir permisos)
        const FileSystem = require("expo-file-system");
        const downloadRes = await FileSystem.downloadAsync(
          selectedQr,
          FileSystem.documentDirectory + filename
        );
        console.log("QR descargado en:", downloadRes.uri);
        Alert.alert("Descarga exitosa", "El QR se guardó en tus archivos.");
      } catch (err) {
        console.error("Error descargando QR (nativo):", err);
        Alert.alert("Error", "No se pudo descargar el QR");
      }
    }
  };

  const filteredEvents = events.filter(
    (event) =>
      event.name.toLowerCase().includes(searchText.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchText.toLowerCase()) ||
      event.event_city?.toLowerCase().includes(searchText.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderEventCard = (event: EventPass) => {
    const mainImage =
      event.image_url ||
      (Array.isArray(event.images_urls) ? event.images_urls[0] : undefined);
    const isNarrow = windowWidth < 700;

    return (
      <View key={event.id} style={styles.eventCard}>
        <View style={[styles.cardRow, isNarrow && styles.cardRowMobile]}>
          {mainImage ? (
            <Image
              source={{ uri: mainImage }}
              style={[styles.leftImage, isNarrow && styles.leftImageMobile]}
            />
          ) : (
            <View
              style={[
                styles.leftImagePlaceholder,
                isNarrow && styles.leftImagePlaceholderMobile,
              ]}
            />
          )}

          <View style={[styles.rightContent, isNarrow && { marginTop: 12 }]}>
            <View style={styles.eventHeaderInline}>
              <View style={styles.eventInfo}>
                <Text style={styles.eventName}>{event.name}</Text>
                <Text style={styles.eventCode}>Código: {event.code}</Text>
              </View>

              <Switch
                value={event.is_active}
                onValueChange={() =>
                  handleToggleEventStatus(event.id, event.is_active)
                }
                trackColor={{ false: "#767577", true: "#81b0ff" }}
                thumbColor={event.is_active ? "#007AFF" : "#f4f3f4"}
              />
            </View>

            {event.description && (
              <Text style={styles.eventDescription}>{event.description}</Text>
            )}

            <View style={styles.eventDetailsInline}>
              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>📍 Lugar:</Text>
                <Text style={styles.eventDetailValue}>
                  {event.event_place || "No especificado"},{" "}
                  {event.event_city || "N/A"}
                </Text>
              </View>

              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>📅 Fecha:</Text>
                <Text style={styles.eventDetailValue}>
                  {formatDate(event.event_date)}
                </Text>
              </View>

              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>💰 Precio:</Text>
                <Text style={styles.eventDetailValue}>
                  {event.price_becoin} BeCoins
                </Text>
              </View>

              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>🎫 Tickets:</Text>
                <Text style={styles.eventDetailValue}>
                  {event.sold_tickets} / {event.limit_tickets} vendidos
                </Text>
              </View>

              <View style={styles.eventDetailRow}>
                <Text style={styles.eventDetailLabel}>🎭 Tipo:</Text>
                <Text style={styles.eventDetailValue}>
                  {eventTypes.find((t) => t.id === event.type_id)?.name ||
                    "Sin tipo"}
                </Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.eventActions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.editButton]}
            onPress={() => openEditModal(event)}
          >
            <Text style={styles.actionButtonText}>Editar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.qrButton]}
            onPress={() => openQrModal(event.qr || "")}
          >
            <Text style={styles.actionButtonText}>QR</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDeleteEvent(event)}
          >
            <Text style={styles.actionButtonText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <DashboardWrapper title="Gestión de Eventos" isLoading={loading}>
      {/* Alerta de feedback */}
      <CustomAlert
        visible={showAlert}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
        onClose={hideAlert}
      />
      {/* Confirmación de eliminación */}
      <CustomAlert
        visible={!!confirmDelete}
        title="Confirmar eliminación"
        message={
          confirmDelete
            ? `¿Estás seguro de que quieres eliminar el evento "${confirmDelete.name}"?`
            : ""
        }
        type="error"
        onClose={() => setConfirmDelete(null)}
        primaryButton={{
          text: "Eliminar",
          onPress: confirmDeleteEvent,
        }}
        secondaryButton={{
          text: "Cancelar",
          onPress: () => setConfirmDelete(null),
        }}
      />
      <View style={styles.container}>
        {/* Header con estadísticas */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{totalEvents}</Text>
            <Text style={styles.statLabel}>Total Eventos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {events.filter((e) => e.is_active).length}
            </Text>
            <Text style={styles.statLabel}>Activos</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>
              {events.reduce((sum, e) => sum + e.sold_tickets, 0)}
            </Text>
            <Text style={styles.statLabel}>Tickets Vendidos</Text>
          </View>
        </View>

        {/* Controles */}
        <View style={styles.controlsContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar eventos..."
            value={searchText}
            onChangeText={setSearchText}
          />

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}
          >
            <Text style={styles.createButtonText}>+ Crear Evento</Text>
          </TouchableOpacity>
        </View>

        {/* Alerta de error de tipos de eventos */}
        {eventTypesError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorTitle}>
              ⚠️ Problema con tipos de eventos
            </Text>
            <Text style={styles.errorMessage}>{eventTypesError}</Text>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={loadEventTypes}
            >
              <Text style={styles.retryButtonText}>🔄 Reintentar carga</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Lista de eventos */}
        <ScrollView
          style={styles.eventsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
          }
          onMomentumScrollEnd={(event) => {
            const { layoutMeasurement, contentOffset, contentSize } =
              event.nativeEvent;
            const isCloseToBottom =
              layoutMeasurement.height + contentOffset.y >=
              contentSize.height - 100;
            if (isCloseToBottom && hasMorePages) {
              handleLoadMore();
            }
          }}
        >
          {filteredEvents.map(renderEventCard)}

          {hasMorePages && (
            <TouchableOpacity
              style={styles.loadMoreButton}
              onPress={handleLoadMore}
            >
              <Text style={styles.loadMoreText}>Cargar más eventos...</Text>
            </TouchableOpacity>
          )}

          {filteredEvents.length === 0 && !loading && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>
                {searchText
                  ? "No se encontraron eventos"
                  : "No hay eventos disponibles"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Modal para crear evento */}
      <EventFormModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
        eventTypes={eventTypes}
        eventTypesError={eventTypesError}
      />

      {/* Modal para editar evento */}
      <EventFormModal
        visible={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingEvent(null);
        }}
        onSuccess={handleEditSuccess}
        editingEvent={editingEvent}
        eventTypes={eventTypes}
        eventTypesError={eventTypesError}
      />

      {/* Modal para QR */}
      <Modal
        visible={showQrModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQrModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Código QR del Evento</Text>
            {selectedQr && (
              <Image source={{ uri: selectedQr }} style={styles.qrImage} />
            )}

            {/* Botón para descargar el QR */}
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={handleDownloadQr}
            >
              <Text style={styles.downloadButtonText}>Descargar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowQrModal(false)}
            >
              <Text style={styles.closeButtonText}>Cerrar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </DashboardWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    flex: 1,
    marginHorizontal: 5,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  controlsContainer: {
    flexDirection: "row",
    marginBottom: 20,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  createButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: "center",
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  eventsList: {
    flex: 1,
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  eventHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  eventInfo: {
    flex: 1,
  },
  eventName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  eventCode: {
    fontSize: 14,
    color: "#666",
  },
  eventDescription: {
    fontSize: 14,
    color: "#555",
    marginBottom: 15,
    lineHeight: 20,
  },
  eventDetails: {
    marginBottom: 15,
  },
  eventDetailRow: {
    flexDirection: "row",
    marginBottom: 8,
  },
  eventDetailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    width: 80,
  },
  eventDetailValue: {
    fontSize: 14,
    color: "#555",
    flex: 1,
  },
  eventActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  editButton: {
    backgroundColor: "#34C759",
  },
  deleteButton: {
    backgroundColor: "#FF3B30",
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  loadMoreButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  loadMoreText: {
    color: "#666",
    fontSize: 14,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  errorContainer: {
    backgroundColor: "#FFF3E0",
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9800",
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#E65100",
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    color: "#BF360C",
    lineHeight: 20,
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: "#FF9800",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  eventImage: {
    width: 300,
    height: 150,
    borderRadius: 8,
    resizeMode: "cover",
    marginRight: 10,
  },
  imagesScrollView: {
    height: 150,
    marginBottom: 15,
  },
  qrButton: {
    backgroundColor: "#FF9500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  qrImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  downloadButton: {
    backgroundColor: "#34C759",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  downloadButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  /* Carrusel / thumbnails */
  imageWrapper: {
    position: "relative",
    marginBottom: 10,
  },
  arrowButton: {
    position: "absolute",
    top: "45%",
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.35)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  arrowText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
  thumbnailsContainer: {
    marginTop: 8,
  },
  thumbnailWrap: {
    marginRight: 8,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "transparent",
  },
  thumbnailActiveWrap: {
    marginRight: 8,
    borderRadius: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "#007AFF",
  },
  thumbnail: {
    width: 80,
    height: 50,
    resizeMode: "cover",
  },
  dotsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ddd",
    marginHorizontal: 4,
  },
  dotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#007AFF",
    marginHorizontal: 4,
  },
  /* Layout inline: imagen izquierda + contenido */
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  cardRowMobile: {
    flexDirection: "column",
    alignItems: "center",
  },
  leftImage: {
    width: 220,
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    backgroundColor: "#f0f0f0",
  },
  leftImageMobile: {
    width: "100%",
    height: 180,
    borderRadius: 10,
  },
  leftImagePlaceholder: {
    width: 220,
    height: 140,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
  },
  leftImagePlaceholderMobile: {
    width: "100%",
    height: 140,
    borderRadius: 10,
  },
  rightContent: {
    flex: 1,
  },
  eventHeaderInline: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  eventDetailsInline: {
    marginTop: 6,
  },
});

export default EventsManagementScreen;
