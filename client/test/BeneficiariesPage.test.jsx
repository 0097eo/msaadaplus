import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react'
import BeneficiariesPage from '../src/pages/BeneficiariesPage';
import { useAuth } from '../src/context/AuthContext';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));


describe('BeneficiariesPage', () => {
    const mockAuthFetch = vi.fn();
    const mockProfileData = {
        profile_type: 'charity',
        donations: [
            { payment_status: 'completed', amount: 1000 },
            { payment_status: 'completed', amount: 2000 },
            { payment_status: 'pending', amount: 500 }
        ],
        beneficiaries: [
            { id: 1, name: 'John Doe', age: 10, school: 'ABC School', location: 'Nairobi' }
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
            render(<BeneficiariesPage />);
        });
    
        // findByRole(instead of getByRole) properly waits for the status indicator
        expect(await screen.findByRole('status')).toBeInTheDocument();
    });
    

    it('displays error message when API call fails', async () => {
        const errorMessage = 'Failed to fetch profile';
        mockAuthFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: errorMessage })
        });

        await act(async () => {
            render(<BeneficiariesPage />);
        });

        await waitFor(() => {
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        });
    });

    it('renders charity profile with correct donation summary and beneficiaries', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve(mockProfileData)
        });

        await act(async () => {
            render(<BeneficiariesPage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Ksh 3,000')).toBeInTheDocument();
            expect(screen.getByText('John Doe')).toBeInTheDocument();
            expect(screen.getByText('Age: 10')).toBeInTheDocument();
            expect(screen.getByText('School: ABC School')).toBeInTheDocument();
            expect(screen.getByText('Location: Nairobi')).toBeInTheDocument();
        });
    });

    it('does not render charity profile for non-charity profile type', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ ...mockProfileData, profile_type: 'donor' })
        });

        await act(async () => {
            render(<BeneficiariesPage />);
        });

        await waitFor(() => {
            expect(screen.queryByText('Total Help Given')).not.toBeInTheDocument();
        });
    });
});
