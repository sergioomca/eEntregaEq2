import React, { useState, useEffect } from 'react';
import { ROLES } from '../constants/roles';

const ROLES_DISPONIBLES = [
    { value: ROLES.EMISOR, label: 'Emisor' },
    { value: ROLES.SUPERVISOR, label: 'Supervisor' },
    { value: ROLES.EJECUTANTE, label: 'Ejecutante' },
    { value: ROLES.ADMIN, label: 'Administrador' },
    { value: ROLES.RTO_MANT, label: 'RTO Mantenimiento' },
    { value: ROLES.EHS, label: 'EH&S' },
    { value: ROLES.LIDER, label: 'Líder' },
];

const SECTORES = [
    'Control de Proceso',
    'Supervisión de Planta',
    'Mantenimiento Eléctrico',
    'Mantenimiento Mecánico',
    'Operaciones Planta',
    'Seguridad e Higiene',
    'Control de Calidad',
    'IT',
];

export default function ModificarUsuario() {
    const [usuarios, setUsuarios] = useState([]);
    const [loadingList, setLoadingList] = useState(true);
    const [listError, setListError] = useState('');
    const [searchTerm, setSearchTerm] = useState('');

    const [selectedUser, setSelectedUser] = useState(null);
    const [formData, setFormData] = useState({ nombreCompleto: '', sector: '', roles: [], huellaDigital: null });
    const [errors, setErrors] = useState({});
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [saving, setSaving] = useState(false);
    const [registrandoHuella, setRegistrandoHuella] = useState(false);

    const getToken = () => localStorage.getItem('authToken');

    const fetchUsuarios = async () => {
        setLoadingList(true);
        setListError('');
        try {
            const response = await fetch('/api/usuarios', {
                headers: { 'Authorization': `Bearer ${getToken()}` },
            });
            if (!response.ok) throw new Error('Error al cargar usuarios');
            const data = await response.json();
            setUsuarios(data);
        } catch (err) {
            setListError(err.message);
        } finally {
            setLoadingList(false);
        }
    };

    useEffect(() => { fetchUsuarios(); }, []);

    const filteredUsuarios = usuarios.filter(u =>
        u.legajo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.nombreCompleto || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSelectUser = (user) => {
        setSelectedUser(user);
        setFormData({
            nombreCompleto: user.nombreCompleto || '',
            sector: user.sector || '',
            roles: user.roles || [],
            huellaDigital: user.huellaDigital || null,
        });
        setErrors({});
        setSubmitMessage('');
        setSubmitError('');
    };

    const handleBack = () => {
        setSelectedUser(null);
        setSubmitMessage('');
        setSubmitError('');
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
    };

    const handleRoleToggle = (role) => {
        setFormData(prev => ({
            ...prev,
            roles: prev.roles.includes(role)
                ? prev.roles.filter(r => r !== role)
                : [...prev.roles, role]
        }));
        if (errors.roles) setErrors(prev => ({ ...prev, roles: '' }));
    };

    const simularLecturaHuella = () => {
        setRegistrandoHuella(true);
        setTimeout(() => {
            const legajo = selectedUser?.legajo || 'SIN_LEGAJO';
            const timestamp = Date.now();
            const hash = btoa(`HUELLA_DIGITAL_${legajo}_${timestamp}`);
            setFormData(prev => ({ ...prev, huellaDigital: hash }));
            setRegistrandoHuella(false);
        }, 2000);
    };

    const eliminarHuella = () => {
        setFormData(prev => ({ ...prev, huellaDigital: '' }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.nombreCompleto.trim()) newErrors.nombreCompleto = 'El nombre completo es obligatorio';
        if (!formData.sector.trim()) newErrors.sector = 'El sector es obligatorio';
        if (formData.roles.length === 0) newErrors.roles = 'Debe seleccionar al menos un rol';
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitMessage('');
        setSubmitError('');
        if (!validate()) return;

        setSaving(true);
        try {
            const body = {
                legajo: selectedUser.legajo,
                nombreCompleto: formData.nombreCompleto,
                sector: formData.sector,
                roles: formData.roles,
                huellaDigital: formData.huellaDigital,
            };
            const response = await fetch(`/api/usuarios/${encodeURIComponent(selectedUser.legajo)}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getToken()}`,
                },
                body: JSON.stringify(body),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al actualizar el usuario');
            }

            setSubmitMessage(`Usuario ${selectedUser.legajo} actualizado exitosamente.`);
            fetchUsuarios();
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setSaving(false);
        }
    };

    // Vista de lista de usuarios
    if (!selectedUser) {
        return (
            <div>
                <div style={{ marginBottom: 16 }}>
                    <input
                        type="text"
                        placeholder="Buscar por legajo o nombre..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="form-input"
                        style={{ maxWidth: 400 }}
                    />
                </div>

                {loadingList && <p style={{ color: '#64748b' }}>Cargando usuarios...</p>}
                {listError && <p style={{ color: '#991b1b' }}>{listError}</p>}

                {!loadingList && !listError && filteredUsuarios.length === 0 && (
                    <p style={{ color: '#64748b' }}>No se encontraron usuarios.</p>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {filteredUsuarios.map(u => (
                        <div
                            key={u.legajo}
                            onClick={() => handleSelectUser(u)}
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                                padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0',
                                borderRadius: 10, cursor: 'pointer', transition: 'all 0.15s',
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = '#3b82f6'; e.currentTarget.style.background = '#f8fafc'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.background = '#fff'; }}
                        >
                            <div>
                                <span style={{ fontWeight: 600, color: '#1a2332' }}>{u.legajo}</span>
                                <span style={{ color: '#64748b', marginLeft: 12 }}>{u.nombreCompleto || '—'}</span>
                                {u.huellaDigital && <span title="Huella registrada" style={{ marginLeft: 8 }}>🟢</span>}
                            </div>
                            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                {(u.roles || []).map(r => (
                                    <span key={r} style={{
                                        fontSize: '0.75rem', padding: '2px 8px', borderRadius: 12,
                                        background: '#e0f2fe', color: '#0369a1', fontWeight: 500,
                                    }}>{r}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Vista de edición
    return (
        <div>
            <button
                type="button"
                onClick={handleBack}
                className="btn btn-outline"
                style={{ marginBottom: 16 }}
            >
                ← Volver a la lista
            </button>

            <div className="card" style={{ padding: 32, maxWidth: 640 }}>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#1a2332', marginBottom: 6 }}>
                    Modificar Usuario
                </h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 20 }}>
                    Legajo: <strong>{selectedUser.legajo}</strong>
                </p>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">
                            Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            className="form-input"
                        />
                        {errors.nombreCompleto && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.nombreCompleto}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Sector <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <select
                            name="sector"
                            value={formData.sector}
                            onChange={handleChange}
                            className="form-input"
                        >
                            <option value="">Seleccionar sector...</option>
                            {SECTORES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.sector && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.sector}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Roles <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                            {ROLES_DISPONIBLES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRoleToggle(value)}
                                    className={formData.roles.includes(value) ? 'btn btn-primary' : 'btn btn-outline'}
                                    style={{ fontSize: '0.85rem', padding: '6px 14px' }}
                                >
                                    {formData.roles.includes(value) ? '✓ ' : ''}{label}
                                </button>
                            ))}
                        </div>
                        {errors.roles && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.roles}</p>}
                    </div>

                    {/* Sección Huella Digital */}
                    <div className="form-group">
                        <label className="form-label">Huella Digital</label>
                        <div style={{
                            border: '1px solid #e2e8f0', borderRadius: 10, padding: 16,
                            background: formData.huellaDigital ? '#f0fdf4' : '#f8fafc',
                        }}>
                            {formData.huellaDigital ? (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                        <span style={{ fontSize: '1.5rem' }}>🟢</span>
                                        <div>
                                            <p style={{ fontWeight: 600, color: '#166534', margin: 0 }}>Huella registrada</p>
                                            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, marginTop: 2 }}>
                                                {formData.huellaDigital.substring(0, 20)}...
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <button type="button" onClick={simularLecturaHuella} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px' }}>
                                            Cambiar huella
                                        </button>
                                        <button type="button" onClick={eliminarHuella} className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '4px 12px', color: '#991b1b', borderColor: '#fca5a5' }}>
                                            Quitar
                                        </button>
                                    </div>
                                </div>
                            ) : registrandoHuella ? (
                                <div style={{ textAlign: 'center', padding: 12 }}>
                                    <div style={{ fontSize: '2rem', marginBottom: 8, animation: 'pulse 1.5s infinite' }}>🔵</div>
                                    <p style={{ color: '#0369a1', fontWeight: 500, margin: 0 }}>Leyendo huella digital...</p>
                                    <p style={{ color: '#64748b', fontSize: '0.8rem', margin: 0, marginTop: 4 }}>Coloque el dedo en el lector</p>
                                </div>
                            ) : (
                                <div style={{ textAlign: 'center', padding: 8 }}>
                                    <p style={{ color: '#64748b', fontSize: '0.85rem', margin: 0, marginBottom: 10 }}>
                                        Sin huella registrada
                                    </p>
                                    <button type="button" onClick={simularLecturaHuella} className="btn btn-outline" style={{ fontSize: '0.85rem' }}>
                                        Registrar Huella Digital
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {submitMessage && (
                        <div style={{ background: '#f0fdf4', border: '1px solid #86efac', color: '#166534', padding: '12px 16px', borderRadius: 10 }}>
                            ✅ {submitMessage}
                        </div>
                    )}
                    {submitError && (
                        <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px 16px', borderRadius: 10 }}>
                            ❌ {submitError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={saving}
                        className="btn btn-primary"
                        style={{ alignSelf: 'flex-start', ...(saving ? { background: '#ccc', cursor: 'not-allowed' } : {}) }}
                    >
                        {saving ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </form>
            </div>
        </div>
    );
}
