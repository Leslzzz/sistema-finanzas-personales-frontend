import { useEffect, useState } from 'react';
import './Dashboard.css';
import { dashboardService} from '../api/Service';
import { useNavigate } from 'react-router-dom';

interface DashboardData {
    user_info: {
        name: string;
    };
    summary: {
        balance_total: number;
        recent_activity: unknown[];
    };
}

const Dashboard = () => {
    const navigate = useNavigate();
    // Usamos la interfaz en el estado
    const [userData, setUserData] = useState<DashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Axios enviará la cookie automáticamente gracias a 'withCredentials'
                const data = await dashboardService.getSummary();
                setUserData(data);
                setLoading(false);
            } catch (error: unknown) {
                console.error("Error al cargar el dashboard:", error);
                // Si falla (ej. token expirado y refresh fallido), al login
                navigate('/'); 
            }
        };
        fetchDashboardData();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            navigate('/');
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            navigate('/');
        }
    };

    if (loading) return <div className="loading">Cargando tus finanzas...</div>;

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <div className="nav-logo">Finanzly</div>
                </div>
                <div className="nav-right">
                    <span className="user-name">Hola, {userData?.user_info?.name}</span>
                    <button onClick={handleLogout} className="logout-button">
                        Cerrar Sesión
                    </button>
                </div>
            </nav>

            <main className="dashboard-content">
                <div className="summary-card">
                    <h3>Balance Total</h3>
                    <p className="balance-amount">
                        ${userData?.summary?.balance_total?.toLocaleString() || '0.00'}
                    </p>
                </div>

                <section className="recent-activity">
                    <h4>Actividad Reciente</h4>
                    {(!userData?.summary?.recent_activity || userData.summary.recent_activity.length === 0) ? (
                        <p>No hay movimientos aún.</p>
                    ) : (
                        <ul>
                            {userData.summary.recent_activity.map((_item, index) => (
                                <li key={index}></li>
                            ))}
                        </ul>
                    )}
                </section>
            </main>
        </div>
    );
};

export default Dashboard;