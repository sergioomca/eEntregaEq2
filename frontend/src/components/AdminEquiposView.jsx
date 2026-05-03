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
  const [saving, setSaving] = useState(false);
  const [createdTag, setCreatedTag] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [qrDataByTag, setQrDataByTag] = useState({});
  const [nuevoEquipo, setNuevoEquipo] = useState({
    tag: "",
    descripcion: "",
    condicion: "DESBLOQUEADO"
  });

  useEffect(() => {
    const token = localStorage.getItem("authToken");
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

  const normalizedTag = nuevoEquipo.tag.trim().toUpperCase();
  const duplicateTag = equipos.some((e) => (e.tag || "").trim().toUpperCase() === normalizedTag);

  const handleNuevoEquipoChange = (field, value) => {
    setSuccessMsg("");
    setError(null);
    setNuevoEquipo((prev) => ({ ...prev, [field]: value }));
  };

  const handleCrearEquipo = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg("");

    if (!normalizedTag) {
      setError("Debe ingresar el TAG del equipo.");
      return;
    }

    if (!nuevoEquipo.descripcion.trim()) {
      setError("Debe ingresar la descripción del equipo.");
      return;
    }

    if (duplicateTag) {
      setError("Ya existe un equipo con ese TAG.");
      return;
    }

    const token = localStorage.getItem("authToken");
    setSaving(true);

    try {
      const payload = {
        tag: normalizedTag,
        descripcion: nuevoEquipo.descripcion.trim(),
        condicion: nuevoEquipo.condicion
      };

      const resp = await fetch("/api/equipos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : undefined
        },
        body: JSON.stringify(payload)
      });

      if (!resp.ok) {
        const text = await resp.text();
        throw new Error(text || "No se pudo crear el equipo");
      }

      const created = await resp.json();
      setEquipos((prev) => [created, ...prev]);
      setCreatedTag(created.tag);
      setSuccessMsg(`Equipo ${created.tag} creado correctamente.`);
      setNuevoEquipo({
        tag: "",
        descripcion: "",
        condicion: "DESBLOQUEADO"
      });
    } catch (err) {
      setError(err.message || "Error al crear equipo");
    } finally {
      setSaving(false);
    }
  };

  const printCreatedQr = () => {
    if (!createdTag || !qrDataByTag[createdTag]) {
      setError("Aún no está disponible el QR del equipo recién creado.");
      return;
    }

    const printWindow = window.open("", "_blank", "width=600,height=700");
    if (!printWindow) {
      setError("No se pudo abrir la ventana de impresión. Verifique el bloqueador de popups.");
      return;
    }

    const equipoUrl = `${window.location.origin}/equipo/${createdTag}`;
    printWindow.document.write(`
      <html>
        <head>
          <title>QR ${createdTag}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin: 24px; }
            img { width: 280px; height: 280px; }
            h2 { margin-bottom: 8px; }
            p { word-break: break-all; font-size: 13px; }
          </style>
        </head>
        <body>
          <h2>${createdTag}</h2>
          <img src="${qrDataByTag[createdTag]}" alt="QR ${createdTag}" />
          <p>${equipoUrl}</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto" }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a2332', margin: 0 }}>Administración de Equipos - Generación de QR</h2>
        <button onClick={() => window.print()} className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 4v3H4a2 2 0 00-2 2v3a2 2 0 002 2h1v2a2 2 0 002 2h6a2 2 0 002-2v-2h1a2 2 0 002-2V9a2 2 0 00-2-2h-1V4a2 2 0 00-2-2H7a2 2 0 00-2 2zm8 0H7v3h6V4zM5 14H4v-3h1v3zm1 0v2h8v-2H6zm9 0h1v-3h-1v3z" clipRule="evenodd"/></svg>
          Imprimir Todos
        </button>
      </div>
      <div className="card" style={{ marginBottom: 18 }}>
        <h3 style={{ marginTop: 0, marginBottom: 12, color: '#1a2332' }}>Alta de Equipo</h3>
        <form onSubmit={handleCrearEquipo} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, alignItems: 'end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">TAG</label>
            <input
              type="text"
              className="form-input"
              value={nuevoEquipo.tag}
              onChange={(e) => handleNuevoEquipoChange('tag', e.target.value)}
              placeholder="Ej: BOMB-101"
            />
            {nuevoEquipo.tag && duplicateTag && (
              <small style={{ color: '#b91c1c' }}>TAG duplicado. Ingrese uno distinto.</small>
            )}
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Descripción</label>
            <input
              type="text"
              className="form-input"
              value={nuevoEquipo.descripcion}
              onChange={(e) => handleNuevoEquipoChange('descripcion', e.target.value)}
              placeholder="Ej: Bomba de recirculación"
            />
          </div>

          <div className="form-group" style={{ margin: 0 }}>
            <label className="form-label">Condición</label>
            <select className="form-input" value={nuevoEquipo.condicion} onChange={(e) => handleNuevoEquipoChange('condicion', e.target.value)}>
              <option value="DESBLOQUEADO">DESBLOQUEADO</option>
              <option value="BLOQUEADO">BLOQUEADO</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || duplicateTag}
            style={{ height: 42, opacity: saving || duplicateTag ? 0.7 : 1 }}
          >
            {saving ? 'Guardando...' : 'Crear Equipo'}
          </button>
        </form>

        <div style={{ marginTop: 12, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="btn btn-outline"
            onClick={printCreatedQr}
            disabled={!createdTag}
          >
            Generar e imprimir QR del nuevo equipo
          </button>
          {createdTag && (
            <span style={{ alignSelf: 'center', color: '#0a5c5f', fontWeight: 600 }}>Nuevo: {createdTag}</span>
          )}
        </div>
      </div>
      {successMsg && <div className="card" style={{ color: '#166534', padding: 12, marginBottom: 12 }}>{successMsg}</div>}
      {loading && <div style={{ display: 'flex', justifyContent: 'center', padding: 40 }}><span className="spinner"></span></div>}
      {error && <div className="card" style={{ color: '#b91c1c', padding: 16 }}>{error}</div>}
      <div style={gridStyle}>
        {equipos.map((equipo) => (
          <GeneradorQR
            key={equipo.tag}
            tag={equipo.tag}
            url={`/equipo/${equipo.tag}`}
            onQrReady={(tag, dataUrl) => {
              setQrDataByTag((prev) => (prev[tag] === dataUrl ? prev : { ...prev, [tag]: dataUrl }));
            }}
            highlighted={equipo.tag === createdTag}
          />
        ))}
      </div>
    </div>
  );
}
