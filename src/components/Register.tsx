import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterSchema } from '../models/Auth.Schema'; 
import './Register.css';
import { useNavigate } from 'react-router-dom';
import { authService } from '../api/Service'; 

const Register = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        mode: "onBlur"
    });

    const onSubmit = async (data: RegisterSchema) => {
        try {
            console.log("Enviando datos a Railway...", data);
            await authService.register(data); 
            
            alert("¡Cuenta creada exitosamente en Railway!");
            navigate('/'); 
        } catch (error: unknown) {
            console.error("Error en el registro:", error);
            
            const axiosError = error as { response?: { data?: { email?: string; message?: string } } };
            
            const errorMessage = 
                axiosError.response?.data?.email || 
                axiosError.response?.data?.message || 
                "Error al crear la cuenta";
                
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

                <h2 className="form-title">Crear Cuenta</h2>

                <form className="register-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="input-group">
                        <label>Nombre Completo</label>
                        <input
                            type="text"
                            placeholder="Tu Nombre"
                            {...register("name")} 
                        />
                        {errors.name && <span className="error-text">{errors.name.message}</span>}
                    </div>

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

                    <button type="submit" className="submit-button">Registrarse</button>
                </form>
            </div>
        </div>
    );
};

export default Register;