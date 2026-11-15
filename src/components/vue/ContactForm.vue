<script setup lang="ts">
import { reactive, ref } from 'vue';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import Button from 'primevue/button';
import Message from 'primevue/message';
import { CONTACT_EMAIL } from '../../lib/site';

const props = withDefaults(
  defineProps<{
    subject?: string;
    initialMessage?: string;
    toEmail?: string;
  }>(),
  {
    subject: 'Mensaje desde el sitio de Intimar',
    initialMessage: '',
    toEmail: CONTACT_EMAIL,
  },
);

const name = ref('');
const email = ref('');
const message = ref(props.initialMessage);
const submitted = ref(false);

type FieldName = 'name' | 'email' | 'message';
const errors = reactive<Record<FieldName, string | undefined>>({
  name: undefined,
  email: undefined,
  message: undefined,
});

// Deliberately permissive shape check (not a full RFC 5322 validator) —
// just enough to catch a missing "@" or domain before it becomes a bounced
// mailto link.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Runs on blur and on submit instead of relying solely on the browser's
// native constraint-validation bubble (the form carries `novalidate` for
// exactly this reason). That native bubble renders in whichever language
// the *browser* is set to — not the page's own es-CL copy — doesn't
// identify the failing field to a screen reader beyond generic wording,
// and isn't reachable via `aria-describedby`. The <p role="alert"> below
// each field is.
function validateField(field: FieldName): boolean {
  if (field === 'name') {
    errors.name = name.value.trim() ? undefined : 'Ingresa tu nombre.';
  } else if (field === 'email') {
    const value = email.value.trim();
    if (!value) {
      errors.email = 'Ingresa tu correo electrónico.';
    } else if (!EMAIL_PATTERN.test(value)) {
      errors.email = 'Ingresa un correo electrónico válido.';
    } else {
      errors.email = undefined;
    }
  } else {
    errors.message = message.value.trim() ? undefined : 'Escribe un mensaje.';
  }
  return !errors[field];
}

// Only clears an already-shown error once the field becomes valid — it
// doesn't surface new errors while the visitor is still mid-typing.
function clearFieldErrorIfFixed(field: FieldName) {
  if (errors[field]) validateField(field);
}

function focusField(field: FieldName) {
  document.getElementById(field)?.focus();
}

// No backend on this static build yet, so submissions hand off to the
// visitor's own mail client rather than silently failing.
function handleSubmit() {
  const fields: FieldName[] = ['name', 'email', 'message'];
  const results = fields.map((field) => validateField(field));
  const firstInvalid = fields[results.indexOf(false)];
  if (firstInvalid) {
    // Inline errors are useless to a keyboard/screen-reader user if focus
    // stays on the submit button — move it to the first invalid field,
    // the same as native form validation would.
    focusField(firstInvalid);
    return;
  }

  const body = `Nombre: ${name.value}\nCorreo: ${email.value}\n\n${message.value}`;
  const mailto = `mailto:${props.toEmail}?subject=${encodeURIComponent(props.subject)}&body=${encodeURIComponent(body)}`;
  window.location.href = mailto;
  submitted.value = true;
}
</script>

<template>
  <form class="flex flex-col gap-4" novalidate @submit.prevent="handleSubmit">
    <div class="flex flex-col gap-1">
      <label for="name" class="text-sm font-medium text-ink-800">Nombre</label>
      <InputText
        id="name"
        v-model="name"
        :invalid="!!errors.name"
        :aria-describedby="errors.name ? 'name-error' : undefined"
        @blur="validateField('name')"
        @update:model-value="clearFieldErrorIfFixed('name')"
      />
      <p
        v-if="errors.name"
        id="name-error"
        role="alert"
        class="text-sm text-error"
      >
        {{ errors.name }}
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <label for="email" class="text-sm font-medium text-ink-800"
        >Correo electrónico</label
      >
      <InputText
        id="email"
        v-model="email"
        type="email"
        :invalid="!!errors.email"
        :aria-describedby="errors.email ? 'email-error' : undefined"
        @blur="validateField('email')"
        @update:model-value="clearFieldErrorIfFixed('email')"
      />
      <p
        v-if="errors.email"
        id="email-error"
        role="alert"
        class="text-sm text-error"
      >
        {{ errors.email }}
      </p>
    </div>
    <div class="flex flex-col gap-1">
      <label for="message" class="text-sm font-medium text-ink-800"
        >Mensaje</label
      >
      <Textarea
        id="message"
        v-model="message"
        rows="4"
        auto-resize
        :invalid="!!errors.message"
        :aria-describedby="errors.message ? 'message-error' : undefined"
        @blur="validateField('message')"
        @update:model-value="clearFieldErrorIfFixed('message')"
      />
      <p
        v-if="errors.message"
        id="message-error"
        role="alert"
        class="text-sm text-error"
      >
        {{ errors.message }}
      </p>
    </div>
    <Button
      type="submit"
      label="Enviar"
      class="border-terracotta-500! bg-terracotta-500! text-white! hover:bg-terracotta-700!"
    />
    <Message v-if="submitted" severity="success" :closable="false">
      Tu aplicación de correo debería estar abierta con tu mensaje listo para
      enviar. Si no se abrió, escríbenos directamente a
      <a :href="`mailto:${toEmail}`" class="underline underline-offset-2">{{
        toEmail
      }}</a>.
    </Message>
  </form>
</template>
