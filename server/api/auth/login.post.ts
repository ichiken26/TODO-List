import { verifyPassword, getUserByUserName } from '../../utils/auth';
import { generateToken } from '../../utils/jwt';
import { sanitizeCredentials, validateCredentialsInput } from '../../utils/validation';
import { setAuthTokenCookie } from '../../utils/cookie';

/**
 * ログインAPI
 * ユーザー名とパスワードで認証を行う
 */
const INVALID_CREDENTIALS_MESSAGE = 'ユーザー名またはパスワードが正しくありません';

export default defineEventHandler(async (event) => {
  const body = await readBody<{ userName: string; password: string }>(event);

  // 入力値のサニタイズ（SQLインジェクション対策）
  const { userName, password } = sanitizeCredentials(body.userName, body.password);

  // バリデーション
  const validationError = validateCredentialsInput(userName, password);
  if (validationError) {
    throw createError({
      statusCode: 400,
      statusMessage: validationError,
    });
  }

  // ユーザーを取得
  const user = await getUserByUserName(userName);
  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: INVALID_CREDENTIALS_MESSAGE,
    });
  }

  // パスワードを検証
  const isPasswordValid = await verifyPassword(password, user.password);
  if (!isPasswordValid) {
    throw createError({
      statusCode: 401,
      statusMessage: INVALID_CREDENTIALS_MESSAGE,
    });
  }

  // JWTトークンを生成
  const token = generateToken(user.id, user.userName);

  // Cookieにトークンを設定
  setAuthTokenCookie(event, token);

  return {
    success: true,
    user: {
      id: user.id,
      userName: user.userName,
    },
    token,
  };
});

