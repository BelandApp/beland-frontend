# Checklist de Bugs y Mejoras del Frontend

## 1. Interface para cobros

- [x] La pantalla debe ser específica solo para crear cobros.
- [x] Mostrar únicamente “ingresar el monto a cobrar” y la lista de montos generados.
- [x] El ingreso de preset no debe aparecer por defecto, solo una opción para agregarlos.
- [x] Al presionar el botón de agregar preset, mostrar el formulario y permitir ocultarlo al terminar.
- [x] Si hay presets agregados, deben aparecer arriba del formulario “ingresar el monto a cobrar”, no en la parte de preset.
- [ ] Agregar botón al lado del título “ingrese monto a cobrar” para mostrar el QR.
- [ ] El QR debe mostrarse en un modal o en la misma interfaz, con opción para imprimir y ocultar.
- [ ] Permitir ingresar montos en 0 (para entradas gratis).
- [ ] Implementar sockets para eliminar montos creados en el momento que son pagados por el usuario.

## 2. Pantalla principal sin logueo

- [ ] En la parte inferior, mostrar 4 cards (2x2) con funcionalidades/publicidad de la app.
- [ ] No mostrar opciones de la wallet interna a usuarios no logueados.
- [ ] Agregar un footer sencillo con derechos reservados.

## 3. Dashboard del usuario logueado

- [ ] Cambiar el texto “Dashboard” por “Mi Perfil” al hacer click en el nombre.
- [ ] La opción de recibir dinero debe estar para todos los usuarios.
- [ ] A usuarios sin rol USER, sumar la opción Cobrar (SUPERADMIN también debe tenerla).
- [ ] La opción de hacerse comerciante solo debe aparecer si el usuario es USER.

## Estilos

- [ ] La pantalla de cobros debe ser específica para crear cobros.
- [ ] Mostrar solo “ingresar el monto a cobrar” y la lista de montos generados.
- [ ] El ingreso de preset solo debe aparecer al presionar el botón correspondiente.
- [ ] Los presets agregados deben aparecer arriba del formulario de monto a cobrar.
- [ ] El botón para mostrar el QR debe abrir un modal o interfaz con opción de imprimir y ocultar.
