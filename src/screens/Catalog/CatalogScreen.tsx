import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useLayoutEffect,
} from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Modal,
  Image,
  ActivityIndicator,
  FlatList,
  Platform,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { BeCoinsBalance } from "../../components/ui/BeCoinsBalance";
import * as Haptics from "expo-haptics";

// Hooks
import { useCatalogFilters, useCatalogModals } from "./hooks";
import { useProducts } from "../../hooks/useProducts";
import { useCartSync } from "../../hooks/useCartSync";
import { ProductService, ResourceService, WalletService } from "@services/core";
import { useUserBalance } from "../../hooks/useUserBalance";
import { calculateResourcePrice } from "../../utils/priceHelpers";
import { ProductCardType } from "./components/ProductCard";
import { useAuth } from "../../hooks/AuthContext";
import { useCustomAlert } from "../../hooks/useCustomAlert";

// Components
import { AppHeader } from "../../components/layout/AppHeader";
import { SearchBar, FilterPanel, ProductGrid } from "./components";
import { ProductCard } from "./components/ProductCard";
import { OrderDeliveryModal } from "./components/OrderDeliveryModal";
import { CustomAlert } from "../../components/ui/CustomAlert";
import { UserMenu } from "../../components/ui/UserMenu";
// Comunidad: reutilizar componentes existentes (solo ResourcesGrid)
import { ResourcesGrid } from "../Community/components";
import CatalogCommunityCarouselWeb from "./components/CatalogCommunityCarousel.web";

// Styles
import { containerStyles, productStyles } from "./styles";
import {
  formatBeCoins,
  convertBeCoinsToUSD,
  formatUSDPrice,
  CURRENCY_CONFIG,
} from "../../constants/currency";

import { useCartStore } from "../../stores/useCartStore";
import { CartBottomSheet } from "./components/CartBottomSheet";
import { MaterialCommunityIcons } from "@expo/vector-icons";
// Purchase modal components from Community
import { PurchaseModal } from "../Community/components/PurchaseModal";
import { InsufficientBalanceModal } from "../Community/components";

export const CatalogScreen = () => {
  const navigation = useNavigation();
  const { canPerformAction, loginWithAuth0, isAuthenticated } = useAuth();
  const { showAlert, alertConfig, showCustomAlert, hideAlert } =
    useCustomAlert();

  const {
    addProduct: addProductToCart,
    addProductToServer,
    products: cartProducts,
  } = useCartStore();

  // Hook para sincronizar carrito con servidor
  const { isSyncing, syncError, performCartSync } = useCartSync();

  const {
    searchText,
    setSearchText,
    filters,
    setFilters,
    showFilters,
    setShowFilters,
  } = useCatalogFilters();

  const { showDeliveryModal, openDeliveryModal, closeDeliveryModal } =
    useCatalogModals();

  const [showCart, setShowCart] = useState(false);
  const [addingProductId, setAddingProductId] = useState<string | null>(null);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [allCategories, setAllCategories] = useState<
    {
      id: string;
      name: string;
    }[]
  >([]);

  const selectedCategoryId = useMemo(
    () => allCategories.find((cat) => cat.name === filters.categories[0])?.id,
    [allCategories, filters.categories]
  );

  const brands: string[] = [];

  // Guardar el orden inicial de las categorías para evitar reordenamientos
  // cuando `allCategories` se carga posteriormente (evita flicker)
  const initialCategoryOrderRef = useRef<string[] | null>(null);

  const { products, loading, error, updateQuery } = useProducts({
    page: 1,
    category_id: undefined,
    name: searchText,
    sortBy: filters.sortBy || undefined,
    order: filters.order || undefined,
  });

  // Memoize product query to avoid triggering updateQuery with equivalent objects
  const productQuery = useMemo(() => {
    return {
      page: 1,
      limit: 12,
      name: searchText,
      category_id: selectedCategoryId || undefined,
      sortBy: filters.sortBy || undefined,
      order: filters.order || undefined,
    };
  }, [searchText, selectedCategoryId, filters.sortBy, filters.order]);

  // Agrupar productos por categoría para renderizar secciones separadas
  // Ahora agrupamos por `category_id` (si existe) y resolvemos el nombre usando `allCategories`.
  // Fallback: usar `product.category` (string) si no hay `category_id`, o 'Sin categoría'.
  const groupedProducts = useMemo(() => {
    if (!products || products.length === 0)
      return [] as { category: string; items: ProductCardType[] }[];

    type Key = string; // keys will be prefixed: 'id:<id>' or 'name:<name>' or '__uncategorized'
    const map: Record<Key, ProductCardType[]> = {};

    const normalizeCategoryFromProduct = (p: any) => {
      // Try explicit category_id first
      if (p.category_id)
        return { key: `id:${String(p.category_id)}`, displayName: undefined };

      const cat = p.category;
      if (!cat) return { key: "__uncategorized", displayName: undefined };

      if (typeof cat === "string") {
        const t = cat.trim();
        return t
          ? { key: `name:${t}`, displayName: t }
          : { key: "__uncategorized", displayName: undefined };
      }

      // If category is an object, try to extract id/name
      if (typeof cat === "object") {
        const maybeId = cat.id || cat._id || cat.category_id;
        const maybeName = cat.name || cat.title || cat.label;
        if (maybeId)
          return { key: `id:${String(maybeId)}`, displayName: maybeName };
        if (maybeName)
          return {
            key: `name:${String(maybeName).trim()}`,
            displayName: String(maybeName).trim(),
          };
      }

      return { key: "__uncategorized", displayName: undefined };
    };

    products.forEach((p: any) => {
      const info = normalizeCategoryFromProduct(p);
      const key: Key = info.key;
      if (!map[key]) map[key] = [];
      map[key].push(p);
    });

    // DEBUG: mostrar sample de products y map para ayudar a diagnosticar
    try {
      // eslint-disable-next-line no-console
      console.log("[Catalog] products sample:", (products || []).slice(0, 6));
      // eslint-disable-next-line no-console
      console.log("[Catalog] map keys:", Object.keys(map).slice(0, 20));
    } catch (e) {
      /* ignore logging failures */
    }

    const entries = Object.keys(map).map((key) => {
      let categoryName: string | undefined;

      if (key === "__uncategorized") {
        categoryName = "Sin categoría";
      } else if (key.startsWith("id:")) {
        const id = key.slice(3);
        const found = allCategories.find((c) => c.id === id);
        categoryName = found ? found.name : id;
      } else if (key.startsWith("name:")) {
        categoryName = key.slice(5);
      } else {
        categoryName = key;
      }

      return { key, categoryName, items: map[key] };
    });

    // Crear y conservar un orden inicial de categorías para evitar que la UI
    // se reordene cuando `allCategories` llegue después de que los productos
    // ya se hayan renderizado. Si `allCategories` ya está presente, usar su
    // orden; si no, usar el orden de aparición en `entries`.
    if (!initialCategoryOrderRef.current) {
      if (allCategories && allCategories.length > 0) {
        // usar el orden provisto por allCategories pero filtrado a los nombres presentes
        const namesOrder = allCategories.map((c) => c.name);
        const present = entries
          .map((e) => e.categoryName)
          .filter((n) => namesOrder.includes(n));
        const others = entries
          .map((e) => e.categoryName)
          .filter((n) => !namesOrder.includes(n));
        initialCategoryOrderRef.current = [...present, ...others];
      } else {
        // fallback: orden por aparición en entries
        initialCategoryOrderRef.current = entries.map((e) => e.categoryName);
      }
    }

    const order =
      initialCategoryOrderRef.current || entries.map((e) => e.categoryName);

    // Ordenar usando el mapa de orden (si un elemento no está en el orden, caerá
    // luego a orden alfabético)
    entries.sort((a, b) => {
      const ia = order.indexOf(a.categoryName || "");
      const ib = order.indexOf(b.categoryName || "");
      if (ia !== -1 && ib !== -1) return ia - ib;
      if (ia !== -1) return -1;
      if (ib !== -1) return 1;
      return (a.categoryName || "").localeCompare(b.categoryName || "");
    });

    // Asegurarnos de que 'Productos Circulares' esté al principio si existe
    const circIdx = entries.findIndex(
      (e) => e.categoryName === "Productos Circulares"
    );
    if (circIdx > 0) {
      const [circ] = entries.splice(circIdx, 1);
      entries.unshift(circ);
    }

    return entries.map((e) => ({
      category: e.categoryName || "Sin categoría",
      items: e.items,
    }));
  }, [products, allCategories]);

  const displayGroups = useMemo(() => {
    if (groupedProducts && groupedProducts.length > 0) return groupedProducts;
    if (products && products.length > 0) {
      return [
        {
          category: "Todos",
          items: products as ProductCardType[],
        },
      ];
    }
    return [] as { category: string; items: ProductCardType[] }[];
  }, [groupedProducts, products]);

  const lastProductsQueryRef = useRef<string | null>(null);
  useEffect(() => {
    const qString = JSON.stringify(productQuery);
    if (lastProductsQueryRef.current === qString) return;
    lastProductsQueryRef.current = qString;
    updateQuery(productQuery);
  }, [productQuery]);

  useLayoutEffect(() => {
    // Cargar categorías al montar el componente para tener los nombres listos
    // antes del primer render y así evitar flicker y mostrar nombres humanos
    // en lugar de ids si es posible.
    (async () => {
      try {
        const categories = await ProductService.getCategories();
        setAllCategories(
          categories.map((cat) => ({ id: cat.id, name: cat.name }))
        );
      } catch (e: any) {
        console.error("[CATEGORIAS] Error al cargar categorías:", e);
        // No hacemos fallback inmediato aquí: si falla el servicio, intentamos
        // rellenar nombres más tarde a partir de los productos disponibles.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Si las categorías no vinieron del servicio, generar un fallback a partir
  // del campo `product.category` cuando los productos estén disponibles.
  useLayoutEffect(() => {
    if (allCategories && allCategories.length > 0) return;
    if (!products || products.length === 0) return;

    const cats = Array.from(
      new Set((products || []).map((p) => (p as any).category).filter(Boolean))
    ).map((name) => ({ id: String(name), name: String(name) }));

    if (cats.length > 0) setAllCategories(cats);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products]);

  // Comunidad: recursos
  const [communityResources, setCommunityResources] = useState<any[]>([]);
  const [communityLoading, setCommunityLoading] = useState(false);
  // Control para evitar flicker: mostrar la sección Comunidad sólo cuando
  // haya recursos y mantenerla visible si reaparece rápidamente (debounce)
  const [showCommunity, setShowCommunity] = useState(false);
  const showCommunityTimer = useRef<number | null>(null);
  // Estado para compra directa desde la vista previa de Comunidad
  const [purchaseModalVisible, setPurchaseModalVisible] = useState(false);
  const [insufficientBalanceModalVisible, setInsufficientBalanceModalVisible] =
    useState(false);
  const [selectedCommunityResource, setSelectedCommunityResource] = useState<
    any | null
  >(null);

  // Hook para balance del usuario (reutilizar comportamiento de CommunityScreen)
  const { balance, refetch: refetchBalance } = useUserBalance();

  const loadCommunityResources = async (page = 1, limit = 6) => {
    setCommunityLoading(true);
    try {
      const resp = await ResourceService.getResourceTypes();
      setCommunityResources(resp || []);
    } catch (err) {
      console.error("Error cargando recursos de comunidad:", err);
    } finally {
      setCommunityLoading(false);
    }
  };

  // Ensure community resources are loaded only once (protect against StrictMode double-effect)
  const communityLoadedRef = useRef(false);
  useLayoutEffect(() => {
    if (communityLoadedRef.current) return;
    communityLoadedRef.current = true;
    loadCommunityResources(1, 6);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Refs & state to control horizontal carousel behavior for Comunidad
  const communityListRef = useRef<FlatList<any> | null>(null);
  const communityScrollRef = useRef<any>(null); // for web ScrollView DOM node
  const communityX = useRef(0);
  const communityContentWidth = useRef(0);
  const communityLayoutWidth = useRef(0);
  const [communityCanLeft, setCommunityCanLeft] = useState(false);
  const [communityCanRight, setCommunityCanRight] = useState(false);
  const itemWidthRef = useRef(0);
  const currentIndexRef = useRef(0);

  const { width: screenWidth } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";

  const getCardWidth = () => {
    if (isWeb) {
      if (screenWidth > 1200) return 200;
      if (screenWidth > 768) return 180;
      return 160;
    }
    return (screenWidth - 48) / 2;
  };
  // initialize estimated width
  if (!itemWidthRef.current) itemWidthRef.current = getCardWidth();

  const updateCommunityNav = () => {
    const idx = currentIndexRef.current || 0;
    setCommunityCanLeft(idx > 0);
    setCommunityCanRight(
      idx < Math.max(0, (communityResources || []).length - 1)
    );
  };

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
          // react-native-web ScrollView exposes a scrollable DOM node in several places
          // try common accessors, fallback to the ref itself
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

  // Evitar parpadeo: si communityResources cambia rápidamente, no ocultar la
  // sección inmediatamente. Mostrarla inmediatamente cuando haya >0 recursos.
  useLayoutEffect(() => {
    if (showCommunityTimer.current) {
      window.clearTimeout(showCommunityTimer.current);
      showCommunityTimer.current = null;
    }

    if (communityResources && communityResources.length > 0) {
      setShowCommunity(true);
      return;
    }

    // Si no hay recursos, esperar un breve periodo antes de ocultar
    showCommunityTimer.current = window.setTimeout(() => {
      setShowCommunity(false);
      showCommunityTimer.current = null;
    }, 500);

    return () => {
      if (showCommunityTimer.current) {
        window.clearTimeout(showCommunityTimer.current);
        showCommunityTimer.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [communityResources]);

  // Si el usuario inicia sesión después de cargar la pantalla, recargar
  // recursos de comunidad y balance para que los beneficios aparezcan sin
  // necesidad de hacer refresh manual.
  useEffect(() => {
    if (isAuthenticated) {
      // Refetch balance y recursos cuando el usuario se autentique
      (async () => {
        try {
          await refetchBalance();
        } catch (e) {
          console.warn("No se pudo refrescar balance al autenticarse:", e);
        }

        try {
          // Forzar recarga de recursos de comunidad
          await loadCommunityResources(1, 6);
        } catch (e) {
          console.warn(
            "No se pudo recargar recursos de comunidad al autenticarse:",
            e
          );
        }
      })();
    }
  }, [isAuthenticated]);

  // Componente local para la sección Comunidad en el Catálogo
  const CatalogCommunitySection: React.FC = () => {
    const formatBeCoins = (n: number) => {
      if (n === null || n === undefined) return "0 BeCoins";
      if (typeof n === "number") return `${n} BeCoins`;
      return String(n);
    };

    const ResourcePreviewCard: React.FC<{ resource: any }> = ({ resource }) => {
      const priceCalc = calculateResourcePrice(resource);
      const quantity =
        typeof resource.resource_quanity === "number"
          ? resource.resource_quanity
          : resource.resource_quantity || 0;

      const imageUri = resource.resource_img || null;

      return (
        <View style={productStyles.productCard}>
          <View style={productStyles.productImageContainer}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={productStyles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  backgroundColor: "#F8F9FA",
                }}
              >
                <Text style={{ color: "#999", fontSize: 12 }}>Sin imagen</Text>
              </View>
            )}
          </View>

          <View style={{ flex: 1, width: "100%" }}>
            <Text style={productStyles.productBrand}>Mis Beneficios</Text>
            <Text style={productStyles.productName} numberOfLines={2}>
              {resource.resource_name}
            </Text>
            <Text style={productStyles.productCategory} numberOfLines={2}>
              {resource.resource_desc || ""}
            </Text>

            <View style={productStyles.productPriceRow}>
              <View style={{ flex: 1 }}>
                {/* Mostrar precio en USD y BeCoins; incluir precio original si hay descuento */}
                {(() => {
                  // Resource prices are stored in BeCoins (same as PurchaseModal)
                  const usdFinal = convertBeCoinsToUSD(priceCalc.finalPrice);
                  const usdOriginal = convertBeCoinsToUSD(
                    priceCalc.originalPrice
                  );

                  return (
                    <>
                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            fontSize: 12,
                            color: "#999",
                            marginTop: 2,
                          }}
                        >
                          Precio original:
                        </Text>
                      )}

                      {priceCalc.hasDiscount && (
                        <Text
                          style={{
                            color: "#999",
                            fontSize: 12,
                            textDecorationLine: "line-through",
                            marginTop: 2,
                          }}
                        >
                          {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                          {formatUSDPrice(usdOriginal)} c/u · (
                          {formatBeCoins(priceCalc.originalPrice)} c/u)
                        </Text>
                      )}

                      <Text style={productStyles.productPrice}>
                        {CURRENCY_CONFIG.CURRENCY_DISPLAY_SYMBOL}
                        {formatUSDPrice(usdFinal)} c/u
                      </Text>

                      <Text style={productStyles.becoinsReference}>
                        ({formatBeCoins(priceCalc.finalPrice)} c/u)
                      </Text>
                    </>
                  );
                })()}

                <Text style={productStyles.becoinsReference}>
                  {quantity} unidades
                </Text>
              </View>
              <TouchableOpacity
                style={productStyles.addToCartButton}
                onPress={() => handleCommunityPurchasePress(resource)}
              >
                <Text style={productStyles.addToCartText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      );
    };

    return (
      <View
        style={{
          marginVertical: 12,
          backgroundColor: "transparent",
        }}
      >
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

        {communityLoading ? (
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
                renderItem={(item) => (
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
                      // store the first measured width
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
                onContentSizeChange={(w, h) => {
                  communityContentWidth.current = w || 0;
                  updateCommunityNav();
                }}
                onLayout={(e) => {
                  communityLayoutWidth.current =
                    e.nativeEvent.layout.width || 0;
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
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
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
                <Text
                  style={{ fontSize: 18, color: "#fff", fontWeight: "700" }}
                >
                  ›
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
    );
  };

  // Handlers para confirmar compra desde el modal de Comunidad
  const handleCommunityModalConfirm = async (quantity: number) => {
    if (!selectedCommunityResource) return;
    try {
      const response = await WalletService.purchaseResource(
        selectedCommunityResource.id,
        quantity
      );

      const isSuccess =
        response && (response.nullResponse === true || response);

      if (!isSuccess) {
        throw new Error("Respuesta inválida del servidor");
      }

      // Cerrar modal y recargar recursos para actualizar stock
      setPurchaseModalVisible(false);
      setSelectedCommunityResource(null);
      loadCommunityResources(1, 6);
      showCustomAlert(
        "¡Compra Exitosa!",
        `Has comprado ${quantity} ${selectedCommunityResource.resource_name} exitosamente`,
        "success"
      );
    } catch (error: any) {
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

  // Equivalent of CommunityScreen.handlePurchasePress
  const handleCommunityPurchasePress = async (resource: any) => {
    if (!canPerformAction) {
      setShowAuthAlert(true);
      return;
    }

    // Refrescar balance antes de validar
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

  // Sincronizar carrito al cargar el catálogo
  useEffect(() => {
    const syncCart = async () => {
      try {
        // Sincronizar carrito con servidor usando estrategia de merge
        // para no perder productos que el usuario ya haya agregado localmente
        await performCartSync("merge");
      } catch (error) {
        // sync cart failed
      }
    };

    syncCart();
  }, []); // Solo ejecutar una vez al montar el componente

  const handleAddProduct = async (product: ProductCardType) => {
    if (!canPerformAction) {
      setShowAuthAlert(true);
      return;
    }
    // Normalize image field (backend sometimes uses `image`, sometimes `image_url`)
    const imageField =
      (product as any).image_url || (product as any).image || "";

    try {
      setAddingProductId(product.id);

      const success = await addProductToServer({
        id: product.id,
        name: product.name,
        price: Number((product as any).price || 0),
        quantity: 1,
        image: imageField,
      });

      if (success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        // Fallback local add
        addProductToCart({
          id: product.id,
          name: product.name,
          price: Number((product as any).price || 0),
          quantity: 1,
          image: imageField,
        });
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      }
    } catch (error) {
      console.error("❌ CatalogScreen: Error adding product:", error);
      // Fallback to local add
      addProductToCart({
        id: product.id,
        name: product.name,
        price: Number((product as any).price || 0),
        quantity: 1,
        image: imageField,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setAddingProductId(null);
    }
  };

  return (
    <>
      <AppHeader />
      <SafeAreaView style={containerStyles.container}>
        {/* Header */}
        <View style={containerStyles.headerContainer}>
          <View style={containerStyles.headerRow}>
            <View style={containerStyles.headerLeft}>
              <View style={containerStyles.headerTitles}>
                <Text style={containerStyles.headerTitle}>Catálogo</Text>
                <Text style={containerStyles.headerSubtitle}>
                  Productos disponibles para entrega
                </Text>
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <BeCoinsBalance
                size="medium"
                variant="header"
                style={containerStyles.coinsContainer}
                showLockedBalance={true}
              />
              {isAuthenticated && (
                <TouchableOpacity
                  style={styles.headerCartBtn}
                  onPress={() => setShowCart(true)}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons
                    name={isSyncing ? "sync" : "cart-variant"}
                    size={32}
                    color={isSyncing ? "#FFA500" : "#FF6B35"}
                    style={[
                      styles.headerCartIcon,
                      isSyncing && styles.syncingIcon,
                    ]}
                  />
                  {cartProducts.length > 0 && !isSyncing && (
                    <View style={styles.headerBadge}>
                      <Text style={styles.headerBadgeText}>
                        {cartProducts.length}
                      </Text>
                    </View>
                  )}
                  {isSyncing && (
                    <View style={styles.syncIndicator}>
                      <Text style={styles.syncText}>⟳</Text>
                    </View>
                  )}
                </TouchableOpacity>
              )}
              <UserMenu style={{ marginLeft: 12 }} />
            </View>
          </View>
        </View>

        {/* Content */}
        <ScrollView
          style={containerStyles.container}
          contentContainerStyle={containerStyles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <SearchBar searchQuery={searchText} onSearchChange={setSearchText} />

          {showFilters && (
            <FilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              categories={allCategories.map((cat) => cat.name)}
              brands={brands}
            />
          )}

          <TouchableOpacity
            style={{ marginBottom: 16, alignSelf: "flex-end" }}
            onPress={() => setShowFilters(!showFilters)}
          >
            <Text style={{ color: "#FF6B35", fontWeight: "600" }}>
              {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
            </Text>
          </TouchableOpacity>

          {/* Sección Comunidad integrada dentro del Catálogo
            Mostrar solo si hay recursos o si está cargando (para evitar mostrar
            un título vacío cuando no existan beneficios). */}
          {showCommunity && <CatalogCommunitySection />}

          {/* Productos - título y separación para mayor coherencia visual */}
          <View
            style={{
              width: "100%",
              paddingHorizontal: 8,
              marginTop: 8,
              marginBottom: 4,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                paddingHorizontal: 8,
              }}
            >
              <Text style={{ fontSize: 18, fontWeight: "700", color: "#333" }}>
                Productos
              </Text>
              {/* Puedes mantener un botón 'Ver más' aquí si se desea */}
            </View>
            <View style={{ height: 8 }} />
          </View>

          {loading ? (
            <Text style={{ textAlign: "center", marginTop: 32 }}>
              Cargando productos...
            </Text>
          ) : error ? (
            <Text style={{ color: "red", textAlign: "center", marginTop: 32 }}>
              {error}
            </Text>
          ) : (
            // Revertido a grilla de productos (estilizada)
            <View style={{ paddingVertical: 8 }}>
              {products && products.length > 0 ? (
                // Renderizar una sección por categoría
                displayGroups.map((g) => (
                  <View key={g.category} style={{ marginBottom: 18 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingHorizontal: 8,
                        marginBottom: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 16,
                          fontWeight: "700",
                          color: "#333",
                        }}
                      >
                        {g.category}
                      </Text>
                      {/* opcional: botón 'Ver todo' para categoría */}
                    </View>
                    <ProductGrid
                      products={g.items}
                      onAddToCart={handleAddProduct}
                      addingProductId={addingProductId}
                    />
                  </View>
                ))
              ) : (
                <View style={productStyles.emptyState}>
                  <Text style={productStyles.emptyStateText}>
                    No se encontraron productos
                  </Text>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {isAuthenticated && (
          <CartBottomSheet
            visible={showCart}
            onClose={() => setShowCart(false)}
            onNavigateToRecharge={() => {
              setShowCart(false);
              (navigation as any).navigate("RechargeScreen");
            }}
            onCheckout={async () => {
              setShowCart(false);

              if (cartProducts.length === 0) {
                Alert.alert(
                  "Carrito vacío",
                  "Agrega productos antes de continuar"
                );
                return;
              }

              try {
                // Mostrar loading si es necesario

                // Aquí es donde ahora procesamos el carrito al backend
                // Pero por ahora, como aún no tienes la pantalla de direcciones,
                // vamos a usar el modal de delivery existente
                const firstProduct = cartProducts[0];
                const fullProduct = products.find(
                  (p) => p.id === firstProduct.id
                );

                if (fullProduct) {
                  openDeliveryModal(fullProduct);
                } else {
                  Alert.alert(
                    "Producto no disponible",
                    "El producto seleccionado ya no está disponible en el catálogo.",
                    [{ text: "OK" }]
                  );
                }
              } catch (error) {
                console.error("Error en checkout:", error);
                Alert.alert(
                  "Error",
                  "Hubo un problema al procesar tu carrito. Inténtalo de nuevo.",
                  [{ text: "OK" }]
                );
              }
            }}
          />
        )}

        <OrderDeliveryModal
          visible={showDeliveryModal}
          onClose={closeDeliveryModal}
          onOrderCreated={(orderId: string) => {
            // Navigate to Orders tab to see the created order
            (navigation as any).navigate("Orders");
          }}
        />

        {/* Purchase modals para recursos de Comunidad (misma experiencia que CommunityScreen) */}
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
            (navigation as any).navigate("RechargeScreen");
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
            (navigation as any).navigate("RechargeScreen");
          }}
          onCancel={() => {
            setInsufficientBalanceModalVisible(false);
            setSelectedCommunityResource(null);
          }}
        />

        {/* Custom Alert para autenticación */}
        <CustomAlert
          visible={showAuthAlert}
          title="¡Inicia sesión para comprar!"
          message="Para agregar productos al carrito, necesitas tener una cuenta activa. Es rápido y seguro."
          type="info"
          onClose={() => setShowAuthAlert(false)}
          primaryButton={{
            text: "Iniciar sesión",
            onPress: () => {
              setShowAuthAlert(false);
              loginWithAuth0();
            },
          }}
          secondaryButton={{
            text: "Más tarde",
            onPress: () => setShowAuthAlert(false),
          }}
        />

        {/* Alert del hook useCustomAlert para otros mensajes */}
        <CustomAlert
          visible={showAlert}
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  headerCartBtn: {
    marginLeft: 12,
    padding: 6,
    position: "relative",
    backgroundColor: "#fff",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#FF6B35",
    elevation: 2,
    shadowColor: "#FF6B35",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  headerCartIcon: {},
  syncingIcon: {
    transform: [{ rotate: "45deg" }],
  },
  headerBadge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FF6B35",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  headerBadgeText: { color: "#fff", fontWeight: "bold", fontSize: 11 },
  syncIndicator: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#FFA500",
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 2,
    zIndex: 2,
  },
  syncText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 11,
    textAlign: "center",
  },
});
