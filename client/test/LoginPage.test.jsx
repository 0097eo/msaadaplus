import { describe, test, expect, vi, beforeEach, it } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import LoginPage from '../src/pages/LoginPage';
import { useAuth } from '../src/context/AuthContext';
import { useNavigate } from 'react-router-dom';

vi.mock('../src/context/AuthContext');
vi.mock('react-router-dom');
vi.mock('../assets/loginbg.jpg', () => 'mocked-image-path');

describe('LoginPage', () => {
    const mockNavigate = vi.fn();
    const mockLogin = vi.fn();
    
    beforeEach(() => {
        vi.clearAllMocks();
        useNavigate.mockReturnValue(mockNavigate);
        useAuth.mockReturnValue({
            login: mockLogin,
            error: null,
            isLoading: false,
            user: null
        });
    });

    it('renders login form', () => {
        render(<LoginPage />);
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /log in/i })).toBeInTheDocument();
        expect(screen.getByText("Don't have an account?")).toBeInTheDocument();
        expect(screen.getByText("Register")).toBeInTheDocument();
    });

    // Form Interaction Tests
    it('handles form submission with valid credentials', async () => {
        mockLogin.mockResolvedValueOnce();
        render(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        const submitButton = screen.getByRole('button', { name: /log in/i });

        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { value: 'password123' } });
        fireEvent.click(submitButton);

        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockLogin).toHaveBeenCalledTimes(1);
    });

    it('toggles password visibility', () => {
        render(<LoginPage />);
        
        const passwordInput = screen.getByLabelText(/password/i);
        const toggleButton = screen.getByRole('button', { name: '' });

        expect(passwordInput.type).toBe('password');
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');
        fireEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });
    

    test.each([
        ['donor', '/charities'],
        ['charity', '/profile'],
        ['admin', '/applications'],
        ['unknown', '/']
    ])('redirects %s to correct path', (userType, expectedPath) => {
        useAuth.mockReturnValue({
            login: mockLogin,
            error: null,
            isLoading: false,
            user: { userType }
        });

        render(<LoginPage />);
        expect(mockNavigate).toHaveBeenCalledWith(expectedPath);
    });

    
    it('requires email and password fields', () => {
        render(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email/i);
        const passwordInput = screen.getByLabelText(/password/i);
        
        expect(emailInput).toBeRequired();
        expect(passwordInput).toBeRequired();
    });

    it('validates email format', () => {
        render(<LoginPage />);
        
        const emailInput = screen.getByLabelText(/email/i);
        
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
        fireEvent.blur(emailInput);
        
        expect(emailInput).toBeInvalid();
        
        fireEvent.change(emailInput, { target: { value: 'valid@email.com' } });
        fireEvent.blur(emailInput);
        
        expect(emailInput).toBeValid();
    });

    
    it('displays different types of error messages', () => {
        const errorMessage = 'Invalid credentials';
        useAuth.mockReturnValue({
            login: mockLogin,
            error: errorMessage,
            isLoading: false,
            user: null
        });

        render(<LoginPage />);
        
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
        expect(screen.getByText('Error')).toBeInTheDocument();
    });

});