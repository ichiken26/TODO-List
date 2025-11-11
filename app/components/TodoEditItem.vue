<template>
  <li class="todo-item">
    <label class="checkbox-label">
      <input 
        type="checkbox" 
        :checked="selected"
        @change="handleCheckboxChange"
        class="todo-checkbox"
      />
      <span class="checkbox-custom"></span>
    </label>
    <select 
      :value="todo.priority" 
      @change="handlePriorityChange"
      class="priority-select"
    >
      <option :value="PRIORITY.HIGH">{{ PRIORITY_LABELS[PRIORITY.HIGH] }}</option>
      <option :value="PRIORITY.MEDIUM">{{ PRIORITY_LABELS[PRIORITY.MEDIUM] }}</option>
      <option :value="PRIORITY.LOW">{{ PRIORITY_LABELS[PRIORITY.LOW] }}</option>
    </select>
    <input 
      ref="inputRef"
      :value="localText" 
      @input="handleInput"
      @blur="handleBlur"
      @keydown.enter="handleEnterKey"
      class="todo-edit-input"
      :class="{ 'error': hasError }"
      placeholder="TODOを入力..."
    />
  </li>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import type { TodoItem } from '~/composables/useTodos';
import { PRIORITY, PRIORITY_LABELS } from '~/constants/priority';

interface Props {
  todo: TodoItem;
  selected: boolean;
}

interface Emits {
  (e: 'update:todo', value: string): void;
  (e: 'update:selected', value: boolean): void;
  (e: 'update:priority', value: number): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const inputRef = ref<HTMLInputElement | null>(null);
const localText = ref(props.todo.todo);
const hasError = ref(false);

// todoが変更されたら、localTextも更新
watch(() => props.todo.todo, (newValue) => {
  localText.value = newValue;
  hasError.value = false;
});

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  localText.value = target.value;
  hasError.value = false;
};

const validateAndUpdate = () => {
  const trimmedValue = localText.value.trim();
  
  if (!trimmedValue) {
    // 空文字列の場合は元の値に戻す
    hasError.value = true;
    localText.value = props.todo.todo;
    
    // エラー表示を少し表示してから消す
    setTimeout(() => {
      hasError.value = false;
    }, 2000);
    
    return false;
  }
  
  // バリデーション成功時は更新
  if (trimmedValue !== props.todo.todo) {
    emit('update:todo', trimmedValue);
  }
  
  return true;
};

const handleBlur = () => {
  validateAndUpdate();
};

const handleEnterKey = (event: KeyboardEvent) => {
  event.preventDefault();
  
  if (validateAndUpdate()) {
    // フォーカスを外す
    if (inputRef.value) {
      inputRef.value.blur();
    }
  }
};

const handleCheckboxChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  emit('update:selected', target.checked);
};

const handlePriorityChange = (event: Event) => {
  const target = event.target as HTMLSelectElement;
  emit('update:priority', Number(target.value));
};
</script>

<style scoped>
.todo-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  transition: background-color 0.3s;
  list-style: none;
}

.todo-item:hover {
  background: #f0f0f0;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.todo-checkbox {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #667eea;
  border-radius: 4px;
  position: relative;
  flex-shrink: 0;
  transition: all 0.3s;
}

.todo-checkbox:checked + .checkbox-custom {
  background: #667eea;
  border-color: #667eea;
}

.todo-checkbox:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-weight: bold;
  font-size: 14px;
}

.todo-edit-input {
  flex: 1;
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.todo-edit-input:focus {
  outline: none;
  border-color: #667eea;
}

.todo-edit-input.error {
  border-color: #f5576c;
  background: #fff5f5;
  animation: shake 0.3s;
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

.priority-select {
  padding: 0.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  background: white;
  cursor: pointer;
  transition: border-color 0.3s;
  flex-shrink: 0;
  min-width: 100px;
}

.priority-select:focus {
  outline: none;
  border-color: #667eea;
}

.priority-select:hover {
  border-color: #667eea;
}

@media (max-width: 768px) {
  .todo-item {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>

