import React from 'react';

function TestApp() {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', minHeight: '100vh' }}>
      <h1 style={{ color: '#003366', fontSize: '2em' }}>🚀 Test App Funcionando</h1>
      <p style={{ fontSize: '1.2em' }}>Si ves este mensaje, React está funcionando correctamente.</p>
      <button 
        style={{ 
          backgroundColor: '#f0b323', 
          color: '#003366', 
          padding: '10px 20px', 
          border: 'none', 
          borderRadius: '5px',
          fontSize: '1em'
        }}
        onClick={() => alert('¡Botón funcionando!')}
      >
        Hacer click para probar
      </button>
    </div>
  );
}

export default TestApp;