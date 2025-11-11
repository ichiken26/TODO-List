<template>
  <div class="add-form-card">
    <h3>新しいTODOを追加</h3>
    <form @submit.prevent="handleSubmit" class="add-form">
      <input 
        v-model="localText" 
        placeholder="新しいTODOを入力..." 
        required 
        class="todo-input"
      />
      <select v-model.number="localPriority" class="priority-select">
        <option :value="PRIORITY.HIGH">{{ PRIORITY_LABELS[PRIORITY.HIGH] }}</option>
        <option :value="PRIORITY.MEDIUM">{{ PRIORITY_LABELS[PRIORITY.MEDIUM] }}</option>
        <option :value="PRIORITY.LOW">{{ PRIORITY_LABELS[PRIORITY.LOW] }}</option>
      </select>
      <button type="submit" class="btn-add">追加</button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { PRIORITY, PRIORITY_LABELS, DEFAULT_PRIORITY } from '~/constants/priority';

interface Props {
  modelValue?: string;
  priority?: number;
}

interface Emits {
  (e: 'submit', text: string, priority: number): void;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: '',
  priority: DEFAULT_PRIORITY
});

const emit = defineEmits<Emits>();

const localText = ref(props.modelValue);
const localPriority = ref(props.priority);

const handleSubmit = () => {
  if (!localText.value.trim()) return;
  
  emit('submit', localText.value, localPriority.value);
  
  // フォームリセット
  localText.value = '';
  localPriority.value = DEFAULT_PRIORITY;
};
</script>

<style scoped>
.add-form-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.add-form-card h3 {
  font-size: 1.3rem;
  margin-bottom: 1rem;
  color: #333;
}

.add-form {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.todo-input {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.todo-input:focus {
  outline: none;
  border-color: #667eea;
}

.priority-select {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
}

.priority-select:focus {
  outline: none;
  border-color: #667eea;
}

.btn-add {
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-add:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

@media (max-width: 768px) {
  .add-form {
    flex-direction: column;
  }
}
</style>

