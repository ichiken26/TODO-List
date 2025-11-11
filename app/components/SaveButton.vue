<template>
  <div class="save-section">
    <button @click="handleClick" class="btn-save" :disabled="disabled">
      💾 この内容で保存する
    </button>
  </div>
</template>

<script setup lang="ts">
interface Props {
  disabled?: boolean;
}

interface Emits {
  (e: 'click'): void;
}

defineProps<Props>();
const emit = defineEmits<Emits>();

const handleClick = () => {
  emit('click');
};
</script>

<style scoped>
.save-section {
  text-align: center;
  padding: 1rem;
}

.btn-save {
  padding: 1rem 2rem;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 1.2rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  box-shadow: 0 4px 15px rgba(245, 87, 108, 0.3);
}

.btn-save:hover:not(:disabled) {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(245, 87, 108, 0.4);
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

