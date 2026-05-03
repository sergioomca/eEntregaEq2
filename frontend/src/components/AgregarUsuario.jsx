import React, { useState } from 'react';
import { ROLES } from '../constants/roles';

const ROLES_DISPONIBLES = [
    { value: ROLES.EMISOR, label: 'Emisor' },
    { value: ROLES.SUPERVISOR, label: 'Supervisor' },
    { value: ROLES.EJECUTANTE, label: 'Ejecutante' },
    { value: ROLES.RECEPTOR, label: 'Receptor' },
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

export default function AgregarUsuario() {
    const [formData, setFormData] = useState({
        legajo: '',
        nombreCompleto: '',
        sector: '',
        roles: [],
        huellaDigital: null,
    });
    const [errors, setErrors] = useState({});
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const [registrandoHuella, setRegistrandoHuella] = useState(false);

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
            const legajo = formData.legajo || 'SIN_LEGAJO';
            const timestamp = Date.now();
            const hash = btoa(`HUELLA_DIGITAL_${legajo}_${timestamp}`);
            setFormData(prev => ({ ...prev, huellaDigital: hash }));
            setRegistrandoHuella(false);
        }, 2000);
    };

    const eliminarHuella = () => {
        setFormData(prev => ({ ...prev, huellaDigital: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.legajo.trim()) newErrors.legajo = 'El legajo es obligatorio';
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

        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('/api/usuarios', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || 'Error al crear el usuario');
            }

            const created = await response.json();
            setSubmitMessage(`Usuario creado exitosamente. Legajo: ${created.legajo}`);
            setFormData({ legajo: '', nombreCompleto: '', sector: '', roles: [], huellaDigital: null });
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
            <div className="card" style={{ padding: 32 }}>
                <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2332', marginBottom: 20, paddingBottom: 12, borderBottom: '2px solid #e8f4f6' }}>
                    Agregar Nuevo Usuario
                </h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div className="form-group">
                        <label className="form-label">
                            Legajo (ID de Usuario) <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="legajo"
                            value={formData.legajo}
                            onChange={handleChange}
                            placeholder="Ej: VINF011422"
                            className="form-input"
                        />
                        {errors.legajo && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: 4 }}>{errors.legajo}</p>}
                    </div>

                    <div className="form-group">
                        <label className="form-label">
                            Nombre Completo <span style={{ color: '#ef4444' }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
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
                                            Volver a leer
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
                                        Sin huella registrada (opcional)
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

                    <div style={{ display: 'flex', gap: 12, paddingTop: 8 }}>
                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary"
                            style={{ flex: 1, ...(loading ? { background: '#ccc', cursor: 'not-allowed' } : {}) }}
                        >
                            {loading ? 'Guardando...' : 'Crear Usuario'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
