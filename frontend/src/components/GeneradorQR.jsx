import React, { useEffect, useRef } from "react";
import QRCode from "qrcode";

const qrStyle = {
  border: "1px solid black",
  padding: 10,
  margin: 10,
  display: "inline-block",
  textAlign: "center",
  background: "#fff"
};

export default function GeneradorQR({ tag, url }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && url) {
      QRCode.toCanvas(canvasRef.current, url, { width: 150 }, (error) => {
        if (error) console.error("Error generando QR:", error);
      });
    }
  }, [url]);

  return (
    <div style={qrStyle}>
      <h3 style={{ margin: "8px 0 4px 0", fontSize: 18 }}>{tag}</h3>
      <canvas ref={canvasRef} />
      <p style={{ fontSize: 12, wordBreak: "break-all", margin: "8px 0 0 0" }}>{url}</p>
      <a
        href={`http://localhost:5173${url}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ display: 'block', marginTop: 8, fontSize: 13, color: '#003366', textDecoration: 'underline' }}
      >
        Ver página pública
      </a>
    </div>
  );
}
