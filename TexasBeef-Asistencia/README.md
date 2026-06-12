# Texas Beef House of Grill - Sistema de Control de Asistencia

![Texas Beef House of Grill](TexasBeef.jpg)

Sistema web empresarial para el control de asistencia de empleados del restaurante **Texas Beef House of Grill**, desarrollado con **Google Apps Script**, **Google Sheets** y **Google Drive**.

---

## Características

- **CRUD completo de empleados** (crear, leer, actualizar, desactivar)
- **Captura de fotografía** con la cámara del celular al iniciar y finalizar jornada
- **Geolocalización** automática al registrar asistencia
- **Control de 4 marcajes**: Entrada → Salida a almuerzo → Regreso de almuerzo → Salida final
- **Almacenamiento de fotos** en Google Drive (organizadas por fecha)
- **Almacenamiento de datos** en Google Sheets
- **Dashboard administrativo** con estadísticas del día y del mes
- **Cálculo automático** de horas trabajadas, horas extras y tardanzas
- **Diseño responsive** optimizado para celulares
- **Control de roles**: Administrador y Empleado
- **Acceso por PIN** (6 dígitos numéricos)

---

## Estructura de Archivos

| Archivo | Descripción |
|---------|-------------|
| `Code.gs` | Código del servidor (backend): autenticación, CRUD, asistencia, fotos, cálculos |
| `Index.html` | Plantilla HTML principal (SPA con todas las vistas) |
| `Estilos.html` | Estilos CSS completos (tema rojo/dorado Texas Beef House of Grill) |
| `JavaScript.html` | Lógica del cliente: cámara, geolocalización, interacción con servidor |
| `appsscript.json` | Manifiesto del proyecto (permisos, zona horaria) |

---

## Estructura de Google Sheets

### Hoja: `Empleados`
| Columna | Campo |
|---------|-------|
| A | ID |
| B | Nombre |
| C | Apellido |
| D | Cédula |
| E | Cargo |
| F | Teléfono |
| G | Email |
| H | PIN |
| I | Rol (Administrador/Empleado) |
| J | Estado (Activo/Inactivo) |
| K | Fecha de Registro |

### Hoja: `Asistencia`
| Columna | Campo |
|---------|-------|
| A | ID |
| B | Empleado ID |
| C | Nombre Empleado |
| D | Fecha |
| E | Hora Entrada |
| F | Foto Entrada (URL Drive) |
| G | Latitud Entrada |
| H | Longitud Entrada |
| I | Hora Salida Almuerzo |
| J | Hora Regreso Almuerzo |
| K | Hora Salida |
| L | Foto Salida (URL Drive) |
| M | Latitud Salida |
| N | Longitud Salida |
| O | Horas Trabajadas |
| P | Horas Extras |
| Q | Minutos Tardanza |
| R | Observaciones |

### Hoja: `Configuracion`
| Parámetro | Valor por defecto |
|-----------|-------------------|
| HoraEntrada | 08:00 |
| HoraSalida | 17:00 |
| HoraAlmuerzoInicio | 12:00 |
| HoraAlmuerzoFin | 13:00 |
| HorasJornada | 8 |
| ToleranciaMinutos | 15 |
| NombreEmpresa | Texas Beef House of Grill |

---

## 📋 Instrucciones de Instalación Paso a Paso

### Paso 1: Crear la Hoja de Cálculo (Google Sheets)

1. Ve a [Google Sheets](https://sheets.google.com)
2. Crea una nueva hoja de cálculo en blanco
3. Renómbrala como **"Texas Beef House of Grill - Asistencia"** (clic en "Hoja de cálculo sin título" arriba a la izquierda)
4. **Copia el ID del Spreadsheet** de la URL:
   ```
   https://docs.google.com/spreadsheets/d/ESTE_ES_TU_SPREADSHEET_ID/edit
   ```
   El ID es la cadena larga entre `/d/` y `/edit`. Guárdalo, lo necesitarás en el Paso 4.

### Paso 2: Crear la Carpeta en Google Drive

1. Ve a [Google Drive](https://drive.google.com)
2. Crea una nueva carpeta llamada **"Texas Beef House of Grill - Fotos Asistencia"**
3. Abre la carpeta
4. **Copia el ID de la carpeta** de la URL:
   ```
   https://drive.google.com/drive/folders/ESTE_ES_TU_FOLDER_ID
   ```
   El ID es la cadena después de `/folders/`. Guárdalo.

### Paso 3: Crear el Proyecto en Apps Script

1. Ve a [Google Apps Script](https://script.google.com)
2. Haz clic en **"Nuevo proyecto"**
3. Renombra el proyecto como **"Texas Beef House of Grill - Control de Asistencia"** (clic en "Proyecto sin título" arriba a la izquierda)

### Paso 4: Agregar el Código del Servidor (Code.gs)

1. En el editor de Apps Script, ya tienes un archivo `Code.gs` abierto
2. **Borra todo el contenido** existente
3. **Copia y pega** todo el contenido del archivo `Code.gs` de este repositorio
4. **IMPORTANTE**: Reemplaza los dos valores de configuración al inicio del archivo:
   ```javascript
   const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';   // ← Pega tu ID del Paso 1
   const DRIVE_FOLDER_ID = 'TU_FOLDER_ID_AQUI';       // ← Pega tu ID del Paso 2
   ```

### Paso 5: Agregar los Archivos HTML

Para cada archivo HTML, sigue estos pasos:

1. En el editor de Apps Script, haz clic en el icono **"+"** junto a "Archivos"
2. Selecciona **"HTML"**
3. Nombra el archivo (sin la extensión `.html`, Apps Script la agrega automáticamente)

Crea estos 3 archivos:

| Nombre a escribir | Archivo de este repo |
|---|---|
| `Index` | Copia el contenido de `Index.html` |
| `Estilos` | Copia el contenido de `Estilos.html` |
| `JavaScript` | Copia el contenido de `JavaScript.html` |

> **Nota**: Al crear cada archivo HTML, borra el contenido predeterminado que Apps Script genera y pega el contenido completo del archivo correspondiente.

### Paso 6: Configurar el Manifiesto

1. En el editor de Apps Script, haz clic en el icono de **engranaje** (⚙ Configuración del proyecto) en la barra lateral izquierda
2. Marca la casilla **"Mostrar el archivo de manifiesto "appsscript.json" en el editor"**
3. Vuelve al editor (icono de `< >`)
4. Abre el archivo `appsscript.json` que ahora aparece
5. **Reemplaza todo su contenido** con el contenido del archivo `appsscript.json` de este repositorio

### Paso 7: Ejecutar la Configuración Inicial

1. En el editor, selecciona la función **`configurarSistema`** en el desplegable de funciones (junto al botón ▶)
2. Haz clic en **▶ Ejecutar**
3. La primera vez te pedirá **autorizar permisos**:
   - Haz clic en "Revisar permisos"
   - Selecciona tu cuenta de Google
   - Si aparece "Google no ha verificado esta aplicación", haz clic en **"Avanzado"** → **"Ir a Texas Beef (no seguro)"**
   - Haz clic en **"Permitir"**
4. Verifica que el log diga "Sistema configurado correctamente"
5. Revisa tu Google Sheet: deberían aparecer las hojas **Empleados**, **Asistencia** y **Configuracion** con sus encabezados y un usuario Admin por defecto

### Paso 8: Desplegar como Aplicación Web

1. Haz clic en **"Implementar"** → **"Nueva implementación"**
2. Junto a "Seleccionar tipo", haz clic en el icono de **engranaje** (⚙) y selecciona **"Aplicación web"**
3. Configura:
   - **Descripción**: "Texas Beef - Control de Asistencia v1"
   - **Ejecutar como**: "Yo" (tu cuenta)
   - **Quién tiene acceso**: "Cualquier persona"
4. Haz clic en **"Implementar"**
5. **Copia la URL** de la aplicación web que se muestra
6. ¡Esa es tu URL! Ábrela en el navegador del celular o computadora

### Paso 9: Primer Acceso

1. Abre la URL de la aplicación web en tu navegador
2. Ingresa el **PIN por defecto del administrador**: **`123456`**
3. Ya estás dentro del panel de administración

---

## 🔧 Uso del Sistema

### Como Administrador (PIN: 123456)

| Sección | Función |
|---------|---------|
| **Dashboard** | Ver estadísticas del día y del mes (presentes, ausentes, tardanzas, horas) |
| **Empleados** | Crear, editar y desactivar empleados. Asignar PIN y rol a cada uno |
| **Asistencia** | Consultar registros de asistencia por fecha y empleado |
| **Configuración** | Ajustar horarios de entrada/salida, almuerzo, jornada y tolerancia |

**Para agregar un empleado:**
1. Ve a la pestaña "Empleados"
2. Haz clic en "+ Nuevo"
3. Llena los datos (nombre, cédula, cargo, PIN, rol)
4. Haz clic en "Guardar"

### Como Empleado

1. Ingresa tu PIN asignado
2. Se abrirá la cámara del celular
3. El sistema detecta automáticamente qué acción sigue:
   - **Entrada**: Toma foto → Registrar Entrada
   - **Salida a Almuerzo**: Clic en el botón correspondiente
   - **Regreso de Almuerzo**: Clic en el botón correspondiente
   - **Salida**: Toma foto → Registrar Salida
4. Las fotos y ubicación se guardan automáticamente

---

## ⚡ Actualizar la Aplicación

Si necesitas hacer cambios al código:

1. Abre el proyecto en [Apps Script](https://script.google.com)
2. Realiza los cambios necesarios
3. Ve a **"Implementar"** → **"Administrar implementaciones"**
4. Haz clic en el icono de **lápiz** (✏) de tu implementación activa
5. En "Versión", selecciona **"Nueva versión"**
6. Haz clic en **"Implementar"**

> La URL no cambia al actualizar, así que no necesitas redistribuir el enlace.

---

## 🔒 Seguridad

- Cada empleado accede con un **PIN único**
- Los administradores pueden **desactivar** empleados (no pueden acceder con PIN inactivo)
- Las fotos se almacenan en Google Drive con permisos de solo lectura
- Los datos están protegidos por la autenticación de Google
- **Recomendación**: Cambia el PIN del administrador por defecto (123456) después del primer acceso

---

## 🛠 Solución de Problemas

| Problema | Solución |
|----------|----------|
| "No se pudo abrir el Spreadsheet" | Verifica que el `SPREADSHEET_ID` en `Code.gs` sea correcto |
| "No se pudo acceder a la carpeta de Drive" | Verifica que el `DRIVE_FOLDER_ID` en `Code.gs` sea correcto |
| La cámara no funciona | Verifica los permisos del navegador. Debe accederse por HTTPS |
| La ubicación no se obtiene | Activa la ubicación en el celular y permite el acceso al navegador |
| "PIN incorrecto" | Verifica que el empleado esté activo y el PIN sea correcto |
| Los estilos no cargan | Verifica que el archivo `Estilos` (sin extensión) esté creado correctamente |
| Error de autorización | Vuelve a ejecutar `configurarSistema` y acepta los permisos |

---

## 📱 Compatibilidad

- **Navegadores**: Chrome, Safari, Firefox, Edge (versiones recientes)
- **Dispositivos**: Celulares (Android/iOS), tablets, computadoras
- **Requisitos**: Cámara y ubicación habilitadas para la captura de asistencia

---

## Licencia

Uso interno para Texas Beef House of Grill. Todos los derechos reservados.
