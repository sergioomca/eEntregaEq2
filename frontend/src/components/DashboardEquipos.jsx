
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
    color: '#2563eb',
    bgColor: '#dbeafe',
    textColor: '#1e40af',
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
    <div className="mt-12 bg-white rounded-lg shadow-lg border border-gray-200">
      <div className="bg-epu-primary text-white p-6 rounded-t-lg">
        <h2 className="text-2xl font-bold mb-1">Dashboard de Equipos</h2>
        <p className="text-white text-sm mb-2">Visualiza el estado y la información de todos los equipos registrados.</p>
      </div>
      <div className="px-6 pt-4 pb-2 border-b border-gray-100 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Buscar por Tag</label>
            <input
              type="text"
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
              placeholder="Ej: P5511"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Estado DCS</label>
            <select
              value={estadoFiltro}
              onChange={e => setEstadoFiltro(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
            >
              <option value="TODOS">Todos</option>
              <option value="HABILITADO">Habilitado</option>
              <option value="DESHABILITADO">Deshabilitado</option>
              <option value="PARADO">Parado</option>
              <option value="EN_MARCHA">En marcha</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Condición</label>
            <select
              value={condicionFiltro}
              onChange={e => setCondicionFiltro(e.target.value)}
              className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-epu-primary"
            >
              <option value="TODAS">Todas</option>
              <option value="BLOQUEADO">Bloqueado</option>
              <option value="DESBLOQUEADO">Desbloqueado</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tag</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Descripción</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado DCS</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Condición</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {equiposFiltrados.map(eq => {
              const style = estadoStyles[eq.estadoDcs] || {};
              return (
                <tr key={eq.tag} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{eq.tag}</td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700">{eq.descripcion}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold" style={{ backgroundColor: style.bgColor, color: style.textColor }}>
                      {eq.estadoDcs}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs font-semibold">
                    <span className={eq.condicion === 'BLOQUEADO' ? 'text-red-700' : 'text-green-700'}>
                      {eq.condicion}
                    </span>
                  </td>
                </tr>
              );
            })}
            {equiposFiltrados.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">No se encontraron equipos.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardEquipos;
