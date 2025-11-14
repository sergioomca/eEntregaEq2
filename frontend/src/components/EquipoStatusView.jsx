import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const estadoColor = (condicion) => {
  if (condicion === "BLOQUEADO") return { background: "#ffcccc", color: "#b20000" };
  if (condicion === "DESBLOQUEADO") return { background: "#ccffcc", color: "#006600" };
  return { background: "#f0f0f0", color: "#333" };
};

export default function EquipoStatusView() {
  const { tag } = useParams();
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`http://localhost:8080/public/consulta/equipo/${tag}`)
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 404 ? "Equipo no encontrado" : "Error al consultar el equipo");
        return res.json();
      })
      .then((data) => {
        setStatusData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [tag]);

  if (loading) return <div style={{ fontSize: 22, padding: 24 }}>Cargando...</div>;
  if (error) return <div style={{ color: "#b20000", fontSize: 20, padding: 24 }}>{error}</div>;

  const equipo = statusData.equipo;
  const permisos = statusData.permisosActivos || [];

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: 16, fontFamily: "sans-serif" }}>
      {/* Sección 1: Identificación */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 32, fontWeight: 700 }}>{equipo.tag}</div>
        <div style={{ fontSize: 18, color: "#555" }}>{equipo.descripcion}</div>
      </div>
      {/* Sección 2: Estado Operativo */}
      <div style={{ marginBottom: 18 }}>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Estado DCS:</div>
        <div style={{ fontSize: 20, marginBottom: 8 }}>{equipo.estadoDcs}</div>
        <div style={{ fontSize: 16, fontWeight: 600 }}>Condición de Permiso:</div>
        <div style={{ fontSize: 20, fontWeight: 700, padding: 8, borderRadius: 6, ...estadoColor(equipo.condicion) }}>
          {equipo.condicion}
        </div>
      </div>
      {/* Sección 3: Permisos Activos */}
      <div>
        <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>Permisos de Trabajo Activos:</div>
        {permisos.length === 0 ? (
          <div style={{ fontSize: 16, color: "#888" }}>No hay permisos de trabajo activos para este equipo.</div>
        ) : (
          <ul style={{ padding: 0, listStyle: "none" }}>
            {permisos.map((pts) => (
              <li key={pts.id} style={{ marginBottom: 14, border: "1px solid #ddd", borderRadius: 6, padding: 10 }}>
                <div><b>ID:</b> {pts.id}</div>
                <div><b>Trabajo:</b> {pts.descripcionTrabajo}</div>
                <div><b>Supervisor:</b> {pts.supervisorLegajo}</div>
                <div><b>Estado:</b> {pts.firmaSupervisorBase64 ? "Firmado (Pend. Cierre)" : "Pendiente de Firma"}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
