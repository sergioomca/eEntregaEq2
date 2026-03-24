import React, { useState, useEffect } from "react";
import GeneradorQR from "./GeneradorQR";

const gridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
  gap: 20,
  marginTop: 24
};

export default function AdminEquiposView() {
  const [equipos, setEquipos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setLoading(true);
    setError(null);
    fetch("/api/equipos", {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error al obtener equipos");
        return res.json();
      })
      .then((data) => {
        setEquipos(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>Administración de Equipos - Generación de QR</h2>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd"/></svg>
          Imprimir Todos
        </button>
      </div>
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"></span></div>}
      {error && <div className="card" style={{ color: '#b91c1c', padding: 16 }}>{error}</div>}
      <div style={gridStyle}>
        {equipos.map((equipo) => (
          <GeneradorQR key={equipo.tag} tag={equipo.tag} url={`/equipo/${equipo.tag}`} />
        ))}
      </div>
    </div>
  );
}
