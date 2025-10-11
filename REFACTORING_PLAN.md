# 🚀 Plan de Refactorización Beland Frontend

## 📋 Resumen Ejecutivo

El frontend de Beland necesita una refactorización integral para mejorar:

- **Mantenibilidad**: Estructura de código más limpia y organizada
- **Performance**: Optimización de componentes y bundle size
- **Developer Experience**: Imports más claros y componentes reutilizables
- **Consistencia UI**: Sistema de diseño unificado

## 🔍 Problemas Identificados

### 1. **📦 Duplicación de Componentes UI**

```
❌ Componentes duplicados:
- Button.tsx (35 líneas) vs EnhancedButton.tsx (180 líneas)
- Card.tsx vs EnhancedCard.tsx
- Input.tsx vs EnhancedInput.tsx

✅ Solución: Consolidar en componentes únicos más flexibles
```

### 2. **🔗 Estructura de Importaciones Caótica**

```tsx
❌ Actual:
import { AppHeader } from "../../components/layout/AppHeader";
import { useBeCoinsStore } from "../../stores/useBeCoinsStore";

✅ Objetivo:
import { AppHeader } from "@/components/layout/AppHeader";
import { useBeCoinsStore } from "@/stores/useBeCoinsStore";
```

### 3. **🌐 Sobrecarga de Servicios (23 archivos)**

```
❌ Servicios fragmentados:
- addressService.ts, bankAccountService.ts, categoryService.ts...
- Cada uno con su propia configuración HTTP
- Sin abstracción común

✅ Solución: ApiService base + servicios especializados
```

### 4. **💾 Múltiples Stores Fragmentados (8 stores)**

```
❌ Stores actuales:
- useAuthTokenStore, useBeCoinsStore, useCartStore
- useCreateGroupStore, useOrdersStore, useOrdersStoreAPI

✅ Objetivo: Consolidar stores relacionados
```

### 5. **📄 Archivos Masivos**

```
❌ Archivos problemáticos:
- DiscountsModal.tsx: 550 líneas
- AuthContext.tsx: 470 líneas
- HomeScreen.tsx: 216 líneas (aceptable pero mejorable)

✅ Objetivo: Máximo 200 líneas por archivo
```

### 6. **🎨 Sistema de Diseño Inconsistente**

```
❌ Solo colors.ts básico
- Sin tokens de espaciado
- Sin tipografía estandarizada
- Sin theme system

✅ Objetivo: Design System completo
```

---

## 🎯 Plan de Ejecución (8 Fases)

### **FASE 1: Configurar Path Aliases** 🔧

**Prioridad: CRÍTICA** | **Tiempo: 30min** | **Impacto: ALTO**

**Archivos a modificar:**

- `app.config.js` - Agregar path mapping
- `tsconfig.json` - Configurar baseUrl y paths

**Cambios:**

```json
// tsconfig.json
{
  "baseUrl": "./src",
  "paths": {
    "@/*": ["*"],
    "@/components/*": ["components/*"],
    "@/hooks/*": ["hooks/*"],
    "@/stores/*": ["stores/*"],
    "@/services/*": ["services/*"],
    "@/styles/*": ["styles/*"],
    "@/types/*": ["types/*"],
    "@/utils/*": ["utils/*"]
  }
}
```

**Archivos afectados para migrar:** ~50+ archivos con imports relativos

---

### **FASE 2: Consolidar Components UI** 🎨

**Prioridad: ALTA** | **Tiempo: 2h** | **Impacto: MEDIO**

#### 2.1 Unificar Button Components

**Archivos:**

- `src/components/ui/Button.tsx` (eliminar)
- `src/components/ui/EnhancedButton.tsx` (expandir)

**Nueva estructura:**

```tsx
// @/components/ui/Button.tsx
interface ButtonProps {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "small" | "medium" | "large";
  loading?: boolean;
  disabled?: boolean;
  icon?: ReactNode;
  // ... más props
}
```

#### 2.2 Unificar Card Components

**Archivos:**

- `src/components/ui/Card.tsx` (eliminar)
- `src/components/ui/EnhancedCard.tsx` (renombrar a Card.tsx)

#### 2.3 Actualizar imports en archivos dependientes

**Archivos estimados:** ~30 archivos

---

### **FASE 3: Crear Design System** 🎭

**Prioridad: ALTA** | **Tiempo: 1.5h** | **Impacto: ALTO**

**Estructura nueva:**

```
src/design-system/
├── tokens/
│   ├── colors.ts
│   ├── spacing.ts
│   ├── typography.ts
│   └── shadows.ts
├── components/
│   ├── Button/
│   ├── Card/
│   └── Input/
└── theme/
    ├── lightTheme.ts
    └── darkTheme.ts
```

**Archivos a crear:**

- `src/design-system/tokens/spacing.ts`
- `src/design-system/tokens/typography.ts`
- `src/design-system/theme/index.ts`

---

### **FASE 4: Consolidar Servicios API** 🌐

**Prioridad: MEDIA** | **Tiempo: 3h** | **Impacto: ALTO**

#### 4.1 Crear ApiService Base

```tsx
// @/services/core/ApiService.ts
class ApiService {
  private baseURL: string;
  private headers: HeadersInit;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.headers = { "Content-Type": "application/json" };
  }

  async get<T>(endpoint: string): Promise<T>;
  async post<T>(endpoint: string, data: any): Promise<T>;
  // ... métodos base
}
```

#### 4.2 Refactorizar servicios específicos

**Servicios a consolidar:**

- `authService.ts` + `userService.ts` → `UserService.ts`
- `cartService.ts` + `orderService.ts` → `OrderService.ts`
- `becoinsService.ts` + `walletService.ts` → `WalletService.ts`

---

### **FASE 5: Optimizar Stores** 💾

**Prioridad: MEDIA** | **Tiempo: 2h** | **Impacto: MEDIO**

#### 5.1 Consolidar stores relacionados

```tsx
// Antes (3 stores):
useAuthTokenStore;
useBeCoinsStore;
useUserBalance;

// Después (1 store):
useUserStore(auth + balance + becoins);
```

#### 5.2 Stores resultantes objetivo:

- `useUserStore` (auth + balance + becoins)
- `useCartStore` (mantener)
- `useOrdersStore` (consolidar useOrdersStore + useOrdersStoreAPI)
- `useGroupsStore` (consolidar useCreateGroupStore + groupStores)

---

### **FASE 6: Modularizar Screens Grandes** 📄

**Prioridad: MEDIA** | **Tiempo: 4h** | **Impacto: MEDIO**

#### 6.1 DiscountsModal.tsx (550 líneas)

**Dividir en:**

```
DiscountsModal/
├── index.tsx (main component ~100 líneas)
├── components/
│   ├── CouponCard.tsx
│   ├── CouponsList.tsx
│   ├── AppliedCoupons.tsx
│   └── CouponDetails.tsx
└── hooks/
    ├── useDiscounts.ts
    └── useCoupons.ts
```

#### 6.2 AuthContext.tsx (470 líneas)

**Dividir en:**

```
auth/
├── AuthContext.tsx (~150 líneas)
├── hooks/
│   ├── useAuth.ts
│   ├── useAuthStorage.ts
│   └── useAuthValidation.ts
└── utils/
    ├── authStorage.ts
    └── authValidation.ts
```

---

### **FASE 7: Migrar AuthContext** 🔐

**Prioridad: BAJA** | **Tiempo: 2h** | **Impacto: MEDIO**

#### 7.1 Extraer hooks especializados

- `useAuthStorage` - manejo de tokens
- `useAuthValidation` - validación de usuario
- `useAuthRequire` - guards de autenticación

#### 7.2 Simplificar contexto principal

- Solo estado global necesario
- Delegar lógica a hooks especializados

---

### **FASE 8: Barrel Exports** 📦

**Prioridad: BAJA** | **Tiempo: 1h** | **Impacto: BAJO**

#### 8.1 Completar index.ts faltantes

**Directorios objetivo:**

- `src/components/` (parcialmente completo)
- `src/hooks/` (falta index.ts)
- `src/services/` (falta index.ts)
- `src/types/` (falta index.ts)

#### 8.2 Estandarizar exports

```tsx
// @/components/ui/index.ts
export { Button } from "./Button";
export { Card } from "./Card";
export { Input } from "./Input";
// ... resto de componentes
```

---

## 📊 Cronograma y Prioridades

| Fase               | Prioridad  | Tiempo | Archivos afectados | Impacto  |
| ------------------ | ---------- | ------ | ------------------ | -------- |
| 1. Path Aliases    | 🔴 CRÍTICA | 30min  | ~50 archivos       | 🔥 ALTO  |
| 2. Components UI   | 🟡 ALTA    | 2h     | ~30 archivos       | 🔥 MEDIO |
| 3. Design System   | 🟡 ALTA    | 1.5h   | ~20 archivos       | 🔥 ALTO  |
| 4. Servicios API   | 🟢 MEDIA   | 3h     | ~25 archivos       | 🔥 ALTO  |
| 5. Stores          | 🟢 MEDIA   | 2h     | ~15 archivos       | 🔥 MEDIO |
| 6. Screens Grandes | 🟢 MEDIA   | 4h     | ~10 archivos       | 🔥 MEDIO |
| 7. AuthContext     | 🔵 BAJA    | 2h     | ~5 archivos        | 🔥 MEDIO |
| 8. Barrel Exports  | 🔵 BAJA    | 1h     | ~10 archivos       | 🔥 BAJO  |

**⏱️ Tiempo total estimado: 16 horas**
**📁 Archivos totales afectados: ~165 archivos**

---

## 🎯 Métricas de Éxito

### **Antes vs Después**

| Métrica                     | Antes   | Objetivo |
| --------------------------- | ------- | -------- |
| Líneas promedio por archivo | 150-550 | < 200    |
| Imports relativos profundos | 50+     | 0        |
| Componentes duplicados      | 6+      | 0        |
| Servicios fragmentados      | 23      | ~12      |
| Stores fragmentados         | 8       | ~4       |
| Archivos > 300 líneas       | 5+      | 0        |

### **Beneficios Esperados**

- ⚡ **Bundle size**: -15% por eliminación de duplicados
- 🛠️ **Developer velocity**: +30% por imports y estructura clara
- 🐛 **Bug reduction**: -25% por código más mantenible
- 📱 **UI consistency**: +100% por design system

---

## 🚀 Orden de Ejecución Recomendado

### **Sprint 1 (Crítico - 4h)**

1. ✅ Configurar Path Aliases (30min)
2. ✅ Consolidar Button Components (2h)
3. ✅ Crear Design System básico (1.5h)

### **Sprint 2 (Alto impacto - 6h)**

4. ✅ Consolidar Servicios API (3h)
5. ✅ Optimizar Stores (2h)
6. ✅ Modularizar DiscountsModal (1h)

### **Sprint 3 (Pulir - 6h)**

7. ✅ Migrar AuthContext (2h)
8. ✅ Modularizar otros screens grandes (3h)
9. ✅ Completar Barrel Exports (1h)

---

## 🛠️ Comandos Útiles

### **Buscar archivos problemáticos:**

```bash
# Archivos con imports relativos profundos
grep -r "\.\./" src/ --include="*.tsx" --include="*.ts"

# Archivos grandes (>300 líneas)
find src/ -name "*.tsx" -o -name "*.ts" | xargs wc -l | sort -nr | head -10

# Componentes duplicados
find src/components -name "*Enhanced*" -o -name "*Basic*"
```

### **Refactoring helpers:**

```bash
# Reemplazar imports en masa (ejemplo)
find src/ -name "*.tsx" -o -name "*.ts" | xargs sed -i 's|../../components|@/components|g'

# Verificar builds después de cambios
npm run build
```

---

## ⚠️ Riesgos y Mitigaciones

| Riesgo                      | Probabilidad | Impacto | Mitigación                                        |
| --------------------------- | ------------ | ------- | ------------------------------------------------- |
| Breaking changes en imports | ALTA         | ALTO    | Hacer cambios incrementales, una carpeta a la vez |
| Conflictos con Expo cache   | MEDIA        | MEDIO   | Limpiar cache: `npx expo start -c`                |
| Pérdida de funcionalidad UI | BAJA         | ALTO    | Testing exhaustivo antes/después                  |
| Regresiones en auth         | BAJA         | ALTO    | Mantener tests para AuthContext                   |

---

## 📝 Notas de Implementación

### **Prerrequisitos:**

- ✅ Backend funcionando en localhost:3001
- ✅ Expo Dev Server funcionando
- ✅ Git branch limpio para rollback

### **Durante el refactoring:**

- 🔄 Commits frecuentes por fase
- 🧪 Testing manual después de cada cambio mayor
- 📸 Screenshots para comparar UI antes/después
- 🚨 Monitoring de errores en consola

### **Post-refactoring:**

- 📚 Actualizar documentación de componentes
- 🎓 Guía de uso del nuevo design system
- 📋 Checklist para futuros contributors

---

**Última actualización:** 10 de octubre de 2025
**Versión:** 1.0
**Estado:** ✅ Listo para comenzar
