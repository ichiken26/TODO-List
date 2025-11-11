/**
 * localStorageの読み書きを行うcomposable
 * 
 * @param key - localStorageのキー
 * @returns localStorageの読み書き関数
 */
export const useLocalStorage = <T>(key: string, defaultValue: T) => {
  /**
   * localStorageから値を読み込む
   * @returns 読み込んだ値、エラー時はデフォルト値
   */
  const load = (): T => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  /**
   * localStorageに値を保存する
   * @param value - 保存する値
   */
  const save = (value: T): void => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`localStorageへの保存に失敗 (key: ${key}):`, error);
    }
  };

  return {
    load,
    save,
  };
};

