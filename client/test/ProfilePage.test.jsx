import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import ProfilePage from '../src/pages/ProfilePage';
import { useAuth } from '../src/context/AuthContext';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

describe('ProfilePage', () => {
    const mockAuthFetch = vi.fn();
    const mockDonorData = {
        profile: {
            username: 'testuser',
            full_name: 'Test User',
            email: 'test@example.com',
            phone: '1234567890'
        },
        profile_type: 'donor',
        donations: [
            {
                id: 1,
                amount: 1000,
                payment_status: 'completed',
                created_at: '2023-01-01',
                charity_name: 'Test Charity'
            }
        ],
        recurring_donations: [
            {
                id: 1,
                charity_name: 'Test Charity',
                amount: 500,
                frequency: 'monthly',
                next_donation_date: '2023-02-01',
                is_active: true
            }
        ]
    };

    beforeEach(() => {
        useAuth.mockReturnValue({ authFetch: mockAuthFetch });
    });

    it('shows loading state initially', async () => {
        mockAuthFetch.mockImplementation(() => 
            new Promise(resolve => setTimeout(() => {
                resolve({
                    ok: true,
                    json: () => Promise.resolve(mockDonorData)
                });
            }, 0))
        );

        await act(async () => {
            render(<ProfilePage />);
        });

        expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('displays error message when fetch fails', async () => {
        const errorMessage = 'Failed to fetch profile';
        mockAuthFetch.mockImplementation(() => 
            Promise.resolve({
                ok: false,
                json: () => Promise.resolve({ error: errorMessage })
            })
        );

        await act(async () => {
            render(<ProfilePage />);
        });

        await waitFor(() => {
            expect(screen.getByText(`Error: ${errorMessage}`)).toBeInTheDocument();
        });
    });

    it('renders donor profile correctly', async () => {
        mockAuthFetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockDonorData)
            })
        );

        await act(async () => {
            render(<ProfilePage />);
        });

        await waitFor(() => {
            expect(screen.getByText(`Hello, ${mockDonorData.profile.username}`)).toBeInTheDocument();
            expect(screen.getByText('Personal Information')).toBeInTheDocument();
            expect(screen.getByText('One-Time Donations')).toBeInTheDocument();
            expect(screen.getByText('Recurring Donations')).toBeInTheDocument();
        });
    });

    it('calculates and displays total donations correctly', async () => {
        mockAuthFetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockDonorData)
            })
        );

        await act(async () => {
            render(<ProfilePage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Ksh 1,000')).toBeInTheDocument();
            expect(screen.getByText('From 1 completed donations')).toBeInTheDocument();
        });
    });

    it('renders charity profile correctly', async () => {
        const mockCharityData = {
            ...mockDonorData,
            profile_type: 'charity',
            profile: {
                name: 'Test Charity',
                registration_number: 'CH123',
                contact_email: 'charity@example.com',
                contact_phone: '1234567890',
                description: 'Test description'
            },
            beneficiaries: [],
            stories: []
        };

        mockAuthFetch.mockImplementation(() => 
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve(mockCharityData)
            })
        );

        await act(async () => {
            render(<ProfilePage />);
        });

        await waitFor(() => {
            expect(screen.getByText('Charity Information')).toBeInTheDocument();
            expect(screen.getByText('Beneficiaries')).toBeInTheDocument();
            expect(screen.getByText('Stories')).toBeInTheDocument();
            expect(screen.getByText('Received Donations')).toBeInTheDocument();
        });
    });
});