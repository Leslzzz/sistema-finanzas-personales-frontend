import { useCallback, useEffect, useState, useRef } from 'react';
import { FiSearch, FiFilter, FiUser, FiLogOut, FiSettings, FiChevronDown, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FinanceCharts from './FinanceCharts';
import AddTransactionModal from './AddTransactionModal';
import OnboardingModal from './OnboardingModal';
import { authService, DashboardService, type DashboardResponse } from '../api/Service';

const Dashboard = () => {
    const navigate = useNavigate();
    const menuRef  = useRef<HTMLDivElement>(null);

    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [dashboard, setDashboard]       = useState<DashboardResponse | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    
    // --- ESTADOS PARA LOS MODALES ---
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    // ¡OJO AQUÍ! Lo dejé en true para que puedas probar el Onboarding inmediatamente.
    // Cuando termines de probar, cámbialo a useState(false)
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(true); 

    const load = useCallback(async () => {
        try {
            const data = await DashboardService.getHome();
            setDashboard(data);
            setError('');
            
            // Lógica futura: Si el backend nos dice que es usuario nuevo, abrimos el onboarding
            // if (data.user_info.is_new_user) setIsOnboardingOpen(true);

        } catch {
            setError('No se pudo cargar el dashboard. Intenta de nuevo.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (!authService.isLoggedIn()) { navigate('/login', { replace: true }); return; }
        load();
    }, [navigate, load]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node))
                setShowUserMenu(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    // Se llama desde FinanceCharts o desde los modales cuando se guarda algo exitosamente
    const handleRefresh = useCallback(() => {
        setLoading(true);
        load();
    }, [load]);

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <div className="nav-logo">Finanzly</div>
                </div>
                <div className="nav-center">
                    <div className="search-bar-container">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder="Buscar transacciones, categorías..." className="search-input" />
                    </div>
                </div>
                <div className="nav-right">
                    <button className="icon-btn filter-btn" title="Filtrar resultados"><FiFilter /></button>
                    <div className="user-menu-wrapper" ref={menuRef}>
                        <button
                            className={`user-btn ${showUserMenu ? 'active' : ''}`}
                            onClick={() => setShowUserMenu(!showUserMenu)}
                        >
                            <div className="user-avatar"><FiUser /></div>
                            <span className="user-name">{dashboard?.user_info?.name || 'Usuario'}</span>
                            <FiChevronDown className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                        </button>
                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <p>Conectado como</p>
                                    <h4>{dashboard?.user_info?.name || '—'}</h4>
                                    <small style={{ color: '#475569', fontSize: '0.78rem' }}>
                                        {dashboard?.user_info?.email}
                                    </small>
                                </div>
                                <ul className="dropdown-list">
                                    <li>
                                        <button className="dropdown-item"><FiSettings /> Perfil y Ajustes</button>
                                    </li>
                                    <li className="divider" />
                                    <li>
                                        <button className="dropdown-item danger" onClick={() => authService.logout()}>
                                            <FiLogOut /> Cerrar Sesión
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="main-content">
                {loading && (
                    <div className="loading-state">
                        <div className="loading-spinner" />
                        Cargando...
                    </div>
                )}
                {!loading && error && (
                    <div className="error-state">
                        <p>{error}</p>
                        <button onClick={handleRefresh}>Reintentar</button>
                    </div>
                )}
                {!loading && !error && dashboard && (
                    <div className="welcome-card">
                        <h1>Panel Principal</h1>
                        <p className="subtitle">
                            Bienvenido, {dashboard.user_info.name} · Miembro desde {dashboard.user_info.created_at}
                        </p>
                        <FinanceCharts summary={dashboard.summary} onRefresh={handleRefresh} />
                    </div>
                )}
            </main>

            {/* --- BOTÓN FLOTANTE PARA AGREGAR TRANSACCIÓN --- */}
            <button 
                className="fab-add-button" 
                onClick={() => setIsAddModalOpen(true)}
                title="Agregar nuevo registro"
            >
                <FiPlus />
            </button>

            {/* --- COMPONENTE MODAL DE TRANSACCIÓN --- */}
            <AddTransactionModal 
                isOpen={isAddModalOpen} 
                onClose={() => setIsAddModalOpen(false)} 
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    handleRefresh(); // Refresca las gráficas del dashboard automáticamente
                }} 
            />
            
            {/* --- COMPONENTE MODAL DE ONBOARDING --- */}
            <OnboardingModal 
                isOpen={isOnboardingOpen} 
                onClose={() => setIsOnboardingOpen(false)} 
                onSuccess={() => {
                    setIsOnboardingOpen(false); 
                    handleRefresh(); 
                }}
                userName={dashboard?.user_info?.name || 'Usuario'} 
            />

        </div>
    );
};

export default Dashboard;