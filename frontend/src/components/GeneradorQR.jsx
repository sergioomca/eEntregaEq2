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

export default function GeneradorQR({ tag, url, onQrReady, highlighted = false }) {
  const canvasRef = useRef(null);
  const publicUrl = /^https?:\/\//i.test(url) ? url : `${window.location.origin}${url}`;

  useEffect(() => {
    if (canvasRef.current && publicUrl) {
      QRCode.toCanvas(canvasRef.current, publicUrl, { width: 150 }, (error) => {
        if (error) {
          console.error("Error generando QR:", error);
          return;
        }
        if (onQrReady) {
          onQrReady(tag, canvasRef.current.toDataURL("image/png"));
        }
      });
    }
  }, [publicUrl, tag, onQrReady]);

  return (
    <div style={{ ...qrStyle, border: highlighted ? '2px solid #0d7377' : qrStyle.border }}>
      <h3 style={{ margin: "8px 0 4px 0", fontSize: 18 }}>{tag}</h3>
      <canvas ref={canvasRef} />
      <p style={{ fontSize: 12, wordBreak: "break-all", margin: "8px 0 0 0" }}>{publicUrl}</p>
      <a
        href={publicUrl}
        style={{ display: 'block', marginTop: 8, fontSize: 13, color: '#0d7377', textDecoration: 'underline' }}
      >
        Ver página pública
      </a>
    </div>
  );
}
