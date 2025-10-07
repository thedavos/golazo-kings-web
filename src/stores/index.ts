import { defineStore } from '#q-app/wrappers';
import { createPinia } from 'pinia';
import { createPersistedStatePlugin } from 'pinia-plugin-persistedstate-2';
import localforage from 'localforage';

/*
 * When adding new properties to stores, you should also
 * extend the `PiniaCustomProperties` interface.
 * @see https://pinia.vuejs.org/core-concepts/plugins.html#typing-new-store-properties
 */
declare module 'pinia' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface PiniaCustomProperties {
    // add your custom properties here, if any
  }
}

/*
 * If not building with SSR mode, you can
 * directly export the Store instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Store instance.
 */

export default defineStore((/* { ssrContext } */) => {
  const pinia = createPinia();

  // Configurar persistencia con IndexedDB (via localforage)
  pinia.use(
    createPersistedStatePlugin({
      storage: {
        getItem: async (key) => localforage.getItem(key),
        setItem: async (key, value) => localforage.setItem(key, value),
        removeItem: async (key) => localforage.removeItem(key),
      },
    }),
  );

  return pinia;
});
