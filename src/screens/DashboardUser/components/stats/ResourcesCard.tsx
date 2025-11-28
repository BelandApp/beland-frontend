import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Gift, Percent, Calendar } from "lucide-react-native";
import { ResourceService } from "src/services/ResourceApiService";

interface Resource {
  id: string;
  title: string;
  description?: string;
  discount_percentage?: number;
  expiry_date?: string;
  is_active: boolean;
}

export const ResourcesCard: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await ResourceService.getUserResources();
      setResources(response.data || []);
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  if (loading) {
    return null;
  }

  if (resources.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Gift size={20} color="#FF6B35" />
          <Text style={styles.title}>Mis Beneficios</Text>
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>No tienes beneficios disponibles</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Gift size={20} color="#FF6B35" />
        <Text style={styles.title}>Mis Beneficios ({resources.length})</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {resources.map((resource) => (
          <View key={resource.id} style={styles.resourceCard}>
            <View style={styles.resourceHeader}>
              {resource.discount_percentage && (
                <View style={styles.discountBadge}>
                  <Percent size={14} color="#fff" />
                  <Text style={styles.discountText}>
                    {resource.discount_percentage}%
                  </Text>
                </View>
              )}
            </View>

            <Text style={styles.resourceTitle} numberOfLines={2}>
              {resource.title}
            </Text>

            {resource.description && (
              <Text style={styles.resourceDescription} numberOfLines={2}>
                {resource.description}
              </Text>
            )}

            {resource.expiry_date && (
              <View style={styles.expiryContainer}>
                <Calendar size={12} color="#999" />
                <Text style={styles.expiryText}>
                  Vence: {formatDate(resource.expiry_date)}
                </Text>
              </View>
            )}

            <TouchableOpacity style={styles.useButton}>
              <Text style={styles.useButtonText}>Usar ahora</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    marginHorizontal: 0,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  scrollContent: {
    gap: 12,
    paddingRight: 16,
  },
  resourceCard: {
    width: 200,
    backgroundColor: "#F9F9F9",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  resourceHeader: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: 8,
  },
  discountBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4CAF50",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  discountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  resourceTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  resourceDescription: {
    fontSize: 12,
    color: "#666",
    marginBottom: 12,
    minHeight: 32,
  },
  expiryContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  expiryText: {
    fontSize: 11,
    color: "#999",
  },
  useButton: {
    backgroundColor: "#FF6B35",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  useButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  emptyState: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "#999",
    fontSize: 14,
  },
});
