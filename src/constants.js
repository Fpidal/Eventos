// Constantes de la aplicación - Extraídas de App.jsx

// Colores para gráficos
export const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];

// Calendario
export const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
export const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

// Opciones de formularios
export const VENDEDORES = ['Rodrigo', 'Francisco', 'Piru'];
export const TIPOS_EVENTO = ['Cumple 15', 'Cumple 40', 'Cumple 50', 'Cumple 60', 'Cumple 80', 'Cumple 1 año', 'Aniversario', 'Casamiento', 'Civil', 'Evento Empresa', 'Fiesta Privada', 'PRIVADO', 'Reunion', 'Cumpleaños', 'Bat/Bar Mitzvah'];
export const MENUS = ['Tapas', 'Asado', '3 pasos', 'Premium', 'Brunch'];
export const TIPOS_MENU = ['Menu Tapeo', 'Menu Asado', 'Menu 3 Pasos', 'Menu Premium', 'Menu Brunch', 'Otro'];
export const TURNOS = ['Noche', 'M. Dia'];
export const SALONES = ['Tero', 'Cristal', 'Salentein'];
export const COBRADORES = ['Francisco', 'Rodrigo', 'Piru', 'Banco', 'Caja'];

// Caja
export const CONCEPTOS_INGRESO = ['Evento', 'Vta directa', 'Caja', 'Banco', 'Otros'];
export const CONCEPTOS_EGRESO = ['R. Socios', 'Pagos extras', 'Tero', 'Otros'];
export const SOCIOS = ['Rodrigo', 'Piru', 'Francisco'];
export const CAJAS = ['Francisco', 'Rodrigo', 'Piru', 'Banco', 'Caja'];

// Feriados Argentina 2025-2026
export const FERIADOS_ARGENTINA = {
  // 2025
  '2025-01-01': 'Año Nuevo',
  '2025-03-03': 'Carnaval',
  '2025-03-04': 'Carnaval',
  '2025-03-24': 'Día de la Memoria',
  '2025-04-02': 'Día del Veterano',
  '2025-04-18': 'Viernes Santo',
  '2025-05-01': 'Día del Trabajador',
  '2025-05-25': 'Revolución de Mayo',
  '2025-06-16': 'Güemes (puente)',
  '2025-06-20': 'Día de la Bandera',
  '2025-07-09': 'Día de la Independencia',
  '2025-08-18': 'San Martín (puente)',
  '2025-10-13': 'Diversidad Cultural (puente)',
  '2025-11-24': 'Soberanía Nacional (puente)',
  '2025-12-08': 'Inmaculada Concepción',
  '2025-12-25': 'Navidad',
  // 2026
  '2026-01-01': 'Año Nuevo',
  '2026-02-16': 'Carnaval',
  '2026-02-17': 'Carnaval',
  '2026-03-24': 'Día de la Memoria',
  '2026-04-02': 'Día del Veterano',
  '2026-04-03': 'Viernes Santo',
  '2026-05-01': 'Día del Trabajador',
  '2026-05-25': 'Revolución de Mayo',
  '2026-06-15': 'Güemes (puente)',
  '2026-06-20': 'Día de la Bandera',
  '2026-07-09': 'Día de la Independencia',
  '2026-08-17': 'San Martín (puente)',
  '2026-10-12': 'Diversidad Cultural',
  '2026-11-23': 'Soberanía Nacional (puente)',
  '2026-12-08': 'Inmaculada Concepción',
  '2026-12-25': 'Navidad',
};

// Categorías por tipo de menú
export const CATEGORIAS_POR_MENU = {
  'Menu Tapeo': ['Tapeo Frío', 'Tapeo Caliente', 'Cazuelas', 'Mesa de Dulces', 'Fin de Fiesta', 'Bebidas'],
  'Menu Asado': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu 3 Pasos': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu Premium': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu Brunch': ['Salado', 'Dulce', 'Bebidas'],
  'Otro': ['Entradas', 'Principales', 'Postres', 'Bebidas']
};

// Platos por tipo de menú y categoría
export const PLATOS_POR_MENU = {
  'Menu Tapeo': {
    'Tapeo Frío': [
      'Montadito De Salmon Ahumado',
      'Langostino & Mousse De Palta',
      'Crostini Jamon Crudo & Huevo De Codorniz',
      'Tortilla Española & Morron Asado',
      'Montadito Queso Brie, Rucula & Salmon Ahumado',
      'Montadito De Tomates Confitados Y Albahaca',
      'Focaccia Con Caponata Siciliana',
      'Mini De Bondiola Braseada A La Barbacoa & Coleslaw',
      'Pintxo Capresse'
    ],
    'Tapeo Caliente': [
      'Langostinos Apanados & Alioli',
      'Empanadillas De Langostinos & Muzzarella',
      'Pincho De Pollo, Panceta Ahumada, Verdeo & Salsa Thai',
      'Tapas De Solomillo & Cebolla Caramelizada',
      'Pinchos De Solomillo Marinados',
      'Croquetas Catalanas',
      'Montaditos De Chorizos Con Chimichurri',
      'Albondiguillas Griegas',
      'Bastones Mozzarella Apanado',
      'Mini Hamburguesas',
      'Finger De Ave Apanado & Barbacoa'
    ],
    'Cazuelas': [
      'Cazuela De Langostinos Al Ajillo',
      'Cazuela De Mariscos',
      'Cazuela De Gambas Al Pil Pil',
      'Cazuela De Champignones Al Verdeo',
      'Cazuela De Provolone Fundido',
      'Cazuela De Chorizo A La Pomarola',
      'Revuelto Gramajo'
    ],
    'Mesa de Dulces': [
      'Mini Lemon Pie',
      'Mini Brownie, Dulce De Leche & Almendras',
      'Tartines De Coco Con Dulce De Leche',
      'Cuadraditos De Pastafrola',
      'Bocaditos Artesanales Chocolate & Dulce De Leche',
      'Shot Mousse De Chocolate',
      'Shot Bavarois De Frutilla',
      'Espuma De Durazno Con Salsa De Maracuya'
    ],
    'Fin de Fiesta': [
      'Lomitos',
      'Pizzas'
    ],
    'Bebidas': [
      'Vino',
      'Bebidas Sin Alcohol',
      'Barra De Trago Tradicional',
      'Barra De Tragos Y Coctelería',
      'Brindis Con Champagne',
      'Champagne'
    ]
  },
  'Menu Asado': {
    'Entradas': [
      'Chorizo Criollo',
      'Morcilla',
      'Mollejas',
      'Chinchulin',
      'Provoleta',
      'Tabla de Picada Regional',
      'Langostinos a la Parrilla Saborizados'
    ],
    'Principales': [
      'Asado Banderita',
      'Asado al Asador',
      'Picanha',
      'Colita de Cuadril',
      'Bife de Chorizo',
      'Entraña',
      'Lomo',
      'Ojo de Bife',
      'Prime Ribs',
      'Pechito de Cerdo',
      'Brochete de Pollo',
      'Bondiola',
      'Vacío'
    ],
    'Postres': [
      'Queso y Dulce',
      'Helado 2 Sabores',
      'Tiramisú',
      'Volcán de Chocolate'
    ],
    'Bebidas': []
  },
  'Menu 3 Pasos': {
    'Entradas': [
      'Vieiras Gratinadas',
      'Burratina con Salmorejo',
      'Langostinos a la Milanesa',
      'Gambas al Ajillo',
      'Muzzarella Apanada',
      'Rabas a la Romana'
    ],
    'Principales': [
      'Risotto del Bosque',
      'Cintas Mediterránea',
      'Risotto de Mariscos',
      'Ñoquis Soufflé',
      'Sorrentinos de Pollo y Hongos',
      'Ensalada Caesar',
      'Ensalada de Mar y Huerto',
      'Bife de Chorizo a la Pimienta',
      'Pollo Relleno de Espinaca y Parmesano',
      'Bondiola con Barbacoa',
      'Costilla Braseada en su Jugo',
      'Pescado Blanco con Salsa de Azafrán',
      'Agnolotis de Jamón y Queso'
    ],
    'Postres': [
      'Clásico Tiramisú',
      'Flan Casero',
      'Creppes de DDL, Rum, Nueces y Pasas',
      'Macedonia de Frutas',
      'Helado con Frutos Rojos',
      'Volcán de Dulce de Leche',
      'Volcán de Chocolate'
    ],
    'Bebidas': []
  },
  'Menu Premium': {
    'Entradas': [],
    'Principales': [],
    'Postres': [],
    'Bebidas': []
  },
  'Menu Brunch': {
    'Salado': [],
    'Dulce': [],
    'Bebidas': []
  },
  'Otro': {
    'Entradas': [],
    'Principales': [],
    'Postres': [],
    'Bebidas': []
  }
};
