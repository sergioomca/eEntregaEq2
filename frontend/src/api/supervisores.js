// Devuelve una lista de supervisores disponibles (mock)
// En un backend real, esto sería un endpoint REST
export async function fetchSupervisores() {
  // Solo los supervisores definidos en UserDetailsServiceCustom
  return [
    { legajo: 'SUP222', nombre: 'SUP222' }
  ];
}
