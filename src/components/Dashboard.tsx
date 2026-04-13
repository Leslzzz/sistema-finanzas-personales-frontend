import { useCallback, useEffect, useState, useRef } from 'react';
import { FiSearch, FiFilter, FiUser, FiLogOut, FiSettings, FiChevronDown, FiPlus } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import FinanceCharts from './FinanceCharts';
import AddTransactionModal from './AddTransactionModal';
import OnboardingModal from './OnboardingModal';
import {
    authService,
    TransactionService,
    type MeResponse,
    type TransactionSummary,
} from '../api/Service';

const Dashboard = () => {
    const navigate  = useNavigate();
    const menuRef   = useRef<HTMLDivElement>(null);

    const [loading, setLoading]           = useState(true);
    const [error, setError]               = useState('');
    const [me, setMe]                     = useState<MeResponse | null>(null);
    const [summary, setSummary]           = useState<TransactionSummary | null>(null);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen]   = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

    const load = useCallback(async () => {
        try {
            const [meData, summaryData] = await Promise.all([
                authService.me(),
                TransactionService.getSummary(),
            ]);
            setMe(meData);
            setSummary(summaryData);
            setError('');

            // Abrir onboarding si el usuario no lo ha completado
            if (!meData.onboardingCompleted && !localStorage.getItem('onboarding_done')) {
                setIsOnboardingOpen(true);
            }
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
                            <span className="user-name">{me?.name || 'Usuario'}</span>
                            <FiChevronDown className={`chevron ${showUserMenu ? 'rotate' : ''}`} />
                        </button>
                        {showUserMenu && (
                            <div className="user-dropdown">
                                <div className="dropdown-header">
                                    <p>Conectado como</p>
                                    <h4>{me?.name || '—'}</h4>
                                    <small style={{ color: '#475569', fontSize: '0.78rem' }}>
                                        {me?.email}
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
                {!loading && !error && me && summary && (
                    <div className="welcome-card">
                        <h1>Panel Principal</h1>
                        <p className="subtitle">Bienvenido, {me.name}</p>
                        <FinanceCharts summary={summary} onRefresh={handleRefresh} />
                    </div>
                )}
            </main>

            <button
                className="fab-add-button"
                onClick={() => setIsAddModalOpen(true)}
                title="Agregar nuevo registro"
            >
                <FiPlus />
            </button>

            <AddTransactionModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onSuccess={() => {
                    setIsAddModalOpen(false);
                    handleRefresh();
                }}
            />

            <OnboardingModal
                isOpen={isOnboardingOpen}
                onClose={() => setIsOnboardingOpen(false)}
                onSuccess={() => {
                    setIsOnboardingOpen(false);
                    handleRefresh();
                }}
                userName={me?.name || 'Usuario'}
            />
        </div>
    );
};

export default Dashboard;
