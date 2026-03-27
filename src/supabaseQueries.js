// Queries de Supabase - Funciones puras de acceso a datos
import { supabase } from './supabase';

// ============================================
// QUERIES DE LECTURA (SELECT)
// ============================================

// Eventos
export const queryEventos = async () => {
  return await supabase
    .from('eventos')
    .select('*')
    .order('fecha', { ascending: true });
};

// Pagos
export const queryPagos = async () => {
  return await supabase
    .from('pagos')
    .select('*')
    .order('fecha', { ascending: true });
};

// IPC Mensual
export const queryIPCMensual = async () => {
  return await supabase
    .from('ipc_mensual')
    .select('*')
    .order('año', { ascending: false })
    .order('mes', { ascending: true });
};

// Auditoria de Pagos
export const queryAuditoriaPagos = async () => {
  return await supabase
    .from('auditoria_pagos')
    .select('*')
    .order('created_at', { ascending: false });
};

// Auditoria de Eventos
export const queryAuditoriaEventos = async () => {
  return await supabase
    .from('auditoria_eventos')
    .select('*')
    .order('created_at', { ascending: false });
};

// Auditoria de Caja
export const queryAuditoriaCaja = async () => {
  return await supabase
    .from('auditoria_caja')
    .select('*')
    .order('created_at', { ascending: false });
};

// Movimientos de Caja
export const queryCajaMovimientos = async () => {
  return await supabase
    .from('caja_movimientos')
    .select('*')
    .order('fecha', { ascending: false });
};

// Usuarios
export const queryUsuarios = async () => {
  return await supabase
    .from('usuarios')
    .select('*')
    .order('created_at', { ascending: false });
};

// Usuario por user_id (para obtener rol)
export const queryUsuarioByUserId = async (userId) => {
  return await supabase
    .from('usuarios')
    .select('rol, tabs_permitidas, ver_precios')
    .eq('user_id', userId)
    .single();
};

// Menus activos
export const queryMenus = async () => {
  return await supabase
    .from('menus')
    .select('*')
    .eq('activo', true)
    .order('nombre', { ascending: true });
};

// Clientes
export const queryClientes = async () => {
  return await supabase
    .from('clientes')
    .select('*')
    .order('nombre', { ascending: true });
};

// ============================================
// MUTATIONS - EVENTOS
// ============================================

export const insertEvento = async (data) => {
  return await supabase.from('eventos').insert([data]).select();
};

export const updateEvento = async (id, data) => {
  return await supabase.from('eventos').update(data).eq('id', id);
};

export const deleteEvento = async (id) => {
  return await supabase.from('eventos').delete().eq('id', id);
};

// ============================================
// MUTATIONS - PAGOS
// ============================================

export const insertPago = async (data) => {
  return await supabase.from('pagos').insert([data]).select();
};

export const updatePago = async (id, data) => {
  return await supabase.from('pagos').update(data).eq('id', id);
};

export const deletePago = async (id) => {
  return await supabase.from('pagos').delete().eq('id', id);
};

// ============================================
// MUTATIONS - CLIENTES
// ============================================

export const insertCliente = async (data) => {
  return await supabase.from('clientes').insert([data]);
};

export const updateCliente = async (id, data) => {
  return await supabase.from('clientes').update(data).eq('id', id);
};

export const deleteCliente = async (id) => {
  return await supabase.from('clientes').delete().eq('id', id);
};

// ============================================
// MUTATIONS - USUARIOS
// ============================================

export const insertUsuario = async (data) => {
  return await supabase.from('usuarios').insert([data]);
};

export const updateUsuario = async (id, data) => {
  return await supabase.from('usuarios').update(data).eq('id', id);
};

export const deleteUsuario = async (id) => {
  return await supabase.from('usuarios').delete().eq('id', id);
};

// ============================================
// MUTATIONS - CAJA
// ============================================

export const insertCajaMovimiento = async (data) => {
  return await supabase.from('caja_movimientos').insert([data]);
};

export const updateCajaMovimiento = async (id, data) => {
  return await supabase.from('caja_movimientos').update(data).eq('id', id);
};

export const deleteCajaMovimiento = async (id) => {
  return await supabase.from('caja_movimientos').delete().eq('id', id);
};

export const queryCajaMovimientosByRef = async (refId, tipo) => {
  return await supabase
    .from('caja_movimientos')
    .select('*')
    .eq('referencia_id', refId)
    .eq('tipo', tipo);
};

// ============================================
// MUTATIONS - IPC
// ============================================

export const upsertIPCMensual = async (data) => {
  return await supabase.from('ipc_mensual').upsert([data]);
};

export const deleteIPCMensual = async (id) => {
  return await supabase.from('ipc_mensual').delete().eq('id', id);
};

// ============================================
// MUTATIONS - AUDITORIA
// ============================================

export const insertAuditoriaPago = async (data) => {
  return await supabase.from('auditoria_pagos').insert(data);
};

export const insertAuditoriaEvento = async (data) => {
  return await supabase.from('auditoria_eventos').insert(data);
};

export const deleteAuditoriaEvento = async (id) => {
  return await supabase.from('auditoria_eventos').delete().eq('id', id);
};

export const insertAuditoriaCaja = async (data) => {
  return await supabase.from('auditoria_caja').insert(data);
};

// ============================================
// MUTATIONS - MENUS
// ============================================

export const insertMenu = async (data) => {
  return await supabase.from('menus').insert([data]).select();
};

export const updateMenu = async (id, data) => {
  return await supabase.from('menus').update(data).eq('id', id);
};

export const deleteMenu = async (id) => {
  return await supabase.from('menus').update({ activo: false }).eq('id', id);
};
