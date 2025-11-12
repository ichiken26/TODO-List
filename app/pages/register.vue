<template>
  <div class="register-page">
    <div class="register-card">
      <h1>📝 新規登録</h1>
      <p class="subtitle">新しいアカウントを作成</p>

      <form @submit.prevent="handleRegister" class="register-form">
        <div class="form-group">
          <label for="userName">ユーザー名</label>
          <input
            id="userName"
            v-model="userName"
            type="text"
            required
            class="form-input"
            :class="{ 'error': hasError }"
            placeholder="ユーザー名を入力"
          />
        </div>

        <div class="form-group">
          <label for="password">パスワード</label>
          <input
            id="password"
            v-model="password"
            type="password"
            required
            class="form-input"
            :class="{ 'error': hasError }"
            placeholder="パスワードを入力"
          />
          <p class="password-hint">英数字の混合である必要があります</p>
        </div>

        <div v-if="errorMessage" class="error-message">
          {{ errorMessage }}
        </div>

        <button type="submit" class="btn-register" :disabled="isLoading">
          {{ isLoading ? '登録中...' : '登録' }}
        </button>
      </form>

      <div class="login-link">
        <p>既にアカウントをお持ちの方は</p>
        <NuxtLink to="/" class="link-login">ログイン</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';

/**
 * 認証状態を管理
 */
const { register, fetchCurrentUser } = useAuth();

/**
 * フォームの状態
 */
const userName = ref('');
const password = ref('');
const isLoading = ref(false);
const hasError = ref(false);
const errorMessage = ref('');

/**
 * 既にログイン済みの場合はリダイレクト
 */
onMounted(async () => {
  const currentUser = await fetchCurrentUser();
  if (currentUser) {
    await navigateTo('/users');
  }
});

/**
 * 登録処理
 */
const handleRegister = async () => {
  hasError.value = false;
  errorMessage.value = '';
  isLoading.value = true;

  try {
    const success = await register(userName.value, password.value);
    if (success) {
      await navigateTo('/users');
    }
  } catch (error: any) {
    hasError.value = true;
    errorMessage.value = error.data?.statusMessage || '登録に失敗しました';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.register-card {
  background: white;
  border-radius: 15px;
  padding: 3rem;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  width: 100%;
  max-width: 400px;
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

.register-card h1 {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  text-align: center;
  color: #333;
}

.subtitle {
  text-align: center;
  color: #666;
  margin-bottom: 2rem;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  color: #333;
}

.form-input {
  padding: 0.75rem;
  border: 2px solid #e0e0e0;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
}

.form-input.error {
  border-color: #f5576c;
  background: #fff5f5;
}

.password-hint {
  font-size: 0.85rem;
  color: #999;
  margin: 0;
}

.error-message {
  color: #f5576c;
  font-size: 0.9rem;
  text-align: center;
  padding: 0.5rem;
  background: #fff5f5;
  border-radius: 5px;
}

.btn-register {
  padding: 0.75rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.btn-register:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.4);
}

.btn-register:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  margin-top: 2rem;
  text-align: center;
  color: #666;
}

.login-link p {
  margin-bottom: 0.5rem;
}

.link-login {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
  transition: color 0.3s;
}

.link-login:hover {
  color: #5568d3;
  text-decoration: underline;
}
</style>

