import { useCallback, useState } from 'react';
import http from '@/utils/http';
import { login, logOutAPI, queryCurrentUser } from '@/services/login';
import type { CheckAccountParams } from '@/services/login';
import type { User } from '@/store/user-store';

interface LoginState {
  loading: boolean;
  error: string | null;
}

interface TokenStorage {
  getAccessToken: () => string | null;
  getRefreshToken: () => string | null;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clearTokens: () => void;
  isAccessTokenExpired: () => boolean;
  isRefreshTokenExpired: () => boolean;
}

// 简化的 token 存储管理
export const tokenStorage: TokenStorage = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),

  setTokens: tokens => {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  },

  clearTokens: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  },

  isAccessTokenExpired: () => {
    const token = localStorage.getItem('accessToken');
    if (!token) return true;

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1] || ''));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },

  isRefreshTokenExpired: () => {
    const token = localStorage.getItem('refreshToken');
    if (!token) return true;

    try {
      const payload = JSON.parse(window.atob(token.split('.')[1] || ''));
      return Date.now() >= payload.exp * 1000;
    } catch {
      return true;
    }
  },
};

const useLogin = (): {
  loading: boolean;
  error: string | null;
  login: (credentials: CheckAccountParams) => Promise<unknown>;
  logout: () => Promise<void>;
  getUserInfo: () => Promise<User>;
  refreshToken: () => Promise<boolean>;
  tokenStorage: TokenStorage;
} => {
  const [state, setState] = useState<LoginState>({
    loading: false,
    error: null,
  });

  const setLoading = (loading: boolean): void => {
    setState(prev => ({ ...prev, loading }));
  };

  const setError = (error: string | null): void => {
    setState(prev => ({ ...prev, error }));
  };

  // 登录
  const loginUser = useCallback(async (credentials: CheckAccountParams) => {
    setLoading(true);
    setError(null);

    try {
      const response = await login(credentials);

      if (response.data?.accessToken && response.data?.refreshToken) {
        tokenStorage.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 登出
  const logoutUser = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await logOutAPI();
      tokenStorage.clearTokens();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Logout failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 获取用户信息
  const getUserInfo = useCallback(async (): Promise<User> => {
    setLoading(true);
    setError(null);

    try {
      return await queryCurrentUser();
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get user info';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // 刷新 token
  const refreshToken = useCallback(async (): Promise<boolean> => {
    const refreshTokenValue = tokenStorage.getRefreshToken();

    if (!refreshTokenValue || tokenStorage.isRefreshTokenExpired()) {
      tokenStorage.clearTokens();
      return false;
    }

    try {
      const response = await http.post('/api/auth/refresh', {
        refreshToken: refreshTokenValue,
      });

      if (response.data?.accessToken && response.data?.refreshToken) {
        tokenStorage.setTokens({
          accessToken: response.data.accessToken,
          refreshToken: response.data.refreshToken,
        });
        return true;
      }

      tokenStorage.clearTokens();
      return false;
    } catch {
      tokenStorage.clearTokens();
      return false;
    }
  }, []);

  return {
    ...state,
    login: loginUser,
    logout: logoutUser,
    getUserInfo,
    refreshToken,
    tokenStorage,
  };
};

export default useLogin;
