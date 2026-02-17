import { useEffect} from 'react';
import './Dashboard.css';

const Dashboard = () => {


    useEffect(() => {
        const fetchDashboardData = async () => {
        };
        fetchDashboardData();

    }, []);

    return (
        <div className="dashboard-container">
            <nav className="dashboard-nav">
                <div className="nav-left">
                    <div className="nav-logo">Finanzly</div>
                </div>
            </nav>
        </div>
    );
};

export default Dashboard;