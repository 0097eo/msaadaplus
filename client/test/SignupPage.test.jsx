import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SignupPage from '../src/pages/SignupPage';
import userEvent from '@testing-library/user-event';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

describe('SignupPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        render(
            <BrowserRouter>
                <SignupPage />
            </BrowserRouter>
        );
    });

    it('renders signup form', () => {
        expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/user type/i)).toBeInTheDocument();
    });

    it('toggles password visibility', async () => {
        const passwordInput = screen.getByLabelText(/password/i);
        expect(passwordInput.type).toBe('password');

        const toggleButton = screen.getByRole('button', { name: '' });
        await userEvent.click(toggleButton);
        expect(passwordInput.type).toBe('text');

        await userEvent.click(toggleButton);
        expect(passwordInput.type).toBe('password');
    });

    it('shows donor fields when donor type is selected', async () => {
        const select = screen.getByLabelText(/user type/i);
        await userEvent.selectOptions(select, 'donor');

        expect(screen.getByLabelText(/full name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/phone/i)).toBeInTheDocument();
    });

    it('shows charity fields when charity type is selected', async () => {
        const select = screen.getByLabelText(/user type/i);
        await userEvent.selectOptions(select, 'charity');

        expect(screen.getByLabelText(/charity name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/registration number/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contact email/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/contact phone/i)).toBeInTheDocument();
    });

    it('handles successful form submission for donor', async () => {
        global.fetch = vi.fn(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ message: 'Success' })
            })
        );

        await userEvent.type(screen.getByLabelText(/username/i), 'testuser');
        await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
        await userEvent.type(screen.getByLabelText(/password/i), 'password123');
        await userEvent.selectOptions(screen.getByLabelText(/user type/i), 'donor');
        await userEvent.type(screen.getByLabelText(/full name/i), 'Test User');
        await userEvent.type(screen.getByLabelText(/phone/i), '1234567890');

        const submitButton = screen.getByRole('button', { name: /sign up/i });
        await userEvent.click(submitButton);

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/verify');
        });
    });
  
})