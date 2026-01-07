import React, { useState, useMemo, useEffect } from 'react';
import { Calendar, Users, DollarSign, TrendingUp, Search, ChevronDown, ChevronUp, Briefcase, CreditCard, BarChart3, Clock, ChevronLeft, ChevronRight, Sun, Moon, Plus, X, Loader2 } from 'lucide-react';
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
const TIPOS_EVENTO = ['Cumple 15', 'Cumple 40', 'Cumple 50', 'Cumple 60', 'Cumple 80', 'Cumple 1 año', 'Aniversario', 'Casamiento', 'Civil', 'Evento Empresa', 'Fiesta Privada', 'PRIVADO', 'Reunion', 'Cumpleaños'];
const MENUS = ['Tapas', 'Asado', '3 pasos', 'Premium', 'Brunch'];
const TURNOS = ['Noche', 'M. Dia'];

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'asc' });
  const [selectedDate, setSelectedDate] = useState(null);
  const [calendarDate, setCalendarDate] = useState(new Date(2025, 2, 1));
  
  // Supabase state
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [nuevoEvento, setNuevoEvento] = useState({
    fecha: '',
    turno: 'Noche',
    vendedor: 'Francisco',
    cliente: '',
    tipo_evento: 'Cumple 50',
    menu: 'Tapas',
    adultos: '',
    total_evento: ''
  });

  // Cargar eventos de Supabase
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    const { error } = await supabase
      .from('eventos')
      .insert([{
        fecha: nuevoEvento.fecha,
        turno: nuevoEvento.turno,
        vendedor: nuevoEvento.vendedor,
        cliente: nuevoEvento.cliente,
        tipo_evento: nuevoEvento.tipo_evento,
        menu: nuevoEvento.menu,
        adultos: parseInt(nuevoEvento.adultos),
        total_evento: parseFloat(nuevoEvento.total_evento)
      }]);
    
    if (error) {
      console.error('Error:', error);
      alert('Error al guardar el evento');
    } else {
      setShowModal(false);
      setNuevoEvento({
        fecha: '',
        turno: 'Noche',
        vendedor: 'Francisco',
        cliente: '',
        tipo_evento: 'Cumple 50',
        menu: 'Tapas',
        adultos: '',
        total_evento: ''
      });
      fetchEventos();
    }
    setSaving(false);
  };

  // Transformar datos de Supabase al formato esperado
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
    return { totalEventos, totalFacturado, totalAdultos, saldoPendiente: 0 };
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
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const getEventosForDate = (day) => {
    const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return eventosData.filter(e => e.fecha === dateStr);
  };

  const eventosDelDiaSeleccionado = useMemo(() => {
    if (!selectedDate) return [];
    return eventosData.filter(e => e.fecha === selectedDate);
  }, [selectedDate, eventosData]);

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
          <div className="glass rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">Nuevo Evento</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-white/10 rounded-xl">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha</label>
                <input
                  type="date"
                  required
                  value={nuevoEvento.fecha}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, fecha: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cliente</label>
                <input
                  type="text"
                  required
                  placeholder="Nombre del cliente"
                  value={nuevoEvento.cliente}
                  onChange={(e) => setNuevoEvento({...nuevoEvento, cliente: e.target.value})}
                  className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-2 gap-4">
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
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Adultos</label>
                  <input
                    type="number"
                    required
                    min="1"
                    placeholder="Cantidad"
                    value={nuevoEvento.adultos}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, adultos: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Total $</label>
                  <input
                    type="number"
                    required
                    min="0"
                    placeholder="Monto total"
                    value={nuevoEvento.total_evento}
                    onChange={(e) => setNuevoEvento({...nuevoEvento, total_evento: e.target.value})}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/10 bg-white/5 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                  />
                </div>
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
                  const eventos = getEventosForDate(day);
                  const dateStr = `${calendarDate.getFullYear()}-${String(calendarDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                  const isSelected = selectedDate === dateStr;
                  const hasEventos = eventos.length > 0;
                  
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
                          {eventos.slice(0, 3).map((e, idx) => (
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
                    <div key={i} className="bg-white/5 rounded-xl p-4 border border-white/10">
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
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden lg:table-cell">Menú</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden sm:table-cell">Turno</th>
                      <th className="text-left px-5 py-4 text-sm font-medium text-slate-300 hidden lg:table-cell">Vendedor</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300 hidden sm:table-cell">Adultos</th>
                      <th className="text-right px-5 py-4 text-sm font-medium text-slate-300 cursor-pointer hover:text-white" onClick={() => handleSort('totalEvento')}>
                        <div className="flex items-center justify-end gap-1">Total <SortIcon columnKey="totalEvento" /></div>
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEventos.map((e, i) => (
                      <tr key={e.id || i} className="border-b border-white/5 row-hover transition-colors">
                        <td className="px-5 py-4 mono text-sm">{formatDate(e.fecha)}</td>
                        <td className="px-5 py-4 font-medium">{e.cliente}</td>
                        <td className="px-5 py-4 hidden md:table-cell">
                          <span className="px-3 py-1 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            {e.tipoEvento}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell">{e.menu}</td>
                        <td className="px-5 py-4 hidden sm:table-cell">
                          <span className={`px-3 py-1 rounded-full text-xs ${e.turno === 'Noche' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'}`}>
                            {e.turno}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-slate-300 hidden lg:table-cell">{e.vendedor}</td>
                        <td className="px-5 py-4 text-right mono hidden sm:table-cell">{e.adultos}</td>
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
