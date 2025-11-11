<template>
  <Teleport to="body">
    <Transition name="modal">
      <div v-if="modelValue" class="modal modal-open" @click.self="closeOnBackdrop && $emit('update:modelValue', false)">
        <div class="modal-box" :class="sizeClass">
          <!-- Header -->
          <div class="flex items-center justify-between mb-4" v-if="!hideHeader">
            <h3 class="font-bold text-lg">{{ title }}</h3>
            <button
              type="button"
              class="btn btn-sm btn-circle btn-ghost"
              @click="$emit('update:modelValue', false)"
              v-if="showClose"
            >
              ✕
            </button>
          </div>

          <!-- Content -->
          <div class="modal-content">
            <slot></slot>
          </div>

          <!-- Footer -->
          <div class="modal-action" v-if="!hideFooter">
            <slot name="footer">
              <button type="button" class="btn" @click="$emit('update:modelValue', false)">
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="btn btn-primary"
                @click="$emit('confirm')"
                v-if="showConfirm"
              >
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  hideHeader: {
    type: Boolean,
    default: false
  },
  hideFooter: {
    type: Boolean,
    default: false
  },
  showClose: {
    type: Boolean,
    default: true
  },
  showConfirm: {
    type: Boolean,
    default: false
  },
  confirmText: {
    type: String,
    default: 'Confirmer'
  },
  cancelText: {
    type: String,
    default: 'Annuler'
  },
  closeOnBackdrop: {
    type: Boolean,
    default: true
  }
})

defineEmits(['update:modelValue', 'confirm'])

const sizeClass = computed(() => {
  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  }
  return sizes[props.size] || sizes.md
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
