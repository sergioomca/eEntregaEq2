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
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16 }}>Administración de Equipos - Generación de QR</h2>
      <button onClick={() => window.print()} style={{ marginBottom: 20, padding: "8px 18px", fontSize: 16, borderRadius: 6, background: "#f4c042", border: "none", cursor: "pointer" }}>
        Imprimir Todos
      </button>
      {loading && <div style={{ fontSize: 18 }}>Cargando equipos...</div>}
      {error && <div style={{ color: "#b20000", fontSize: 16 }}>{error}</div>}
      <div style={gridStyle}>
        {equipos.map((equipo) => (
          <GeneradorQR key={equipo.tag} tag={equipo.tag} url={`/equipo/${equipo.tag}`} />
        ))}
      </div>
    </div>
  );
}
