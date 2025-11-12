import { computed } from 'vue';
import { useState } from '#app/composables/state';

/**
 * 認証ユーザーの型定義
 */
export interface AuthUser {
  id: string;
  userName: string;
}

/**
 * 認証状態を管理するcomposable
 */
export const useAuth = () => {
  /**
   * 認証済みユーザーの状態
   */
  const user = useState<AuthUser | null>('authUser', () => null);

  /**
   * 現在のログインユーザー情報を取得
   */
  const fetchCurrentUser = async (): Promise<AuthUser | null> => {
    try {
      const data = await $fetch<AuthUser>('/api/auth/me');
      user.value = data;
      return data;
    } catch (error) {
      user.value = null;
      return null;
    }
  };

  /**
   * ログイン
   * 
   * @param userName - ユーザー名
   * @param password - パスワード
   * @returns ログインが成功したかどうか
   */
  const login = async (userName: string, password: string): Promise<boolean> => {
    try {
      const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/login', {
        method: 'POST',
        body: { userName, password },
      });
      
      if (!response.success) return false;

      const previousUserId = user.value?.id;
      user.value = response.user;
      
      if (previousUserId && previousUserId !== response.user.id) {
        const { clearTodos } = useTodos();
        clearTodos();
      }
      
      return true;
    } catch (error: any) {
      console.error('ログインに失敗:', error);
      throw error;
    }
  };

  /**
   * ユーザー登録
   * 
   * @param userName - ユーザー名
   * @param password - パスワード
   * @returns 登録が成功したかどうか
   */
  const register = async (userName: string, password: string): Promise<boolean> => {
    try {
      const response = await $fetch<{ success: boolean; user: AuthUser }>('/api/auth/register', {
        method: 'POST',
        body: { userName, password },
      });
      
      if (!response.success) return false;

      const previousUserId = user.value?.id;
      user.value = response.user;
      
      if (previousUserId && previousUserId !== response.user.id) {
        const { clearTodos } = useTodos();
        clearTodos();
      }
      
      return true;
    } catch (error: any) {
      console.error('登録に失敗:', error);
      throw error;
    }
  };

  /**
   * ログアウト
   */
  const logout = async (): Promise<void> => {
    try {
      await $fetch('/api/auth/logout', {
        method: 'POST',
      });
    } catch (error) {
      console.error('ログアウトに失敗:', error);
    } finally {
      const previousUserId = user.value?.id;
      user.value = null;
      
      // TODOリストの状態をクリア
      const { clearTodos } = useTodos();
      clearTodos();
    }
  };

  return {
    user,
    fetchCurrentUser,
    login,
    register,
    logout,
  };
};

