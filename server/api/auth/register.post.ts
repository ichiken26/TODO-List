import { hashPassword, validatePassword, isUserNameExists, createUser } from '../../utils/auth';
import { generateToken } from '../../utils/jwt';
import { sanitizeCredentials, validateCredentialsInput } from '../../utils/validation';
import { setAuthTokenCookie } from '../../utils/cookie';

/**
 * ユーザー登録API
 * ユーザー名とパスワードで新規ユーザーを作成
 */
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

  // ユーザー名の重複チェック
  if (isUserNameExists(userName)) {
    throw createError({
      statusCode: 409,
      statusMessage: 'このユーザー名は既に登録されています',
    });
  }

  // パスワードのバリデーション
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.valid) {
    throw createError({
      statusCode: 400,
      statusMessage: passwordValidation.message || 'パスワードの形式が正しくありません',
    });
  }

  // パスワードをハッシュ化
  const hashedPassword = await hashPassword(password);

  // ユーザーを作成
  const userId = createUser(userName, hashedPassword);

  // JWTトークンを生成
  const token = generateToken(userId, userName);

  // Cookieにトークンを設定
  setAuthTokenCookie(event, token);

  return {
    success: true,
    user: {
      id: userId,
      userName: userName,
    },
    token,
  };
});

