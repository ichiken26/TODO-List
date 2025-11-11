<template>
  <div class="home">
    <div class="welcome-card">
      <h1>🎯 TODO List アプリへようこそ</h1>
      <p class="description">
        タスクを効率的に管理して、生産性を向上させましょう。
      </p>
    </div>

    <div class="features">
      <div class="feature-card">
        <h2>📝 編集画面</h2>
        <p>TODOアイテムの追加、編集、削除ができます。優先度も設定できます。</p>
        <NuxtLink to="/edit" class="btn btn-primary">編集画面へ</NuxtLink>
      </div>

      <div class="feature-card">
        <h2>✅ チェック画面</h2>
        <p>完了したタスクにチェックを入れて、進捗を視覚的に確認できます。</p>
        <NuxtLink to="/check" class="btn btn-secondary">チェック画面へ</NuxtLink>
      </div>
    </div>

    <div class="stats" v-if="todoUser">
      <div class="stat-card">
        <h3>{{ todoUser.todos.length }}</h3>
        <p>総タスク数</p>
      </div>
      <div class="stat-card">
        <h3>{{ completedCount }}</h3>
        <p>完了タスク</p>
      </div>
      <div class="stat-card">
        <h3>{{ highPriorityCount }}</h3>
        <p>高優先度タスク</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { PRIORITY } from '~/constants/priority';

const { todoUser, fetchTodos } = useTodos();

// ページ読み込み時にデータを取得
onMounted(() => {
  if (!todoUser.value) {
    fetchTodos();
  }
});

// 完了タスク数（チェック画面の状態は保持されないため、ここでは0と表示）
const completedCount = computed(() => 0);

// 高優先度タスク数
const highPriorityCount = computed(() => {
  return todoUser.value?.todos.filter(todo => todo.priority === PRIORITY.HIGH).length || 0;
});
</script>

<style scoped>
.home {
  animation: fadeIn 0.5s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.welcome-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.welcome-card h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.description {
  font-size: 1.2rem;
  color: #666;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.feature-card {
  background: white;
  border-radius: 10px;
  padding: 2rem;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.15);
}

.feature-card h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.feature-card p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.8;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: bold;
  transition: all 0.3s;
  border: none;
  cursor: pointer;
}

.btn-primary {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.btn-primary:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.btn-secondary:hover {
  transform: scale(1.05);
  box-shadow: 0 5px 15px rgba(245, 87, 108, 0.4);
}

.stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.stat-card h3 {
  font-size: 2.5rem;
  color: #667eea;
  margin-bottom: 0.5rem;
}

.stat-card p {
  color: #666;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .welcome-card h1 {
    font-size: 1.8rem;
  }

  .features {
    grid-template-columns: 1fr;
  }

  .stats {
    grid-template-columns: 1fr;
  }
}
</style>

