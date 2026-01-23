import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface User {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  userType: 'user' | 'admin' | 'superadmin';
  districtId?: number;
  role?: number;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Load initial state from localStorage
const loadAuthFromStorage = (): AuthState => {
  try {
    const token = localStorage.getItem('authToken');
    const userStr = localStorage.getItem('user');
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (token && userStr) {
      return {
        token,
        refreshToken,
        user: JSON.parse(userStr),
        isAuthenticated: true,
        isLoading: false,
      };
    }
  } catch (error) {
    console.error('Error loading auth from storage:', error);
  }
  
  return {
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
    isLoading: false,
  };
};

const initialState: AuthState = loadAuthFromStorage();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user: User;
        token: string;
        refreshToken?: string;
      }>
    ) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.refreshToken = action.payload.refreshToken || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      
      // Persist to localStorage
      localStorage.setItem('authToken', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      if (action.payload.refreshToken) {
        localStorage.setItem('refreshToken', action.payload.refreshToken);
      }
    },
    
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      
      // Clear localStorage
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('refreshToken');
    },
    
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
  },
});

export const { setCredentials, logout, setLoading } = authSlice.actions;
export default authSlice.reducer;