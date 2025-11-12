/**
 * 認証が必要なページへのアクセスを制御するミドルウェア
 */
export default defineNuxtRouteMiddleware(async () => {
  try {
    await $fetch('/api/auth/me');
  } catch (error) {
    return navigateTo('/');
  }
});

