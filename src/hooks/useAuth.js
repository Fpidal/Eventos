import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabase';
import { queryUsuarioByUserId } from '../supabaseQueries';
import { formatCurrency } from '../utils';

// Session timeout (30 minutos)
const SESSION_TIMEOUT = 30 * 60 * 1000;

export function useAuth() {
  // Auth states
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('admin');
  const [userTabsPermitidas, setUserTabsPermitidas] = useState([
    'dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario',
    'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja'
  ]);
  const [userVerPrecios, setUserVerPrecios] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Login form states
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Password reset states
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPassword2, setNewPassword2] = useState('');
  const [passwordResetLoading, setPasswordResetLoading] = useState(false);
  const [passwordResetError, setPasswordResetError] = useState('');

  // Session timeout ref
  const sessionTimeoutRef = useRef(null);

  // Permisos según rol
  const canCreate = userRole === 'admin' || userRole === 'vendedor';
  const canEdit = userRole === 'admin' || userRole === 'vendedor';
  const canDelete = userRole === 'admin';

  // Obtener rol del usuario
  const fetchUserRole = async (userId) => {
    try {
      const { data, error } = await queryUsuarioByUserId(userId);
      if (data) {
        setUserRole(data.rol);
      } else {
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

  // Función para iniciar el timer de sesión
  const startSessionTimer = () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
    }
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

    // Limpiar cualquier sesión previa de Supabase Auth
    await supabase.auth.signOut();

    // Login con clave única (admin)
    if (loginForm.password === 'admin1234') {
      const emailAdmin = loginForm.email.trim().toLowerCase();
      const userData = { email: emailAdmin, id: 'temp-user', nombre: emailAdmin.split('@')[0] };
      const allTabs = ['dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario', 'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja'];
      setUser(userData);
      setUserRole('admin');
      setUserTabsPermitidas(allTabs);
      setUserVerPrecios(true);
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

    // Normalizar email
    const emailNormalizado = loginForm.email.trim().toLowerCase();

    // Buscar usuario en la base de datos
    const { data: usuarios } = await supabase
      .from('usuarios')
      .select('*')
      .ilike('email', emailNormalizado)
      .single();

    if (usuarios && loginForm.password) {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: emailNormalizado,
        password: loginForm.password
      });

      if (!authError && authData.user) {
        const authEmail = authData.user.email?.toLowerCase();
        if (authEmail !== emailNormalizado) {
          await supabase.auth.signOut();
          setLoginError('Error de autenticación: el email no coincide. Intente nuevamente.');
          setLoginLoading(false);
          return;
        }

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

  // Cambiar contraseña (desde recovery)
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPasswordResetError('');

    if (newPassword.length < 6) {
      setPasswordResetError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (newPassword !== newPassword2) {
      setPasswordResetError('Las contraseñas no coinciden');
      return;
    }

    setPasswordResetLoading(true);

    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setPasswordResetError('Error al cambiar la contraseña: ' + error.message);
      setPasswordResetLoading(false);
      return;
    }

    await supabase.auth.signOut();
    setShowPasswordReset(false);
    setNewPassword('');
    setNewPassword2('');
    setPasswordResetLoading(false);
    alert('Contraseña cambiada exitosamente. Por favor, ingresá con tu nueva contraseña.');
  };

  // Logout
  const handleLogout = async () => {
    if (sessionTimeoutRef.current) {
      clearTimeout(sessionTimeoutRef.current);
      sessionTimeoutRef.current = null;
    }
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('session');
    setLoginForm({ email: '', password: '' });
  };

  // Detectar token de recuperación de contraseña en la URL
  useEffect(() => {
    const handlePasswordRecovery = async () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          const { error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || ''
          });

          if (!error) {
            setShowPasswordReset(true);
            window.history.replaceState(null, '', window.location.pathname);
          }
        }
      }
    };
    handlePasswordRecovery();
  }, []);

  // Verificar sesión guardada en localStorage
  useEffect(() => {
    const savedSession = localStorage.getItem('session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const elapsed = Date.now() - session.timestamp;
        if (elapsed < SESSION_TIMEOUT) {
          setUser(session.user);
          setUserRole(session.role);
          setUserTabsPermitidas(session.tabs_permitidas || [
            'dashboard', 'proximos', 'aconfirmar', 'realizados', 'calendario',
            'eventos', 'cobranzas', 'menus', 'informes', 'agenda', 'usuarios', 'caja'
          ]);
          setUserVerPrecios(session.ver_precios !== false);
          localStorage.setItem('session', JSON.stringify({ ...session, timestamp: Date.now() }));
        } else {
          localStorage.removeItem('session');
        }
      } catch (e) {
        localStorage.removeItem('session');
      }
    }
    setAuthLoading(false);
  }, []);

  // Limpiar timer al desmontar
  useEffect(() => {
    return () => {
      if (sessionTimeoutRef.current) {
        clearTimeout(sessionTimeoutRef.current);
      }
    };
  }, []);

  return {
    // Estados
    user,
    userRole,
    userTabsPermitidas,
    userVerPrecios,
    authLoading,
    loginForm,
    setLoginForm,
    loginError,
    loginLoading,
    showPassword,
    setShowPassword,
    showPasswordReset,
    setShowPasswordReset,
    newPassword,
    setNewPassword,
    newPassword2,
    setNewPassword2,
    passwordResetLoading,
    passwordResetError,

    // Permisos
    canCreate,
    canEdit,
    canDelete,

    // Funciones
    fetchUserRole,
    displayPrice,
    handleLogin,
    handlePasswordChange,
    handleLogout
  };
}
