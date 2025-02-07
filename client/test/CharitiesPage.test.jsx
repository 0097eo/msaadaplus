import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CharitiesPage from '../src/pages/CharitiesPage';
import { useAuth } from '../src/context/AuthContext';

// Mock the AuthContext
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));


// Mock lucide-react icons
vi.mock('lucide-react', () => ({
    Search: () => <div>Search Icon</div>,
    X: () => <div>X Icon</div>,
    ChevronDown: () => <div>ChevronDown Icon</div>,
    ChevronLeft: () => <div>ChevronLeft Icon</div>,
    ChevronRight: () => <div>ChevronRight Icon</div>,
    Loader: () => <div>Loader Icon</div>
}));

describe('CharitiesPage', () => {
    const mockAuthFetch = vi.fn();
    const mockCharities = [
        {
            id: 1,
            name: 'Test Charity 1',
            description: 'Test Description 1',
            total_donations: 1000,
            donor_count: 10,
            beneficiary_count: 20
        },
        {
            id: 2, 
            name: 'Test Charity 2',
            description: 'Test Description 2',
            total_donations: 2000,
            donor_count: 20,
            beneficiary_count: 40
        }
    ];

    beforeEach(() => {
        useAuth.mockReturnValue({
            authFetch: mockAuthFetch,
            isAuthenticated: true,
            user: { userId: 1 }
        });

        mockAuthFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({
                charities: mockCharities,
                pagination: { has_prev: false, has_next: true }
            })
        });
    });

    it('renders the search input', () => {
        render(<CharitiesPage />);
        expect(screen.getByPlaceholderText('Search charities...')).toBeInTheDocument();
    });

    it('renders the status filter dropdown', async () => {
        render(<CharitiesPage />);
        const filterButton = screen.getByText('Filter by status');
        fireEvent.click(filterButton);
        
        expect(screen.getByText('All')).toBeInTheDocument();
        expect(screen.getByText('PENDING')).toBeInTheDocument();
        expect(screen.getByText('APPROVED')).toBeInTheDocument();
        expect(screen.getByText('REJECTED')).toBeInTheDocument();
    });

    it('fetches and displays charities', async () => {
        render(<CharitiesPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Charity 1')).toBeInTheDocument();
            expect(screen.getByText('Test Charity 2')).toBeInTheDocument();
        });
    });

    it('handles search input change', async () => {
        render(<CharitiesPage />);
        
        const searchInput = screen.getByPlaceholderText('Search charities...');
        fireEvent.change(searchInput, { target: { value: 'test search' } });

        await waitFor(() => {
            expect(searchInput.value).toBe('test search');
        });
    });

    it('handles charity details modal', async () => {
        mockAuthFetch.mockImplementation((url) => {
            if (url.includes('/api/charity/')) {
                return {
                    ok: true,
                    json: () => Promise.resolve({
                        id: 1,
                        name: 'Test Charity Details',
                        description: 'Detailed description',
                        contact_email: 'test@example.com',
                        contact_phone: '1234567890',
                        registration_number: 'REG123'
                    })
                };
            }
            return {
                ok: true,
                json: () => Promise.resolve({
                    charities: mockCharities,
                    pagination: { has_prev: false, has_next: true }
                })
            };
        });

        render(<CharitiesPage />);

        await waitFor(() => {
            const learnMoreButtons = screen.getAllByText('Learn More');
            fireEvent.click(learnMoreButtons[0]);
        });

        await waitFor(() => {
            expect(screen.getByText('Test Charity Details')).toBeInTheDocument();
            expect(screen.getByText('Contact Information')).toBeInTheDocument();
        });
    });

    it('handles donation submission', async () => {
        mockAuthFetch.mockImplementation((url) => {
            if (url === '/api/donation') {
                return {
                    ok: true,
                    json: () => Promise.resolve({ message: 'Success' })
                };
            }
            return {
                ok: true,
                json: () => Promise.resolve({
                    charities: mockCharities,
                    pagination: { has_prev: false, has_next: true }
                })
            };
        });

        render(<CharitiesPage />);

        await waitFor(() => {
            const learnMoreButtons = screen.getAllByText('Learn More');
            fireEvent.click(learnMoreButtons[0]);
        });

        const amountInput = await screen.findByPlaceholderText('Enter amount');
        fireEvent.change(amountInput, { target: { value: '100' } });
        
        const donateButton = screen.getByText('Donate via M-Pesa');
        fireEvent.click(donateButton);

        await waitFor(() => {
            expect(screen.getByText('Donation initiated. Please check your phone for M-Pesa prompt.')).toBeInTheDocument();
        });
    });
});