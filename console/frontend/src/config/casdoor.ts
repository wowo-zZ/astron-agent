// Casdoor 配置与 SDK 初始化
import Sdk from 'casdoor-js-sdk';

export const casdoorSdk = new Sdk({
  serverUrl: import.meta.env.VITE_CASDOOR_SERVER_URL || 'http://localhost:3000',
  clientId: import.meta.env.VITE_CASDOOR_CLIENT_ID || '',
  appName: import.meta.env.VITE_CASDOOR_APP_NAME || '',
  organizationName: import.meta.env.VITE_CASDOOR_ORG_NAME || '',
  redirectPath: '/callback',
  signinPath: '/api/signin',
});

export const saveTokenFromResponse = (res: unknown): void => {
  try {
    const r = res as Record<string, unknown>;
    const data = (r?.data as Record<string, unknown>) || r;
    const token = (data as { accessToken?: string }).accessToken;
    if (token) {
      localStorage.setItem('accessToken', token);
    }
    const refreshToken = (data as { refreshToken?: string }).refreshToken;
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  } catch {
    // ignore
  }
};

export const isGetTokenSuccessful = (res: unknown): boolean => {
  if (!res) return false;
  const r = res as Record<string, unknown>;
  if (r?.success === true) return true;
  if (r?.code === 0) return true;
  const data = (r?.data as Record<string, unknown>) || r;
  if ((data as Record<string, unknown>)?.accessToken) return true;
  return Boolean((r as Record<string, unknown>)?.accessToken);
};

// ======= PKCE/前端直连辅助方法 =======
export const getLogoutUrl = (postLogoutRedirect?: string): string => {
  const server = import.meta.env.VITE_CASDOOR_SERVER_URL || '';
  const clientId = import.meta.env.VITE_CASDOOR_CLIENT_ID || '';
  const redirect = postLogoutRedirect || window.location.origin;
  const url = new URL(`${server.replace(/\/$/, '')}/logout`);
  if (clientId) url.searchParams.set('clientId', clientId);
  url.searchParams.set('post_logout_redirect_uri', redirect);
  return url.toString();
};

export const performLogout = (postLogoutRedirect?: string): void => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // 可选：清理可能的临时登录状态
  try {
    sessionStorage.removeItem('postLoginRedirect');
  } catch {
    //
  }
  // 返回首页
  window.location.href = '/home';
};

export interface ParsedUserInfo {
  nickname?: string;
  login?: string;
  avatar?: string;
  uid?: string;
}

export const parseCurrentUserFromToken = (): ParsedUserInfo | undefined => {
  const token = localStorage.getItem('accessToken');
  if (!token) return undefined;
  try {
    const result = casdoorSdk.parseAccessToken(token) as unknown as {
      header: Record<string, unknown>;
      payload: Record<string, unknown> & {
        name?: string;
        preferred_username?: string;
        displayName?: string;
        avatar?: string;
        sub?: string;
        email?: string;
      };
    };
    const p = result?.payload || {};
    return {
      nickname:
        (p.displayName as string) ||
        (p.name as string) ||
        (p.preferred_username as string) ||
        (p.email as string),
      login: (p.name as string) || (p.preferred_username as string),
      avatar: (p.avatar as string) || undefined,
      uid: (p.sub as string) || undefined,
    };
  } catch {
    return undefined;
  }
};
