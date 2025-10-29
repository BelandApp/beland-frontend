import React, { useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import SwiperCore, { Navigation } from "swiper";
import "swiper/swiper-bundle.min.css";

SwiperCore.use([Navigation]);

type Props = {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
};

export const CatalogCommunityCarouselWeb: React.FC<Props> = ({
  items,
  renderItem,
}) => {
  const swiperRef = useRef<any>(null);
  const [isSmall, setIsSmall] = React.useState(false);

  React.useEffect(() => {
    const check = () => {
      if (typeof window === "undefined") return;
      setIsSmall(window.innerWidth <= 480);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return (
    <div style={{ position: "relative", overflow: "hidden" }}>
      <Swiper
        onSwiper={(s: any) => (swiperRef.current = s)}
        spaceBetween={isSmall ? 6 : 10}
        centeredSlides={isSmall}
        style={{ paddingBottom: 12 }}
        breakpoints={{
          0: {
            slidesPerView: 1,
            spaceBetween: isSmall ? 6 : 8,
            centeredSlides: isSmall,
          },
          480: { slidesPerView: 1.2, spaceBetween: 8 },
          720: { slidesPerView: 2, spaceBetween: 10 },
          1024: { slidesPerView: 3, spaceBetween: 12 },
          1400: { slidesPerView: 4, spaceBetween: 14 },
        }}
      >
        {items.map((it, idx) => (
          <SwiperSlide key={String(it.id || idx)}>
            <div
              style={{
                padding: 6,
                width: "100%",
                boxSizing: "border-box",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: isSmall ? "calc(100% - 24px)" : "100%",
                  maxWidth: isSmall ? "none" : 360,
                }}
              >
                {renderItem(it)}
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <button
        aria-label="Anterior"
        onClick={() => swiperRef.current?.slidePrev?.()}
        style={{
          position: "absolute",
          left: 8,
          top: "44%",
          zIndex: 30,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      >
        ‹
      </button>

      <button
        aria-label="Siguiente"
        onClick={() => swiperRef.current?.slideNext?.()}
        style={{
          position: "absolute",
          right: 8,
          top: "44%",
          zIndex: 30,
          background: "rgba(0,0,0,0.6)",
          color: "#fff",
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          cursor: "pointer",
        }}
      >
        ›
      </button>
    </div>
  );
};
