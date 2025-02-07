import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HomePage from './HomePage';

// Mock the navigate function
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    };
});

// Mock localStorage
const mockLocalStorage = {
    getItem: vi.fn(),
};
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage });

describe('HomePage', () => {
    beforeEach(() => {
        mockNavigate.mockReset();
        mockLocalStorage.getItem.mockReset();
    });

    it('renders hero section with correct title', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.getByText('Empowering Girls Through Education')).toBeInTheDocument();
    });

    it('displays Join Us button when user is not authenticated', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.getByText('Join Us')).toBeInTheDocument();
    });

    it('hides Join Us button when user is authenticated', () => {
        mockLocalStorage.getItem.mockReturnValue('{"user": "test"}');
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.queryByText('Join Us')).not.toBeInTheDocument();
    });

    it('navigates to signup page when Join Us button is clicked', () => {
        mockLocalStorage.getItem.mockReturnValue(null);
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText('Join Us'));
        expect(mockNavigate).toHaveBeenCalledWith('/signup');
    });

    it('renders all stats correctly', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.getByText('20%')).toBeInTheDocument();
        expect(screen.getByText('School days missed')).toBeInTheDocument();
        expect(screen.getByText('1000+')).toBeInTheDocument();
        expect(screen.getByText('Girls supported')).toBeInTheDocument();
    });

    it('renders all features', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.getByText('Automated Donations')).toBeInTheDocument();
        expect(screen.getByText('Direct Impact')).toBeInTheDocument();
        expect(screen.getByText('Multiple Charities')).toBeInTheDocument();
        expect(screen.getByText('Secure Platform')).toBeInTheDocument();
    });

    it('renders featured charities section', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        expect(screen.getByText('Featured Charities')).toBeInTheDocument();
        expect(screen.getByText('Girls Dignity Initiative')).toBeInTheDocument();
        expect(screen.getByText('Pads for Tomorrow')).toBeInTheDocument();
        expect(screen.getByText('EmpowerHer Foundation')).toBeInTheDocument();
    });

    it('navigates to charities page when View All Charities is clicked', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText('View All Charities'));
        expect(mockNavigate).toHaveBeenCalledWith('/charities');
    });

    it('navigates to donate page when Start Donating is clicked', () => {
        render(
            <BrowserRouter>
                <HomePage />
            </BrowserRouter>
        );
        fireEvent.click(screen.getByText('Start Donating'));
        expect(mockNavigate).toHaveBeenCalledWith('/donate');
    });
    
});