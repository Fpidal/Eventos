import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Search, ChevronDown, ChevronUp, Briefcase, BarChart3, ChevronLeft, ChevronRight, Sun, Moon, Plus, X, Loader2, Phone, Music, Mic, Clock, MapPin, Edit3, Trash2, CheckCircle, AlertCircle, Wallet, Receipt, Percent, LogOut, Lock, Mail, FileText, UtensilsCrossed, ClipboardList, XCircle, Banknote, ArrowLeftRight } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar } from 'recharts';
import { supabase } from './supabase';
import { jsPDF } from 'jspdf';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
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
    'Cazuelas': [],
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
    'Fin de Fiesta': [],
    'Bebidas': []
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
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
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
  const CONCEPTOS_EGRESO = ['R. Socios', 'Pagos extras', 'Aporte', 'Otros'];
  const RECEPTORES_EGRESO = ['Rodrigo', 'Francisco', 'Piru', 'Caja', 'Otros'];
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
  const [vistaCobranzas, setVistaCobranzas] = useState('estado'); // 'estado' o 'detalle'
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
  const [nuevoPago, setNuevoPago] = useState({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '' });
  const [editingPagoId, setEditingPagoId] = useState(null);
  const [auditoriaPagos, setAuditoriaPagos] = useState([]);
  const [auditoriaEventos, setAuditoriaEventos] = useState([]);
  const [informeActivo, setInformeActivo] = useState('eliminados');
  const [motivoModificacion, setMotivoModificacion] = useState('');

  // Estados para gestión de usuarios
  const [usuarios, setUsuarios] = useState([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [nuevoUsuario, setNuevoUsuario] = useState({ email: '', password: '', nombre: '', rol: 'lectura' });
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
    dj: '',
    tecnica_superior: false,
    otros: '',
    adultos: '',
    precio_adulto: '',
    menores: '',
    precio_menor: '',
    extra1_desc: '',
    extra1_valor: '',
    extra1_tipo: 'total',
    extra2_desc: '',
    extra2_valor: '',
    extra2_tipo: 'total',
    extra3_desc: '',
    extra3_valor: '',
    extra3_tipo: 'total',
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

  // Auth: mostrar login directamente
  useEffect(() => {
    setAuthLoading(false);
  }, []);

  // Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    // Login con clave única
    if (loginForm.password === 'admin1234') {
      setUser({ email: loginForm.email || 'usuario@eventos.com', id: 'temp-user' });
      setUserRole('admin');
      setLoginLoading(false);
      return;
    }

    setLoginError('Contraseña incorrecta');
    setLoginLoading(false);
  };

  // Logout
  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  useEffect(() => {
    if (user) {
      fetchEventos();
      fetchPagos();
      fetchMenus();
      fetchAuditoriaPagos();
      fetchAuditoriaEventos();
      fetchCajaMovimientos();
      fetchTipoCambio();
      if (userRole === 'admin') {
        fetchUsuarios();
      }
    }
  }, [user, userRole]);

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
      cobrador: nuevoPago.cobrador
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
      if (!error) {
        supabase.from('caja_movimientos').insert({
          tipo: 'ingreso',
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
      setNuevoPago({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '' });
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
      cobrador: pago.cobrador || ''
    });
    setShowPagoModal(true);
  };

  const handleDeletePago = async (pagoId, evento, pago) => {
    const motivo = prompt('Motivo de la anulación:');
    if (!motivo) return;

    const { error } = await supabase
      .from('pagos')
      .delete()
      .eq('id', pagoId);

    if (error) {
      console.error('Error:', error);
      alert('Error al eliminar el pago');
    } else {
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

    // 2. Agregar a la tabla usuarios con el rol
    const { error: dbError } = await supabase
      .from('usuarios')
      .insert([{
        user_id: authData.user.id,
        email: nuevoUsuario.email,
        nombre: nuevoUsuario.nombre,
        rol: nuevoUsuario.rol
      }]);

    if (dbError) {
      setUserError('Usuario creado pero error al asignar rol: ' + dbError.message);
    } else {
      setShowUserModal(false);
      setNuevoUsuario({ email: '', password: '', nombre: '', rol: 'lectura' });
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
      extras: nuevoMenu.extras
    };

    console.log('Guardando menú:', menuData);

    let result;
    if (editingMenu) {
      result = await supabase
        .from('menus')
        .update(menuData)
        .eq('id', editingMenu.id);
    } else {
      result = await supabase
        .from('menus')
        .insert([menuData]);
    }

    console.log('Resultado:', result);

    if (result.error) {
      console.error('Error:', result.error);
      alert('Error al guardar menú: ' + result.error.message);
    } else {
      setShowMenuModal(false);
      resetNuevoMenu();
      fetchMenus();
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

    const { error } = await supabase
      .from('menus')
      .update({ activo: false })
      .eq('id', menuId);

    if (!error) {
      fetchMenus();
    }
  };

  // Generar PDF del evento
  const generarPDF = (evento) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let y = 20;

    // Título
    doc.setFontSize(22);
    doc.setFont('helvetica', 'bold');
    doc.text('Confirmación de Evento', pageWidth / 2, y, { align: 'center' });
    y += 15;

    // Estado
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    const estado = evento.confirmado ? 'CONFIRMADO' : 'A CONFIRMAR';
    doc.setTextColor(evento.confirmado ? 34 : 180, evento.confirmado ? 139 : 130, evento.confirmado ? 34 : 0);
    doc.text(estado, pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 20;

    // Línea separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(20, y, pageWidth - 20, y);
    y += 15;

    // Datos del cliente
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Datos del Cliente', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Cliente: ${evento.cliente}`, 20, y);
    y += 7;
    if (evento.telefono) {
      doc.text(`Teléfono: ${evento.telefono}`, 20, y);
      y += 7;
    }
    y += 8;

    // Datos del evento
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Detalles del Evento', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');

    const fechaFormateada = new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
    doc.text(`Fecha: ${fechaFormateada}`, 20, y);
    y += 7;

    doc.text(`Turno: ${evento.turno}`, 20, y);
    y += 7;

    if (evento.hora_inicio || evento.hora_fin) {
      const horario = `${evento.hora_inicio || ''} - ${evento.hora_fin || ''}`.trim();
      if (horario !== '-') {
        doc.text(`Horario: ${horario}`, 20, y);
        y += 7;
      }
    }

    doc.text(`Tipo de Evento: ${evento.tipo_evento}`, 20, y);
    y += 7;

    doc.text(`Menú: ${evento.menu}`, 20, y);
    y += 7;

    doc.text(`Salón: ${evento.salon}`, 20, y);
    y += 12;

    // Cantidad de personas
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Cantidad de Personas', 20, y);
    y += 10;

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Adultos: ${evento.adultos}`, 20, y);
    y += 7;
    doc.text(`Menores: ${evento.menores}`, 20, y);
    y += 7;
    doc.text(`Total: ${(evento.adultos || 0) + (evento.menores || 0)} personas`, 20, y);
    y += 12;

    // Extras
    const extras = [];
    if (evento.extra1_desc) extras.push(evento.extra1_desc);
    if (evento.extra2_desc) extras.push(evento.extra2_desc);
    if (evento.extra3_desc) extras.push(evento.extra3_desc);

    if (extras.length > 0) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Extras Incluidos', 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      extras.forEach(extra => {
        doc.text(`• ${extra}`, 25, y);
        y += 7;
      });
      y += 5;
    }

    // Servicios técnicos
    if (evento.tecnica || evento.tecnica_superior || evento.dj) {
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Servicios Técnicos', 20, y);
      y += 10;

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (evento.tecnica) {
        doc.text(`• Técnica: Sí`, 25, y);
        y += 7;
      }
      if (evento.tecnica_superior) {
        doc.text(`• Técnica Superior: Sí`, 25, y);
        y += 7;
      }
      if (evento.dj) {
        doc.text(`• DJ: ${evento.dj}`, 25, y);
        y += 7;
      }
    }

    // Vendedor
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Vendedor: ${evento.vendedor}`, 20, y);

    // Fecha de generación
    y += 7;
    doc.text(`Documento generado: ${new Date().toLocaleDateString('es-AR')}`, 20, y);

    // Descargar
    const fileName = `Evento_${evento.cliente.replace(/\s+/g, '_')}_${evento.fecha}.pdf`;
    doc.save(fileName);
  };

  const generarCotizacion = (evento) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const menuDetalle = evento.menu_detalle;
    const margin = 10;

    // Función para dibujar marco en cada página
    const dibujarMarco = () => {
      doc.setDrawColor(41, 128, 185);
      doc.setLineWidth(0.5);
      doc.rect(margin, margin, pageWidth - margin * 2, pageHeight - margin * 2);
    };

    // Dibujar marco en la primera página
    dibujarMarco();

    const checkNewPage = (currentY, neededSpace = 30) => {
      if (currentY + neededSpace > pageHeight - 20) {
        doc.addPage();
        dibujarMarco();
        return 25;
      }
      return currentY;
    };

    // Logo - centrado y proporcionado
    try {
      const logoImg = new Image();
      logoImg.src = '/logo-tero.jpg';
      doc.addImage(logoImg, 'JPEG', pageWidth / 2 - 20, 15, 40, 28);
    } catch (e) {
      console.log('Logo no disponible');
    }

    // Encabezado (sin salón, va en detalles)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Av. Agustín García 9501, Benavídez', pageWidth / 2, 48, { align: 'center' });
    doc.text('Tel: 11-3112-8757 | Email: francisco.pidal@gmail.com', pageWidth / 2, 55, { align: 'center' });

    doc.setDrawColor(200, 200, 200);
    doc.line(20, 62, pageWidth - 20, 62);

    // Título
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('COTIZACIÓN DE EVENTO', pageWidth / 2, 72, { align: 'center' });

    // Fechas
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    const fechaCotizacion = new Date().toLocaleDateString('es-AR');
    const fechaValidez = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('es-AR');
    doc.text(`Fecha: ${fechaCotizacion}`, 20, 80);
    doc.text(`Válida hasta: ${fechaValidez}`, pageWidth - 20, 80, { align: 'right' });

    // Datos del cliente
    let y = 90;
    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 5, pageWidth - 40, 25, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('DATOS DEL CLIENTE', 25, y + 3);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    y += 12;
    doc.text(`Cliente: ${evento.cliente}`, 25, y);
    if (evento.telefono) {
      doc.text(`Teléfono: ${evento.telefono}`, pageWidth / 2, y);
    }

    // Detalles del evento
    y += 25;
    doc.setFillColor(41, 128, 185);
    doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DETALLES DEL EVENTO', 25, y + 2);

    doc.setTextColor(51, 51, 51);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 12;
    doc.text(`Fecha: ${new Date(evento.fecha + 'T12:00:00').toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`, 25, y);
    y += 6;
    doc.text(`Tipo de evento: ${evento.tipo_evento}`, 25, y);
    doc.text(`Salón: ${evento.salon}`, pageWidth / 2, y);
    y += 6;
    doc.text(`Turno: ${evento.turno}${evento.hora_inicio && evento.hora_fin ? ` (${evento.hora_inicio} a ${evento.hora_fin} hs)` : ''}`, 25, y);
    doc.text(`Invitados: ${evento.adultos || 0} adultos${evento.menores ? `, ${evento.menores} menores` : ''}`, pageWidth / 2, y);

    // MENÚ DETALLADO
    if (menuDetalle && menuDetalle.categorias) {
      y += 12;
      y = checkNewPage(y, 15);

      doc.setFillColor(100, 180, 230);
      doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`MENÚ: ${menuDetalle.nombre}`, 25, y + 2);

      y += 12;

      menuDetalle.categorias.forEach(categoria => {
        if (categoria.items && categoria.items.length > 0) {
          y = checkNewPage(y, 12 + categoria.items.length * 4);

          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(70, 150, 200);
          doc.text(categoria.nombre, 25, y);
          y += 5;

          doc.setFontSize(9);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(80, 80, 80);

          categoria.items.forEach(item => {
            y = checkNewPage(y, 4);
            doc.text(`• ${item}`, 30, y);
            y += 4;
          });
          y += 3;
        }
      });

      // Extras del menú
      if (menuDetalle.extras && menuDetalle.extras.length > 0) {
        y = checkNewPage(y, 15);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(16, 185, 129);
        doc.text('Extras Opcionales del Menú:', 25, y);
        y += 5;

        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(80, 80, 80);

        menuDetalle.extras.forEach(extra => {
          y = checkNewPage(y, 4);
          doc.text(`• ${extra}`, 30, y);
          y += 4;
        });
      }
    }

    // Detalle de precios
    y += 10;
    y = checkNewPage(y, 60);

    doc.setFillColor(41, 128, 185);
    doc.rect(20, y - 5, pageWidth - 40, 10, 'F');
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text('DETALLE DE PRECIOS', 25, y + 2);

    doc.setTextColor(51, 51, 51);
    y += 10;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('Concepto', 25, y);
    doc.text('Cant.', 100, y);
    doc.text('Precio Unit.', 125, y);
    doc.text('Subtotal', 165, y);

    doc.setDrawColor(200, 200, 200);
    y += 3;
    doc.line(25, y, pageWidth - 25, y);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    y += 6;

    const adultos = evento.adultos || 0;
    const precioAdulto = evento.precio_adulto || 0;
    doc.text('Adultos', 25, y);
    doc.text(adultos.toString(), 100, y);
    doc.text(`$${precioAdulto.toLocaleString('es-AR')}`, 125, y);
    doc.text(`$${(adultos * precioAdulto).toLocaleString('es-AR')}`, 165, y);
    y += 5;

    if (evento.menores > 0) {
      const menores = evento.menores || 0;
      const precioMenor = evento.precio_menor || 0;
      doc.text('Menores', 25, y);
      doc.text(menores.toString(), 100, y);
      doc.text(`$${precioMenor.toLocaleString('es-AR')}`, 125, y);
      doc.text(`$${(menores * precioMenor).toLocaleString('es-AR')}`, 165, y);
      y += 5;
    }

    [1, 2, 3].forEach(i => {
      const desc = evento[`extra${i}_desc`];
      const valor = evento[`extra${i}_valor`] || 0;
      const tipo = evento[`extra${i}_tipo`];
      if (desc && valor > 0) {
        const subtotal = tipo === 'por_persona' ? valor * adultos : valor;
        doc.text(desc, 25, y);
        doc.text(tipo === 'por_persona' ? adultos.toString() : '1', 100, y);
        doc.text(`$${valor.toLocaleString('es-AR')}`, 125, y);
        doc.text(`$${subtotal.toLocaleString('es-AR')}`, 165, y);
        y += 5;
      }
    });

    doc.line(25, y, pageWidth - 25, y);
    y += 6;

    // Calcular subtotal, IVA y total
    const subtotal = evento.totalEvento || evento.total_evento || 0;
    const iva = subtotal * 0.21;
    const totalConIva = subtotal + iva;

    // Subtotal
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('SUBTOTAL:', 125, y);
    doc.text(`$${subtotal.toLocaleString('es-AR')}`, 165, y);
    y += 5;

    // IVA 21%
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('IVA 21%:', 125, y);
    doc.text(`$${Math.round(iva).toLocaleString('es-AR')}`, 165, y);
    y += 6;

    // Total con IVA
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(41, 128, 185);
    doc.text('TOTAL:', 125, y);
    doc.text(`$${Math.round(totalConIva).toLocaleString('es-AR')}`, 165, y);

    // Servicios adicionales (Técnica, DJ, etc.)
    const tieneServicios = evento.tecnica || evento.tecnica_superior || evento.dj;
    if (tieneServicios) {
      y += 10;
      y = checkNewPage(y, 25);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 150, 200);
      doc.text('SERVICIOS ADICIONALES:', 25, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      if (evento.tecnica) {
        doc.text('• Técnica de sonido e iluminación', 30, y);
        y += 4;
      }
      if (evento.tecnica_superior) {
        doc.text('• Técnica superior (equipamiento premium)', 30, y);
        y += 4;
      }
      if (evento.dj) {
        doc.text(`• DJ: ${evento.dj}`, 30, y);
        y += 4;
      }
    }

    // Extras del evento
    const tieneExtrasEvento = evento.extra1_desc || evento.extra2_desc || evento.extra3_desc;
    if (tieneExtrasEvento) {
      y += 6;
      y = checkNewPage(y, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 150, 200);
      doc.text('EXTRAS INCLUIDOS:', 25, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      if (evento.extra1_desc) {
        doc.text(`• ${evento.extra1_desc}`, 30, y);
        y += 4;
      }
      if (evento.extra2_desc) {
        doc.text(`• ${evento.extra2_desc}`, 30, y);
        y += 4;
      }
      if (evento.extra3_desc) {
        doc.text(`• ${evento.extra3_desc}`, 30, y);
        y += 4;
      }
    }

    // Observaciones
    if (evento.otros) {
      y += 6;
      y = checkNewPage(y, 20);

      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(70, 150, 200);
      doc.text('OBSERVACIONES:', 25, y);
      y += 5;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(80, 80, 80);

      const obsLines = doc.splitTextToSize(evento.otros, pageWidth - 60);
      obsLines.forEach(line => {
        y = checkNewPage(y, 5);
        doc.text(line, 30, y);
        y += 4;
      });
    }

    // Condiciones de pago
    y += 8;
    y = checkNewPage(y, 35);

    doc.setFillColor(245, 245, 245);
    doc.rect(20, y - 5, pageWidth - 40, 32, 'F');

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(51, 51, 51);
    doc.text('CONDICIONES', 25, y + 2);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    y += 10;
    doc.text('• Seña del 50% para confirmar el evento', 25, y);
    y += 5;
    doc.text('• El saldo se ajustará por IPC al momento del pago', 25, y);
    y += 5;
    doc.text('• Cancelación: hasta 7 días antes del evento', 25, y);
    y += 5;
    doc.text('• Cotización válida por 15 días', 25, y);

    // Pie de página
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text('Gracias por confiar en nosotros', pageWidth / 2, pageHeight - 15, { align: 'center' });
    }

    const fileName = `Cotizacion_${evento.cliente.replace(/\s+/g, '_')}_${evento.fecha}.pdf`;
    doc.save(fileName);
  };

  const calcularTotal = () => {
    const adultos = parseInt(nuevoEvento.adultos) || 0;
    const precioAdulto = parseFloat(nuevoEvento.precio_adulto) || 0;
    const menores = parseInt(nuevoEvento.menores) || 0;
    const precioMenor = parseFloat(nuevoEvento.precio_menor) || 0;

    let totalExtras = 0;
    [1, 2, 3].forEach(i => {
      const valor = parseFloat(nuevoEvento[`extra${i}_valor`]) || 0;
      const tipo = nuevoEvento[`extra${i}_tipo`];
      totalExtras += tipo === 'por_persona' ? valor * adultos : valor;
    });

    return (adultos * precioAdulto) + (menores * precioMenor) + totalExtras;
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
        dj: nuevoEvento.dj,
        tecnica_superior: nuevoEvento.tecnica_superior,
        otros: nuevoEvento.otros,
        adultos: parseInt(nuevoEvento.adultos) || 0,
        precio_adulto: parseFloat(nuevoEvento.precio_adulto) || 0,
        menores: parseInt(nuevoEvento.menores) || 0,
        precio_menor: parseFloat(nuevoEvento.precio_menor) || 0,
        extra1_desc: nuevoEvento.extra1_desc,
        extra1_valor: parseFloat(nuevoEvento.extra1_valor) || 0,
        extra1_tipo: nuevoEvento.extra1_tipo,
        extra2_desc: nuevoEvento.extra2_desc,
        extra2_valor: parseFloat(nuevoEvento.extra2_valor) || 0,
        extra2_tipo: nuevoEvento.extra2_tipo,
        extra3_desc: nuevoEvento.extra3_desc,
        extra3_valor: parseFloat(nuevoEvento.extra3_valor) || 0,
        extra3_tipo: nuevoEvento.extra3_tipo,
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
        dj: '',
        tecnica_superior: false,
        otros: '',
        adultos: '',
        precio_adulto: '',
        menores: '',
        precio_menor: '',
        extra1_desc: '',
        extra1_valor: '',
        extra1_tipo: 'total',
        extra2_desc: '',
        extra2_valor: '',
        extra2_tipo: 'total',
        extra3_desc: '',
        extra3_valor: '',
        extra3_tipo: 'total',
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
      dj: evento.dj || '',
      tecnica_superior: evento.tecnica_superior || false,
      otros: evento.otros || '',
      adultos: evento.adultos?.toString() || '',
      precio_adulto: evento.precio_adulto?.toString() || '',
      menores: evento.menores?.toString() || '',
      precio_menor: evento.precio_menor?.toString() || '',
      extra1_desc: evento.extra1_desc || '',
      extra1_valor: evento.extra1_valor?.toString() || '',
      extra1_tipo: evento.extra1_tipo || 'total',
      extra2_desc: evento.extra2_desc || '',
      extra2_valor: evento.extra2_valor?.toString() || '',
      extra2_tipo: evento.extra2_tipo || 'total',
      extra3_desc: evento.extra3_desc || '',
      extra3_valor: evento.extra3_valor?.toString() || '',
      extra3_tipo: evento.extra3_tipo || 'total',
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
      const valor = parseFloat(eventoEdit[`extra${i}_valor`]) || 0;
      const tipo = eventoEdit[`extra${i}_tipo`];
      totalExtras += tipo === 'por_persona' ? valor * adultos : valor;
    });

    return (adultos * precioAdulto) + (menores * precioMenor) + totalExtras;
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
        dj: eventoEdit.dj,
        tecnica_superior: eventoEdit.tecnica_superior,
        otros: eventoEdit.otros,
        adultos: parseInt(eventoEdit.adultos) || 0,
        precio_adulto: parseFloat(eventoEdit.precio_adulto) || 0,
        menores: parseInt(eventoEdit.menores) || 0,
        precio_menor: parseFloat(eventoEdit.precio_menor) || 0,
        extra1_desc: eventoEdit.extra1_desc,
        extra1_valor: parseFloat(eventoEdit.extra1_valor) || 0,
        extra1_tipo: eventoEdit.extra1_tipo,
        extra2_desc: eventoEdit.extra2_desc,
        extra2_valor: parseFloat(eventoEdit.extra2_valor) || 0,
        extra2_tipo: eventoEdit.extra2_tipo,
        extra3_desc: eventoEdit.extra3_desc,
        extra3_valor: parseFloat(eventoEdit.extra3_valor) || 0,
        extra3_tipo: eventoEdit.extra3_tipo,
        total_evento: total,
        confirmado: eventoEdit.confirmado,
        menu_detalle: eventoEdit.menu_detalle
      })
      .eq('id', eventoEdit.id);
    
    if (error) {
      console.error('Error:', error);
      alert('Error al actualizar el evento');
    } else {
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
    const totalEventos = eventosDelAño.length;
    const totalFacturado = eventosDelAño.reduce((sum, e) => sum + e.totalEvento, 0);
    const totalAdultos = eventosDelAño.reduce((sum, e) => sum + e.adultos, 0);
    return { totalEventos, totalFacturado, totalAdultos };
  }, [eventosDelAño]);

  const eventosPorMes = useMemo(() => {
    const orden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const grouped = eventosDelAño.reduce((acc, e) => {
      acc[e.mes] = (acc[e.mes] || 0) + e.totalEvento;
      return acc;
    }, {});
    return orden.filter(m => grouped[m]).map(mes => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), total: grouped[mes] }));
  }, [eventosDelAño]);

  const eventosPorVendedor = useMemo(() => {
    const grouped = eventosDelAño.reduce((acc, e) => {
      acc[e.vendedor] = (acc[e.vendedor] || 0) + e.totalEvento;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [eventosDelAño]);

  const eventosPorTipo = useMemo(() => {
    const grouped = eventosDelAño.reduce((acc, e) => {
      acc[e.tipoEvento] = (acc[e.tipoEvento] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const eventosPorMenu = useMemo(() => {
    const grouped = eventosDelAño.reduce((acc, e) => {
      const menu = e.menu || 'Sin menú';
      acc[menu] = (acc[menu] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const eventosPorSalon = useMemo(() => {
    const grouped = eventosDelAño.reduce((acc, e) => {
      const salon = e.salon || 'Tero';
      acc[salon] = (acc[salon] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  const comensalesPorMes = useMemo(() => {
    const orden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const grouped = eventosDelAño.reduce((acc, e) => {
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
      .filter(e => new Date(e.fecha + 'T12:00:00') >= hoy && e.confirmado === true && !e.anulado)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosDelAño]);

  // Eventos a confirmar (no confirmados, desde hoy en adelante, del año seleccionado)
  const eventosAConfirmar = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventosDelAño
      .filter(e => new Date(e.fecha + 'T12:00:00') >= hoy && !e.confirmado && !e.anulado)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosDelAño]);

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
    return eventosDelAño.filter(evento => evento.confirmado).map(evento => {
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
    return { totalFacturado, totalCobrado, totalPendiente, eventosConSaldo };
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
              <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
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
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Evento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Fecha y Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={nuevoEvento.fecha}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cliente *</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del cliente"
                    value={nuevoEvento.cliente}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, cliente: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Teléfono y Vendedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Número de teléfono"
                    value={nuevoEvento.telefono}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vendedor</label>
                  <select
                    value={nuevoEvento.vendedor}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, vendedor: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Turno y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Turno</label>
                  <select
                    value={nuevoEvento.turno}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, turno: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={nuevoEvento.hora_inicio}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, hora_inicio: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={nuevoEvento.hora_fin}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, hora_fin: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
              </div>

              {/* Tipo de Evento y Salón */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tipo de Evento</label>
                  <select
                    value={nuevoEvento.tipo_evento}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tipo_evento: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Salón</label>
                  <select
                    value={nuevoEvento.salon}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, salon: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {SALONES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Menú Base y Menú Detallado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menú Base</label>
                  <select
                    value={nuevoEvento.menu}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, menu: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menú Detallado (para cotización)</label>
                  <select
                    value={nuevoEvento.menu_detalle?.id || ''}
                    onChange={(e) => {
                      const selectedMenu = menus.find(m => m.id === e.target.value);
                      setNuevoEvento({...nuevoEvento, menu_detalle: selectedMenu || null});
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Sin menú detallado</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Técnica, DJ, Técnica Superior */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="checkbox"
                    id="tecnica"
                    checked={nuevoEvento.tecnica}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica: e.target.checked})}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                  <label htmlFor="tecnica" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Mic className="w-4 h-4 text-purple-400" />
                    Técnica
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="checkbox"
                    id="tecnica_superior"
                    checked={nuevoEvento.tecnica_superior}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, tecnica_superior: e.target.checked})}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                  <label htmlFor="tecnica_superior" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Mic className="w-4 h-4 text-amber-400" />
                    Técnica Superior
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">DJ</label>
                  <input
                    type="text"
                    placeholder="Nombre del DJ"
                    value={nuevoEvento.dj}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, dj: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Adultos y Menores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Adultos *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Cantidad"
                    value={nuevoEvento.adultos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, adultos: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Precio Adulto $</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Precio"
                    value={formatNumberInput(nuevoEvento.precio_adulto)}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_adulto: parseNumberInput(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menores</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="Cantidad"
                    value={nuevoEvento.menores}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, menores: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Precio Menor $</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Precio"
                    value={formatNumberInput(nuevoEvento.precio_menor)}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_menor: parseNumberInput(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-3">
                <label className="block text-sm text-slate-400">Extras</label>
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        placeholder={`Descripción extra ${i}`}
                        value={nuevoEvento[`extra${i}_desc`]}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_desc`]: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-sm"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Valor $"
                        value={formatNumberInput(nuevoEvento[`extra${i}_valor`])}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_valor`]: parseNumberInput(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-sm"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <select
                        value={nuevoEvento[`extra${i}_tipo`]}
                        onChange={(e) => setNuevoEvento({...nuevoEvento, [`extra${i}_tipo`]: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                      >
                        <option value="total">Valor Total</option>
                        <option value="por_persona">Por Persona</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total calculado */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-slate-400">Total Evento</p>
                <p className="text-2xl font-bold text-emerald-400 mono">{formatCurrency(calcularTotal())}</p>
              </div>

              {/* Otros */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Otros / Aclaraciones</label>
                <textarea
                  placeholder="Notas adicionales..."
                  value={nuevoEvento.otros}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, otros: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Agregar Evento'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalle Evento */}
      {selectedEvento && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-5 w-full max-w-md">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xl font-bold">{selectedEvento.cliente}</h2>
              <button onClick={() => setSelectedEvento(null)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Botones PDF y Cotización arriba */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => generarCotizacion(selectedEvento)}
                className="px-3 py-2 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-all border border-blue-500/30 flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Cotización
              </button>
              <button
                onClick={() => generarPDF(selectedEvento)}
                className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all border border-emerald-500/30 flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                PDF
              </button>
            </div>

            {/* Estado de confirmación */}
            <div className={`mb-3 p-2 rounded-xl flex items-center justify-between ${selectedEvento.confirmado ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-amber-500/10 border border-amber-500/30'}`}>
              <div className="flex items-center gap-2">
                {selectedEvento.confirmado ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-400" />
                    <span className="text-emerald-400 text-sm font-medium">Confirmado</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-amber-400" />
                    <span className="text-amber-400 text-sm font-medium">Pendiente</span>
                  </>
                )}
              </div>
              {canEdit && (
                <button
                  onClick={() => handleConfirmarEvento(selectedEvento, !selectedEvento.confirmado)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium transition-all border ${
                    selectedEvento.confirmado
                      ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30 border-amber-500/30'
                      : 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border-emerald-500/30'
                  }`}
                >
                  {selectedEvento.confirmado ? 'Desconfirmar' : 'Confirmar'}
                </button>
              )}
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Fecha</p>
                  <p className="text-sm font-medium">{formatDate(selectedEvento.fecha)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Turno</p>
                  <p className="text-sm font-medium">{selectedEvento.turno}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Salón</p>
                  <p className="text-sm font-medium">{selectedEvento.salon || 'Tero'}</p>
                </div>
              </div>

              {selectedEvento.telefono && (
                <div className="bg-white/5 rounded-xl p-2 flex items-center gap-2">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span className="text-sm">{selectedEvento.telefono}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Tipo</p>
                  <p className="text-sm font-medium">{selectedEvento.tipoEvento}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Menú</p>
                  <p className="text-sm font-medium">{selectedEvento.menu}</p>
                </div>
              </div>

              {(selectedEvento.tecnica || selectedEvento.tecnica_superior || selectedEvento.dj) && (
                <div className="flex gap-2 flex-wrap">
                  {selectedEvento.tecnica && (
                    <span className="px-2 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Técnica
                    </span>
                  )}
                  {selectedEvento.tecnica_superior && (
                    <span className="px-2 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Mic className="w-3 h-3" /> Téc. Superior
                    </span>
                  )}
                  {selectedEvento.dj && (
                    <span className="px-2 py-1 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                      <Music className="w-3 h-3" /> DJ
                    </span>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Adultos</p>
                  <p className="text-sm font-medium">{selectedEvento.adultos} × {formatCurrency(selectedEvento.precio_adulto || 0)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Menores</p>
                  <p className="text-sm font-medium">{selectedEvento.menores || 0} × {formatCurrency(selectedEvento.precio_menor || 0)}</p>
                </div>
              </div>

              {selectedEvento.otros && (
                <div className="bg-white/5 rounded-xl p-2">
                  <p className="text-xs text-slate-400">Notas</p>
                  <p className="text-xs">{selectedEvento.otros}</p>
                </div>
              )}

              <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-xs text-slate-400">Total Evento</p>
                <p className="text-xl font-bold text-emerald-400 mono">{formatCurrency(selectedEvento.totalEvento)}</p>
              </div>

              {/* Botones Editar y Eliminar */}
              {(canEdit || canDelete) && (
                <div className="flex gap-3 pt-2">
                  {canEdit && (
                    <button
                      onClick={() => handleEdit(selectedEvento)}
                      className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                    >
                      <Edit3 className="w-4 h-4" />
                      Editar
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleAnularEvento(selectedEvento)}
                      className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="glass rounded-2xl p-4 w-full max-w-2xl my-auto">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold">Editar Evento</h2>
              <button onClick={() => { setEditMode(false); setEventoEdit(null); }} className="p-1.5 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-2">
              {/* Fecha y Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={eventoEdit.fecha}
                    onChange={(e) => setEventoEdit({...eventoEdit, fecha: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Cliente *</label>
                  <input
                    type="text"
                    required
                    value={eventoEdit.cliente}
                    onChange={(e) => setEventoEdit({...eventoEdit, cliente: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Teléfono y Vendedor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    value={eventoEdit.telefono}
                    onChange={(e) => setEventoEdit({...eventoEdit, telefono: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Vendedor</label>
                  <select
                    value={eventoEdit.vendedor}
                    onChange={(e) => setEventoEdit({...eventoEdit, vendedor: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {VENDEDORES.map(v => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>
              
              {/* Turno y Horarios */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Turno</label>
                  <select
                    value={eventoEdit.turno}
                    onChange={(e) => setEventoEdit({...eventoEdit, turno: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {TURNOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    value={eventoEdit.hora_inicio}
                    onChange={(e) => setEventoEdit({...eventoEdit, hora_inicio: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    value={eventoEdit.hora_fin}
                    onChange={(e) => setEventoEdit({...eventoEdit, hora_fin: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/20 bg-white/10 text-white focus:outline-none focus:border-purple-500/50 [&::-webkit-calendar-picker-indicator]:invert [&::-webkit-calendar-picker-indicator]:brightness-200"
                  />
                </div>
              </div>

              {/* Tipo de Evento y Salón */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tipo de Evento</label>
                  <select
                    value={eventoEdit.tipo_evento}
                    onChange={(e) => setEventoEdit({...eventoEdit, tipo_evento: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {TIPOS_EVENTO.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Salón</label>
                  <select
                    value={eventoEdit.salon}
                    onChange={(e) => setEventoEdit({...eventoEdit, salon: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {SALONES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              {/* Menú Base y Menú Detallado */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menú Base</label>
                  <select
                    value={eventoEdit.menu}
                    onChange={(e) => setEventoEdit({...eventoEdit, menu: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menú Detallado (para cotización)</label>
                  <select
                    value={eventoEdit.menu_detalle?.id || ''}
                    onChange={(e) => {
                      const selectedMenu = menus.find(m => m.id === e.target.value);
                      setEventoEdit({...eventoEdit, menu_detalle: selectedMenu || null});
                    }}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="">Sin menú detallado</option>
                    {menus.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                  </select>
                </div>
              </div>

              {/* Técnica, DJ, Técnica Superior */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="checkbox"
                    id="tecnica_edit"
                    checked={eventoEdit.tecnica}
                    onChange={(e) => setEventoEdit({...eventoEdit, tecnica: e.target.checked})}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                  <label htmlFor="tecnica_edit" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Mic className="w-4 h-4 text-purple-400" />
                    Técnica
                  </label>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5">
                  <input
                    type="checkbox"
                    id="tecnica_superior_edit"
                    checked={eventoEdit.tecnica_superior}
                    onChange={(e) => setEventoEdit({...eventoEdit, tecnica_superior: e.target.checked})}
                    className="w-5 h-5 rounded accent-purple-500"
                  />
                  <label htmlFor="tecnica_superior_edit" className="flex items-center gap-2 text-sm cursor-pointer">
                    <Mic className="w-4 h-4 text-amber-400" />
                    Técnica Superior
                  </label>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">DJ</label>
                  <input
                    type="text"
                    value={eventoEdit.dj}
                    onChange={(e) => setEventoEdit({...eventoEdit, dj: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Adultos y Menores */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Adultos *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={eventoEdit.adultos}
                    onChange={(e) => setEventoEdit({...eventoEdit, adultos: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Precio Adulto $</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberInput(eventoEdit.precio_adulto)}
                    onChange={(e) => setEventoEdit({...eventoEdit, precio_adulto: parseNumberInput(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Menores</label>
                  <input
                    type="number"
                    min="0"
                    value={eventoEdit.menores}
                    onChange={(e) => setEventoEdit({...eventoEdit, menores: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Precio Menor $</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatNumberInput(eventoEdit.precio_menor)}
                    onChange={(e) => setEventoEdit({...eventoEdit, precio_menor: parseNumberInput(e.target.value)})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              {/* Extras */}
              <div className="space-y-3">
                <label className="block text-sm text-slate-400">Extras</label>
                {[1, 2, 3].map(i => (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-12 gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="md:col-span-5">
                      <input
                        type="text"
                        placeholder={`Descripción extra ${i}`}
                        value={eventoEdit[`extra${i}_desc`]}
                        onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_desc`]: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-sm"
                      />
                    </div>
                    <div className="md:col-span-3">
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="Valor $"
                        value={formatNumberInput(eventoEdit[`extra${i}_valor`])}
                        onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_valor`]: parseNumberInput(e.target.value)})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 text-sm"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <select
                        value={eventoEdit[`extra${i}_tipo`]}
                        onChange={(e) => setEventoEdit({...eventoEdit, [`extra${i}_tipo`]: e.target.value})}
                        className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 text-sm"
                      >
                        <option value="total">Valor Total</option>
                        <option value="por_persona">Por Persona</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total calculado */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-slate-400">Total Evento</p>
                <p className="text-2xl font-bold text-emerald-400 mono">{formatCurrency(calcularTotalEdit())}</p>
              </div>

              {/* Otros */}
              <div>
                <label className="block text-sm text-slate-400 mb-1">Otros / Aclaraciones</label>
                <textarea
                  value={eventoEdit.otros}
                  onChange={(e) => setEventoEdit({...eventoEdit, otros: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Edit3 className="w-5 h-5" />}
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
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
              <button onClick={() => { setShowPagoModal(false); setSelectedEventoPago(null); setEditingPagoId(null); setNuevoPago({ fecha: '', monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '', cobrador: '' }); }} className="p-1.5 hover:bg-white/10 rounded-lg">
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

      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Gestión de Eventos
                </h1>
                <p className="text-sm text-slate-400">Panel de Control</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Selector de Año */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <Calendar className="w-4 h-4 text-slate-400" />
                <select
                  value={filterYear}
                  onChange={(e) => setFilterYear(Number(e.target.value))}
                  className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
                >
                  {yearsDisponibles.map(year => (
                    <option key={year} value={year} className="bg-slate-900">{year}</option>
                  ))}
                </select>
              </div>
              {canCreate && (
                <button
                  onClick={() => setShowModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  <span className="hidden sm:inline">Nuevo Evento</span>
                </button>
              )}
              <div className="flex items-center gap-2">
                <span className={`px-2 py-1 rounded-lg text-xs font-medium ${
                  userRole === 'admin' ? 'bg-purple-500/20 text-purple-300' :
                  userRole === 'vendedor' ? 'bg-blue-500/20 text-blue-300' :
                  'bg-slate-500/20 text-slate-300'
                }`}>
                  {userRole === 'admin' ? 'Admin' : userRole === 'vendedor' ? 'Vendedor' : 'Lectura'}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  title={user?.email}
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-1 p-1 glass rounded-2xl overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'proximos', label: 'Próximos', icon: Clock },
            { id: 'aconfirmar', label: 'A Confirmar', icon: AlertCircle },
            { id: 'realizados', label: 'Realizados', icon: CheckCircle },
            { id: 'calendario', label: 'Calendario', icon: Calendar },
            { id: 'eventos', label: 'Eventos', icon: Briefcase },
            { id: 'cobranzas', label: 'Cobranzas', icon: Wallet },
            { id: 'menus', label: 'Menús', icon: UtensilsCrossed },
            { id: 'informes', label: 'Informes', icon: ClipboardList },
            ...(userRole === 'admin' ? [{ id: 'usuarios', label: 'Usuarios', icon: Users }] : []),
            { id: 'caja', label: 'Caja', icon: Banknote },
          ].map(tab => (
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-all text-xs font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pb-12">
        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Total Eventos', value: stats.totalEventos, icon: Calendar, color: 'from-indigo-500 to-blue-600' },
                { label: 'Facturación Total', value: stats.totalFacturado, icon: DollarSign, color: 'from-emerald-500 to-teal-600', format: true },
                { label: 'Total Invitados', value: stats.totalAdultos, icon: Users, color: 'from-amber-500 to-orange-600' },
                { label: 'Promedio x Evento', value: stats.totalEventos > 0 ? stats.totalFacturado / stats.totalEventos : 0, icon: TrendingUp, color: 'from-rose-500 to-pink-600', format: true },
              ].map((stat, i) => (
                <div key={i} className="stat-card glass rounded-2xl p-5 glow">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-slate-400 text-xs sm:text-sm mb-1">{stat.label}</p>
                      <p className="text-lg sm:text-2xl font-bold mono">
                        {stat.format ? formatCurrency(stat.value) : stat.value.toLocaleString('es-AR')}
                      </p>
                    </div>
                    <div className={`w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center`}>
                      <stat.icon className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Próximo Evento */}
            {proximosEventos.length > 0 && (
              <div
                className="glass rounded-2xl p-5 glow cursor-pointer hover:border-purple-500/30 border border-transparent transition-all"
                onClick={() => setSelectedEvento(proximosEventos[0])}
              >
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-400" />
                  Próximo Evento
                </h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold">{new Date(proximosEventos[0].fecha + 'T12:00:00').getDate()}</span>
                    <span className="text-xs uppercase">{new Date(proximosEventos[0].fecha + 'T12:00:00').toLocaleDateString('es-AR', { month: 'short' })}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-semibold">{proximosEventos[0].cliente}</p>
                    <p className="text-slate-400 text-sm">{proximosEventos[0].tipoEvento} - {proximosEventos[0].turno}</p>
                    <p className="text-slate-500 text-sm">{proximosEventos[0].adultos} adultos • {proximosEventos[0].salon || 'Tero'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-emerald-400 font-bold mono">{formatCurrency(proximosEventos[0].totalEvento)}</p>
                    <p className="text-slate-500 text-xs">{proximosEventos[0].vendedor}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="glass rounded-2xl p-6 glow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-400" />
                  Facturación por Mes
                </h3>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={eventosPorMes}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="mes" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} tickFormatter={v => `$${(v/1000000).toFixed(0)}M`} />
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: 'white' }}
                      formatter={(value) => [formatCurrency(value), 'Total']}
                    />
                    <Area type="monotone" dataKey="total" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorTotal)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="glass rounded-2xl p-6 glow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Users className="w-5 h-5 text-purple-400" />
                  Ventas por Vendedor
                </h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={eventosPorVendedor} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                      {eventosPorVendedor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1e293b', border: '1px solid #8b5cf6', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                      itemStyle={{ color: '#fff' }}
                      formatter={(value) => [formatCurrency(value), 'Facturado']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-3 flex-wrap">
                  {eventosPorVendedor.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: `${COLORS[i]}20` }}>
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="font-medium" style={{ color: COLORS[i] }}>{v.name}</span>
                      <span className="text-slate-400 text-xs ml-1">{formatCurrency(v.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Gráfico de Comensales por Mes */}
            <div className="glass rounded-2xl p-6 glow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" />
                Comensales por Mes
              </h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={comensalesPorMes}>
                  <XAxis dataKey="mes" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#1e293b', border: '1px solid #06b6d4', borderRadius: '12px', color: '#fff', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="adultos" name="Adultos" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="menores" name="Menores" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-slate-300 text-sm">Adultos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-cyan-500" />
                  <span className="text-slate-300 text-sm">Menores</span>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 glow">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-pink-400" />
                Tipos de Evento
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {eventosPorTipo.slice(0, 12).map((tipo) => (
                  <div key={tipo.name} className="bg-white/5 rounded-xl p-4 text-center border border-white/5 hover:border-purple-500/30 transition-all">
                    <p className="text-2xl font-bold text-purple-400 mono">{tipo.value}</p>
                    <p className="text-xs text-slate-400 mt-1 truncate">{tipo.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Eventos por Menú */}
              <div className="glass rounded-2xl p-6 glow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <UtensilsCrossed className="w-5 h-5 text-emerald-400" />
                  Eventos por Menú
                </h3>
                <div className="space-y-3">
                  {eventosPorMenu.map((menu, idx) => {
                    const maxValue = Math.max(...eventosPorMenu.map(m => m.value));
                    const percentage = (menu.value / maxValue) * 100;
                    return (
                      <div key={menu.name} className="flex items-center gap-3">
                        <div className="w-24 text-sm text-slate-300 truncate">{menu.name}</div>
                        <div className="flex-1 h-8 bg-white/5 rounded-lg overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-lg flex items-center justify-end pr-2 transition-all"
                            style={{ width: `${percentage}%` }}
                          >
                            <span className="text-xs font-bold text-white">{menu.value}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Eventos por Salón */}
              <div className="glass rounded-2xl p-6 glow">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  Eventos por Salón
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {eventosPorSalon.map((salon, idx) => {
                    const colores = ['from-amber-500 to-orange-500', 'from-blue-500 to-cyan-500', 'from-purple-500 to-pink-500'];
                    return (
                      <div key={salon.name} className="text-center">
                        <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${colores[idx % colores.length]} flex items-center justify-center mb-3`}>
                          <span className="text-2xl font-bold text-white">{salon.value}</span>
                        </div>
                        <p className="text-sm text-slate-300 font-medium">{salon.name}</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Próximos Eventos</h2>
                <p className="text-slate-400">{proximosEventos.length} eventos programados</p>
              </div>
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
                    onClick={() => setSelectedEvento(e)}
                    className="glass rounded-2xl p-5 glow cursor-pointer hover:border-purple-500/30 border border-transparent transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
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

                      {/* Total */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-xl font-bold text-emerald-400 mono">{formatCurrency(e.totalEvento)}</p>
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
                    onClick={() => setSelectedEvento(e)}
                    className="glass rounded-2xl p-5 glow cursor-pointer hover:border-emerald-500/30 border border-transparent transition-all opacity-90"
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
                        <p className="text-xl font-bold text-emerald-400 mono">{formatCurrency(e.totalEvento)}</p>
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
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold">Cotizaciones a Confirmar</h2>
                <p className="text-slate-400">{eventosAConfirmar.length} pendientes de confirmación</p>
              </div>
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
                    onClick={() => setSelectedEvento(e)}
                    className="glass rounded-2xl p-5 glow cursor-pointer hover:border-amber-500/30 border border-amber-500/20 transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center gap-4">
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
                      </div>

                      {/* Total */}
                      <div className="flex-shrink-0 text-right">
                        <p className="text-xs text-slate-400">Total</p>
                        <p className="text-xl font-bold text-emerald-400 mono">{formatCurrency(e.totalEvento)}</p>
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
                    <button
                      key={i}
                      onClick={() => setSelectedEvento(e)}
                      className={`w-full text-left rounded-xl p-4 border transition-all ${
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
                      <p className="text-emerald-400 font-semibold text-sm mt-2">{formatCurrency(e.totalEvento)}</p>
                    </button>
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
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventos.map((e, i) => (
                      <tr 
                        key={e.id || i} 
                        className="border-b border-white/5 row-hover transition-colors cursor-pointer"
                        onClick={() => setSelectedEvento(e)}
                      >
                        <td className="px-5 py-4 mono text-sm">{formatDate(e.fecha)}</td>
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
                        <td className="px-5 py-4 text-right mono hidden sm:table-cell">{e.adultos + (e.menores || 0)}</td>
                        <td className="px-5 py-4 text-right font-semibold text-emerald-400 mono">{formatCurrency(e.totalEvento)}</td>
                      </tr>
                    ))}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/20">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Facturado</span>
                </div>
                <p className="text-2xl font-bold text-white mono">{formatCurrency(statsCobranzas.totalFacturado)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20">
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-sm text-slate-400">Total Cobrado</span>
                </div>
                <p className="text-2xl font-bold text-emerald-400 mono">{formatCurrency(statsCobranzas.totalCobrado)}</p>
              </div>
              <div className="glass rounded-2xl p-5 glow">
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/20">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                  </div>
                  <span className="text-sm text-slate-400">Pendiente</span>
                </div>
                <p className="text-2xl font-bold text-amber-400 mono">{formatCurrency(statsCobranzas.totalPendiente)}</p>
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
                    type="number"
                    value={tipoCambio}
                    onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
                    className="w-24 px-2 py-1 rounded border border-white/10 bg-white/5 text-blue-400 text-2xl font-bold"
                  />
                </div>
              </div>
            </div>

            {/* Selector de vista */}
            <div className="flex gap-3">
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
                        <td className="px-5 py-4 text-right mono">{formatCurrency(evento.totalEvento)}</td>
                        <td className="px-5 py-4 text-right text-emerald-400 mono">{formatCurrency(evento.pagosYSenas)}</td>
                        <td className="px-5 py-4 text-right">
                          {evento.ajustesIPC > 0 ? (
                            <span className="text-amber-400 mono">+{formatCurrency(evento.ajustesIPC)}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-right mono font-medium">{formatCurrency(evento.totalPagado)}</td>
                        <td className="px-5 py-4 text-right">
                          <span className={`font-semibold mono ${evento.saldo > 0 ? 'text-amber-400' : evento.saldo < 0 ? 'text-blue-400' : 'text-emerald-400'}`}>
                            {formatCurrency(evento.saldo)}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          {canCreate && (
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => {
                                  setSelectedEventoPago(evento);
                                  setNuevoPago({ fecha: new Date().toISOString().split('T')[0], monto: '', concepto: 'pago', porcentajeIPC: '', moneda: 'ARS', cotizacionDolar: '' });
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
                <h3 className="text-lg font-semibold mb-4">Detalle de pagos</h3>
              <div className="space-y-4">
                {cobranzasData.filter(e => e.pagos.length > 0).map(evento => (
                  <div key={evento.id} className="p-4 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-semibold">{evento.cliente}</p>
                        <p className="text-sm text-slate-400">{formatDate(evento.fecha)} - {evento.tipoEvento}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-400">Saldo</p>
                        <p className={`font-semibold mono ${evento.saldo > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {formatCurrency(evento.saldo)}
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
                            <span className={`font-medium mono ${pago.concepto === 'ajuste_ipc' ? 'text-amber-400' : 'text-emerald-400'}`}>
                              {pago.concepto === 'ajuste_ipc' ? '+' : ''}
                              {pago.moneda === 'USD' ? (
                                <>
                                  <span className="text-green-400">US$ {(pago.monto_original || pago.monto).toLocaleString('es-AR')}</span>
                                  <span className="text-slate-400 text-xs ml-1">({formatCurrency(pago.monto)})</span>
                                </>
                              ) : formatCurrency(pago.monto)}
                            </span>
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
          </div>
        )}

        {/* Menús */}
        {activeTab === 'menus' && (
          <div className="space-y-6">
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
                Pagos Eliminados
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-red-500/30">
                  {auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').length}
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
                Pagos Modificados
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-amber-500/30">
                  {auditoriaPagos.filter(r => r.tipo_accion === 'MODIFICADO').length}
                </span>
              </button>
              <button
                onClick={() => setInformeActivo('eventos_anulados')}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  informeActivo === 'eventos_anulados'
                    ? 'bg-purple-500/20 text-purple-400 border border-purple-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Eventos Anulados
                <span className="ml-2 px-2 py-0.5 rounded-full text-xs bg-purple-500/30">
                  {auditoriaEventos.length}
                </span>
              </button>
            </div>

            {/* Pagos Eliminados */}
            {informeActivo === 'eliminados' && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-red-400">Pagos Eliminados</h3>
                {auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No hay pagos eliminados</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {auditoriaPagos.filter(r => r.tipo_accion === 'ANULADO').map((registro) => (
                      <div key={registro.id} className="p-4 rounded-xl bg-red-500/10 border border-red-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{registro.cliente}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(registro.created_at).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>Monto: <span className="text-red-400 font-medium">{formatCurrency(registro.monto_original)}</span></p>
                          <p>Concepto: {registro.concepto === 'seña' ? 'Seña' : registro.concepto === 'ajuste_ipc' ? 'Ajuste IPC' : 'Pago'}</p>
                          <p>Fecha del pago: {formatDate(registro.fecha_pago)}</p>
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
                            {new Date(registro.created_at).toLocaleString('es-AR')}
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

            {/* Eventos Anulados */}
            {informeActivo === 'eventos_anulados' && (
              <div className="glass rounded-2xl p-5">
                <h3 className="text-lg font-semibold mb-4 text-purple-400">Eventos Anulados</h3>
                {auditoriaEventos.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No hay eventos anulados</p>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto">
                    {auditoriaEventos.map((registro) => (
                      <div key={registro.id} className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/30">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{registro.cliente}</span>
                          <span className="text-xs text-slate-400">
                            {new Date(registro.created_at).toLocaleString('es-AR')}
                          </span>
                        </div>
                        <div className="text-sm text-slate-300 space-y-1">
                          <p>Fecha del evento: <span className="text-purple-400 font-medium">{formatDate(registro.fecha_evento)}</span></p>
                          <p>Tipo: {registro.tipo_evento}</p>
                          <p className="text-slate-500 mt-2">
                            <span className="font-medium">Motivo:</span> {registro.motivo}
                          </p>
                          <p className="text-slate-500">
                            <span className="font-medium">Usuario:</span> {registro.usuario}
                          </p>
                        </div>
                        <button
                          onClick={() => handleRegenerarEvento(registro)}
                          className="mt-3 px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/30 transition-all border border-emerald-500/30"
                        >
                          Regenerar Evento
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

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
                          <button
                            onClick={() => handleDeleteUser(usuario)}
                            className="p-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors"
                            title="Eliminar usuario"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
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
              <div className="grid grid-cols-5 gap-4 text-center">
                <div>
                  <p className="text-xs text-slate-400">Ingresos</p>
                  <p className="text-lg font-bold text-green-400">${cajaMovimientos.filter(m => m.tipo === 'ingreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Egresos</p>
                  <p className="text-lg font-bold text-red-400">${cajaMovimientos.filter(m => m.tipo === 'egreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Retiros Socios</p>
                  <p className="text-lg font-bold text-yellow-400">${cajaMovimientos.filter(m => m.tipo === 'retiro').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Saldo Caja $</p>
                  {(() => {
                    const ingresos = cajaMovimientos.filter(m => m.tipo === 'ingreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                    const egresos = cajaMovimientos.filter(m => m.tipo === 'egreso').reduce((sum, i) => sum + (i.monto_pesos || 0), 0);
                    const saldo = ingresos - egresos;
                    return <p className={`text-lg font-bold ${saldo >= 0 ? 'text-green-400' : 'text-red-400'}`}>${saldo.toLocaleString()}</p>;
                  })()}
                </div>
                <div>
                  <p className="text-xs text-slate-400">Pagos en USD (ref.)</p>
                  <p className="text-lg font-bold text-blue-400">
                    {cajaMovimientos.filter(m => m.tipo === 'ingreso' && m.monto_dolares > 0).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toLocaleString()}
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
                            ${saldo.toLocaleString()}
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
                      type="number"
                      value={tipoCambio}
                      onChange={(e) => setTipoCambio(parseFloat(e.target.value) || 0)}
                      className="w-20 px-2 py-0.5 rounded border border-white/10 bg-white/5 text-blue-400 text-lg font-bold text-center"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 items-center">
              <button
                onClick={() => setCajaTab('ingresos')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  cajaTab === 'ingresos'
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50'
                    : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
              >
                Ingresos
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
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowTransferenciaForm(false); setEditingTransferencia(null); setTransferenciaForm({ fecha: new Date().toISOString().split('T')[0], origen: '', destino: '', monto_pesos: '', observacion: '' }); }}>
                <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
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
                      type="number"
                      value={transferenciaForm.monto_pesos}
                      onChange={(e) => setTransferenciaForm({...transferenciaForm, monto_pesos: e.target.value})}
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
                  <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => { setShowCajaIngresoForm(false); setEditingCajaIngreso(null); setCajaIngresoForm({ fecha: new Date().toISOString().split('T')[0], origen: '', observacion: '', receptor: '', monto_pesos: '', monto_dolares: '', cotizacion: '' }); }}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
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
                          type="number"
                          value={cajaIngresoForm.monto_pesos}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, monto_pesos: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto USD</label>
                        <input
                          type="number"
                          value={cajaIngresoForm.monto_dolares}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, monto_dolares: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo Cambio {cajaIngresoForm.monto_dolares ? '*' : ''}</label>
                        <input
                          type="number"
                          value={cajaIngresoForm.cotizacion}
                          onChange={(e) => setCajaIngresoForm({...cajaIngresoForm, cotizacion: e.target.value})}
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
                            <td className="py-2 px-3 text-right text-green-400">${(item.monto_pesos || 0).toLocaleString()}</td>
                            <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toLocaleString() : '-'}</td>
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
                                  <button onClick={async () => { if (confirm('¿Eliminar?')) { await supabase.from('caja_movimientos').delete().eq('id', item.id); fetchCajaMovimientos(); }}} className="p-1 text-red-400 hover:text-red-300">
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
                  <span className="text-slate-400">Total $: <span className="text-green-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'ingreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toLocaleString()}</span></span>
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
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowCajaEgresoForm(false); setEditingCajaEgreso(null); setCajaEgresoForm({ fecha: new Date().toISOString().split('T')[0], concepto: '', receptor: '', aportante: '', monto_pesos: '', monto_dolares: '', cotizacion: '', observacion: '' }); }}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={async (e) => {
                      e.preventDefault();
                      const pesos = parseFloat(cajaEgresoForm.monto_pesos) || 0;
                      const dolares = parseFloat(cajaEgresoForm.monto_dolares) || 0;
                      const tc = parseFloat(cajaEgresoForm.cotizacion) || tipoCambio;
                      if (pesos === 0 && dolares === 0) { alert('Ingrese un monto'); return; }
                      if (!cajaEgresoForm.concepto) { alert('Seleccione un concepto'); return; }
                      if (!cajaEgresoForm.receptor) { alert('Seleccione quién recibe'); return; }

                      // Si es retiro de socio (concepto R. Socios y receptor es socio)
                      const esRetiro = cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor);
                      const esAporte = cajaEgresoForm.concepto === 'Aporte' && cajaEgresoForm.aportante;
                      const totalPesos = pesos + (dolares * tc);

                      if (esRetiro) {
                        // Retiro de socio:
                        // 1. Egreso del aportante (baja su caja)
                        // 2. Retiro para el socio (registro de retiro)
                        if (cajaEgresoForm.aportante) {
                          await supabase.from('caja_movimientos').insert({
                            tipo: 'egreso',
                            concepto: `R. Socios a ${cajaEgresoForm.receptor}${cajaEgresoForm.observacion ? ' | ' + cajaEgresoForm.observacion : ''}`,
                            monto_pesos: totalPesos,
                            monto_dolares: dolares || null,
                            cotizacion: dolares ? tc : null,
                            persona: cajaEgresoForm.aportante,
                            aportante: cajaEgresoForm.aportante,
                            fecha: cajaEgresoForm.fecha
                          });
                        }
                        // Registro de retiro para el socio
                        await supabase.from('caja_movimientos').insert({
                          tipo: 'retiro',
                          concepto: cajaEgresoForm.observacion || cajaEgresoForm.concepto,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || null,
                          cotizacion: dolares ? tc : null,
                          persona: cajaEgresoForm.receptor,
                          aportante: cajaEgresoForm.aportante || null,
                          fecha: cajaEgresoForm.fecha
                        });
                      } else if (esAporte) {
                        // Aporte: el aportante da dinero (egreso) y el receptor lo recibe (ingreso)
                        // Egreso del aportante
                        await supabase.from('caja_movimientos').insert({
                          tipo: 'egreso',
                          concepto: `Aporte a ${cajaEgresoForm.receptor}${cajaEgresoForm.observacion ? ' | ' + cajaEgresoForm.observacion : ''}`,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || null,
                          cotizacion: dolares ? tc : null,
                          persona: cajaEgresoForm.aportante,
                          aportante: cajaEgresoForm.aportante,
                          fecha: cajaEgresoForm.fecha
                        });
                        // Ingreso al receptor
                        await supabase.from('caja_movimientos').insert({
                          tipo: 'ingreso',
                          concepto: `Aporte de ${cajaEgresoForm.aportante}${cajaEgresoForm.observacion ? ' | ' + cajaEgresoForm.observacion : ''}`,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || null,
                          cotizacion: dolares ? tc : null,
                          persona: cajaEgresoForm.receptor,
                          aportante: cajaEgresoForm.aportante,
                          fecha: cajaEgresoForm.fecha
                        });
                      } else {
                        // Egreso normal
                        const data = {
                          tipo: 'egreso',
                          concepto: cajaEgresoForm.observacion || cajaEgresoForm.concepto,
                          monto_pesos: totalPesos,
                          monto_dolares: dolares || null,
                          cotizacion: dolares ? tc : null,
                          persona: cajaEgresoForm.receptor,
                          aportante: cajaEgresoForm.aportante || null,
                          fecha: cajaEgresoForm.fecha
                        };

                        if (editingCajaEgreso) {
                          await supabase.from('caja_movimientos').update(data).eq('id', editingCajaEgreso);
                        } else {
                          await supabase.from('caja_movimientos').insert(data);
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
                        <label className="block text-xs text-slate-400 mb-1">Aportado por</label>
                        <select
                          value={cajaEgresoForm.aportante}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, aportante: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {CAJAS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Concepto *</label>
                        <select
                          value={cajaEgresoForm.concepto}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, concepto: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {CONCEPTOS_EGRESO.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Recibido por *</label>
                        <select
                          value={cajaEgresoForm.receptor}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, receptor: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                        >
                          <option value="">Seleccionar...</option>
                          {RECEPTORES_EGRESO.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        {cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor) && (
                          <p className="text-xs text-yellow-400 mt-1">→ Solo Retiros (no afecta caja)</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto Pesos</label>
                        <input
                          type="number"
                          value={cajaEgresoForm.monto_pesos}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, monto_pesos: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Monto USD</label>
                        <input
                          type="number"
                          value={cajaEgresoForm.monto_dolares}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, monto_dolares: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-slate-400 mb-1">Tipo Cambio {cajaEgresoForm.monto_dolares ? '*' : ''}</label>
                        <input
                          type="number"
                          value={cajaEgresoForm.cotizacion}
                          onChange={(e) => setCajaEgresoForm({...cajaEgresoForm, cotizacion: e.target.value})}
                          className="w-full px-3 py-2 rounded-lg border border-white/10 bg-white/5 text-white text-sm"
                          placeholder={tipoCambio.toString()}
                        />
                      </div>
                    </div>
                    {cajaEgresoForm.concepto === 'R. Socios' && SOCIOS.includes(cajaEgresoForm.receptor) && (cajaEgresoForm.monto_pesos || cajaEgresoForm.monto_dolares) && (
                      <div className="text-xs text-blue-400 bg-blue-500/10 rounded-lg p-2">
                        Total: ${((parseFloat(cajaEgresoForm.monto_pesos) || 0) + ((parseFloat(cajaEgresoForm.monto_dolares) || 0) * (parseFloat(cajaEgresoForm.cotizacion) || tipoCambio))).toLocaleString()}
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
                        <th className="text-left py-2 px-3">Aportado por</th>
                        <th className="text-left py-2 px-3">Concepto</th>
                        <th className="text-left py-2 px-3">Recibido por</th>
                        <th className="text-right py-2 px-3">Pesos</th>
                        <th className="text-right py-2 px-3">USD</th>
                        <th className="w-20"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).map(item => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                          <td className="py-2 px-3 text-slate-400">{item.aportante || '-'}</td>
                          <td className="py-2 px-3 font-medium">{item.concepto}</td>
                          <td className="py-2 px-3 text-slate-400">{item.persona || '-'}</td>
                          <td className="py-2 px-3 text-right text-red-400">${(item.monto_pesos || 0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toLocaleString() : '-'}</td>
                          <td className="py-2 px-3 flex gap-1">
                            <button onClick={() => {
                              setEditingCajaEgreso(item.id);
                              setCajaEgresoForm({
                                fecha: item.fecha,
                                concepto: CONCEPTOS_EGRESO.includes(item.concepto) ? item.concepto : 'Otros',
                                receptor: item.persona,
                                aportante: item.aportante || '',
                                monto_pesos: item.monto_dolares ? '' : (item.monto_pesos || '').toString(),
                                monto_dolares: (item.monto_dolares || '').toString(),
                                cotizacion: (item.cotizacion || '').toString(),
                                observacion: CONCEPTOS_EGRESO.includes(item.concepto) ? '' : item.concepto
                              });
                              setShowCajaEgresoForm(true);
                            }} className="p-1 text-blue-400 hover:text-blue-300">
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button onClick={async () => { if (confirm('¿Eliminar?')) { await supabase.from('caja_movimientos').delete().eq('id', item.id); fetchCajaMovimientos(); }}} className="p-1 text-red-400 hover:text-red-300">
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
                  <span className="text-slate-400">Total $: <span className="text-red-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</span></span>
                  <span className="text-slate-400">Total USD: <span className="text-blue-400 font-bold">{cajaMovimientos.filter(m => m.tipo === 'egreso' && !(m.concepto && m.concepto.startsWith('Transferencia interna'))).reduce((sum, i) => sum + (i.monto_dolares || 0), 0).toLocaleString()}</span></span>
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
                              <td className="py-2 px-3 text-right text-purple-400">${(item.monto_pesos || 0).toLocaleString()}</td>
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
                                    if (confirm('¿Eliminar esta transferencia? Se eliminarán ambos movimientos (ingreso y egreso)')) {
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
                                    }
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
                  <span className="text-slate-400">Total Transferido: <span className="text-purple-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'ingreso' && m.concepto && m.concepto.startsWith('Transferencia interna')).reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</span></span>
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
                            <span className="text-white font-medium">${totalPesos.toLocaleString()}</span>
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
                      {cajaMovimientos.filter(m => m.tipo === 'retiro').map(item => (
                        <tr key={item.id} className="border-b border-white/5 hover:bg-white/5">
                          <td className="py-2 px-3 text-slate-400">{item.fecha}</td>
                          <td className="py-2 px-3 font-medium text-yellow-400">{item.persona}</td>
                          <td className="py-2 px-3 text-slate-400">{item.concepto}</td>
                          <td className="py-2 px-3 text-right text-white">${(item.monto_pesos || 0).toLocaleString()}</td>
                          <td className="py-2 px-3 text-right text-blue-400">{item.monto_dolares ? item.monto_dolares.toFixed(2) : '-'}</td>
                          <td className="py-2 px-3 text-right text-slate-400">{item.cotizacion || '-'}</td>
                          <td className="py-2 px-3">
                            <button onClick={async () => { if (confirm('¿Eliminar?')) { await supabase.from('caja_movimientos').delete().eq('id', item.id); fetchCajaMovimientos(); }}} className="p-1 text-red-400 hover:text-red-300">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {cajaMovimientos.filter(m => m.tipo === 'retiro').length === 0 && (
                        <tr><td colSpan="7" className="py-8 text-center text-slate-500">Sin retiros registrados</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <div className="mt-4 pt-4 border-t border-white/10 flex justify-end gap-6 text-sm">
                  <span className="text-slate-400">Total $: <span className="text-yellow-400 font-bold">${cajaMovimientos.filter(m => m.tipo === 'retiro').reduce((sum, i) => sum + (i.monto_pesos || 0), 0).toLocaleString()}</span></span>
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
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tipo de Menú</label>
                  <select
                    value={menuTipoOtro ? 'Otro' : (TIPOS_MENU.find(t => nuevoMenu.nombre.startsWith(t)) || '')}
                    onChange={(e) => {
                      const tipoSeleccionado = e.target.value;
                      if (tipoSeleccionado === 'Otro') {
                        setMenuTipoOtro(true);
                        const categorias = CATEGORIAS_POR_MENU['Otro'].map(cat => ({ nombre: cat, items: [] }));
                        setNuevoMenu({...nuevoMenu, nombre: '', categorias});
                      } else if (tipoSeleccionado) {
                        setMenuTipoOtro(false);
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
                          {/* Select de platos predefinidos */}
                          {(() => {
                            const tipoMenu = menuTipoOtro ? 'Otro' : (TIPOS_MENU.find(t => nuevoMenu.nombre.startsWith(t)) || nuevoMenu.nombre);
                            const platosDisponibles = PLATOS_POR_MENU[tipoMenu]?.[categoria.nombre] || [];
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

        {/* Modal Nuevo Usuario */}
        {showUserModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="glass rounded-2xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Nuevo Usuario</h2>
                <button onClick={() => { setShowUserModal(false); setUserError(''); }} className="p-2 hover:bg-white/10 rounded-xl">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateUser} className="space-y-4">
                {userError && (
                  <div className="p-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-300 text-sm">
                    {userError}
                  </div>
                )}

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Nombre</label>
                  <input
                    type="text"
                    required
                    placeholder="Nombre del usuario"
                    value={nuevoUsuario.nombre}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, nombre: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Email</label>
                  <input
                    type="email"
                    required
                    placeholder="email@ejemplo.com"
                    value={nuevoUsuario.email}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, email: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Contraseña</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    placeholder="Mínimo 6 caracteres"
                    value={nuevoUsuario.password}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, password: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Rol</label>
                  <select
                    value={nuevoUsuario.rol}
                    onChange={(e) => setNuevoUsuario({...nuevoUsuario, rol: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    <option value="lectura" className="bg-slate-900">Lectura (solo ver)</option>
                    <option value="vendedor" className="bg-slate-900">Vendedor (crear y editar)</option>
                    <option value="admin" className="bg-slate-900">Admin (acceso total)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Users className="w-5 h-5" />}
                  {saving ? 'Creando...' : 'Crear Usuario'}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
