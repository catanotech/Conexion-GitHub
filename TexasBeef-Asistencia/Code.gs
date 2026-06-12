// ============================================================
// Texas Beef - Sistema de Control de Asistencia
// Google Apps Script - Backend (Code.gs)
// ============================================================

// =================== CONFIGURACIÓN ===================
// INSTRUCCIONES: Reemplaza estos valores con los IDs reales
// de tu Google Sheet y carpeta de Google Drive.
const SPREADSHEET_ID = 'TU_SPREADSHEET_ID_AQUI';
const DRIVE_FOLDER_ID = 'TU_FOLDER_ID_AQUI';

// Nombres de las hojas
const SHEET_EMPLEADOS = 'Empleados';
const SHEET_ASISTENCIA = 'Asistencia';
const SHEET_CONFIG = 'Configuracion';

// =================== WEB APP ===================

function doGet(e) {
  var template = HtmlService.createTemplateFromFile('Index');
  return template.evaluate()
    .setTitle('Texas Beef House of Grill - Control de Asistencia')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1.0')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

function include(filename) {
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// =================== SETUP INICIAL ===================

function configurarSistema() {
  var ss;
  try {
    ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  } catch (err) {
    throw new Error('No se pudo abrir el Spreadsheet. Verifica el SPREADSHEET_ID.');
  }

  // Crear hoja Empleados
  var sheetEmp = ss.getSheetByName(SHEET_EMPLEADOS);
  if (!sheetEmp) {
    sheetEmp = ss.insertSheet(SHEET_EMPLEADOS);
    sheetEmp.appendRow([
      'ID', 'Nombre', 'Apellido', 'Cedula', 'Cargo',
      'Telefono', 'Email', 'PIN', 'Rol', 'Estado', 'FechaRegistro'
    ]);
    sheetEmp.getRange(1, 1, 1, 11).setFontWeight('bold').setBackground('#b71c1c').setFontColor('#ffffff');
    sheetEmp.setFrozenRows(1);

    // Crear admin por defecto: PIN 1234
    var idAdmin = generarId();
    sheetEmp.appendRow([
      idAdmin, 'Admin', 'Texas Beef', '0000000000', 'Administrador',
      '', '', '123456', 'Administrador', 'Activo', new Date()
    ]);
  }

  // Crear hoja Asistencia
  var sheetAsi = ss.getSheetByName(SHEET_ASISTENCIA);
  if (!sheetAsi) {
    sheetAsi = ss.insertSheet(SHEET_ASISTENCIA);
    sheetAsi.appendRow([
      'ID', 'EmpleadoID', 'NombreEmpleado', 'Fecha',
      'HoraEntrada', 'FotoEntrada', 'LatEntrada', 'LngEntrada',
      'HoraSalidaAlmuerzo', 'HoraRegresoAlmuerzo',
      'HoraSalida', 'FotoSalida', 'LatSalida', 'LngSalida',
      'HorasTrabajadas', 'HorasExtras', 'MinutosTardanza', 'Observaciones'
    ]);
    sheetAsi.getRange(1, 1, 1, 18).setFontWeight('bold').setBackground('#b71c1c').setFontColor('#ffffff');
    sheetAsi.setFrozenRows(1);
  }

  // Crear hoja Configuracion
  var sheetConf = ss.getSheetByName(SHEET_CONFIG);
  if (!sheetConf) {
    sheetConf = ss.insertSheet(SHEET_CONFIG);
    sheetConf.appendRow(['Parametro', 'Valor']);
    sheetConf.getRange(1, 1, 1, 2).setFontWeight('bold').setBackground('#b71c1c').setFontColor('#ffffff');
    sheetConf.setFrozenRows(1);
    sheetConf.appendRow(['HoraEntrada', '08:00']);
    sheetConf.appendRow(['HoraSalida', '17:00']);
    sheetConf.appendRow(['HoraAlmuerzoInicio', '12:00']);
    sheetConf.appendRow(['HoraAlmuerzoFin', '13:00']);
    sheetConf.appendRow(['HorasJornada', '8']);
    sheetConf.appendRow(['ToleranciaMinutos', '15']);
    sheetConf.appendRow(['NombreEmpresa', 'Texas Beef House of Grill']);
  }

  // Verificar carpeta de Drive
  try {
    DriveApp.getFolderById(DRIVE_FOLDER_ID);
  } catch (err) {
    throw new Error('No se pudo acceder a la carpeta de Drive. Verifica el DRIVE_FOLDER_ID.');
  }

  return { success: true, message: 'Sistema configurado correctamente. Admin PIN: 123456' };
}

// =================== AUTENTICACIÓN ===================

function login(pin) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][7]) === String(pin) && data[i][9] === 'Activo') {
        return {
          success: true,
          empleado: {
            id: data[i][0],
            nombre: data[i][1],
            apellido: data[i][2],
            cedula: data[i][3],
            cargo: data[i][4],
            telefono: data[i][5],
            email: data[i][6],
            rol: data[i][8]
          }
        };
      }
    }
    return { success: false, message: 'PIN incorrecto o empleado inactivo.' };
  } catch (err) {
    return { success: false, message: 'Error de conexión: ' + err.message };
  }
}

// =================== CRUD EMPLEADOS ===================

function getEmpleados() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
    var data = sheet.getDataRange().getValues();
    var empleados = [];

    for (var i = 1; i < data.length; i++) {
      empleados.push({
        id: data[i][0],
        nombre: data[i][1],
        apellido: data[i][2],
        cedula: data[i][3],
        cargo: data[i][4],
        telefono: data[i][5],
        email: data[i][6],
        pin: data[i][7],
        rol: data[i][8],
        estado: data[i][9],
        fechaRegistro: data[i][10]
      });
    }
    return { success: true, empleados: empleados };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function addEmpleado(empleado) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);

    // Verificar PIN único
    var data = sheet.getDataRange().getValues();
    for (var i = 1; i < data.length; i++) {
      if (String(data[i][7]) === String(empleado.pin)) {
        return { success: false, message: 'El PIN ya está en uso por otro empleado.' };
      }
      if (String(data[i][3]) === String(empleado.cedula)) {
        return { success: false, message: 'La cédula ya está registrada.' };
      }
    }

    var id = generarId();
    sheet.appendRow([
      id,
      empleado.nombre,
      empleado.apellido,
      empleado.cedula,
      empleado.cargo,
      empleado.telefono || '',
      empleado.email || '',
      empleado.pin,
      empleado.rol || 'Empleado',
      'Activo',
      new Date()
    ]);

    return { success: true, message: 'Empleado registrado exitosamente.', id: id };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function updateEmpleado(empleado) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(empleado.id)) {
        // Verificar PIN único (excluyendo el empleado actual)
        for (var j = 1; j < data.length; j++) {
          if (j !== i && String(data[j][7]) === String(empleado.pin)) {
            return { success: false, message: 'El PIN ya está en uso por otro empleado.' };
          }
        }

        var row = i + 1;
        sheet.getRange(row, 2).setValue(empleado.nombre);
        sheet.getRange(row, 3).setValue(empleado.apellido);
        sheet.getRange(row, 4).setValue(empleado.cedula);
        sheet.getRange(row, 5).setValue(empleado.cargo);
        sheet.getRange(row, 6).setValue(empleado.telefono || '');
        sheet.getRange(row, 7).setValue(empleado.email || '');
        sheet.getRange(row, 8).setValue(empleado.pin);
        sheet.getRange(row, 9).setValue(empleado.rol);
        sheet.getRange(row, 10).setValue(empleado.estado);

        return { success: true, message: 'Empleado actualizado exitosamente.' };
      }
    }
    return { success: false, message: 'Empleado no encontrado.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function deleteEmpleado(id) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        // Desactivar en lugar de eliminar (soft delete)
        sheet.getRange(i + 1, 10).setValue('Inactivo');
        return { success: true, message: 'Empleado desactivado exitosamente.' };
      }
    }
    return { success: false, message: 'Empleado no encontrado.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function eliminarEmpleadoPermanente(id) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_EMPLEADOS);
    var data = sheet.getDataRange().getValues();

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        sheet.deleteRow(i + 1);
        return { success: true, message: 'Empleado eliminado permanentemente.' };
      }
    }
    return { success: false, message: 'Empleado no encontrado.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =================== ASISTENCIA ===================

function getEstadoAsistenciaHoy(empleadoId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ASISTENCIA);
    var data = sheet.getDataRange().getValues();
    var hoy = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd');

    for (var i = data.length - 1; i >= 1; i--) {
      var fechaReg = Utilities.formatDate(new Date(data[i][3]), 'America/Bogota', 'yyyy-MM-dd');
      if (String(data[i][1]) === String(empleadoId) && fechaReg === hoy) {
        return {
          success: true,
          registro: {
            id: data[i][0],
            horaEntrada: data[i][4] ? Utilities.formatDate(new Date(data[i][4]), 'America/Bogota', 'HH:mm:ss') : null,
            horaSalidaAlmuerzo: data[i][8] ? Utilities.formatDate(new Date(data[i][8]), 'America/Bogota', 'HH:mm:ss') : null,
            horaRegresoAlmuerzo: data[i][9] ? Utilities.formatDate(new Date(data[i][9]), 'America/Bogota', 'HH:mm:ss') : null,
            horaSalida: data[i][10] ? Utilities.formatDate(new Date(data[i][10]), 'America/Bogota', 'HH:mm:ss') : null
          },
          siguienteAccion: determinarSiguienteAccion(data[i])
        };
      }
    }

    return {
      success: true,
      registro: null,
      siguienteAccion: 'entrada'
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function determinarSiguienteAccion(row) {
  if (!row[4]) return 'entrada';
  if (!row[8]) return 'salida_almuerzo';
  if (!row[9]) return 'regreso_almuerzo';
  if (!row[10]) return 'salida';
  return 'completado';
}

function registrarAsistencia(datos) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ASISTENCIA);
    var ahora = new Date();
    var hoy = Utilities.formatDate(ahora, 'America/Bogota', 'yyyy-MM-dd');

    // Guardar foto si existe
    var fotoUrl = '';
    if (datos.foto) {
      fotoUrl = guardarFotoEnDrive(datos.foto, datos.empleadoId, datos.accion);
    }

    var data = sheet.getDataRange().getValues();
    var filaExistente = -1;

    // Buscar registro de hoy
    for (var i = data.length - 1; i >= 1; i--) {
      var fechaReg = Utilities.formatDate(new Date(data[i][3]), 'America/Bogota', 'yyyy-MM-dd');
      if (String(data[i][1]) === String(datos.empleadoId) && fechaReg === hoy) {
        filaExistente = i + 1;
        break;
      }
    }

    var config = getConfiguracion();

    switch (datos.accion) {
      case 'entrada':
        if (filaExistente > 0) {
          return { success: false, message: 'Ya registraste tu entrada hoy.' };
        }
        var id = generarId();
        var tardanza = calcularTardanza(ahora, config.HoraEntrada, config.ToleranciaMinutos);
        var obs = tardanza > 0 ? 'Tardanza: ' + tardanza + ' minutos' : 'Puntual';

        sheet.appendRow([
          id, datos.empleadoId, datos.nombreEmpleado,
          ahora, ahora, fotoUrl,
          datos.lat || '', datos.lng || '',
          '', '', '', '', '', '',
          '', '', tardanza, obs
        ]);
        return { success: true, message: 'Entrada registrada a las ' + Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss') };

      case 'salida_almuerzo':
        if (filaExistente < 0) {
          return { success: false, message: 'No hay registro de entrada hoy.' };
        }
        sheet.getRange(filaExistente, 9).setValue(ahora);
        return { success: true, message: 'Salida a almuerzo registrada a las ' + Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss') };

      case 'regreso_almuerzo':
        if (filaExistente < 0) {
          return { success: false, message: 'No hay registro de entrada hoy.' };
        }
        sheet.getRange(filaExistente, 10).setValue(ahora);
        return { success: true, message: 'Regreso de almuerzo registrado a las ' + Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss') };

      case 'salida':
        if (filaExistente < 0) {
          return { success: false, message: 'No hay registro de entrada hoy.' };
        }
        sheet.getRange(filaExistente, 11).setValue(ahora);
        sheet.getRange(filaExistente, 12).setValue(fotoUrl);
        sheet.getRange(filaExistente, 13).setValue(datos.lat || '');
        sheet.getRange(filaExistente, 14).setValue(datos.lng || '');

        // Calcular horas trabajadas
        var horaEntrada = new Date(data[filaExistente - 1][4]);
        var almuerzoInicio = data[filaExistente - 1][8] ? new Date(data[filaExistente - 1][8]) : null;
        var almuerzoFin = data[filaExistente - 1][9] ? new Date(data[filaExistente - 1][9]) : null;

        var resultado = calcularHoras(horaEntrada, ahora, almuerzoInicio, almuerzoFin, config.HorasJornada);
        sheet.getRange(filaExistente, 15).setValue(resultado.horasTrabajadas);
        sheet.getRange(filaExistente, 16).setValue(resultado.horasExtras);

        var obsActual = sheet.getRange(filaExistente, 18).getValue();
        sheet.getRange(filaExistente, 18).setValue(
          obsActual + ' | Horas: ' + resultado.horasTrabajadas.toFixed(2) +
          (resultado.horasExtras > 0 ? ' | Extras: ' + resultado.horasExtras.toFixed(2) : '')
        );

        return {
          success: true,
          message: 'Salida registrada a las ' + Utilities.formatDate(ahora, 'America/Bogota', 'HH:mm:ss') +
            '. Horas trabajadas: ' + resultado.horasTrabajadas.toFixed(2) +
            (resultado.horasExtras > 0 ? '. Horas extras: ' + resultado.horasExtras.toFixed(2) : '')
        };

      default:
        return { success: false, message: 'Acción no reconocida.' };
    }
  } catch (err) {
    return { success: false, message: 'Error al registrar: ' + err.message };
  }
}

// =================== FOTO EN DRIVE ===================

function guardarFotoEnDrive(fotoBase64, empleadoId, accion) {
  try {
    var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);

    // Crear subcarpeta por fecha
    var hoy = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd');
    var subFolders = folder.getFoldersByName(hoy);
    var subFolder;
    if (subFolders.hasNext()) {
      subFolder = subFolders.next();
    } else {
      subFolder = folder.createFolder(hoy);
    }

    // Decodificar base64
    var base64Data = fotoBase64.replace(/^data:image\/(png|jpeg|jpg);base64,/, '');
    var blob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'image/jpeg',
      empleadoId + '_' + accion + '_' + Utilities.formatDate(new Date(), 'America/Bogota', 'HHmmss') + '.jpg');

    var file = subFolder.createFile(blob);
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

    return file.getUrl();
  } catch (err) {
    Logger.log('Error guardando foto: ' + err.message);
    return '';
  }
}

// =================== CÁLCULOS ===================

function calcularTardanza(horaReal, horaEsperadaStr, tolerancia) {
  var partes = horaEsperadaStr.split(':');
  var horaEsperada = new Date(horaReal);
  horaEsperada.setHours(parseInt(partes[0]), parseInt(partes[1]), 0, 0);

  var diffMinutos = (horaReal - horaEsperada) / (1000 * 60);
  return diffMinutos > parseInt(tolerancia) ? Math.round(diffMinutos) : 0;
}

function calcularHoras(entrada, salida, almuerzoInicio, almuerzoFin, horasJornada) {
  var totalMs = salida.getTime() - entrada.getTime();

  // Restar tiempo de almuerzo si aplica
  if (almuerzoInicio && almuerzoFin) {
    var almuerzoMs = almuerzoFin.getTime() - almuerzoInicio.getTime();
    totalMs -= almuerzoMs;
  }

  var horasTrabajadas = totalMs / (1000 * 60 * 60);
  var horasExtras = Math.max(0, horasTrabajadas - parseFloat(horasJornada));

  return {
    horasTrabajadas: Math.round(horasTrabajadas * 100) / 100,
    horasExtras: Math.round(horasExtras * 100) / 100
  };
}

// =================== CONFIGURACIÓN ===================

function getConfiguracion() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_CONFIG);
  var data = sheet.getDataRange().getValues();
  var config = {};

  for (var i = 1; i < data.length; i++) {
    config[data[i][0]] = data[i][1];
  }
  return config;
}

function updateConfiguracion(configData) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_CONFIG);
    var data = sheet.getDataRange().getValues();

    for (var key in configData) {
      var found = false;
      for (var i = 1; i < data.length; i++) {
        if (data[i][0] === key) {
          sheet.getRange(i + 1, 2).setValue(configData[key]);
          found = true;
          break;
        }
      }
      if (!found) {
        sheet.appendRow([key, configData[key]]);
      }
    }
    return { success: true, message: 'Configuración actualizada.' };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =================== REPORTES / DASHBOARD ===================

function getResumenAsistencia(filtros) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ASISTENCIA);
    var data = sheet.getDataRange().getValues();
    var registros = [];

    var fechaInicio = filtros && filtros.fechaInicio ? new Date(filtros.fechaInicio) : null;
    var fechaFin = filtros && filtros.fechaFin ? new Date(filtros.fechaFin) : null;
    var empleadoId = filtros && filtros.empleadoId ? String(filtros.empleadoId) : null;

    for (var i = 1; i < data.length; i++) {
      var fecha = new Date(data[i][3]);

      if (fechaInicio && fecha < fechaInicio) continue;
      if (fechaFin) {
        var fin = new Date(fechaFin);
        fin.setHours(23, 59, 59);
        if (fecha > fin) continue;
      }
      if (empleadoId && String(data[i][1]) !== empleadoId) continue;

      registros.push({
        id: data[i][0],
        empleadoId: data[i][1],
        nombreEmpleado: data[i][2],
        fecha: Utilities.formatDate(fecha, 'America/Bogota', 'yyyy-MM-dd'),
        horaEntrada: data[i][4] ? Utilities.formatDate(new Date(data[i][4]), 'America/Bogota', 'HH:mm:ss') : '',
        fotoEntrada: data[i][5] || '',
        latEntrada: data[i][6],
        lngEntrada: data[i][7],
        horaSalidaAlmuerzo: data[i][8] ? Utilities.formatDate(new Date(data[i][8]), 'America/Bogota', 'HH:mm:ss') : '',
        horaRegresoAlmuerzo: data[i][9] ? Utilities.formatDate(new Date(data[i][9]), 'America/Bogota', 'HH:mm:ss') : '',
        horaSalida: data[i][10] ? Utilities.formatDate(new Date(data[i][10]), 'America/Bogota', 'HH:mm:ss') : '',
        fotoSalida: data[i][11] || '',
        latSalida: data[i][12],
        lngSalida: data[i][13],
        horasTrabajadas: data[i][14] || 0,
        horasExtras: data[i][15] || 0,
        minutosTardanza: data[i][16] || 0,
        observaciones: data[i][17] || ''
      });
    }

    return { success: true, registros: registros };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function getEstadisticasDashboard() {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);

    // Total empleados activos
    var sheetEmp = ss.getSheetByName(SHEET_EMPLEADOS);
    var dataEmp = sheetEmp.getDataRange().getValues();
    var totalActivos = 0;
    for (var i = 1; i < dataEmp.length; i++) {
      if (dataEmp[i][9] === 'Activo') totalActivos++;
    }

    // Asistencia de hoy
    var sheetAsi = ss.getSheetByName(SHEET_ASISTENCIA);
    var dataAsi = sheetAsi.getDataRange().getValues();
    var hoy = Utilities.formatDate(new Date(), 'America/Bogota', 'yyyy-MM-dd');

    var presentesHoy = 0;
    var tardanzasHoy = 0;
    var horasHoy = 0;
    var extrasHoy = 0;

    for (var j = 1; j < dataAsi.length; j++) {
      var fechaReg = Utilities.formatDate(new Date(dataAsi[j][3]), 'America/Bogota', 'yyyy-MM-dd');
      if (fechaReg === hoy) {
        presentesHoy++;
        if (dataAsi[j][16] > 0) tardanzasHoy++;
        horasHoy += parseFloat(dataAsi[j][14]) || 0;
        extrasHoy += parseFloat(dataAsi[j][15]) || 0;
      }
    }

    // Estadísticas del mes
    var ahora = new Date();
    var inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    var tardanzasMes = 0;
    var horasMes = 0;
    var extrasMes = 0;
    var diasTrabajadosMes = 0;

    for (var k = 1; k < dataAsi.length; k++) {
      var fechaMes = new Date(dataAsi[k][3]);
      if (fechaMes >= inicioMes) {
        diasTrabajadosMes++;
        tardanzasMes += (dataAsi[k][16] > 0 ? 1 : 0);
        horasMes += parseFloat(dataAsi[k][14]) || 0;
        extrasMes += parseFloat(dataAsi[k][15]) || 0;
      }
    }

    return {
      success: true,
      stats: {
        totalEmpleados: totalActivos,
        presentesHoy: presentesHoy,
        ausentesHoy: totalActivos - presentesHoy,
        tardanzasHoy: tardanzasHoy,
        horasHoy: Math.round(horasHoy * 100) / 100,
        extrasHoy: Math.round(extrasHoy * 100) / 100,
        tardanzasMes: tardanzasMes,
        horasMes: Math.round(horasMes * 100) / 100,
        extrasMes: Math.round(extrasMes * 100) / 100,
        diasTrabajadosMes: diasTrabajadosMes
      }
    };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

function getHistorialEmpleado(empleadoId) {
  try {
    var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
    var sheet = ss.getSheetByName(SHEET_ASISTENCIA);
    var data = sheet.getDataRange().getValues();
    var registros = [];

    for (var i = 1; i < data.length; i++) {
      if (String(data[i][1]) === String(empleadoId)) {
        registros.push({
          fecha: Utilities.formatDate(new Date(data[i][3]), 'America/Bogota', 'yyyy-MM-dd'),
          horaEntrada: data[i][4] ? Utilities.formatDate(new Date(data[i][4]), 'America/Bogota', 'HH:mm:ss') : '',
          horaSalida: data[i][10] ? Utilities.formatDate(new Date(data[i][10]), 'America/Bogota', 'HH:mm:ss') : '',
          horasTrabajadas: data[i][14] || 0,
          horasExtras: data[i][15] || 0,
          tardanza: data[i][16] || 0
        });
      }
    }

    return { success: true, registros: registros.reverse() };
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// =================== UTILIDADES ===================

function generarId() {
  return 'TB' + new Date().getTime() + Math.random().toString(36).substr(2, 4).toUpperCase();
}
