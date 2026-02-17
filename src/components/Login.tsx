import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginSchema } from '../models/Auth.Schema';
import './Register.css';
import { useNavigate } from 'react-router-dom'; 
import { authService } from '../api/Service'; 

const Login = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        mode: "onBlur"
    });
    const onSubmit = async (data: LoginSchema) => {
        try {
            console.log("Intentando iniciar sesión...");
            await authService.login(data);
            
            console.log("Login exitoso.");
            navigate('/dashboard'); 
        } catch (error: unknown) {
            console.error("Error en el login:", error);
            const axiosError = error as { response?: { data?: { detail?: string; message?: string } } };
            const errorMessage = 
                axiosError.response?.data?.detail || 
                axiosError.response?.data?.message || 
                "Correo o contraseña incorrectos";

            alert(errorMessage);
        }
    };

    return (
        <div className="register-container">
            <button className="back-button" onClick={() => navigate('/')}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
            </button>

            <div className="register-card">
                <div className="icon-circle">
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                    </svg>
                </div>

                <h2 className="form-title">Iniciar Sesión</h2>

                <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label>Correo Electrónico</label>
                        <input
                            type="email"
                            placeholder="ejemplo@correo.com"
                            {...register("email")}
                        />
                        {errors.email && <span className="error-text">{errors.email.message}</span>}
                    </div>

                    <div className="input-group">
                        <label>Contraseña</label>
                        <div className="password-wrapper">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                {...register("password")}
                            />
                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? "Ocultar" : "Mostrar"}
                            </button>
                        </div>
                        {errors.password && <span className="error-text">{errors.password.message}</span>}
                    </div>

                    {/* Asegúrate de que la clase CSS sea consistente */}
                    <button type="submit" className="submit-button">Ingresar</button>
                </form>
            </div>
        </div>
    );
};

export default Login;