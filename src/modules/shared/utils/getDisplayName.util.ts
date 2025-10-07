import { getInitials } from './initials.util';

// Badge dimensions: 63px width, 10px font-size bold
// ~6px per character → ~9 chars fit comfortably with padding
const MAX_NAME_LENGTH: number = 9;
const MAX_FIRST_NAME_LENGTH: number = 8;

/**
 * Obtiene el nombre a mostrar en el badge del jugador (63px width, 10px font)
 * 
 * Estrategia:
 * 1. Si nombre completo cabe (≤9 chars) → "Juan Diaz"
 * 2. Si no cabe, intentar firstName + inicial apellido (≤9 chars) → "Juan R."
 * 3. Si no cabe, usar solo firstName (≤8 chars) → "Juan"
 * 4. Como último recurso, usar iniciales → "J.D."
 * 5. Si faltan datos → '' (string vacío)
 * 
 * @param firstName - Nombre del jugador
 * @param lastName - Apellido del jugador
 * @returns Nombre formateado para badge
 * 
 * @example
 * getDisplayName('Juan', 'Diaz') // "Juan Diaz"
 * getDisplayName('Juan', 'Rodriguez Garcia') // "Juan R."
 * getDisplayName('Juan Carlos', 'Fernandez') // "Juan Carlos" o "J.C." dependiendo del largo
 */
export function getDisplayName(firstName: string, lastName: string): string {
  // Validar y limpiar inputs
  const cleanFirstName = firstName?.trim() || '';
  const cleanLastName = lastName?.trim() || '';

  // Si falta algún dato, retornar vacío
  if (!cleanFirstName || !cleanLastName) return '';

  // Estrategia 1: Nombre completo si cabe
  const fullName = `${cleanFirstName} ${cleanLastName}`;
  if (fullName.length <= MAX_NAME_LENGTH) {
    return fullName;
  }

  // Estrategia 2: firstName + inicial del apellido
  const firstNameWithInitial = `${cleanFirstName} ${cleanLastName.charAt(0)}.`;
  if (firstNameWithInitial.length <= MAX_NAME_LENGTH) {
    return firstNameWithInitial;
  }

  // Estrategia 3: Solo firstName si es corto
  if (cleanFirstName.length <= MAX_FIRST_NAME_LENGTH) {
    return cleanFirstName;
  }

  // Estrategia 4: Iniciales como último recurso
  return getInitials(cleanFirstName, cleanLastName);
}
