
      import React, { useState, useEffect } from "react";

      const DcsSimForm = ({ onSuccess }) => {
        const [tag, setTag] = useState("");
        const [estadoDcs, setEstadoDcs] = useState("");
        const [mensaje, setMensaje] = useState("");
        const [loading, setLoading] = useState(false);
        const [equipos, setEquipos] = useState([]);

        useEffect(() => {
          const token = localStorage.getItem('authToken');
          fetch("/api/equipos", {
            headers: token ? { 'Authorization': `Bearer ${token}` } : {}
          })
            .then(res => res.ok ? res.json() : [])
            .then(data => setEquipos(Array.isArray(data) ? data : []));
        }, []);

        const tagsDisponibles = equipos.map(eq => eq.tag);
        const equipoSeleccionado = equipos.find(eq => eq.tag === tag);
        const isBloqueadoDeshabilitado = equipoSeleccionado && equipoSeleccionado.estadoDcs === 'DESHABILITADO' && equipoSeleccionado.condicion === 'BLOQUEADO';

        const handleSubmit = async (e) => {
          e.preventDefault();
          setMensaje("");
          setLoading(true);
          try {
            let msg = "";
            if (estadoDcs && !isBloqueadoDeshabilitado) {
              const token = localStorage.getItem('authToken');
              const res = await fetch("/api/dcs/update", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({ tag, estado: estadoDcs }),
              });
              const text = await res.text();
              msg += res.ok ? `✔️ Estado DCS: ${text}` : ` Estado DCS: ${text}`;
            } else if (isBloqueadoDeshabilitado) {
              msg = 'No se puede cambiar el estado DCS: equipo bloqueado y deshabilitado.';
            }
            setMensaje(msg.trim());
            if (onSuccess) onSuccess();
          } catch (err) {
            setMensaje(" Error de red");
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className="card" style={{ maxWidth: 420, margin: '32px auto', padding: 24, borderLeft: '4px solid #0d7377' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0d7377', marginBottom: 16 }}>Simular señal entrante desde DCS</h3>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Tag de Equipo</label>
                <select
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="form-input"
                  required
                >
                  <option value="">Seleccionar...</option>
                  {tagsDisponibles.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nuevo Estado DCS</label>
                <select
                  value={estadoDcs}
                  onChange={e => setEstadoDcs(e.target.value)}
                  className="form-input"
                  required
                  disabled={isBloqueadoDeshabilitado}
                >
                  <option value="">Seleccionar...</option>
                  <option value="HABILITADO">HABILITADO</option>
                  <option value="DESHABILITADO">DESHABILITADO</option>
                  <option value="PARADO">PARADO</option>
                  <option value="EN_MARCHA">EN_MARCHA</option>
                </select>
              </div>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading || isBloqueadoDeshabilitado}
                style={loading || isBloqueadoDeshabilitado ? { background: '#ccc', cursor: 'not-allowed' } : {}}
              >
                {loading ? "Enviando..." : "Enviar señal DCS"}
              </button>
            </form>
            {mensaje && <div style={{ marginTop: 16, fontSize: '0.85rem', fontWeight: 500 }}>{mensaje}</div>}
          </div>
        );
      };

export default DcsSimForm;
