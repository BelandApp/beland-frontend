import { useRef, useState, useCallback } from "react";
import { Dimensions, Platform, FlatList } from "react-native";

export const useCommunityCarousel = (communityResources: any[]) => {
  const communityListRef = useRef<FlatList<any> | null>(null);
  const communityScrollRef = useRef<any>(null);
  const communityX = useRef(0);
  const communityContentWidth = useRef(0);
  const communityLayoutWidth = useRef(0);
  const [communityCanLeft, setCommunityCanLeft] = useState(false);
  const [communityCanRight, setCommunityCanRight] = useState(false);
  const itemWidthRef = useRef(0);
  const currentIndexRef = useRef(0);

  const { width: screenWidth } = Dimensions.get("window");
  const isWeb = Platform.OS === "web";

  const getCardWidth = useCallback(() => {
    if (isWeb) {
      if (screenWidth > 1200) return 200;
      if (screenWidth > 768) return 180;
      return 160;
    }
    return (screenWidth - 48) / 2;
  }, [screenWidth, isWeb]);

  // Inicializar ancho estimado
  if (!itemWidthRef.current) {
    itemWidthRef.current = getCardWidth();
  }

  // Actualizar navegación del carrusel
  const updateCommunityNav = useCallback(() => {
    const idx = currentIndexRef.current || 0;
    setCommunityCanLeft(idx > 0);
    setCommunityCanRight(
      idx < Math.max(0, (communityResources || []).length - 1)
    );
  }, [communityResources]);

  // Desplazar carrusel por dirección
  const scrollCommunityBy = useCallback(
    (dir: number) => {
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
          } catch (e) {
            console.warn("Error scrolling community carousel:", e);
          }
        }
      }

      currentIndexRef.current = next;
      updateCommunityNav();
    },
    [communityResources, isWeb, getCardWidth, updateCommunityNav]
  );

  // Funciones de navegación específicas
  const scrollCommunityLeft = useCallback(
    () => scrollCommunityBy(-1),
    [scrollCommunityBy]
  );
  const scrollCommunityRight = useCallback(
    () => scrollCommunityBy(1),
    [scrollCommunityBy]
  );

  return {
    // Refs
    communityListRef,
    communityScrollRef,
    communityX,
    communityContentWidth,
    communityLayoutWidth,
    itemWidthRef,
    currentIndexRef,

    // Estado
    communityCanLeft,
    communityCanRight,

    // Funciones
    getCardWidth,
    updateCommunityNav,
    scrollCommunityBy,
    scrollCommunityLeft,
    scrollCommunityRight,
  };
};
