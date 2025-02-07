import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import DonorsPage, { DonationSummary } from '../src/pages/DonationsPage';
import { useAuth } from '../src/context/AuthContext';

// Mock the AuthContext
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('DonationSummary', () => {
    it('calculates total donations correctly', () => {
        const donations = [
            { payment_status: 'completed', amount: 1000 },
            { payment_status: 'failed', amount: 500 },
            { payment_status: 'completed', amount: 2000 }
        ];

        const mockProfileData = {
            profile_type: 'charity',
            donations
        };

        const mockAuthFetch = vi.fn().mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockProfileData)
        });

        useAuth.mockReturnValue({ authFetch: mockAuthFetch });
        
        render(<DonorsPage />);
        
        return waitFor(() => {
            expect(screen.getByText('Ksh 3,000')).toBeInTheDocument();
            expect(screen.getByText('From 2 completed donations')).toBeInTheDocument();
        });
    });
});

describe('DonorsPage', () => {
    const mockAuthFetch = vi.fn();
    const mockProfileData = {
        profile_type: 'charity',
        donations: [
            {
                id: 1,
                amount: 1000,
                payment_status: 'completed',
                donation_type: 'one-time',
                donor_name: 'John Doe',
                created_at: '2023-01-01'
            }
        ]
    };

    beforeEach(() => {
        useAuth.mockReturnValue({ authFetch: mockAuthFetch });
    });

    it('shows loading state initially', async () => {
        mockAuthFetch.mockResolvedValueOnce(
            new Promise(() => {}) // Simulates an unresolved promise (keeps it loading)
        );
    
        await act(async () => {
            render(<DonorsPage />);
        });
    
        // Use findByRole to properly wait for the status indicator
        expect(await screen.findByRole('status')).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () => {
        const errorMessage = 'Failed to fetch profile';
        
        await act(async () => {
            mockAuthFetch.mockResolvedValueOnce({
                ok: false,
                json: () => Promise.resolve({ error: errorMessage })
            });

            render(<DonorsPage />);
        });

        await waitFor(() => {
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        });
    });

    it('renders charity profile when data is loaded successfully', async () => {
        await act(async () => {
            mockAuthFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockProfileData)
            });

            render(<DonorsPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('KES 1000')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('one-time')).toBeInTheDocument();
            expect(screen.getByText('completed')).toBeInTheDocument();
        });
    });

    it('does not render charity profile for non-charity users', async () => {
        const nonCharityProfileData = {
            ...mockProfileData,
            profile_type: 'donor'
        };

        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(nonCharityProfileData)
        });

        render(<DonorsPage />);

        await waitFor(() => {
            expect(screen.queryByText('Total Raised')).not.toBeInTheDocument();
        });
    });
});