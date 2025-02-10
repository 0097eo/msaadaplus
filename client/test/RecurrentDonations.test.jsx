import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecurringDonationsPage from '../src/pages/RecurrentDonations';
import { AuthProvider } from '../src/context/AuthContext';

// Mock the auth context with a mocked hook implementation
const mockAuthFetch = vi.fn();
vi.mock('../src/context/AuthContext', () => ({
    AuthProvider: ({ children }) => children,
    useAuth: () => ({
        authFetch: mockAuthFetch,
        isAuthenticated: true,
        user: { userId: '123' }
    })
}));

describe('RecurringDonationsPage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthFetch.mockReset();
    });

    it('renders search input and filter dropdown', () => {
        render(
            <AuthProvider>
                <RecurringDonationsPage />
            </AuthProvider>
        );

        expect(screen.getByPlaceholderText('Search charities...')).toBeInTheDocument();
        expect(screen.getByText('Filter by status')).toBeInTheDocument();
    });

    it('handles search input change', async () => {
        render(
            <AuthProvider>
                <RecurringDonationsPage />
            </AuthProvider>
        );

        const searchInput = screen.getByPlaceholderText('Search charities...');
        fireEvent.change(searchInput, { target: { value: 'test charity' } });

        await waitFor(() => {
            expect(searchInput.value).toBe('test charity');
        });
    });

    it('handles status filter selection', async () => {
        render(
            <AuthProvider>
                <RecurringDonationsPage />
            </AuthProvider>
        );

        
        const filterButton = screen.getByText('Filter by status');
        fireEvent.click(filterButton);

        
        const pendingOption = await screen.findByText('PENDING');
        fireEvent.click(pendingOption);

        
        await waitFor(() => {
            expect(screen.getByText('PENDING')).toBeInTheDocument();
        });
    });

    it('displays error message when donation fails', async () => {
        mockAuthFetch.mockRejectedValueOnce(new Error('Donation failed'));

        render(
            <AuthProvider>
                <RecurringDonationsPage />
            </AuthProvider>
        );

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch charities. Please try again later.')).toBeInTheDocument();
        });
    });

    it('handles modal open and close', async () => {
        
        const mockCharities = [{
            id: '1',
            name: 'Test Charity',
            description: 'Test Description',
            total_donations: 1000,
            donor_count: 10,
            beneficiary_count: 20
        }];

        
        const mockPagination = {
            has_next: true,
            has_prev: false,
            total: 1,
            pages: 1
        };

        
        mockAuthFetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    charities: mockCharities,
                    pagination: mockPagination 
                })
            })
            
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockCharities[0])
            });

        render(
            <AuthProvider>
                <RecurringDonationsPage />
            </AuthProvider>
        );

        
        await waitFor(() => {
            expect(screen.getByText('Test Charity')).toBeInTheDocument();
        });

        
        const setupButton = screen.getByText('Setup Recurrent Donation');
        fireEvent.click(setupButton);

        
        await waitFor(() => {
            expect(screen.getByText('Make a Donation')).toBeInTheDocument();
            expect(screen.getByPlaceholderText('Enter amount')).toBeInTheDocument();
            expect(screen.getByText('Select Frequency')).toBeInTheDocument();
        });

        
        const closeButton = screen.getByRole('button', { name: /close/i });
        fireEvent.click(closeButton);

        
        await waitFor(() => {
            expect(screen.queryByText('Make a Donation')).not.toBeInTheDocument();
        });
    });
});