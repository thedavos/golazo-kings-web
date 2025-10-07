/**
 * Type definitions for Google gtag (Google Analytics & Consent Mode v2)
 */

export type ConsentStatus = 'granted' | 'denied';

export interface ConsentParams {
  ad_storage?: ConsentStatus;
  ad_user_data?: ConsentStatus;
  ad_personalization?: ConsentStatus;
  analytics_storage?: ConsentStatus;
  functionality_storage?: ConsentStatus;
  personalization_storage?: ConsentStatus;
  security_storage?: ConsentStatus;
  wait_for_update?: number;
  region?: string[];
}

export interface GtagConfigParams {
  page_path?: string;
  page_title?: string;
  page_location?: string;
  send_page_view?: boolean;
  [key: string]: string | number | boolean | undefined;
}

export interface GtagEventParams {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
}

declare global {
  interface Window {
    /**
     * Google Analytics gtag function
     */
    gtag: {
      (command: 'config', targetId: string, config?: GtagConfigParams): void;
      (command: 'event', eventName: string, eventParams?: GtagEventParams): void;
      (command: 'js', date: Date): void;
      (command: 'consent', action: 'default' | 'update', params: ConsentParams): void;
      (command: 'set', params: Record<string, unknown>): void;
      (command: 'get', targetId: string, fieldName: string, callback?: (value: string) => void): void;
    };

    /**
     * Google Analytics dataLayer
     */
    dataLayer: Array<unknown>;

    /**
     * Google AdSense adsbygoogle array
     */
    adsbygoogle: Array<Record<string, unknown>>;
  }
}

export {};
