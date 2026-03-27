/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import {
    PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
    BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import {
    FiDownload, FiUpload, FiTrendingUp, FiTrendingDown,
    FiDollarSign, FiX, FiArrowUpRight, FiArrowDownRight, FiPlus,
    FiShoppingCart, FiCoffee, FiTruck, FiMonitor, FiHeart,
    FiZap, FiHome, FiBook, FiMoreHorizontal, FiFileText, FiCalendar, FiTag, FiCheck
} from 'react-icons/fi';
import './FinanceCharts.css';
import type { DashboardSummary, Category, Transaction } from '../api/Service';
import { CategoryService, TransactionService } from '../api/Service';

// ─── Constantes ───────────────────────────────────────────────────────────────

// Paleta de colores por nombre de categoría
const CATEGORY_COLORS: Record<string, string> = {
    'Alimentación': '#AEFF00',
    'Café':         '#fb923c',
    'Transporte':   '#0ECD00',
    'Entretenimiento': '#22d3ee',
    'Salud':        '#a78bfa',
    'Servicios':    '#f472b6',
    'Hogar':        '#fbbf24',
    'Educación':    '#60a5fa',
    'Otros':        '#64748b',
};

const CATEGORY_ICONS: Record<string, any> = {
    'Alimentación': FiShoppingCart,
    'Café':         FiCoffee,
    'Transporte':   FiTruck,
    'Entretenimiento': FiMonitor,
    'Salud':        FiHeart,
    'Servicios':    FiZap,
    'Hogar':        FiHome,
    'Educación':    FiBook,
    'Otros':        FiMoreHorizontal,
};

// Mock solo para historial mensual — pendiente endpoint del backend
const MONTHLY_MOCK = [
    { mes: 'Ago', gasto: 0, ingreso: 0 },
    { mes: 'Sep', gasto: 0, ingreso: 0 },
    { mes: 'Oct', gasto: 0, ingreso: 0 },
    { mes: 'Nov', gasto: 0, ingreso: 0 },
    { mes: 'Dic', gasto: 0, ingreso: 0 },
    { mes: 'Ene', gasto: 0, ingreso: 0 },
];

// ─── Tooltips ─────────────────────────────────────────────────────────────────

const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
        return (
            <div className="fc-tooltip">
                <p className="fc-tooltip-label">{payload[0].name}</p>
                <p className="fc-tooltip-value">${Number(payload[0].value).toLocaleString()}</p>
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

type TabType = 'gasto' | 'ingreso';

interface AddTransactionModalProps {
    defaultTab: TabType;
    categories: Category[];
    onClose: () => void;
    onSuccess: () => void;   // refresca datos del dashboard al guardar
}

const AddTransactionModal = ({ defaultTab, categories, onClose, onSuccess }: AddTransactionModalProps) => {
    const [tab, setTab]               = useState<TabType>(defaultTab);
    const [amount, setAmount]         = useState('');
    const [description, setDesc]      = useState('');
    const [categoryId, setCategoryId] = useState<number | ''>('');
    const [date, setDate]             = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading]       = useState(false);
    const [error, setError]           = useState('');
    const [saved, setSaved]           = useState(false);

    const isValid = !!amount && Number(amount) > 0 && !!description &&
                    (tab === 'ingreso' || categoryId !== '');

    const handleSave = async () => {
        if (!isValid) return;
        setLoading(true);
        setError('');

        try {
            // El backend espera description, category (id), y los detalles
            // de income o outcome según el tipo.
            // ⚠️  Tu compañero debe confirmar la estructura exacta del serializer.
            await TransactionService.create({
                description,
                category: tab === 'gasto' ? Number(categoryId) : Number(categories[0]?.id ?? 1),
                ...(tab === 'gasto'
                    ? { outcome_details: { expense: amount } }
                    : { income_details: { amount } }
                ),
            });

            setSaved(true);
            setTimeout(() => {
                onSuccess();   // refresca el dashboard
                onClose();
            }, 900);
        } catch (err: any) {
            const detail = err?.response?.data?.detail
                ?? Object.values(err?.response?.data ?? {})?.[0]
                ?? 'Error al guardar. Intenta de nuevo.';
            setError(String(detail));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fc-modal-overlay" onClick={onClose}>
            <div className="fc-modal fc-modal--add" onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div className="fc-modal-header">
                    <h3>Nueva Transacción</h3>
                    <button className="fc-modal-close" onClick={onClose}><FiX /></button>
                </div>

                <div className="fc-modal-body">

                    {/* Tabs */}
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

                    {/* Monto */}
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

                    {/* Descripción */}
                    <div className="fc-add-field">
                        <label><FiFileText /> Descripción</label>
                        <input
                            type="text"
                            placeholder={tab === 'gasto' ? 'Ej. Supermercado, Netflix…' : 'Ej. Salario, Freelance…'}
                            value={description}
                            onChange={e => setDesc(e.target.value)}
                            className="fc-add-input"
                        />
                    </div>

                    {/* Fecha */}
                    <div className="fc-add-field">
                        <label><FiCalendar /> Fecha</label>
                        <input
                            type="date"
                            value={date}
                            onChange={e => setDate(e.target.value)}
                            className="fc-add-input fc-add-input--date"
                        />
                    </div>

                    {/* Categoría (solo gastos) */}
                    {tab === 'gasto' && (
                        <div className="fc-add-field">
                            <label><FiTag /> Categoría</label>
                            {categories.length === 0 ? (
                                <p className="fc-add-hint">No tienes categorías aún. Completa el onboarding.</p>
                            ) : (
                                <div className="fc-add-categories">
                                    {categories.map(cat => {
                                        const Icon = CATEGORY_ICONS[cat.name] ?? FiMoreHorizontal;
                                        const color = CATEGORY_COLORS[cat.name] ?? '#64748b';
                                        return (
                                            <button
                                                key={cat.id}
                                                className={`fc-add-cat-btn ${categoryId === cat.id ? 'fc-add-cat-btn--active' : ''}`}
                                                style={{ '--cat-color': color } as any}
                                                onClick={() => setCategoryId(cat.id)}
                                            >
                                                <Icon />
                                                <span>{cat.name}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}

                    {error && <p className="fc-add-error">{error}</p>}
                </div>

                {/* Footer */}
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

const ImportModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fc-modal-overlay" onClick={onClose}>
        <div className="fc-modal" onClick={e => e.stopPropagation()}>
            <div className="fc-modal-header">
                <h3>Importar Transacciones</h3>
                <button className="fc-modal-close" onClick={onClose}><FiX /></button>
            </div>
            <div className="fc-modal-body">
                <div className="fc-dropzone">
                    <FiUpload className="fc-dropzone-icon" />
                    <p>Arrastra tu archivo aquí</p>
                    <span>CSV, Excel (.xlsx) — máx 10 MB</span>
                    <button className="fc-btn-outline">Seleccionar archivo</button>
                </div>
            </div>
            <div className="fc-modal-footer">
                <button className="fc-btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="fc-btn-primary">Importar</button>
            </div>
        </div>
    </div>
);

// ─── Modal: Exportar ──────────────────────────────────────────────────────────

const ExportModal = ({ onClose }: { onClose: () => void }) => (
    <div className="fc-modal-overlay" onClick={onClose}>
        <div className="fc-modal" onClick={e => e.stopPropagation()}>
            <div className="fc-modal-header">
                <h3>Exportar Reporte</h3>
                <button className="fc-modal-close" onClick={onClose}><FiX /></button>
            </div>
            <div className="fc-modal-body">
                <p className="fc-modal-sub">Formato:</p>
                <div className="fc-export-options">
                    {['CSV', 'Excel (.xlsx)', 'PDF'].map(fmt => (
                        <label key={fmt} className="fc-export-option">
                            <input type="radio" name="format" defaultChecked={fmt === 'CSV'} />
                            <span>{fmt}</span>
                        </label>
                    ))}
                </div>
                <p className="fc-modal-sub" style={{ marginTop: '1.2rem' }}>Rango de fechas:</p>
                <div className="fc-date-row">
                    <input type="date" className="fc-date-input" />
                    <span>—</span>
                    <input type="date" className="fc-date-input" />
                </div>
            </div>
            <div className="fc-modal-footer">
                <button className="fc-btn-ghost" onClick={onClose}>Cancelar</button>
                <button className="fc-btn-primary"><FiDownload /> Descargar</button>
            </div>
        </div>
    </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface FinanceChartsProps {
    summary: DashboardSummary;
    onRefresh: () => void;   // llama al padre para recargar el dashboard
}

const FinanceCharts = ({ summary, onRefresh }: FinanceChartsProps) => {
    const [showImport, setShowImport] = useState(false);
    const [showExport, setShowExport] = useState(false);
    const [addModal, setAddModal]     = useState<{ open: boolean; tab: TabType }>({ open: false, tab: 'gasto' });

    // ── Datos reales ──────────────────────────────────────────────────────────
    const [categories, setCategories]     = useState<Category[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loadingData, setLoadingData]   = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [cats, txs] = await Promise.all([
                    CategoryService.getAll(),
                    TransactionService.getAll(),
                ]);
                setCategories(cats);
                setTransactions(txs);
            } catch (e) {
                console.error('Error cargando categorías/transacciones:', e);
            } finally {
                setLoadingData(false);
            }
        };
        fetchData();
    }, []);

    // ── Derivar datos para los charts ─────────────────────────────────────────

    // Pie chart: categorías con su gasto real acumulado
    const categoryChartData = categories.map((cat, i) => {
        const colors = Object.values(CATEGORY_COLORS);
        return {
            name: cat.name,
            value: Number(cat.budget),
            color: CATEGORY_COLORS[cat.name] ?? colors[i % colors.length],
        };
    }).filter(c => c.value > 0);

    // Tabla: últimas 6 transacciones
    const recentTxs = transactions.slice(0, 6);

    // Summary cards
    const totalGasto   = summary.total_outcome;
    const totalIngreso = summary.total_income;
    const balance      = summary.balance_total;
    const presupuesto  = totalIngreso || 1;
    const restante     = balance;
    const porcentaje   = Math.min(Math.round((totalGasto / presupuesto) * 100), 100);

    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const openAdd = (tab: TabType) => setAddModal({ open: true, tab });

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
                        <h2 className="fc-card-value" style={{ color: restante > 0 ? '#AEFF00' : '#ef4444' }}>
                            ${restante.toLocaleString()}
                        </h2>
                    </div>
                    <div className={`fc-card-badge ${restante > 0 ? 'fc-badge--ok' : 'fc-badge--err'}`}>
                        {restante > 0 ? <FiArrowDownRight /> : <FiArrowUpRight />}
                        {restante > 0 ? 'Bajo control' : 'Excedido'}
                    </div>
                </div>
            </div>

            {/* ── Charts Row ── */}
            <div className="fc-charts-row">

                {/* Donut — categorías reales */}
                <div className="fc-panel fc-panel--pie">
                    <div className="fc-panel-header">
                        <h3>Presupuesto por Categoría</h3>
                        <span className="fc-panel-sub">{new Date().toLocaleString('es-MX', { month: 'long', year: 'numeric' })}</span>
                    </div>

                    {loadingData ? (
                        <div className="fc-chart-loading">Cargando categorías…</div>
                    ) : categoryChartData.length === 0 ? (
                        <div className="fc-chart-empty">Sin categorías aún</div>
                    ) : (
                        <div className="fc-pie-layout">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={categoryChartData}
                                        cx="50%" cy="50%"
                                        innerRadius={60} outerRadius={90}
                                        paddingAngle={3}
                                        dataKey="value"
                                        onMouseEnter={(_, i) => setActiveIndex(i)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        {categoryChartData.map((entry, i) => (
                                            <Cell
                                                key={entry.name}
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
                                {categoryChartData.map((d, i) => (
                                    <li
                                        key={d.name}
                                        className={`fc-legend-item ${activeIndex === i ? 'fc-legend-item--active' : ''}`}
                                        onMouseEnter={() => setActiveIndex(i)}
                                        onMouseLeave={() => setActiveIndex(null)}
                                    >
                                        <span className="fc-legend-dot" style={{ background: d.color }} />
                                        <span className="fc-legend-name">{d.name}</span>
                                        <span className="fc-legend-val">${Number(d.value).toLocaleString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button className="fc-action-btn" onClick={() => setShowImport(true)}>
                        <FiUpload /> Importar
                    </button>
                </div>

                {/* Bar — historial mensual (pendiente endpoint) */}
                <div className="fc-panel fc-panel--bar">
                    <div className="fc-panel-header">
                        <h3>Historial Mensual</h3>
                        <span className="fc-panel-sub fc-panel-sub--pending" title="Requiere endpoint GET /api/transactions/monthly/">
                            ⏳ Pendiente conexión
                        </span>
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
                    ) : recentTxs.length === 0 ? (
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
                                {recentTxs.map(t => {
                                    const isIncome  = !!t.income_details;
                                    const amount    = isIncome
                                        ? Number(t.income_details!.amount)
                                        : Number(t.outcome_details?.expense ?? 0);
                                    const catName   = categories.find(c => c.id === t.category)?.name ?? '—';
                                    return (
                                        <tr key={t.id}>
                                            <td>
                                                <span className={`fc-tx-dot fc-tx-dot--${isIncome ? 'in' : 'out'}`} />
                                                {t.description}
                                            </td>
                                            <td><span className="fc-chip">{catName}</span></td>
                                            <td className="fc-muted">{t.date ?? '—'}</td>
                                            <td className={`fc-amount fc-amount--${isIncome ? 'in' : 'out'}`}>
                                                {isIncome ? '+' : '-'}${amount.toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* ── Modals ── */}
            {addModal.open && (
                <AddTransactionModal
                    defaultTab={addModal.tab}
                    categories={categories}
                    onClose={() => setAddModal({ open: false, tab: 'gasto' })}
                    onSuccess={onRefresh}
                />
            )}
            {showImport && <ImportModal onClose={() => setShowImport(false)} />}
            {showExport && <ExportModal onClose={() => setShowExport(false)} />}
        </div>
    );
};

export default FinanceCharts;