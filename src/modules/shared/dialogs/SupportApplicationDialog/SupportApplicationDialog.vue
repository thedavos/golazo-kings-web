<template>
  <q-dialog
    ref="dialogRef"
    transition-show="jump-up"
    transition-hide="jump-down"
    @hide="onDialogHide"
  >
    <q-card class="q-dialog-plugin w-[500px] max-w-[90vw]">
      <!-- B3. Vista de Éxito -->
      <template v-if="view === 'success'">
        <go-toolbar-header :title="`¿Completaste tu apoyo en ${paymentMethodSelected?.label}?`" />

        <q-card-section class="text-center p-12">
          <q-icon name="la la-heart" color="red" size="xl" />

          <p class="mt-2 text-base text-gray-700">
            No recibimos confirmación. <br />Si ya aportaste, ¡gracias! Puedes cerrar esta ventana.
          </p>
        </q-card-section>
        <q-card-actions>
          <q-btn
            unelevated
            no-caps
            class="w-full"
            color="primary"
            label="Volver a la App"
            @click="onDialogOK"
          />
        </q-card-actions>
      </template>

      <template v-else-if="view === 'paypal-selected'">
        <go-toolbar-header title="Vamos a PayPal" />

        <q-card-section>
          <p class="font-normal text-sm">
            Te redirigiremos a PayPal para completar el pago de los
            <span class="font-semibold">${{ finalAmount }} dólares</span>. Si no ocurre en 5
            segundos, haz clic en el botón.
          </p>

          <div class="flex justify-center gap-4 my-8">
            <q-btn
              no-caps
              outline
              icon="la la-paypal"
              label="Ir PayPal"
              @click="() => goToPaypal"
            />
            <q-btn
              no-caps
              unelevated
              outline
              label="¿Problemas? Abrir en una nueva pestaña"
              @click="() => goToPaypal('_blank')"
            />
          </div>

          <q-banner dense rounded class="bg-blue-100 text-Extended-Banner" inline-actions>
            Nota: No cierres esta ventana. Volveremos aquí al finalizar.
          </q-banner>
        </q-card-section>
      </template>

      <template v-else-if="view === 'kofi-selected'">
        <go-toolbar-header title="Ir a Ko‑fi" />

        <q-card-section>
          <p class="font-normal text-sm">
            Te llevaremos a nuestra página de Ko-fi<br />
            Si no ocurre en 5 segundos, haz clic en el botón.
          </p>

          <div class="flex justify-center gap-4 my-8">
            <q-btn no-caps outline icon="la la-paypal" label="Ir a Ko-fi" @click="() => goToKofi" />
            />
            <q-btn
              no-caps
              unelevated
              outline
              label="Abrir en una nueva pestaña"
              @click="() => goToKofi('_blank')"
            />
          </div>

          <q-banner dense rounded class="bg-blue-100 text-Extended-Banner" inline-actions>
            Nota: No cierres esta ventana. Volveremos aquí al finalizar.
          </q-banner>
        </q-card-section>
      </template>

      <!-- A. Vista Inicial -->
      <template v-else>
        <go-toolbar-header title="Apoyar al proyecto" />

        <q-card-section class="pt-4">
          <div class="text-center">
            <p class="text-base">
              Esta es una app independiente. Tu apoyo ayuda a cubrir los costos del servidor y a
              desarrollar nuevas mejoras para ti.
            </p>
            <p class="text-base m-0">¡Muchas gracias por tu ayuda!</p>
          </div>

          <div class="flex flex-wrap flex-row-reverse items-center justify-around mt-4">
            <div>
              <div class="text-md font-normal mt-6">Elige o introduce una cantidad:</div>
              <q-btn-group unelevated class="mt-2">
                <q-btn
                  v-for="val in [2, 5, 10]"
                  :key="val"
                  :label="`$${val}`"
                  :color="amount === val ? 'primary' : 'grey-3'"
                  :text-color="amount === val ? 'white' : 'black'"
                  @click="selectAmount(val)"
                />
                <q-btn
                  no-caps
                  label="Otro"
                  :color="amount === 0 ? 'primary' : 'grey-3'"
                  :text-color="amount === 0 ? 'white' : 'black'"
                  @click="selectAmount(0)"
                />
              </q-btn-group>
              <q-input
                v-if="amount === 0"
                v-model.number="customAmount"
                outlined
                autofocus
                prefix="$"
                name="customAmount"
                type="number"
                label="Otra cantidad"
                class="mt-4"
              />
            </div>

            <div>
              <div class="text-md font-normal mt-6">Elige un método de pago:</div>
              <q-option-group
                v-model="paymentMethod"
                name="paymentMethod"
                color="primary"
                size="sm"
                class="mt-2"
                :options="SHARED_CONST.PAYMENT_OPTIONS"
              />
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="flex flex-col items-center justify-center">
          <p class="text-xs text-gray-500 m-0 mb-1 text-center">
            {{
              paymentMethod === 'paypal'
                ? 'Serás redirigido a PayPal para completar el pago.'
                : 'Serás redirigido a nuestra página de Ko-fi.'
            }}
          </p>
          <q-btn
            unelevated
            no-caps
            color="primary"
            class="w-full"
            :label="mainAction.label"
            :icon="mainAction.icon"
            :loading="isLoading"
            @click="handleMainAction"
          />
        </q-card-actions>
      </template>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDialogPluginComponent, useQuasar } from 'quasar';
import { GoToolbarHeader } from 'src/modules/shared/components/GoToolbarHeader';
import { CONST as SHARED_CONST } from 'src/modules/shared/constants';

type PaymentMethod = 'paypal' | 'kofi';
type View = 'initial' | 'paypal-selected' | 'kofi-selected' | 'success' | 'error';

defineEmits([...useDialogPluginComponent.emits]);
const { dialogRef, onDialogHide, onDialogOK } = useDialogPluginComponent();
const $q = useQuasar();

// --- Estado General ---
const view = ref<View>('initial');
const isLoading = ref(false);

// --- Vista Inicial ---
const amount = ref(10);
const customAmount = ref<number>(0);
const paymentMethod = ref<PaymentMethod>('paypal');

const selectAmount = (val: number) => {
  amount.value = val;
  if (val > 0) {
    customAmount.value = 0;
  }
};

const paymentMethodSelected = computed(() =>
  SHARED_CONST.PAYMENT_OPTIONS.find((option) => option.value === paymentMethod.value),
);

const finalAmount = computed(() => (amount.value === 0 ? customAmount.value : amount.value));

const mainAction = computed(() => {
  switch (paymentMethod.value) {
    case 'paypal':
      return { label: 'Continuar con PayPal', icon: 'la la-paypal' };
    case 'kofi':
      return { label: 'Invítame un café en Ko-fi', icon: 'la la-coffee' };
    default:
      return { label: `Pagar con $${finalAmount.value} con tarjeta`, icon: '' };
  }
});

function handleMainAction() {
  if (!finalAmount.value || finalAmount.value <= 0) {
    $q.notify({ type: 'negative', message: 'Por favor, introduce una cantidad válida.' });
    return;
  }

  switch (paymentMethod.value) {
    case 'paypal':
      redirectToPaypalView();
      break;
    case 'kofi':
      redirectToKofiView();
      break;
  }
}

function redirectToPaypalView() {
  isLoading.value = true;
  view.value = 'paypal-selected';

  setTimeout(() => {
    goToPaypal('_blank');
    isLoading.value = false;
    view.value = 'success';
  }, 1500);
}

function redirectToKofiView() {
  isLoading.value = true;
  view.value = 'kofi-selected';

  setTimeout(() => {
    goToKofi('_blank');
    isLoading.value = false;
    view.value = 'success';
  }, 1500);
}

function goToPaypal(target: string = '_self') {
  window.open(`https://paypal.me/davos282/${finalAmount.value}`, target);
}

function goToKofi(target: string = '_self') {
  window.open(`https://ko-fi.com/thedavos/${finalAmount.value}`, target);
}
</script>
