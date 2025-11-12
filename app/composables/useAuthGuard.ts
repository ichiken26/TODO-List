/**
 * 認証ガード用のcomposable
 * 認証が必要なページで使用する共通処理
 */
export const useAuthGuard = () => {
  const { fetchCurrentUser } = useAuth();
  const { fetchTodos, todoUser } = useTodos();

  /**
   * 認証チェックとデータ取得
   * 未認証の場合はログインページにリダイレクト
   * ユーザーIDが変わった場合はTODOリストを再取得
   */
  const ensureAuthenticatedAndFetchTodos = async (): Promise<boolean> => {
    const currentUser = await fetchCurrentUser();
    if (!currentUser) {
      await navigateTo('/');
      return false;
    }

    if (!todoUser.value || todoUser.value.id !== currentUser.id) {
      await fetchTodos();
    }

    return true;
  };

  return { ensureAuthenticatedAndFetchTodos };
};

