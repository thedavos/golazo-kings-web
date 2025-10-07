/**
 * Opciones para la validación de imágenes
 */
export interface ImageValidationOptions {
  maxSizeBytes?: number; // default: 2MB
  allowedTypes?: string[]; // default: todas las imágenes
}

/**
 * Resultado de la validación de imagen
 */
export interface ImageValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Valida que un archivo sea una imagen válida
 * @param file - Archivo a validar
 * @param options - Opciones de validación
 * @returns Resultado de la validación con mensaje de error si aplica
 */
export const validateImageFile = (
  file: File,
  options: ImageValidationOptions = {},
): ImageValidationResult => {
  const maxSize = options.maxSizeBytes ?? 2097152; // 2MB por defecto
  const allowedTypes = options.allowedTypes ?? ['image/'];

  // Validar tipo de archivo
  const isValidType = allowedTypes.some((type) => file.type.startsWith(type));
  if (!isValidType) {
    return { valid: false, error: 'Solo se permiten imágenes' };
  }

  // Validar tamaño
  if (file.size > maxSize) {
    const maxSizeMB = (maxSize / 1048576).toFixed(1);
    return { valid: false, error: `La imagen debe ser menor a ${maxSizeMB}MB` };
  }

  return { valid: true };
};

/**
 * Convierte un archivo de imagen a Base64
 * @param file - Archivo a convertir
 * @returns Promise con la cadena Base64
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      resolve(base64);
    };

    reader.onerror = () => {
      reject(new Error('Error al leer la imagen'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Procesa un archivo de imagen: valida y convierte a Base64
 * @param file - Archivo a procesar
 * @param options - Opciones de validación
 * @returns Promise con el resultado del procesamiento
 */
export const processImageFile = async (
  file: File,
  options: ImageValidationOptions = {},
): Promise<{ success: true; data: string } | { success: false; error: string }> => {
  // Validar
  const validation = validateImageFile(file, options);
  if (!validation.valid) {
    return { success: false, error: validation.error! };
  }

  // Convertir a Base64
  try {
    const base64 = await fileToBase64(file);
    return { success: true, data: base64 };
  } catch {
    return { success: false, error: 'Error al procesar la imagen' };
  }
};
