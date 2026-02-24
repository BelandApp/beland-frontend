# 🌱 Beland

**Aplicación móvil de reciclaje inteligente con incentivos BeCoins**

Beland Native es una aplicación React Native que fomenta el reciclaje responsable a través de un sistema de recompensas gamificado. Los usuarios pueden reciclar botellas en máquinas inteligentes, ganar BeCoins y canjearlos por productos sustentables.

---

## 📱 Características Principales

### ✅ **Sistema de Reciclaje Inteligente**

- 🔍 **Escáner QR** para máquinas de reciclaje
- 📊 **Tracking de botellas** recicladas en tiempo real
- 🌳 **Impacto ambiental** visualizado (árboles salvados)
- 🎯 **Ubicación de máquinas** con MapSelector integrado

### ✅ **Sistema BeCoins**

- 💰 **Wallet digital** con balance en tiempo real
- 🎁 **Marketplace de recompensas** sustentables
- 📈 **Historial de transacciones** y actividades
- 🏆 **Sistema de logros** y niveles

### ✅ **Creación de Grupos**

- 👥 **Grupos colaborativos** para reciclaje en equipo
- 📍 **Selección automática de ubicación** con mapa interactivo
- ⏰ **Programación de entregas** flexible
- 🎯 **Metas grupales** y seguimiento de progreso

### ✅ **Experiencia de Usuario Premium**

- 🎨 **Diseño modular** con componentes reutilizables
- 📱 **Interfaz nativa** optimizada para móviles
- 🔄 **Navegación fluida** con haptic feedback
- 🌙 **Modo oscuro** y personalización

---

## 🏗️ Arquitectura Técnica

### **Stack Tecnológico**

```
Frontend:     React Native + Expo SDK 51
Language:     TypeScript (100% tipado)
Navigation:   Expo Router (file-based routing)
State:        Zustand (estado global)
Maps:         OpenStreetMap + Leaflet.js + Nominatim API
Camera:       expo-camera (escáner QR)
Location:     expo-location (GPS + geocoding)
WebView:      react-native-webview (mapa integrado)
Styling:      StyleSheet nativo (modular)
```

### **Arquitectura Modular**

```
src/
├── components/           # Componentes reutilizables
│   ├── icons/           # Iconos SVG personalizados
│   ├── layout/          # Layouts y estructuras
│   ├── ui/              # Componentes de interfaz
│   └── MapSelector.tsx  # Selector de ubicación con mapa
├── screens/             # Pantallas principales
│   ├── CreateGroup/     # Creación de grupos (modular)
│   │   ├── components/  # Componentes específicos
│   │   ├── hooks/       # Hooks personalizados
│   │   └── styles/      # Estilos modulares
│   └── DashboardScreen.tsx
├── utils/               # Utilidades y servicios
│   └── locationUtils.ts # Servicios de ubicación
└── styles/
    └── colors.ts        # Paleta de colores centralizada
```

---

## 🗺️ **MapSelector**: Innovación en Selección de Ubicación

### **Problema Resuelto**

Tradicionalmente, seleccionar ubicaciones en apps móviles requiere:

- Abrir aplicaciones externas (Google Maps)
- Copiar y pegar direcciones manualmente
- Cambiar entre múltiples apps

### **Nuestra Solución: MapSelector Automático**

```typescript
// Selección automática con un solo toque
<MapSelector
  visible={showMapSelector}
  onLocationSelect={(address, coords) => {
    // Dirección y coordenadas automáticamente
    setSelectedLocation(address);
  }}
  onClose={() => setShowMapSelector(false)}
/>
```

### **Funcionalidades**

- 🗺️ **Mapa embebido** usando OpenStreetMap (sin API keys)
- 👆 **Un toque = ubicación lista** con geocodificación automática
- 📍 **Marcador visual** en tiempo real
- 🔄 **Nominatim API** para direcciones precisas
- 📱 **WebView nativo** sin dependencias externas

### **Flujo de Usuario**

1. **Toque en "🎯 Seleccionar en Mapa"**
2. **Se abre mapa interactivo integrado**
3. **Toque en cualquier punto del mapa**
4. **Marcador se coloca automáticamente**
5. **Dirección se obtiene vía geocodificación**
6. **"Confirmar Ubicación" completa el proceso**

---

## 🎯 Funcionalidades Implementadas

### **✅ Dashboard Principal**

- 📊 Balance de BeCoins en tiempo real
- 🍾 Contador de botellas recicladas
- 🌳 Impacto ambiental (árboles salvados)
- 🎁 Acceso rápido a recompensas
- 📋 Historial de actividades recientes

### **✅ Navegación Unificada**

- 🏠 **Inicio** - Dashboard principal
- 📱 **Escanear** - QR scanner para máquinas
- 🏪 **Tienda** - Marketplace de recompensas
- 👥 **Grupos** - Creación y gestión de equipos
- 🗺️ **Mapa** - Ubicaciones de máquinas
- 👤 **Perfil** - Configuración personal

### **✅ Creación de Grupos Avanzada**

- 📝 **Formulario modular** con validación TypeScript
- 📍 **3 métodos de ubicación**:

### **Instalación Rápida**

````bash
# Clonar el repositorio
git clone https://github.com/GabrieLZ19/Beland.git
cd Beland

# Instalar dependencias
npm install

# Iniciar en modo desarrollo

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos

- Node.js >= 18.0.0
- npm >= 9.0.0
- Expo CLI >= 6.0.0
- Git >= 2.30.0

### Instalación Rápida

```bash
# Clonar el repositorio
npm start
````

# Instalar dependencias

# Iniciar en modo desarrollo

### **Dependencias Principales**

````

### Scripts Disponibles

```bash
npm start          # Desarrollo con Expo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
npm run build      # Build para producción
````

---

## 🗺️ MapSelector: Selección de Ubicación Innovadora

- Mapa embebido usando OpenStreetMap (sin API keys)
- Selección automática con un toque
- Geocodificación vía Nominatim API
- Marcador visual en tiempo real
- WebView nativo sin dependencias externas

### Ejemplo de uso

```tsx
<MapSelector
  visible={showMapSelector}
  onLocationSelect={(address, coords) => setSelectedLocation(address)}
  onClose={() => setShowMapSelector(false)}
/>
```

---

## 🎯 Funcionalidades Implementadas

- Dashboard con balance de BeCoins y estadísticas
- Contador de botellas recicladas
- Impacto ambiental (árboles salvados)
- Acceso rápido a recompensas
- Historial de actividades
- Navegación unificada por tabs
- Creación de grupos avanzada con validación
- Sistema de ubicación completo (GPS, MapSelector, apps externas)
- Wallet digital con autenticación facial simulada
- Sistema de logros y niveles

---

## 📄 Roadmap de Desarrollo

### En Desarrollo

- [ ] Modo offline con sincronización
- [ ] Análisis avanzado de datos

### Próximas Versiones

- [ ] Sistema de referidos
- [ ] Integración con redes sociales
- [ ] Gamificación avanzada
- [ ] AR para ubicación de máquinas

### Metas a Largo Plazo

- [ ] Expansión regional
- [ ] Partnerships con marcas
- [ ] Impacto medible CO2
- [ ] Marketplace P2P

### Estándares de Código

- TypeScript estricto
- Componentes modulares y reutilizables
- Hooks personalizados
- Estilos organizados
- Nomenclatura descriptiva

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

## 👤 Equipo

**Gabriel Lazo** - _Full Stack Developer_
📧 Email: gabriellazo48@gmail.com
🔗 GitHub: [@GabrieLZ19](https://github.com/GabrieLZ19)
**Victor De Menezes** - _Full Stack Developer_
📧 Email: victorleandrodemenezes@gmail.com
🔗 GitHub: [@VLDeMenezes](https://github.com/VLDeMenezes)

---

## 🙏 Agradecimientos

- Expo Team
- OpenStreetMap
- Nominatim
- React Native Community

---

## 📞 Soporte

- Documentación: Wiki del proyecto
- Reportar bugs: Issues en GitHub
- Comunidad: Discord de Beland
- Contacto directo: support@beland.com

---

**🌱 Juntos hacia un futuro más sustentable con Beland** 🌱
