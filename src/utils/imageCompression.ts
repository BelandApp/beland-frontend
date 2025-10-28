import { Platform } from "react-native";

export interface CompressionOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  maxSizeKB?: number;
}

export interface CompressionResult {
  compressedFile: File;
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
}

/**
 * Comprime una imagen manteniendo la relación de aspecto
 * Solo funciona en plataforma web
 */
export const compressImage = async (
  file: File,
  options: CompressionOptions = {}
): Promise<CompressionResult> => {
  const {
    maxWidth = 800,
    maxHeight = 600,
    quality = 0.7,
    maxSizeKB = 500,
  } = options;

  // En móvil, retornar archivo original
  if (Platform.OS !== "web") {
    return {
      compressedFile: file,
      originalSize: file.size,
      compressedSize: file.size,
      compressionRatio: 1,
    };
  }

  return new Promise((resolve, reject) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = document.createElement("img") as HTMLImageElement;

    if (!ctx) {
      reject(new Error("No se pudo crear el contexto del canvas"));
      return;
    }

    img.onload = () => {
      try {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = img;

        // Calcular ratio de redimensionamiento
        const widthRatio = maxWidth / width;
        const heightRatio = maxHeight / height;
        const ratio = Math.min(widthRatio, heightRatio);

        // Solo redimensionar si la imagen es más grande que los límites
        if (ratio < 1) {
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        canvas.width = width;
        canvas.height = height;

        // Configurar calidad de renderizado
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        // Dibujar imagen redimensionada
        ctx.drawImage(img, 0, 0, width, height);

        // Función recursiva para ajustar calidad si el archivo sigue siendo muy grande
        const tryCompress = (currentQuality: number) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                reject(new Error("Error al comprimir la imagen"));
                return;
              }

              const compressedFile = new File([blob], file.name, {
                type: "image/jpeg",
                lastModified: Date.now(),
              });

              const compressedSizeKB = compressedFile.size / 1024;

              // Si el archivo sigue siendo muy grande y podemos reducir más la calidad
              if (compressedSizeKB > maxSizeKB && currentQuality > 0.1) {
                const newQuality = Math.max(0.1, currentQuality - 0.1);
                console.log(
                  `📸 Archivo aún grande (${compressedSizeKB.toFixed(
                    1
                  )}KB), reduciendo calidad a ${(newQuality * 100).toFixed(0)}%`
                );
                tryCompress(newQuality);
                return;
              }

              const result: CompressionResult = {
                compressedFile,
                originalSize: file.size,
                compressedSize: compressedFile.size,
                compressionRatio: file.size / compressedFile.size,
              };

              console.log(`📸 Compresión completada:`, {
                original: `${(file.size / 1024).toFixed(1)}KB`,
                compressed: `${(compressedFile.size / 1024).toFixed(1)}KB`,
                ratio: `${result.compressionRatio.toFixed(1)}x`,
                dimensions: `${width}x${height}`,
                quality: `${(currentQuality * 100).toFixed(0)}%`,
              });

              resolve(result);
            },
            "image/jpeg",
            currentQuality
          );
        };

        // Comenzar compresión con la calidad especificada
        tryCompress(quality);
      } catch (error) {
        reject(error);
      }
    };

    img.onerror = () => {
      reject(new Error("Error al cargar la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
};

/**
 * Comprime múltiples imágenes en paralelo
 */
export const compressImages = async (
  files: File[],
  options: CompressionOptions = {}
): Promise<CompressionResult[]> => {
  const compressionPromises = files.map((file) => compressImage(file, options));
  return Promise.all(compressionPromises);
};

/**
 * Valida si un archivo es una imagen válida
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
  return validTypes.includes(file.type);
};

/**
 * Convierte bytes a formato legible
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

/**
 * Obtiene información de una imagen sin cargarla completamente
 */
export const getImageInfo = (
  file: File
): Promise<{ width: number; height: number; size: string }> => {
  return new Promise((resolve, reject) => {
    if (Platform.OS !== "web") {
      resolve({
        width: 0,
        height: 0,
        size: formatFileSize(file.size),
      });
      return;
    }

    const img = document.createElement("img") as HTMLImageElement;

    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height,
        size: formatFileSize(file.size),
      });
      URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
      reject(new Error("Error al obtener información de la imagen"));
    };

    img.src = URL.createObjectURL(file);
  });
};
