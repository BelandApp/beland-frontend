# PayphoneSuccessScreen

Pantalla modularizada para manejar la confirmación de transacciones Payphone (pagos y recargas).

## 📁 Estructura

```
PayphoneSuccessScreen/
├── components/           # Componentes reutilizables de UI
│   ├── LoadingSpinner.tsx
│   ├── StatusTitle.tsx
│   ├── StatusInfo.tsx
│   ├── TransactionInfo.tsx
│   ├── WalletBalanceBadge.tsx
│   ├── RedirectMessage.tsx
│   └── index.ts
├── hooks/               # Custom hooks
│   └── usePayphoneConfirmation.ts
├── utils/               # Utilidades y helpers
│   └── helpers.ts
├── constants.ts         # Constantes y configuración
├── styles.ts           # Estilos centralizados
├── types.ts            # Tipos e interfaces TypeScript
├── PayphoneSuccessScreen.tsx  # Componente principal
├── index.ts            # Exports públicos
└── README.md           # Documentación
```

## 🎯 Componentes

### `PayphoneSuccessScreen.tsx`

Componente principal que orquesta toda la funcionalidad. Utiliza el hook `usePayphoneConfirmation` y renderiza los componentes de UI.

### Components

- **LoadingSpinner**: Spinner animado durante el procesamiento
- **StatusTitle**: Título dinámico según el estado (éxito/error)
- **StatusInfo**: Información del estado de la transacción
- **TransactionInfo**: IDs de transacción y referencia
- **WalletBalanceBadge**: Badge mostrando el saldo actualizado
- **RedirectMessage**: Mensaje de redirección para recargas

## 🔧 Hooks

### `usePayphoneConfirmation()`

Hook principal que maneja toda la lógica de negocio:

**Returns:**

```typescript
{
  id: string | null;
  clientTxId: string | null;
  status: string;
  loading: boolean;
  walletBalance: number | null;
}
```

**Flujo:**

1. Lee parámetros de URL (id, clientTransactionId)
2. Lee datos de sessionStorage (QR payment data)
3. Confirma transacción con Payphone
4. Obtiene wallet del usuario
5. Procesa pago QR o recarga
6. Guarda tarjeta si viene cardToken
7. Actualiza estado y redirige

## 🛠 Utilidades

### `helpers.ts`

**Storage:**

- `getSessionStorageData()`: Lee datos de pago QR
- `clearQRPaymentData()`: Limpia datos de storage
- `savePayloadToSessionStorage()`: Guarda payload para debug
- `saveBackendResponseToSessionStorage()`: Guarda respuesta para debug

**Transaction:**

- `getTransactionParamsFromURL()`: Extrae parámetros de URL
- `confirmPayphoneTransaction()`: Confirma con API de Payphone
- `generateClientTransactionId()`: Genera UUID único

**Payloads:**

- `createRechargePayload()`: Crea payload de recarga
- `createPaymentPayload()`: Crea payload de pago QR
- `createUserCardPayload()`: Crea payload para guardar tarjeta

**Validation & Extraction:**

- `validateAmount()`: Valida monto USD
- `extractBalanceFromResponse()`: Extrae balance del backend
- `extractErrorMessage()`: Extrae mensaje de error

**Encryption:**

- `encryptCardHolder()`: Encripta nombre del titular

**Navigation:**

- `redirectAfterDelay()`: Redirige con delay

## 📝 Tipos

Todos los tipos están definidos en `types.ts`:

- `TransactionStatus`: Estados posibles de transacción
- `TransactionType`: Tipo de transacción (recharge | payment)
- `PayphoneConfirmResponse`: Respuesta de Payphone
- `BackendRechargePayload`: Payload para recarga
- `BackendPaymentPayload`: Payload para pago QR
- `SessionStorageData`: Datos de sessionStorage
- `UserCardPayload`: Payload para guardar tarjeta

## 🎨 Estilos

Los estilos están centralizados en `styles.ts` con tokens de diseño consistentes del sistema.

## ⚙️ Constantes

### Storage Keys

- `SESSION_STORAGE_KEYS`: Keys para sessionStorage
- `LOCAL_STORAGE_KEYS`: Keys para localStorage

### API

- `API_ENDPOINTS`: URLs de endpoints

### Messages

- `STATUS_MESSAGES`: Mensajes de estado

### Configuration

- `TIMING`: Delays y timeouts
- `REDIRECT_URLS`: URLs de redirección

## 🚀 Agregar Funcionalidades

### 1. Agregar nuevo componente visual

```typescript
// components/NuevoComponente.tsx
import React from "react";
import { styles } from "../styles";

interface NuevoComponenteProps {
  data: any;
}

export const NuevoComponente: React.FC<NuevoComponenteProps> = ({ data }) => {
  return <div>{/* Tu componente */}</div>;
};

// Agregar a components/index.ts
export { NuevoComponente } from "./NuevoComponente";
```

### 2. Agregar nueva utilidad

```typescript
// utils/helpers.ts
export function nuevaUtilidad(param: string): string {
  // Tu lógica
  return result;
}
```

### 3. Agregar nuevo tipo

```typescript
// types.ts
export interface NuevoTipo {
  campo1: string;
  campo2: number;
}
```

### 4. Agregar nueva constante

```typescript
// constants.ts
export const NUEVAS_CONSTANTES = {
  VALOR_1: "valor1",
  VALOR_2: "valor2",
} as const;
```

### 5. Extender el hook

```typescript
// hooks/usePayphoneConfirmation.ts
export function usePayphoneConfirmation() {
  // ... código existente
  const [nuevoEstado, setNuevoEstado] = useState(inicial);

  // Tu lógica

  return {
    // ... estados existentes
    nuevoEstado,
  };
}
```

## 📦 Uso

```typescript
import PayphoneSuccessScreen from "@screens/PayphoneSuccessScreen";

// En tu router/navegación
<Route path="/payphone-success" component={PayphoneSuccessScreen} />;
```

## 🔍 Debugging

El sistema guarda automáticamente información de debug en sessionStorage:

- `payphone_backend_qr_payload`: Payload enviado al backend
- `payphone_backend_qr_response`: Respuesta del backend

Accede desde console:

```javascript
JSON.parse(sessionStorage.getItem("payphone_backend_qr_payload"));
JSON.parse(sessionStorage.getItem("payphone_backend_qr_response"));
```

## ✅ Testing

Para testear diferentes escenarios:

1. **Recarga exitosa**: URL con parámetros válidos, sin datos QR en storage
2. **Pago QR exitoso**: URL válida + datos en sessionStorage
3. **Error de validación**: URL sin parámetros
4. **Error de Payphone**: Mock de respuesta rechazada

## 🔐 Seguridad

- El cardHolder se encripta con AES antes de guardarse
- Los tokens se validan en cada request
- Los datos sensibles se limpian del storage después de usarse
