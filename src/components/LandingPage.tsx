import './LandingPage.css';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();
    return (
        <div className="landing-container">
            <div className="main-layout">

                <div className="content-grid">
                    <div className="text-side">
                        <h1 className="title">Toma el control de tu futuro financiero</h1>
                        <p className="subtitle">
                            Gestiona tus gastos, ahorra para tus metas y visualiza tu progreso
                            en un solo lugar con nuestra plataforma intuitiva.
                        </p>
                    </div>

                    <div className="image-side">
                        <img
                            src="https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&q=80&w=800"
                            alt="Finanzas"
                            className="main-image"
                        />
                    </div>
                </div>

                <div className="footer-buttons">
                    <button
                        className="btn-secondary"
                        onClick={() => navigate('/register')}
                    >
                        Registrar Cuenta Nueva
                    </button>

                    <button
                        className="btn-primary"
                        onClick={() => navigate('/login')}
                    >
                        Iniciar Sesión
                    </button>
                </div>

            </div>
        </div>
    );
};

export default LandingPage;