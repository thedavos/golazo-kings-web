/**
 * Encuentra el elemento en un arreglo de objetos que está numéricamente más cercano
 * a un punto (x, y) de referencia.
 *
 * Utiliza la fórmula de la distancia euclidiana para determinar la proximidad.
 *
 * @template T - El tipo de los objetos en el arreglo. Debe extender de PointLike.
 * @param {number} targetX - La coordenada X del punto de referencia.
 * @param {number} targetY - La coordenada Y del punto de referencia.
 * @param {T[]} data - El arreglo de objetos donde se realizará la búsqueda.
 * @param {keyof T} xKey - El nombre de la propiedad en los objetos que contiene la coordenada X.
 * @param {keyof T} yKey - El nombre de la propiedad en los objetos que contiene la coordenada Y.
 * @returns {T | null} El objeto más cercano encontrado, o null si el arreglo está vacío.
 */
export function findClosest<T>(
  targetX: number,
  targetY: number,
  data: T[],
  xKey: keyof T,
  yKey: keyof T,
): T | null {
  // Si el arreglo no tiene elementos, no hay nada que buscar.
  if (!data || data.length === 0) {
    return null;
  }

  let closestItem: T | null = null;
  let minDistanceSquared = Infinity;

  for (const item of data) {
    // Extraemos las coordenadas del objeto actual.
    // Se realiza una conversión a 'number' por si el tipo es más genérico.
    const itemX = item[xKey] as number;
    const itemY = item[yKey] as number;

    // Calculamos la diferencia en cada eje.
    const dx = targetX - itemX;
    const dy = targetY - itemY;

    // Calculamos el cuadrado de la distancia.
    // Es más eficiente comparar distancias al cuadrado que calcular la raíz cuadrada en cada iteración.
    const distanceSquared = dx * dx + dy * dy;

    // Si esta distancia es la más pequeña que hemos encontrado hasta ahora...
    if (distanceSquared < minDistanceSquared) {
      minDistanceSquared = distanceSquared;
      closestItem = item;
    }
  }

  return closestItem;
}
