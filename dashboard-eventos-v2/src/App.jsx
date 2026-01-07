import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Search, ChevronDown, ChevronUp, Briefcase, BarChart3, ChevronLeft, ChevronRight, Sun, Moon, Plus, X, Loader2, Phone, Music, Mic, Clock, MapPin, Edit3, Trash2 } from 'lucide-react';
import { XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { supabase } from './supabase';

const formatCurrency = (value) => {
  if (value === null || value === undefined) return '-';
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(value);
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
const TURNOS = ['Noche', 'M. Dia'];
const SALONES = ['Completo', 'Grolsh', 'Salentein'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'asc' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 2, 1));
  const [selectedEvento, setSelectedEvento] = useState(null);
  
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [eventoEdit, setEventoEdit] = useState(null);
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: '',
    cliente: '',
    telefono: '',
    turno: 'Noche',
    vendedor: 'Francisco',
    tipo_evento: 'Cumple 50',
    menu: 'Tapas',
    salon: 'Completo',
    tecnica: false,
    dj: '',
    tecnica_superior: false,
    otros: '',
    adultos: '',
    precio_adulto: '',
    menores: '',
    precio_menor: ''
  });

  useEffect(() => {
    fetchEventos();
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

  const calcularTotal = () => {
    const adultos = parseInt(nuevoEvento.adultos) || 0;
    const precioAdulto = parseFloat(nuevoEvento.precio_adulto) || 0;
    const menores = parseInt(nuevoEvento.menores) || 0;
    const precioMenor = parseFloat(nuevoEvento.precio_menor) || 0;
    return (adultos * precioAdulto) + (menores * precioMenor);
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
        total_evento: total
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
        vendedor: 'Francisco',
        tipo_evento: 'Cumple 50',
        menu: 'Tapas',
        salon: 'Completo',
        tecnica: false,
        dj: '',
        tecnica_superior: false,
        otros: '',
        adultos: '',
        precio_adulto: '',
        menores: '',
        precio_menor: ''
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
      vendedor: evento.vendedor,
      tipo_evento: evento.tipo_evento,
      menu: evento.menu,
      salon: evento.salon || 'Completo',
      tecnica: evento.tecnica || false,
      dj: evento.dj || '',
      tecnica_superior: evento.tecnica_superior || false,
      otros: evento.otros || '',
      adultos: evento.adultos?.toString() || '',
      precio_adulto: evento.precio_adulto?.toString() || '',
      menores: evento.menores?.toString() || '',
      precio_menor: evento.precio_menor?.toString() || ''
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
    return (adultos * precioAdulto) + (menores * precioMenor);
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
        total_evento: total
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
      tipoEvento: e.tipo_evento,
      totalEvento: Number(e.total_evento)
    }));
  }, [eventos]);

  const vendedores = useMemo(() => ['todos', ...new Set(eventosData.map(e => e.vendedor))], [eventosData]);
  const meses = useMemo(() => ['todos', ...new Set(eventosData.map(e => e.mes))], [eventosData]);

  const filteredEventos = useMemo(() => {
    return eventosData
      .filter(e => {
        const matchSearch = e.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           e.tipoEvento.toLowerCase().includes(searchTerm.toLowerCase());
        const matchVendedor = filterVendedor === 'todos' || e.vendedor === filterVendedor;
        const matchMes = filterMes === 'todos' || e.mes === filterMes;
        return matchSearch && matchVendedor && matchMes;
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
  }, [eventosData, searchTerm, filterVendedor, filterMes, sortConfig]);

  const stats = useMemo(() => {
    const totalEventos = eventosData.length;
    const totalFacturado = eventosData.reduce((sum, e) => sum + e.totalEvento, 0);
    const totalAdultos = eventosData.reduce((sum, e) => sum + e.adultos, 0);
    return { totalEventos, totalFacturado, totalAdultos };
  }, [eventosData]);

  const eventosPorMes = useMemo(() => {
    const orden = ['marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const grouped = eventosData.reduce((acc, e) => {
      acc[e.mes] = (acc[e.mes] || 0) + e.totalEvento;
      return acc;
    }, {});
    return orden.filter(m => grouped[m]).map(mes => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), total: grouped[mes] }));
  }, [eventosData]);

  const eventosPorVendedor = useMemo(() => {
    const grouped = eventosData.reduce((acc, e) => {
      acc[e.vendedor] = (acc[e.vendedor] || 0) + e.totalEvento;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [eventosData]);

  const eventosPorTipo = useMemo(() => {
    const grouped = eventosData.reduce((acc, e) => {
      acc[e.tipoEvento] = (acc[e.tipoEvento] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosData]);

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay() };
  };

  const getEventosForDate = (day) => {
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventosData.filter(e => e.fecha === dateStr);
  };

  const eventosDelDiaSeleccionado = useMemo(() => {
    if (!selectedDate) return [];
    return eventosData.filter(e => e.fecha === selectedDate);
  }, [selectedDate, eventosData]);

  // Próximos eventos (desde hoy en adelante)
  const proximosEventos = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    return eventosData
      .filter(e => new Date(e.fecha + 'T12:00:00') >= hoy)
      .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
  }, [eventosData]);

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
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
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
              
              {/* Turno, Tipo, Menú */}
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
                  <label className="block text-sm text-slate-400 mb-1">Menú</label>
                  <select
                    value={nuevoEvento.menu}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, menu: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Salón */}
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
                    type="number"
                    min="0"
                    placeholder="Precio"
                    value={nuevoEvento.precio_adulto}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_adulto: e.target.value})}
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
                    type="number"
                    min="0"
                    placeholder="Precio"
                    value={nuevoEvento.precio_menor}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, precio_menor: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
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
          <div className="glass rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">{selectedEvento.cliente}</h2>
              <button onClick={() => setSelectedEvento(null)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Fecha</p>
                  <p className="font-medium">{formatDate(selectedEvento.fecha)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Turno</p>
                  <p className="font-medium">{selectedEvento.turno}</p>
                </div>
              </div>

              {selectedEvento.telefono && (
                <div className="bg-white/5 rounded-xl p-3 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-400" />
                  <span>{selectedEvento.telefono}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Tipo</p>
                  <p className="font-medium">{selectedEvento.tipoEvento}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Menú</p>
                  <p className="font-medium">{selectedEvento.menu}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Salón</p>
                  <p className="font-medium">{selectedEvento.salon || 'Completo'}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Vendedor</p>
                  <p className="font-medium">{selectedEvento.vendedor}</p>
                </div>
              </div>

              <div className="flex gap-2 flex-wrap">
                {selectedEvento.tecnica && (
                  <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Mic className="w-3 h-3" /> Técnica
                  </span>
                )}
                {selectedEvento.tecnica_superior && (
                  <span className="px-3 py-1 rounded-full text-xs bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                    <Mic className="w-3 h-3" /> Técnica Superior
                  </span>
                )}
                {selectedEvento.dj && (
                  <span className="px-3 py-1 rounded-full text-xs bg-pink-500/20 text-pink-300 border border-pink-500/30 flex items-center gap-1">
                    <Music className="w-3 h-3" /> DJ: {selectedEvento.dj}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Adultos</p>
                  <p className="font-medium">{selectedEvento.adultos} × {formatCurrency(selectedEvento.precio_adulto || 0)}</p>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Menores</p>
                  <p className="font-medium">{selectedEvento.menores || 0} × {formatCurrency(selectedEvento.precio_menor || 0)}</p>
                </div>
              </div>

              {selectedEvento.otros && (
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-xs text-slate-400">Notas</p>
                  <p className="text-sm">{selectedEvento.otros}</p>
                </div>
              )}

              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                <p className="text-sm text-slate-400">Total Evento</p>
                <p className="text-2xl font-bold text-emerald-400 mono">{formatCurrency(selectedEvento.totalEvento)}</p>
              </div>

              {/* Botones Editar y Eliminar */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleEdit(selectedEvento)}
                  className="flex-1 py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(selectedEvento.id)}
                  className="px-6 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold hover:bg-red-500/30 transition-all border border-red-500/30 flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Evento */}
      {editMode && eventoEdit && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="glass rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Editar Evento</h2>
              <button onClick={() => { setEditMode(false); setEventoEdit(null); }} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleUpdate} className="space-y-4">
              {/* Fecha y Cliente */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Fecha *</label>
                  <input
                    type="date"
                    required
                    value={eventoEdit.fecha}
                    onChange={(e) => setEventoEdit({...eventoEdit, fecha: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
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
              
              {/* Turno, Tipo, Menú */}
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
                  <label className="block text-sm text-slate-400 mb-1">Menú</label>
                  <select
                    value={eventoEdit.menu}
                    onChange={(e) => setEventoEdit({...eventoEdit, menu: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  >
                    {MENUS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Salón */}
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
                    type="number"
                    min="0"
                    value={eventoEdit.precio_adulto}
                    onChange={(e) => setEventoEdit({...eventoEdit, precio_adulto: e.target.value})}
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
                    type="number"
                    min="0"
                    value={eventoEdit.precio_menor}
                    onChange={(e) => setEventoEdit({...eventoEdit, precio_menor: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                  />
                </div>
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
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-medium hover:from-purple-700 hover:to-indigo-700 transition-all"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Nuevo Evento</span>
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex gap-2 p-1 glass rounded-2xl w-fit overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
            { id: 'proximos', label: 'Próximos', icon: Clock },
            { id: 'calendario', label: 'Calendario', icon: Calendar },
            { id: 'eventos', label: 'Eventos', icon: Briefcase },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all text-sm font-medium whitespace-nowrap ${
                activeTab === tab.id ? 'tab-active text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
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
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={eventosPorVendedor} cx="50%" cy="50%" innerRadius={70} outerRadius={100} paddingAngle={4} dataKey="value">
                      {eventosPorVendedor.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: 'rgba(15,23,42,0.95)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', color: 'white' }}
                      formatter={(value) => [formatCurrency(value), 'Total']}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                  {eventosPorVendedor.map((v, i) => (
                    <div key={v.name} className="flex items-center gap-2 text-sm">
                      <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                      <span className="text-slate-300">{v.name}</span>
                    </div>
                  ))}
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
                            <MapPin className="w-3 h-3" /> {e.salon || 'Completo'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm mt-2">
                          <span className={`flex items-center gap-1 ${e.turno === 'Noche' ? 'text-indigo-400' : 'text-amber-400'}`}>
                            {e.turno === 'Noche' ? <Moon className="w-3 h-3" /> : <Sun className="w-3 h-3" />}
                            {e.turno}
                          </span>
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
                              className={`w-1.5 h-1.5 rounded-full ${e.turno === 'Noche' ? 'bg-indigo-400' : 'bg-amber-400'}`}
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
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Noche</span>
                </div>
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span>Mediodía</span>
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
                      className="w-full text-left bg-white/5 rounded-xl p-4 border border-white/10 hover:border-purple-500/30 transition-all"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-semibold">{e.cliente}</span>
                        <span className={`px-2 py-1 rounded-full text-xs ${e.turno === 'Noche' ? 'bg-indigo-500/20 text-indigo-300' : 'bg-amber-500/20 text-amber-300'}`}>
                          {e.turno}
                        </span>
                      </div>
                      <div className="text-sm text-slate-400 space-y-1">
                        <p>📋 {e.tipoEvento}</p>
                        <p>🍽️ {e.menu} • {e.adultos} personas</p>
                        <p>👤 {e.vendedor}</p>
                        <p className="text-emerald-400 font-semibold">{formatCurrency(e.totalEvento)}</p>
                      </div>
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
                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell">{e.salon || 'Completo'}</td>
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
      </main>
    </div>
  );
}
