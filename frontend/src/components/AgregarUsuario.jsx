import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROLES } from '../constants/roles';

const ROLES_DISPONIBLES = [
    { value: ROLES.EMISOR, label: 'Emisor' },
    { value: ROLES.SUPERVISOR, label: 'Supervisor' },
    { value: ROLES.EJECUTANTE, label: 'Ejecutante' },
    { value: ROLES.ADMIN, label: 'Administrador' },
    { value: ROLES.RTO_MANT, label: 'RTO Mantenimiento' },
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
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        legajo: '',
        nombreCompleto: '',
        sector: '',
        roles: [],
    });
    const [errors, setErrors] = useState({});
    const [submitMessage, setSubmitMessage] = useState('');
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);

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
            setFormData({ legajo: '', nombreCompleto: '', sector: '', roles: [] });
        } catch (err) {
            setSubmitError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="bg-white rounded-xl shadow-2xl p-8">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-3">
                    Agregar Nuevo Usuario
                </h2>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Legajo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Legajo (ID de Usuario) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="legajo"
                            value={formData.legajo}
                            onChange={handleChange}
                            placeholder="Ej: VINF011422"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        />
                        {errors.legajo && <p className="text-red-500 text-sm mt-1">{errors.legajo}</p>}
                    </div>

                    {/* Nombre Completo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            name="nombreCompleto"
                            value={formData.nombreCompleto}
                            onChange={handleChange}
                            placeholder="Ej: Juan Pérez"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition"
                        />
                        {errors.nombreCompleto && <p className="text-red-500 text-sm mt-1">{errors.nombreCompleto}</p>}
                    </div>

                    {/* Sector */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sector <span className="text-red-500">*</span>
                        </label>
                        <select
                            name="sector"
                            value={formData.sector}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500 transition bg-white"
                        >
                            <option value="">Seleccionar sector...</option>
                            {SECTORES.map(s => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                        {errors.sector && <p className="text-red-500 text-sm mt-1">{errors.sector}</p>}
                    </div>

                    {/* Roles */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Roles <span className="text-red-500">*</span>
                        </label>
                        <div className="flex flex-wrap gap-3">
                            {ROLES_DISPONIBLES.map(({ value, label }) => (
                                <button
                                    key={value}
                                    type="button"
                                    onClick={() => handleRoleToggle(value)}
                                    className={`px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
                                        formData.roles.includes(value)
                                            ? 'bg-yellow-500 border-yellow-600 text-white shadow-md'
                                            : 'bg-white border-gray-300 text-gray-700 hover:border-yellow-400 hover:bg-yellow-50'
                                    }`}
                                >
                                    {formData.roles.includes(value) ? '✓ ' : ''}{label}
                                </button>
                            ))}
                        </div>
                        {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
                    </div>

                    {/* Mensajes */}
                    {submitMessage && (
                        <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg">
                            ✅ {submitMessage}
                        </div>
                    )}
                    {submitError && (
                        <div className="bg-red-50 border border-red-300 text-red-800 px-4 py-3 rounded-lg">
                            ❌ {submitError}
                        </div>
                    )}

                    {/* Botones */}
                    <div className="flex gap-4 pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 rounded-xl shadow-lg transition duration-150 transform hover:scale-[1.02]"
                        >
                            {loading ? 'Guardando...' : 'Crear Usuario'}
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-bold rounded-xl transition duration-150"
                        >
                            Volver
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
