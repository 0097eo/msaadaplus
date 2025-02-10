import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import EmailVerificationPage from '../src/pages/VerifyEmailPage';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock sessionStorage
const mockSessionStorage = {
    getItem: vi.fn(),
};
global.sessionStorage = mockSessionStorage;

// Mock navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

describe('EmailVerificationPage', () => {
    beforeEach(() => {
        mockFetch.mockClear();
        mockNavigate.mockClear();
        mockSessionStorage.getItem.mockClear();
    });

    it('renders email verification form', () => {
        render(
            <BrowserRouter>
                <EmailVerificationPage />
            </BrowserRouter>
        );

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/verification code/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /verify email/i })).toBeInTheDocument();
    });

    it('handles successful verification', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Success' }),
        });

        render(
            <BrowserRouter>
                <EmailVerificationPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/verification code/i), {
            target: { value: '123456' },
        });
        fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/login');
        });
    });

    it('handles verification error', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: 'Invalid code' }),
        });

        render(
            <BrowserRouter>
                <EmailVerificationPage />
            </BrowserRouter>
        );

        fireEvent.change(screen.getByLabelText(/email/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.change(screen.getByLabelText(/verification code/i), {
            target: { value: 'wrong' },
        });
        fireEvent.click(screen.getByRole('button', { name: /verify email/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid code')).toBeInTheDocument();
        });
    });

    it('handles resend verification code', async () => {
        mockFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ message: 'Resent' }),
        });

        render(
            <BrowserRouter>
                <EmailVerificationPage />
            </BrowserRouter>
        );

        fireEvent.click(screen.getByRole('button', { name: /resend code/i }));

        await waitFor(() => {
            expect(screen.getByText('Verification email resent successfully')).toBeInTheDocument();
        });
    });

});