/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
    FiX, FiShoppingCart, FiCoffee,
    FiTruck, FiMonitor, FiHeart, FiZap, FiMoreHorizontal,
    FiCalendar, FiTag, FiFileText, FiCheck
} from 'react-icons/fi';
import './AddTransaction.css'; // Asegúrate de actualizar el CSS con el código de abajo

type Tab = 'gasto' | 'ingreso' | 'presupuesto';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void; // Para recargar el dashboard después de guardar
    defaultTab?: Tab;
}

const categories = [
    { id: 'alimentacion', label: 'Alimentación', icon: FiShoppingCart, color: '#AEFF00' },
    { id: 'cafe',         label: 'Café / Rest.',  icon: FiCoffee,       color: '#fb923c' },
    { id: 'transporte',   label: 'Transporte',    icon: FiTruck,        color: '#0ECD00' },
    { id: 'entretenimiento', label: 'Entretenimiento', icon: FiMonitor,  color: '#22d3ee' },
    { id: 'salud',        label: 'Salud',          icon: FiHeart,        color: '#a78bfa' },
    { id: 'servicios',    label: 'Servicios',      icon: FiZap,          color: '#f472b6' },
    { id: 'otros',        label: 'Otros',          icon: FiMoreHorizontal, color: '#64748b' },
];

const AddTransactionModal = ({ isOpen, onClose, onSuccess, defaultTab = 'gasto' }: ModalProps) => {
    const [tab, setTab]             = useState<Tab>(defaultTab);
    const [amount, setAmount]       = useState('');
    const [description, setDesc]    = useState('');
    const [category, setCategory]   = useState('');
    const [date, setDate]           = useState(new Date().toISOString().split('T')[0]);
    const [budgetName, setBudgetName] = useState('');
    const [budgetLimit, setBudgetLimit] = useState('');
    const [saved, setSaved]         = useState(false);

    // Resetear el estado cuando se abre el modal
    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setTab(defaultTab);
            setAmount('');
            setDesc('');
            setCategory('');
            setBudgetName('');
            setBudgetLimit('');
            setSaved(false);
        }
    }, [isOpen, defaultTab]);

    if (!isOpen) return null; // Si no está abierto, no renderizamos nada

    const handleSave = async () => {
        // AQUÍ IRÁ TU LLAMADA REAL AL BACKEND (POST /api/transacciones/)
        // const data = { type: tab, amount, description, date, category };
        // await TransactionService.create(data);

        setSaved(true);
        setTimeout(() => {
            onSuccess(); // Cierra el modal y actualiza el Dashboard
        }, 1200);
    };

    const isValid = tab === 'presupuesto'
        ? budgetName.trim() && budgetLimit
        : amount && (tab === 'ingreso' || category);

    return (
        <div className="modal-overlay" onClick={onClose}>
            {/* Detenemos la propagación para que hacer clic dentro del modal no lo cierre */}
            <div className="at-card modal-content" onClick={e => e.stopPropagation()}>
                
                {/* Botón de cerrar (X) */}
                <button className="modal-close-btn" onClick={onClose}>
                    <FiX />
                </button>

                <h1 className="at-title">Nueva Entrada</h1>
                <p className="at-subtitle">Registra un gasto, ingreso o ajusta tu presupuesto</p>

                {/* ── Tabs ── */}
                <div className="at-tabs">
                    {(['gasto', 'ingreso', 'presupuesto'] as Tab[]).map(t => (
                        <button
                            key={t}
                            className={`at-tab ${tab === t ? 'at-tab--active' : ''} at-tab--${t}`}
                            onClick={() => setTab(t)}
                        >
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* ── Form ── */}
                {tab !== 'presupuesto' ? (
                    <div className="at-form">
                        {/* Monto */}
                        <div className="at-field at-field--amount">
                            <label>Monto</label>
                            <div className="at-amount-wrap">
                                <span className="at-currency">$</span>
                                <input
                                    type="number"
                                    placeholder="0.00"
                                    value={amount}
                                    onChange={e => setAmount(e.target.value)}
                                    className="at-input at-input--big"
                                />
                            </div>
                        </div>

                        {/* Descripción */}
                        <div className="at-field">
                            <label><FiFileText /> Descripción</label>
                            <input
                                type="text"
                                placeholder={tab === 'gasto' ? 'Ej. Supermercado, Netflix…' : 'Ej. Salario, Freelance…'}
                                value={description}
                                onChange={e => setDesc(e.target.value)}
                                className="at-input"
                            />
                        </div>

                        {/* Fecha */}
                        <div className="at-field">
                            <label><FiCalendar /> Fecha</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="at-input at-input--date"
                            />
                        </div>

                        {/* Categorías (Solo Gastos) */}
                        {tab === 'gasto' && (
                            <div className="at-field">
                                <label><FiTag /> Categoría</label>
                                <div className="at-categories">
                                    {categories.map(cat => {
                                        const Icon = cat.icon;
                                        return (
                                            <button
                                                key={cat.id}
                                                className={`at-cat-btn ${category === cat.id ? 'at-cat-btn--active' : ''}`}
                                                style={{ '--cat-color': cat.color } as any}
                                                onClick={() => setCategory(cat.id)}
                                            >
                                                <Icon />
                                                <span>{cat.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    /* ── Formulario Presupuesto ── */
                    <div className="at-form">
                        {/* ... (Tu código actual de presupuesto se queda igual) ... */}
                        <div className="at-field">
                            <label><FiTag /> Nombre del Presupuesto</label>
                            <input type="text" placeholder="Ej. Enero 2025, Vacaciones…" value={budgetName} onChange={e => setBudgetName(e.target.value)} className="at-input" />
                        </div>
                        <div className="at-field at-field--amount">
                            <label>Límite de Gasto</label>
                            <div className="at-amount-wrap">
                                <span className="at-currency">$</span>
                                <input type="number" placeholder="0.00" value={budgetLimit} onChange={e => setBudgetLimit(e.target.value)} className="at-input at-input--big" />
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Acciones ── */}
                <div className="at-actions" style={{ marginTop: '20px' }}>
                    <button className="at-btn-ghost" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className={`at-btn-primary ${saved ? 'at-btn--saved' : ''}`}
                        disabled={!isValid || saved}
                        onClick={handleSave}
                    >
                        {saved ? <><FiCheck /> Guardado</> : `Guardar ${tab.charAt(0).toUpperCase() + tab.slice(1)}`}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default AddTransactionModal;