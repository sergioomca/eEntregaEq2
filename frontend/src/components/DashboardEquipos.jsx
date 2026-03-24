
import React, { useEffect, useState } from 'react';

const estadoStyles = {
  'HABILITADO': {
    color: '#059669',
    bgColor: '#d1fae5',
    textColor: '#065f46',
  },
  'DESHABILITADO': {
    color: '#dc2626',
    bgColor: '#fee2e2',
    textColor: '#991b1b',
  },
  'PARADO': {
    color: '#b45309',
    bgColor: '#fef3c7',
    textColor: '#92400e',
  },
  'EN_MARCHA': {
    color: '#0d7377',
    bgColor: '#e4f5f5',
    textColor: '#0a5c5f',
  },
};

const DashboardEquipos = () => {
  const [equipos, setEquipos] = useState([]);
  const [estadoFiltro, setEstadoFiltro] = useState('TODOS');
  const [condicionFiltro, setCondicionFiltro] = useState('TODAS');
  const [busqueda, setBusqueda] = useState('');

  useEffect(() => {
    fetch('/api/equipos')
      .then(res => res.ok ? res.json() : [])
      .then(data => setEquipos(Array.isArray(data) ? data : []));
  }, []);

  const equiposFiltrados = equipos.filter(eq => {
    const coincideTag = eq.tag.toLowerCase().includes(busqueda.toLowerCase());
    const coincideEstado =
      estadoFiltro === 'TODOS' || eq.estadoDcs === estadoFiltro;
    const coincideCondicion =
      condicionFiltro === 'TODAS' || eq.condicion === condicionFiltro;
    return coincideTag && coincideEstado && coincideCondicion;
  });

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ background: '#0d7377', color: '#fff', padding: '20px 24px', borderRadius: '16px 16px 0 0' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: 4 }}>Dashboard de Equipos</h2>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: '0.85rem' }}>Visualiza el estado y la información de todos los equipos registrados.</p>
      </div>
      <div style={{ padding: '16px 24px', borderBottom: '1px solid #e8f4f6', display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' }}>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Buscar por Tag</label>
          <input
            type="text"
            value={busqueda}
            onChange={e => setBusqueda(e.target.value)}
            className="form-input"
            placeholder="Ej: P5511"
          />
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Estado DCS</label>
          <select
            value={estadoFiltro}
            onChange={e => setEstadoFiltro(e.target.value)}
            className="form-input"
          >
            <option value="TODOS">Todos</option>
            <option value="HABILITADO">Habilitado</option>
            <option value="DESHABILITADO">Deshabilitado</option>
            <option value="PARADO">Parado</option>
            <option value="EN_MARCHA">En marcha</option>
          </select>
        </div>
        <div className="form-group" style={{ margin: 0 }}>
          <label className="form-label">Condición eEEq</label>
          <select
            value={condicionFiltro}
            onChange={e => setCondicionFiltro(e.target.value)}
            className="form-input"
          >
            <option value="TODAS">Todas</option>
            <option value="BLOQUEADO">Bloqueado</option>
            <option value="DESBLOQUEADO">Desbloqueado</option>
          </select>
        </div>
      </div>
      <div style={{ overflowX: 'auto' }}>
        <table className="table">
          <thead>
            <tr>
              <th>Tag</th>
              <th>Descripción</th>
              <th>Estado DCS</th>
              <th>Condición eEEq</th>
            </tr>
          </thead>
          <tbody>
            {equiposFiltrados.map(eq => {
              const style = estadoStyles[eq.estadoDcs] || {};
              return (
                <tr key={eq.tag}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{eq.tag}</td>
                  <td>{eq.descripcion}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: style.bgColor, color: style.textColor }}>
                      {eq.estadoDcs}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontWeight: 600, fontSize: '0.8rem', color: eq.condicion === 'BLOQUEADO' ? '#b91c1c' : '#059669' }}>
                      {eq.condicion}
                    </span>
                  </td>
                </tr>
              );
            })}
            {equiposFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: 32, color: '#888' }}>No se encontraron equipos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardEquipos;
