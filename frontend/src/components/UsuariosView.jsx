import React, { useState } from 'react';
import AgregarUsuario from './AgregarUsuario';
import ModificarUsuario from './ModificarUsuario';

const TABS = [
    { id: 'agregar', label: 'Agregar Usuario' },
    { id: 'modificar', label: 'Modificar Usuario' },
];

export default function UsuariosView() {
    const [activeTab, setActiveTab] = useState('agregar');

    return (
        <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1a2332', marginBottom: 20 }}>
                Gestión de Usuarios
            </h2>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 0, borderBottom: '2px solid #e2e8f0', marginBottom: 24 }}>
                {TABS.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            padding: '10px 24px',
                            fontSize: '0.95rem',
                            fontWeight: activeTab === tab.id ? 600 : 400,
                            color: activeTab === tab.id ? '#1d4ed8' : '#64748b',
                            background: 'transparent',
                            border: 'none',
                            borderBottom: activeTab === tab.id ? '2px solid #1d4ed8' : '2px solid transparent',
                            marginBottom: -2,
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            {activeTab === 'agregar' && <AgregarUsuario />}
            {activeTab === 'modificar' && <ModificarUsuario />}
        </div>
    );
}
