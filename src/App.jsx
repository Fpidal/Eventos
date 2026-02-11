import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Search, ChevronDown, ChevronUp, Briefcase, BarChart3, ChevronLeft, ChevronRight, Sun, Moon, Plus, X, Loader2, Phone, Music, Mic, Clock, MapPin, Edit3, Trash2, CheckCircle, AlertCircle, Wallet, Receipt, Percent, LogOut, Lock, Mail, FileText, UtensilsCrossed, ClipboardList, XCircle, Banknote, ArrowLeftRight, Contact, RefreshCw, Monitor, Check, Eye, EyeOff, Download, Save, Pencil } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from './supabase';
import { jsPDF } from 'jspdf';

// Formatear montos con signo $ y puntos como separador de miles
const formatCurrency = (value) => {
  if (value === null || value === undefined) return '$0';
  return '$' + Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Alias para compatibilidad
const formatMoney = formatCurrency;

// Formatear números sin signo $ con puntos como separador de miles
const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';
  return Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Formatear número con puntos de miles para inputs
const formatNumberInput = (value) => {
  if (!value && value !== 0) return '';
  const num = String(value).replace(/\D/g, '');
  return num.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

// Parsear número (quitar puntos) para guardar
const parseNumberInput = (value) => {
  if (!value) return '';
  return String(value).replace(/\./g, '');
};

const formatDate = (dateStr) => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' });
};

const COLORS = ['#6366f1', '#8b5cf6', '#a855f7', '#d946ef', '#ec4899', '#f43f5e'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const VENDEDORES = ['Rodrigo', 'Francisco', 'Piru'];
const TIPOS_EVENTO = ['Cumple 15', 'Cumple 40', 'Cumple 50', 'Cumple 60', 'Cumple 80', 'Cumple 1 año', 'Aniversario', 'Casamiento', 'Civil', 'Evento Empresa', 'Fiesta Privada', 'PRIVADO', 'Reunion', 'Cumpleaños', 'Bat/Bar Mitzvah'];
const MENUS = ['Tapas', 'Asado', '3 pasos', 'Premium', 'Brunch'];
const TIPOS_MENU = ['Menu Tapeo', 'Menu Asado', 'Menu 3 Pasos', 'Menu Premium', 'Menu Brunch', 'Otro'];
const TURNOS = ['Noche', 'M. Dia'];
const SALONES = ['Tero', 'Cristal', 'Salentein'];
const COBRADORES = ['Francisco', 'Rodrigo', 'Piru', 'Banco', 'Caja'];

// Categorías por tipo de menú
const CATEGORIAS_POR_MENU = {
  'Menu Tapeo': ['Tapeo Frío', 'Tapeo Caliente', 'Cazuelas', 'Mesa de Dulces', 'Fin de Fiesta', 'Bebidas'],
  'Menu Asado': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu 3 Pasos': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu Premium': ['Entradas', 'Principales', 'Postres', 'Bebidas'],
  'Menu Brunch': ['Salado', 'Dulce', 'Bebidas'],
  'Otro': ['Entradas', 'Principales', 'Postres', 'Bebidas']
};

// Platos por tipo de menú y categoría
const PLATOS_POR_MENU = {
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

export default function App() {
  // Auth states
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [userTabsPermitidas, setUserTabsPermitidas] = useState(['dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario', 'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja']);
  const [userVerPrecios, setUserVerPrecios] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cajaDesbloqueada, setCajaDesbloqueada] = useState(false);
  const [cajaDesbloqueoTime, setCajaDesbloqueoTime] = useState(null);
  const [cajaMovimientos, setCajaMovimientos] = useState([]);
  const [tipoCambio, setTipoCambio] = useState(1200);
  const [tcLoading, setTcLoading] = useState(false);
  const [cajaTab, setCajaTab] = useState('ingresos');
  const [showCajaIngresoForm, setShowCajaIngresoForm] = useState(false);
  const [showCajaEgresoForm, setShowCajaEgresoForm] = useState(false);
  const [editingCajaIngreso, setEditingCajaIngreso] = useState(null);
  const [editingCajaEgreso, setEditingCajaEgreso] = useState(null);
  const [cajaIngresoForm, setCajaIngresoForm] = useState({ fecha: new Date().toISOString().split('T')[0], origen: '', observacion: '', receptor: '', monto_pesos: '', monto_dolares: '', cotizacion: '' });
  const [cajaEgresoForm, setCajaEgresoForm] = useState({ fecha: new Date().toISOString().split('T')[0], concepto: '', receptor: '', aportante: '', monto_pesos: '', monto_dolares: '', cotizacion: '', observacion: '' });
  const [showTransferenciaForm, setShowTransferenciaForm] = useState(false);
  const [transferenciaForm, setTransferenciaForm] = useState({ fecha: new Date().toISOString().split('T')[0], origen: '', destino: '', monto_pesos: '', observacion: '' });
  const [editingTransferencia, setEditingTransferencia] = useState(null); // { ingresoId, egresoId }
  const CONCEPTOS_INGRESO = ['Evento', 'Vta directa', 'Caja', 'Banco', 'Otros'];
  const CONCEPTOS_EGRESO = ['R. Socios', 'Pagos extras', 'Tero', 'Otros'];
  const SOCIOS = ['Rodrigo', 'Piru', 'Francisco'];
  const CAJAS = ['Francisco', 'Rodrigo', 'Alejandro', 'Banco', 'Caja'];

  // Permisos según rol
  const canCreate = userRole === 'admin' || userRole === 'vendedor';
  const canEdit = userRole === 'admin' || userRole === 'vendedor';
  const canDelete = userRole === 'admin';

  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'asc' });

  // Filtros de cobranzas
  const [filterCobranzasMes, setFilterCobranzasMes] = useState('todos');
  const [filterCobranzasEstado, setFilterCobranzasEstado] = useState('todos');
  const [filterCobranzasCliente, setFilterCobranzasCliente] = useState('');

  // Filtros de solapas Próximos y A Confirmar
  const [filterMesProximos, setFilterMesProximos] = useState('todos');
  const [filterMesAConfirmar, setFilterMesAConfirmar] = useState('todos');
  const [vistaCobranzas, setVistaCobranzas] = useState('estado'); // 'estado', 'detalle' o 'ipc'

  // Estados para IPC
  const [ipcMensual, setIpcMensual] = useState([]);
  const [showIPCModal, setShowIPCModal] = useState(false);
  const [ipcAñoSeleccionado, setIpcAñoSeleccionado] = useState(new Date().getFullYear());
  const [nuevoIPC, setNuevoIPC] = useState({ mes: '', ipc_indec: '', ipc_aplicado: '' });
  const [ipcPreview, setIpcPreview] = useState({ eventos: 0, totalSaldos: 0, incremento: 0 });
  const [editingIPC, setEditingIPC] = useState(null); // null o { id, año, mes, ipc_indec, ipc_aplicado }

  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date());
  const [selectedEvento, setSelectedEvento] = useState(null);

  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [eventoEdit, setEventoEdit] = useState(null);
  const [pagos, setPagos] = useState([]);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [selectedEventoPago, setSelectedEventoPago] = useState(null);
  const [nuevoPago, setNuevoPago] = useState({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '', observaciones: '' });
  const [editingPagoId, setEditingPagoId] = useState(null);
  const [auditoriaPagos, setAuditoriaPagos] = useState([]);
  const [auditoriaEventos, setAuditoriaEventos] = useState([]);
  const [auditoriaCaja, setAuditoriaCaja] = useState([]);
  const [informeActivo, setInformeActivo] = useState('eliminados');
  const [motivoModificacion, setMotivoModificacion] = useState('');
  const [busquedaContacto, setBusquedaContacto] = useState('');

  // Estados para agenda de contactos (ahora desde Supabase)
  const [clientes, setClientes] = useState([]);
  const [editingContacto, setEditingContacto] = useState(null);
  const [showContactoModal, setShowContactoModal] = useState(false);
  const [showClienteSugerencias, setShowClienteSugerencias] = useState(false);
  const [showClienteSugerenciasEdit, setShowClienteSugerenciasEdit] = useState(false);
  const [telefonoDuplicado, setTelefonoDuplicado] = useState(null);

  // Estado para clima
  const [climaData, setClimaData] = useState({});

  // Estados para gestión de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUsuario, setEditingUsuario] = useState(null);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    email: '',
    password: '',
    password2: '',
    nombre: '',
    rol: 'lectura',
    tabs_permitidas: ['dashboard', 'calendario', 'eventos', 'proximos'],
    ver_precios: true
  });
  const [userError, setUserError] = useState('');

  // Estados para menús
  const [menus, setMenus] = useState([]);
  const [showMenuModal, setShowMenuModal] = useState(false);
  const [editingMenu, setEditingMenu] = useState(null);
  const [nuevoMenu, setNuevoMenu] = useState({
    nombre: '',
    categorias: [
      { nombre: 'Tapeo Frío', items: [] },
      { nombre: 'Tapeo Caliente', items: [] },
      { nombre: 'Cazuelas', items: [] },
      { nombre: 'Mesa de Dulces', items: [] },
      { nombre: 'Fin de Fiesta', items: [] },
      { nombre: 'Bebidas', items: [] }
    ],
    extras: []
  });
  const [nuevoItem, setNuevoItem] = useState('');
  const [nuevoExtra, setNuevoExtra] = useState('');
  const [menuTipoOtro, setMenuTipoOtro] = useState(false);
  const [menuOtroBase, setMenuOtroBase] = useState(''); // Base structure when "Otro" is selected

  // Estados para catálogo de platos y bebidas
  const [menuTab, setMenuTab] = useState('plantillas');
  const [catalogoItems, setCatalogoItems] = useState([]);
  const [showCatalogoForm, setShowCatalogoForm] = useState(false);
  const [editingCatalogoItem, setEditingCatalogoItem] = useState(null);
  const [catalogoForm, setCatalogoForm] = useState({ nombre: '', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' });
  const [catalogoFiltro, setCatalogoFiltro] = useState('todos');
  const [catalogoSubfiltro, setCatalogoSubfiltro] = useState('todos');
  const [catalogoBusqueda, setCatalogoBusqueda] = useState('');
  const CATEGORIAS_CATALOGO = ['Platos', 'Tapas', 'Islas', 'Bebidas'];
  const SUBCATEGORIAS_CATALOGO = {
    'Platos': ['Entradas', 'Principales', 'Postres'],
    'Tapas': ['Tapeo Frío', 'Tapeo Caliente', 'Cazuelas', 'Mesa de Dulces', 'Fin de Fiesta'],
    'Islas': ['Quesos', 'Fiambres', 'Frutas', 'Dulces', 'Otros'],
    'Bebidas': ['Vinos', 'Espumantes', 'Cervezas', 'Tragos', 'Sin Alcohol', 'Aguas', 'Gaseosas']
  };
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: '',
    cliente: '',
    telefono: '',
    turno: 'Noche',
    hora_inicio: '',
    hora_fin: '',
    vendedor: 'Francisco',
    tipo_evento: 'Cumple 50',
    menu: 'Tapas',
    salon: 'Tero',
    tecnica: false,
    tecnica_precio: '',
    tecnica_superior: false,
    tecnica_superior_precio: '',
    ceremonia: false,
    ceremonia_precio: '',
    dj: '',
    celiacos: '',
    vegetarianos: '',
    veganos: '',
    otros: '',
    adultos: '',
    precio_adulto: '',
    menores: '',
    precio_menor: '',
    extra1_desc: '',
    extra1_valor: '',
    extra1_tipo: 'total',
    extra1_confirmado: false,
    extra2_desc: '',
    extra2_valor: '',
    extra2_tipo: 'total',
    extra2_confirmado: false,
    extra3_desc: '',
    extra3_valor: '',
    extra3_tipo: 'total',
    extra3_confirmado: false,
    confirmado: false,
    menu_detalle: null
  });

  // Obtener rol del usuario
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('rol')
        .eq('user_id', userId)
        .single();

      if (data) {
        setUserRole(data.rol);
      } else {
        // Si no tiene registro en usuarios, es lectura por defecto
        setUserRole('lectura');
      }
    } catch (err) {
      console.error('Error fetching role:', err);
      setUserRole('lectura');
    }
  };

  // Helper para mostrar/ocultar precios según permisos
  const displayPrice = (value) => {
    if (!userVerPrecios) return '---';
    return formatCurrency(value);
  };

  // Auth: verificar sesión guardada en localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const elapsed = Date.now() - session.timestamp;
        // Si no pasaron más de 30 minutos, restaurar sesión
        if (elapsed < SESSION_TIMEOUT) {
          setUser(session.user);
          setUserRole(session.role);
          setUserTabsPermitidas(session.tabs_permitidas || ['dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario', 'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja']);
          setUserVerPrecios(session.ver_precios !== false);
          // Actualizar timestamp para extender la sesión
          localStorage.setItem('session', JSON.stringify({ ...session, timestamp: Date.now() }));
        } else {
          // Sesión expirada, limpiar
          localStorage.removeItem('session');
        }
      } catch (e) {
        localStorage.removeItem('session');
      }
    }
    setAuthLoading(false);
  }, []);

  // Bloquear scroll del body cuando hay modal abierto
  useEffect(() => {
    const isModalOpen = selectedEvento || showModal || showPagoModal || showMenuModal || showIPCModal || editMode;
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedEvento, showModal, showPagoModal, showMenuModal, showIPCModal, editMode]);

  // Session timeout (30 minutos = 1800000 ms)
  const sessionTimeoutRef = React.useRef(null);
  const SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutos

  // Función para iniciar el timer de sesión
  const startSessionTimer = () => {
    // Limpiar timer anterior si existe
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
    // Iniciar nuevo timer
    sessionTimeoutRef.current = setTimeout(() => {
      alert('Tu sesión ha expirado. Por favor, ingresa nuevamente.');
      handleLogout();
    }, SESSION_TIMEOUT);
  };

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    // Login con clave única (admin)
    if (loginForm.password === 'admin1234') {
      const userData = { email: loginForm.email, id: 'temp-user', nombre: loginForm.email.split('@')[0] };
      const allTabs = ['dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario', 'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja'];
      setUser(userData);
      setUserRole('admin');
      setUserTabsPermitidas(allTabs);
      setUserVerPrecios(true);
      // Guardar sesión en localStorage para persistencia
      localStorage.setItem('session', JSON.stringify({
        user: userData,
        role: 'admin',
        tabs_permitidas: allTabs,
        ver_precios: true,
        timestamp: Date.now()
      }));
      setLoginLoading(false);
      startSessionTimer();
      return;
    }

    // Buscar usuario en la base de datos
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', loginForm.email)
      .single();

    if (usuarios && loginForm.password) {
      // Intentar login con Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (!authError && authData.user) {
        const userData = { email: usuarios.email, id: authData.user.id, nombre: usuarios.nombre };
        const tabs = usuarios.tabs_permitidas || ['dashboard', 'calendario', 'eventos'];
        const verPrecios = usuarios.ver_precios !== false;

        setUser(userData);
        setUserRole(usuarios.rol);
        setUserTabsPermitidas(tabs);
        setUserVerPrecios(verPrecios);

        localStorage.setItem('session', JSON.stringify({
          user: userData,
          role: usuarios.rol,
          tabs_permitidas: tabs,
          ver_precios: verPrecios,
          timestamp: Date.now()
        }));
        setLoginLoading(false);
        startSessionTimer();
        return;
      }
    }

    setLoginError('Contraseña incorrecta');
    setLoginLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    // Limpiar timer de sesión
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    await supabase.auth.signOut();
    setUser(null);
    // Limpiar sesión guardada en localStorage
    localStorage.removeItem('session');
    // Limpiar formulario para que pida clave de nuevo
    setLoginForm({ email: '', password: '' });
  };

  // Limpiar timer al desmontar componente
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchEventos();
      fetchPagos();
      fetchIPCMensual();
      fetchMenus();
      fetchClientes();
      fetchClima();
      fetchAuditoriaPagos();
      fetchAuditoriaEventos();
      fetchAuditoriaCaja();
      fetchCajaMovimientos();
      fetchTipoCambio();
      if (userRole === 'admin') {
        fetchUsuarios();
      }
    }
  }, [user, userRole]);

  // Cargar catálogo desde localStorage o datos iniciales
  useEffect(() => {
    const saved = localStorage.getItem('catalogoItems');
    // Datos iniciales del catálogo
    const catalogoInicial = [
        // TAPAS - Tapeo Frío
        { id: 1, nombre: 'Montadito De Salmon Ahumado', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 2, nombre: 'Langostino & Mousse De Palta', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 3, nombre: 'Crostini Jamon Crudo & Huevo De Codorniz', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 4, nombre: 'Tortilla Española & Morron Asado', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 5, nombre: 'Montadito Queso Brie, Rucula & Salmon Ahumado', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 6, nombre: 'Montadito De Tomates Confitados Y Albahaca', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 7, nombre: 'Focaccia Con Caponata Siciliana', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 8, nombre: 'Mini De Bondiola Braseada A La Barbacoa & Coleslaw', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        { id: 9, nombre: 'Pintxo Capresse', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Frío' },
        // TAPAS - Tapeo Caliente
        { id: 10, nombre: 'Langostinos Apanados & Alioli', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 11, nombre: 'Empanadillas De Langostinos & Muzzarella', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 12, nombre: 'Pincho De Pollo, Panceta Ahumada, Verdeo & Salsa Thai', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 13, nombre: 'Tapas De Solomillo & Cebolla Caramelizada', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 14, nombre: 'Pinchos De Solomillo Marinados', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 15, nombre: 'Croquetas Catalanas', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 16, nombre: 'Montaditos De Chorizos Con Chimichurri', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 17, nombre: 'Albondiguillas Griegas', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 18, nombre: 'Bastones Mozzarella Apanado', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 19, nombre: 'Mini Hamburguesas', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        { id: 20, nombre: 'Finger De Ave Apanado & Barbacoa', descripcion: '', categoria: 'Tapas', subcategoria: 'Tapeo Caliente' },
        // TAPAS - Cazuelas
        { id: 100, nombre: 'Cazuela De Langostinos Al Ajillo', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 101, nombre: 'Cazuela De Mariscos', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 102, nombre: 'Cazuela De Gambas Al Pil Pil', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 103, nombre: 'Cazuela De Champignones Al Verdeo', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 104, nombre: 'Cazuela De Provolone Fundido', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 105, nombre: 'Cazuela De Chorizo A La Pomarola', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        { id: 106, nombre: 'Revuelto Gramajo', descripcion: '', categoria: 'Tapas', subcategoria: 'Cazuelas' },
        // TAPAS - Mesa de Dulces
        { id: 21, nombre: 'Mini Lemon Pie', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 22, nombre: 'Mini Brownie, Dulce De Leche & Almendras', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 23, nombre: 'Tartines De Coco Con Dulce De Leche', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 24, nombre: 'Cuadraditos De Pastafrola', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 25, nombre: 'Bocaditos Artesanales Chocolate & Dulce De Leche', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 26, nombre: 'Shot Mousse De Chocolate', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 27, nombre: 'Shot Bavarois De Frutilla', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        { id: 28, nombre: 'Espuma De Durazno Con Salsa De Maracuya', descripcion: '', categoria: 'Tapas', subcategoria: 'Mesa de Dulces' },
        // TAPAS - Fin de Fiesta
        { id: 110, nombre: 'Lomitos', descripcion: '', categoria: 'Tapas', subcategoria: 'Fin de Fiesta' },
        { id: 111, nombre: 'Pizzas', descripcion: '', categoria: 'Tapas', subcategoria: 'Fin de Fiesta' },
        // BEBIDAS
        { id: 200, nombre: 'Vino', descripcion: '', categoria: 'Bebidas', subcategoria: 'Vinos' },
        { id: 201, nombre: 'Bebidas Sin Alcohol', descripcion: '', categoria: 'Bebidas', subcategoria: 'Sin Alcohol' },
        { id: 202, nombre: 'Barra De Trago Tradicional', descripcion: '', categoria: 'Bebidas', subcategoria: 'Tragos' },
        { id: 203, nombre: 'Barra De Tragos Y Coctelería', descripcion: '', categoria: 'Bebidas', subcategoria: 'Tragos' },
        { id: 204, nombre: 'Brindis Con Champagne', descripcion: '', categoria: 'Bebidas', subcategoria: 'Espumantes' },
        { id: 205, nombre: 'Champagne', descripcion: '', categoria: 'Bebidas', subcategoria: 'Espumantes' },
        // PLATOS - Entradas (Asado)
        { id: 29, nombre: 'Chorizo Criollo', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 30, nombre: 'Morcilla', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 31, nombre: 'Mollejas', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 32, nombre: 'Chinchulin', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 33, nombre: 'Provoleta', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 34, nombre: 'Tabla de Picada Regional', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 35, nombre: 'Langostinos a la Parrilla Saborizados', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 36, nombre: 'Vieiras Gratinadas', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 37, nombre: 'Burratina con Salmorejo', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 38, nombre: 'Langostinos a la Milanesa', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 39, nombre: 'Gambas al Ajillo', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 40, nombre: 'Muzzarella Apanada', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        { id: 41, nombre: 'Rabas a la Romana', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' },
        // PLATOS - Principales
        { id: 42, nombre: 'Asado Banderita', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 43, nombre: 'Asado al Asador', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 44, nombre: 'Picanha', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 45, nombre: 'Colita de Cuadril', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 46, nombre: 'Bife de Chorizo', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 47, nombre: 'Entraña', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 48, nombre: 'Lomo', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 49, nombre: 'Ojo de Bife', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 50, nombre: 'Prime Ribs', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 51, nombre: 'Pechito de Cerdo', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 52, nombre: 'Brochete de Pollo', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 53, nombre: 'Bondiola', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 54, nombre: 'Vacío', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 55, nombre: 'Risotto del Bosque', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 56, nombre: 'Cintas Mediterránea', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 57, nombre: 'Risotto de Mariscos', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 58, nombre: 'Ñoquis Soufflé', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 59, nombre: 'Sorrentinos de Pollo y Hongos', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 60, nombre: 'Ensalada Caesar', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 61, nombre: 'Ensalada de Mar y Huerto', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 62, nombre: 'Bife de Chorizo a la Pimienta', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 63, nombre: 'Pollo Relleno de Espinaca y Parmesano', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 64, nombre: 'Bondiola con Barbacoa', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 65, nombre: 'Costilla Braseada en su Jugo', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 66, nombre: 'Pescado Blanco con Salsa de Azafrán', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        { id: 67, nombre: 'Agnolotis de Jamón y Queso', descripcion: '', categoria: 'Platos', subcategoria: 'Principales' },
        // PLATOS - Postres
        { id: 68, nombre: 'Queso y Dulce', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 69, nombre: 'Helado 2 Sabores', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 70, nombre: 'Tiramisú', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 71, nombre: 'Volcán de Chocolate', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 72, nombre: 'Clásico Tiramisú', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 73, nombre: 'Flan Casero', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 74, nombre: 'Creppes de DDL, Rum, Nueces y Pasas', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 75, nombre: 'Macedonia de Frutas', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 76, nombre: 'Helado con Frutos Rojos', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
        { id: 77, nombre: 'Volcán de Dulce de Leche', descripcion: '', categoria: 'Platos', subcategoria: 'Postres' },
      ];

    if (saved) {
      // Cargar items guardados y agregar los que falten del catálogo inicial
      const savedItems = JSON.parse(saved);
      const savedNames = savedItems.map(item => item.nombre.toLowerCase());
      const itemsFaltantes = catalogoInicial.filter(item => !savedNames.includes(item.nombre.toLowerCase()));

      if (itemsFaltantes.length > 0) {
        const merged = [...savedItems, ...itemsFaltantes];
        setCatalogoItems(merged);
        localStorage.setItem('catalogoItems', JSON.stringify(merged));
      } else {
        setCatalogoItems(savedItems);
      }
    } else {
      setCatalogoItems(catalogoInicial);
      localStorage.setItem('catalogoItems', JSON.stringify(catalogoInicial));
    }
  }, []);

  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('eventos')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error:', error);
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  const fetchPagos = async () => {
    const { data, error } = await supabase
      .from('pagos')
      .select('*')
      .order('fecha', { ascending: true });

    if (error) {
      console.error('Error pagos:', error);
    } else {
      setPagos(data || []);
    }
  };

  const fetchIPCMensual = async () => {
    const { data, error } = await supabase
      .from('ipc_mensual')
      .select('*')
      .order('año', { ascending: false })
      .order('mes', { ascending: true });

    if (error) {
      console.error('Error IPC:', error);
    } else {
      setIpcMensual(data || []);
    }
  };

  const aplicarIPCMensual = async () => {
    setSaving(true);
    const año = ipcAñoSeleccionado;
    const mes = nuevoIPC.mes;
    const ipcIndec = parseFloat(nuevoIPC.ipc_indec) || 0;
    const ipcAplicado = parseFloat(nuevoIPC.ipc_aplicado);
    const nombreMes = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][mes - 1];

    try {
      // 1. Obtener eventos con saldo pendiente donde el primer pago fue ANTES del mes seleccionado
      const inicioMesIPC = new Date(año, mes - 1, 1); // Primer día del mes del IPC

      const eventosConSaldo = cobranzasData.filter(e => {
        if (e.saldo <= 0) return false;

        // Obtener el primer pago (seña o pago) del evento
        const pagosDelEvento = e.pagos.filter(p => p.concepto === 'pago' || p.concepto === 'seña');
        if (pagosDelEvento.length === 0) return false; // Sin pagos, no aplica IPC

        // Encontrar la fecha del primer pago
        const primerPago = pagosDelEvento.reduce((min, p) =>
          new Date(p.fecha) < new Date(min.fecha) ? p : min
        );
        const fechaPrimerPago = new Date(primerPago.fecha);

        // El IPC solo aplica si el primer pago fue ANTES del mes del IPC
        // (es decir, si el primer pago fue en enero, el IPC empieza en febrero)
        return fechaPrimerPago < inicioMesIPC;
      });

      if (eventosConSaldo.length === 0) {
        alert('No hay eventos con saldo pendiente para ajustar');
        setSaving(false);
        return;
      }

      let totalAjustado = 0;

      // 2. Crear pagos de ajuste IPC para cada evento
      for (const evento of eventosConSaldo) {
        const ajuste = evento.saldo * (ipcAplicado / 100);
        totalAjustado += ajuste;

        // Crear pago de ajuste
        const { error: pagoError } = await supabase
          .from('pagos')
          .insert([{
            evento_id: evento.id,
            fecha: new Date().toISOString().split('T')[0],
            monto: ajuste,
            concepto: 'ajuste_ipc',
            cobrador: user?.email || 'Sistema',
            ipc_indec: ipcIndec,
            ipc_aplicado: ipcAplicado,
            año_ipc: año,
            mes_ipc: mes
          }]);

        if (pagoError) {
          console.error('Error creando pago IPC:', pagoError);
        }

        // Actualizar total_ajustes_ipc del evento
        await supabase
          .from('eventos')
          .update({
            total_ajustes_ipc: (evento.ajustesIPC || 0) + ajuste
          })
          .eq('id', evento.id);
      }

      // 3. Guardar registro de IPC mensual
      const { error: ipcError } = await supabase
        .from('ipc_mensual')
        .upsert([{
          año,
          mes,
          ipc_indec: ipcIndec,
          ipc_aplicado: ipcAplicado,
          aplicado: true,
          fecha_aplicacion: new Date().toISOString(),
          eventos_afectados: eventosConSaldo.length,
          total_ajustado: totalAjustado
        }], { onConflict: 'año,mes' });

      if (ipcError) {
        console.error('Error guardando IPC:', ipcError);
        alert('Error al guardar el registro de IPC');
      } else {
        alert(`IPC ${nombreMes} ${año} aplicado correctamente.\n\nEventos actualizados: ${eventosConSaldo.length}\nTotal ajustado: $${Math.round(totalAjustado).toLocaleString('es-AR')}`);
        setShowIPCModal(false);
        setNuevoIPC({ mes: '', ipc_indec: '', ipc_aplicado: '' });
        fetchIPCMensual();
        fetchPagos();
        fetchEventos();
      }
    } catch (err) {
      console.error('Error aplicando IPC:', err);
      alert('Error al aplicar IPC');
    }

    setSaving(false);
  };

  const handleAddPago = async (e) => {
    e.preventDefault();
    if (!selectedEventoPago) return;
    setSaving(true);

    const montoOriginal = parseFloat(nuevoPago.monto) || 0;
    const esUSD = nuevoPago.moneda === 'USD';
    const cotizacion = esUSD ? (parseFloat(nuevoPago.cotizacionDolar) || 0) : null;
    const montoEnPesos = esUSD ? montoOriginal * cotizacion : montoOriginal;

    // Datos base del pago
    const pagoData = {
      fecha: nuevoPago.fecha,
      monto: montoEnPesos,
      concepto: nuevoPago.concepto,
      cobrador: nuevoPago.cobrador,
      observaciones: nuevoPago.observaciones || null
    };

    // Solo agregar campos de moneda si es USD (para compatibilidad)
    if (esUSD) {
      pagoData.monto_original = montoOriginal;
      pagoData.moneda = 'USD';
      pagoData.cotizacion_dolar = cotizacion;
    }

    let error;
    if (editingPagoId) {
      // Guardar datos para auditoría
      const cliente = selectedEventoPago?.cliente;
      const usuario = user?.email;

      // Actualizar pago existente
      const result = await supabase
        .from('pagos')
        .update(pagoData)
        .eq('id', editingPagoId);
      error = result.error;

      // Guardar auditoría
      if (!error && motivoModificacion) {
        const motivo = motivoModificacion;
        supabase.from('auditoria_pagos').insert({
          cliente: cliente || 'Sin cliente',
          tipo_accion: 'MODIFICADO',
          monto_nuevo: Number(montoEnPesos) || 0,
          concepto_nuevo: nuevoPago.concepto || '',
          motivo: motivo,
          usuario: usuario || 'Sistema'
        }).then(({ error: auditError }) => {
          console.log('Auditoría modificación:', auditError ? auditError.message : 'OK');
          if (!auditError) fetchAuditoriaPagos();
        });
        setMotivoModificacion('');
      }
    } else {
      // Insertar nuevo pago
      const result = await supabase
        .from('pagos')
        .insert([{
          evento_id: selectedEventoPago.id,
          ...pagoData
        }]);
      error = result.error;

      // Guardar en caja_movimientos
      // Si es Banco: tipo='ingreso_banco' (no afecta saldo de caja)
      // Si es efectivo: tipo='ingreso' (suma al saldo de caja)
      if (!error) {
        const tipoMovimiento = nuevoPago.cobrador === 'Banco' ? 'ingreso_banco' : 'ingreso';
        supabase.from('caja_movimientos').insert({
          tipo: tipoMovimiento,
          concepto: selectedEventoPago.cliente,
          monto_pesos: montoEnPesos,
          monto_dolares: esUSD ? montoOriginal : null,
          cotizacion: esUSD ? cotizacion : null,
          persona: nuevoPago.cobrador,
          fecha: nuevoPago.fecha,
          evento_id: selectedEventoPago.id
        }).then(({ error: cajaError }) => {
          if (!cajaError) fetchCajaMovimientos();
        });
      }
    }

    if (error) {
      console.error('Error:', error);
      alert(editingPagoId ? 'Error al actualizar el pago' : 'Error al registrar el pago');
    } else {
      setShowPagoModal(false);
      setNuevoPago({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '', observaciones: '' });
      setSelectedEventoPago(null);
      setEditingPagoId(null);
      fetchPagos();
    }
    setSaving(false);
  };

  const handleEditPago = (pago, evento) => {
    setEditingPagoId(pago.id);
    setSelectedEventoPago(evento);
    setNuevoPago({
      fecha: pago.fecha,
      monto: String(pago.monto_original || pago.monto),
      concepto: pago.concepto,
      moneda: pago.moneda || 'ARS',
      cotizacionDolar: pago.cotizacion_dolar ? String(pago.cotizacion_dolar) : '',
      porcentajeIPC: '',
      cobrador: pago.cobrador || '',
      observaciones: pago.observaciones || ''
    });
    setShowPagoModal(true);
  };

  const handleDeletePago = async (pagoId, evento, pago) => {
    const clave = prompt('Ingrese clave para eliminar:');
    if (clave !== '1970') {
      if (clave !== null) alert('Clave incorrecta');
      return;
    }
    const motivo = prompt('Detalle por qué se elimina este pago:');
    if (!motivo || motivo.trim() === '') {
      alert('Debe ingresar un motivo');
      return;
    }

    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', pagoId);

    if (error) {
      console.error('Error:', error);
      alert('Error al eliminar el pago');
    } else {
      // Si es un pago de IPC, actualizar el registro de ipc_mensual
      if (pago?.concepto === 'ajuste_ipc') {
        // Usar año_ipc y mes_ipc del pago (si existen), o inferir de la fecha
        const añoIPC = pago.año_ipc || new Date(pago.fecha).getFullYear();
        const mesIPC = pago.mes_ipc || (new Date(pago.fecha).getMonth() + 1);

        // Buscar el registro de ipc_mensual correspondiente
        const { data: ipcRegistro } = await supabase
          .from('ipc_mensual')
          .select('*')
          .eq('año', añoIPC)
          .eq('mes', mesIPC)
          .single();

        if (ipcRegistro) {
          const nuevosEventosAfectados = Math.max(0, (ipcRegistro.eventos_afectados || 1) - 1);
          const nuevoTotalAjustado = Math.max(0, (ipcRegistro.total_ajustado || pago.monto) - pago.monto);

          await supabase
            .from('ipc_mensual')
            .update({
              eventos_afectados: nuevosEventosAfectados,
              total_ajustado: nuevoTotalAjustado,
              aplicado: nuevosEventosAfectados > 0
            })
            .eq('id', ipcRegistro.id);

          fetchIPCMensual();
        }

        // Actualizar también el total_ajustes_ipc del evento
        if (evento?.id) {
          const nuevoTotalIPC = Math.max(0, (evento.ajustesIPC || pago.monto) - pago.monto);
          await supabase
            .from('eventos')
            .update({ total_ajustes_ipc: nuevoTotalIPC })
            .eq('id', evento.id);
        }
      }

      // Eliminar también el movimiento de caja correspondiente
      if (evento?.id && pago?.fecha) {
        console.log('Buscando movimiento de caja:', { evento_id: evento.id, fecha: pago.fecha, monto: pago.monto });

        // Primero buscar el registro para confirmar que existe
        const { data: movimientos } = await supabase
          .from('caja_movimientos')
          .select('*')
          .eq('evento_id', evento.id)
          .eq('tipo', 'ingreso');

        console.log('Movimientos encontrados para este evento:', movimientos);

        // Buscar el movimiento que coincida con la fecha y monto aproximado
        const movimientoAEliminar = movimientos?.find(m =>
          m.fecha === pago.fecha && Math.abs(m.monto_pesos - pago.monto) < 1
        );

        if (movimientoAEliminar) {
          const { error: cajaError } = await supabase
            .from('caja_movimientos')
            .delete()
            .eq('id', movimientoAEliminar.id);

          if (cajaError) {
            console.error('Error eliminando de caja:', cajaError);
            alert('Error al eliminar de caja: ' + cajaError.message);
          } else {
            console.log('Movimiento de caja eliminado:', movimientoAEliminar.id);
          }
        } else {
          console.log('No se encontró movimiento de caja correspondiente');
        }

        fetchCajaMovimientos();
      }

      fetchPagos();
      // Guardar auditoría
      const auditData = {
        cliente: evento?.cliente || 'Sin cliente',
        tipo_accion: 'ANULADO',
        monto_original: Number(pago?.monto) || 0,
        concepto: pago?.concepto || '',
        motivo: motivo,
        usuario: user?.email || 'Sistema'
      };
      console.log('Guardando auditoría:', auditData);
      supabase.from('auditoria_pagos').insert(auditData)
        .then(({ data, error }) => {
          console.log('Resultado auditoría:', error ? error.message : 'OK');
          if (!error) fetchAuditoriaPagos();
        });
    }
  };

  const fetchAuditoriaPagos = async () => {
    try {
      const { data, error } = await supabase
        .from('auditoria_pagos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAuditoriaPagos(data);
      }
    } catch (e) {
      // Tabla no existe todavía
    }
  };

  const fetchAuditoriaEventos = async () => {
    try {
      const { data, error } = await supabase
        .from('auditoria_eventos')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        setAuditoriaEventos(data);
      }
    } catch (e) {
      // Tabla no existe todavía
    }
  };

  const fetchAuditoriaCaja = async () => {
    try {
      const { data, error } = await supabase
        .from('auditoria_caja')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching auditoria_caja:', error);
      } else if (data) {
        console.log('Auditoria caja cargada:', data.length, 'registros', data);
        setAuditoriaCaja(data);
      }
    } catch (e) {
      console.error('Error en fetchAuditoriaCaja:', e);
    }
  };

  const fetchCajaMovimientos = async () => {
    try {
      const { data, error } = await supabase
        .from('caja_movimientos')
        .select('*')
        .order('fecha', { ascending: false });

      if (!error && data) {
        setCajaMovimientos(data);
      }
    } catch (e) {
      // Tabla no existe todavía
    }
  };

  // Obtener tipo de cambio del dólar blue (intenta varias fuentes)
  const fetchTipoCambio = async () => {
    setTcLoading(true);
    try {
      // Primero intenta con DolarAPI
      const response = await fetch('https://dolarapi.com/v1/dolares/blue');
      const data = await response.json();
      if (data && data.venta) {
        setTipoCambio(data.venta);
        setTcLoading(false);
        return;
      }
    } catch (e) {
      console.log('DolarAPI no disponible, intentando Bluelytics...');
    }
    try {
      // Fallback a Bluelytics
      const response = await fetch('https://api.bluelytics.com.ar/v2/latest');
      const data = await response.json();
      if (data && data.blue && data.blue.value_sell) {
        setTipoCambio(data.blue.value_sell);
      }
    } catch (e) {
      console.log('No se pudo obtener TC, usando valor por defecto');
    }
    setTcLoading(false);
  };

  const handleConfirmarEvento = async (evento, confirmar = true) => {
    // Si se intenta desconfirmar, verificar que no tenga pagos
    if (!confirmar) {
      const pagosDelEvento = pagos.filter(p => p.evento_id === evento.id);
      if (pagosDelEvento.length > 0) {
        alert(`No se puede desconfirmar este evento porque tiene ${pagosDelEvento.length} pago(s) registrado(s).\n\nPrimero debe anular los pagos en Cobranzas → Detalle de Pagos.`);
        return;
      }
    }

    const { error } = await supabase
      .from('eventos')
      .update({ confirmado: confirmar })
      .eq('id', evento.id);

    if (error) {
      console.error('Error:', error);
      alert('Error al cambiar estado del evento');
    } else {
      fetchEventos();
      setSelectedEvento(null);
    }
  };

  const handleAnularEvento = async (evento) => {
    // Verificar si tiene pagos
    const pagosDelEvento = pagos.filter(p => p.evento_id === evento.id);
    if (pagosDelEvento.length > 0) {
      alert(`No se puede anular este evento porque tiene ${pagosDelEvento.length} pago(s) registrado(s).\n\nPrimero debe anular los pagos en Cobranzas → Detalle de Pagos.`);
      return;
    }

    // Verificar si es evento realizado (pasado)
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(evento.fecha + 'T12:00:00');
    if (fechaEvento < hoy) {
      const clave = prompt('Este evento ya fue realizado. Ingrese la clave para anular:');
      if (clave !== 'admin1234') {
        alert('Clave incorrecta');
        return;
      }
    }

    const motivo = prompt('Motivo de la anulación del evento:');
    if (!motivo) {
      return;
    }

    // Marcar evento como anulado
    const { error } = await supabase
      .from('eventos')
      .update({ anulado: true })
      .eq('id', evento.id);

    if (error) {
      console.error('Error al anular:', error);
      alert('Error al anular el evento: ' + error.message);
    } else {
      fetchEventos();
      setSelectedEvento(null);
      // Guardar auditoría
      supabase.from('auditoria_eventos').insert({
        cliente: evento.cliente,
        fecha_evento: evento.fecha,
        tipo_evento: evento.tipoEvento || evento.tipo_evento,
        tipo_accion: 'ANULADO',
        motivo: motivo,
        usuario: user?.email || 'Sistema'
      }).then(({ error: auditError }) => {
        if (!auditError) fetchAuditoriaEventos();
      });
    }
  };

  const handleRegenerarEvento = async (registro) => {
    // Buscar el evento anulado por cliente y fecha
    const eventoAnulado = eventos.find(e =>
      e.cliente === registro.cliente &&
      e.fecha === registro.fecha_evento &&
      e.anulado === true
    );

    if (!eventoAnulado) {
      alert('No se encontró el evento para regenerar');
      return;
    }

    const { error } = await supabase
      .from('eventos')
      .update({ anulado: false, confirmado: false })
      .eq('id', eventoAnulado.id);

    if (error) {
      alert('Error al regenerar el evento');
    } else {
      // Eliminar de auditoría
      await supabase.from('auditoria_eventos').delete().eq('id', registro.id);
      fetchEventos();
      fetchAuditoriaEventos();
      alert('Evento regenerado. Ahora está en "A Confirmar"');
    }
  };

  // Funciones para gestión de usuarios
  const fetchUsuarios = async () => {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setUsuarios(data);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setSaving(true);

    // 1. Crear usuario en Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: nuevoUsuario.email,
      password: nuevoUsuario.password
    });

    if (authError) {
      setUserError(authError.message);
      setSaving(false);
      return;
    }

    // 2. Agregar a la tabla usuarios con el rol y permisos
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([{
        user_id: authData.user.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
        tabs_permitidas: nuevoUsuario.tabs_permitidas,
        ver_precios: nuevoUsuario.ver_precios
      }]);

    if (dbError) {
      setUserError('Usuario creado pero error al asignar rol: ' + dbError.message);
    } else {
      setShowUserModal(false);
      setNuevoUsuario({
        email: '',
        password: '',
        password2: '',
        nombre: '',
        rol: 'lectura',
        tabs_permitidas: ['dashboard', 'calendario', 'eventos', 'proximos'],
        ver_precios: true
      });
      fetchUsuarios();
    }
    setSaving(false);
  };

  const handleUpdateUserRole = async (userId, newRole) => {
    const { error } = await supabase
      .from('usuarios')
      .update({ rol: newRole })
      .eq('id', userId);

    if (!error) {
      fetchUsuarios();
    }
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setUserError('');
    setSaving(true);

    const { error } = await supabase
      .from('usuarios')
      .update({
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol,
        tabs_permitidas: nuevoUsuario.tabs_permitidas,
        ver_precios: nuevoUsuario.ver_precios
      })
      .eq('id', editingUsuario.id);

    if (error) {
      setUserError('Error al actualizar: ' + error.message);
    } else {
      setShowUserModal(false);
      setEditingUsuario(null);
      setNuevoUsuario({
        email: '',
        password: '',
        password2: '',
        nombre: '',
        rol: 'lectura',
        tabs_permitidas: ['dashboard', 'calendario', 'eventos', 'proximos'],
        ver_precios: true
      });
      fetchUsuarios();
    }
    setSaving(false);
  };

  const handleDeleteUser = async (usuario) => {
    if (!confirm(`¿Eliminar usuario ${usuario.email}?`)) return;

    const { error } = await supabase
      .from('usuarios')
      .delete()
      .eq('id', usuario.id);

    if (!error) {
      fetchUsuarios();
    }
  };

  // Funciones para menús
  const fetchMenus = async () => {
    const { data, error } = await supabase
      .from('menus')
      .select('*')
      .eq('activo', true)
      .order('nombre', { ascending: true });

    if (!error && data) {
      setMenus(data);
    }
  };

  // Fetch clientes desde Supabase
  const fetchClientes = async () => {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true });

    if (!error && data) {
      setClientes(data);
    }
  };

  // Guardar o actualizar cliente en Supabase
  const handleGuardarCliente = async (clienteData) => {
    if (clienteData.id) {
      // Actualizar existente
      const { error } = await supabase
        .from('clientes')
        .update({
          nombre: clienteData.nombre,
          telefono: clienteData.telefono,
          email: clienteData.email,
          observacion1: clienteData.observacion1,
          observacion2: clienteData.observacion2,
          updated_at: new Date().toISOString()
        })
        .eq('id', clienteData.id);

      if (error) {
        console.error('Error actualizando cliente:', error);
        alert('Error al actualizar cliente');
      } else {
        await fetchClientes();
      }
    } else {
      // Crear nuevo
      const { error } = await supabase
        .from('clientes')
        .insert([{
          nombre: clienteData.nombre,
          telefono: clienteData.telefono,
          email: clienteData.email,
          observacion1: clienteData.observacion1,
          observacion2: clienteData.observacion2
        }]);

      if (error) {
        console.error('Error creando cliente:', error);
        alert('Error al crear cliente');
      } else {
        await fetchClientes();
      }
    }
  };

  // Sincronizar contactos de eventos a tabla clientes
  const sincronizarContactos = async () => {
    const contactosExistentes = new Set(clientes.map(c => c.nombre?.toLowerCase().trim()));
    const nuevosContactos = [];

    eventos.forEach(evento => {
      const nombre = evento.cliente?.trim();
      if (nombre && !contactosExistentes.has(nombre.toLowerCase())) {
        contactosExistentes.add(nombre.toLowerCase());
        nuevosContactos.push({
          nombre: nombre,
          telefono: evento.telefono || '',
          email: evento.email || '',
          observacion1: '',
          observacion2: ''
        });
      }
    });

    if (nuevosContactos.length > 0) {
      const { error } = await supabase
        .from('clientes')
        .insert(nuevosContactos);

      if (error) {
        console.error('Error sincronizando contactos:', error);
        alert('Error al sincronizar contactos');
      } else {
        await fetchClientes();
        alert(`Se importaron ${nuevosContactos.length} contactos nuevos`);
      }
    } else {
      alert('No hay contactos nuevos para importar');
    }
  };

  // Fetch clima desde Open-Meteo (16 días de pronóstico)
  const fetchClima = async () => {
    try {
      const response = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=-34.392067&longitude=-58.662472&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=America/Argentina/Buenos_Aires&forecast_days=16'
      );
      const data = await response.json();

      if (data.daily) {
        const climaPorFecha = {};
        data.daily.time.forEach((fecha, i) => {
          climaPorFecha[fecha] = {
            tempMax: Math.round(data.daily.temperature_2m_max[i]),
            tempMin: Math.round(data.daily.temperature_2m_min[i]),
            precipitacion: data.daily.precipitation_probability_max[i],
            codigo: data.daily.weathercode[i]
          };
        });
        setClimaData(climaPorFecha);
      }
    } catch (error) {
      console.error('Error fetching clima:', error);
    }
  };

  // Helper para obtener icono y descripción del clima
  const getClimaInfo = (codigo) => {
    const climas = {
      0: { icono: '☀️', desc: 'Despejado' },
      1: { icono: '🌤️', desc: 'Mayormente despejado' },
      2: { icono: '⛅', desc: 'Parcialmente nublado' },
      3: { icono: '☁️', desc: 'Nublado' },
      45: { icono: '🌫️', desc: 'Neblina' },
      48: { icono: '🌫️', desc: 'Neblina' },
      51: { icono: '🌧️', desc: 'Llovizna leve' },
      53: { icono: '🌧️', desc: 'Llovizna' },
      55: { icono: '🌧️', desc: 'Llovizna intensa' },
      61: { icono: '🌧️', desc: 'Lluvia leve' },
      63: { icono: '🌧️', desc: 'Lluvia' },
      65: { icono: '🌧️', desc: 'Lluvia intensa' },
      80: { icono: '🌦️', desc: 'Chubascos' },
      81: { icono: '🌦️', desc: 'Chubascos' },
      82: { icono: '⛈️', desc: 'Chubascos intensos' },
      95: { icono: '⛈️', desc: 'Tormenta' },
      96: { icono: '⛈️', desc: 'Tormenta con granizo' },
      99: { icono: '⛈️', desc: 'Tormenta fuerte' }
    };
    return climas[codigo] || { icono: '❓', desc: 'Desconocido' };
  };

  const resetNuevoMenu = () => {
    setNuevoMenu({
      nombre: '',
      categorias: [
        { nombre: 'Tapeo Frío', items: [] },
        { nombre: 'Tapeo Caliente', items: [] },
        { nombre: 'Cazuelas', items: [] },
        { nombre: 'Mesa de Dulces', items: [] },
        { nombre: 'Fin de Fiesta', items: [] },
        { nombre: 'Bebidas', items: [] }
      ],
      extras: []
    });
    setEditingMenu(null);
    setMenuTipoOtro(false);
    setMenuOtroBase('');
  };

  const handleAddItemToCategory = (categoriaIndex) => {
    if (!nuevoItem.trim()) return;
    const newCategorias = [...nuevoMenu.categorias];
    newCategorias[categoriaIndex].items.push(nuevoItem.trim());
    setNuevoMenu({ ...nuevoMenu, categorias: newCategorias });
    setNuevoItem('');
  };

  const handleRemoveItemFromCategory = (categoriaIndex, itemIndex) => {
    const newCategorias = [...nuevoMenu.categorias];
    newCategorias[categoriaIndex].items.splice(itemIndex, 1);
    setNuevoMenu({ ...nuevoMenu, categorias: newCategorias });
  };

  const handleAddExtra = () => {
    if (!nuevoExtra.trim()) return;
    setNuevoMenu({
      ...nuevoMenu,
      extras: [...nuevoMenu.extras, nuevoExtra.trim()]
    });
    setNuevoExtra('');
  };

  const handleRemoveExtra = (index) => {
    const newExtras = [...nuevoMenu.extras];
    newExtras.splice(index, 1);
    setNuevoMenu({ ...nuevoMenu, extras: newExtras });
  };

  const handleSaveMenu = async (e) => {
    e.preventDefault();
    setSaving(true);

    const menuData = {
      nombre: nuevoMenu.nombre,
      categorias: nuevoMenu.categorias,
      extras: nuevoMenu.extras,
      activo: true
    };

    console.log('Guardando menú:', menuData);

    let result;
    if (editingMenu) {
      result = await supabase
        .from('menus')
        .update(menuData)
        .eq('id', editingMenu.id)
        .select();
    } else {
      result = await supabase
        .from('menus')
        .insert([menuData])
        .select();
    }

    console.log('Resultado:', result);
    console.log('Error:', result.error);
    console.log('Data:', result.data);
    console.log('Status:', result.status);
    console.log('EditingMenu:', editingMenu);

    if (result.error) {
      console.error('Error guardando menú:', result.error);
      alert('Error al guardar menú: ' + result.error.message);
    } else if (result.data && result.data.length > 0) {
      console.log('Menú guardado exitosamente:', result.data[0]);
      setShowMenuModal(false);
      resetNuevoMenu();
      await fetchMenus();
    } else {
      console.error('No se devolvieron datos - posible problema de permisos RLS');
      alert('Error: No se pudo guardar. Verificar permisos en Supabase.');
    }
    setSaving(false);
  };

  const handleEditMenu = (menu) => {
    setEditingMenu(menu);
    setNuevoMenu({
      nombre: menu.nombre,
      categorias: menu.categorias || [],
      extras: menu.extras || []
    });
    setMenuTipoOtro(!TIPOS_MENU.some(t => menu.nombre.startsWith(t)));
    setShowMenuModal(true);
  };

  const handleDeleteMenu = async (menuId) => {
    if (!confirm('¿Eliminar este menú?')) return;

    console.log('Eliminando menú ID:', menuId);

    const { data, error } = await supabase
      .from('menus')
      .delete()
      .eq('id', menuId)
      .select();

    console.log('Delete resultado - data:', data, 'error:', error);

    if (error) {
      console.error('Error al eliminar menú:', error);
      alert('Error al eliminar menú: ' + error.message);
    } else {
      console.log('Menú eliminado exitosamente');
      await fetchMenus();
    }
  };

  // Abrir ventana con detalle del evento (vista web)
  const abrirDetalle = (evento) => {
    // Buscar ID del cliente
    const clienteEncontrado = clientes.find(c => c.nombre?.toLowerCase() === evento.cliente?.toLowerCase());
    const clienteId = clienteEncontrado?.id ? clienteEncontrado.id.substring(0, 8).toUpperCase() : '-';

    // Obtener clima
    const climaEvento = climaData[evento.fecha];
    let climaHTML = '';
    if (climaEvento) {
      const iconosClima = {
        0: '☀️ Despejado', 1: '🌤️ Mayormente despejado', 2: '⛅ Parcialmente nublado', 3: '☁️ Nublado',
        45: '🌫️ Niebla', 48: '🌫️ Niebla', 51: '🌧️ Llovizna', 53: '🌧️ Llovizna', 55: '🌧️ Llovizna',
        61: '🌧️ Lluvia', 63: '🌧️ Lluvia moderada', 65: '🌧️ Lluvia fuerte',
        80: '🌦️ Chubascos', 81: '🌦️ Chubascos moderados', 82: '🌦️ Chubascos fuertes',
        95: '⛈️ Tormenta', 96: '⛈️ Tormenta con granizo', 99: '⛈️ Tormenta con granizo'
      };
      const descripcionClima = iconosClima[climaEvento.codigo] || '🌡️ Variable';
      climaHTML = `
        <div class="section clima">
          <div class="section-title">🌤️ CLIMA ESPERADO</div>
          <div class="clima-content">
            <span class="temp">${climaEvento.tempMin}°C - ${climaEvento.tempMax}°C</span>
            <span class="desc">${descripcionClima}</span>
            <span class="lluvia">💧 ${climaEvento.precipitacion}% prob. lluvia</span>
          </div>
        </div>
      `;
    }

    // Dietas especiales
    let dietasHTML = '';
    if ((evento.celiacos > 0) || (evento.vegetarianos > 0) || (evento.veganos > 0)) {
      const dietas = [];
      if (evento.celiacos > 0) dietas.push(`<span class="dieta celiaco">🌾 Celíacos: ${evento.celiacos}</span>`);
      if (evento.vegetarianos > 0) dietas.push(`<span class="dieta vegetariano">🥬 Vegetarianos: ${evento.vegetarianos}</span>`);
      if (evento.veganos > 0) dietas.push(`<span class="dieta vegano">🌱 Veganos: ${evento.veganos}</span>`);
      dietasHTML = `
        <div class="section dietas">
          <div class="section-title">🍽️ DIETAS ESPECIALES</div>
          <div class="dietas-content">${dietas.join('')}</div>
        </div>
      `;
    }

    // Servicios técnicos
    let serviciosHTML = '';
    if (evento.tecnica || evento.tecnica_superior || evento.ceremonia || evento.dj) {
      const servicios = [];
      if (evento.tecnica) servicios.push('<span class="servicio">🎵 Técnica</span>');
      if (evento.tecnica_superior) servicios.push('<span class="servicio">🎚️ Técnica Superior</span>');
      if (evento.ceremonia) servicios.push('<span class="servicio">💒 Ceremonia</span>');
      if (evento.dj) servicios.push(`<span class="servicio">🎧 DJ: ${evento.dj}</span>`);
      serviciosHTML = `
        <div class="section servicios">
          <div class="section-title">🔊 SERVICIOS</div>
          <div class="servicios-content">${servicios.join('')}</div>
        </div>
      `;
    }

    // Extras
    let extrasHTML = '';
    const extras = [];
    if (evento.extra1_desc) extras.push(evento.extra1_desc);
    if (evento.extra2_desc) extras.push(evento.extra2_desc);
    if (evento.extra3_desc) extras.push(evento.extra3_desc);
    if (extras.length > 0) {
      extrasHTML = `
        <div class="section extras">
          <div class="section-title">➕ EXTRAS</div>
          <div class="extras-content">${extras.map(e => `<span class="extra">• ${e}</span>`).join('')}</div>
        </div>
      `;
    }

    // Observaciones
    let obsHTML = '';
    if (evento.otros) {
      obsHTML = `
        <div class="section observaciones">
          <div class="section-title">📝 OBSERVACIONES</div>
          <div class="obs-content">${evento.otros}</div>
        </div>
      `;
    }

    const fechaEvento = new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });

    const horario = evento.hora_inicio && evento.hora_fin
      ? `${evento.hora_inicio} a ${evento.hora_fin} hs`
      : evento.hora_inicio ? `Desde ${evento.hora_inicio} hs` : evento.turno;

    const totalPersonas = (evento.adultos || 0) + (evento.menores || 0);

    const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Detalle - ${evento.cliente}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      min-height: 100vh;
      padding: 20px;
      color: #fff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      background: rgba(255,255,255,0.05);
      border-radius: 20px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 25px;
      text-align: center;
    }
    .header h1 { font-size: 24px; margin-bottom: 5px; }
    .header .fecha { font-size: 16px; opacity: 0.9; text-transform: uppercase; }
    .header .emision { font-size: 12px; opacity: 0.7; margin-top: 10px; }

    .cliente-box {
      background: rgba(255,255,255,0.1);
      margin: 15px;
      padding: 15px;
      border-radius: 12px;
      border-left: 4px solid #667eea;
    }
    .cliente-box .nombre { font-size: 20px; font-weight: bold; }
    .cliente-box .info { display: flex; gap: 15px; margin-top: 8px; font-size: 14px; color: #aaa; flex-wrap: wrap; }
    .cliente-box .info span { display: flex; align-items: center; gap: 5px; }

    .evento-info {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
      margin: 15px;
    }
    .info-item {
      background: rgba(255,255,255,0.05);
      padding: 12px;
      border-radius: 10px;
      text-align: center;
    }
    .info-item .label { font-size: 11px; color: #888; text-transform: uppercase; }
    .info-item .value { font-size: 16px; font-weight: 600; margin-top: 4px; }

    .personas {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      margin: 15px;
      padding: 20px;
      border-radius: 12px;
      display: flex;
      justify-content: space-around;
      text-align: center;
    }
    .personas .item .num { font-size: 28px; font-weight: bold; }
    .personas .item .label { font-size: 12px; opacity: 0.9; }

    .section {
      margin: 15px;
      padding: 15px;
      background: rgba(255,255,255,0.05);
      border-radius: 12px;
    }
    .section-title {
      font-size: 12px;
      font-weight: 600;
      color: #888;
      text-transform: uppercase;
      margin-bottom: 10px;
      letter-spacing: 1px;
    }

    .clima-content {
      display: flex;
      flex-wrap: wrap;
      gap: 15px;
      align-items: center;
    }
    .clima-content .temp { font-size: 20px; font-weight: bold; }
    .clima-content .desc { color: #aaa; }
    .clima-content .lluvia { color: #64b5f6; }

    .dietas-content, .servicios-content, .extras-content {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
    }
    .dieta, .servicio, .extra {
      background: rgba(255,255,255,0.1);
      padding: 8px 12px;
      border-radius: 20px;
      font-size: 14px;
    }
    .celiaco { background: rgba(245,158,11,0.2); color: #fbbf24; }
    .vegetariano { background: rgba(34,197,94,0.2); color: #22c55e; }
    .vegano { background: rgba(16,185,129,0.2); color: #10b981; }

    .observaciones { background: rgba(245,158,11,0.1); border: 1px solid rgba(245,158,11,0.3); }
    .obs-content { color: #fbbf24; line-height: 1.5; }

    .footer {
      text-align: center;
      padding: 15px;
      font-size: 12px;
      color: #666;
      border-top: 1px solid rgba(255,255,255,0.1);
    }

    @media print {
      body { background: white; color: black; }
      .container { box-shadow: none; }
      .header { background: #333; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .personas { background: #11998e; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>DETALLE DEL EVENTO</h1>
      <div class="fecha">${fechaEvento}</div>
      <div class="emision">Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
    </div>

    <div class="cliente-box">
      <div class="nombre">${evento.cliente}</div>
      <div class="info">
        <span>🆔 ${clienteId}</span>
        <span>📱 ${evento.telefono || '-'}</span>
        <span>👤 ${evento.vendedor}</span>
      </div>
    </div>

    <div class="evento-info">
      <div class="info-item">
        <div class="label">Tipo de Evento</div>
        <div class="value">${evento.tipo_evento}</div>
      </div>
      <div class="info-item">
        <div class="label">Salón</div>
        <div class="value">${evento.salon || 'Tero'}</div>
      </div>
      <div class="info-item">
        <div class="label">Horario</div>
        <div class="value">${horario}</div>
      </div>
      <div class="info-item">
        <div class="label">Menú</div>
        <div class="value">${evento.menu || '-'}</div>
      </div>
    </div>

    <div class="personas">
      <div class="item">
        <div class="num">${evento.adultos || 0}</div>
        <div class="label">Adultos</div>
      </div>
      <div class="item">
        <div class="num">${evento.menores || 0}</div>
        <div class="label">Menores</div>
      </div>
      <div class="item">
        <div class="num">${totalPersonas}</div>
        <div class="label">Total</div>
      </div>
    </div>

    ${dietasHTML}
    ${climaHTML}
    ${serviciosHTML}
    ${extrasHTML}
    ${obsHTML}

    <div class="footer">
      Tero Restó - Sistema de Gestión de Eventos
    </div>
  </div>
</body>
</html>
    `;

    const ventana = window.open('', '_blank', 'width=650,height=800');
    ventana.document.write(html);
    ventana.document.close();
  };

  // Generar PDF Resumen Operativo (para encargados y cocina) - Blanco y Negro
  const generarPDF = (evento) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ============ COLORES (Blanco y Negro) ============
    const NEGRO = [0, 0, 0];
    const GRIS_OSCURO = [50, 50, 50];
    const GRIS_MEDIO = [100, 100, 100];
    const GRIS_CLARO = [200, 200, 200];
    const GRIS_FONDO = [245, 245, 245];
    const BLANCO = [255, 255, 255];

    // ============ MEDIDAS ============
    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 15;
    const marginRight = 15;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const centerX = pageWidth / 2;

    let y = 15;

    // ============ HELPERS ============
    const drawBox = (x, yPos, w, h, fill = false) => {
      doc.setDrawColor(...NEGRO);
      doc.setLineWidth(0.5);
      if (fill) {
        doc.setFillColor(...GRIS_FONDO);
        doc.rect(x, yPos, w, h, 'FD');
      } else {
        doc.rect(x, yPos, w, h, 'S');
      }
    };

    const drawHeaderBox = (x, yPos, w, h, title) => {
      doc.setFillColor(...NEGRO);
      doc.rect(x, yPos, w, 7, 'F');
      doc.setFontSize(10);
      doc.setTextColor(...BLANCO);
      doc.setFont('helvetica', 'bold');
      doc.text(title, x + w/2, yPos + 5, { align: 'center' });
      doc.setDrawColor(...NEGRO);
      doc.setLineWidth(0.5);
      doc.rect(x, yPos, w, h, 'S');
      doc.setTextColor(...NEGRO);
    };

    // Buscar ID del cliente
    const clienteEncontrado = clientes.find(c => c.nombre?.toLowerCase() === evento.cliente?.toLowerCase());
    const clienteId = clienteEncontrado?.id ? clienteEncontrado.id.substring(0, 8).toUpperCase() : '-';

    // ============ ENCABEZADO ============
    doc.setFillColor(...NEGRO);
    doc.rect(marginLeft, y, contentWidth, 12, 'F');

    doc.setFontSize(16);
    doc.setTextColor(...BLANCO);
    doc.setFont('helvetica', 'bold');
    doc.text('RESUMEN OPERATIVO', centerX, y + 8, { align: 'center' });

    y += 16;

    // ============ FECHAS ============
    const fechaHoy = new Date().toLocaleDateString('es-AR');
    const fechaEvento = new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    doc.setFontSize(9);
    doc.setTextColor(...GRIS_MEDIO);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha de emisión: ${fechaHoy}`, marginLeft, y);

    y += 6;
    doc.setFontSize(12);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(`FECHA DEL EVENTO: ${fechaEvento.toUpperCase()}`, centerX, y, { align: 'center' });

    y += 8;

    // ============ DATOS DEL CLIENTE ============
    const clienteBoxY = y;
    const clienteBoxH = 14;
    drawBox(marginLeft, clienteBoxY, contentWidth, clienteBoxH, true);

    y += 5;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('CLIENTE:', marginLeft + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(evento.cliente || '-', marginLeft + 28, y);

    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('ID:', marginLeft + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(clienteId, marginLeft + 15, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('TEL:', marginLeft + 50, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(evento.telefono || '-', marginLeft + 62, y);

    y = clienteBoxY + clienteBoxH + 5;

    // ============ INFORMACIÓN DEL EVENTO ============
    const infoBoxY = y;
    const infoBoxH = 21;
    drawBox(marginLeft, infoBoxY, contentWidth, infoBoxH, true);

    y += 7;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('EVENTO:', marginLeft + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(evento.tipo_evento || '-', marginLeft + 28, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('SALÓN:', centerX + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(evento.salon || '-', centerX + 28, y);

    y += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('HORARIO:', marginLeft + 5, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    const horario = evento.hora_inicio && evento.hora_fin
      ? `${evento.hora_inicio} a ${evento.hora_fin} hs`
      : evento.hora_inicio ? `Desde ${evento.hora_inicio} hs` : evento.turno;
    doc.text(horario, marginLeft + 28, y);

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('MENÚ:', centerX + 10, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...NEGRO);
    doc.text(evento.menu || '-', centerX + 28, y);

    y = infoBoxY + infoBoxH + 5;

    // ============ CANTIDAD DE PERSONAS ============
    const persBoxY = y;
    const persBoxH = 18;
    drawHeaderBox(marginLeft, persBoxY, contentWidth, persBoxH, 'CANTIDAD DE PERSONAS');

    y += 12;
    const totalPersonas = (evento.adultos || 0) + (evento.menores || 0);
    const colWidth = contentWidth / 3;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`ADULTOS: ${evento.adultos || 0}`, marginLeft + colWidth/2, y, { align: 'center' });
    doc.text(`MENORES: ${evento.menores || 0}`, marginLeft + colWidth + colWidth/2, y, { align: 'center' });
    doc.text(`TOTAL: ${totalPersonas}`, marginLeft + colWidth*2 + colWidth/2, y, { align: 'center' });

    y = persBoxY + persBoxH + 5;

    // ============ DIETAS ESPECIALES ============
    const tieneDietas = (evento.celiacos > 0) || (evento.vegetarianos > 0) || (evento.veganos > 0);
    if (tieneDietas) {
      const dietaBoxY = y;
      const dietaBoxH = 16;
      drawHeaderBox(marginLeft, dietaBoxY, contentWidth, dietaBoxH, 'DIETAS ESPECIALES');

      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      const dietas = [];
      if (evento.celiacos > 0) dietas.push(`CELÍACOS: ${evento.celiacos}`);
      if (evento.vegetarianos > 0) dietas.push(`VEGETARIANOS: ${evento.vegetarianos}`);
      if (evento.veganos > 0) dietas.push(`VEGANOS: ${evento.veganos}`);
      doc.text(dietas.join('     |     '), centerX, y, { align: 'center' });

      y = dietaBoxY + dietaBoxH + 5;
    }

    // ============ CLIMA ============
    const climaEvento = climaData[evento.fecha];
    if (climaEvento) {
      const climaBoxY = y;
      const climaBoxH = 14;
      drawHeaderBox(marginLeft, climaBoxY, contentWidth, climaBoxH, 'CLIMA ESPERADO');

      y += 12;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');

      const iconosClima = {
        0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
        45: 'Niebla', 48: 'Niebla', 51: 'Llovizna', 53: 'Llovizna', 55: 'Llovizna',
        61: 'Lluvia', 63: 'Lluvia moderada', 65: 'Lluvia fuerte',
        80: 'Chubascos', 81: 'Chubascos moderados', 82: 'Chubascos fuertes',
        95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo'
      };
      const descripcionClima = iconosClima[climaEvento.codigo] || 'Variable';

      doc.text(`${climaEvento.tempMin}°C - ${climaEvento.tempMax}°C  |  ${descripcionClima}  |  Prob. lluvia: ${climaEvento.precipitacion}%`, centerX, y, { align: 'center' });

      y = climaBoxY + climaBoxH + 5;
    }

    // ============ SERVICIOS TÉCNICOS ============
    const tieneServicios = evento.tecnica || evento.tecnica_superior || evento.ceremonia || evento.dj;
    if (tieneServicios) {
      const servBoxY = y;
      const servBoxH = 12;
      drawBox(marginLeft, servBoxY, contentWidth, servBoxH, true);

      y += 4;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRIS_OSCURO);
      doc.text('SERVICIOS:', marginLeft + 5, y + 3);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...NEGRO);
      const servicios = [];
      if (evento.tecnica) servicios.push('Técnica');
      if (evento.tecnica_superior) servicios.push('Técnica Superior');
      if (evento.ceremonia) servicios.push('Ceremonia');
      if (evento.dj) servicios.push(`DJ: ${evento.dj}`);
      doc.text(servicios.join('  •  '), marginLeft + 30, y + 3);

      y = servBoxY + servBoxH + 5;
    }

    // ============ EXTRAS ============
    const extras = [];
    if (evento.extra1_desc) extras.push(evento.extra1_desc);
    if (evento.extra2_desc) extras.push(evento.extra2_desc);
    if (evento.extra3_desc) extras.push(evento.extra3_desc);

    if (extras.length > 0) {
      const extrasBoxY = y;
      const extrasBoxH = 8 + (extras.length * 5);
      drawBox(marginLeft, extrasBoxY, contentWidth, extrasBoxH, true);

      y += 5;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...GRIS_OSCURO);
      doc.text('EXTRAS:', marginLeft + 5, y);

      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...NEGRO);
      extras.forEach((extra, i) => {
        doc.text('• ' + extra, marginLeft + 25, y + (i * 5));
      });

      y = extrasBoxY + extrasBoxH + 5;
    }

    // ============ OBSERVACIONES ============
    if (evento.otros) {
      const obsLines = doc.splitTextToSize(evento.otros, contentWidth - 10);
      const obsBoxY = y;
      const obsBoxH = 10 + (obsLines.length * 4);

      drawHeaderBox(marginLeft, obsBoxY, contentWidth, obsBoxH, 'OBSERVACIONES');

      y = obsBoxY + 12;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...NEGRO);
      doc.text(obsLines, marginLeft + 5, y);

      y = obsBoxY + obsBoxH + 5;
    }

    // ============ PIE DE PÁGINA ============
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_MEDIO);
    doc.text(`Vendedor: ${evento.vendedor}  |  Generado: ${new Date().toLocaleDateString('es-AR')} ${new Date().toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}`, centerX, pageHeight - 10, { align: 'center' });

    // Descargar
    const fileName = `Resumen_${evento.cliente.replace(/\s+/g, '_')}_${evento.fecha}.pdf`;
    doc.save(fileName);
  };

  const generarCotizacion = (evento, menuData = null) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // ============ COLORES (RGB) - Verde Oliva ============
    const VERDE_TERO = [85, 107, 47];       // #556B2F - verde oliva oscuro
    const VERDE_SUAVE = [245, 245, 235];    // #F5F5EB - verde oliva muy claro
    const VERDE_OSCURO = [107, 142, 35];    // #6B8E23 - olive drab
    const NEGRO = [17, 24, 39];             // #111827
    const GRIS_TEXTO = [55, 65, 81];        // #374151
    const GRIS_SEC = [107, 114, 128];       // #6B7280
    const GRIS_LINEA = [229, 231, 235];     // #E5E7EB

    // ============ MEDIDAS ============
    const pageWidth = 210;
    const pageHeight = 297;
    const marginLeft = 22;
    const marginRight = 22;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const centerX = pageWidth / 2;

    let y = 20;

    // ============ HELPERS ============
    const formatMoneyPDF = (num) => {
      if (!num && num !== 0) return '$0';
      return '$' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const drawLine = (yPos, color = GRIS_LINEA, width = 0.3) => {
      doc.setDrawColor(...color);
      doc.setLineWidth(width);
      doc.line(marginLeft, yPos, pageWidth - marginRight, yPos);
    };

    const drawBlock = (x, yPos, w, h, fillColor = VERDE_SUAVE) => {
      doc.setFillColor(...fillColor);
      doc.rect(x, yPos, w, h, 'F');
    };

    const drawSectionTitle = (title, yPos) => {
      const textWidth = doc.getStringUnitWidth(title) * 11 / doc.internal.scaleFactor;
      const lineY = yPos;
      const gap = 4;

      doc.setDrawColor(...GRIS_LINEA);
      doc.setLineWidth(0.3);
      doc.line(marginLeft, lineY, centerX - textWidth/2 - gap, lineY);
      doc.line(centerX + textWidth/2 + gap, lineY, pageWidth - marginRight, lineY);

      doc.setFontSize(11);
      doc.setTextColor(...GRIS_SEC);
      doc.setFont('helvetica', 'normal');
      doc.text(title, centerX, lineY + 0.5, { align: 'center' });

      return yPos + 10;
    };

    // ============ PÁGINA 1 ============

    // --- LOGO (imagen) ---
    try {
      doc.addImage('/logo-tero.jpg', 'JPEG', centerX - 18, y, 36, 25);
      y += 30;
    } catch (e) {
      // Fallback a texto si no hay imagen
      doc.setFontSize(24);
      doc.setTextColor(...VERDE_OSCURO);
      doc.setFont('helvetica', 'bold');
      doc.text('TERO RESTÓ', centerX, y + 12, { align: 'center' });
      y += 20;
    }

    // --- TÍTULO COTIZACIÓN (centrado manualmente) ---
    doc.setFontSize(14);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    const tituloCot = 'COTIZACIÓN DE EVENTO';
    const tituloWidth = doc.getStringUnitWidth(tituloCot) * 14 / doc.internal.scaleFactor;
    const tituloX = (pageWidth - tituloWidth) / 2;
    doc.text(tituloCot, tituloX, y);

    y += 5;
    // Línea centrada debajo del título
    const lineaWidth = tituloWidth + 10;
    const lineaX = (pageWidth - lineaWidth) / 2;
    doc.setDrawColor(...VERDE_TERO);
    doc.setLineWidth(0.8);
    doc.line(lineaX, y, lineaX + lineaWidth, y);

    y += 10;

    // --- FECHAS ---
    const fechaHoy = new Date().toLocaleDateString('es-AR');
    const fechaValidez = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR');

    doc.setFontSize(10);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('Fecha: ' + fechaHoy, marginLeft, y);
    doc.text('Válida hasta: ' + fechaValidez, pageWidth - marginRight, y, { align: 'right' });

    y += 12;

    // --- DATOS DEL CLIENTE ---
    y = drawSectionTitle('DATOS DEL CLIENTE', y);

    const clienteBlockY = y;
    const clienteBlockH = 12;
    // Dibujar bloque ANTES del texto
    drawBlock(marginLeft, clienteBlockY, contentWidth, clienteBlockH);

    doc.setFontSize(10);
    doc.setTextColor(...GRIS_SEC);
    doc.text('Cliente:', marginLeft + 5, y + 7);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(evento.cliente || evento.nombre || 'N/A', marginLeft + 20, y + 7);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Tel:', centerX + 10, y + 7);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(evento.telefono || 'N/A', centerX + 20, y + 7);
    doc.setFont('helvetica', 'normal');

    y += clienteBlockH + 6;

    // --- DETALLES DEL EVENTO ---
    y = drawSectionTitle('DETALLES DEL EVENTO', y);

    const detalleBlockY = y;
    const detalleBlockH = 24;
    // Dibujar bloque ANTES del texto
    drawBlock(marginLeft, detalleBlockY, contentWidth, detalleBlockH);

    const col1 = marginLeft + 5;
    const col1Val = marginLeft + 18;
    const col2 = centerX + 5;
    const col2Val = centerX + 25;

    let fechaEvento = evento.fecha || 'N/A';
    if (evento.fecha) {
      try {
        const date = new Date(evento.fecha + 'T12:00:00');
        const dias = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
        const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
        fechaEvento = dias[date.getDay()] + ', ' + date.getDate() + ' de ' + meses[date.getMonth()] + ' de ' + date.getFullYear();
        fechaEvento = fechaEvento.charAt(0).toUpperCase() + fechaEvento.slice(1);
      } catch (e) {
        fechaEvento = evento.fecha;
      }
    }

    // Fila 1: Evento y Turno
    doc.setFontSize(10);
    doc.setTextColor(...GRIS_SEC);
    doc.text('Evento:', col1, y + 6);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(evento.tipo_evento || evento.tipo || 'N/A', col1Val, y + 6);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Turno:', col2, y + 6);
    const turnoText = evento.turno || 'Noche';
    const horaText = evento.hora_inicio && evento.hora_fin ? ' (' + evento.hora_inicio + ' - ' + evento.hora_fin + ')' : '';
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(turnoText + horaText, col2Val, y + 6);

    // Fila 2: Fecha e Invitados
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Fecha:', col1, y + 12);
    doc.setTextColor(...NEGRO);
    doc.text(fechaEvento, col1Val, y + 12);

    doc.setTextColor(...GRIS_SEC);
    doc.text('Invitados:', col2, y + 12);
    let invitadosText = (evento.adultos || 0) + ' adultos';
    if (evento.menores && evento.menores > 0) {
      invitadosText += ', ' + evento.menores + ' menores';
    }
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(invitadosText, col2Val, y + 12);

    // Fila 3: Salón
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Salón:', col1, y + 18);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text(evento.salon || 'N/A', col1Val, y + 18);

    doc.setFont('helvetica', 'normal');
    y += detalleBlockH + 8;

    // --- MENÚ (ancho completo) ---
    const menuDetalle = evento.menu_detalle;
    const menuTitulo = (menuDetalle?.nombre || evento.menu || 'Menu 3 Pasos').toUpperCase();

    // Guardar posición inicial del recuadro
    const menuBoxY = y - 2;
    const menuPadding = 5;
    const menuHeaderH = 8;

    // Header con fondo verde oliva y texto blanco centrado
    doc.setFillColor(...VERDE_TERO);
    doc.rect(marginLeft, menuBoxY, contentWidth, menuHeaderH, 'F');
    doc.setFontSize(11);
    doc.setTextColor(255, 255, 255); // Blanco
    doc.setFont('helvetica', 'bold');
    doc.text('MENÚ: ' + menuTitulo, centerX, menuBoxY + 5.5, { align: 'center' });

    y = menuBoxY + menuHeaderH + 4;

    // Items del menú desde menu_detalle - 2 columnas
    if (menuDetalle && menuDetalle.categorias) {
      const menuColLeft = marginLeft + menuPadding;
      const menuColRight = centerX + 5;

      // Filtrar categorías con items
      const categoriasConItems = menuDetalle.categorias.filter(c => c.items && c.items.length > 0);
      const totalCategorias = categoriasConItems.length;
      const mitad = Math.ceil(totalCategorias / 2);

      // Columna izquierda: primeras categorías
      const categoriasIzq = categoriasConItems.slice(0, mitad);
      // Columna derecha: últimas categorías
      const categoriasDer = categoriasConItems.slice(mitad);

      let yLeft = y;
      let yRight = y;

      // Función para truncar texto si es muy largo
      const truncarTexto = (texto, maxChars) => {
        if (texto.length > maxChars) {
          return texto.substring(0, maxChars - 2) + '...';
        }
        return texto;
      };

      // Función para obtener sufijo de categoría
      const getSufijoCat = (nombreCat) => {
        if (nombreCat === 'Cazuelas') return ' (2 a elección)';
        if (nombreCat === 'Fin de Fiesta') return ' (una opción)';
        return '';
      };

      // Dibujar columna izquierda
      categoriasIzq.forEach(categoria => {
        doc.setFontSize(10);
        doc.setTextColor(...VERDE_TERO);
        doc.setFont('helvetica', 'bold');
        const sufijo = getSufijoCat(categoria.nombre);
        doc.text(categoria.nombre + sufijo, menuColLeft, yLeft);
        yLeft += 5;

        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'normal');

        categoria.items.forEach(item => {
          const itemTruncado = truncarTexto(item, 38);
          doc.text('• ' + itemTruncado, menuColLeft, yLeft);
          yLeft += 4;
        });
        yLeft += 3;
      });

      // Dibujar columna derecha
      categoriasDer.forEach(categoria => {
        doc.setFontSize(10);
        doc.setTextColor(...VERDE_TERO);
        doc.setFont('helvetica', 'bold');
        const sufijo = getSufijoCat(categoria.nombre);
        doc.text(categoria.nombre + sufijo, menuColRight, yRight);
        yRight += 5;

        doc.setFontSize(9);
        doc.setTextColor(...GRIS_TEXTO);
        doc.setFont('helvetica', 'normal');

        categoria.items.forEach(item => {
          const itemTruncado = truncarTexto(item, 38);
          doc.text('• ' + itemTruncado, menuColRight, yRight);
          yRight += 4;
        });
        yRight += 3;
      });

      // Usar la altura máxima de ambas columnas
      y = Math.max(yLeft, yRight) + 2;
    }

    // Dibujar recuadro alrededor del menú
    const menuBoxH = y - menuBoxY + 2;
    doc.setDrawColor(...VERDE_TERO);
    doc.setLineWidth(0.5);
    doc.rect(marginLeft, menuBoxY, contentWidth, menuBoxH);

    y += 8;

    // --- DETALLE DE PRECIOS ---
    // Verificar si necesitamos nueva página (espacio para tabla completa ~80mm)
    if (y > 200) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(13);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DE PRECIOS', marginLeft, y);
    y += 8;

    const colConcepto = marginLeft;
    const colCant = marginLeft + 80;
    const colPrecio = marginLeft + 105;
    const colSubtotal = pageWidth - marginRight;

    doc.setFontSize(10);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('Concepto', colConcepto, y);
    doc.text('Cant.', colCant, y);
    doc.text('Precio Unit.', colPrecio, y);
    doc.text('Subtotal', colSubtotal, y, { align: 'right' });

    y += 3;
    drawLine(y, GRIS_LINEA, 0.3);
    y += 6;

    let subtotalGeneral = 0;
    const adultos = evento.adultos || 0;
    const precioAdulto = evento.precio_adulto || 0;
    const menores = evento.menores || 0;
    const precioMenor = evento.precio_menor || 0;

    doc.setTextColor(...GRIS_TEXTO);

    // Adultos
    if (adultos > 0) {
      const subtotalAdultos = adultos * precioAdulto;
      subtotalGeneral += subtotalAdultos;
      doc.text('Adultos', colConcepto, y);
      doc.text(String(adultos), colCant, y);
      doc.text(formatMoneyPDF(precioAdulto), colPrecio, y);
      doc.text(formatMoneyPDF(subtotalAdultos), colSubtotal, y, { align: 'right' });
      y += 7;
    }

    // Menores
    if (menores > 0) {
      const subtotalMenores = menores * precioMenor;
      subtotalGeneral += subtotalMenores;
      doc.text('Menores', colConcepto, y);
      doc.text(String(menores), colCant, y);
      doc.text(formatMoneyPDF(precioMenor), colPrecio, y);
      doc.text(formatMoneyPDF(subtotalMenores), colSubtotal, y, { align: 'right' });
      y += 7;
    }

    // Extras
    [1, 2, 3].forEach(i => {
      const desc = evento[`extra${i}_desc`];
      const valor = evento[`extra${i}_valor`] || 0;
      const tipo = evento[`extra${i}_tipo`];
      if (desc && valor > 0) {
        const cant = tipo === 'por_persona' ? adultos : 1;
        const subtotalExtra = valor * cant;
        subtotalGeneral += subtotalExtra;
        doc.text(desc.substring(0, 30), colConcepto, y);
        doc.text(String(cant), colCant, y);
        doc.text(formatMoneyPDF(valor), colPrecio, y);
        doc.text(formatMoneyPDF(subtotalExtra), colSubtotal, y, { align: 'right' });
        y += 7;
      }
    });

    // Técnica
    if (evento.tecnica && evento.tecnica_precio > 0) {
      subtotalGeneral += evento.tecnica_precio;
      doc.text('Técnica de sonido e iluminación', colConcepto, y);
      doc.text('1', colCant, y);
      doc.text(formatMoneyPDF(evento.tecnica_precio), colPrecio, y);
      doc.text(formatMoneyPDF(evento.tecnica_precio), colSubtotal, y, { align: 'right' });
      y += 7;
    }

    // Técnica Superior
    if (evento.tecnica_superior && evento.tecnica_superior_precio > 0) {
      subtotalGeneral += evento.tecnica_superior_precio;
      doc.text('Técnica superior (premium)', colConcepto, y);
      doc.text('1', colCant, y);
      doc.text(formatMoneyPDF(evento.tecnica_superior_precio), colPrecio, y);
      doc.text(formatMoneyPDF(evento.tecnica_superior_precio), colSubtotal, y, { align: 'right' });
      y += 7;
    }

    y += 2;
    drawLine(y, GRIS_LINEA, 0.3);
    y += 8;

    // Usar subtotalGeneral que ahora incluye técnica
    const subtotal = subtotalGeneral > 0 ? subtotalGeneral : (evento.total_evento || evento.totalEvento || 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    // Subtotal en verde
    doc.setFontSize(11);
    doc.setTextColor(...VERDE_TERO);
    doc.setFont('helvetica', 'bold');
    doc.text('Subtotal:', colPrecio, y);
    doc.text(formatMoneyPDF(subtotal), colSubtotal, y, { align: 'right' });

    y += 6;
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('IVA 21%:', colPrecio, y);
    doc.text(formatMoneyPDF(iva), colSubtotal, y, { align: 'right' });

    y += 4;
    doc.setDrawColor(...VERDE_TERO);
    doc.setLineWidth(0.5);
    doc.line(colPrecio - 5, y, colSubtotal, y);
    y += 8;

    // Total mismo tamaño que subtotal
    doc.setFontSize(11);
    doc.setTextColor(...VERDE_TERO);
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL:', colPrecio, y);
    doc.text(formatMoneyPDF(total), colSubtotal, y, { align: 'right' });

    y += 15;

    // --- SERVICIOS ADICIONALES (solo DJ, técnica va en detalle de precios) ---
    if (evento.dj) {
      doc.setFontSize(11);
      doc.setTextColor(...NEGRO);
      doc.setFont('helvetica', 'bold');
      doc.text('SERVICIOS ADICIONALES', marginLeft, y);
      y += 6;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...GRIS_TEXTO);
      doc.text('• DJ: ' + evento.dj, marginLeft, y);
      y += 10;
    }

    // --- OBSERVACIONES ---
    if (evento.otros) {
      doc.setFontSize(11);
      doc.setTextColor(...NEGRO);
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVACIONES', marginLeft, y);
      y += 6;

      doc.setFontSize(10);
      doc.setTextColor(...GRIS_TEXTO);
      doc.setFont('helvetica', 'normal');
      const obsLines = doc.splitTextToSize(evento.otros, contentWidth);
      obsLines.forEach(line => {
        doc.text(line, marginLeft, y);
        y += 5;
      });
      y += 5;
    }

    // --- FORMAS DE PAGO ---
    if (y > 220) {
      doc.addPage();
      y = 25;
    }

    doc.setFontSize(11);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text('FORMAS DE PAGO:', marginLeft, y);
    y += 6;

    const formasPago = [
      'Los valores son sin IVA.',
      'Anticipo del 50%',
      'Saldos se ajustan por IPC',
      'Cancelación 15 días antes del evento.'
    ];

    doc.setFontSize(9.5);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    formasPago.forEach(item => {
      doc.text('• ' + item, marginLeft, y);
      y += 5;
    });

    y += 4;

    // --- CANCELACION ---
    doc.setFontSize(11);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text('CANCELACIÓN', marginLeft, y);
    y += 6;

    doc.setFontSize(9.5);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');

    doc.text('• En caso de posponer por causas ajenas a la empresa, se verá otra fecha disponible.', marginLeft, y);
    y += 5;

    const cancelText1 = 'En caso de cancelar por causas ajenas a la empresa, la seña sobre el 30% de la seña';
    const cancelText2 = 'será tomada cuando la cancelación es mayor a 2 meses de anticipación, y en caso que';
    const cancelText3 = 'la cancelación sea con menos de 2 meses de anticipación quedará tomada en su totalidad.';

    doc.text('• ' + cancelText1, marginLeft, y);
    y += 4.5;
    doc.text('  ' + cancelText2, marginLeft, y);
    y += 4.5;
    doc.text('  ' + cancelText3, marginLeft, y);
    y += 5;

    // --- FOOTER en todas las páginas ---
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(...GRIS_SEC);
      doc.setFont('helvetica', 'italic');
      doc.text('Gracias por confiar en Tero Restó', centerX, pageHeight - 12, { align: 'center' });
    }

    // ============ GUARDAR ============
    const fileName = 'Cotizacion_' + (evento.cliente || evento.nombre || 'evento').replace(/\s+/g, '_') + '_' + (evento.fecha || 'fecha') + '.pdf';
    doc.save(fileName);
  };

  // ============ GENERADOR DE RECIBO DE PAGO ============
  const generarRecibo = (evento, pagoData, saldoAnterior) => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: [210, 220]  // Formato 210x220mm
    });

    // Colores
    const VERDE_TERO = [85, 107, 47];       // Verde oliva oscuro
    const VERDE_SUAVE = [245, 245, 235];    // Verde oliva muy claro
    const TERRACOTA = [180, 90, 50];        // Terracota/naranja cálido Tero
    const NEGRO = [17, 24, 39];
    const GRIS_OSCURO = [55, 65, 81];       // Para Total del evento
    const GRIS_CLARO = [140, 150, 160];     // Para Pagado anteriormente
    const GRIS_SEC = [107, 114, 128];
    const GRIS_LINEA = [229, 231, 235];
    const VERDE_FUERTE = [22, 120, 60];     // Verde fuerte para montos

    // Medidas
    const pageWidth = 210;
    const marginLeft = 20;
    const marginRight = 20;
    const contentWidth = pageWidth - marginLeft - marginRight;
    const centerX = pageWidth / 2;

    let y = 20;

    // Helper para formatear montos
    const formatMoneyPDF = (num) => {
      if (!num && num !== 0) return '$0';
      return '$' + Math.round(num).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    // --- ENCABEZADO: TÍTULO (izq) + LOGO (der) ---
    // Título a la izquierda
    doc.setFontSize(14);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text('RECIBO DE SEÑA - EVENTO', marginLeft, y + 8);

    // Logo a la derecha (estirado 15% y reducido 15%)
    try {
      doc.addImage('/logo-tero.jpg', 'JPEG', pageWidth - marginRight - 27, y, 27, 17);
    } catch (e) {
      doc.setFontSize(12);
      doc.setTextColor(...VERDE_TERO);
      doc.setFont('helvetica', 'bold');
      doc.text('TERO', pageWidth - marginRight, y + 10, { align: 'right' });
    }
    y += 20;

    // --- NÚMERO DE RECIBO Y FECHA ---
    const numeroRecibo = Date.now().toString().slice(-8);
    const ahora = new Date();
    const hora = ahora.getHours();
    const minutos = ahora.getMinutes().toString().padStart(2, '0');
    const ampm = hora >= 12 ? 'p.m.' : 'a.m.';
    const hora12 = hora % 12 || 12;
    const fechaRecibo = ahora.toLocaleDateString('es-AR', {
      day: '2-digit', month: '2-digit', year: 'numeric'
    }) + ', ' + hora12 + ':' + minutos + ' ' + ampm;

    doc.setFontSize(9);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('Recibo N°: ' + numeroRecibo, marginLeft, y);
    doc.text('Fecha: ' + fechaRecibo, pageWidth - marginRight, y, { align: 'right' });
    y += 4;

    // Línea divisoria terracota
    doc.setDrawColor(...TERRACOTA);
    doc.setLineWidth(0.8);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 8;

    // --- DOS COLUMNAS: DATOS DEL EVENTO + DETALLE DEL PAGO ---
    const TERRACOTA_SUAVE = [255, 248, 243];  // Terracota muy suave
    const boxWidth = (contentWidth - 4) / 2;  // Ancho de cada caja
    const boxHeight = 36;
    const boxPadding = 4;

    // Caja izquierda: DATOS DEL EVENTO
    doc.setFillColor(...TERRACOTA_SUAVE);
    doc.roundedRect(marginLeft, y, boxWidth, boxHeight, 2, 2, 'F');

    let yLeft = y + 5;
    const colEtiquetaL = marginLeft + boxPadding;
    const colValorL = marginLeft + boxPadding + 32;

    doc.setFontSize(8);
    doc.setTextColor(...TERRACOTA);
    doc.setFont('helvetica', 'bold');
    doc.text('DATOS DEL EVENTO', colEtiquetaL, yLeft);
    yLeft += 5;

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Cliente:', colEtiquetaL, yLeft);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text((evento.cliente || '-').substring(0, 18), colValorL, yLeft);
    yLeft += 4.5;

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Evento:', colEtiquetaL, yLeft);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text((evento.tipoEvento || evento.tipo_evento || '-').substring(0, 16), colValorL, yLeft);
    yLeft += 4.5;

    doc.setTextColor(...GRIS_SEC);
    doc.text('Fecha:', colEtiquetaL, yLeft);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(formatDate(evento.fecha), colValorL, yLeft);
    yLeft += 4.5;

    const totalPersonas = (evento.adultos || 0) + (evento.menores || 0);
    doc.setTextColor(...GRIS_SEC);
    doc.text('Personas aprox.:', colEtiquetaL, yLeft);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(String(totalPersonas), colValorL, yLeft);
    yLeft += 4.5;

    doc.setTextColor(...GRIS_SEC);
    doc.text('Salón:', colEtiquetaL, yLeft);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(evento.salon || 'Tero', colValorL, yLeft);

    // Caja derecha: DETALLE DEL PAGO
    const rightBoxX = marginLeft + boxWidth + 4;
    doc.setFillColor(...TERRACOTA_SUAVE);
    doc.roundedRect(rightBoxX, y, boxWidth, boxHeight, 2, 2, 'F');

    let yRight = y + 5;
    const colEtiquetaR = rightBoxX + boxPadding;
    const colValorR = rightBoxX + boxPadding + 28;

    doc.setFontSize(8);
    doc.setTextColor(...TERRACOTA);
    doc.setFont('helvetica', 'bold');
    doc.text('DETALLE DEL PAGO', colEtiquetaR, yRight);
    yRight += 5;

    const conceptoTexto = pagoData.concepto === 'seña' ? 'Seña' : pagoData.concepto === 'ajuste_ipc' ? 'Ajuste IPC' : 'Pago';

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...GRIS_SEC);
    doc.text('Fecha pago:', colEtiquetaR, yRight);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(formatDate(pagoData.fecha), colValorR, yRight);
    yRight += 4.5;

    doc.setTextColor(...GRIS_SEC);
    doc.text('Concepto:', colEtiquetaR, yRight);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text(conceptoTexto, colValorR, yRight);
    yRight += 4.5;

    doc.setTextColor(...GRIS_SEC);
    doc.text('Cobrado por:', colEtiquetaR, yRight);
    doc.setTextColor(...GRIS_OSCURO);
    doc.text((pagoData.cobrador || '-').substring(0, 12), colValorR, yRight);
    yRight += 4.5;

    if (pagoData.moneda === 'USD') {
      doc.setTextColor(...GRIS_SEC);
      doc.text('Moneda:', colEtiquetaR, yRight);
      doc.setTextColor(...GRIS_OSCURO);
      doc.text('USD ($' + (pagoData.cotizacion || '-') + ')', colValorR, yRight);
    }

    y += boxHeight + 6;

    // --- IMPORTE RECIBIDO (elegante, sin borde grueso) ---
    doc.setFillColor(240, 248, 240);  // Verde muy suave
    doc.rect(marginLeft, y, contentWidth, 18, 'F');

    doc.setFontSize(12);
    doc.setTextColor(...GRIS_OSCURO);
    doc.setFont('helvetica', 'bold');
    doc.text('IMPORTE RECIBIDO', marginLeft + 5, y + 12);
    doc.setFontSize(18);
    doc.setTextColor(...VERDE_FUERTE);  // Verde fuerte para el monto
    doc.text(formatMoneyPDF(pagoData.monto), pageWidth - marginRight - 5, y + 12, { align: 'right' });
    y += 26;

    // --- ESTADO DE CUENTA ---
    doc.setFontSize(11);
    doc.setTextColor(...NEGRO);
    doc.setFont('helvetica', 'bold');
    doc.text('ESTADO DE CUENTA', marginLeft, y);
    y += 10;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const colLabel = marginLeft;
    const colValue = pageWidth - marginRight;

    // Total evento aprox. (gris oscuro)
    doc.setTextColor(...GRIS_OSCURO);
    doc.text('Total evento aprox.:', colLabel, y);
    doc.text(formatMoneyPDF(evento.totalEvento || evento.total_evento || 0), colValue, y, { align: 'right' });
    y += 7;

    // Pagado anteriormente (gris claro)
    doc.setTextColor(...GRIS_CLARO);
    doc.text('Pagado anteriormente:', colLabel, y);
    doc.text(formatMoneyPDF(saldoAnterior.pagadoAntes || 0), colValue, y, { align: 'right' });
    y += 7;

    // Este pago (verde oliva)
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...VERDE_TERO);
    doc.text('Este pago:', colLabel, y);
    doc.text(formatMoneyPDF(pagoData.monto), colValue, y, { align: 'right' });
    y += 8;

    // Línea separadora antes del saldo
    doc.setDrawColor(...TERRACOTA);
    doc.setLineWidth(0.5);
    doc.line(marginLeft, y, pageWidth - marginRight, y);
    y += 10;

    // Saldo pendiente con IVA (grande, terracota)
    const nuevoSaldo = (evento.totalEvento || evento.total_evento || 0) - (saldoAnterior.pagadoAntes || 0) - pagoData.monto;
    const iva = nuevoSaldo * 0.21;
    const saldoConIva = nuevoSaldo + iva;
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    if (nuevoSaldo > 0) {
      doc.setTextColor(...TERRACOTA);
      doc.text('SALDO PENDIENTE + IVA (21%):', colLabel, y);
      doc.text(formatMoneyPDF(saldoConIva), colValue, y, { align: 'right' });
    } else {
      doc.setTextColor(...VERDE_FUERTE);
      doc.text('EVENTO CANCELADO', colLabel, y);
      doc.text(formatMoneyPDF(0), colValue, y, { align: 'right' });
    }
    y += 21;  // 80px desde SALDO PENDIENTE

    // --- FIRMA ---
    doc.setDrawColor(...GRIS_LINEA);
    doc.setLineWidth(0.3);
    doc.line(centerX - 35, y, centerX + 35, y);
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('Firma y sello', centerX, y + 4, { align: 'center' });
    y += 16;  // 60px

    // --- TEXTOS LEGALES ---
    doc.setFontSize(7.5);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'normal');
    doc.text('La seña confirma la reserva de fecha y salón.', centerX, y, { align: 'center' });
    y += 3.5;
    doc.text('El saldo deberá abonarse previo al evento.', centerX, y, { align: 'center' });
    y += 3.5;
    doc.setFont('helvetica', 'italic');
    doc.text('Este comprobante no constituye factura.', centerX, y, { align: 'center' });
    y += 5;  // 20px

    // --- FOOTER ---
    doc.setFontSize(8);
    doc.setTextColor(...GRIS_SEC);
    doc.setFont('helvetica', 'italic');
    doc.text('Gracias por confiar en Tero', centerX, y, { align: 'center' });

    // Guardar
    const fileName = 'Recibo_' + (evento.cliente || 'pago').replace(/\s+/g, '_') + '_' + pagoData.fecha + '.pdf';
    doc.save(fileName);
  };

  const calcularTotal = () => {
    const adultos = parseInt(nuevoEvento.adultos) || 0;
    const precioAdulto = parseFloat(nuevoEvento.precio_adulto) || 0;
    const menores = parseInt(nuevoEvento.menores) || 0;
    const precioMenor = parseFloat(nuevoEvento.precio_menor) || 0;

    let totalExtras = 0;
    [1, 2, 3].forEach(i => {
      const confirmado = nuevoEvento[`extra${i}_confirmado`];
      if (confirmado) {
        const valor = parseFloat(nuevoEvento[`extra${i}_valor`]) || 0;
        const tipo = nuevoEvento[`extra${i}_tipo`];
        totalExtras += tipo === 'por_persona' ? valor * adultos : valor;
      }
    });

    // Servicios adicionales
    let totalServicios = 0;
    if (nuevoEvento.tecnica) {
      totalServicios += parseFloat(nuevoEvento.tecnica_precio) || 0;
    }
    if (nuevoEvento.tecnica_superior) {
      totalServicios += parseFloat(nuevoEvento.tecnica_superior_precio) || 0;
    }
    if (nuevoEvento.ceremonia) {
      totalServicios += parseFloat(nuevoEvento.ceremonia_precio) || 0;
    }

    return (adultos * precioAdulto) + (menores * precioMenor) + totalExtras + totalServicios;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const total = calcularTotal();
    
    const { error } = await supabase
      .from('eventos')
      .insert([{
        fecha: nuevoEvento.fecha,
        cliente: nuevoEvento.cliente,
        telefono: nuevoEvento.telefono,
        turno: nuevoEvento.turno,
        hora_inicio: nuevoEvento.hora_inicio,
        hora_fin: nuevoEvento.hora_fin,
        vendedor: nuevoEvento.vendedor,
        tipo_evento: nuevoEvento.tipo_evento,
        menu: nuevoEvento.menu,
        salon: nuevoEvento.salon,
        tecnica: nuevoEvento.tecnica,
        tecnica_precio: parseFloat(nuevoEvento.tecnica_precio) || 0,
        tecnica_superior: nuevoEvento.tecnica_superior,
        tecnica_superior_precio: parseFloat(nuevoEvento.tecnica_superior_precio) || 0,
        ceremonia: nuevoEvento.ceremonia,
        ceremonia_precio: parseFloat(nuevoEvento.ceremonia_precio) || 0,
        dj: nuevoEvento.dj,
        otros: nuevoEvento.otros,
        adultos: parseInt(nuevoEvento.adultos) || 0,
        precio_adulto: parseFloat(nuevoEvento.precio_adulto) || 0,
        menores: parseInt(nuevoEvento.menores) || 0,
        precio_menor: parseFloat(nuevoEvento.precio_menor) || 0,
        celiacos: parseInt(nuevoEvento.celiacos) || 0,
        vegetarianos: parseInt(nuevoEvento.vegetarianos) || 0,
        veganos: parseInt(nuevoEvento.veganos) || 0,
        extra1_desc: nuevoEvento.extra1_desc,
        extra1_valor: parseFloat(nuevoEvento.extra1_valor) || 0,
        extra1_tipo: nuevoEvento.extra1_tipo,
        extra1_confirmado: nuevoEvento.extra1_confirmado || false,
        extra2_desc: nuevoEvento.extra2_desc,
        extra2_valor: parseFloat(nuevoEvento.extra2_valor) || 0,
        extra2_tipo: nuevoEvento.extra2_tipo,
        extra2_confirmado: nuevoEvento.extra2_confirmado || false,
        extra3_desc: nuevoEvento.extra3_desc,
        extra3_valor: parseFloat(nuevoEvento.extra3_valor) || 0,
        extra3_tipo: nuevoEvento.extra3_tipo,
        extra3_confirmado: nuevoEvento.extra3_confirmado || false,
        total_evento: total,
        confirmado: nuevoEvento.confirmado,
        menu_detalle: nuevoEvento.menu_detalle
      }]);

    if (error) {
      console.error('Error:', error);
      alert('Error al guardar el evento');
    } else {
      setShowModal(false);
      setNuevoEvento({
        fecha: '',
        cliente: '',
        telefono: '',
        turno: 'Noche',
        hora_inicio: '',
        hora_fin: '',
        vendedor: 'Francisco',
        tipo_evento: 'Cumple 50',
        menu: 'Tapas',
        salon: 'Tero',
        tecnica: false,
        tecnica_precio: '',
        tecnica_superior: false,
        tecnica_superior_precio: '',
        ceremonia: false,
        ceremonia_precio: '',
        dj: '',
        celiacos: '',
        vegetarianos: '',
        veganos: '',
        otros: '',
        adultos: '',
        precio_adulto: '',
        menores: '',
        precio_menor: '',
        extra1_desc: '',
        extra1_valor: '',
        extra1_tipo: 'total',
        extra1_confirmado: false,
        extra2_desc: '',
        extra2_valor: '',
        extra2_tipo: 'total',
        extra2_confirmado: false,
        extra3_desc: '',
        extra3_valor: '',
        extra3_tipo: 'total',
        extra3_confirmado: false,
        confirmado: false,
        menu_detalle: null
      });
      fetchEventos();
    }
    setSaving(false);
  };

  const handleEdit = (evento) => {
    setEventoEdit({
      id: evento.id,
      fecha: evento.fecha,
      cliente: evento.cliente,
      telefono: evento.telefono || '',
      turno: evento.turno,
      hora_inicio: evento.hora_inicio || '',
      hora_fin: evento.hora_fin || '',
      vendedor: evento.vendedor,
      tipo_evento: evento.tipo_evento,
      menu: evento.menu,
      salon: evento.salon || 'Tero',
      tecnica: evento.tecnica || false,
      tecnica_precio: evento.tecnica_precio > 0 ? evento.tecnica_precio.toString() : '',
      tecnica_superior: evento.tecnica_superior || false,
      tecnica_superior_precio: evento.tecnica_superior_precio > 0 ? evento.tecnica_superior_precio.toString() : '',
      ceremonia: evento.ceremonia || false,
      ceremonia_precio: evento.ceremonia_precio > 0 ? evento.ceremonia_precio.toString() : '',
      dj: evento.dj || '',
      celiacos: evento.celiacos?.toString() || '',
      vegetarianos: evento.vegetarianos?.toString() || '',
      veganos: evento.veganos?.toString() || '',
      otros: evento.otros || '',
      adultos: evento.adultos?.toString() || '',
      precio_adulto: evento.precio_adulto?.toString() || '',
      menores: evento.menores?.toString() || '',
      precio_menor: evento.precio_menor?.toString() || '',
      extra1_desc: evento.extra1_desc || '',
      extra1_valor: evento.extra1_valor?.toString() || '',
      extra1_tipo: evento.extra1_tipo || 'total',
      extra1_confirmado: evento.extra1_confirmado || false,
      extra2_desc: evento.extra2_desc || '',
      extra2_valor: evento.extra2_valor?.toString() || '',
      extra2_tipo: evento.extra2_tipo || 'total',
      extra2_confirmado: evento.extra2_confirmado || false,
      extra3_desc: evento.extra3_desc || '',
      extra3_valor: evento.extra3_valor?.toString() || '',
      extra3_tipo: evento.extra3_tipo || 'total',
      extra3_confirmado: evento.extra3_confirmado || false,
      confirmado: evento.confirmado || false,
      menu_detalle: evento.menu_detalle || null
    });
    setSelectedEvento(null);
    setEditMode(true);
  };

  const calcularTotalEdit = () => {
    if (!eventoEdit) return 0;
    const adultos = parseInt(eventoEdit.adultos) || 0;
    const precioAdulto = parseFloat(eventoEdit.precio_adulto) || 0;
    const menores = parseInt(eventoEdit.menores) || 0;
    const precioMenor = parseFloat(eventoEdit.precio_menor) || 0;

    let totalExtras = 0;
    [1, 2, 3].forEach(i => {
      const confirmado = eventoEdit[`extra${i}_confirmado`];
      if (confirmado) {
        const valor = parseFloat(eventoEdit[`extra${i}_valor`]) || 0;
        const tipo = eventoEdit[`extra${i}_tipo`];
        totalExtras += tipo === 'por_persona' ? valor * adultos : valor;
      }
    });

    // Servicios adicionales
    let totalServicios = 0;
    if (eventoEdit.tecnica) {
      totalServicios += parseFloat(eventoEdit.tecnica_precio) || 0;
    }
    if (eventoEdit.tecnica_superior) {
      totalServicios += parseFloat(eventoEdit.tecnica_superior_precio) || 0;
    }
    if (eventoEdit.ceremonia) {
      totalServicios += parseFloat(eventoEdit.ceremonia_precio) || 0;
    }

    return (adultos * precioAdulto) + (menores * precioMenor) + totalExtras + totalServicios;
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const total = calcularTotalEdit();
    
    const { error } = await supabase
      .from('eventos')
      .update({
        fecha: eventoEdit.fecha,
        cliente: eventoEdit.cliente,
        telefono: eventoEdit.telefono,
        turno: eventoEdit.turno,
        hora_inicio: eventoEdit.hora_inicio,
        hora_fin: eventoEdit.hora_fin,
        vendedor: eventoEdit.vendedor,
        tipo_evento: eventoEdit.tipo_evento,
        menu: eventoEdit.menu,
        salon: eventoEdit.salon,
        tecnica: eventoEdit.tecnica,
        tecnica_precio: parseFloat(eventoEdit.tecnica_precio) || 0,
        tecnica_superior: eventoEdit.tecnica_superior,
        tecnica_superior_precio: parseFloat(eventoEdit.tecnica_superior_precio) || 0,
        ceremonia: eventoEdit.ceremonia,
        ceremonia_precio: parseFloat(eventoEdit.ceremonia_precio) || 0,
        dj: eventoEdit.dj,
        otros: eventoEdit.otros,
        adultos: parseInt(eventoEdit.adultos) || 0,
        precio_adulto: parseFloat(eventoEdit.precio_adulto) || 0,
        menores: parseInt(eventoEdit.menores) || 0,
        precio_menor: parseFloat(eventoEdit.precio_menor) || 0,
        celiacos: parseInt(eventoEdit.celiacos) || 0,
        vegetarianos: parseInt(eventoEdit.vegetarianos) || 0,
        veganos: parseInt(eventoEdit.veganos) || 0,
        extra1_desc: eventoEdit.extra1_desc,
        extra1_valor: parseFloat(eventoEdit.extra1_valor) || 0,
        extra1_tipo: eventoEdit.extra1_tipo,
        extra1_confirmado: eventoEdit.extra1_confirmado || false,
        extra2_desc: eventoEdit.extra2_desc,
        extra2_valor: parseFloat(eventoEdit.extra2_valor) || 0,
        extra2_tipo: eventoEdit.extra2_tipo,
        extra2_confirmado: eventoEdit.extra2_confirmado || false,
        extra3_desc: eventoEdit.extra3_desc,
        extra3_valor: parseFloat(eventoEdit.extra3_valor) || 0,
        extra3_tipo: eventoEdit.extra3_tipo,
        extra3_confirmado: eventoEdit.extra3_confirmado || false,
        total_evento: total,
        confirmado: eventoEdit.confirmado,
        menu_detalle: eventoEdit.menu_detalle
      })
      .eq('id', eventoEdit.id);
    
    if (error) {
      console.error('Error:', error);
      alert('Error al actualizar el evento');
    } else {
      // Actualizar selectedEvento con los nuevos valores
      if (selectedEvento && selectedEvento.id === eventoEdit.id) {
        setSelectedEvento({
          ...selectedEvento,
          totalEvento: total,
          tecnica: eventoEdit.tecnica,
          tecnica_precio: parseFloat(eventoEdit.tecnica_precio) || 0,
          tecnica_superior: eventoEdit.tecnica_superior,
          tecnica_superior_precio: parseFloat(eventoEdit.tecnica_superior_precio) || 0,
          ceremonia: eventoEdit.ceremonia,
          ceremonia_precio: parseFloat(eventoEdit.ceremonia_precio) || 0,
          extra1_desc: eventoEdit.extra1_desc,
          extra1_valor: parseFloat(eventoEdit.extra1_valor) || 0,
          extra1_tipo: eventoEdit.extra1_tipo,
          extra1_confirmado: eventoEdit.extra1_confirmado || false,
          extra2_desc: eventoEdit.extra2_desc,
          extra2_valor: parseFloat(eventoEdit.extra2_valor) || 0,
          extra2_tipo: eventoEdit.extra2_tipo,
          extra2_confirmado: eventoEdit.extra2_confirmado || false,
          extra3_desc: eventoEdit.extra3_desc,
          extra3_valor: parseFloat(eventoEdit.extra3_valor) || 0,
          extra3_tipo: eventoEdit.extra3_tipo,
          extra3_confirmado: eventoEdit.extra3_confirmado || false,
          adultos: parseInt(eventoEdit.adultos) || 0,
          precio_adulto: parseFloat(eventoEdit.precio_adulto) || 0,
          menores: parseInt(eventoEdit.menores) || 0,
          precio_menor: parseFloat(eventoEdit.precio_menor) || 0
        });
      }
      setEditMode(false);
      setEventoEdit(null);
      fetchEventos();
    }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    // Verificar si el evento tiene pagos registrados
    const pagosDelEvento = pagos.filter(p => p.evento_id === id);
    if (pagosDelEvento.length > 0) {
      alert(`No se puede eliminar este evento porque tiene ${pagosDelEvento.length} pago(s) registrado(s).\n\nPrimero debe eliminar los pagos en la sección de Cobranzas.`);
      return;
    }

    if (!confirm('¿Estás seguro de eliminar este evento?')) return;

    const { error } = await supabase
      .from('eventos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error:', error);
      alert('Error al eliminar el evento');
    } else {
      setSelectedEvento(null);
      fetchEventos();
    }
  };

  const eventosData = useMemo(() => {
    return eventos.map(e => ({
      ...e,
      mes: new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'long' }),
      year: new Date(e.fecha + 'T12:00:00').getFullYear(),
      tipoEvento: e.tipo_evento,
      totalEvento: Number(e.total_evento)
    }));
  }, [eventos]);

  // Años disponibles
  const yearsDisponibles = useMemo(() => {
    const years = [...new Set(eventosData.map(e => e.year))].sort((a, b) => b - a);
    return years.length > 0 ? years : [new Date().getFullYear()];
  }, [eventosData]);

  // Eventos filtrados por año
  const eventosDelAño = useMemo(() => {
    return eventosData.filter(e => e.year === filterYear);
  }, [eventosData, filterYear]);

  const vendedores = useMemo(() => ['todos', ...new Set(eventosDelAño.map(e => e.vendedor))], [eventosDelAño]);
  const meses = useMemo(() => ['todos', ...new Set(eventosDelAño.map(e => e.mes))], [eventosDelAño]);

  const filteredEventos = useMemo(() => {
    return eventosDelAño
      .filter(e => {
        // Excluir eventos anulados
        if (e.anulado) return false;
        const matchSearch = e.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           e.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase());
        const matchVendedor = filterVendedor === 'todos' || e.vendedor === filterVendedor;
        const matchMes = filterMes === 'todos' || e.mes === filterMes;
        const matchEstado = filterEstado === 'todos' ||
                           (filterEstado === 'confirmados' && e.confirmado) ||
                           (filterEstado === 'aconfirmar' && !e.confirmado);
        return matchSearch && matchVendedor && matchMes && matchEstado;
      })
      .sort((a, b) => {
        if (sortConfig.key === 'fecha') {
          return sortConfig.direction === 'asc'
            ? new Date(a.fecha) - new Date(b.fecha)
            : new Date(b.fecha) - new Date(a.fecha);
        }
        if (sortConfig.key === 'totalEvento') {
          return sortConfig.direction === 'asc' ? a.totalEvento - b.totalEvento : b.totalEvento - a.totalEvento;
        }
        return 0;
      });
  }, [eventosDelAño, searchTerm, filterVendedor, filterMes, filterEstado, sortConfig]);

  const stats = useMemo(() => {
    // Solo contar eventos confirmados (no anulados)
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const eventosRealizados = eventosActivos.filter(e => new Date(e.fecha) < hoy || e.estado === 'realizado');
    const eventosPendientes = eventosActivos.filter(e => new Date(e.fecha) >= hoy && e.estado !== 'realizado');
    const totalEventos = eventosActivos.length;
    const totalFacturado = eventosActivos.reduce((sum, e) => sum + e.totalEvento, 0);
    const facturadoRealizado = eventosRealizados.reduce((sum, e) => sum + e.totalEvento, 0);
    const facturadoPendiente = eventosPendientes.reduce((sum, e) => sum + e.totalEvento, 0);
    const totalAdultos = eventosActivos.reduce((sum, e) => sum + e.adultos, 0);
    return { totalEventos, totalFacturado, facturadoRealizado, facturadoPendiente, totalAdultos };
  }, [eventosDelAño]);

  const eventosPorMes = useMemo(() => {
    const orden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.mes] = (acc[e.mes] || 0) + e.totalEvento;
      return acc;
    }, {});
    return orden.filter(m => grouped[m]).map(mes => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), total: grouped[mes] }));
  }, [eventosDelAño]);

  const eventosPorVendedor = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.vendedor] = (acc[e.vendedor] || 0) + e.totalEvento;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [eventosDelAño]);

  const eventosPorTipo = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.tipoEvento] = (acc[e.tipoEvento] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const eventosPorMenu = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      const menu = e.menu || 'Sin menú';
      acc[menu] = (acc[menu] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const eventosPorSalon = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      const salon = e.salon || 'Tero';
      acc[salon] = (acc[salon] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const comensalesPorMes = useMemo(() => {
    const orden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      const adultos = e.adultos || 0;
      const menores = e.menores || 0;
      if (!acc[e.mes]) {
        acc[e.mes] = { adultos: 0, menores: 0 };
      }
      acc[e.mes].adultos += adultos;
      acc[e.mes].menores += menores;
      return acc;
    }, {});
    return orden.filter(m => grouped[m]).map(mes => ({
      mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3),
      adultos: grouped[mes].adultos,
      menores: grouped[mes].menores,
      total: grouped[mes].adultos + grouped[mes].menores
    }));
  }, [eventosDelAño]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const getEventosForDate = (day) => {
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventosData.filter(e => e.fecha === dateStr && !e.anulado);
  };

  const eventosDelDiaSeleccionado = useMemo(() => {
    if (!selectedDate) return [];
    return eventosData.filter(e => e.fecha === selectedDate && !e.anulado);
  }, [selectedDate, eventosData]);

  // Próximos eventos (confirmados, desde hoy en adelante, del año seleccionado, no anulados)
  const proximosEventos = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventosDelAño
      .filter(e => {
        const fechaEvento = new Date(e.fecha + 'T12:00:00');
        const matchFecha = fechaEvento >= hoy && e.confirmado === true && !e.anulado;
        const matchMes = filterMesProximos === 'todos' || e.mes === filterMesProximos;
        return matchFecha && matchMes;
      })
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosDelAño, filterMesProximos]);

  // Eventos a confirmar (no confirmados, desde hoy en adelante, del año seleccionado)
  const eventosAConfirmar = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventosDelAño
      .filter(e => {
        const fechaEvento = new Date(e.fecha + 'T12:00:00');
        const matchFecha = fechaEvento >= hoy && !e.confirmado && !e.anulado;
        const matchMes = filterMesAConfirmar === 'todos' || e.mes === filterMesAConfirmar;
        return matchFecha && matchMes;
      })
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosDelAño, filterMesAConfirmar]);

  // Eventos realizados (anteriores a hoy, del año seleccionado, no anulados)
  const eventosRealizados = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventosDelAño
      .filter(e => new Date(e.fecha + 'T12:00:00') < hoy && !e.anulado)
      .sort((a, b) => new Date(b.fecha) - new Date(a.fecha)); // Más recientes primero
  }, [eventosDelAño]);

  // Cobranzas: eventos con pagos y saldos
  // IPC se suma al saldo (cargo adicional), pagos y señas restan del saldo
  // Solo eventos confirmados (los pendientes no van a cobranzas)
  const cobranzasData = useMemo(() => {
    return eventosDelAño.filter(evento => evento.confirmado && !evento.anulado).map(evento => {
      const pagosEvento = pagos.filter(p => p.evento_id === evento.id);
      // Pagos y señas (lo que se pagó del evento, sin IPC)
      const pagosYSenas = pagosEvento
        .filter(p => p.concepto === 'pago' || p.concepto === 'seña')
        .reduce((sum, p) => sum + Number(p.monto), 0);
      // Ajustes IPC (pagos extra)
      const ajustesIPC = pagosEvento
        .filter(p => p.concepto === 'ajuste_ipc')
        .reduce((sum, p) => sum + Number(p.monto), 0);
      // Saldo = lo que falta pagar del evento (sin considerar IPC)
      const saldo = evento.totalEvento - pagosYSenas;
      // Total Pagado = todo lo cobrado (pagos + señas + IPC)
      const totalPagado = pagosYSenas + ajustesIPC;

      return {
        ...evento,
        pagos: pagosEvento,
        pagosYSenas,
        totalPagado,
        ajustesIPC,
        saldo
      };
    }).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosDelAño, pagos]);

  // Filtrado de cobranzas
  const cobranzasDataFiltrado = useMemo(() => {
    return cobranzasData.filter(evento => {
      // Filtro por mes
      if (filterCobranzasMes !== 'todos') {
        const mesEvento = new Date(evento.fecha + 'T12:00:00').getMonth();
        if (mesEvento !== parseInt(filterCobranzasMes)) return false;
      }
      // Filtro por estado
      if (filterCobranzasEstado === 'pendientes') {
        // No pagaron nada
        if (evento.pagosYSenas > 0) return false;
      } else if (filterCobranzasEstado === 'saldo') {
        // Pagaron algo pero deben
        if (evento.pagosYSenas === 0 || evento.saldo <= 0) return false;
      } else if (filterCobranzasEstado === 'cancelados') {
        // Pagaron todo
        if (evento.saldo > 0) return false;
      }
      return true;
    });
  }, [cobranzasData, filterCobranzasMes, filterCobranzasEstado]);

  const statsCobranzas = useMemo(() => {
    const totalFacturado = cobranzasData.reduce((sum, e) => sum + e.totalEvento, 0);
    const totalCobrado = cobranzasData.reduce((sum, e) => sum + e.totalPagado, 0);
    const totalPendiente = cobranzasData.reduce((sum, e) => sum + Math.max(0, e.saldo), 0);
    const eventosConSaldo = cobranzasData.filter(e => e.saldo > 0).length;
    const totalIPC = cobranzasData.reduce((sum, e) => sum + e.ajustesIPC, 0);
    return { totalFacturado, totalCobrado, totalPendiente, eventosConSaldo, totalIPC };
  }, [cobranzasData]);

  // Calcular días restantes
  const getDiasRestantes = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaEvento = new Date(fecha + 'T12:00:00');
    const diff = Math.ceil((fechaEvento - hoy) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Mañana';
    return `En ${diff} días`;
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
    }));
  };

  const SortIcon = ({ columnKey }) => {
    if (sortConfig.key !== columnKey) return <ChevronDown className="w-4 h-4 opacity-30" />;
    return sortConfig.direction === 'desc' ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />;
  };

  const { daysInMonth, startingDay } = getDaysInMonth(calendarDate);

  // Auth loading
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  // Login screen
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center p-4">
        <div className="glass rounded-2xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 glow">
              <Calendar className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Eventos Tero
            </h1>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {loginError && (
              <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm text-center">
                {loginError}
              </div>
            )}

            <div>
              <label className="block text-sm text-slate-400 mb-1">Usuario / Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  required
                  placeholder="tu@email.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({...loginForm, email: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
              {loginLoading ? 'Ingresando...' : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Data loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-purple-500 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Cargando eventos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-white">
      {/* Modal Nuevo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-5 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">Nuevo Evento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Fecha y Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs text-slate-400 mb-1">Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Buscar o escribir nombre"
                    value={nuevoEvento.cliente}
                    onChange={(e) => {
                      setNuevoEvento({...nuevoEvento, cliente: e.target.value});
                      setShowClienteSugerencias(e.target.value.length >= 2);
                    }}
                    onFocus={() => nuevoEvento.cliente.length >= 2 && setShowClienteSugerencias(true)}
                    onBlur={() => setTimeout(() => setShowClienteSugerencias(false), 200)}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                  {showClienteSugerencias && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {clientes
                        .filter(c => c.nombre?.toLowerCase().includes(nuevoEvento.cliente.toLowerCase()))
                        .slice(0, 8)
                        .map(c => (
                          <div
                            key={c.id}
                            className="px-3 py-2 hover:bg-purple-500/20 cursor-pointer border-b border-white/5 last:border-0"
                            onMouseDown={() => {
                              setNuevoEvento({
                                ...nuevoEvento,
                                cliente: c.nombre,
                                telefono: c.telefono || nuevoEvento.telefono
                              });
                              setShowClienteSugerencias(false);
                              setTelefonoDuplicado(null);
                            }}
                          >
                            <p className="text-white text-sm">{c.nombre}</p>
                            {c.telefono && <p className="text-slate-400 text-xs">{c.telefono}</p>}
                          </div>
                        ))}
                      {clientes.filter(c => c.nombre?.toLowerCase().includes(nuevoEvento.cliente.toLowerCase())).length === 0 && (
                        <p className="px-3 py-2 text-slate-400 text-sm">Cliente nuevo - se agregará a la agenda</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Teléfono y Vendedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={nuevoEvento.telefono}
                    onChange={(e) => {
                      const tel = e.target.value;
                      setNuevoEvento({...nuevoEvento, telefono: tel});
                      // Verificar si el teléfono ya existe en agenda
                      if (tel.length >= 8) {
                        const existente = clientes.find(c =>
                          c.telefono && c.telefono.replace(/\D/g, '').includes(tel.replace(/\D/g, ''))
                        );
                        setTelefonoDuplicado(existente || null);
                      } else {
                        setTelefonoDuplicado(null);
                      }
                    }}
                    className={`w-full px-3 py-2 rounded-lg border bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none ${telefonoDuplicado ? 'border-yellow-500/50' : 'border-white/10 focus:border-purple-500/50'}`}
                  />
                  {telefonoDuplicado && (
                    <p className="text-yellow-400 text-xs mt-1">
                      Este teléfono ya existe: {telefonoDuplicado.nombre}
                    </p>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Vendedor</label>
                  <select
                    value={nuevoEvento.vendedor}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, vendedor: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              {/* Turno y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Turno</label>
                  <select
                    value={nuevoEvento.turno}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, turno: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hora Inicio</label>
                  <div className="flex gap-1">
                    <select
                      value={nuevoEvento.hora_inicio?.split(':')[0] || ''}
                      onChange={(e) => {
                        const mins = nuevoEvento.hora_inicio?.split(':')[1] || '00';
                        setNuevoEvento({...nuevoEvento, hora_inicio: e.target.value ? `${e.target.value}:${mins}` : ''});
                      }}
                      className="flex-1 px-2 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">--</option>
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-white self-center text-sm">:</span>
                    <select
                      value={nuevoEvento.hora_inicio?.split(':')[1] || ''}
                      onChange={(e) => {
                        const hrs = nuevoEvento.hora_inicio?.split(':')[0] || '12';
                        setNuevoEvento({...nuevoEvento, hora_inicio: `${hrs}:${e.target.value}`});
                      }}
                      className="flex-1 px-2 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Hora Fin</label>
                  <div className="flex gap-1">
                    <select
                      value={nuevoEvento.hora_fin?.split(':')[0] || ''}
                      onChange={(e) => {
                        const mins = nuevoEvento.hora_fin?.split(':')[1] || '00';
                        setNuevoEvento({...nuevoEvento, hora_fin: e.target.value ? `${e.target.value}:${mins}` : ''});
                      }}
                      className="flex-1 px-2 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">--</option>
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                    <span className="text-white self-center text-sm">:</span>
                    <select
                      value={nuevoEvento.hora_fin?.split(':')[1] || ''}
                      onChange={(e) => {
                        const hrs = nuevoEvento.hora_fin?.split(':')[0] || '12';
                        setNuevoEvento({...nuevoEvento, hora_fin: `${hrs}:${e.target.value}`});
                      }}
                      className="flex-1 px-2 py-2 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="00">00</option>
                      <option value="15">15</option>
                      <option value="30">30</option>
                      <option value="45">45</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tipo de Evento y Salón */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Tipo de Evento</label>
                  <select
                    value={nuevoEvento.tipo_evento}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo_evento: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Salón</label>
                  <select
                    value={nuevoEvento.salon}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, salon: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {SALONES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Menú Base y Menú Detallado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Menú Base</label>
                  <select
                    value={nuevoEvento.menu}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, menu: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Menú Detallado</label>
                  <select
                    value={nuevoEvento.menu_detalle?.id || ''}
                    onChange={(e) => {
                      const selectedMenu = menus.find(m => m.id === e.target.value);
                      setNuevoEvento({...nuevoEvento, menu_detalle: selectedMenu || null});
                    }}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Sin menú detallado</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Técnica, Técnica Superior, DJ */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="tecnica"
                      checked={nuevoEvento.tecnica}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica: e.target.checked, tecnica_precio: e.target.checked ? nuevoEvento.tecnica_precio : ''})}
                      className="w-4 h-4 rounded accent-purple-500"
                    />
                    <label htmlFor="tecnica" className="flex items-center gap-1 text-xs cursor-pointer">
                      <Mic className="w-3 h-3 text-purple-400" />
                      Técnica
                    </label>
                  </div>
                  {nuevoEvento.tecnica && (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Costo: $560.000"
                      value={formatNumberInput(nuevoEvento.tecnica_precio)}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica_precio: parseNumberInput(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                    />
                  )}
                </div>
                <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="tecnica_superior"
                      checked={nuevoEvento.tecnica_superior}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica_superior: e.target.checked, tecnica_superior_precio: e.target.checked ? nuevoEvento.tecnica_superior_precio : ''})}
                      className="w-4 h-4 rounded accent-purple-500"
                    />
                    <label htmlFor="tecnica_superior" className="flex items-center gap-1 text-xs cursor-pointer">
                      <Mic className="w-3 h-3 text-amber-400" />
                      Técnica Superior
                    </label>
                  </div>
                  {nuevoEvento.tecnica_superior && (
                    <input
                      type="text"
                      inputMode="numeric"
                      placeholder="Costo: $300.000"
                      value={formatNumberInput(nuevoEvento.tecnica_superior_precio)}
                      onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica_superior_precio: parseNumberInput(e.target.value)})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-400 focus:outline-none focus:border-purple-500/50"
                    />
                  )}
                </div>
                <div className="p-3 rounded-lg border border-white/10 bg-white/5">
                  <label className="block text-xs text-slate-400 mb-2">DJ</label>
                  <input
                    type="text"
                    placeholder="Nombre del DJ"
                    value={nuevoEvento.dj}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, dj: e.target.value})}
                    className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Adultos y Menores con Total */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Adultos *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Cant."
                    value={nuevoEvento.adultos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, adultos: e.target.value})}
                    className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">$ Adulto</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Precio"
                    value={formatNumberInput(nuevoEvento.precio_adulto)}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_adulto: parseNumberInput(e.target.value)})}
                    className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Menores</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cant."
                    value={nuevoEvento.menores}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, menores: e.target.value})}
                    className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">$ Menor</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Precio"
                    value={formatNumberInput(nuevoEvento.precio_menor)}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_menor: parseNumberInput(e.target.value)})}
                    className="w-full px-2 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div className="flex flex-col justify-end">
                  <label className="block text-xs text-slate-400 mb-1">Subtotal</label>
                  <div className="px-2 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-sm text-center">
                    {displayPrice((parseInt(nuevoEvento.adultos) || 0) * (parseFloat(nuevoEvento.precio_adulto) || 0) + (parseInt(nuevoEvento.menores) || 0) * (parseFloat(nuevoEvento.precio_menor) || 0))}
                  </div>
                </div>
              </div>

              {/* Dietas especiales (informativo) */}
              <div className="grid grid-cols-3 gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div>
                  <label className="block text-xs text-amber-400/80 mb-1">Celíacos</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={nuevoEvento.celiacos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, celiacos: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-500/20 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-amber-400/80 mb-1">Vegetarianos</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={nuevoEvento.vegetarianos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, vegetarianos: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-500/20 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-xs text-amber-400/80 mb-1">Veganos</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={nuevoEvento.veganos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, veganos: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-amber-500/20 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-2">
                <label className="block text-xs text-slate-400">Extras</label>
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-2 rounded-lg bg-white/5 border border-white/10 items-center">
                    <div className="md:col-span-1 flex justify-center">
                      <input
                        type="checkbox"
                        checked={nuevoEvento[`extra${i}_confirmado`] || false}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_confirmado`]: e.target.checked})}
                        className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500 focus:ring-emerald-500/50"
                        title="Confirmar extra (suma al total)"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <input
                        type="text"
                        placeholder={`Extra ${i}`}
                        value={nuevoEvento[`extra${i}_desc`]}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_desc`]: e.target.value})}
                        className="w-full px-2 py-1.5 rounded border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-xs"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Valor $"
                        value={formatNumberInput(nuevoEvento[`extra${i}_valor`])}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_valor`]: parseNumberInput(e.target.value)})}
                        className="w-full px-2 py-1.5 rounded border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-xs"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <select
                        value={nuevoEvento[`extra${i}_tipo`]}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_tipo`]: e.target.value})}
                        className="w-full px-2 py-1.5 rounded border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 text-xs"
                      >
                        <option value="total">Total</option>
                        <option value="por_persona">x Persona</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Evento */}
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <p className="text-xs text-slate-400">Total Evento</p>
                <p className="text-xl font-bold text-emerald-400">{displayPrice(calcularTotal())}</p>
              </div>

              {/* Otros */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Otros / Aclaraciones</label>
                <textarea
                  placeholder="Notas adicionales..."
                  value={nuevoEvento.otros}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, otros: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {saving ? 'Guardando...' : 'Agregar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle Evento */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2" onClick={(e) => e.target === e.currentTarget && setSelectedEvento(null)}>
          <div className="glass rounded-2xl p-4 w-full max-w-md">
            {/* Header con cliente y botón cerrar */}
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-bold truncate">{selectedEvento.cliente}</h2>
              <button onClick={() => setSelectedEvento(null)} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado + Botones PDF en una fila */}
            <div className="flex items-center gap-2 mb-2">
              <div className={`flex-1 px-2 py-1.5 rounded-lg flex items-center justify-between ${selectedEvento.confirmado ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
                <div className="flex items-center gap-1">
                  {selectedEvento.confirmado ? (
                    <><CheckCircle className="w-3 h-3 text-emerald-400" /><span className="text-emerald-400 text-xs font-medium">Confirmado</span></>
                  ) : (
                    <><AlertCircle className="w-3 h-3 text-amber-400" /><span className="text-amber-400 text-xs font-medium">Pendiente</span></>
                  )}
                </div>
                {canEdit && (
                  <button
                    onClick={() => handleConfirmarEvento(selectedEvento, !selectedEvento.confirmado)}
                    className={`px-2 py-0.5 rounded text-xs font-medium ${selectedEvento.confirmado ? 'bg-amber-500/20 text-amber-400' : 'bg-emerald-500/20 text-emerald-400'}`}
                  >
                    {selectedEvento.confirmado ? 'Desconfirmar' : 'Confirmar'}
                  </button>
                )}
              </div>
              {userVerPrecios && (
                <>
                  <button onClick={() => generarCotizacion(selectedEvento)} className="px-2 py-1.5 rounded-lg bg-blue-500/20 text-blue-400 text-xs hover:bg-blue-500/30 border border-blue-500/30">
                    Cotización
                  </button>
                  <button onClick={() => generarPDF(selectedEvento)} className="px-2 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs hover:bg-emerald-500/30 border border-emerald-500/30">
                    Resumen
                  </button>
                </>
              )}
            </div>

            {/* Info compacta */}
            <div className="space-y-2">
              {/* Fila 1: Fecha, Turno, Salón, Teléfono */}
              <div className="grid grid-cols-4 gap-1.5">
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Fecha</p>
                  <p className="text-xs font-medium">{formatDate(selectedEvento.fecha)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Turno</p>
                  <p className="text-xs font-medium">{selectedEvento.turno}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Salón</p>
                  <p className="text-xs font-medium">{selectedEvento.salon || 'Tero'}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Teléfono</p>
                  <p className="text-xs font-medium truncate">{selectedEvento.telefono || '-'}</p>
                </div>
              </div>

              {/* Fila 2: Tipo, Menú + Tags técnica */}
              <div className="flex gap-1.5 items-stretch">
                <div className="bg-white/5 rounded-lg p-1.5 flex-1">
                  <p className="text-[10px] text-slate-400">Tipo</p>
                  <p className="text-xs font-medium">{selectedEvento.tipoEvento}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5 flex-1">
                  <p className="text-[10px] text-slate-400">Menú</p>
                  <p className="text-xs font-medium">{selectedEvento.menu}</p>
                </div>
                {(selectedEvento.tecnica || selectedEvento.tecnica_superior || selectedEvento.dj) && (
                  <div className="flex gap-1 items-center">
                    {selectedEvento.tecnica && <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/20 text-purple-300">Téc</span>}
                    {selectedEvento.tecnica_superior && <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300">Sup</span>}
                    {selectedEvento.dj && <span className="px-1.5 py-0.5 rounded text-[10px] bg-pink-500/20 text-pink-300">DJ</span>}
                  </div>
                )}
              </div>

              {/* Fila 3: Adultos, Menores, Total */}
              <div className="grid grid-cols-3 gap-1.5">
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Adultos</p>
                  <p className="text-xs font-medium">{selectedEvento.adultos} × {formatCurrency(selectedEvento.precio_adulto || 0)}</p>
                </div>
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Menores</p>
                  <p className="text-xs font-medium">{selectedEvento.menores || 0} × {formatCurrency(selectedEvento.precio_menor || 0)}</p>
                </div>
                <div className="bg-emerald-500/10 rounded-lg p-1.5 border border-emerald-500/30">
                  <p className="text-[10px] text-slate-400">Total</p>
                  <p className="text-sm font-bold text-emerald-400">{displayPrice(selectedEvento.totalEvento)}</p>
                </div>
              </div>

              {/* Notas (solo si hay) */}
              {selectedEvento.otros && (
                <div className="bg-white/5 rounded-lg p-1.5">
                  <p className="text-[10px] text-slate-400">Notas</p>
                  <p className="text-xs line-clamp-2">{selectedEvento.otros}</p>
                </div>
              )}

              {/* Botones Editar y Eliminar */}
              {(canEdit || canDelete) && (
                <div className="flex gap-2 pt-1">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(selectedEvento)}
                      className="flex-1 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-1"
                    >
                      <Edit3 className="w-3 h-3" />
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleAnularEvento(selectedEvento)}
                      className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 text-sm font-semibold hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Evento */}
      {editMode && eventoEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2">
          <div className="glass rounded-2xl p-3 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold">Editar Evento</h2>
              <button onClick={() => { setEditMode(false); setEventoEdit(null); }} className="p-1 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-1.5">
              {/* Fecha, Cliente y Salón */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={eventoEdit.fecha}
                    onChange={(e) => setEventoEdit({...eventoEdit, fecha: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div className="relative">
                  <label className="block text-xs text-slate-400 mb-0.5">Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Buscar o escribir nombre"
                    value={eventoEdit.cliente}
                    onChange={(e) => {
                      setEventoEdit({...eventoEdit, cliente: e.target.value});
                      setShowClienteSugerenciasEdit(e.target.value.length >= 2);
                    }}
                    onFocus={() => eventoEdit.cliente?.length >= 2 && setShowClienteSugerenciasEdit(true)}
                    onBlur={() => setTimeout(() => setShowClienteSugerenciasEdit(false), 200)}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  />
                  {showClienteSugerenciasEdit && (
                    <div className="absolute z-50 w-full mt-1 bg-slate-800 border border-white/20 rounded-lg shadow-xl max-h-48 overflow-y-auto">
                      {clientes
                        .filter(c => c.nombre?.toLowerCase().includes(eventoEdit.cliente?.toLowerCase() || ''))
                        .slice(0, 8)
                        .map(c => (
                          <div
                            key={c.id}
                            className="px-3 py-2 hover:bg-purple-500/20 cursor-pointer border-b border-white/5 last:border-0"
                            onMouseDown={() => {
                              setEventoEdit({
                                ...eventoEdit,
                                cliente: c.nombre,
                                telefono: c.telefono || eventoEdit.telefono
                              });
                              setShowClienteSugerenciasEdit(false);
                            }}
                          >
                            <p className="text-white text-sm">{c.nombre}</p>
                            {c.telefono && <p className="text-slate-400 text-xs">{c.telefono}</p>}
                          </div>
                        ))}
                      {clientes.filter(c => c.nombre?.toLowerCase().includes(eventoEdit.cliente?.toLowerCase() || '')).length === 0 && (
                        <p className="px-3 py-2 text-slate-400 text-sm">Cliente nuevo - se agregará a la agenda</p>
                      )}
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Salón</label>
                  <select
                    value={eventoEdit.salon}
                    onChange={(e) => setEventoEdit({...eventoEdit, salon: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {SALONES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Teléfono, Vendedor, Turno, Horarios */}
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Teléfono</label>
                  <input type="tel" value={eventoEdit.telefono} onChange={(e) => setEventoEdit({...eventoEdit, telefono: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Vendedor</label>
                  <select value={eventoEdit.vendedor} onChange={(e) => setEventoEdit({...eventoEdit, vendedor: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none">
                    {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Turno</label>
                  <select value={eventoEdit.turno} onChange={(e) => setEventoEdit({...eventoEdit, turno: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none">
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Hora Inicio</label>
                  <div className="flex gap-1">
                    <select value={eventoEdit.hora_inicio?.split(':')[0] || ''} onChange={(e) => { const mins = eventoEdit.hora_inicio?.split(':')[1] || '00'; setEventoEdit({...eventoEdit, hora_inicio: e.target.value ? `${e.target.value}:${mins}` : ''}); }} className="flex-1 px-1 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none">
                      <option value="">--</option>
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (<option key={h} value={h}>{h}</option>))}
                    </select>
                    <span className="text-white self-center text-xs">:</span>
                    <select value={eventoEdit.hora_inicio?.split(':')[1] || ''} onChange={(e) => { const hrs = eventoEdit.hora_inicio?.split(':')[0] || '12'; setEventoEdit({...eventoEdit, hora_inicio: `${hrs}:${e.target.value}`}); }} className="flex-1 px-1 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none">
                      <option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Hora Fin</label>
                  <div className="flex gap-1">
                    <select value={eventoEdit.hora_fin?.split(':')[0] || ''} onChange={(e) => { const mins = eventoEdit.hora_fin?.split(':')[1] || '00'; setEventoEdit({...eventoEdit, hora_fin: e.target.value ? `${e.target.value}:${mins}` : ''}); }} className="flex-1 px-1 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none">
                      <option value="">--</option>
                      {Array.from({length: 24}, (_, i) => i.toString().padStart(2, '0')).map(h => (<option key={h} value={h}>{h}</option>))}
                    </select>
                    <span className="text-white self-center text-xs">:</span>
                    <select value={eventoEdit.hora_fin?.split(':')[1] || ''} onChange={(e) => { const hrs = eventoEdit.hora_fin?.split(':')[0] || '12'; setEventoEdit({...eventoEdit, hora_fin: `${hrs}:${e.target.value}`}); }} className="flex-1 px-1 py-1.5 rounded-lg border border-white/20 bg-white/10 text-white text-sm focus:outline-none">
                      <option value="00">00</option><option value="15">15</option><option value="30">30</option><option value="45">45</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Tipo Evento, Menú Base, Menú Detallado */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Tipo Evento</label>
                  <select
                    value={eventoEdit.tipo_evento}
                    onChange={(e) => setEventoEdit({...eventoEdit, tipo_evento: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Menú Base</label>
                  <select
                    value={eventoEdit.menu}
                    onChange={(e) => setEventoEdit({...eventoEdit, menu: e.target.value})}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Menú Detallado</label>
                  <select
                    value={eventoEdit.menu_detalle?.id || ''}
                    onChange={(e) => {
                      const selectedMenu = menus.find(m => m.id === e.target.value);
                      setEventoEdit({...eventoEdit, menu_detalle: selectedMenu || null});
                    }}
                    className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Sin menú detallado</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Técnica, Técnica Superior, DJ */}
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <input type="checkbox" id="tecnica_edit" checked={eventoEdit.tecnica} onChange={(e) => setEventoEdit({...eventoEdit, tecnica: e.target.checked, tecnica_precio: e.target.checked ? eventoEdit.tecnica_precio : ''})} className="w-3 h-3 rounded accent-purple-500" />
                    <label htmlFor="tecnica_edit" className="text-[10px] cursor-pointer"><Mic className="w-3 h-3 text-purple-400 inline" /> Técnica</label>
                  </div>
                  {eventoEdit.tecnica && (
                    <input type="text" inputMode="numeric" placeholder="$560.000" value={formatNumberInput(eventoEdit.tecnica_precio)} onChange={(e) => setEventoEdit({...eventoEdit, tecnica_precio: parseNumberInput(e.target.value)})} className="w-full px-2 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:outline-none" />
                  )}
                </div>
                <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                  <div className="flex items-center gap-1 mb-1">
                    <input type="checkbox" id="tecnica_superior_edit" checked={eventoEdit.tecnica_superior} onChange={(e) => setEventoEdit({...eventoEdit, tecnica_superior: e.target.checked, tecnica_superior_precio: e.target.checked ? eventoEdit.tecnica_superior_precio : ''})} className="w-3 h-3 rounded accent-purple-500" />
                    <label htmlFor="tecnica_superior_edit" className="text-[10px] cursor-pointer"><Mic className="w-3 h-3 text-amber-400 inline" /> Téc.Sup</label>
                  </div>
                  {eventoEdit.tecnica_superior && (
                    <input type="text" inputMode="numeric" placeholder="$300.000" value={formatNumberInput(eventoEdit.tecnica_superior_precio)} onChange={(e) => setEventoEdit({...eventoEdit, tecnica_superior_precio: parseNumberInput(e.target.value)})} className="w-full px-2 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:outline-none" />
                  )}
                </div>
                <div className="p-2 rounded-lg border border-white/10 bg-white/5">
                  <label className="block text-[10px] text-slate-400 mb-1">DJ</label>
                  <input type="text" placeholder="Nombre DJ" value={eventoEdit.dj} onChange={(e) => setEventoEdit({...eventoEdit, dj: e.target.value})} className="w-full px-2 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:outline-none" />
                </div>
              </div>

              {/* Adultos, Menores, Subtotal */}
              <div className="grid grid-cols-5 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Adultos*</label>
                  <input type="number" required min="0" value={eventoEdit.adultos} onChange={(e) => setEventoEdit({...eventoEdit, adultos: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">$ Adulto</label>
                  <input type="text" inputMode="numeric" value={formatNumberInput(eventoEdit.precio_adulto)} onChange={(e) => setEventoEdit({...eventoEdit, precio_adulto: parseNumberInput(e.target.value)})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Menores</label>
                  <input type="number" min="0" value={eventoEdit.menores} onChange={(e) => setEventoEdit({...eventoEdit, menores: e.target.value})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">$ Menor</label>
                  <input type="text" inputMode="numeric" value={formatNumberInput(eventoEdit.precio_menor)} onChange={(e) => setEventoEdit({...eventoEdit, precio_menor: parseNumberInput(e.target.value)})} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-0.5">Subtotal</label>
                  <div className="px-2 py-1.5 rounded-lg bg-blue-500/20 border border-blue-500/30 text-blue-400 font-bold text-sm text-center">
                    {displayPrice((parseInt(eventoEdit.adultos) || 0) * (parseFloat(eventoEdit.precio_adulto) || 0) + (parseInt(eventoEdit.menores) || 0) * (parseFloat(eventoEdit.precio_menor) || 0))}
                  </div>
                </div>
              </div>

              {/* Dietas especiales */}
              <div className="grid grid-cols-3 gap-2 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <div>
                  <label className="block text-[10px] text-amber-400/80 mb-0.5">Celíacos</label>
                  <input type="number" min="0" placeholder="0" value={eventoEdit.celiacos} onChange={(e) => setEventoEdit({...eventoEdit, celiacos: e.target.value})} className="w-full px-2 py-1 rounded border border-amber-500/20 bg-white/5 text-white text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-amber-400/80 mb-0.5">Vegetarianos</label>
                  <input type="number" min="0" placeholder="0" value={eventoEdit.vegetarianos} onChange={(e) => setEventoEdit({...eventoEdit, vegetarianos: e.target.value})} className="w-full px-2 py-1 rounded border border-amber-500/20 bg-white/5 text-white text-xs focus:outline-none" />
                </div>
                <div>
                  <label className="block text-[10px] text-amber-400/80 mb-0.5">Veganos</label>
                  <input type="number" min="0" placeholder="0" value={eventoEdit.veganos} onChange={(e) => setEventoEdit({...eventoEdit, veganos: e.target.value})} className="w-full px-2 py-1 rounded border border-amber-500/20 bg-white/5 text-white text-xs focus:outline-none" />
                </div>
              </div>

              {/* Extras compactos */}
              <div className="space-y-1">
                <label className="block text-xs text-slate-400">Extras</label>
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-12 gap-1 p-1.5 rounded-lg bg-white/5 border border-white/10 items-center">
                    <div className="col-span-1 flex justify-center">
                      <input type="checkbox" checked={eventoEdit[`extra${i}_confirmado`] || false} onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_confirmado`]: e.target.checked})} className="w-4 h-4 rounded border-white/20 bg-white/5 text-emerald-500" title="Confirmar" />
                    </div>
                    <div className="col-span-5">
                      <input type="text" placeholder={`Extra ${i}`} value={eventoEdit[`extra${i}_desc`]} onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_desc`]: e.target.value})} className="w-full px-2 py-1 rounded border border-white/10 bg-white/5 text-white placeholder-slate-500 text-xs focus:outline-none" />
                    </div>
                    <div className="col-span-3">
                      <input type="text" inputMode="numeric" placeholder="$" value={formatNumberInput(eventoEdit[`extra${i}_valor`])} onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_valor`]: parseNumberInput(e.target.value)})} className="w-full px-2 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:outline-none" />
                    </div>
                    <div className="col-span-3">
                      <select value={eventoEdit[`extra${i}_tipo`]} onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_tipo`]: e.target.value})} className="w-full px-1 py-1 rounded border border-white/10 bg-white/5 text-white text-xs focus:outline-none">
                        <option value="total">Total</option>
                        <option value="por_persona">x Pers</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total + Otros + Botón en grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-xs text-slate-400 mb-0.5">Otros / Aclaraciones</label>
                  <textarea value={eventoEdit.otros} onChange={(e) => setEventoEdit({...eventoEdit, otros: e.target.value})} rows={2} className="w-full px-2 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none resize-none" />
                </div>
                <div className="flex flex-col justify-between">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-center">
                    <p className="text-[10px] text-slate-400">Total Evento</p>
                    <p className="text-lg font-bold text-emerald-400">{displayPrice(calcularTotalEdit())}</p>
                  </div>
                  <button type="submit" disabled={saving} className="py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-1">
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Edit3 className="w-4 h-4" />}
                    {saving ? 'Guardando...' : 'Guardar'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Nuevo/Editar Pago */}
      {showPagoModal && selectedEventoPago && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">{editingPagoId ? 'Editar Pago' : 'Registrar Pago'}</h2>
              <button onClick={() => { setShowPagoModal(false); setSelectedEventoPago(null); setEditingPagoId(null); setNuevoPago({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '', observaciones: '' }); }} className="p-1.5 hover:bg-white/10 rounded-lg">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-3 p-2 rounded-lg bg-white/5 border border-white/10 text-sm">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Cliente:</span>
                <span className="font-semibold">{selectedEventoPago.cliente}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-slate-400">Evento:</span>
                <span>{formatDate(selectedEventoPago.fecha)}</span>
              </div>
              <div className="mt-2 pt-2 border-t border-white/10 grid grid-cols-2 gap-2">
                <div className="text-center">
                  <p className="text-xs text-slate-400">Total</p>
                  <p className="font-bold text-white">{formatCurrency(selectedEventoPago.precio || 0)}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-slate-400">Saldo</p>
                  <p className={`font-bold ${(selectedEventoPago.saldo || 0) > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                    {formatCurrency(selectedEventoPago.saldo || 0)}
                  </p>
                </div>
              </div>
            </div>

            {!editingPagoId && (selectedEventoPago.saldo || 0) > 0 && (
              <div className="mb-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setNuevoPago({...nuevoPago, monto: String(selectedEventoPago.saldo || 0)})}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 transition-colors text-xs font-medium"
                >
                  Pagar Total ({formatCurrency(selectedEventoPago.saldo || 0)})
                </button>
                <button
                  type="button"
                  onClick={() => setNuevoPago({...nuevoPago, monto: ''})}
                  className="flex-1 py-1.5 px-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-colors text-xs font-medium"
                >
                  Pago Parcial
                </button>
              </div>
            )}

            <form onSubmit={handleAddPago} className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={nuevoPago.fecha}
                    onChange={(e) => setNuevoPago({...nuevoPago, fecha: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Cobrado por *</label>
                  <select
                    required
                    value={nuevoPago.cobrador}
                    onChange={(e) => setNuevoPago({...nuevoPago, cobrador: e.target.value})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="" className="bg-slate-900">Seleccionar...</option>
                    {COBRADORES.map(c => (
                      <option key={c} value={c} className="bg-slate-900">{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Concepto</label>
                  <select
                    value={nuevoPago.concepto}
                    onChange={(e) => setNuevoPago({...nuevoPago, concepto: e.target.value, monto: '', porcentajeIPC: ''})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="pago">Pago</option>
                    <option value="seña">Seña</option>
                    <option value="ajuste_ipc">Ajuste IPC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Moneda</label>
                  <select
                    value={nuevoPago.moneda}
                    onChange={(e) => setNuevoPago({...nuevoPago, moneda: e.target.value, cotizacionDolar: ''})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="ARS">Pesos (ARS)</option>
                    <option value="USD">Dólares (USD)</option>
                  </select>
                </div>
              </div>
              {nuevoPago.moneda === 'USD' && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1 flex items-center justify-between">
                    <span>Cotización dólar *</span>
                    <button
                      type="button"
                      onClick={() => setNuevoPago({...nuevoPago, cotizacionDolar: tipoCambio.toString()})}
                      className="text-blue-400 hover:text-blue-300 text-xs"
                    >
                      Usar TC Blue (${tipoCambio})
                    </button>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      required
                      placeholder={tipoCambio.toString()}
                      value={formatNumberInput(nuevoPago.cotizacionDolar)}
                      onChange={(e) => setNuevoPago({...nuevoPago, cotizacionDolar: parseNumberInput(e.target.value)})}
                      className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  {nuevoPago.monto && nuevoPago.cotizacionDolar && (
                    <p className="mt-1 text-xs text-emerald-400">= {formatCurrency((parseFloat(nuevoPago.monto) || 0) * (parseFloat(nuevoPago.cotizacionDolar) || 0))}</p>
                  )}
                </div>
              )}
              {nuevoPago.concepto === 'ajuste_ipc' && !editingPagoId ? (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">% IPC sobre saldo *</label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      required
                      placeholder="5"
                      value={nuevoPago.porcentajeIPC || ''}
                      onChange={(e) => {
                        const pct = e.target.value;
                        const montoCalculado = Math.round((selectedEventoPago?.saldo || 0) * (parseFloat(pct) || 0) / 100);
                        setNuevoPago({...nuevoPago, porcentajeIPC: pct, monto: String(montoCalculado)});
                      }}
                      className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">%</span>
                  </div>
                  <p className="mt-1 text-xs text-amber-400">IPC: {formatCurrency(parseFloat(nuevoPago.monto) || 0)}</p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">{nuevoPago.concepto === 'ajuste_ipc' ? 'Monto IPC *' : 'Monto *'}</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    placeholder="Monto"
                    value={formatNumberInput(nuevoPago.monto)}
                    onChange={(e) => setNuevoPago({...nuevoPago, monto: parseNumberInput(e.target.value)})}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              )}

              {/* Observaciones */}
              <div>
                <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
                <textarea
                  placeholder="Notas adicionales sobre el pago..."
                  value={nuevoPago.observaciones}
                  onChange={(e) => setNuevoPago({...nuevoPago, observaciones: e.target.value})}
                  rows={2}
                  className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              {editingPagoId && (
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Motivo modificación *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Corrección de monto"
                    value={motivoModificacion}
                    onChange={(e) => setMotivoModificacion(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={saving}
                className="w-full py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-sm font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mt-3"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Receipt className="w-4 h-4" />}
                {saving ? 'Guardando...' : (editingPagoId ? 'Actualizar' : 'Registrar Pago')}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal IPC */}
      {showIPCModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">
                {editingIPC ? 'Editar' : 'Cargar'} IPC - {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'][nuevoIPC.mes - 1]} {ipcAñoSeleccionado}
              </h2>
              <button onClick={() => { setShowIPCModal(false); setEditingIPC(null); }} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Info si es edición */}
              {editingIPC && (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-3 text-sm text-blue-300">
                  <p><strong>Modo edición:</strong> Podés actualizar los valores sin re-aplicar, o aplicar nuevamente para crear ajustes adicionales.</p>
                  {editingIPC.aplicado && (
                    <p className="mt-1 text-blue-400">Aplicado: {new Date(editingIPC.fecha_aplicacion).toLocaleDateString('es-AR')} • {editingIPC.eventos_afectados} eventos • +${Math.round(editingIPC.total_ajustado || 0).toLocaleString('es-AR')}</p>
                  )}
                </div>
              )}

              {/* IPC INDEC */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">IPC INDEC (referencia)</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.70"
                    value={nuevoIPC.ipc_indec}
                    onChange={(e) => setNuevoIPC({...nuevoIPC, ipc_indec: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-slate-400 placeholder-slate-600 focus:outline-none focus:border-amber-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500">%</span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Valor publicado por INDEC (solo referencia)</p>
              </div>

              {/* IPC a Aplicar */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">IPC a Aplicar *</label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Ej: 2.50"
                    value={nuevoIPC.ipc_aplicado}
                    onChange={(e) => {
                      const valor = e.target.value;
                      setNuevoIPC({...nuevoIPC, ipc_aplicado: valor});
                      // Recalcular incremento
                      if (valor && ipcPreview.totalSaldos > 0) {
                        setIpcPreview({
                          ...ipcPreview,
                          incremento: ipcPreview.totalSaldos * (parseFloat(valor) / 100)
                        });
                      }
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
                </div>
              </div>

              {/* Preview - solo mostrar si NO está editando o si quiere re-aplicar */}
              {!editingIPC && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Eventos que serán actualizados:</span>
                    <span className="text-white font-medium">{ipcPreview.eventos}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Total saldos a ajustar:</span>
                    <span className="text-white font-medium">${Math.round(ipcPreview.totalSaldos).toLocaleString('es-AR')}</span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-amber-500/30 pt-2">
                    <span className="text-amber-400 font-medium">Incremento estimado:</span>
                    <span className="text-amber-400 font-bold">+${Math.round(ipcPreview.incremento).toLocaleString('es-AR')}</span>
                  </div>
                </div>
              )}

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => { setShowIPCModal(false); setEditingIPC(null); }}
                  className="flex-1 py-2.5 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5"
                >
                  Cancelar
                </button>
                {editingIPC && (
                  <button
                    onClick={async () => {
                      setSaving(true);
                      const { error } = await supabase
                        .from('ipc_mensual')
                        .update({
                          ipc_indec: parseFloat(nuevoIPC.ipc_indec) || 0,
                          ipc_aplicado: parseFloat(nuevoIPC.ipc_aplicado) || 0
                        })
                        .eq('id', editingIPC.id);
                      setSaving(false);
                      if (error) {
                        alert('Error al guardar');
                      } else {
                        setShowIPCModal(false);
                        setEditingIPC(null);
                        fetchIPCMensual();
                      }
                    }}
                    disabled={saving}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    Solo Guardar
                  </button>
                )}
                {!editingIPC && (
                  <button
                    onClick={async () => {
                      if (!nuevoIPC.ipc_aplicado) {
                        alert('Ingresá el IPC a aplicar');
                        return;
                      }
                      await aplicarIPCMensual();
                      setEditingIPC(null);
                    }}
                    disabled={saving || !nuevoIPC.ipc_aplicado}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-semibold hover:from-amber-700 hover:to-orange-700 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                    {saving ? 'Aplicando...' : 'Aplicar Ajuste'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow flex-shrink-0">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Gestión de Eventos
                </h1>
                <p className="text-xs sm:text-sm text-slate-400">Panel de Control</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-3">
              {/* Selector de Año */}
              <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400 hidden sm:block" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="bg-transparent text-white text-sm sm:text-base font-medium focus:outline-none cursor-pointer"
                >
                  {yearsDisponibles.map(year => (
                    <option key={year} value={year} className="bg-slate-900">{year}</option>
                  ))}
                </select>
              </div>
              {canCreate && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-1 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Nuevo Evento</span>
                </button>
              )}
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className={`hidden sm:inline px-2 py-1 rounded-lg text-xs font-medium ${
                  userRole === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                  userRole === 'vendedor' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {userRole === 'admin' ? 'Admin' : userRole === 'vendedor' ? 'Vendedor' : 'Lectura'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-2 sm:px-3 py-2 sm:py-2.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  title={user?.email}
                >
                  <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-2 sm:px-6 py-2 sm:py-4">
        <div className="flex gap-0.5 sm:gap-1 p-0.5 sm:p-1 glass rounded-xl sm:rounded-2xl overflow-x-auto scrollbar-hide">
          {[
            { id: 'dashboard', label: 'Dashboard', shortLabel: 'Dash', icon: BarChart3 },
            { id: 'proximos', label: 'Próximos', shortLabel: 'Próx', icon: Clock },
            { id: 'aconfirmar', label: 'A Confirmar', shortLabel: 'Conf', icon: AlertCircle },
            { id: 'realizados', label: 'Realizados', shortLabel: 'Real', icon: CheckCircle },
            { id: 'calendario', label: 'Calendario', shortLabel: 'Cal', icon: Calendar },
            { id: 'eventos', label: 'Eventos', shortLabel: 'Ev', icon: Briefcase },
            { id: 'cobranzas', label: 'Cobranzas', shortLabel: 'Cobr', icon: Wallet },
            { id: 'menus', label: 'Menús', shortLabel: 'Menú', icon: UtensilsCrossed },
            { id: 'informes', label: 'Informes', shortLabel: 'Inf', icon: ClipboardList },
            { id: 'agenda', label: 'Agenda', shortLabel: 'Ag', icon: Contact },
            { id: 'usuarios', label: 'Usuarios', shortLabel: 'Usr', icon: Users },
            { id: 'caja', label: 'Caja', shortLabel: 'Caja', icon: Banknote },
          ].filter(tab => userTabsPermitidas.includes(tab.id)).map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                if (tab.id === 'caja' || tab.id === 'cobranzas') {
                  // Verificar si está desbloqueado y no pasaron 5 minutos (misma clave para Caja y Cobranzas)
                  const ahora = Date.now();
                  const cincoMinutos = 5 * 60 * 1000;
                  if (cajaDesbloqueada && cajaDesbloqueoTime && (ahora - cajaDesbloqueoTime) < cincoMinutos) {
                    setActiveTab(tab.id);
                  } else {
                    const clave = prompt(`Ingrese la clave para acceder a ${tab.id === 'caja' ? 'Caja' : 'Cobranzas'}:`);
                    if (clave === '1970') {
                      setCajaDesbloqueada(true);
                      setCajaDesbloqueoTime(Date.now());
                      setActiveTab(tab.id);
                    } else if (clave !== null) {
                      alert('Clave incorrecta');
                    }
                  }
                } else {
                  setActiveTab(tab.id);
                }
              }}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-all text-[10px] sm:text-xs font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="sm:hidden">{tab.shortLabel || tab.label}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 pb-8 sm:pb-12">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4">
              {[
                { label: 'Total Eventos', value: stats.totalEventos, icon: Calendar, color: 'from-indigo-500 to-blue-600' },
                { label: 'Fact. Realizada', value: stats.facturadoRealizado, icon: DollarSign, color: 'from-emerald-500 to-teal-600', format: true },
                { label: 'Fact. Pendiente', value: stats.facturadoPendiente, icon: TrendingUp, color: 'from-amber-500 to-orange-600', format: true },
                { label: 'Total Invitados', value: stats.totalAdultos, icon: Users, color: 'from-rose-500 to-pink-600' },
              ].map((stat, i) => (
                <div key={i} className="stat-card glass rounded-xl sm:rounded-2xl p-3 sm:p-5 glow">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="text-slate-400 text-[10px] sm:text-xs lg:text-sm mb-0.5 sm:mb-1 truncate">{stat.label}</p>
                      <p className="text-sm sm:text-lg lg:text-2xl font-bold truncate">
                        {stat.format ? displayPrice(stat.value) : stat.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                      </p>
                    </div>
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-11 lg:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center flex-shrink-0`}>
                      <stat.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Próximos Eventos (15 días) y Pendientes */}
            {(() => {
              const hoy = new Date();
              hoy.setHours(0, 0, 0, 0);
              const en15Dias = new Date(hoy);
              en15Dias.setDate(en15Dias.getDate() + 15);

              const eventosProximos15 = eventos
                .filter(e => {
                  if (e.anulado || !e.confirmado) return false;
                  const fechaEvento = new Date(e.fecha + 'T12:00:00');
                  return fechaEvento >= hoy && fechaEvento <= en15Dias;
                })
                .sort((a, b) => a.fecha.localeCompare(b.fecha));

              const eventosPendientes = eventos
                .filter(e => !e.anulado && !e.confirmado && new Date(e.fecha + 'T12:00:00') >= hoy)
                .sort((a, b) => a.fecha.localeCompare(b.fecha));

              return (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  {/* Próximos 15 días */}
                  <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 glow">
                    <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                      <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                      <span className="hidden sm:inline">Próximos 15 días</span>
                      <span className="sm:hidden">Próximos</span>
                      <span className="ml-auto text-xs sm:text-sm font-normal text-slate-400">{eventosProximos15.length}</span>
                    </h3>
                    {eventosProximos15.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 text-sm">No hay eventos próximos</p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto scrollbar-thin">
                        {eventosProximos15.map(evento => {
                          const clima = climaData[evento.fecha];
                          const climaInfo = clima ? getClimaInfo(clima.codigo) : null;
                          return (
                            <div
                              key={evento.id}
                              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => setSelectedEvento(evento)}>
                                  <span className="text-sm sm:text-lg font-bold">{new Date(evento.fecha + 'T12:00:00').getDate()}</span>
                                  <span className="text-[8px] sm:text-[10px] uppercase">{new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedEvento(evento)}>
                                  <p className="text-sm sm:text-base font-medium truncate">{evento.cliente}</p>
                                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-400 flex-wrap">
                                    <span>{evento.tipo_evento}</span>
                                    <span className="hidden sm:inline">•</span>
                                    <span>{evento.adultos} pers.</span>
                                    {clima && <span title={climaInfo?.desc}>{climaInfo?.icono} {clima.tempMax}°</span>}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                  <button onClick={(e) => { e.stopPropagation(); abrirDetalle(evento); }} className="p-1.5 sm:p-2 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" title="Detalle">
                                    <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); generarCotizacion(evento); }} className="p-1.5 sm:p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hidden sm:block" title="Cotización">
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); generarPDF(evento); }} className="p-1.5 sm:p-2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" title="Resumen">
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Pendientes por confirmar */}
                  <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-5 glow">
                    <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                      <span className="hidden sm:inline">Pendientes por Confirmar</span>
                      <span className="sm:hidden">Pendientes</span>
                      <span className="ml-auto text-xs sm:text-sm font-normal text-amber-400">{eventosPendientes.length}</span>
                    </h3>
                    {eventosPendientes.length === 0 ? (
                      <p className="text-slate-500 text-center py-4 text-sm">No hay eventos pendientes</p>
                    ) : (
                      <div className="space-y-2 sm:space-y-3 max-h-[250px] sm:max-h-[300px] overflow-y-auto scrollbar-thin">
                        {eventosPendientes.map(evento => {
                          const diasRestantes = Math.ceil((new Date(evento.fecha + 'T12:00:00') - hoy) / (1000 * 60 * 60 * 24));
                          const clima = climaData[evento.fecha];
                          const climaInfo = clima ? getClimaInfo(clima.codigo) : null;
                          return (
                            <div
                              key={evento.id}
                              className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-amber-500/20"
                            >
                              <div className="flex items-center gap-2 sm:gap-3">
                                <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex flex-col items-center justify-center flex-shrink-0 cursor-pointer ${
                                  diasRestantes <= 7 ? 'bg-gradient-to-br from-red-600 to-orange-600' : 'bg-gradient-to-br from-amber-600 to-orange-600'
                                }`} onClick={() => setSelectedEvento(evento)}>
                                  <span className="text-sm sm:text-lg font-bold">{new Date(evento.fecha + 'T12:00:00').getDate()}</span>
                                  <span className="text-[8px] sm:text-[10px] uppercase">{new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                                </div>
                                <div className="flex-1 min-w-0 cursor-pointer" onClick={() => setSelectedEvento(evento)}>
                                  <p className="text-sm sm:text-base font-medium truncate">{evento.cliente}</p>
                                  <div className="flex items-center gap-1 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
                                    <span>{evento.tipo_evento}</span>
                                    <span className={diasRestantes <= 7 ? 'text-red-400' : 'text-amber-400'}>
                                      {diasRestantes === 0 ? 'HOY' : diasRestantes === 1 ? 'Mañana' : `${diasRestantes}d`}
                                    </span>
                                    {clima && <span>{climaInfo?.icono} {clima.tempMax}°</span>}
                                  </div>
                                </div>
                                <div className="flex gap-0.5 sm:gap-1 flex-shrink-0">
                                  <button onClick={(e) => { e.stopPropagation(); abrirDetalle(evento); }} className="p-1.5 sm:p-2 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30" title="Detalle">
                                    <Monitor className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); generarCotizacion(evento); }} className="p-1.5 sm:p-2 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 hidden sm:block" title="Cotización">
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                  <button onClick={(e) => { e.stopPropagation(); generarPDF(evento); }} className="p-1.5 sm:p-2 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30" title="Resumen">
                                    <FileText className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-400" />
                  Facturación por Mes
                </h3>
                <ResponsiveContainer width="100%" height={180} className="sm:!h-[280px]">
                  <AreaChart data={eventosPorMes}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} width={35} />
                    <Tooltip
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '8px', color: 'white', fontSize: '12px' }}
                      formatter={(value) => [formatCurrency(value), 'Total']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400" />
                  Ventas por Vendedor
                </h3>
                <ResponsiveContainer width="100%" height={150} className="sm:!h-[220px]">
                  <PieChart>
                    <Pie data={eventosPorVendedor} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={4} dataKey="value" className="sm:[&>path]:!inner-radius-[60px] sm:[&>path]:!outer-radius-[90px]">
                      {eventosPorVendedor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [formatCurrency(value), 'Facturado']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-2 sm:gap-6 mt-2 sm:mt-3 flex-wrap">
                  {eventosPorVendedor.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg" style={{ background: `${COLORS[i]}20` }}>
                      <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-xs sm:text-sm font-medium" style={{ color: COLORS[i] }}>{v.name}</span>
                      <span className="text-slate-400 text-[10px] sm:text-xs ml-0.5 sm:ml-1 hidden sm:inline">{formatCurrency(v.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gráfico de Comensales por Mes */}
            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
              <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                Comensales por Mes
              </h3>
              <ResponsiveContainer width="100%" height={180} className="sm:!h-[280px]">
                <BarChart data={comensalesPorMes}>
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={9} tickLine={false} axisLine={false} width={30} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #06b6d4', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="adultos" name="Adultos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="menores" name="Menores" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-4 sm:gap-6 mt-2">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-300 text-xs sm:text-sm">Adultos</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-300 text-xs sm:text-sm">Menores</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
              <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-pink-400" />
                Tipos de Evento
              </h3>
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3">
                {eventosPorTipo.slice(0, 12).map((tipo) => (
                  <div key={tipo.name} className="bg-white/5 rounded-lg sm:rounded-xl p-2 sm:p-4 text-center border border-white/5 hover:border-purple-500/30 transition-all">
                    <p className="text-lg sm:text-2xl font-bold text-purple-400">{tipo.value}</p>
                    <p className="text-[10px] sm:text-xs text-slate-400 mt-0.5 sm:mt-1 truncate">{tipo.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Eventos por Menú */}
              <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-400" />
                  Eventos por Menú
                </h3>
                <div className="space-y-2 sm:space-y-3">
                  {eventosPorMenu.map((menu, idx) => {
                    const maxValue = Math.max(...eventosPorMenu.map(m => m.value));
                    const percentage = (menu.value / maxValue) * 100;
                    return (
                      <div key={menu.name} className="flex items-center gap-2 sm:gap-3">
                        <div className="w-16 sm:w-24 text-xs sm:text-sm text-slate-300 truncate">{menu.name}</div>
                        <div className="flex-1 h-6 sm:h-8 bg-white/5 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-end pr-1.5 sm:pr-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-[10px] sm:text-xs font-bold text-white">{menu.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eventos por Salón */}
              <div className="glass rounded-xl sm:rounded-2xl p-3 sm:p-6 glow">
                <h3 className="text-sm sm:text-lg font-semibold mb-3 sm:mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                  Eventos por Salón
                </h3>
                <div className="grid grid-cols-3 gap-2 sm:gap-4">
                  {eventosPorSalon.map((salon, idx) => {
                    const colores = ['from-amber-500 to-orange-500', 'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500'];
                    return (
                      <div key={salon.name} className="text-center">
                        <div className={`w-14 h-14 sm:w-20 sm:h-20 mx-auto rounded-xl sm:rounded-2xl bg-gradient-to-br ${colores[idx % colores.length]} flex items-center justify-center mb-1.5 sm:mb-3`}>
                          <span className="text-lg sm:text-2xl font-bold text-white">{salon.value}</span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-slate-300 font-medium truncate">{salon.name}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Próximos Eventos */}
        {activeTab === 'proximos' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold">Próximos Eventos</h2>
                <p className="text-slate-400">{proximosEventos.length} eventos programados</p>
              </div>
              <select
                value={filterMesProximos}
                onChange={(e) => setFilterMesProximos(e.target.value)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500/50 bg-white/5"
              >
                {meses.map(m => (
                  <option key={m} value={m}>{m === 'todos' ? 'Todos los meses' : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            {proximosEventos.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center glow">
                <Calendar className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay eventos próximos</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-4 px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Agregar evento
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {proximosEventos.map((e, i) => (
                  <div
                    key={e.id || i}
                    className="glass rounded-2xl p-5 glow hover:border-purple-500/30 border border-transparent transition-all"
                  >
                    <div className={`flex flex-col md:flex-row md:items-center gap-4 ${userVerPrecios ? 'cursor-pointer' : ''}`} onClick={() => userVerPrecios && setSelectedEvento(e)}>
                      {/* Fecha destacada */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{new Date(e.fecha + 'T12:00:00').getDate()}</span>
                        <span className="text-xs uppercase">{new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{e.cliente}</h3>
                          <span className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium ${
                            getDiasRestantes(e.fecha) === 'Hoy' ? 'bg-red-500/20 text-red-300 border border-red-500/30' :
                            getDiasRestantes(e.fecha) === 'Mañana' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                            'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}>
                            {getDiasRestantes(e.fecha)}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            📋 {e.tipoEvento}
                          </span>
                          <span className="flex items-center gap-1">
                            🍽️ {e.menu}
                          </span>
                          <span className="flex items-center gap-1">
                            👥 {e.adultos + (e.menores || 0)} personas
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {e.salon || 'Tero'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                          <span className={`flex items-center gap-1 ${e.turno === 'Noche' ? 'text-indigo-400' : 'text-amber-400'}`}>
                            {e.turno === 'Noche' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            {e.turno}
                          </span>
                          {(e.hora_inicio || e.hora_fin) && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" /> {e.hora_inicio || '--:--'} a {e.hora_fin || '--:--'}
                            </span>
                          )}
                          <span className="text-slate-400">👤 {e.vendedor}</span>
                          {e.telefono && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Phone className="w-3 h-3" /> {e.telefono}
                            </span>
                          )}
                        </div>

                        {/* Extras */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {e.tecnica && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Técnica
                            </span>
                          )}
                          {e.tecnica_superior && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Técnica Superior
                            </span>
                          )}
                          {e.dj && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              DJ: {e.dj}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total y botones integrados */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="text-xl font-bold text-emerald-400">{displayPrice(e.totalEvento)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(ev) => { ev.stopPropagation(); abrirDetalle(e); }}
                            className="p-1.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                            title="Detalle"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                          {userVerPrecios && (
                            <>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); generarCotizacion(e); }}
                                className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                                title="Cotización"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); generarPDF(e); }}
                                className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                title="Resumen"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {e.otros && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-slate-400">📝 {e.otros}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Eventos Realizados */}
        {activeTab === 'realizados' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Eventos Realizados</h2>
                <p className="text-slate-400">{eventosRealizados.length} eventos completados</p>
              </div>
            </div>

            {eventosRealizados.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center glow">
                <CheckCircle className="w-16 h-16 text-slate-600 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay eventos realizados</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {eventosRealizados.map((e, i) => (
                  <div
                    key={e.id || i}
                    onClick={() => userVerPrecios && setSelectedEvento(e)}
                    className={`glass rounded-2xl p-5 glow hover:border-emerald-500/30 border border-transparent transition-all opacity-90 ${userVerPrecios ? 'cursor-pointer' : ''}`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
                      {/* Fecha destacada */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-600 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{new Date(e.fecha + 'T12:00:00').getDate()}</span>
                        <span className="text-xs uppercase">{new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{e.cliente}</h3>
                          <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            Realizado
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            📋 {e.tipoEvento}
                          </span>
                          <span className="flex items-center gap-1">
                            🍽️ {e.menu}
                          </span>
                          <span className="flex items-center gap-1">
                            👥 {e.adultos + (e.menores || 0)} personas
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {e.salon || 'Tero'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                          <span className={`flex items-center gap-1 ${e.turno === 'Noche' ? 'text-indigo-400' : 'text-amber-400'}`}>
                            {e.turno === 'Noche' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            {e.turno}
                          </span>
                          <span className="text-slate-400">👤 {e.vendedor}</span>
                        </div>

                        {/* Extras */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {e.tecnica && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                              Técnica
                            </span>
                          )}
                          {e.tecnica_superior && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Técnica Superior
                            </span>
                          )}
                          {e.dj && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30">
                              DJ: {e.dj}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Total */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-xl font-bold text-emerald-400">{displayPrice(e.totalEvento)}</p>
                      </div>
                    </div>

                    {e.otros && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-slate-400">📝 {e.otros}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* A Confirmar */}
        {activeTab === 'aconfirmar' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h2 className="text-2xl font-bold">Cotizaciones a Confirmar</h2>
                <p className="text-slate-400">{eventosAConfirmar.length} pendientes de confirmación</p>
              </div>
              <select
                value={filterMesAConfirmar}
                onChange={(e) => setFilterMesAConfirmar(e.target.value)}
                className="px-4 py-2 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500/50 bg-white/5"
              >
                {meses.map(m => (
                  <option key={m} value={m}>{m === 'todos' ? 'Todos los meses' : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
            </div>

            {eventosAConfirmar.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center glow">
                <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">No hay cotizaciones pendientes</p>
                <p className="text-slate-500 text-sm mt-2">Todas las cotizaciones han sido confirmadas</p>
              </div>
            ) : (
              <div className="grid gap-4">
                {eventosAConfirmar.map((e, i) => (
                  <div
                    key={e.id || i}
                    className="glass rounded-2xl p-5 glow hover:border-amber-500/30 border border-amber-500/20 transition-all"
                  >
                    <div className={`flex flex-col md:flex-row md:items-center gap-4 ${userVerPrecios ? 'cursor-pointer' : ''}`} onClick={() => userVerPrecios && setSelectedEvento(e)}>
                      {/* Fecha destacada */}
                      <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-600 to-orange-600 flex flex-col items-center justify-center">
                        <span className="text-2xl font-bold">{new Date(e.fecha + 'T12:00:00').getDate()}</span>
                        <span className="text-xs uppercase">{new Date(e.fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                      </div>

                      {/* Info principal */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <h3 className="text-lg font-semibold truncate">{e.cliente}</h3>
                          <span className="flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            Pendiente
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-400">
                          <span className="flex items-center gap-1">
                            📋 {e.tipoEvento}
                          </span>
                          <span className="flex items-center gap-1">
                            🍽️ {e.menu}
                          </span>
                          <span className="flex items-center gap-1">
                            👥 {e.adultos + (e.menores || 0)} personas
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" /> {e.salon || 'Tero'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                          <span className={`flex items-center gap-1 ${e.turno === 'Noche' ? 'text-indigo-400' : 'text-amber-400'}`}>
                            {e.turno === 'Noche' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            {e.turno}
                          </span>
                          {(e.hora_inicio || e.hora_fin) && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Clock className="w-3 h-3" /> {e.hora_inicio || '--:--'} a {e.hora_fin || '--:--'}
                            </span>
                          )}
                          <span className="text-slate-400">👤 {e.vendedor}</span>
                          {e.telefono && (
                            <span className="flex items-center gap-1 text-slate-400">
                              <Phone className="w-3 h-3" /> {e.telefono}
                            </span>
                          )}
                        </div>

                        {/* Badges Técnica, Técnica Superior, DJ */}
                        {(e.tecnica || e.tecnica_superior || e.dj) && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {e.tecnica && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Técnica
                              </span>
                            )}
                            {e.tecnica_superior && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                                <Mic className="w-3 h-3" /> Téc. Superior
                              </span>
                            )}
                            {e.dj && (
                              <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                                <Music className="w-3 h-3" /> {e.dj}
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Total y botones integrados */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Total</p>
                          <p className="text-xl font-bold text-emerald-400">{displayPrice(e.totalEvento)}</p>
                        </div>
                        <div className="flex gap-1">
                          <button
                            onClick={(ev) => { ev.stopPropagation(); abrirDetalle(e); }}
                            className="p-1.5 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                            title="Detalle"
                          >
                            <Monitor className="w-3.5 h-3.5" />
                          </button>
                          {userVerPrecios && (
                            <>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); generarCotizacion(e); }}
                                className="p-1.5 rounded bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-all"
                                title="Cotización"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={(ev) => { ev.stopPropagation(); generarPDF(e); }}
                                className="p-1.5 rounded bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
                                title="Resumen"
                              >
                                <FileText className="w-3.5 h-3.5" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {e.otros && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <p className="text-sm text-slate-400">📝 {e.otros}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Calendario */}
        {activeTab === 'calendario' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 glass rounded-2xl p-6 glow">
              <div className="flex items-center justify-between mb-6">
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-semibold">
                  {MESES[calendarDate.getMonth()]} {calendarDate.getFullYear()}
                </h3>
                <button 
                  onClick={() => setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {DIAS_SEMANA.map(dia => (
                  <div key={dia} className="text-center text-sm text-slate-400 py-2">{dia}</div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="aspect-square" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const eventosDelDia = getEventosForDate(day);
                  const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const hasEventos = eventosDelDia.length > 0;
                  
                  return (
                    <button
                      key={day}
                      onClick={() => setSelectedDate(hasEventos ? dateStr : null)}
                      className={`aspect-square rounded-xl flex flex-col items-center justify-center text-sm transition-all relative ${
                        isSelected ? 'bg-purple-600 text-white' :
                        hasEventos ? 'bg-purple-500/20 hover:bg-purple-500/30 text-white' : 
                        'hover:bg-white/5 text-slate-400'
                      }`}
                    >
                      <span className="font-medium">{day}</span>
                      {hasEventos && (
                        <div className="flex gap-0.5 mt-1">
                          {eventosDelDia.slice(0, 3).map((e, idx) => (
                            <div
                              key={idx}
                              className={`w-1.5 h-1.5 rounded-full ${e.confirmado ? 'bg-emerald-400' : 'bg-amber-400'}`}
                            />
                          ))}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center gap-4 mt-4 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span>Confirmado</span>
                </div>
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <span>A confirmar</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 glow">
              <h3 className="text-lg font-semibold mb-4">
                {selectedDate ? `Eventos del ${formatDate(selectedDate)}` : 'Seleccioná un día'}
              </h3>
              
              {eventosDelDiaSeleccionado.length > 0 ? (
                <div className="space-y-3">
                  {eventosDelDiaSeleccionado.map((e, i) => (
                    <div
                      key={i}
                      onClick={() => userVerPrecios && setSelectedEvento(e)}
                      className={`w-full text-left rounded-xl p-4 border transition-all ${userVerPrecios ? 'cursor-pointer' : ''} ${
                        e.confirmado
                          ? 'bg-white/5 border-white/10 hover:border-purple-500/30'
                          : 'bg-amber-500/5 border-amber-500/20 hover:border-amber-500/40'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{e.cliente}</span>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
                            e.confirmado
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}>
                            {e.confirmado ? <CheckCircle className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                            {e.confirmado ? 'Confirmado' : 'A confirmar'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mb-2 flex-wrap">
                        <span className={`px-2 py-1 rounded-full text-xs ${e.turno === 'Noche' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {e.turno}
                        </span>
                        {(e.hora_inicio || e.hora_fin) && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {e.hora_inicio || '--:--'} a {e.hora_fin || '--:--'}
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>📋 {e.tipoEvento}</p>
                        <p>🍽️ {e.menu} • {e.adultos} personas</p>
                        <p>🏛️ {e.salon}</p>
                        <p>👤 {e.vendedor}</p>
                      </div>
                      {(e.tecnica || e.tecnica_superior || e.dj) && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {e.tecnica && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                              <Mic className="w-3 h-3" /> Técnica
                            </span>
                          )}
                          {e.tecnica_superior && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                              <Mic className="w-3 h-3" /> Téc. Superior
                            </span>
                          )}
                          {e.dj && (
                            <span className="px-2 py-0.5 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                              <Music className="w-3 h-3" /> {e.dj}
                            </span>
                          )}
                        </div>
                      )}
                      {userVerPrecios && <p className="text-emerald-400 font-semibold text-sm mt-2">{displayPrice(e.totalEvento)}</p>}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-400 text-center py-8">
                  {selectedDate ? 'No hay eventos este día' : 'Hacé click en un día con eventos para ver los detalles'}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Eventos */}
        {activeTab === 'eventos' && (
          <div className="space-y-4">
            <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px] relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar cliente o tipo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              <select
                value={filterVendedor}
                onChange={(e) => setFilterVendedor(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500/50 bg-white/5"
              >
                {vendedores.map(v => (
                  <option key={v} value={v}>{v === 'todos' ? 'Todos los vendedores' : v}</option>
                ))}
              </select>
              <select
                value={filterMes}
                onChange={(e) => setFilterMes(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500/50 bg-white/5"
              >
                {meses.map(m => (
                  <option key={m} value={m}>{m === 'todos' ? 'Todos los meses' : m.charAt(0).toUpperCase() + m.slice(1)}</option>
                ))}
              </select>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-white focus:outline-none focus:border-purple-500/50 bg-white/5"
              >
                <option value="todos">Todos los estados</option>
                <option value="confirmados">Confirmados</option>
                <option value="aconfirmar">A confirmar</option>
              </select>
              <button
                onClick={() => {
                  const headers = ['ID', 'Fecha', 'Cliente', 'Teléfono', 'Email', 'Tipo Evento', 'Menú', 'Salón', 'Turno', 'Vendedor', 'Adultos', 'Niños', 'Adolescentes', 'Precio Adulto', 'Precio Niño', 'Precio Adolescente', 'Total', 'Seña', 'Confirmado', 'Anulado', 'Observaciones', 'Menu Detalle'];
                  const csv = [headers.join(',')]
                    .concat(eventosFiltrados.map(e => [
                      `"${e.id || ''}"`,
                      `"${e.fecha || ''}"`,
                      `"${(e.cliente || '').replace(/"/g, '""')}"`,
                      `"${e.telefono || ''}"`,
                      `"${e.email || ''}"`,
                      `"${e.tipo_evento || ''}"`,
                      `"${e.menu || ''}"`,
                      `"${e.salon || ''}"`,
                      `"${e.turno || ''}"`,
                      `"${e.vendedor || ''}"`,
                      e.adultos || 0,
                      e.ninos || 0,
                      e.adolescentes || 0,
                      e.precio_adulto || 0,
                      e.precio_nino || 0,
                      e.precio_adolescente || 0,
                      e.total || 0,
                      e.sena || 0,
                      e.confirmado ? 'Sí' : 'No',
                      e.anulado ? 'Sí' : 'No',
                      `"${(e.observaciones || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
                      `"${(e.menu_detalle || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`
                    ].join(',')))
                    .join('\n');
                  const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = `eventos_tero_${new Date().toISOString().slice(0,10)}.csv`;
                  link.click();
                }}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-all"
              >
                <FileText className="w-4 h-4" />
                Exportar
              </button>
            </div>

            <div className="glass rounded-2xl overflow-hidden glow">
              <div className="overflow-x-auto scrollbar-thin">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 cursor-pointer hover:text-white" onClick={() => handleSort('fecha')}>
                        <div className="flex items-center gap-1">Fecha <SortIcon columnKey="fecha" /></div>
                      </th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300">Cliente</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden md:table-cell">Tipo</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden lg:table-cell">Salón</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden sm:table-cell">Turno</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden lg:table-cell">Vendedor</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300 hidden sm:table-cell">Personas</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300 cursor-pointer hover:text-white" onClick={() => handleSort('totalEvento')}>
                        <div className="flex items-center justify-end gap-1">Total <SortIcon columnKey="totalEvento" /></div>
                      </th>
                      <th className="text-center px-5 py-4 text-sm font-medium text-slate-300">Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventos.map((e, i) => {
                      const hoy = new Date();
                      hoy.setHours(0, 0, 0, 0);
                      const fechaEvento = new Date(e.fecha + 'T12:00:00');
                      const esTerminado = fechaEvento < hoy;
                      const estado = esTerminado ? 'Terminado' : (e.confirmado ? 'Confirmado' : 'A confirmar');
                      const estadoColor = esTerminado
                        ? 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                        : e.confirmado
                          ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30';
                      return (
                      <tr
                        key={e.id || i}
                        className={`border-b border-white/5 row-hover transition-colors ${userVerPrecios ? 'cursor-pointer' : ''}`}
                        onClick={() => userVerPrecios && setSelectedEvento(e)}
                      >
                        <td className="px-5 py-4 text-sm">{formatDate(e.fecha)}</td>
                        <td className="px-5 py-4 font-medium">{e.cliente}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {e.tipoEvento}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell">{e.salon || 'Tero'}</td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs ${e.turno === 'Noche' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                            {e.turno}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell">{e.vendedor}</td>
                        <td className="px-5 py-4 text-right hidden sm:table-cell">{e.adultos + (e.menores || 0)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-400">{displayPrice(e.totalEvento)}</td>
                        <td className="px-5 py-4 text-center">
                          <span className={`px-3 py-1 rounded-full text-xs border ${estadoColor}`}>
                            {estado}
                          </span>
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-white/5 border-t border-white/10 text-sm text-slate-400">
                Mostrando {filteredEventos.length} de {eventosData.length} eventos
              </div>
            </div>
          </div>
        )}

        {/* Cobranzas */}
        {activeTab === 'cobranzas' && (
          <div className="space-y-6">
            {/* Stats de Cobranzas */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Facturado</span>
                </div>
                <p className="text-2xl font-bold text-white">{displayPrice(statsCobranzas.totalFacturado)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Cobrado</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400">{displayPrice(statsCobranzas.totalCobrado)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-sm text-slate-400">Pendiente</span>
                </div>
                <p className="text-2xl font-bold text-amber-400">{displayPrice(statsCobranzas.totalPendiente)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-purple-500/20">
                    <Wallet className="w-5 h-5 text-purple-400" />
                  </div>
                  <span className="text-sm text-slate-400">Eventos con saldo</span>
                </div>
                <p className="text-2xl font-bold text-white">{statsCobranzas.eventosConSaldo}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-orange-500/20">
                    <TrendingUp className="w-5 h-5 text-orange-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total IPC</span>
                </div>
                <p className="text-2xl font-bold text-orange-400">+{formatCurrency(statsCobranzas.totalIPC)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20">
                    <DollarSign className="w-5 h-5 text-blue-400" />
                  </div>
                  <span className="text-sm text-slate-400 flex items-center gap-1">
                    TC Blue
                    <button onClick={fetchTipoCambio} className="text-blue-400 hover:text-blue-300" title="Actualizar TC">
                      {tcLoading ? '...' : '↻'}
                    </button>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-2xl font-bold text-blue-400">$</span>
                  <input
                    type="text"
                    value={formatNumberInput(tipoCambio)}
                    onChange={(e) => setTipoCambio(parseFloat(parseNumberInput(e.target.value)) || 0)}
                    className="w-28 px-2 py-1 rounded border border-white/10 bg-white/5 text-blue-400 text-2xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Selector de vista */}
            <div className="flex gap-3 flex-wrap">
              <button
                onClick={() => setVistaCobranzas('estado')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  vistaCobranzas === 'estado'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Estado de Cuenta
              </button>
              <button
                onClick={() => setVistaCobranzas('detalle')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  vistaCobranzas === 'detalle'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Detalle de Pagos
              </button>
              <button
                onClick={() => setVistaCobranzas('ipc')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  vistaCobranzas === 'ipc'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Ajuste IPC
              </button>
            </div>

            {/* Vista: Estado de Cuenta */}
            {vistaCobranzas === 'estado' && (
              <>
                {/* Filtros de Cobranzas */}
                <div className="glass rounded-2xl p-4 flex flex-wrap gap-4 items-center">
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Mes:</span>
                <select
                  value={filterCobranzasMes}
                  onChange={(e) => setFilterCobranzasMes(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="todos" className="bg-slate-900">Todos</option>
                  {MESES.map((mes, idx) => (
                    <option key={idx} value={idx} className="bg-slate-900">{mes}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400">Estado:</span>
                <select
                  value={filterCobranzasEstado}
                  onChange={(e) => setFilterCobranzasEstado(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                >
                  <option value="todos" className="bg-slate-900">Todos</option>
                  <option value="pendientes" className="bg-slate-900">Pendientes</option>
                  <option value="saldo" className="bg-slate-900">Con Saldo</option>
                  <option value="cancelados" className="bg-slate-900">Cancelados</option>
                </select>
              </div>
              <span className="text-sm text-slate-500">
                {cobranzasDataFiltrado.length} de {cobranzasData.length} eventos
              </span>
            </div>

            {/* Lista de Cobranzas */}
            <div className="glass rounded-2xl overflow-hidden glow">
              <div className="p-4 border-b border-white/10">
                <h3 className="text-lg font-semibold">Estado de cuenta por evento</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300">Fecha</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300">Cliente</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300">Evento</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300">Pagos</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300">IPC</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300">Total Cobrado</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300">Saldo</th>
                      <th className="text-center px-5 py-4 text-sm font-medium text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cobranzasDataFiltrado.map((evento) => (
                      <tr key={evento.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 text-sm">{formatDate(evento.fecha)}</td>
                        <td className="px-5 py-4">
                          <p className="font-medium">{evento.cliente}</p>
                          <p className="text-xs text-slate-400">{evento.tipoEvento}</p>
                        </td>
                        <td className="px-5 py-4 text-right">{displayPrice(evento.totalEvento)}</td>
                        <td className="px-5 py-4 text-right text-emerald-400">{formatCurrency(evento.pagosYSenas)}</td>
                        <td className="px-5 py-4 text-right">
                          {evento.ajustesIPC > 0 ? (
                            <span className="text-amber-400">+{formatCurrency(evento.ajustesIPC)}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-rightfont-medium">{displayPrice(evento.totalPagado)}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-semibold${evento.saldo > 0 ? 'text-amber-400' : evento.saldo < 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                            {displayPrice(evento.saldo)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {canCreate && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEventoPago(evento);
                                  setNuevoPago({ fecha: new Date().toISOString().split('T')[0], monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '' });
                                  setEditingPagoId(null);
                                  setShowPagoModal(true);
                                }}
                                className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
                                title="Agregar pago"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
              </>
            )}

            {/* Vista: Detalle de pagos */}
            {vistaCobranzas === 'detalle' && (
              <div className="glass rounded-2xl p-6 glow">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <h3 className="text-lg font-semibold">Detalle de pagos</h3>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">Cliente:</span>
                    <select
                      value={filterCobranzasCliente}
                      onChange={(e) => setFilterCobranzasCliente(e.target.value)}
                      className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="">Todos los clientes</option>
                      {[...new Set(cobranzasData.filter(e => e.pagos.length > 0).map(e => e.cliente))].sort().map(cliente => (
                        <option key={cliente} value={cliente}>{cliente}</option>
                      ))}
                    </select>
                  </div>
                </div>
              <div className="space-y-4">
                {cobranzasData.filter(e => e.pagos.length > 0 && (filterCobranzasCliente === '' || e.cliente === filterCobranzasCliente)).map(evento => (
                  <div key={evento.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{evento.cliente}</p>
                        <p className="text-sm text-slate-400">{formatDate(evento.fecha)} - {evento.tipoEvento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Saldo</p>
                        <p className={`font-semibold${evento.saldo > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {displayPrice(evento.saldo)}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {evento.pagos.map(pago => (
                        <div key={pago.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5">
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-0.5 rounded text-xs ${
                              pago.concepto === 'ajuste_ipc' ? 'bg-amber-500/20 text-amber-300' :
                              pago.concepto === 'seña' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-emerald-500/20 text-emerald-300'
                            }`}>
                              {pago.concepto === 'ajuste_ipc' ? 'IPC' : pago.concepto === 'seña' ? 'Seña' : 'Pago'}
                            </span>
                            <span className="text-sm text-slate-400">{formatDate(pago.fecha)}</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`font-medium${pago.concepto === 'ajuste_ipc' ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {pago.concepto === 'ajuste_ipc' ? '+' : ''}
                              {pago.moneda === 'USD' ? (
                                <>
                                  <span className="text-green-400">US$ {(pago.monto_original || pago.monto).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span>
                                  <span className="text-slate-400 text-xs ml-1">({formatCurrency(pago.monto)})</span>
                                </>
                              ) : formatCurrency(pago.monto)}
                            </span>
                            <button
                              onClick={() => {
                                // Calcular pagos anteriores a este pago
                                const pagosAnteriores = evento.pagos
                                  .filter(p => (p.concepto === 'pago' || p.concepto === 'seña') && new Date(p.fecha) < new Date(pago.fecha))
                                  .reduce((sum, p) => sum + Number(p.monto), 0);
                                generarRecibo(
                                  evento,
                                  {
                                    fecha: pago.fecha,
                                    monto: pago.monto,
                                    concepto: pago.concepto,
                                    cobrador: pago.cobrador || '-',
                                    moneda: pago.moneda,
                                    cotizacion: pago.cotizacion_dolar
                                  },
                                  { pagadoAntes: pagosAnteriores }
                                );
                              }}
                              className="p-1 rounded text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                              title="Descargar recibo"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            {canEdit && (
                              <button
                                onClick={() => handleEditPago(pago, evento)}
                                className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            )}
                            {canDelete && (
                              <button
                                onClick={() => handleDeletePago(pago.id, evento, pago)}
                                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {cobranzasData.filter(e => e.pagos.length > 0).length === 0 && (
                  <p className="text-center text-slate-400 py-8">No hay pagos registrados</p>
                )}
              </div>
              </div>
            )}

            {/* Vista: Ajuste IPC */}
            {vistaCobranzas === 'ipc' && (
              <div className="space-y-6">
                {/* Header con selector de año */}
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <h2 className="text-xl font-bold">Configuración IPC Mensual</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-slate-400">Año:</span>
                    <select
                      value={ipcAñoSeleccionado}
                      onChange={(e) => setIpcAñoSeleccionado(parseInt(e.target.value))}
                      className="px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white"
                    >
                      {[2024, 2025, 2026, 2027].map(año => (
                        <option key={año} value={año} className="bg-slate-900">{año}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Tabla de IPC por mes */}
                <div className="glass rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left p-4 text-slate-400 font-medium">Mes</th>
                        <th className="text-right p-4 text-slate-400 font-medium">IPC INDEC</th>
                        <th className="text-right p-4 text-slate-400 font-medium">IPC Aplicado</th>
                        <th className="text-center p-4 text-slate-400 font-medium">Estado</th>
                        <th className="text-right p-4 text-slate-400 font-medium">Eventos</th>
                        <th className="text-right p-4 text-slate-400 font-medium">Total Ajustado</th>
                        <th className="text-center p-4 text-slate-400 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'].map((mesNombre, idx) => {
                        const mesNum = idx + 1;
                        const ipcDelMes = ipcMensual.find(i => i.año === ipcAñoSeleccionado && i.mes === mesNum);
                        const esFuturo = new Date(ipcAñoSeleccionado, mesNum - 1) > new Date();

                        return (
                          <tr key={mesNum} className="border-b border-white/5 hover:bg-white/5">
                            <td className="p-4 font-medium">{mesNombre}</td>
                            <td className="p-4 text-right text-slate-400">
                              {ipcDelMes?.ipc_indec ? `${ipcDelMes.ipc_indec}%` : '-'}
                            </td>
                            <td className="p-4 text-right">
                              {ipcDelMes?.ipc_aplicado ? (
                                <span className="text-amber-400 font-medium">{ipcDelMes.ipc_aplicado}%</span>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-center">
                              {ipcDelMes?.aplicado ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs">
                                  <Check className="w-3 h-3" /> Aplicado
                                </span>
                              ) : esFuturo ? (
                                <span className="text-slate-500 text-xs">Futuro</span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs">
                                  Pendiente
                                </span>
                              )}
                            </td>
                            <td className="p-4 text-right text-slate-400">
                              {ipcDelMes?.eventos_afectados || '-'}
                            </td>
                            <td className="p-4 text-right">
                              {ipcDelMes?.total_ajustado ? (
                                <span className="text-amber-400">+${Math.round(ipcDelMes.total_ajustado).toLocaleString('es-AR')}</span>
                              ) : '-'}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-2">
                                {!ipcDelMes?.aplicado && !esFuturo && canCreate && (
                                  <button
                                    onClick={() => {
                                      setEditingIPC(null);
                                      setNuevoIPC({ mes: mesNum, ipc_indec: '', ipc_aplicado: '' });
                                      // Calcular preview
                                      const inicioMesIPC = new Date(ipcAñoSeleccionado, mesNum - 1, 1);
                                      const eventosConSaldo = cobranzasData.filter(e => {
                                        if (e.saldo <= 0) return false;
                                        const pagosDelEvento = e.pagos.filter(p => p.concepto === 'pago' || p.concepto === 'seña');
                                        if (pagosDelEvento.length === 0) return false;
                                        const primerPago = pagosDelEvento.reduce((min, p) =>
                                          new Date(p.fecha) < new Date(min.fecha) ? p : min
                                        );
                                        return new Date(primerPago.fecha) < inicioMesIPC;
                                      });
                                      setIpcPreview({
                                        eventos: eventosConSaldo.length,
                                        totalSaldos: eventosConSaldo.reduce((sum, e) => sum + e.saldo, 0),
                                        incremento: 0
                                      });
                                      setShowIPCModal(true);
                                    }}
                                    className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 text-sm font-medium"
                                  >
                                    Cargar IPC
                                  </button>
                                )}
                                {ipcDelMes && canCreate && (
                                  <button
                                    onClick={() => {
                                      setEditingIPC(ipcDelMes);
                                      setNuevoIPC({
                                        mes: mesNum,
                                        ipc_indec: String(ipcDelMes.ipc_indec || ''),
                                        ipc_aplicado: String(ipcDelMes.ipc_aplicado || '')
                                      });
                                      setShowIPCModal(true);
                                    }}
                                    className="p-1.5 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                                    title="Editar IPC"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                )}
                                {ipcDelMes && canCreate && (
                                  <button
                                    onClick={async () => {
                                      if (!confirm(`¿Eliminar registro de IPC de ${mesNombre} ${ipcAñoSeleccionado}?\n\nEsto NO elimina los pagos de ajuste ya creados.`)) return;
                                      await supabase
                                        .from('ipc_mensual')
                                        .delete()
                                        .eq('id', ipcDelMes.id);
                                      fetchIPCMensual();
                                    }}
                                    className="p-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30"
                                    title="Eliminar registro IPC"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Info */}
                <div className="glass rounded-xl p-4 text-sm text-slate-400">
                  <p><strong>Nota:</strong> El IPC se aplica sobre el saldo pendiente de cada evento con fecha posterior al mes seleccionado.
                  El IPC INDEC es de referencia, podés aplicar un porcentaje menor.</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Menús */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
            {/* Sub-tabs de Menús */}
            <div className="flex gap-3">
              <button
                onClick={() => setMenuTab('plantillas')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  menuTab === 'plantillas'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Plantillas de Menú
              </button>
              <button
                onClick={() => setMenuTab('catalogo')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  menuTab === 'catalogo'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Catálogo
              </button>
            </div>

            {/* Plantillas de Menú */}
            {menuTab === 'plantillas' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Plantillas de Menú</h2>
                  {canCreate && (
                    <button
                      onClick={() => {
                        resetNuevoMenu();
                        setShowMenuModal(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Nuevo Menú
                    </button>
                  )}
                </div>

                {menus.length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <UtensilsCrossed className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg">No hay menús creados</p>
                    <p className="text-slate-500 text-sm mt-2">Creá tu primer menú para usarlo en las cotizaciones</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {menus.map(menu => (
                      <div key={menu.id} className="glass rounded-2xl p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-lg font-bold text-white">{menu.nombre}</h3>
                          {canEdit && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleEditMenu(menu)}
                                className="p-2 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleDeleteMenu(menu.id)}
                                  className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {menu.categorias && menu.categorias.map((cat, idx) => (
                            cat.items && cat.items.length > 0 && (
                              <div key={idx} className="bg-white/5 rounded-xl p-4">
                                <h4 className="text-sm font-semibold text-purple-400 mb-2">{cat.nombre}</h4>
                                <ul className="space-y-1">
                                  {cat.items.map((item, itemIdx) => (
                                    <li key={itemIdx} className="text-sm text-slate-300">• {item}</li>
                                  ))}
                                </ul>
                              </div>
                            )
                          ))}
                        </div>

                        {menu.extras && menu.extras.length > 0 && (
                          <div className="mt-4 pt-4 border-t border-white/10">
                            <h4 className="text-sm font-semibold text-emerald-400 mb-2">Extras Opcionales</h4>
                            <div className="flex flex-wrap gap-2">
                              {menu.extras.map((extra, idx) => (
                                <span key={idx} className="px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-sm">
                                  {extra}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* Catálogo de Platos y Bebidas */}
            {menuTab === 'catalogo' && (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Catálogo de Platos y Bebidas</h2>
                  {canCreate && (
                    <button
                      onClick={() => {
                        setCatalogoForm({ nombre: '', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' });
                        setEditingCatalogoItem(null);
                        setShowCatalogoForm(true);
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                    >
                      <Plus className="w-5 h-5" />
                      Agregar Item
                    </button>
                  )}
                </div>

                {/* Buscador */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={catalogoBusqueda}
                    onChange={(e) => setCatalogoBusqueda(e.target.value)}
                    placeholder="Buscar por nombre, categoría..."
                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none text-sm"
                  />
                </div>

                {/* Filtros */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => { setCatalogoFiltro('todos'); setCatalogoSubfiltro('todos'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      catalogoFiltro === 'todos'
                        ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => { setCatalogoFiltro('Platos'); setCatalogoSubfiltro('todos'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      catalogoFiltro === 'Platos'
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Platos
                  </button>
                  <button
                    onClick={() => { setCatalogoFiltro('Tapas'); setCatalogoSubfiltro('todos'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      catalogoFiltro === 'Tapas'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Tapas
                  </button>
                  <button
                    onClick={() => { setCatalogoFiltro('Islas'); setCatalogoSubfiltro('todos'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      catalogoFiltro === 'Islas'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Islas
                  </button>
                  <button
                    onClick={() => { setCatalogoFiltro('Bebidas'); setCatalogoSubfiltro('todos'); }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      catalogoFiltro === 'Bebidas'
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    Bebidas
                  </button>
                </div>

                {/* Subfiltros por subcategoría */}
                {catalogoFiltro !== 'todos' && SUBCATEGORIAS_CATALOGO[catalogoFiltro] && (
                  <div className="flex gap-1.5 flex-wrap mt-2">
                    <button
                      onClick={() => setCatalogoSubfiltro('todos')}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                        catalogoSubfiltro === 'todos'
                          ? 'bg-white/20 text-white'
                          : 'bg-white/5 text-slate-500 hover:bg-white/10'
                      }`}
                    >
                      Todos
                    </button>
                    {SUBCATEGORIAS_CATALOGO[catalogoFiltro].map(sub => (
                      <button
                        key={sub}
                        onClick={() => setCatalogoSubfiltro(sub)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                          catalogoSubfiltro === sub
                            ? 'bg-white/20 text-white'
                            : 'bg-white/5 text-slate-500 hover:bg-white/10'
                        }`}
                      >
                        {sub}
                      </button>
                    ))}
                  </div>
                )}

                {/* Lista de items */}
                {catalogoItems.filter(item => {
                  const matchCategoria = catalogoFiltro === 'todos' || item.categoria === catalogoFiltro;
                  const matchSubcategoria = catalogoSubfiltro === 'todos' || item.subcategoria === catalogoSubfiltro;
                  const matchBusqueda = !catalogoBusqueda ||
                    item.nombre.toLowerCase().includes(catalogoBusqueda.toLowerCase()) ||
                    item.subcategoria.toLowerCase().includes(catalogoBusqueda.toLowerCase()) ||
                    (item.descripcion && item.descripcion.toLowerCase().includes(catalogoBusqueda.toLowerCase()));
                  return matchCategoria && matchSubcategoria && matchBusqueda;
                }).length === 0 ? (
                  <div className="glass rounded-2xl p-12 text-center">
                    <FileText className="w-16 h-16 mx-auto text-slate-600 mb-4" />
                    <p className="text-slate-400 text-lg">{catalogoBusqueda ? 'No se encontraron resultados' : 'No hay items en el catálogo'}</p>
                    <p className="text-slate-500 text-sm mt-2">{catalogoBusqueda ? 'Probá con otro término de búsqueda' : 'Agregá platos y bebidas para usarlos en los presupuestos'}</p>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {Object.entries(
                      catalogoItems
                        .filter(item => {
                          const matchCategoria = catalogoFiltro === 'todos' || item.categoria === catalogoFiltro;
                          const matchSubcategoria = catalogoSubfiltro === 'todos' || item.subcategoria === catalogoSubfiltro;
                          const matchBusqueda = !catalogoBusqueda ||
                            item.nombre.toLowerCase().includes(catalogoBusqueda.toLowerCase()) ||
                            item.subcategoria.toLowerCase().includes(catalogoBusqueda.toLowerCase()) ||
                            (item.descripcion && item.descripcion.toLowerCase().includes(catalogoBusqueda.toLowerCase()));
                          return matchCategoria && matchSubcategoria && matchBusqueda;
                        })
                        .reduce((acc, item) => {
                          const key = `${item.categoria} - ${item.subcategoria}`;
                          if (!acc[key]) acc[key] = [];
                          acc[key].push(item);
                          return acc;
                        }, {})
                    ).map(([grupo, items]) => (
                      <div key={grupo} className="glass rounded-2xl p-4">
                        <h3 className="text-sm font-bold text-purple-400 mb-2">{grupo}</h3>
                        <div className="space-y-1">
                          {items.map(item => (
                            <div key={item.id} className="flex items-center justify-between py-1.5 px-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all">
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-white">{item.nombre}</span>
                                {item.descripcion && (
                                  <span className="text-xs text-slate-500 ml-2">- {item.descripcion}</span>
                                )}
                              </div>
                              {canEdit && (
                                <div className="flex gap-1 ml-2">
                                  <button
                                    onClick={() => {
                                      setCatalogoForm({
                                        nombre: item.nombre,
                                        descripcion: item.descripcion || '',
                                        categoria: item.categoria,
                                        subcategoria: item.subcategoria
                                      });
                                      setEditingCatalogoItem(item.id);
                                      setShowCatalogoForm(true);
                                    }}
                                    className="p-1 rounded bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 transition-all"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                  </button>
                                  {canDelete && (
                                    <button
                                      onClick={() => {
                                        if (confirm('¿Eliminar este item del catálogo?')) {
                                          const updated = catalogoItems.filter(i => i.id !== item.id);
                                          setCatalogoItems(updated);
                                          localStorage.setItem('catalogoItems', JSON.stringify(updated));
                                        }
                                      }}
                                      className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* Modal Catálogo Form */}
        {showCatalogoForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">
                  {editingCatalogoItem ? 'Editar Item' : 'Nuevo Item'}
                </h3>
                <button
                  onClick={() => setShowCatalogoForm(false)}
                  className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={catalogoForm.nombre}
                    onChange={(e) => setCatalogoForm({ ...catalogoForm, nombre: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                    placeholder="Ej: Risotto de Mariscos"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Descripción</label>
                  <textarea
                    value={catalogoForm.descripcion}
                    onChange={(e) => setCatalogoForm({ ...catalogoForm, descripcion: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none resize-none"
                    rows={3}
                    placeholder="Descripción opcional del plato o bebida"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Categoría</label>
                  <select
                    value={catalogoForm.categoria}
                    onChange={(e) => {
                      const newCat = e.target.value;
                      setCatalogoForm({
                        ...catalogoForm,
                        categoria: newCat,
                        subcategoria: SUBCATEGORIAS_CATALOGO[newCat][0]
                      });
                    }}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                  >
                    {CATEGORIAS_CATALOGO.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Subcategoría</label>
                  <select
                    value={catalogoForm.subcategoria}
                    onChange={(e) => setCatalogoForm({ ...catalogoForm, subcategoria: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 focus:border-purple-500 focus:outline-none"
                  >
                    {SUBCATEGORIAS_CATALOGO[catalogoForm.categoria].map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={() => {
                    if (!catalogoForm.nombre.trim()) {
                      alert('El nombre es obligatorio');
                      return;
                    }

                    let updated;
                    if (editingCatalogoItem) {
                      updated = catalogoItems.map(item =>
                        item.id === editingCatalogoItem
                          ? { ...item, ...catalogoForm }
                          : item
                      );
                    } else {
                      const newItem = {
                        id: Date.now(),
                        ...catalogoForm
                      };
                      updated = [...catalogoItems, newItem];
                    }

                    setCatalogoItems(updated);
                    localStorage.setItem('catalogoItems', JSON.stringify(updated));
                    setShowCatalogoForm(false);
                    // Limpiar búsqueda y cambiar filtro a la categoría/subcategoría del item agregado/editado
                    setCatalogoBusqueda('');
                    setCatalogoFiltro(catalogoForm.categoria);
                    setCatalogoSubfiltro(catalogoForm.subcategoria);
                    setCatalogoForm({ nombre: '', descripcion: '', categoria: 'Platos', subcategoria: 'Entradas' });
                    setEditingCatalogoItem(null);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  {editingCatalogoItem ? 'Guardar Cambios' : 'Agregar al Catálogo'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Informes */}
        {activeTab === 'informes' && (
          <div className="space-y-6">
            <h2 className="text-xl font-bold">Informes</h2>

            {/* Selector de informe */}
            <div className="flex gap-3">
              <button
                onClick={() => setInformeActivo('eliminados')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  informeActivo === 'eliminados'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Eliminados
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-500/30">
                  {auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').length + auditoriaEventos.length + auditoriaCaja.length}
                </span>
              </button>
              <button
                onClick={() => setInformeActivo('modificados')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  informeActivo === 'modificados'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Modificados
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-500/30">
                  {auditoriaPagos.filter(r => r.tipo_accion === 'MODIFICADO').length}
                </span>
              </button>
              <button
                onClick={() => setInformeActivo('estadisticas')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  informeActivo === 'estadisticas'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Estadísticas
              </button>
            </div>

            {/* Eliminados (todos) */}
            {informeActivo === 'eliminados' && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Eliminados</h3>
                {(auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').length + auditoriaEventos.length + auditoriaCaja.length) === 0 ? (
                  <p className="text-center text-slate-500 py-4">No hay registros eliminados</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {/* Pagos eliminados */}
                    {auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').map((registro) => (
                      <div key={`pago-${registro.id}`} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-green-500/30 text-green-400">COBRANZAS</span>
                          <span className="text-xs text-slate-400">{new Date(registro.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white font-medium">{registro.cliente}</p>
                        <p className="text-sm text-slate-300">Monto: <span className="text-red-400 font-medium">{formatCurrency(registro.monto_original)}</span></p>
                        <p className="text-sm text-slate-500"><span className="font-medium">Motivo:</span> {registro.motivo}</p>
                      </div>
                    ))}
                    {/* Eventos anulados */}
                    {auditoriaEventos.map((registro) => (
                      <div key={`evento-${registro.id}`} className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded text-xs bg-purple-500/30 text-purple-400">EVENTO</span>
                          <span className="text-xs text-slate-400">{new Date(registro.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white font-medium">{registro.cliente} - {formatDate(registro.fecha_evento)}</p>
                        <p className="text-sm text-slate-300">Tipo: {registro.tipo_evento}</p>
                        <p className="text-sm text-slate-500"><span className="font-medium">Motivo:</span> {registro.motivo}</p>
                        <button onClick={() => handleRegenerarEvento(registro)} className="mt-2 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                          Regenerar
                        </button>
                      </div>
                    ))}
                    {/* Caja eliminados */}
                    {auditoriaCaja.map((registro) => (
                      <div key={`caja-${registro.id}`} className={`p-4 rounded-xl border ${
                        registro.tipo_movimiento === 'ingreso' ? 'bg-green-500/10 border-green-500/30' :
                        registro.tipo_movimiento === 'egreso' ? 'bg-red-500/10 border-red-500/30' :
                        registro.tipo_movimiento === 'retiro' ? 'bg-yellow-500/10 border-yellow-500/30' :
                        'bg-blue-500/10 border-blue-500/30'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs ${
                            registro.tipo_movimiento === 'ingreso' ? 'bg-green-500/30 text-green-400' :
                            registro.tipo_movimiento === 'egreso' ? 'bg-red-500/30 text-red-400' :
                            registro.tipo_movimiento === 'retiro' ? 'bg-yellow-500/30 text-yellow-400' :
                            'bg-blue-500/30 text-blue-400'
                          }`}>CAJA - {registro.tipo_movimiento.toUpperCase()}</span>
                          <span className="text-xs text-slate-400">{new Date(registro.created_at).toLocaleString()}</span>
                        </div>
                        <p className="text-white font-medium">{registro.concepto}</p>
                        <p className="text-sm text-slate-300">Monto: <span className="text-cyan-400 font-medium">${(registro.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span>
                          {registro.persona && <span className="ml-2">| {registro.persona}</span>}
                        </p>
                        <p className="text-sm text-slate-500"><span className="font-medium">Motivo:</span> {registro.motivo}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Pagos Modificados */}
            {informeActivo === 'modificados' && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-amber-400">Pagos Modificados</h3>
                {auditoriaPagos.filter(r => r.tipo_accion === 'MODIFICADO').length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No hay pagos modificados</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {auditoriaPagos.filter(r => r.tipo_accion === 'MODIFICADO').map((registro) => (
                      <div key={registro.id} className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{registro.cliente}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(registro.created_at).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>Monto nuevo: <span className="text-amber-400 font-medium">{formatCurrency(registro.monto_nuevo)}</span></p>
                          {registro.concepto_nuevo && (
                            <p>Concepto: {registro.concepto_nuevo}</p>
                          )}
                          <p className="text-slate-500 mt-2">
                            <span className="font-medium">Motivo:</span> {registro.motivo}
                          </p>
                          <p className="text-slate-500">
                            <span className="font-medium">Usuario:</span> {registro.usuario}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Estadísticas */}
            {informeActivo === 'estadisticas' && (() => {
              // Calcular estadísticas
              const eventosRealizados = eventos.filter(e => e.estado === 'realizado' || new Date(e.fecha) < new Date());
              const eventosFuturos = eventos.filter(e => e.estado !== 'realizado' && new Date(e.fecha) >= new Date());

              const totalAdultos = eventos.reduce((sum, e) => sum + (e.adultos || 0), 0);
              const totalMenores = eventos.reduce((sum, e) => sum + (e.menores || 0), 0);
              const totalComensales = totalAdultos + totalMenores;
              const promedioComensales = eventos.length > 0 ? Math.round(totalComensales / eventos.length) : 0;

              // Tipos de evento
              const tiposEvento = {};
              eventos.forEach(e => {
                const tipo = e.tipo_evento || 'Sin especificar';
                tiposEvento[tipo] = (tiposEvento[tipo] || 0) + 1;
              });
              const tiposOrdenados = Object.entries(tiposEvento).sort((a, b) => b[1] - a[1]);

              // Tipos de menú
              const tiposMenu = {};
              eventos.forEach(e => {
                const menu = e.menu || 'Sin especificar';
                tiposMenu[menu] = (tiposMenu[menu] || 0) + 1;
              });
              const menusOrdenados = Object.entries(tiposMenu).sort((a, b) => b[1] - a[1]);

              // Salones
              const salones = {};
              eventos.forEach(e => {
                const salon = e.salon || 'Sin especificar';
                salones[salon] = (salones[salon] || 0) + 1;
              });
              const salonesOrdenados = Object.entries(salones).sort((a, b) => b[1] - a[1]);

              // Vendedores
              const vendedores = {};
              eventos.forEach(e => {
                const vendedor = e.vendedor || 'Sin especificar';
                vendedores[vendedor] = (vendedores[vendedor] || 0) + 1;
              });
              const vendedoresOrdenados = Object.entries(vendedores).sort((a, b) => b[1] - a[1]);

              // Turnos
              const turnos = {};
              eventos.forEach(e => {
                const turno = e.turno || 'Sin especificar';
                turnos[turno] = (turnos[turno] || 0) + 1;
              });
              const turnosOrdenados = Object.entries(turnos).sort((a, b) => b[1] - a[1]);

              // Facturación
              const facturacionTotal = eventos.reduce((sum, e) => sum + (e.total_evento || 0), 0);
              const facturacionPromedio = eventos.length > 0 ? facturacionTotal / eventos.length : 0;

              // Eventos por mes (últimos 12 meses)
              const eventosPorMes = {};
              const ahora = new Date();
              for (let i = 11; i >= 0; i--) {
                const fecha = new Date(ahora.getFullYear(), ahora.getMonth() - i, 1);
                const key = fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
                eventosPorMes[key] = 0;
              }
              eventos.forEach(e => {
                const fecha = new Date(e.fecha);
                const key = fecha.toLocaleDateString('es-AR', { month: 'short', year: '2-digit' });
                if (eventosPorMes[key] !== undefined) {
                  eventosPorMes[key]++;
                }
              });

              // Precio promedio por persona
              const preciosAdulto = eventos.filter(e => e.precio_adulto > 0).map(e => e.precio_adulto);
              const precioPromedioAdulto = preciosAdulto.length > 0
                ? preciosAdulto.reduce((a, b) => a + b, 0) / preciosAdulto.length
                : 0;

              return (
                <div className="space-y-6">
                  {/* Resumen General */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-emerald-400">{eventos.length}</p>
                      <p className="text-sm text-slate-400">Total Eventos</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-blue-400">{formatNumber(totalComensales)}</p>
                      <p className="text-sm text-slate-400">Total Comensales</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-purple-400">{promedioComensales}</p>
                      <p className="text-sm text-slate-400">Promedio x Evento</p>
                    </div>
                    <div className="glass rounded-xl p-4 text-center">
                      <p className="text-3xl font-bold text-amber-400">{displayPrice(facturacionTotal)}</p>
                      <p className="text-sm text-slate-400">Facturación Total</p>
                    </div>
                  </div>

                  {/* Detalle Comensales */}
                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-emerald-400">Detalle de Comensales</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{formatNumber(totalAdultos)}</p>
                        <p className="text-sm text-slate-400">Adultos</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{formatNumber(totalMenores)}</p>
                        <p className="text-sm text-slate-400">Menores</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{formatCurrency(precioPromedioAdulto)}</p>
                        <p className="text-sm text-slate-400">Precio Prom. Adulto</p>
                      </div>
                      <div className="bg-white/5 rounded-xl p-4">
                        <p className="text-2xl font-bold text-white">{formatCurrency(facturacionPromedio)}</p>
                        <p className="text-sm text-slate-400">Facturación Prom.</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Tipos de Evento */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-lg font-semibold mb-4 text-blue-400">Tipos de Evento</h3>
                      <div className="space-y-3">
                        {tiposOrdenados.map(([tipo, cantidad]) => (
                          <div key={tipo} className="flex items-center justify-between">
                            <span className="text-slate-300">{tipo}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-blue-500 h-2 rounded-full"
                                  style={{ width: `${(cantidad / eventos.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-white font-medium w-8 text-right">{cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Tipos de Menú */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-lg font-semibold mb-4 text-purple-400">Tipos de Menú</h3>
                      <div className="space-y-3">
                        {menusOrdenados.map(([menu, cantidad]) => (
                          <div key={menu} className="flex items-center justify-between">
                            <span className="text-slate-300">{menu}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-purple-500 h-2 rounded-full"
                                  style={{ width: `${(cantidad / eventos.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-white font-medium w-8 text-right">{cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Salones */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-lg font-semibold mb-4 text-amber-400">Salones</h3>
                      <div className="space-y-3">
                        {salonesOrdenados.map(([salon, cantidad]) => (
                          <div key={salon} className="flex items-center justify-between">
                            <span className="text-slate-300">{salon}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-amber-500 h-2 rounded-full"
                                  style={{ width: `${(cantidad / eventos.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-white font-medium w-8 text-right">{cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Turnos */}
                    <div className="glass rounded-2xl p-5">
                      <h3 className="text-lg font-semibold mb-4 text-rose-400">Turnos</h3>
                      <div className="space-y-3">
                        {turnosOrdenados.map(([turno, cantidad]) => (
                          <div key={turno} className="flex items-center justify-between">
                            <span className="text-slate-300">{turno}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-32 bg-white/10 rounded-full h-2">
                                <div
                                  className="bg-rose-500 h-2 rounded-full"
                                  style={{ width: `${(cantidad / eventos.length) * 100}%` }}
                                />
                              </div>
                              <span className="text-white font-medium w-8 text-right">{cantidad}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Vendedores */}
                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-cyan-400">Eventos por Vendedor</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {vendedoresOrdenados.map(([vendedor, cantidad]) => (
                        <div key={vendedor} className="bg-white/5 rounded-xl p-4 text-center">
                          <p className="text-2xl font-bold text-cyan-400">{cantidad}</p>
                          <p className="text-sm text-slate-400">{vendedor}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Eventos por Mes */}
                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-indigo-400">Eventos por Mes (últimos 12 meses)</h3>
                    <div className="flex items-end justify-between gap-2 h-40">
                      {Object.entries(eventosPorMes).map(([mes, cantidad]) => {
                        const maxCantidad = Math.max(...Object.values(eventosPorMes), 1);
                        const altura = (cantidad / maxCantidad) * 100;
                        return (
                          <div key={mes} className="flex-1 flex flex-col items-center gap-1">
                            <span className="text-xs text-white font-medium">{cantidad}</span>
                            <div
                              className="w-full bg-indigo-500 rounded-t-lg transition-all"
                              style={{ height: `${Math.max(altura, 5)}%` }}
                            />
                            <span className="text-xs text-slate-500 rotate-45 origin-left">{mes}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Estado de Eventos */}
                  <div className="glass rounded-2xl p-5">
                    <h3 className="text-lg font-semibold mb-4 text-teal-400">Estado de Eventos</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-emerald-400">{eventosRealizados.length}</p>
                        <p className="text-sm text-slate-400">Realizados</p>
                      </div>
                      <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-blue-400">{eventosFuturos.length}</p>
                        <p className="text-sm text-slate-400">Próximos</p>
                      </div>
                      <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-amber-400">{eventos.filter(e => e.estado === 'pendiente').length}</p>
                        <p className="text-sm text-slate-400">Pendientes Pago</p>
                      </div>
                      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-center">
                        <p className="text-2xl font-bold text-red-400">{auditoriaEventos.length}</p>
                        <p className="text-sm text-slate-400">Anulados</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* Agenda de Contactos */}
        {activeTab === 'agenda' && (() => {
          // Enriquecer clientes con estadísticas de eventos
          const contactosEnriquecidos = clientes.map(cliente => {
            const eventosCliente = eventos.filter(e =>
              e.cliente?.toLowerCase().trim() === cliente.nombre?.toLowerCase().trim()
            );
            const ultimoEvento = eventosCliente.length > 0
              ? eventosCliente.sort((a, b) => b.fecha?.localeCompare(a.fecha))[0]
              : null;
            return {
              ...cliente,
              cantidadEventos: eventosCliente.length,
              ultimoEvento: ultimoEvento?.fecha || null,
              tipoEvento: ultimoEvento?.tipo_evento || null
            };
          });

          const contactosFiltrados = contactosEnriquecidos.filter(c =>
            c.nombre?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
            c.telefono?.includes(busquedaContacto) ||
            c.email?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
            c.observacion1?.toLowerCase().includes(busquedaContacto.toLowerCase()) ||
            c.observacion2?.toLowerCase().includes(busquedaContacto.toLowerCase())
          );

          // Agrupar por letra inicial
          const contactosPorLetra = {};
          contactosFiltrados.forEach(c => {
            const letra = c.nombre?.charAt(0).toUpperCase() || '#';
            if (!contactosPorLetra[letra]) {
              contactosPorLetra[letra] = [];
            }
            contactosPorLetra[letra].push(c);
          });

          const handleGuardarContactoLocal = async () => {
            if (editingContacto) {
              await handleGuardarCliente(editingContacto);
              setShowContactoModal(false);
              setEditingContacto(null);
            }
          };

          return (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold flex items-center gap-3">
                  <Contact className="w-6 h-6 text-emerald-400" />
                  Agenda de Contactos
                </h2>
                <div className="flex items-center gap-3">
                  <span className="text-slate-400">{clientes.length} contactos</span>
                  <button
                    onClick={() => {
                      setEditingContacto({ nombre: '', telefono: '', email: '', observacion1: '', observacion2: '' });
                      setShowContactoModal(true);
                    }}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-600 text-white text-sm hover:bg-emerald-700 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    Nuevo
                  </button>
                </div>
              </div>

              {/* Buscador */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por nombre, teléfono, email u observaciones..."
                  value={busquedaContacto}
                  onChange={(e) => setBusquedaContacto(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>

              {/* Lista de contactos */}
              <div className="glass rounded-2xl p-5 max-h-[600px] overflow-y-auto scrollbar-thin">
                {Object.keys(contactosPorLetra).length === 0 ? (
                  <p className="text-center text-slate-500 py-8">No se encontraron contactos</p>
                ) : (
                  Object.keys(contactosPorLetra).sort().map(letra => (
                    <div key={letra} className="mb-6">
                      <div className="sticky top-0 bg-slate-900/90 backdrop-blur-sm py-2 mb-3">
                        <span className="text-lg font-bold text-emerald-400">{letra}</span>
                      </div>
                      <div className="space-y-2">
                        {contactosPorLetra[letra].map((contacto, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-all border border-white/5"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                                {contacto.nombre.charAt(0).toUpperCase()}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="font-medium text-white">{contacto.nombre}</p>
                                <div className="flex items-center gap-4 mt-1 flex-wrap">
                                  {contacto.telefono && (
                                    <a
                                      href={`tel:${contacto.telefono}`}
                                      className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                                    >
                                      <Phone className="w-3.5 h-3.5" />
                                      {contacto.telefono}
                                    </a>
                                  )}
                                  {contacto.email && (
                                    <a
                                      href={`mailto:${contacto.email}`}
                                      className="flex items-center gap-1 text-sm text-slate-400 hover:text-emerald-400 transition-colors"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                      {contacto.email}
                                    </a>
                                  )}
                                </div>
                                {(contacto.observacion1 || contacto.observacion2) && (
                                  <div className="mt-2 space-y-1">
                                    {contacto.observacion1 && (
                                      <p className="text-xs text-amber-400/80 bg-amber-500/10 px-2 py-1 rounded inline-block mr-2">
                                        {contacto.observacion1}
                                      </p>
                                    )}
                                    {contacto.observacion2 && (
                                      <p className="text-xs text-blue-400/80 bg-blue-500/10 px-2 py-1 rounded inline-block">
                                        {contacto.observacion2}
                                      </p>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                {contacto.cantidadEventos > 0 && (
                                  <>
                                    <span className="inline-block px-2 py-1 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                                      {contacto.cantidadEventos} {contacto.cantidadEventos === 1 ? 'evento' : 'eventos'}
                                    </span>
                                    {contacto.ultimoEvento && (
                                      <p className="text-xs text-slate-500 mt-1">
                                        Último: {formatDate(contacto.ultimoEvento)}
                                      </p>
                                    )}
                                  </>
                                )}
                                <p className="text-xs text-cyan-400/70 mt-1 font-mono">
                                  ID: {contacto.id?.slice(0, 8)}
                                </p>
                              </div>
                              <button
                                onClick={() => {
                                  setEditingContacto({ ...contacto });
                                  setShowContactoModal(true);
                                }}
                                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-emerald-400 transition-all"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Acciones rápidas */}
              <div className="glass rounded-2xl p-5">
                <h3 className="text-sm font-medium text-slate-400 mb-3">Acciones rápidas</h3>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => {
                      const csv = ['ID,Nombre,Teléfono,Email,Observación 1,Observación 2,Cantidad Eventos,Último Evento']
                        .concat(contactosEnriquecidos.map(c =>
                          `"${c.id}","${c.nombre}","${c.telefono || ''}","${c.email || ''}","${c.observacion1 || ''}","${c.observacion2 || ''}",${c.cantidadEventos},"${c.ultimoEvento || ''}"`
                        ))
                        .join('\n');
                      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = 'contactos_tero.csv';
                      link.click();
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    Exportar CSV
                  </button>
                  <button
                    onClick={sincronizarContactos}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 hover:bg-purple-500/30 transition-all"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Importar de Eventos
                  </button>
                </div>
              </div>

              {/* Modal de edición de contacto */}
              {showContactoModal && editingContacto && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                  <div className="glass rounded-2xl w-full max-w-md p-6 space-y-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold">Editar Contacto</h3>
                      <button
                        onClick={() => {
                          setShowContactoModal(false);
                          setEditingContacto(null);
                        }}
                        className="p-2 rounded-lg hover:bg-white/10 transition-all"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                        <input
                          type="text"
                          value={editingContacto.nombre}
                          onChange={(e) => setEditingContacto({ ...editingContacto, nombre: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                        <input
                          type="tel"
                          value={editingContacto.telefono}
                          onChange={(e) => setEditingContacto({ ...editingContacto, telefono: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Email</label>
                        <input
                          type="email"
                          value={editingContacto.email}
                          onChange={(e) => setEditingContacto({ ...editingContacto, email: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-emerald-500/50"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Observación 1</label>
                        <textarea
                          value={editingContacto.observacion1 || ''}
                          onChange={(e) => setEditingContacto({ ...editingContacto, observacion1: e.target.value })}
                          rows={2}
                          placeholder="Ej: Cliente VIP, prefiere salón terraza..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                      </div>

                      <div>
                        <label className="block text-sm text-slate-400 mb-1">Observación 2</label>
                        <textarea
                          value={editingContacto.observacion2 || ''}
                          onChange={(e) => setEditingContacto({ ...editingContacto, observacion2: e.target.value })}
                          rows={2}
                          placeholder="Ej: Alérgico a mariscos, pagador puntual..."
                          className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/50 resize-none"
                        />
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => {
                          setShowContactoModal(false);
                          setEditingContacto(null);
                        }}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-slate-300 hover:bg-white/10 transition-all"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleGuardarContactoLocal}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-medium"
                      >
                        Guardar
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })()}

        {/* Usuarios (solo admin) */}
        {activeTab === 'usuarios' && userRole === 'admin' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">Administrar Usuarios</h2>
              <button
                onClick={() => setShowUserModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
              >
                <Plus className="w-5 h-5" />
                Nuevo Usuario
              </button>
            </div>

            <div className="glass rounded-2xl p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/5">
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300">Nombre</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300">Email</th>
                      <th className="text-center px-5 py-4 text-sm font-medium text-slate-300">Rol</th>
                      <th className="text-center px-5 py-4 text-sm font-medium text-slate-300">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usuarios.map((usuario) => (
                      <tr key={usuario.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-5 py-4 font-medium">{usuario.nombre || '-'}</td>
                        <td className="px-5 py-4 text-slate-400">{usuario.email}</td>
                        <td className="px-5 py-4 text-center">
                          <select
                            value={usuario.rol}
                            onChange={(e) => handleUpdateUserRole(usuario.id, e.target.value)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium border-0 cursor-pointer ${
                              usuario.rol === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                              usuario.rol === 'vendedor' ? 'bg-blue-500/20 text-blue-300' :
                              'bg-slate-500/20 text-slate-300'
                            }`}
                          >
                            <option value="admin" className="bg-slate-900">Admin</option>
                            <option value="vendedor" className="bg-slate-900">Vendedor</option>
                            <option value="lectura" className="bg-slate-900">Lectura</option>
                          </select>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => {
                                setEditingUsuario(usuario);
                                setNuevoUsuario({
                                  email: usuario.email,
                                  password: '',
                                  password2: '',
                                  nombre: usuario.nombre || '',
                                  rol: usuario.rol || 'lectura',
                                  tabs_permitidas: usuario.tabs_permitidas || ['dashboard', 'calendario', 'eventos', 'proximos'],
                                  ver_precios: usuario.ver_precios !== false
                                });
                                setShowUserModal(true);
                              }}
                              className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                              title="Editar usuario"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteUser(usuario)}
                              className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {usuarios.length === 0 && (
                  <p className="text-center text-slate-400 py-8">No hay usuarios registrados</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* CAJA */}
        {activeTab === 'caja' && cajaDesbloqueada && (
          <div className="space-y-6">
            {/* Resumen Fijo Arriba */}
            <div className="glass rounded-xl p-3">
              <div className="grid grid-cols-6 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400">Ingresos Efectivo</p>
                  <p className="text-lg font-bold text-green-400">${cajaMovimientos.filter(m => m.tipo === 'ingreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Ingresos Banco</p>
                  <p className="text-lg font-bold text-cyan-400">${cajaMovimientos.filter(m => m.tipo === 'ingreso_banco').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Egresos</p>
                  <p className="text-lg font-bold text-red-400">${cajaMovimientos.filter(m => m.tipo === 'egreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Retiros Socios</p>
                  <p className="text-lg font-bold text-yellow-400">${cajaMovimientos.filter(m => m.tipo === 'retiro').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Saldo Caja $</p>
                  {(() => {
                    const ingresos = cajaMovimientos.filter(m => m.tipo === 'ingreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                    const egresos = cajaMovimientos.filter(m => m.tipo === 'egreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                    const saldo = ingresos - egresos;
                    return <p className={`text-lg font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>${saldo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</p>;
                  })()}
                </div>
                <div>
                  <p className="text-xs text-slate-400">USD (ref.)</p>
                  <p className="text-lg font-bold text-blue-400">
                    {cajaMovimientos.filter(m => (m.tipo === 'ingreso' || m.tipo === 'ingreso_banco') && m.monto_dolares > 0).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  </p>
                </div>
              </div>
            </div>

            {/* Dinero por Caja + TC */}
            <div className="glass rounded-xl p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400 mb-2">Dinero por caja (ingresos - egresos - retiros)</p>
                  <div className="flex flex-wrap gap-4">
                    {CAJAS.map(caja => {
                      const ingresos = cajaMovimientos.filter(m => m.tipo === 'ingreso' && m.persona === caja).reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                      const egresos = cajaMovimientos.filter(m => m.tipo === 'egreso' && m.persona === caja).reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                      const retiros = cajaMovimientos.filter(m => m.tipo === 'retiro' && m.persona === caja).reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                      const saldo = ingresos - egresos - retiros;
                      return (
                        <div key={caja} className="bg-white/5 rounded-lg px-3 py-2 min-w-[100px] text-center">
                          <p className="text-xs text-slate-400">{caja}</p>
                          <p className={`text-sm font-bold ${saldo >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            ${saldo.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl px-4 py-3 text-center">
                  <p className="text-xs text-slate-400 flex items-center justify-center gap-1 mb-1">
                    TC Blue
                    <button onClick={fetchTipoCambio} className="text-blue-400 hover:text-blue-300" title="Actualizar TC">
                      {tcLoading ? '...' : '↻'}
                    </button>
                  </p>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg font-bold text-blue-400">$</span>
                    <input
                      type="text"
                      value={formatNumberInput(tipoCambio)}
                      onChange={(e) => setTipoCambio(parseFloat(parseNumberInput(e.target.value)) || 0)}
                      className="w-24 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-blue-400 text-lg font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 items-center flex-wrap">
              <button
                onClick={() => setCajaTab('ingresos')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'ingresos'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Ingresos Efectivo
              </button>
              <button
                onClick={() => setCajaTab('banco')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'banco'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Banco
              </button>
              <button
                onClick={() => setCajaTab('egresos')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'egresos'
                    ? 'bg-red-500/20 text-red-400 border border-red-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Egresos
              </button>
              <button
                onClick={() => setCajaTab('transferencias')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'transferencias'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Transferencias
              </button>
              <button
                onClick={() => setCajaTab('retiros')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'retiros'
                    ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Retiros
              </button>
            </div>

            {/* Modal Formulario de Transferencia */}
            {showTransferenciaForm && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  if (!transferenciaForm.origen || !transferenciaForm.destino || !transferenciaForm.monto_pesos) {
                    alert('Complete origen, destino y monto');
                    return;
                  }
                  if (transferenciaForm.origen === transferenciaForm.destino) {
                    alert('Origen y destino deben ser diferentes');
                    return;
                  }
                  const monto = parseFloat(transferenciaForm.monto_pesos) || 0;
                  if (monto <= 0) {
                    alert('El monto debe ser mayor a 0');
                    return;
                  }

                  // Si estamos editando, eliminar los registros antiguos primero
                  if (editingTransferencia) {
                    await supabase.from('caja_movimientos').delete().eq('id', editingTransferencia.ingresoId);
                    if (editingTransferencia.egresoId) {
                      await supabase.from('caja_movimientos').delete().eq('id', editingTransferencia.egresoId);
                    }
                  }

                  // Crear egreso del origen (quien aporta)
                  await supabase.from('caja_movimientos').insert({
                    tipo: 'egreso',
                    concepto: `Transferencia interna${transferenciaForm.observacion ? ' | ' + transferenciaForm.observacion : ''}`,
                    monto_pesos: monto,
                    persona: transferenciaForm.origen,
                    aportante: transferenciaForm.origen,
                    fecha: transferenciaForm.fecha
                  });

                  // Crear ingreso al destino (quien recibe)
                  await supabase.from('caja_movimientos').insert({
                    tipo: 'ingreso',
                    concepto: `Transferencia interna${transferenciaForm.observacion ? ' | ' + transferenciaForm.observacion : ''}`,
                    monto_pesos: monto,
                    persona: transferenciaForm.destino,
                    aportante: transferenciaForm.origen,
                    fecha: transferenciaForm.fecha
                  });

                  setTransferenciaForm({ fecha: new Date().toISOString().split('T')[0], origen: '', destino: '', monto_pesos: '', observacion: '' });
                  setEditingTransferencia(null);
                  setShowTransferenciaForm(false);
                  fetchCajaMovimientos();
                }} className="p-6 bg-slate-800 rounded-xl border border-purple-500/30 space-y-4 w-full max-w-md mx-4">
                <div className="flex items-center gap-2 mb-2">
                  <ArrowLeftRight className="w-5 h-5 text-purple-400" />
                  <span className="font-medium text-purple-400">{editingTransferencia ? 'Editar Transferencia' : 'Nueva Transferencia Interna'}</span>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-slate-400">Fecha</label>
                    <input
                      type="date"
                      value={transferenciaForm.fecha}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, fecha: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Origen (sale de)</label>
                    <select
                      value={transferenciaForm.origen}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, origen: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {CAJAS.filter(c => c !== transferenciaForm.destino).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Destino (va a)</label>
                    <select
                      value={transferenciaForm.destino}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, destino: e.target.value})}
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                      required
                    >
                      <option value="">Seleccionar...</option>
                      {CAJAS.filter(c => c !== transferenciaForm.origen).map(c => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Monto $</label>
                    <input
                      type="text"
                      value={formatNumberInput(transferenciaForm.monto_pesos)}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, monto_pesos: parseNumberInput(e.target.value)})}
                      placeholder="0"
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400">Observación</label>
                    <input
                      type="text"
                      value={transferenciaForm.observacion}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, observacion: e.target.value})}
                      placeholder="Opcional..."
                      className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransferenciaForm(false);
                      setTransferenciaForm({ fecha: new Date().toISOString().split('T')[0], origen: '', destino: '', monto_pesos: '', observacion: '' });
                    }}
                    className="px-4 py-2 rounded-lg bg-white/5 text-slate-400 hover:bg-white/10 text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-sm flex items-center gap-2"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    Transferir
                  </button>
                </div>
              </form>
              </div>
            )}

            {/* Contenido de Ingresos */}
            {cajaTab === 'ingresos' && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-green-400">Ingresos</h3>
                  <button
                    onClick={() => {
                      if (showCajaIngresoForm) {
                        setShowCajaIngresoForm(false);
                        setEditingCajaIngreso(null);
                        setCajaIngresoForm({ fecha: new Date().toISOString().split('T')[0], origen: '', cliente: '', observacion: '', receptor: '', monto_pesos: '', monto_dolares: '', cotizacion: '' });
                      } else {
                        setShowCajaIngresoForm(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 hover:bg-green-500/30 text-sm flex items-center gap-1"
                  >
                    {showCajaIngresoForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showCajaIngresoForm ? 'Cancelar' : 'Agregar'}
                  </button>
                </div>

                {/* Modal Formulario de Ingreso */}
                {showCajaIngresoForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const pesos = parseFloat(cajaIngresoForm.monto_pesos) || 0;
                      const dolares = parseFloat(cajaIngresoForm.monto_dolares) || 0;
                      const tc = parseFloat(cajaIngresoForm.cotizacion) || tipoCambio;
                      if (pesos === 0 && dolares === 0) { alert('Ingrese un monto'); return; }
                      if (!cajaIngresoForm.origen) { alert('Seleccione origen'); return; }
                      if (!cajaIngresoForm.receptor) { alert('Seleccione quién recibe'); return; }

                      // Construir concepto: Origen | Observación
                      let conceptoParts = [cajaIngresoForm.origen];
                      if (cajaIngresoForm.observacion) conceptoParts.push(cajaIngresoForm.observacion);
                      const conceptoFinal = conceptoParts.join(' | ');

                      const data = {
                        tipo: 'ingreso',
                        concepto: conceptoFinal,
                        monto_pesos: pesos + (dolares * tc),
                        monto_dolares: dolares || null,
                        cotizacion: dolares ? tc : null,
                        persona: cajaIngresoForm.receptor,
                        fecha: cajaIngresoForm.fecha
                      };

                      if (editingCajaIngreso) {
                        await supabase.from('caja_movimientos').update(data).eq('id', editingCajaIngreso);
                      } else {
                        await supabase.from('caja_movimientos').insert(data);
                      }

                      setCajaIngresoForm({ fecha: new Date().toISOString().split('T')[0], origen: '', observacion: '', receptor: '', monto_pesos: '', monto_dolares: '', cotizacion: '' });
                      setShowCajaIngresoForm(false);
                      setEditingCajaIngreso(null);
                      fetchCajaMovimientos();
                    }} className="p-6 bg-slate-800 rounded-xl border border-green-500/30 space-y-4 w-full max-w-lg mx-4">
                    {editingCajaIngreso && (
                      <div className="text-xs text-yellow-400 mb-2">Editando ingreso...</div>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Fecha *</label>
                        <input
                          type="date"
                          value={cajaIngresoForm.fecha}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, fecha: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Origen *</label>
                        <select
                          value={cajaIngresoForm.origen}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, origen: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {CONCEPTOS_INGRESO.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Observaciones</label>
                        <input
                          type="text"
                          value={cajaIngresoForm.observacion}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, observacion: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="Detalle opcional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Recibido por *</label>
                        <select
                          value={cajaIngresoForm.receptor}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, receptor: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {COBRADORES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto Pesos</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaIngresoForm.monto_pesos)}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, monto_pesos: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto USD</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaIngresoForm.monto_dolares)}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, monto_dolares: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo Cambio {cajaIngresoForm.monto_dolares ? '*' : ''}</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaIngresoForm.cotizacion)}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, cotizacion: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder={tipoCambio.toString()}
                        />
                      </div>
                    </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowCajaIngresoForm(false); setEditingCajaIngreso(null); setCajaIngresoForm({ fecha: new Date().toISOString().split('T')[0], origen: '', cliente: '', observacion: '', receptor: '', monto_pesos: '', monto_dolares: '', cotizacion: '' }); }} className="px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700">
                          Cancelar
                        </button>
                        <button type="submit" className="px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-medium hover:bg-green-600">
                          {editingCajaIngreso ? 'Actualizar' : 'Guardar'} Ingreso
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs">
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Origen</th>
                        <th className="text-left py-2 px-3">Cliente</th>
                        <th className="text-left py-2 px-3">Observaciones</th>
                        <th className="text-left py-2 px-3">Recibido por</th>
                        <th className="text-right py-2 px-3">Pesos</th>
                        <th className="text-right py-2 px-3">USD</th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).map(item => {
                        // Si tiene evento_id, viene de la sección de Eventos (cobranza)
                        const esDeEvento = !!item.evento_id;
                        const partes = (item.concepto || '').split(' | ');
                        const origen = esDeEvento ? 'Evento' : (partes[0] || '');
                        // Cliente: solo si viene de eventos
                        const cliente = esDeEvento ? item.concepto : '';
                        // Observaciones: solo si es ingreso manual (partes[1])
                        const observacion = esDeEvento ? '' : (partes[1] || '');
                        return (
                          <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                            <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                            <td className="py-2 px-3">
                              <span className={`px-2 py-0.5 rounded text-xs ${esDeEvento ? 'bg-purple-500/20 text-purple-400' : origen === 'Vta directa' ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-500/20 text-slate-400'}`}>
                                {origen}
                              </span>
                            </td>
                            <td className="py-2 px-3 text-purple-400 font-medium">{cliente || '-'}</td>
                            <td className="py-2 px-3 text-slate-400 text-xs">{observacion || '-'}</td>
                            <td className="py-2 px-3 text-slate-400">{item.persona}</td>
                            <td className="py-2 px-3 text-right text-green-400">${(item.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</td>
                            <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'}</td>
                            <td className="py-2 px-3 flex gap-1">
                              {esDeEvento ? (
                                <span className="text-xs text-slate-500 italic" title="Gestionar desde Eventos">Desde eventos</span>
                              ) : (
                                <>
                                  <button onClick={() => {
                                    const partes = (item.concepto || '').split(' | ');
                                    setEditingCajaIngreso(item.id);
                                    setCajaIngresoForm({
                                      fecha: item.fecha,
                                      origen: partes[0] || '',
                                      observacion: partes[1] || '',
                                      receptor: item.persona,
                                      monto_pesos: item.monto_dolares ? '' : (item.monto_pesos || '').toString(),
                                      monto_dolares: (item.monto_dolares || '').toString(),
                                      cotizacion: (item.cotizacion || '').toString()
                                    });
                                    setShowCajaIngresoForm(true);
                                  }} className="p-1 text-blue-400 hover:text-blue-300">
                                    <Edit3 className="w-4 h-4" />
                                  </button>
                                  <button onClick={async () => {
                                    const clave = prompt('Ingrese clave para eliminar:');
                                    if (clave !== '1970') {
                                      if (clave !== null) alert('Clave incorrecta');
                                      return;
                                    }
                                    const motivo = prompt('Detalle por qué se elimina este ingreso:');
                                    if (!motivo || motivo.trim() === '') {
                                      alert('Debe ingresar un motivo');
                                      return;
                                    }
                                    // Guardar auditoría antes de eliminar
                                    const { error: auditError } = await supabase.from('auditoria_caja').insert({
                                      tipo_movimiento: 'ingreso',
                                      concepto: item.concepto,
                                      monto_pesos: item.monto_pesos,
                                      monto_dolares: item.monto_dolares,
                                      cotizacion: item.cotizacion,
                                      persona: item.persona,
                                      aportante: item.aportante,
                                      fecha_movimiento: item.fecha,
                                      motivo: motivo,
                                      usuario: user?.email || 'Sistema'
                                    });
                                    if (auditError) {
                                      console.error('Error guardando auditoría:', auditError);
                                      alert('Error guardando auditoría: ' + auditError.message);
                                    }
                                    const esAporte = item.concepto && item.concepto.startsWith('Aporte de ');
                                    const { error } = await supabase.from('caja_movimientos').delete().eq('id', item.id);
                                    if (error) {
                                      alert('Error al eliminar: ' + error.message);
                                      console.error(error);
                                    } else {
                                      // Si es un aporte, eliminar también el egreso correspondiente
                                      if (esAporte) {
                                        const { data: egresos } = await supabase.from('caja_movimientos')
                                          .select('*')
                                          .eq('tipo', 'egreso')
                                          .eq('fecha', item.fecha)
                                          .eq('monto_pesos', item.monto_pesos)
                                          .ilike('concepto', `Aporte a ${item.persona}%`);
                                        if (egresos && egresos.length > 0) {
                                          await supabase.from('caja_movimientos').delete().eq('id', egresos[0].id);
                                        }
                                      }
                                      fetchCajaMovimientos();
                                      fetchAuditoriaCaja();
                                    }
                                  }} className="p-1 text-red-400 hover:text-red-300">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                      {cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).length === 0 && (
                        <tr><td colSpan="8" className="py-8 text-center text-slate-500">Sin ingresos registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total $: <span className="text-green-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                </div>
              </div>
            )}

            {/* Contenido de Banco */}
            {cajaTab === 'banco' && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-cyan-400">Ingresos Banco</h3>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs">
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Cliente</th>
                        <th className="text-left py-2 px-3">Recibido por</th>
                        <th className="text-right py-2 px-3">Pesos</th>
                        <th className="text-right py-2 px-3">USD</th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajaMovimientos.filter(m => m.tipo === 'ingreso_banco').map(item => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                          <td className="py-2 px-3 text-cyan-400 font-medium">{item.concepto || '-'}</td>
                          <td className="py-2 px-3 text-slate-400">{item.persona}</td>
                          <td className="py-2 px-3 text-right text-cyan-400">${(item.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</td>
                          <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'}</td>
                          <td className="py-2 px-3">
                            <button onClick={async () => {
                              const clave = prompt('Ingrese clave para eliminar:');
                              if (clave !== '1970') {
                                if (clave !== null) alert('Clave incorrecta');
                                return;
                              }
                              const motivo = prompt('Detalle por qué se elimina este ingreso:');
                              if (!motivo || motivo.trim() === '') {
                                alert('Debe ingresar un motivo');
                                return;
                              }
                              const { error } = await supabase.from('caja_movimientos').delete().eq('id', item.id);
                              if (error) {
                                alert('Error al eliminar: ' + error.message);
                              } else {
                                fetchCajaMovimientos();
                              }
                            }} className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cajaMovimientos.filter(m => m.tipo === 'ingreso_banco').length === 0 && (
                        <tr><td colSpan="6" className="py-8 text-center text-slate-500">Sin ingresos en banco registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total $: <span className="text-cyan-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'ingreso_banco').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'ingreso_banco').reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                </div>
              </div>
            )}

            {/* Contenido de Egresos */}
            {cajaTab === 'egresos' && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-red-400">Egresos / Retiros</h3>
                  <button
                    onClick={() => {
                      if (showCajaEgresoForm) {
                        setShowCajaEgresoForm(false);
                        setEditingCajaEgreso(null);
                        setCajaEgresoForm({ fecha: new Date().toISOString().split('T')[0], concepto: '', receptor: '', aportante: '', monto_pesos: '', monto_dolares: '', cotizacion: '', observacion: '' });
                      } else {
                        setShowCajaEgresoForm(true);
                      }
                    }}
                    className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 text-sm flex items-center gap-1"
                  >
                    {showCajaEgresoForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {showCajaEgresoForm ? 'Cancelar' : 'Agregar'}
                  </button>
                </div>

                {/* Modal Formulario de Egreso */}
                {showCajaEgresoForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const pesos = parseFloat(cajaEgresoForm.monto_pesos) || 0;
                      const dolares = parseFloat(cajaEgresoForm.monto_dolares) || 0;
                      const tc = parseFloat(cajaEgresoForm.cotizacion) || tipoCambio;
                      if (pesos === 0 && dolares === 0) { alert('Ingrese un monto'); return; }
                      if (!cajaEgresoForm.concepto) { alert('Seleccione un concepto'); return; }
                      if (!cajaEgresoForm.aportante) { alert('Seleccione de qué caja sale'); return; }
                      // Solo validar receptor para R. Socios
                      if (cajaEgresoForm.concepto === 'R. Socios' && !cajaEgresoForm.receptor) {
                        alert('Seleccione qué socio retira'); return;
                      }

                      // Si es retiro de socio (concepto R. Socios y receptor es socio)
                      const esRetiro = cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor);
                      const totalPesos = pesos + (dolares * tc);

                      if (esRetiro) {
                        // Retiro de socio:
                        // 1. Egreso del aportante (baja su caja)
                        // 2. Retiro para el socio (registro de retiro)
                        await supabase.from('caja_movimientos').insert({
                          tipo: 'egreso',
                          concepto: `R. Socios a ${cajaEgresoForm.receptor}${cajaEgresoForm.observacion ? ' | ' + cajaEgresoForm.observacion : ''}`,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || (totalPesos / tc),
                          cotizacion: tc,
                          persona: cajaEgresoForm.aportante,
                          aportante: cajaEgresoForm.aportante,
                          fecha: cajaEgresoForm.fecha
                        });
                        // Registro de retiro para el socio
                        await supabase.from('caja_movimientos').insert({
                          tipo: 'retiro',
                          concepto: cajaEgresoForm.observacion || cajaEgresoForm.concepto,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || (totalPesos / tc),
                          cotizacion: tc,
                          persona: cajaEgresoForm.receptor,
                          aportante: cajaEgresoForm.aportante,
                          fecha: cajaEgresoForm.fecha
                        });
                      } else {
                        // Egreso normal (Pagos extras, Otros, etc.)
                        // persona = aportante (de qué caja sale el dinero)
                        const data = {
                          tipo: 'egreso',
                          concepto: cajaEgresoForm.observacion || cajaEgresoForm.concepto,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || null,
                          cotizacion: dolares ? tc : null,
                          persona: cajaEgresoForm.aportante,
                          aportante: cajaEgresoForm.aportante,
                          fecha: cajaEgresoForm.fecha
                        };

                        if (editingCajaEgreso) {
                          const { error } = await supabase.from('caja_movimientos').update(data).eq('id', editingCajaEgreso);
                          if (error) { alert('Error al actualizar: ' + error.message); return; }
                        } else {
                          const { error } = await supabase.from('caja_movimientos').insert(data);
                          if (error) { alert('Error al guardar: ' + error.message); return; }
                        }
                      }

                      setCajaEgresoForm({ fecha: new Date().toISOString().split('T')[0], concepto: '', receptor: '', aportante: '', monto_pesos: '', monto_dolares: '', cotizacion: '', observacion: '' });
                      setShowCajaEgresoForm(false);
                      setEditingCajaEgreso(null);
                      fetchCajaMovimientos();
                    }} className="p-6 bg-slate-800 rounded-xl border border-red-500/30 space-y-4 w-full max-w-lg mx-4">
                      {editingCajaEgreso && (
                        <div className="text-xs text-yellow-400 mb-2">Editando egreso...</div>
                      )}
                      <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Fecha *</label>
                        <input
                          type="date"
                          value={cajaEgresoForm.fecha}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, fecha: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Sale de caja de *</label>
                        <select
                          value={cajaEgresoForm.aportante}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, aportante: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          required
                        >
                          <option value="">Seleccionar...</option>
                          {CAJAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Concepto *</label>
                        <select
                          value={cajaEgresoForm.concepto}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, concepto: e.target.value, receptor: ''})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {CONCEPTOS_EGRESO.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    {/* Selector de socio para R. Socios */}
                    {cajaEgresoForm.concepto === 'R. Socios' && (
                      <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30">
                        <label className="block text-xs text-yellow-400 mb-2">¿Qué socio retira? *</label>
                        <div className="flex gap-2">
                          {SOCIOS.map(socio => (
                            <button
                              key={socio}
                              type="button"
                              onClick={() => setCajaEgresoForm({...cajaEgresoForm, receptor: socio})}
                              className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                                cajaEgresoForm.receptor === socio
                                  ? 'bg-yellow-500 text-black'
                                  : 'bg-white/10 text-white hover:bg-white/20'
                              }`}
                            >
                              {socio}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          → Sale de: <span className="text-red-400">{cajaEgresoForm.aportante || '?'}</span> |
                          Retira: <span className="text-yellow-400">{cajaEgresoForm.receptor || '?'}</span>
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto Pesos</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaEgresoForm.monto_pesos)}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, monto_pesos: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto USD</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaEgresoForm.monto_dolares)}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, monto_dolares: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo Cambio {cajaEgresoForm.monto_dolares ? '*' : ''}</label>
                        <input
                          type="text"
                          value={formatNumberInput(cajaEgresoForm.cotizacion)}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, cotizacion: parseNumberInput(e.target.value)})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder={tipoCambio.toString()}
                        />
                      </div>
                    </div>
                    {cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor) && (cajaEgresoForm.monto_pesos || cajaEgresoForm.monto_dolares) && (
                      <div className="text-xs text-blue-400 bg-blue-500/10 rounded-lg p-2">
                        Total: ${((parseFloat(cajaEgresoForm.monto_pesos) || 0) + ((parseFloat(cajaEgresoForm.monto_dolares) || 0) * (parseFloat(cajaEgresoForm.cotizacion) || tipoCambio))).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                        {' '}≈ USD {(((parseFloat(cajaEgresoForm.monto_pesos) || 0) + ((parseFloat(cajaEgresoForm.monto_dolares) || 0) * (parseFloat(cajaEgresoForm.cotizacion) || tipoCambio))) / (parseFloat(cajaEgresoForm.cotizacion) || tipoCambio)).toFixed(2)}
                      </div>
                    )}
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Observación</label>
                      <input
                        type="text"
                        value={cajaEgresoForm.observacion}
                        onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, observacion: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        placeholder="Detalle opcional"
                      />
                      </div>
                      <div className="flex justify-end gap-2">
                        <button type="button" onClick={() => { setShowCajaEgresoForm(false); setEditingCajaEgreso(null); setCajaEgresoForm({ fecha: new Date().toISOString().split('T')[0], concepto: '', receptor: '', aportante: '', monto_pesos: '', monto_dolares: '', cotizacion: '', observacion: '' }); }} className="px-4 py-2 rounded-lg bg-slate-600 text-white text-sm font-medium hover:bg-slate-700">
                          Cancelar
                        </button>
                        <button type="submit" className={`px-4 py-2 rounded-lg text-white text-sm font-medium ${cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor) && !editingCajaEgreso ? 'bg-yellow-500 hover:bg-yellow-600' : 'bg-red-500 hover:bg-red-600'}`}>
                          {editingCajaEgreso ? 'Actualizar Egreso' : (cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor) ? 'Guardar Retiro' : 'Guardar Egreso')}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs">
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Sale de caja</th>
                        <th className="text-left py-2 px-3">Concepto</th>
                        <th className="text-right py-2 px-3">Pesos</th>
                        <th className="text-right py-2 px-3">USD</th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).map(item => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                          <td className="py-2 px-3 text-slate-400">{item.persona || item.aportante || '-'}</td>
                          <td className="py-2 px-3 font-medium">{item.concepto}</td>
                          <td className="py-2 px-3 text-right text-red-400">${(item.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</td>
                          <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '-'}</td>
                          <td className="py-2 px-3 flex gap-1">
                            <button onClick={() => {
                              // Detectar si es R. Socios para cargar el receptor
                              const esRetiroSocios = item.concepto && item.concepto.startsWith('R. Socios a ');
                              const receptor = esRetiroSocios ? item.concepto.replace('R. Socios a ', '').split(' | ')[0] : '';
                              setEditingCajaEgreso(item.id);
                              setCajaEgresoForm({
                                fecha: item.fecha,
                                concepto: esRetiroSocios ? 'R. Socios' : (CONCEPTOS_EGRESO.includes(item.concepto) ? item.concepto : 'Otros'),
                                receptor: receptor,
                                aportante: item.persona || item.aportante || '',
                                monto_pesos: item.monto_dolares ? '' : (item.monto_pesos || '').toString(),
                                monto_dolares: (item.monto_dolares || '').toString(),
                                cotizacion: (item.cotizacion || '').toString(),
                                observacion: esRetiroSocios ? '' : (CONCEPTOS_EGRESO.includes(item.concepto) ? '' : item.concepto)
                              });
                              setShowCajaEgresoForm(true);
                            }} className="p-1 text-blue-400 hover:text-blue-300">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => {
                              const clave = prompt('Ingrese clave para eliminar:');
                              if (clave !== '1970') {
                                if (clave !== null) alert('Clave incorrecta');
                                return;
                              }
                              const motivo = prompt('Detalle por qué se elimina este egreso:');
                              if (!motivo || motivo.trim() === '') {
                                alert('Debe ingresar un motivo');
                                return;
                              }
                              // Guardar auditoría antes de eliminar
                              const { error: auditError } = await supabase.from('auditoria_caja').insert({
                                tipo_movimiento: 'egreso',
                                concepto: item.concepto,
                                monto_pesos: item.monto_pesos,
                                monto_dolares: item.monto_dolares,
                                cotizacion: item.cotizacion,
                                persona: item.persona,
                                aportante: item.aportante,
                                fecha_movimiento: item.fecha,
                                motivo: motivo,
                                usuario: user?.email || 'Sistema'
                              });
                              if (auditError) {
                                console.error('Error guardando auditoría:', auditError);
                                alert('Error guardando auditoría: ' + auditError.message);
                              } else {
                                console.log('Auditoría guardada correctamente para egreso:', item.concepto);
                              }
                              const esAporte = item.concepto && item.concepto.startsWith('Aporte a ');
                              const esRetiroSocios = item.concepto && item.concepto.startsWith('R. Socios a ');
                              const { error } = await supabase.from('caja_movimientos').delete().eq('id', item.id);
                              if (error) {
                                alert('Error al eliminar: ' + error.message);
                                console.error(error);
                              } else {
                                // Si es un aporte, eliminar también el ingreso correspondiente
                                if (esAporte) {
                                  const { data: ingresos } = await supabase.from('caja_movimientos')
                                    .select('*')
                                    .eq('tipo', 'ingreso')
                                    .eq('fecha', item.fecha)
                                    .eq('monto_pesos', item.monto_pesos)
                                    .ilike('concepto', `Aporte de ${item.aportante}%`);
                                  if (ingresos && ingresos.length > 0) {
                                    await supabase.from('caja_movimientos').delete().eq('id', ingresos[0].id);
                                  }
                                }
                                // Si es R. Socios, eliminar también el retiro correspondiente
                                if (esRetiroSocios) {
                                  const receptor = item.concepto.replace('R. Socios a ', '').split(' | ')[0];
                                  const { data: retiros } = await supabase.from('caja_movimientos')
                                    .select('*')
                                    .eq('tipo', 'retiro')
                                    .eq('fecha', item.fecha)
                                    .eq('monto_pesos', item.monto_pesos)
                                    .eq('persona', receptor);
                                  if (retiros && retiros.length > 0) {
                                    await supabase.from('caja_movimientos').delete().eq('id', retiros[0].id);
                                  }
                                }
                                fetchCajaMovimientos();
                                fetchAuditoriaCaja();
                              }
                            }} className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).length === 0 && (
                        <tr><td colSpan="7" className="py-8 text-center text-slate-500">Sin egresos registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total $: <span className="text-red-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                </div>
              </div>
            )}

            {/* Contenido de Transferencias */}
            {cajaTab === 'transferencias' && (
              <div className="glass rounded-2xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-purple-400">Transferencias Internas</h3>
                  <button
                    onClick={() => setShowTransferenciaForm(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 text-sm flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva Transferencia
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400">
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Origen</th>
                        <th className="text-left py-2 px-3">Destino</th>
                        <th className="text-right py-2 px-3">Monto $</th>
                        <th className="text-left py-2 px-3">Observación</th>
                        <th className="text-center py-2 px-3">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        // Filtrar solo los ingresos de transferencia para evitar duplicados
                        const transferencias = cajaMovimientos.filter(m =>
                          m.tipo === 'ingreso' && m.concepto && m.concepto.startsWith('Transferencia interna')
                        );
                        if (transferencias.length === 0) {
                          return <tr><td colSpan="6" className="py-8 text-center text-slate-500">Sin transferencias registradas</td></tr>;
                        }
                        return transferencias.map(item => {
                          const observacion = item.concepto.includes(' | ') ? item.concepto.split(' | ')[1] : '';
                          return (
                            <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                              <td className="py-2 px-3">{item.fecha}</td>
                              <td className="py-2 px-3 text-red-400">{item.aportante || '-'}</td>
                              <td className="py-2 px-3 text-green-400">{item.persona}</td>
                              <td className="py-2 px-3 text-right text-purple-400">${(item.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</td>
                              <td className="py-2 px-3 text-slate-400">{observacion}</td>
                              <td className="py-2 px-3 text-center flex gap-1 justify-center">
                                <button
                                  onClick={async () => {
                                    // Buscar el egreso correspondiente
                                    const { data: egresos } = await supabase.from('caja_movimientos')
                                      .select('*')
                                      .eq('tipo', 'egreso')
                                      .eq('fecha', item.fecha)
                                      .eq('persona', item.aportante)
                                      .eq('monto_pesos', item.monto_pesos)
                                      .ilike('concepto', 'Transferencia interna%');

                                    setEditingTransferencia({
                                      ingresoId: item.id,
                                      egresoId: egresos && egresos.length > 0 ? egresos[0].id : null
                                    });
                                    setTransferenciaForm({
                                      fecha: item.fecha,
                                      origen: item.aportante || '',
                                      destino: item.persona,
                                      monto_pesos: (item.monto_pesos || '').toString(),
                                      observacion: observacion
                                    });
                                    setShowTransferenciaForm(true);
                                  }}
                                  className="p-1 text-blue-400 hover:bg-blue-500/20 rounded"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={async () => {
                                    const clave = prompt('Ingrese clave para eliminar:');
                                    if (clave !== '1970') {
                                      if (clave !== null) alert('Clave incorrecta');
                                      return;
                                    }
                                    const motivo = prompt('Detalle por qué se elimina esta transferencia:');
                                    if (!motivo || motivo.trim() === '') {
                                      alert('Debe ingresar un motivo');
                                      return;
                                    }
                                    // Guardar auditoría antes de eliminar
                                    const { error: auditError } = await supabase.from('auditoria_caja').insert({
                                      tipo_movimiento: 'transferencia',
                                      concepto: item.concepto,
                                      monto_pesos: item.monto_pesos,
                                      monto_dolares: item.monto_dolares,
                                      cotizacion: item.cotizacion,
                                      persona: item.persona,
                                      aportante: item.aportante,
                                      fecha_movimiento: item.fecha,
                                      motivo: motivo,
                                      usuario: user?.email || 'Sistema'
                                    });
                                    if (auditError) {
                                      console.error('Error guardando auditoría:', auditError);
                                      alert('Error guardando auditoría: ' + auditError.message);
                                    }
                                    // Eliminar el ingreso
                                    await supabase.from('caja_movimientos').delete().eq('id', item.id);
                                    // Buscar y eliminar el egreso correspondiente (mismo monto, fecha, y aportante como persona)
                                    const { data: egresos } = await supabase.from('caja_movimientos')
                                      .select('*')
                                      .eq('tipo', 'egreso')
                                      .eq('fecha', item.fecha)
                                      .eq('persona', item.aportante)
                                      .eq('monto_pesos', item.monto_pesos)
                                      .ilike('concepto', 'Transferencia interna%');
                                    if (egresos && egresos.length > 0) {
                                      await supabase.from('caja_movimientos').delete().eq('id', egresos[0].id);
                                    }
                                    fetchCajaMovimientos();
                                    fetchAuditoriaCaja();
                                  }}
                                  className="p-1 text-red-400 hover:bg-red-500/20 rounded"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          );
                        });
                      })()}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total Transferido: <span className="text-purple-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'ingreso' && m.concepto && m.concepto.startsWith('Transferencia interna')).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                </div>
              </div>
            )}

            {/* Contenido de Retiros */}
            {cajaTab === 'retiros' && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Retiros por Socio</h3>

                {/* Resumen por Socio */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {SOCIOS.map(socio => {
                    const retirosSocio = cajaMovimientos.filter(m => m.tipo === 'retiro' && m.persona === socio);
                    const totalPesos = retirosSocio.reduce((sum, r) => sum + (r.monto_pesos || 0), 0);
                    const totalUSD = retirosSocio.reduce((sum, r) => sum + (r.monto_dolares || 0), 0);
                    const promedioTC = retirosSocio.length > 0
                      ? retirosSocio.reduce((sum, r) => sum + ((r.cotizacion || 0) * (r.monto_pesos || 0)), 0) / totalPesos
                      : 0;
                    return (
                      <div key={socio} className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-yellow-400 mb-3">{socio}</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">Pesos:</span>
                            <span className="text-white font-medium">${totalPesos.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-400">USD:</span>
                            <span className="text-blue-400 font-medium">{totalUSD.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm border-t border-white/10 pt-2">
                            <span className="text-slate-400">TC Prom:</span>
                            <span className="text-slate-300">{promedioTC > 0 ? promedioTC.toFixed(0) : '-'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabla de detalle */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-slate-400 text-xs">
                        <th className="text-left py-2 px-3">Fecha</th>
                        <th className="text-left py-2 px-3">Socio</th>
                        <th className="text-left py-2 px-3">Observación</th>
                        <th className="text-right py-2 px-3">Pesos</th>
                        <th className="text-right py-2 px-3">USD</th>
                        <th className="text-right py-2 px-3">TC</th>
                        <th className="w-10"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajaMovimientos.filter(m => m.tipo === 'retiro').map(item => {
                        const tc = item.cotizacion || tipoCambio;
                        const usdEquiv = item.monto_dolares || (item.monto_pesos ? (item.monto_pesos / tc).toFixed(2) : 0);
                        return (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                          <td className="py-2 px-3 font-medium text-yellow-400">{item.persona}</td>
                          <td className="py-2 px-3 text-slate-400">{item.concepto}</td>
                          <td className="py-2 px-3 text-right text-white">${(item.monto_pesos || 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</td>
                          <td className="py-2 px-3 text-right text-blue-400">{usdEquiv}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{formatNumberInput(tc)}</td>
                          <td className="py-2 px-3">
                            <button onClick={async () => {
                              const clave = prompt('Ingrese clave para eliminar:');
                              if (clave !== '1970') {
                                if (clave !== null) alert('Clave incorrecta');
                                return;
                              }
                              const motivo = prompt('Detalle por qué se elimina este retiro:');
                              if (!motivo || motivo.trim() === '') {
                                alert('Debe ingresar un motivo');
                                return;
                              }
                              // Guardar auditoría antes de eliminar
                              const { error: auditError } = await supabase.from('auditoria_caja').insert({
                                tipo_movimiento: 'retiro',
                                concepto: item.concepto,
                                monto_pesos: item.monto_pesos,
                                monto_dolares: item.monto_dolares,
                                cotizacion: item.cotizacion,
                                persona: item.persona,
                                aportante: item.aportante,
                                fecha_movimiento: item.fecha,
                                motivo: motivo,
                                usuario: user?.email || 'Sistema'
                              });
                              if (auditError) {
                                console.error('Error guardando auditoría:', auditError);
                                alert('Error guardando auditoría: ' + auditError.message);
                              }
                              // Eliminar el retiro
                              const { error } = await supabase.from('caja_movimientos').delete().eq('id', item.id);
                              if (error) {
                                alert('Error al eliminar: ' + error.message);
                                console.error(error);
                              } else {
                                // Buscar y eliminar el egreso correspondiente (R. Socios)
                                const { data: egresos } = await supabase.from('caja_movimientos')
                                  .select('*')
                                  .eq('tipo', 'egreso')
                                  .eq('fecha', item.fecha)
                                  .eq('monto_pesos', item.monto_pesos)
                                  .ilike('concepto', `R. Socios a ${item.persona}%`);
                                if (egresos && egresos.length > 0) {
                                  await supabase.from('caja_movimientos').delete().eq('id', egresos[0].id);
                                }
                                fetchCajaMovimientos();
                                fetchAuditoriaCaja();
                              }
                            }} className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                      })}
                      {cajaMovimientos.filter(m => m.tipo === 'retiro').length === 0 && (
                        <tr><td colSpan="7" className="py-8 text-center text-slate-500">Sin retiros registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total $: <span className="text-yellow-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'retiro').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.')}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'retiro').reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toFixed(2)}</span></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Nuevo/Editar Menú */}
        {showMenuModal && (
          <div className="fixed inset-0 bg-black/70 flex items-start justify-center z-50 p-4 overflow-y-auto">
            <div className="glass rounded-2xl p-6 w-full max-w-4xl mt-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingMenu ? 'Editar Menú' : 'Nuevo Menú'}</h2>
                <button onClick={() => { setShowMenuModal(false); resetNuevoMenu(); }} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveMenu} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Tipo de Menú</label>
                    <select
                      value={menuTipoOtro ? 'Otro' : (TIPOS_MENU.find(t => nuevoMenu.nombre.startsWith(t)) || '')}
                      onChange={(e) => {
                        const tipoSeleccionado = e.target.value;
                        if (tipoSeleccionado === 'Otro') {
                          setMenuTipoOtro(true);
                          setMenuOtroBase('');
                          setNuevoMenu({...nuevoMenu, nombre: '', categorias: []});
                        } else if (tipoSeleccionado) {
                          setMenuTipoOtro(false);
                          setMenuOtroBase('');
                          const categorias = CATEGORIAS_POR_MENU[tipoSeleccionado].map(cat => ({ nombre: cat, items: [] }));
                          // Calcular número de opción
                          const menusDelMismoTipo = menus.filter(m => m.nombre.startsWith(tipoSeleccionado)).length;
                          const numeroOpcion = menusDelMismoTipo + 1;
                          const nombreConOpcion = `${tipoSeleccionado} - Opción ${numeroOpcion}`;
                          setNuevoMenu({...nuevoMenu, nombre: nombreConOpcion, categorias});
                        }
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                    >
                      <option value="" className="bg-slate-900">Seleccionar tipo de menú...</option>
                      {TIPOS_MENU.map(tipo => (
                        <option key={tipo} value={tipo} className="bg-slate-900">{tipo}</option>
                      ))}
                    </select>
                  </div>
                  {menuTipoOtro && (
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Basar estructura en</label>
                      <select
                        value={menuOtroBase}
                        onChange={(e) => {
                          const baseSeleccionada = e.target.value;
                          setMenuOtroBase(baseSeleccionada);
                          if (baseSeleccionada) {
                            const categorias = CATEGORIAS_POR_MENU[baseSeleccionada].map(cat => ({ nombre: cat, items: [] }));
                            setNuevoMenu({...nuevoMenu, categorias});
                          }
                        }}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                      >
                        <option value="" className="bg-slate-900">Seleccionar estructura...</option>
                        {TIPOS_MENU.filter(t => t !== 'Otro').map(tipo => (
                          <option key={tipo} value={tipo} className="bg-slate-900">{tipo}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                {editingMenu && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre del menú</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre del menú..."
                      value={nuevoMenu.nombre}
                      onChange={(e) => setNuevoMenu({...nuevoMenu, nombre: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                )}
                {!editingMenu && menuTipoOtro && (
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre personalizado</label>
                    <input
                      type="text"
                      required
                      placeholder="Escribí el nombre del menú..."
                      value={nuevoMenu.nombre}
                      onChange={(e) => setNuevoMenu({...nuevoMenu, nombre: e.target.value})}
                      className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold mb-4">Categorías</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    {nuevoMenu.categorias.map((categoria, catIdx) => (
                      <div key={catIdx} className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-sm font-semibold text-purple-400 mb-3">{categoria.nombre}</h4>

                        <div className="space-y-2 mb-3">
                          {categoria.items.map((item, itemIdx) => (
                            <div key={itemIdx} className="flex items-center justify-between bg-white/5 rounded-lg px-3 py-2">
                              <span className="text-sm text-slate-300">{item}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveItemFromCategory(catIdx, itemIdx)}
                                className="text-red-400 hover:text-red-300"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>

                        <div className="space-y-2">
                          {/* Select de platos del catálogo */}
                          {(() => {
                            const tipoMenu = menuTipoOtro ? (menuOtroBase || 'Otro') : (TIPOS_MENU.find(t => nuevoMenu.nombre.startsWith(t)) || nuevoMenu.nombre);
                            // Obtener platos del catálogo según tipo de menú y categoría
                            let platosDisponibles = [];
                            if (categoria.nombre === 'Bebidas') {
                              // Bebidas viene del catálogo de Bebidas
                              platosDisponibles = catalogoItems.filter(item => item.categoria === 'Bebidas').map(item => item.nombre);
                            } else if (tipoMenu === 'Menu Tapeo') {
                              // Para menú tapeo, buscar en categoría Tapas con la subcategoría correspondiente
                              platosDisponibles = catalogoItems.filter(item => item.categoria === 'Tapas' && item.subcategoria === categoria.nombre).map(item => item.nombre);
                            } else {
                              // Para otros menús, buscar en categoría Platos con la subcategoría correspondiente
                              platosDisponibles = catalogoItems.filter(item => item.categoria === 'Platos' && item.subcategoria === categoria.nombre).map(item => item.nombre);
                            }
                            const platosSinSeleccionar = platosDisponibles.filter(p => !categoria.items.includes(p));

                            return platosSinSeleccionar.length > 0 && (
                              <select
                                className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm focus:outline-none focus:border-purple-500/50"
                                onChange={(e) => {
                                  if (e.target.value) {
                                    const newCategorias = [...nuevoMenu.categorias];
                                    newCategorias[catIdx].items.push(e.target.value);
                                    setNuevoMenu({ ...nuevoMenu, categorias: newCategorias });
                                    e.target.value = '';
                                  }
                                }}
                                defaultValue=""
                              >
                                <option value="" className="bg-slate-900">Seleccionar plato...</option>
                                {platosSinSeleccionar.map((plato, pIdx) => (
                                  <option key={pIdx} value={plato} className="bg-slate-900">{plato}</option>
                                ))}
                              </select>
                            );
                          })()}

                          {/* Input para agregar manualmente */}
                          <div className="flex gap-2">
                            <input
                              type="text"
                              placeholder="Escribir plato personalizado..."
                              className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                              onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const value = e.target.value.trim();
                                  if (value && !categoria.items.includes(value)) {
                                    const newCategorias = [...nuevoMenu.categorias];
                                    newCategorias[catIdx].items.push(value);
                                    setNuevoMenu({ ...nuevoMenu, categorias: newCategorias });
                                    e.target.value = '';
                                  }
                                }
                              }}
                            />
                            <button
                              type="button"
                              onClick={(e) => {
                                const input = e.target.closest('.flex').querySelector('input');
                                const value = input.value.trim();
                                if (value && !categoria.items.includes(value)) {
                                  const newCategorias = [...nuevoMenu.categorias];
                                  newCategorias[catIdx].items.push(value);
                                  setNuevoMenu({ ...nuevoMenu, categorias: newCategorias });
                                  input.value = '';
                                }
                              }}
                              className="px-3 py-2 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-4">Extras Opcionales</h3>

                  {nuevoMenu.extras.length > 0 && (
                    <div className="space-y-2 mb-4">
                      {nuevoMenu.extras.map((extra, idx) => (
                        <div key={idx} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-3">
                          <span className="text-slate-300">{extra}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveExtra(idx)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: J&W Etiqueta Negra"
                      value={nuevoExtra}
                      onChange={(e) => setNuevoExtra(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddExtra();
                        }
                      }}
                      className="flex-1 px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                    <button
                      type="button"
                      onClick={handleAddExtra}
                      className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => { setShowMenuModal(false); resetNuevoMenu(); }}
                    className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <UtensilsCrossed className="w-5 h-5" />}
                    {saving ? 'Guardando...' : (editingMenu ? 'Actualizar Menú' : 'Crear Menú')}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal Nuevo/Editar Usuario */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="glass rounded-2xl p-6 w-full max-w-lg my-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">{editingUsuario ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
                <button onClick={() => { setShowUserModal(false); setEditingUsuario(null); setUserError(''); }} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                if (editingUsuario) {
                  handleUpdateUser(e);
                } else {
                  if (nuevoUsuario.password !== nuevoUsuario.password2) {
                    setUserError('Las contraseñas no coinciden');
                    return;
                  }
                  handleCreateUser(e);
                }
              }} className="space-y-4">
                {userError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {userError}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Nombre *</label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre"
                      value={nuevoUsuario.nombre}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                      className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-400 mb-1">Email {editingUsuario ? '' : '*'}</label>
                    <input
                      type="email"
                      required={!editingUsuario}
                      disabled={!!editingUsuario}
                      placeholder="email@ejemplo.com"
                      value={nuevoUsuario.email}
                      onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                      className={`w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 ${editingUsuario ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>
                </div>

                {!editingUsuario && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Contraseña *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Mínimo 6 caracteres"
                        value={nuevoUsuario.password}
                        onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                        className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-400 mb-1">Repetir Contraseña *</label>
                      <input
                        type="password"
                        required
                        minLength={6}
                        placeholder="Repetir contraseña"
                        value={nuevoUsuario.password2}
                        onChange={(e) => setNuevoUsuario({...nuevoUsuario, password2: e.target.value})}
                        className={`w-full px-3 py-2 rounded-xl border bg-white/5 text-white placeholder-slate-500 focus:outline-none ${
                          nuevoUsuario.password2 && nuevoUsuario.password !== nuevoUsuario.password2
                            ? 'border-red-500/50'
                            : nuevoUsuario.password2 && nuevoUsuario.password === nuevoUsuario.password2
                            ? 'border-green-500/50'
                            : 'border-white/10 focus:border-purple-500/50'
                        }`}
                      />
                      {nuevoUsuario.password2 && nuevoUsuario.password !== nuevoUsuario.password2 && (
                        <p className="text-red-400 text-xs mt-1">No coinciden</p>
                      )}
                      {nuevoUsuario.password2 && nuevoUsuario.password === nuevoUsuario.password2 && (
                        <p className="text-green-400 text-xs mt-1">✓ Coinciden</p>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rol</label>
                  <select
                    value={nuevoUsuario.rol}
                    onChange={(e) => {
                      const rol = e.target.value;
                      if (rol === 'admin') {
                        setNuevoUsuario({
                          ...nuevoUsuario,
                          rol,
                          tabs_permitidas: ['dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario', 'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja'],
                          ver_precios: true
                        });
                      } else {
                        setNuevoUsuario({...nuevoUsuario, rol});
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="lectura" className="bg-slate-900">Lectura (solo ver)</option>
                    <option value="vendedor" className="bg-slate-900">Vendedor (crear y editar)</option>
                    <option value="admin" className="bg-slate-900">Admin (acceso total)</option>
                  </select>
                </div>

                {nuevoUsuario.rol !== 'admin' && (
                  <>
                    <div>
                      <label className="block text-sm text-slate-400 mb-2">Pestañas permitidas</label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'dashboard', label: 'Dashboard' },
                          { id: 'proximos', label: 'Próximos' },
                          { id: 'aconfirmar', label: 'A Confirmar' },
                          { id: 'realizados', label: 'Realizados' },
                          { id: 'calendario', label: 'Calendario' },
                          { id: 'eventos', label: 'Eventos' },
                          { id: 'cobranzas', label: 'Cobranzas' },
                          { id: 'menus', label: 'Menús' },
                          { id: 'informes', label: 'Informes' },
                          { id: 'agenda', label: 'Agenda' },
                          { id: 'caja', label: 'Caja' }
                        ].map(tab => (
                          <label key={tab.id} className="flex items-center gap-2 p-2 rounded-lg bg-white/5 hover:bg-white/10 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={nuevoUsuario.tabs_permitidas.includes(tab.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNuevoUsuario({
                                    ...nuevoUsuario,
                                    tabs_permitidas: [...nuevoUsuario.tabs_permitidas, tab.id]
                                  });
                                } else {
                                  setNuevoUsuario({
                                    ...nuevoUsuario,
                                    tabs_permitidas: nuevoUsuario.tabs_permitidas.filter(t => t !== tab.id)
                                  });
                                }
                              }}
                              className="rounded border-white/20"
                            />
                            <span className="text-sm">{tab.label}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={nuevoUsuario.ver_precios}
                          onChange={(e) => setNuevoUsuario({...nuevoUsuario, ver_precios: e.target.checked})}
                          className="rounded border-white/20 w-5 h-5"
                        />
                        <div>
                          <span className="text-sm font-medium">Ver precios</span>
                          <p className="text-xs text-slate-400">Si está desactivado, no verá montos en ninguna parte</p>
                        </div>
                      </label>
                    </div>
                  </>
                )}

                <button
                  type="submit"
                  disabled={saving || (nuevoUsuario.password !== nuevoUsuario.password2)}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  {saving ? 'Guardando...' : (editingUsuario ? 'Actualizar Usuario' : 'Crear Usuario')}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
