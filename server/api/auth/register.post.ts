import { hashPassword, validatePassword, isUserNameExists, createUser } from '../../utils/auth';
import { generateToken } from '../../utils/jwt';
import { sanitizeCredentials, validateCredentialsInput } from '../../utils/validation';
import { setAuthTokenCookie } from '../../utils/cookie';

/**
 * ユーザー登録API
 * ユーザー名とパスワードで新規ユーザーを作成
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody<{ userName: string; password: string }>(event);

    // 入力値のサニタイズ（SQLインジェクション対策）
    const { userName, password } = sanitizeCredentials(body.userName, body.password);

    // バリデーション
    const validationError = validateCredentialsInput(userName, password);
    if (validationError) {
      throw createError({
        statusCode: 400,
        statusMessage: validationError,
        message: validationError,
      });
    }

    // ユーザー名の重複チェック
    if (await isUserNameExists(userName)) {
      throw createError({
        statusCode: 409,
        statusMessage: 'このユーザー名は既に登録されています',
        message: 'このユーザー名は既に登録されています',
      });
    }

    // パスワードのバリデーション
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      throw createError({
        statusCode: 400,
        statusMessage: passwordValidation.message || 'パスワードの形式が正しくありません',
        message: passwordValidation.message || 'パスワードの形式が正しくありません',
      });
    }

    // パスワードをハッシュ化
    const hashedPassword = await hashPassword(password);

    // ユーザーを作成
    const userId = await createUser(userName, hashedPassword);

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
  } catch (error: any) {
    console.error('ユーザー登録に失敗:', error);
    console.error('エラー詳細:', {
      name: error?.name,
      message: error?.message,
      code: error?.code,
      statusCode: error?.statusCode,
      region: process.env.REGION || process.env.AWS_REGION,
    });
    
    // 既にcreateErrorの場合はそのまま再スロー
    if (error?.statusCode) {
      throw error;
    }
    
    // DynamoDB関連のエラーの場合
    if (error?.name === 'ResourceNotFoundException' || error?.name === 'AccessDeniedException' || error?.code === 'AccessDenied') {
      throw createError({
        statusCode: 503,
        statusMessage: 'DynamoDBに接続できません。IAMロールの設定を確認してください。',
        message: 'DynamoDBに接続できません。IAMロールの設定を確認してください。',
      });
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'ユーザー登録に失敗しました',
      message: error?.message || 'ユーザー登録に失敗しました',
    });
  }
});

