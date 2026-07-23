export const ACCESS_TOKEN_KEY = "school_fee_access_token";
export const REFRESH_TOKEN_KEY = "school_fee_refresh_token";
export const ROLE_KEY = "school_fee_role";

export const saveAuth = (access: string, refresh: string, role: string) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, access);
  localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
  localStorage.setItem(ROLE_KEY, role);
};

export const clearAuth = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(ROLE_KEY);
};

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const getRole = () => localStorage.getItem(ROLE_KEY);
