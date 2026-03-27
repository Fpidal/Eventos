import { useState, useMemo } from 'react';
import { supabase } from '../supabase';
import { queryEventos, insertAuditoriaEvento, deleteAuditoriaEvento } from '../supabaseQueries';

// Estado inicial para nuevo evento
const NUEVO_EVENTO_INICIAL = {
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
};

export function useEventos({ user, pagos, fetchAuditoriaEventos }) {
  // Estados principales
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [eventoEdit, setEventoEdit] = useState(null);
  const [selectedEvento, setSelectedEvento] = useState(null);
  const [nuevoEvento, setNuevoEvento] = useState(NUEVO_EVENTO_INICIAL);

  // Filtros generales
  const [searchTerm, setSearchTerm] = useState('');
  const [filterVendedor, setFilterVendedor] = useState('todos');
  const [filterMes, setFilterMes] = useState('todos');
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterEstado, setFilterEstado] = useState('todos');
  const [sortConfig, setSortConfig] = useState({ key: 'fecha', direction: 'asc' });

  // Filtros de solapas Próximos y A Confirmar
  const [filterMesProximos, setFilterMesProximos] = useState('todos');
  const [filterVendedorProximos, setFilterVendedorProximos] = useState('todos');
  const [filterClienteProximos, setFilterClienteProximos] = useState('');
  const [filterMesAConfirmar, setFilterMesAConfirmar] = useState('todos');
  const [filterVendedorAConfirmar, setFilterVendedorAConfirmar] = useState('todos');
  const [filterClienteAConfirmar, setFilterClienteAConfirmar] = useState('');

  // Fetch eventos
  const fetchEventos = async () => {
    setLoading(true);
    const { data, error } = await queryEventos();
    if (error) {
      console.error('Error:', error);
    } else {
      setEventos(data || []);
    }
    setLoading(false);
  };

  // Calcular total para nuevo evento
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

  // Calcular total para edición
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

  // Crear evento
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
      setNuevoEvento(NUEVO_EVENTO_INICIAL);
      fetchEventos();
    }
    setSaving(false);
  };

  // Preparar evento para edición
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

  // Actualizar evento
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

  // Eliminar evento
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

  // Confirmar/Desconfirmar evento
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

  // Anular evento
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
      insertAuditoriaEvento({
        cliente: evento.cliente,
        fecha_evento: evento.fecha,
        tipo_evento: evento.tipoEvento || evento.tipo_evento,
        tipo_accion: 'ANULADO',
        motivo: motivo,
        usuario: user?.email || 'Sistema'
      }).then(({ error: auditError }) => {
        if (!auditError && fetchAuditoriaEventos) fetchAuditoriaEventos();
      });
    }
  };

  // Regenerar evento anulado
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
      await deleteAuditoriaEvento(registro.id);
      fetchEventos();
      if (fetchAuditoriaEventos) fetchAuditoriaEventos();
      alert('Evento regenerado. Ahora está en "A Confirmar"');
    }
  };

  // ========== useMemo hooks ==========

  // Datos de eventos enriquecidos
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

  // Vendedores y meses disponibles
  const vendedores = useMemo(() => ['todos', ...new Set(eventosDelAño.map(e => e.vendedor))], [eventosDelAño]);
  const meses = useMemo(() => ['todos', ...new Set(eventosDelAño.map(e => e.mes))], [eventosDelAño]);

  // Eventos filtrados
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

  // Estadísticas
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

  // Eventos por mes (para gráficos)
  const eventosPorMes = useMemo(() => {
    const orden = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.mes] = (acc[e.mes] || 0) + e.totalEvento;
      return acc;
    }, {});
    return orden.filter(m => grouped[m]).map(mes => ({ mes: mes.charAt(0).toUpperCase() + mes.slice(1, 3), total: grouped[mes] }));
  }, [eventosDelAño]);

  // Eventos por vendedor (para gráficos)
  const eventosPorVendedor = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.vendedor] = (acc[e.vendedor] || 0) + e.totalEvento;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value }));
  }, [eventosDelAño]);

  // Eventos por tipo (para gráficos)
  const eventosPorTipo = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      acc[e.tipoEvento] = (acc[e.tipoEvento] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  // Eventos por menú (para gráficos)
  const eventosPorMenu = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      const menu = e.menu || 'Sin menú';
      acc[menu] = (acc[menu] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  // Eventos por salón (para gráficos)
  const eventosPorSalon = useMemo(() => {
    const eventosActivos = eventosDelAño.filter(e => e.confirmado && !e.anulado);
    const grouped = eventosActivos.reduce((acc, e) => {
      const salon = e.salon || 'Tero';
      acc[salon] = (acc[salon] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(grouped).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [eventosDelAño]);

  return {
    // Estados principales
    eventos,
    setEventos,
    loading,
    showModal,
    setShowModal,
    saving,
    setSaving,
    editMode,
    setEditMode,
    eventoEdit,
    setEventoEdit,
    selectedEvento,
    setSelectedEvento,
    nuevoEvento,
    setNuevoEvento,

    // Filtros generales
    searchTerm,
    setSearchTerm,
    filterVendedor,
    setFilterVendedor,
    filterMes,
    setFilterMes,
    filterYear,
    setFilterYear,
    filterEstado,
    setFilterEstado,
    sortConfig,
    setSortConfig,

    // Filtros Próximos/A Confirmar
    filterMesProximos,
    setFilterMesProximos,
    filterVendedorProximos,
    setFilterVendedorProximos,
    filterClienteProximos,
    setFilterClienteProximos,
    filterMesAConfirmar,
    setFilterMesAConfirmar,
    filterVendedorAConfirmar,
    setFilterVendedorAConfirmar,
    filterClienteAConfirmar,
    setFilterClienteAConfirmar,

    // Funciones
    fetchEventos,
    calcularTotal,
    calcularTotalEdit,
    handleSubmit,
    handleEdit,
    handleUpdate,
    handleDelete,
    handleConfirmarEvento,
    handleAnularEvento,
    handleRegenerarEvento,

    // Datos calculados (useMemo)
    eventosData,
    yearsDisponibles,
    eventosDelAño,
    vendedores,
    meses,
    filteredEventos,
    stats,
    eventosPorMes,
    eventosPorVendedor,
    eventosPorTipo,
    eventosPorMenu,
    eventosPorSalon
  };
}
