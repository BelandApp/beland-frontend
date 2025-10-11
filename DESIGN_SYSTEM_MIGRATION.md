# Guía de Migración al Design System

## Resumen

Este documento explica cómo migrar componentes existentes para usar el nuevo design system de Beland.

## Design System Completado ✅

### Estructura Creada

```
src/design-system/
├── tokens/
│   ├── colors.ts      # Paleta completa de colores (brand, semantic, neutral)
│   ├── spacing.ts     # Sistema de espaciado basado en 4px
│   ├── typography.ts  # Escalas tipográficas y text styles
│   ├── shadows.ts     # Elevaciones y sombras
│   ├── theme.ts       # Tema unificado
│   └── index.ts       # Exports centralizados
└── index.ts           # Entry point principal
```

### Path Alias Configurado

```json
"@design-system/*": ["design-system/*"]
```

## Cómo Migrar Componentes

### 1. Actualizar Imports

```typescript
// ❌ Antes
import { colors } from "@/styles/colors";

// ✅ Después
import { theme } from "@design-system/tokens";
```

### 2. Usar Tokens del Design System

#### Colores

```typescript
// ❌ Antes
backgroundColor: colors.primary,
color: colors.textPrimary,

// ✅ Después
backgroundColor: theme.colors.primary[500],
color: theme.colors.text.primary,
```

#### Espaciado

```typescript
// ❌ Antes
padding: 20,
marginVertical: 8,

// ✅ Después
padding: theme.spacing[5],        // 20px
marginVertical: theme.spacing[2], // 8px
```

#### Tipografía

```typescript
// ❌ Antes
fontSize: 18,
fontWeight: "700",

// ✅ Después
fontSize: theme.textStyles.h5.fontSize,
fontWeight: theme.textStyles.h5.fontWeight as TextStyle["fontWeight"],
```

#### Sombras

```typescript
// ❌ Antes
shadowColor: "#000",
shadowOffset: { width: 0, height: 2 },
shadowOpacity: 0.1,
shadowRadius: 8,
elevation: 4,

// ✅ Después
...theme.semanticShadows.card,
```

### 3. Ejemplos de Migración Completa

#### Button Component (Migrado ✅)

- Usa `theme.colors.primary[500]` para colores
- Usa `theme.spacing[X]` para padding/margin
- Usa `theme.textStyles.button` para tipografía
- Usa `theme.semanticShadows.button` para elevación

#### Card Component (Migrado ✅)

- Usa `theme.colors.background.primary` para fondo
- Usa `theme.semanticSpacing.radius.xl` para border radius
- Usa text styles semánticos (`h5`, `caption`)

## Tokens Disponibles

### Colores Principales

- `theme.colors.brand.orange[500]` - Naranja Beland
- `theme.colors.brand.green[400]` - Verde Beland
- `theme.colors.primary[500]` - Color primario
- `theme.colors.semantic.success[500]` - Verde éxito
- `theme.colors.semantic.error[500]` - Rojo error
- `theme.colors.text.primary` - Texto principal
- `theme.colors.background.primary` - Fondo blanco

### Espaciado Común

- `theme.spacing[1]` = 4px
- `theme.spacing[2]` = 8px
- `theme.spacing[4]` = 16px
- `theme.spacing[5]` = 20px
- `theme.spacing[6]` = 24px

### Text Styles

- `theme.textStyles.h1-h6` - Headings
- `theme.textStyles.body` - Texto del cuerpo
- `theme.textStyles.button` - Texto de botones
- `theme.textStyles.caption` - Texto pequeño

## Compatibilidad

### Legacy Support

Los archivos que aún no se han migrado seguirán funcionando:

- `@/styles/colors` ahora re-exporta desde el design system
- Todos los colores legacy están mapeados

### Migración Gradual

1. Migrar componentes UI core primero (Button, Card) ✅
2. Migrar screens gradualmente
3. Eliminar archivos legacy al final

## Próximos Pasos

1. Migrar más componentes a usar el design system
2. Crear componentes adicionales (Input, Modal, etc.)
3. Expandir tokens según necesidades del proyecto

## Beneficios Obtenidos

- ✅ Consistencia visual centralizada
- ✅ Escalabilidad mejorada
- ✅ Mantenimiento simplificado
- ✅ Tipado robusto con TypeScript
- ✅ Fácil cambio de temas en el futuro
