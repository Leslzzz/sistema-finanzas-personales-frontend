/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
    FiArrowRight, FiArrowLeft, FiCheck,
    FiShoppingCart, FiTruck, FiMonitor, FiHeart,
    FiZap, FiMoreHorizontal, FiCoffee, FiHome, FiBook
} from 'react-icons/fi';
import './Onboarding.css'; // Mantenemos el mismo archivo CSS (solo le agregaremos el overlay más abajo)

// ─── Config ───────────────────────────────────────────────────────────────────

const CURRENCIES = ['MXN', 'USD', 'EUR', 'CAD'];

const ALL_CATEGORIES = [
    { id: 'Alimentación',    label: 'Alimentación',    icon: FiShoppingCart,   color: '#AEFF00' },
    { id: 'Café',            label: 'Café / Rest.',    icon: FiCoffee,         color: '#fb923c' },
    { id: 'Transporte',      label: 'Transporte',      icon: FiTruck,          color: '#0ECD00' },
    { id: 'Entretenimiento', label: 'Entretenimiento', icon: FiMonitor,        color: '#22d3ee' },
    { id: 'Salud',           label: 'Salud',           icon: FiHeart,          color: '#a78bfa' },
    { id: 'Servicios',       label: 'Servicios',       icon: FiZap,            color: '#f472b6' },
    { id: 'Hogar',           label: 'Hogar',           icon: FiHome,           color: '#fbbf24' },
    { id: 'Educación',       label: 'Educación',       icon: FiBook,           color: '#60a5fa' },
    { id: 'Otros',           label: 'Otros',           icon: FiMoreHorizontal, color: '#64748b' },
];

const STEPS = ['Bienvenida', 'Presupuesto', 'Categorías', 'Listo'];

// ─── Interfaz y Props ────────────────────────────────────────────────────────

interface OnboardingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    userName: string;
}

// ─── Step components (Se mantienen igual, sin cambios de lógica) ─────────────

const StepWelcome = ({ nombre }: { nombre: string }) => (
    <div className="ob-step ob-step--welcome">
        <div className="ob-welcome-emoji">👋</div>
        <h2>¡Hola, {nombre || 'bienvenido'}!</h2>
        <p>Vamos a configurar tu cuenta en menos de 2 minutos.<br />
            Solo necesitamos un poco de información para personalizar tu experiencia.</p>
        <ul className="ob-checklist">
            <li><FiCheck /> Establece tu presupuesto mensual</li>
            <li><FiCheck /> Elige las categorías que usas</li>
            <li><FiCheck /> Empieza a registrar tus gastos</li>
        </ul>
    </div>
);

const StepBudget = ({ budget, setBudget, currency, setCurrency }: any) => (
    <div className="ob-step">
        <h2>¿Cuál es tu presupuesto mensual?</h2>
        <p>Este será el límite por defecto para cada categoría. Puedes ajustarlo después.</p>
        <div className="ob-currency-row">
            {CURRENCIES.map(c => (
                <button
                    key={c}
                    className={`ob-currency-btn ${currency === c ? 'ob-currency-btn--active' : ''}`}
                    onClick={() => setCurrency(c)}
                >{c}</button>
            ))}
        </div>
        <div className="ob-amount-wrap">
            <span className="ob-currency-symbol">$</span>
            <input
                type="number"
                placeholder="0"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                className="ob-amount-input"
                autoFocus
            />
            <span className="ob-currency-tag">{currency}</span>
        </div>
        <div className="ob-presets">
            {['5000', '10000', '15000', '20000'].map(p => (
                <button key={p} className="ob-preset-btn" onClick={() => setBudget(p)}>
                    ${Number(p).toLocaleString()}
                </button>
            ))}
        </div>
    </div>
);

const StepCategories = ({ selected, toggle }: any) => (
    <div className="ob-step">
        <h2>¿En qué sueles gastar?</h2>
        <p>Selecciona las categorías que quieres rastrear. Mínimo 1.</p>
        <div className="ob-cat-grid">
            {ALL_CATEGORIES.map(cat => {
                const Icon = cat.icon;
                const active = selected.includes(cat.id);
                return (
                    <button
                        key={cat.id}
                        className={`ob-cat-btn ${active ? 'ob-cat-btn--active' : ''}`}
                        style={{ '--cat-color': cat.color } as any}
                        onClick={() => toggle(cat.id)}
                    >
                        <div className="ob-cat-icon"><Icon /></div>
                        <span>{cat.label}</span>
                        {active && <FiCheck className="ob-cat-check" />}
                    </button>
                );
            })}
        </div>
    </div>
);

const StepDone = () => (
    <div className="ob-step ob-step--done">
        <div className="ob-done-circle"><FiCheck /></div>
        <h2>¡Todo listo!</h2>
        <p>Tus categorías fueron creadas. Ahora puedes empezar a registrar tus gastos.</p>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const OnboardingModal = ({ isOpen, onClose, onSuccess, userName }: OnboardingModalProps) => {
    const [step, setStep]               = useState(0);
    const [budget, setBudget]           = useState('');
    const [currency, setCurrency]       = useState('MXN');
    const [categories, setCategories]   = useState<string[]>(['Alimentación', 'Transporte']);
    const [loading, setLoading]         = useState(false);
    const [error, setError]             = useState('');

    // Resetear el modal si se abre de nuevo (aunque lo ideal es que solo se abra una vez en la vida del usuario)
    useEffect(() => {
        if (isOpen) {
            setStep(0);
            setBudget('');
            setCategories(['Alimentación', 'Transporte']);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const toggleCategory = (id: string) => {
        setCategories(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const canAdvance = () => {
        if (step === 1) return !!budget && Number(budget) > 0;
        if (step === 2) return categories.length > 0;
        return true;
    };

    const handleNext = async () => {
        if (step < STEPS.length - 2) {
            setStep(s => s + 1);
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Simulamos o hacemos la llamada a tu API
            /*
            const budgetPerCategory = Math.round(Number(budget) / categories.length);
            await Promise.all(
                categories.map(name =>
                    api.post('/api/categories/', { name, budget: budgetPerCategory })
                )
            );
            */
           
            // Simulamos guardado exitoso
            await new Promise(r => setTimeout(r, 1000));
            
            // Si el backend es quien maneja si el usuario es nuevo o no,
            // quizás aquí llamemos a un endpoint tipo PATCH /api/users/me/ {is_new_user: false}
            
            setStep(STEPS.length - 1); 
        } catch (err: any) {
            setError(err?.response?.data?.detail || 'Ocurrió un error al guardar las categorías.');
        } finally {
            setLoading(false);
        }
    };

    const isLastStep = step === STEPS.length - 2;
    const isDoneStep = step === STEPS.length - 1;

    return (
        // Contenedor overlay oscuro igual al de AddTransaction
        <div className="modal-overlay">
            {/* Detenemos propagación para que no se cierre haciendo clic dentro */}
            <div className="ob-card modal-content-onboarding" onClick={e => e.stopPropagation()}>
                
                <div className="ob-glow ob-glow--tr" />
                <div className="ob-glow ob-glow--bl" />

                <div className="ob-logo">Finanzly</div>

                {/* Progress dots */}
                {!isDoneStep && (
                    <div className="ob-progress">
                        {STEPS.slice(0, -1).map((_, i) => (
                            <div key={i} className={`ob-dot ${i === step ? 'ob-dot--active' : ''} ${i < step ? 'ob-dot--done' : ''}`} />
                        ))}
                    </div>
                )}

                {!isDoneStep && (
                    <p className="ob-step-label">
                        Paso {step + 1} de {STEPS.length - 1} — <strong>{STEPS[step]}</strong>
                    </p>
                )}

                <div className="ob-content" key={step}>
                    {step === 0 && <StepWelcome nombre={userName} />}
                    {step === 1 && <StepBudget budget={budget} setBudget={setBudget} currency={currency} setCurrency={setCurrency} />}
                    {step === 2 && <StepCategories selected={categories} toggle={toggleCategory} />}
                    {step === 3 && <StepDone />}
                </div>

                {error && <p className="ob-error">{error}</p>}

                <div className="ob-nav">
                    {step > 0 && !isDoneStep && (
                        <button className="ob-btn-ghost" onClick={() => setStep(s => s - 1)}>
                            <FiArrowLeft /> Atrás
                        </button>
                    )}

                    {!isDoneStep ? (
                        <button
                            className="ob-btn-primary"
                            onClick={handleNext}
                            disabled={!canAdvance() || loading}
                        >
                            {loading ? 'Guardando…' : isLastStep ? 'Finalizar' : 'Continuar'}
                            {!loading && <FiArrowRight />}
                        </button>
                    ) : (
                        <button
                            className="ob-btn-primary ob-btn--done"
                            onClick={() => onSuccess()} // Al terminar, llama a onSuccess
                        >
                            Ir al Dashboard <FiArrowRight />
                        </button>
                    )}
                </div>

                {/* Botón para omitir */}
                {step === 0 && (
                    <button className="ob-skip" onClick={() => onClose()}>
                        Omitir por ahora
                    </button>
                )}

            </div>
        </div>
    );
};

export default OnboardingModal;