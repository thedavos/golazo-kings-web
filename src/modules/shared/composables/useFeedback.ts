import { useQuasar } from 'quasar';
import type { QNotifyCreateOptions, QNotifyAction } from 'quasar';

export interface FeedbackOptions {
  message: string;
  caption?: string;
  icon?: string;
  timeout?: number;
  position?:
    | 'top-left'
    | 'top-right'
    | 'bottom-left'
    | 'bottom-right'
    | 'top'
    | 'bottom'
    | 'left'
    | 'right'
    | 'center';
  actions?: QNotifyAction[];
}

export function useFeedback() {
  const $q = useQuasar();

  /**
   * Muestra una notificación de éxito
   */
  const success = (messageOrOptions: string | FeedbackOptions) => {
    const options =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    $q.notify({
      type: 'positive',
      message: options.message,
      caption: options.caption,
      icon: options.icon || 'la la-check-circle',
      timeout: options.timeout || 2500,
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  /**
   * Muestra una notificación de error
   */
  const error = (messageOrOptions: string | FeedbackOptions) => {
    const options =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    $q.notify({
      type: 'negative',
      message: options.message,
      caption: options.caption,
      icon: options.icon || 'la la-exclamation-circle',
      timeout: options.timeout || 3500,
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  /**
   * Muestra una notificación de advertencia
   */
  const warning = (messageOrOptions: string | FeedbackOptions) => {
    const options =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    $q.notify({
      type: 'warning',
      message: options.message,
      caption: options.caption,
      icon: options.icon || 'la la-exclamation-triangle',
      timeout: options.timeout || 3000,
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  /**
   * Muestra una notificación de información
   */
  const info = (messageOrOptions: string | FeedbackOptions) => {
    const options =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    $q.notify({
      type: 'info',
      message: options.message,
      caption: options.caption,
      icon: options.icon || 'la la-info-circle',
      timeout: options.timeout || 2500,
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  /**
   * Muestra una notificación genérica (sin tipo específico)
   */
  const notify = (options: FeedbackOptions & { color?: string; textColor?: string }) => {
    $q.notify({
      message: options.message,
      caption: options.caption,
      icon: options.icon,
      color: options.color,
      textColor: options.textColor,
      timeout: options.timeout || 2500,
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  /**
   * Muestra una notificación de carga/procesando
   */
  const loading = (messageOrOptions: string | FeedbackOptions) => {
    const options =
      typeof messageOrOptions === 'string' ? { message: messageOrOptions } : messageOrOptions;

    $q.notify({
      type: 'ongoing',
      message: options.message,
      caption: options.caption,
      icon: options.icon || 'la la-spinner la-spin',
      timeout: options.timeout || 0, // 0 = no se cierra automáticamente
      position: options.position || 'top-right',
      actions: options.actions,
    } as QNotifyCreateOptions);
  };

  return {
    success,
    error,
    warning,
    info,
    notify,
    loading,
  };
}
