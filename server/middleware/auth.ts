import { requireAuth } from '../utils/auth-guard';
import { PUBLIC_PATHS, PROTECTED_PATHS } from '../constants/auth';

/**
 * 認証ミドルウェア
 * 保護されたルートへのアクセスを制御
 */
export default defineEventHandler(async (event) => {
  const path = event.path;
  if (!path) return;

  // 認証が不要なパスの場合はスキップ
  if (PUBLIC_PATHS.some(publicPath => path.startsWith(publicPath))) {
    return;
  }

  // 保護されたパスでない場合はスキップ
  const isProtectedPath = PROTECTED_PATHS.some(protectedPath => path.startsWith(protectedPath));
  if (!isProtectedPath) {
    return;
  }

  // 認証を要求し、ユーザー情報をリクエストに追加
  const decoded = requireAuth(event);
  event.context.user = decoded;
});

