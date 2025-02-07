import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import userEvent from '@testing-library/user-event';

describe('AuthContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('throws error when useAuth is used outside AuthProvider', () => {
        const TestComponent = () => {
            expect(() => useAuth()).toThrow('useAuth must be used within an AuthProvider');
            return null;
        };

        render(<TestComponent />);
    });

    it('provides authentication state and methods', () => {
        const TestComponent = () => {
            const auth = useAuth();
            expect(auth).toHaveProperty('user');
            expect(auth).toHaveProperty('isLoading');
            expect(auth).toHaveProperty('error');
            expect(auth).toHaveProperty('login');
            expect(auth).toHaveProperty('logout');
            expect(auth).toHaveProperty('isAuthenticated');
            expect(auth).toHaveProperty('authFetch');
            return null;
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );
    });

    it('handles login success', async () => {
        const mockUser = {
            user_id: '123',
            user_type: 'admin',
            access_token: 'token123'
        };

        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockUser)
            })
        );

        const TestComponent = () => {
            const { login } = useAuth();
            
            return (
                <button onClick={() => login('test@test.com', 'password')}>
                    Login
                </button>
            );
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        await userEvent.click(loginButton);

        await waitFor(() => {
            const storedUser = JSON.parse(localStorage.getItem('auth_user'));
            expect(storedUser).toEqual({
                userId: mockUser.user_id,
                userType: mockUser.user_type,
                accessToken: mockUser.access_token
            });
        });
    });

    it('handles login failure', async () => {
        const errorMessage = 'Invalid credentials';
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: errorMessage })
            })
        );

        const TestComponent = () => {
            const { login, error } = useAuth();
            
            const handleClick = async () => {
                try {
                    await login('test@test.com', 'wrong');
                } catch (error) {
                    // Expected error, do nothing
                }
            };
            
            return (
                <div>
                    <button onClick={handleClick}>Login</button>
                    {error && <div data-testid="error-message">{error}</div>}
                </div>
            );
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const loginButton = screen.getByText('Login');
        await userEvent.click(loginButton);

        await waitFor(() => {
            expect(screen.getByTestId('error-message')).toHaveTextContent('Invalid credentials');
            expect(localStorage.getItem('auth_user')).toBeNull();
        });
    });

    it('handles logout', async () => {
        
        const mockUser = {
            userId: '123',
            userType: 'admin',
            accessToken: 'token123'
        };
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        const TestComponent = () => {
            const { logout } = useAuth();
            
            return (
                <button onClick={logout}>Logout</button>
            );
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const logoutButton = screen.getByText('Logout');
        await userEvent.click(logoutButton);

        await waitFor(() => {
            expect(localStorage.getItem('auth_user')).toBeNull();
        });
    });

    it('handles authFetch with valid token', async () => {
        const mockUser = {
            userId: '123',
            userType: 'admin',
            accessToken: 'token123'
        };
        localStorage.setItem('auth_user', JSON.stringify(mockUser));

        global.fetch = vi.fn(() =>
            Promise.resolve({
                status: 200,
                ok: true
            })
        );

        const TestComponent = () => {
            const { authFetch } = useAuth();
            
            return (
                <button onClick={() => authFetch('/api/test')}>
                    Fetch
                </button>
            );
        };

        render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        const fetchButton = screen.getByText('Fetch');
        await userEvent.click(fetchButton);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith('/api/test', {
                headers: {
                    'Authorization': `Bearer ${mockUser.accessToken}`
                }
            });
        });
    });
});