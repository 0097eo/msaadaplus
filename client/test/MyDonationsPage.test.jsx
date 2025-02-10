import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import MyDonationsPage from '../src/pages/MyDonationsPage';
import { useAuth } from '../src/context/AuthContext';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('MyDonationsPage', () => {
    const mockAuthFetch = vi.fn();
    const mockProfileData = {
        profile_type: 'donor',
        donations: [
            { 
                id: 1,
                amount: 1000,
                payment_status: 'completed',
                created_at: '2023-01-01',
                charity_name: 'Test Charity'
            },
            {
                id: 2, 
                amount: 2000,
                payment_status: 'pending',
                created_at: '2023-01-02',
                charity_name: 'Test Charity 2'
            }
        ],
        recurring_donations: [
            {
                id: 1,
                amount: 500,
                charity_name: 'Monthly Charity',
                frequency: 'monthly',
                next_donation_date: '2023-02-01',
                is_active: true
            }
        ]
    };

    beforeEach(() => {
        useAuth.mockReturnValue({ authFetch: mockAuthFetch });
    });

    it('shows loading state initially', () => {
        mockAuthFetch.mockImplementation(() => new Promise(() => {}));
        render(<MyDonationsPage />);
        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('shows error state when fetch fails', async () => {
        mockAuthFetch.mockRejectedValue(new Error('Failed to fetch'));
        render(<MyDonationsPage />);
        
        await waitFor(() => {
            expect(screen.getByText(/Error:/)).toBeInTheDocument();
        });
    });

    it('displays donation summary and tables when data loads successfully', async () => {
        mockAuthFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockProfileData)
        });

        render(<MyDonationsPage />);

        await waitFor(() => {
            // Check donation summary
            expect(screen.getByText('Total Raised')).toBeInTheDocument();
            expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
            
            // Check one-time donations table
            expect(screen.getByText('One-Time Donations')).toBeInTheDocument();
            expect(screen.getAllByRole('row')).toHaveLength(5);
            
            // Check recurring donations table
            expect(screen.getByText('Recurring Donations')).toBeInTheDocument();
            expect(screen.getByText('Monthly Charity')).toBeInTheDocument();
        });
    });

    it('calculates total donations correctly for completed payments', async () => {
        mockAuthFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve(mockProfileData)
        });

        render(<MyDonationsPage />);

        await waitFor(() => {
            // Only the completed donation (1000) should be counted
            expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
            expect(screen.getByText('From 1 completed donations')).toBeInTheDocument();
        });
    });
});