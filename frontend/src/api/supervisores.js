const API_BASE = '/api';

// Obtiene la lista de supervisores desde el backend (coleccion usuarios con rol SUPERVISOR)
export async function fetchSupervisores() {
  try {
    const response = await fetch(`${API_BASE}/usuarios/rol/SUPERVISOR`);
    if (!response.ok) {
      throw new Error('Error al obtener supervisores');
    }
    const data = await response.json();
    return data.map(u => ({ legajo: u.legajo, nombre: u.nombreCompleto || u.legajo }));
  } catch (error) {
    console.error('Error al cargar supervisores:', error);
    return [];
  }
}
