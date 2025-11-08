# Pruebas del Componente CrearPTS

## Objetivo
Probar la funcionalidad completa del componente CrearPTS.jsx para la creación de nuevos Permisos de Trabajo Seguro.

## Pasos de Prueba

### 1. Acceso al Componente
- [ ] Iniciar sesión como EMISOR
- [ ] Navegar al componente "Crear PTS" desde el menú
- [ ] Verificar que el formulario se carga correctamente

### 2. Validación del Formulario
- [ ] Intentar enviar formulario vacío (debe mostrar errores de validación)
- [ ] Probar validación de campos requeridos
- [ ] Probar validación de horarios (hora fin debe ser posterior a hora inicio)
- [ ] Verificar que se requiere al menos un riesgo/control
- [ ] Verificar que se requiere al menos un equipo de seguridad

### 3. Funcionalidad de Arrays Dinámicos
- [ ] Agregar múltiples riesgos y controles
- [ ] Eliminar riesgos y controles (excepto el último)
- [ ] Agregar múltiples equipos de seguridad
- [ ] Eliminar equipos de seguridad (excepto el último)

### 4. Envío de Datos
- [ ] Llenar formulario completo con datos válidos
- [ ] Enviar el formulario
- [ ] Verificar respuesta del servidor
- [ ] Confirmar que el PTS se crea correctamente

### 5. Integración con Backend
- [ ] Verificar que los datos se mapean correctamente al modelo backend
- [ ] Confirmar que el endpoint `/api/pts` (POST) funciona
- [ ] Validar autenticación JWT

## Datos de Prueba Sugeridos

```
Número de Permiso: PTS-2025-TEST-001
Fecha: [Fecha actual]
Hora Inicio: 08:00
Hora Fin: 17:00
Ubicación: Planta Industrial - Sector A
Descripción: Mantenimiento preventivo de equipos de seguridad
Solicitante: [Auto-completado con usuario logueado]
Supervisor: SUP123
Responsable del Área: RESP456

Riesgos y Controles:
1. Riesgo: Exposición a altura | Control: Uso de arnés y línea de vida
2. Riesgo: Contacto eléctrico | Control: Desconexión y bloqueo de energía

Equipos de Seguridad:
1. Equipo: Casco de seguridad | Cantidad: 2
2. Equipo: Arnés de seguridad | Cantidad: 2
3. Equipo: Guantes dieléctricos | Cantidad: 4

Observaciones: Trabajo coordinado con el área de mantenimiento eléctrico
```

## Resultados Esperados
- Formulario debe validar correctamente todos los campos
- Arrays dinámicos deben permitir agregar/eliminar elementos
- Datos deben enviarse correctamente al backend
- Debe mostrarse mensaje de éxito al crear el PTS
- El formulario debe limpiarse después de crear exitosamente

## Notas de Implementación
- El componente mapea campos del frontend al modelo backend `PermisoTrabajoSeguro`
- Se utiliza autenticación JWT para identificar al usuario
- Los riesgos/controles se mapean a la estructura `RiesgoControl` del backend
- Los equipos se mapean a la estructura `EquipoSeguridad` del backend