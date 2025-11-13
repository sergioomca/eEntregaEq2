      import React, { useState } from "react";

      const DcsSimForm = ({ onSuccess }) => {
        const [tag, setTag] = useState("");
        const [estadoDcs, setEstadoDcs] = useState("");
        const [mensaje, setMensaje] = useState("");
        const [loading, setLoading] = useState(false);

        const handleSubmit = async (e) => {
          e.preventDefault();
          setMensaje("");
          setLoading(true);
          try {
            let msg = "";
            if (estadoDcs) {
              const res = await fetch("/api/dcs/update", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ tag, estado: estadoDcs }),
              });
              const text = await res.text();
              msg += res.ok ? `✔️ Estado DCS: ${text}` : `❌ Estado DCS: ${text}`;
            }
            setMensaje(msg.trim());
            if (onSuccess) onSuccess();
          } catch (err) {
            setMensaje("❌ Error de red");
          } finally {
            setLoading(false);
          }
        };

        return (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mt-8 max-w-md mx-auto">
            <h3 className="text-lg font-bold text-blue-900 mb-4">Simular señal entrante desde DCS</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Tag de Equipo</label>
                <input
                  type="text"
                  value={tag}
                  onChange={e => setTag(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="Ej: K7451"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-blue-800 mb-1">Nuevo Estado DCS</label>
                <select
                  value={estadoDcs}
                  onChange={e => setEstadoDcs(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400"
                  required
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
                className="bg-blue-700 hover:bg-blue-800 text-white font-bold py-2 px-6 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? "Enviando..." : "Enviar señal DCS"}
              </button>
            </form>
            {mensaje && <div className="mt-4 text-sm font-medium">{mensaje}</div>}
          </div>
        );
      };

export default DcsSimForm;
