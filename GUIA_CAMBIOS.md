# GUIA PRACTICA PARA CAMBIAR EL PROGRAMA SIN IA

Objetivo: poder ubicar rapido donde tocar cuando te pidan cambios en frontend o backend, con un metodo repetible.

## 1. Metodo Base (siempre igual)

1. Clasifica el pedido:
- UI/pantalla -> frontend
- API/reglas -> backend controller/service
- Guardado de datos -> backend service/repository/entity
- Seguridad/permisos -> backend security
- Reportes/PDF/Excel -> backend reportes

2. Ubica el punto de entrada:
- Frontend: componente donde ocurre el cambio
- Backend: endpoint que recibe la accion

3. Sigue la cadena completa:
- Frontend: componente -> fetch -> endpoint
- Backend: controller -> service -> repository/entity -> respuesta

4. Cambia en toda la cadena (no solo en 1 archivo)

5. Valida:
- Compila
- Prueba flujo funcional
- Revisa logs/errores

---

## 2. Mapa del Proyecto (donde mirar primero)

### Frontend
- Entrada app: frontend/src/main.jsx
- Componente principal: frontend/src/App.jsx
- Pantallas/componentes: frontend/src/components/
- Llamadas API especificas: frontend/src/api/

### Backend
- Entrada app: backend/src/main/java/com/epu/prototipo/BackendApplication.java
- Controllers (endpoints REST): backend/src/main/java/com/epu/prototipo/controller/
- Services (logica): backend/src/main/java/com/epu/prototipo/service/
- Repositories (acceso DB): backend/src/main/java/com/epu/prototipo/repository/
- Entities (modelo persistente): backend/src/main/java/com/epu/prototipo/entity/
- Seguridad: backend/src/main/java/com/epu/prototipo/security/
- Config general: backend/src/main/java/com/epu/prototipo/config/
- Config por perfil: backend/src/main/resources/application*.properties

---

## 3. Si te piden X, abre Y primero

### A) "Cambiar algo de una pantalla"
1. frontend/src/components/<Pantalla>.jsx
2. Busca fetch(...) en ese archivo
3. Anota el endpoint /api/...
4. Abre backend/src/main/java/com/epu/prototipo/controller/*Controller.java correspondiente

### B) "Cambiar validaciones o reglas del negocio"
1. Controller que recibe el endpoint
2. Service asociado (por ejemplo MysqlPtsService, MysqlUsuarioService, etc.)
3. Si afecta guardado: repository + entity

### C) "Agregar/quitar campo en formulario"
1. Frontend componente: estado, inputs, payload JSON
2. Backend DTO/model usado por el endpoint
3. Service: validaciones y mapeo
4. Entity/repository si se persiste en DB
5. Reporte si ese campo tambien se imprime

### D) "Cambiar permisos de acceso"
1. backend/src/main/java/com/epu/prototipo/security/SecurityConfig.java
2. Revisa requestMatchers(...)
3. Verifica controlador afectado

### E) "Cambiar login/autenticacion"
1. backend/src/main/java/com/epu/prototipo/controller/AuthController.java
2. backend/src/main/java/com/epu/prototipo/security/service/UserDetailsServiceCustom.java
3. backend/src/main/java/com/epu/prototipo/config/SecurityBeans.java
4. frontend/src/components/Login.jsx

### F) "Cambiar reportes PDF/Excel"
1. backend/src/main/java/com/epu/prototipo/controller/ReporteController.java
2. backend/src/main/java/com/epu/prototipo/service/ReporteService.java
3. Frontend donde se descarga/solicita reporte

---

## 4. Busqueda eficiente en VS Code (sin IA)

- Buscar texto global: Ctrl+Shift+F
- Ir a archivo por nombre: Ctrl+P
- Ir a simbolo (clase/metodo): Ctrl+T
- Ir a definicion: F12
- Ver referencias: Shift+F12
- Renombrar simbolo seguro: F2

Tip: cuando busques en global, acota por carpeta:
- frontend/src/**
- backend/src/main/java/**

---

## 5. Flujo de trabajo recomendado (paso a paso)

1. Reproduce el caso actual (entender comportamiento)
2. Ubica archivos con el metodo de la seccion 1
3. Haz cambio minimo
4. Compila backend
5. Prueba frontend + backend en el flujo completo
6. Revisa errores en consola
7. Ajusta y vuelve a probar

---

## 6. Comandos utiles en este repo

Desde backend:

```powershell
.\mvnw.cmd -q -DskipTests compile
.\mvnw.cmd -q test
```

Desde frontend:

```powershell
npm install
npm run dev
npm run build
```

---

## 7. Checklist antes de cerrar un cambio

- El cambio funciona en UI
- El endpoint responde como esperas
- No rompiste seguridad (auth/permisos)
- Compila backend
- Build de frontend ok
- No quedan errores en consola
- Si tocaste modelo de datos, validaste persistencia

---

## 8. Ejemplo rapido de rastreo

Pedido: "agregar campo Observacion en cierre PTS"

Ruta de rastreo:
1. frontend/src/components/CierrePTS.jsx (input + payload)
2. endpoint /api/pts/cerrar
3. backend/src/main/java/com/epu/prototipo/controller/PtsController.java
4. backend/src/main/java/com/epu/prototipo/service/MysqlPtsService.java (logica de cierre)
5. backend/src/main/java/com/epu/prototipo/entity/PtsEntity.java (si persiste)
6. backend/src/main/java/com/epu/prototipo/service/ReporteService.java (si sale en PDF/Excel)

Con este metodo no dependes de memoria ni IA: siempre sigues la misma cadena.
