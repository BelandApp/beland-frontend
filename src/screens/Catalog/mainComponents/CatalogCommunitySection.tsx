import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Platform,
  Dimensions,
} from "react-native";
import { CatalogCommunityCarouselWeb,  } from "../components";
import {
  PurchaseModal,
  InsufficientBalanceModal,
} from "../../Community/components";
import { resourceService, walletService } from "src/services";

import { calculateResourcePrice } from "src/utils";
import { useAuth } from "src/context";
import { useUserBalance, useCustomAlert } from "src/hooks";

type Resource = any;

const { width: screenWidth } = Dimensions.get("window");

const getCardWidth = () => {
  if (Platform.OS === "web") {
    if (screenWidth > 1200) return 200;
    if (screenWidth > 768) return 180;
    return 160;
  }
  return (screenWidth - 48) / 2;
};

export const CatalogCommunitySection: React.FC = () => {
  const [communityResources, setCommunityResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCommunity, setShowCommunity] = useState(false);

  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] =
    useState(false);
  const [selectedCommunityResource, setSelectedCommunityResource] =
    useState<Resource | null>(null);

  const communityListRef = useRef<FlatList<any> | null>(null);
  const communityScrollRef = useRef<any>(null);
  const communityX = useRef(0);
  const communityContentWidth = useRef(0);
  const communityLayoutWidth = useRef(0);
  const [communityCanLeft, setCommunityCanLeft] = useState(false);
  const [communityCanRight, setCommunityCanRight] = useState(false);
  const itemWidthRef = useRef<number>(getCardWidth());
  const currentIndexRef = useRef(0);

  const isWeb = Platform.OS === "web";

  const { balance, refetch: refetchBalance } = useUserBalance();
  const { canPerformAction } = useAuth();
  const { showCustomAlert } = useCustomAlert();

  const updateCommunityNav = () => {
    const idx = currentIndexRef.current || 0;
    setCommunityCanLeft(idx > 0);
    setCommunityCanRight(
      idx < Math.max(0, (communityResources || []).length - 1)
    );
  };

  const loadCommunityResources = async (page = 1, limit = 6) => {
    setLoading(true);
    try {
      const resp = await resourceService.getResources({ page, limit });
      setCommunityResources(resp.resources || []);
    } catch (err) {
      console.error("Error cargando recursos de comunidad:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCommunityResources(1, 6);
    // only once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (communityResources && communityResources.length > 0) {
      setShowCommunity(true);
    } else {
      setShowCommunity(false);
    }
  }, [communityResources]);

  const scrollCommunityBy = (dir: number) => {
    const current = currentIndexRef.current || 0;
    const maxIndex = Math.max(0, (communityResources.length || 1) - 1);
    let next = current + dir;
    if (next < 0) next = 0;
    if (next > maxIndex) next = maxIndex;

    if (isWeb) {
      let node: any = null;
      try {
        if (communityScrollRef.current) {
          node =
            (communityScrollRef.current as any).getScrollableNode?.() ||
            (communityScrollRef.current as any).getNativeScrollRef?.() ||
            (communityScrollRef.current as any).scrollRef ||
            (communityScrollRef.current as any);
        }
      } catch (e) {
        node = communityScrollRef.current;
      }
      const itemWidth = itemWidthRef.current || getCardWidth();
      const gap = 16;
      const offset = next * (itemWidth + gap);
      try {
        if (node && typeof node.scrollTo === "function") {
          node.scrollTo({ left: offset, top: 0, behavior: "smooth" });
        } else if (node && typeof node.scrollLeft !== "undefined") {
          node.scrollLeft = offset;
        }
      } catch (e) {
        console.warn("No se pudo desplazar comunidad (web):", e);
      }
    } else {
      const ref = communityListRef.current as any;
      if (ref) {
        try {
          if (typeof ref.scrollToIndex === "function") {
            ref.scrollToIndex({ index: next, animated: true });
          } else if (typeof ref.scrollToOffset === "function") {
            const itemWidth = itemWidthRef.current || getCardWidth();
            const gap = 16;
            ref.scrollToOffset({
              offset: next * (itemWidth + gap),
              animated: true,
            });
          }
        } catch (e) {}
      }
    }

    currentIndexRef.current = next;
    updateCommunityNav();
  };

  const handleCommunityPurchasePress = async (resource: Resource) => {
    if (!canPerformAction) {
      showCustomAlert("Inicia sesión para comprar", "Necesitas una cuenta");
      return;
    }

    try {
      await refetchBalance();
    } catch (e) {
      console.warn("No se pudo refrescar balance:", e);
    }

    setSelectedCommunityResource(resource);

    const priceCalc = calculateResourcePrice(resource);
    const minQuantity = 1;
    const totalPrice = priceCalc.finalPrice * minQuantity;

    if ((balance || 0) < totalPrice) {
      setInsufficientBalanceModalVisible(true);
    } else {
      setPurchaseModalVisible(true);
    }
  };

  const handleCommunityModalConfirm = async (quantity: number) => {
    if (!selectedCommunityResource) return;
    try {
      const response = await walletService.purchaseResource(
        selectedCommunityResource.id,
        quantity
      );

      const isSuccess =
        response && (response.nullResponse === true || response);

      if (!isSuccess) {
        throw new Error("Respuesta inválida del servidor");
      }

      setPurchaseModalVisible(false);
      setSelectedCommunityResource(null);
      loadCommunityResources(1, 6);
      showCustomAlert(
        "¡Compra Exitosa!",
        "Compra realizada correctamente",
        "success"
      );
    } catch (error) {
      console.error("Error comprando recurso desde catálogo:", error);
      setPurchaseModalVisible(false);
      setSelectedCommunityResource(null);
      showCustomAlert(
        "Error en la compra",
        "No se pudo completar la compra",
        "error"
      );
    }
  };

  const handleCommunityModalCancel = () => {
    setPurchaseModalVisible(false);
    setSelectedCommunityResource(null);
  };

  const ResourcePreviewCard: React.FC<{ resource: Resource }> = ({
    resource,
  }) => {
    const priceCalc = calculateResourcePrice(resource);
    const quantity =
      typeof resource.resource_quanity === "number"
        ? resource.resource_quanity
        : resource.resource_quantity || 0;

    const imageUri = resource.resource_img || null;

    return (
      <View style={{ width: itemWidthRef.current }}>
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <View style={{ height: 120, backgroundColor: "#F8F9FA" }}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: "100%", height: "100%" }}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text style={{ color: "#999", fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={{ padding: 8 }}>
            <Text style={{ fontSize: 12, fontWeight: "700" }}>
              Mis Beneficios
            </Text>
            <Text numberOfLines={2} style={{ fontSize: 14, fontWeight: "600" }}>
              {resource.resource_name}
            </Text>
            <Text numberOfLines={2} style={{ color: "#666", fontSize: 12 }}>
              {resource.resource_desc || ""}
            </Text>

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: 8,
              }}
            >
              <View>
                {priceCalc.hasDiscount && (
                  <Text
                    style={{
                      fontSize: 12,
                      color: "#999",
                      textDecorationLine: "line-through",
                    }}
                  >
                    {priceCalc.originalPrice} BeCoins
                  </Text>
                )}

                <Text style={{ fontSize: 14, fontWeight: "700" }}>
                  {priceCalc.finalPrice} BeCoins
                </Text>
                <Text style={{ fontSize: 12, color: "#666" }}>
                  {quantity} unidades
                </Text>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: "#FF6B35",
                  padding: 8,
                  borderRadius: 6,
                }}
                onPress={() => handleCommunityPurchasePress(resource)}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (!showCommunity && !loading) return null;

  return (
    <View style={{ marginVertical: 12 }}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
          paddingHorizontal: 4,
        }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
          Mis Beneficios
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#FF6B35" />
      ) : communityResources.length === 0 ? (
        <View style={{ padding: 24, alignItems: "center" }}>
          <Text style={{ color: "#666" }}>No hay recursos disponibles</Text>
        </View>
      ) : (
        <View>
          {isWeb ? (
            <CatalogCommunityCarouselWeb
              items={communityResources}
              renderItem={(item: Resource) => (
                <View style={{ marginLeft: 8, marginRight: 8 }}>
                  <ResourcePreviewCard resource={item} />
                </View>
              )}
            />
          ) : (
            <FlatList
              ref={(ref) => {
                communityListRef.current = ref;
              }}
              horizontal
              data={communityResources}
              keyExtractor={(item) => String(item.id)}
              renderItem={({ item }) => (
                <View
                  style={{ marginLeft: 16, marginRight: 8 }}
                  onLayout={(e) => {
                    const w = e.nativeEvent.layout.width || 0;
                    if (!itemWidthRef.current && w > 0)
                      itemWidthRef.current = w;
                  }}
                >
                  <ResourcePreviewCard resource={item} />
                </View>
              )}
              showsHorizontalScrollIndicator={false}
              onScroll={(e) => {
                const x = e.nativeEvent.contentOffset.x || 0;
                communityX.current = x;
                const itemWidth = itemWidthRef.current || 0;
                const gap = 24;
                const full = itemWidth + gap;
                if (full > 0) {
                  const idx = Math.round(x / full);
                  currentIndexRef.current = idx;
                }
                updateCommunityNav();
              }}
              scrollEventThrottle={50}
              onContentSizeChange={(w) => {
                communityContentWidth.current = w || 0;
                updateCommunityNav();
              }}
              onLayout={(e) => {
                communityLayoutWidth.current = e.nativeEvent.layout.width || 0;
                updateCommunityNav();
              }}
              contentContainerStyle={{ paddingLeft: 8, paddingRight: 24 }}
            />
          )}

          {communityCanLeft && (
            <TouchableOpacity
              accessibilityLabel="Anterior comunidad"
              accessibilityRole="button"
              style={{
                position: "absolute",
                left: 4,
                top: "40%",
                zIndex: 10,
                backgroundColor: "#FF6B35",
                padding: 8,
                borderRadius: 22,
                elevation: 5,
              }}
              onPress={() => scrollCommunityBy(-1)}
            >
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>
                ‹
              </Text>
            </TouchableOpacity>
          )}

          {communityCanRight && (
            <TouchableOpacity
              accessibilityLabel="Siguiente comunidad"
              accessibilityRole="button"
              style={{
                position: "absolute",
                right: 4,
                top: "40%",
                zIndex: 10,
                backgroundColor: "#FF6B35",
                padding: 8,
                borderRadius: 22,
                elevation: 5,
              }}
              onPress={() => scrollCommunityBy(1)}
            >
              <Text style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}>
                ›
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <PurchaseModal
        visible={purchaseModalVisible}
        resource={selectedCommunityResource}
        userBalance={balance || 0}
        onConfirm={async (qty: number) => {
          await handleCommunityModalConfirm(qty);
        }}
        onCancel={handleCommunityModalCancel}
        onNavigateToRecharge={() => {
          setPurchaseModalVisible(false);
          setSelectedCommunityResource(null);
          // navigation handled by parent if needed
        }}
      />

      <InsufficientBalanceModal
        visible={insufficientBalanceModalVisible}
        userBalance={balance || 0}
        requiredAmount={
          selectedCommunityResource
            ? calculateResourcePrice(selectedCommunityResource).finalPrice
            : 0
        }
        onRecharge={() => {
          setInsufficientBalanceModalVisible(false);
          setSelectedCommunityResource(null);
        }}
        onCancel={() => {
          setInsufficientBalanceModalVisible(false);
          setSelectedCommunityResource(null);
        }}
      />
    </View>
  );
};

export default CatalogCommunitySection;
