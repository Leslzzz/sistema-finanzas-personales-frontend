/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
    FiDownload, FiUpload, FiTrendingUp, FiTrendingDown,
    FiDollarSign, FiX, FiArrowUpRight, FiArrowDownRight, FiPlus,
    FiCheck, FiFileText, FiCalendar, FiTag,
} from 'react-icons/fi';
import './FinanceCharts.css';
import type { TransactionSummary, Transaction, CategoryDistribution } from '../api/Service';
import { TransactionService, PREDEFINED_CATEGORIES } from '../api/Service';
import toast from 'react-hot-toast';

// ─── Tipos ────────────────────────────────────────────────────────────────────

type TabType = 'gasto' | 'ingreso';

// ─── Mock historial mensual ────────────────────────────────────────────────────

const MONTHLY_MOCK = [
    { mes: 'Nov', gasto: 0, ingreso: 0 },
    { mes: 'Dic', gasto: 0, ingreso: 0 },
    { mes: 'Ene', gasto: 0, ingreso: 0 },
    { mes: 'Feb', gasto: 0, ingreso: 0 },
    { mes: 'Mar', gasto: 0, ingreso: 0 },
    { mes: 'Abr', gasto: 0, ingreso: 0 },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="fc-tooltip">
                <p className="fc-tooltip-label">{payload[0].name}</p>
                <p className="fc-tooltip-value">{payload[0].value}%</p>
            </div>
        );
    }
    return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
        return (
            <div className="fc-tooltip">
                <p className="fc-tooltip-label">{label}</p>
                {payload.map((p: any) => (
                    <p key={p.name} style={{ color: p.color }}>
                        {p.name === 'gasto' ? 'Gasto' : 'Ingreso'}: ${p.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// ─── Modal: Agregar Transacción ───────────────────────────────────────────────

interface AddTransactionModalProps {
    defaultTab: TabType;
    onClose: () => void;
    onSuccess: () => void;
}

const AddTransactionModal = ({ defaultTab, onClose, onSuccess }: AddTransactionModalProps) => {
    const [tab, setTab]           = useState<TabType>(defaultTab);
    const [amount, setAmount]     = useState('');
    const [desc, setDesc]         = useState('');
    const [category, setCategory] = useState('');
    const [date, setDate]         = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [saved, setSaved]       = useState(false);

    const isValid = !!amount && Number(amount) > 0 && !!desc &&
                    (tab === 'ingreso' || !!category);

    const handleSave = async () => {
        if (!isValid) return;
        setLoading(true);
        setError('');

        try {
            await TransactionService.create({
                desc,
                amount: Number(amount),
                type: tab,
                category: tab === 'ingreso' ? 'Otros' : category,
                date,
            });
            setSaved(true);
            setTimeout(() => {
                onSuccess();
                onClose();
            }, 900);
        } catch (err: any) {
            const detail = err?.response?.data?.message
                ?? err?.response?.data?.detail
                ?? 'Error al guardar. Intenta de nuevo.';
            setError(String(detail));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal fc-modal--add" onClick={e => e.stopPropagation()}>

                <div className="fc-modal-header">
                    <h3>Nueva Transacción</h3>
                    <button className="fc-modal-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="fc-modal-body">
                    <div className="fc-add-tabs">
                        {(['gasto', 'ingreso'] as TabType[]).map(t => (
                            <button
                                key={t}
                                className={`fc-add-tab fc-add-tab--${t} ${tab === t ? 'fc-add-tab--active' : ''}`}
                                onClick={() => setTab(t)}
                            >
                                {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                        ))}
                    </div>

                    <div className="fc-add-field">
                        <label>Monto</label>
                        <div className="fc-add-amount-wrap">
                            <span className="fc-add-currency">$</span>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={amount}
                                onChange={e => setAmount(e.target.value)}
                                className="fc-add-amount-input"
                                autoFocus
                            />
                        </div>
                    </div>

                    <div className="fc-add-field">
                        <label><FiFileText /> Descripción</label>
                        <input
                            type="text"
                            placeholder={tab === 'gasto' ? 'Ej. Supermercado, Netflix…' : 'Ej. Salario, Freelance…'}
                            value={desc}
                            onChange={e => setDesc(e.target.value)}
                            className="fc-add-input"
                        />
                    </div>

                    <div className="fc-add-field">
                        <label><FiCalendar /> Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="fc-add-input fc-add-input--date"
                        />
                    </div>

                    {tab === 'gasto' && (
                        <div className="fc-add-field">
                            <label><FiTag /> Categoría</label>
                            <div className="fc-add-categories">
                                {PREDEFINED_CATEGORIES.map(cat => (
                                    <button
                                        key={cat.label}
                                        className={`fc-add-cat-btn ${category === cat.label ? 'fc-add-cat-btn--active' : ''}`}
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

                    {error && <p className="fc-add-error">{error}</p>}
                </div>

                <div className="fc-modal-footer">
                    <button className="fc-btn-ghost" onClick={onClose}>Cancelar</button>
                    <button
                        className={`fc-btn-primary ${saved ? 'fc-btn--saved' : ''}`}
                        disabled={!isValid || loading || saved}
                        onClick={handleSave}
                    >
                        {saved ? <><FiCheck /> Guardado</> : loading ? 'Guardando…' : `Guardar ${tab}`}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Modal: Importar ──────────────────────────────────────────────────────────

const ImportModal = ({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) => {
    const inputRef              = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);

    const handleFile = async (file: File) => {
        setLoading(true);
        try {
            const { imported } = await TransactionService.importFile(file);
            toast.success(`Se importaron ${imported} transacciones.`);
            onSuccess();
            onClose();
        } catch (err: any) {
            toast.error(err?.response?.data?.message ?? 'Error al importar el archivo.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    };

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal" onClick={e => e.stopPropagation()}>
                <div className="fc-modal-header">
                    <h3>Importar Transacciones</h3>
                    <button className="fc-modal-close" onClick={onClose}><FiX /></button>
                </div>
                <div className="fc-modal-body">
                    <div
                        className="fc-dropzone"
                        onDragOver={e => e.preventDefault()}
                        onDrop={handleDrop}
                        onClick={() => inputRef.current?.click()}
                    >
                        <FiUpload className="fc-dropzone-icon" />
                        <p>Arrastra tu archivo aquí o haz clic para seleccionar</p>
                        <span>CSV, Excel (.xlsx)</span>
                        <input
                            ref={inputRef}
                            type="file"
                            accept=".csv,.xlsx"
                            style={{ display: 'none' }}
                            onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                        />
                    </div>
                </div>
                <div className="fc-modal-footer">
                    <button className="fc-btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="fc-btn-primary" disabled={loading}>
                        {loading ? 'Importando…' : 'Importar'}
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Modal: Exportar ──────────────────────────────────────────────────────────

const ExportModal = ({ onClose }: { onClose: () => void }) => {
    const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

    const handleDownload = () => {
        const url = TransactionService.getExportUrl(format);
        window.open(url, '_blank');
        onClose();
    };

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal" onClick={e => e.stopPropagation()}>
                <div className="fc-modal-header">
                    <h3>Exportar Reporte</h3>
                    <button className="fc-modal-close" onClick={onClose}><FiX /></button>
                </div>
                <div className="fc-modal-body">
                    <p className="fc-modal-sub">Formato:</p>
                    <div className="fc-export-options">
                        {(['csv', 'pdf'] as const).map(fmt => (
                            <label key={fmt} className="fc-export-option">
                                <input
                                    type="radio"
                                    name="format"
                                    checked={format === fmt}
                                    onChange={() => setFormat(fmt)}
                                />
                                <span>{fmt.toUpperCase()}</span>
                            </label>
                        ))}
                    </div>
                </div>
                <div className="fc-modal-footer">
                    <button className="fc-btn-ghost" onClick={onClose}>Cancelar</button>
                    <button className="fc-btn-primary" onClick={handleDownload}>
                        <FiDownload /> Descargar
                    </button>
                </div>
            </div>
        </div>
    );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface FinanceChartsProps {
    summary: TransactionSummary;
    onRefresh: () => void;
}

const FinanceCharts = ({ summary, onRefresh }: FinanceChartsProps) => {
    const [showImport, setShowImport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [addModal, setAddModal]     = useState<{ open: boolean; tab: TabType }>({ open: false, tab: 'gasto' });

    const [categoryDist, setCategoryDist]  = useState<CategoryDistribution[]>([]);
    const [transactions, setTransactions]  = useState<Transaction[]>([]);
    const [loadingData, setLoadingData]    = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, txs] = await Promise.all([
                    TransactionService.getCategories(),
                    TransactionService.getAll(),
                ]);
                setCategoryDist(cats);
                setTransactions(txs);
            } catch (e) {
                console.error('Error cargando datos:', e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // Summary cards
    const totalGasto   = summary.gastos;
    const totalIngreso = summary.ingresos;
    const balance      = summary.balance;
    const presupuesto  = totalIngreso || 1;
    const porcentaje   = Math.min(Math.round((totalGasto / presupuesto) * 100), 100);

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const openAdd = (tab: TabType) => setAddModal({ open: true, tab });

    const handleImportSuccess = () => {
        onRefresh();
        setLoadingData(true);
        TransactionService.getAll()
            .then(txs => setTransactions(txs))
            .finally(() => setLoadingData(false));
    };

    return (
        <div className="fc-wrapper">

            {/* ── Summary Cards ── */}
            <div className="fc-summary-row">

                <div className="fc-card fc-card--accent">
                    <div className="fc-card-icon"><FiDollarSign /></div>
                    <div className="fc-card-info">
                        <p className="fc-card-label">Gasto del Mes</p>
                        <h2 className="fc-card-value">${totalGasto.toLocaleString()}</h2>
                    </div>
                    <div className="fc-card-badge fc-badge--warn">
                        <FiArrowUpRight /> {porcentaje}%
                    </div>
                    <button className="fc-card-add-btn" title="Agregar gasto" onClick={() => openAdd('gasto')}>
                        <FiPlus />
                    </button>
                </div>

                <div className="fc-card">
                    <div className="fc-card-icon fc-icon--green"><FiTrendingUp /></div>
                    <div className="fc-card-info">
                        <p className="fc-card-label">Ingresos</p>
                        <h2 className="fc-card-value">${totalIngreso.toLocaleString()}</h2>
                    </div>
                    <div className="fc-progress-wrap">
                        <div className="fc-progress-bar">
                            <div className="fc-progress-fill" style={{ width: `${porcentaje}%` }} />
                        </div>
                        <span className="fc-progress-label">{porcentaje}% usado</span>
                    </div>
                    <button className="fc-card-add-btn fc-card-add-btn--green" title="Agregar ingreso" onClick={() => openAdd('ingreso')}>
                        <FiPlus />
                    </button>
                </div>

                <div className="fc-card">
                    <div className="fc-card-icon fc-icon--cyan"><FiTrendingDown /></div>
                    <div className="fc-card-info">
                        <p className="fc-card-label">Balance</p>
                        <h2 className="fc-card-value" style={{ color: balance > 0 ? '#AEFF00' : '#ef4444' }}>
                            ${balance.toLocaleString()}
                        </h2>
                    </div>
                    <div className={`fc-card-badge ${balance > 0 ? 'fc-badge--ok' : 'fc-badge--err'}`}>
                        {balance > 0 ? <FiArrowDownRight /> : <FiArrowUpRight />}
                        {balance > 0 ? 'Bajo control' : 'Excedido'}
                    </div>
                </div>
            </div>

            {/* ── Charts Row ── */}
            <div className="fc-charts-row">

                {/* Donut — distribución porcentual del mes */}
                <div className="fc-panel fc-panel--pie">
                    <div className="fc-panel-header">
                        <h3>Gastos por Categoría</h3>
                        <span className="fc-panel-sub">
                            {new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })}
                        </span>
                    </div>

                    {loadingData ? (
                        <div className="fc-chart-loading">Cargando categorías…</div>
                    ) : categoryDist.length === 0 ? (
                        <div className="fc-chart-empty">Sin gastos este mes</div>
                    ) : (
                        <div className="fc-pie-layout">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={categoryDist}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        nameKey="label"
                                        onMouseEnter={(_, i) => setActiveIndex(i)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        {categoryDist.map((entry, i) => (
                                            <Cell
                                                key={entry.label}
                                                fill={entry.color}
                                                opacity={activeIndex === null || activeIndex === i ? 1 : 0.35}
                                                stroke="none"
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomPieTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>
                            <ul className="fc-legend">
                                {categoryDist.map((d, i) => (
                                    <li
                                        key={d.label}
                                        className={`fc-legend-item ${activeIndex === i ? 'fc-legend-item--active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        <span className="fc-legend-dot" style={{ background: d.color }} />
                                        <span className="fc-legend-name">{d.label}</span>
                                        <span className="fc-legend-val">{d.value}%</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button className="fc-action-btn" onClick={() => setShowImport(true)}>
                        <FiUpload /> Importar
                    </button>
                </div>

                {/* Bar — historial mensual */}
                <div className="fc-panel fc-panel--bar">
                    <div className="fc-panel-header">
                        <h3>Historial Mensual</h3>
                    </div>
                    <ResponsiveContainer width="100%" height={220}>
                        <BarChart data={MONTHLY_MOCK} barGap={4} barCategoryGap="30%">
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                            <XAxis dataKey="mes" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false}
                                   tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                            <Bar dataKey="ingreso" fill="rgba(14,205,0,0.25)" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="gasto"   fill="#AEFF00"             radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                    <div className="fc-bar-legend">
                        <span><span className="fc-dot" style={{ background: '#AEFF00' }} />Gastos</span>
                        <span><span className="fc-dot" style={{ background: 'rgba(14,205,0,0.4)' }} />Ingresos</span>
                    </div>
                    <button className="fc-action-btn" onClick={() => setShowExport(true)}>
                        <FiDownload /> Exportar
                    </button>
                </div>
            </div>

            {/* ── Transacciones Recientes ── */}
            <div className="fc-panel fc-panel--table">
                <div className="fc-panel-header">
                    <h3>Transacciones Recientes</h3>
                    <button className="fc-link-btn">Ver todas →</button>
                </div>
                <div className="fc-table-wrap">
                    {loadingData ? (
                        <div className="fc-chart-loading">Cargando transacciones…</div>
                    ) : transactions.length === 0 ? (
                        <div className="fc-chart-empty">
                            No hay transacciones aún.{' '}
                            <button className="fc-link-btn" onClick={() => openAdd('gasto')}>Agrega una</button>
                        </div>
                    ) : (
                        <table className="fc-table">
                            <thead>
                                <tr>
                                    <th>Descripción</th>
                                    <th>Categoría</th>
                                    <th>Fecha</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {transactions.slice(0, 6).map(t => (
                                    <tr key={t.id}>
                                        <td>
                                            <span className={`fc-tx-dot fc-tx-dot--${t.type === 'ingreso' ? 'in' : 'out'}`} />
                                            {t.desc}
                                        </td>
                                        <td><span className="fc-chip">{t.category}</span></td>
                                        <td className="fc-muted">{t.date}</td>
                                        <td className={`fc-amount fc-amount--${t.type === 'ingreso' ? 'in' : 'out'}`}>
                                            {t.type === 'ingreso' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            {addModal.open && (
                <AddTransactionModal
                    defaultTab={addModal.tab}
                    onClose={() => setAddModal({ open: false, tab: 'gasto' })}
                    onSuccess={() => {
                        onRefresh();
                        setAddModal({ open: false, tab: 'gasto' });
                    }}
                />
            )}
            {showImport && (
                <ImportModal
                    onClose={() => setShowImport(false)}
                    onSuccess={handleImportSuccess}
                />
            )}
            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        </div>
    );
};

export default FinanceCharts;
