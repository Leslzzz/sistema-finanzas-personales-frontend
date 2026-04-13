/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
    FiX, FiCalendar, FiTag, FiFileText, FiCheck
} from 'react-icons/fi';
import './AddTransaction.css';
import { TransactionService, PREDEFINED_CATEGORIES } from '../api/Service';
import toast from 'react-hot-toast';

type Tab = 'gasto' | 'ingreso';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    defaultTab?: Tab;
}

const AddTransactionModal = ({ isOpen, onClose, onSuccess, defaultTab = 'gasto' }: ModalProps) => {
    const [tab, setTab]           = useState<Tab>(defaultTab);
    const [amount, setAmount]     = useState('');
    const [desc, setDesc]         = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading]   = useState(false);
    const [saved, setSaved]       = useState(false);

    useEffect(() => {
        if (isOpen) {
            setTab(defaultTab);
            setAmount('');
            setDesc('');
            setCategory('');
            setDate(new Date().toISOString().split('T')[0]);
            setSaved(false);
        }
    }, [isOpen, defaultTab]);

    if (!isOpen) return null;

    const isValid = !!amount && Number(amount) > 0 && !!desc &&
                    (tab === 'ingreso' || !!category);

    const handleSave = async () => {
        if (!isValid) return;
        setLoading(true);

        try {
            await TransactionService.create({
                desc,
                amount: Number(amount),
                type: tab,
                category: tab === 'ingreso' ? 'Otros' : category,
                date,
            });

            setSaved(true);
            toast.success(`${tab.charAt(0).toUpperCase() + tab.slice(1)} guardado.`);
            setTimeout(() => {
                onSuccess();
            }, 900);
        } catch (err: any) {
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.detail ||
                'Error al guardar. Intenta de nuevo.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="at-card modal-content" onClick={e => e.stopPropagation()}>

                <button className="modal-close-btn" onClick={onClose}>
                    <FiX />
                </button>

                <h1 className="at-title">Nueva Entrada</h1>
                <p className="at-subtitle">Registra un gasto o ingreso</p>

                {/* ── Tabs ── */}
                <div className="at-tabs">
                    {(['gasto', 'ingreso'] as Tab[]).map(t => (
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
                <div className="at-form">
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
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="at-field">
                        <label><FiFileText /> Descripción</label>
                        <input
                            type="text"
                            placeholder={tab === 'gasto' ? 'Ej. Supermercado, Netflix…' : 'Ej. Salario, Freelance…'}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="at-input"
                        />
                    </div>

                    <div className="at-field">
                        <label><FiCalendar /> Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="at-input at-input--date"
                        />
                    </div>

                    {tab === 'gasto' && (
                        <div className="at-field">
                            <label><FiTag /> Categoría</label>
                            <div className="at-categories">
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.label}
                                        className={`at-cat-btn ${category === cat.label ? 'at-cat-btn--active' : ''}`}
                                        style={{ '--cat-color': cat.color } as any}
                                        onClick={() => setCategory(cat.label)}
                                    >
                                        <span>{cat.icon}</span>
                                        <span>{cat.label}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* ── Acciones ── */}
                <div className="at-actions" style={{ marginTop: '20px' }}>
                    <button className="at-btn-ghost" onClick={onClose}>
                        Cancelar
                    </button>
                    <button
                        className={`at-btn-primary ${saved ? 'at-btn--saved' : ''}`}
                        disabled={!isValid || loading || saved}
                        onClick={handleSave}
                    >
                        {saved
                            ? <><FiCheck /> Guardado</>
                            : loading
                            ? 'Guardando…'
                            : `Guardar ${tab.charAt(0).toUpperCase() + tab.slice(1)}`
                        }
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddTransactionModal;
