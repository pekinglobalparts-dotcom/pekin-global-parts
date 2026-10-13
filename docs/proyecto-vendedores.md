# Proyecto: Cartera de clientes por vendedor (multi-vendedor)

> **Estado:** especificado y aprobado por el dueño (Óscar). Pendiente de construir.
> **Cuándo arrancar:** cuando el dueño diga "dale con los vendedores".
> Este documento es la fuente de verdad. No volver a preguntar lo ya definido aquí.

## Contexto / problema que resuelve

Hoy solo existe un usuario **SUPER_ADMIN** (el dueño) que ve y administra todo.
Más adelante habrá **varios vendedores**, cada uno con su propio usuario.

El objetivo es **proteger la cartera de cada vendedor y las comisiones**:
evitar que un vendedor **espíe el historial de clientes de un compañero**
(qué compran, cada cuánto reponen, cuánto pagan) y use esa información para
**adelantarse y quitarle la venta**.

**Importante:** la venta **nunca se pierde**. Si un cliente de un vendedor
contacta a otro, la venta igual se hace y se registra. Lo único que se bloquea
es el **acceso a la información del cliente ajeno**.

## Modelo central (dos conceptos SEPARADOS)

1. **El CLIENTE tiene dueño → controla quién lo VE.**
   - El cliente pertenece al vendedor que lo **registró / atiende**.
   - Solo ese vendedor ve su **información e historial completo**.
   - Ningún otro vendedor puede ver ni espiar ese cliente.

2. **La VENTA se acredita a quien la CONCRETÓ → controla la COMISIÓN.**
   - Si el vendedor B le cierra una venta a un cliente del vendedor A,
     **la comisión de esa venta es de B** (quien la cerró esta vez).
   - El cliente **sigue siendo de A** para la cartera (visibilidad), pero
     esa venta puntual queda acreditada a **B**.

> Resumen en una frase: **el cliente es de quien lo cuida; la venta es de quien la cierra.**

## Reglas de visibilidad

| Usuario        | Qué ve |
|----------------|--------|
| **Vendedor**   | Solo **sus** clientes, prospectos, cotizaciones, pedidos y ventas, con todo el detalle. |
| **Super admin** (dueño) | **Todo de todos**, con la etiqueta de **quién registró, quién vendió y quién da seguimiento** a cada cliente/venta. Puede **filtrar por vendedor**. |

## Decisiones ya tomadas por el dueño

- **Tablero de ventas del día (compartido):**
  Todos los vendedores ven un **ranking con montos** (nombre del vendedor +
  cuánto vendió hoy / este mes), para motivar competencia sana,
  **PERO sin ver el cliente ni el detalle** de la venta ajena.

- **Cliente repetido (mismo RUC):**
  Si un vendedor intenta registrar/atender un cliente que **ya tiene dueño**,
  se **permite seguir**, pero el cliente **queda del que lo registró primero**.
  El intento queda **marcado** y le aparece al **super admin** para revisarlo.

- **Venta cruzada (cliente de A, cerrada por B):**
  La venta (y su comisión) se acredita **al que la concretó (B)**.
  El cliente sigue perteneciendo a A para efectos de cartera.

- **Reasignación:** solo el **super admin** puede reasignar un cliente de un
  vendedor a otro.

## Alcance técnico (para cuando se construya)

- Nuevo rol de usuario **VENDEDOR** (además de SUPER_ADMIN / ADMIN actuales).
- Campo **dueño/vendedor** (`vendedorId`) en: Cliente/Socio (o su ficha CRM),
  Prospecto, Cotización, Pedido y Venta de mostrador.
  - En el cliente: el **dueño de la cartera** (visibilidad).
  - En cada venta/pedido: el **vendedor que la concretó** (comisión).
- **Filtro automático de visibilidad** por `vendedorId` en todas las vistas de
  vendedor (backend, no solo ocultar en la UI).
- **Etiqueta de atribución** visible para el super admin:
  "registrado por X · vendido por Y · seguimiento Z".
- **Protección anti-robo**: aviso de cliente ya asignado (por RUC) + panel de
  intentos / disputas para el super admin.
- **Tablero de ranking** de ventas por vendedor (montos, sin detalle).
- (Opcional, a confirmar luego) **Cálculo de comisiones** por vendedor.

## Puntos a afinar al momento de construir (no bloquean el inicio)

- Cómo procesa B una venta a un cliente de A **sin** ver el historial de A
  (ver solo lo mínimo de la transacción actual).
- Si el tablero de ranking es por día, por mes o ambos.
- Si se agrega el cálculo automático de comisión (% por vendedor) o solo el
  registro de quién vendió.
