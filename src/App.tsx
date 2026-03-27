import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import LandingPage    from './components/LandingPage';
import Login          from './components/Login';
import Register       from './components/Register';
import Dashboard      from './components/Dashboard';
import type { JSX } from 'react';

// ── Guard: redirige a /landing si no hay token ──────────────────────────────────
// ── Guard: redirige a /landing si no hay token ──────────────────────────────────
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    return isAuthenticated ? children : <Navigate to="/landing" replace />;
};

// ── Guard: si ya hay sesión no puede ver login/register ni landing ──────────────
const PublicRoute = ({ children }: { children: JSX.Element }) => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (isAuthenticated) return <Navigate to="/dashboard/home" replace />;
    return children;
};

// ── Decide a dónde ir desde la raíz "/" ───────────────────────────────────────
const RootRedirect = () => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');
    if (!isAuthenticated) return <Navigate to="/landing" replace />;
    return <Navigate to="/dashboard/home" replace />;
};

function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="top-right"
                reverseOrder={false}
                toastOptions={{
                    style: {
                        borderRadius: '12px',
                        background: '#1e293b',
                        color: '#fff',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                    },
                    success: {
                        iconTheme: {
                            primary: '#AEFF00',
                            secondary: '#020617',
                        },
                    },
                    error: {
                        iconTheme: {
                            primary: '#ff4d4d',
                            secondary: '#fff',
                        },
                    },
                }}
            />

            <Routes>
                {/* Raíz → decide según estado de sesión */}
                <Route path="/" element={<RootRedirect />} />

                {/* Rutas públicas — redirigen al dashboard si ya hay sesión */}
                <Route path="/landing"  element={<PublicRoute><LandingPage /></PublicRoute>} />
                <Route path="/login"    element={<PublicRoute><Login /></PublicRoute>} />
                <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

                {/* Ruta privada — requiere token. ¡Aquí vive todo ahora! */}
                <Route path="/dashboard/home"  element={<PrivateRoute><Dashboard /></PrivateRoute>} />

                {/* Cualquier ruta desconocida → raíz */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;