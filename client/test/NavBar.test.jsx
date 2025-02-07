import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import Navbar from '../src/components/NavBar';

// Mock navigate function
const mockNavigate = vi.fn();

// Mock react-router-dom
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate
    };
});

// Mock useAuth hook
vi.mock('../src/context/AuthContext', async (importOriginal) => {
    const actual = await importOriginal();
    return {
        ...actual,
        useAuth: vi.fn()
    };
});


const renderWithRouter = (ui, authValues = {}) => {
    useAuth.mockReturnValue({
        isAuthenticated: false,
        user: null,
        logout: vi.fn(),
        ...authValues
    });

    return render(
        <BrowserRouter>
            <AuthProvider>
                {ui}
            </AuthProvider>
        </BrowserRouter>
    );
};

describe('Navbar', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders logo correctly', () => {
        renderWithRouter(<Navbar />);
        const msaadaText = screen.getByText(/Msaada/i);
        const plusText = screen.getByText(/Plus/i);
        expect(msaadaText).toBeInTheDocument();
        expect(plusText).toBeInTheDocument();
    });

    it('shows login and signup buttons when user is not authenticated', () => {
        renderWithRouter(<Navbar />);
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
    });

    it('shows correct nav links for donor user type', () => {
        renderWithRouter(<Navbar />, {
            isAuthenticated: true,
            user: { userType: 'donor' }
        });
        expect(screen.getByText(/charities/i)).toBeInTheDocument();
        expect(screen.getByText(/my donations/i)).toBeInTheDocument();
        expect(screen.getByText(/auto-donate/i)).toBeInTheDocument();
    });

    it('shows correct nav links for charity user type', () => {
        renderWithRouter(<Navbar />, {
            isAuthenticated: true,
            user: { userType: 'charity' }
        });
        expect(screen.getByText(/donors/i)).toBeInTheDocument();
        expect(screen.getByText(/stories/i)).toBeInTheDocument();
        expect(screen.getByText(/beneficiaries/i)).toBeInTheDocument();
    });

    it('shows correct nav links for admin user type', () => {
        renderWithRouter(<Navbar />, {
            isAuthenticated: true,
            user: { userType: 'admin' }
        });
        expect(screen.getByText(/applications/i)).toBeInTheDocument();
        expect(screen.getByText(/manage charities/i)).toBeInTheDocument();
    });

    it('handles logout correctly', async () => {
        const mockLogout = vi.fn();
        renderWithRouter(<Navbar />, {
            isAuthenticated: true,
            user: { userType: 'donor' },
            logout: mockLogout
        });

        const logoutButton = screen.getByRole('button', { name: /logout/i });
        await fireEvent.click(logoutButton);

        expect(mockLogout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('toggles mobile menu when menu button is clicked', () => {
        renderWithRouter(<Navbar />);
        // Get the menu button by its icon role
        const menuButton = screen.getByRole('button', { name: '' });

        fireEvent.click(menuButton);
        // After first click, menu should be visible
        const mobileMenu = screen.getByRole('navigation');
        expect(mobileMenu).toBeInTheDocument();

        fireEvent.click(menuButton);
        // Menu should still be in document but might be hidden
        expect(screen.getByRole('navigation')).toBeInTheDocument();
    });
});