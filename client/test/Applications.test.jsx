import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CharityApplications from '../src/pages/Applications';
import { useAuth } from '../src/context/AuthContext';

// Mock the useAuth hook
vi.mock('../src/context/AuthContext', () => ({
    useAuth: vi.fn()
}));

// Mock the lucide-react icons
vi.mock('lucide-react', () => ({
    Check: () => <span>Check</span>,
    X: () => <span>X</span>,
    Settings: () => <span>Settings</span>,
    CloseIcon: () => <span>Close</span>
}));

describe('CharityApplications', () => {
    const mockAuthFetch = vi.fn();
    const mockCharities = [
        {
            id: 1,
            name: 'Test Charity',
            registration_number: 'REG123',
            contact_email: 'test@charity.com',
            status: 'pending'
        }
    ];

    beforeEach(() => {
        useAuth.mockReturnValue({ authFetch: mockAuthFetch });
        mockAuthFetch.mockReset();
    });

    it('renders charity applications table', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ applications: mockCharities })
        });

        render(<CharityApplications />);

        await waitFor(() => {
            expect(screen.getByText('Test Charity')).toBeInTheDocument();
            expect(screen.getByText('REG123')).toBeInTheDocument();
            expect(screen.getByText('test@charity.com')).toBeInTheDocument();
        });
    });

    it('handles review button click and shows modal', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ applications: mockCharities })
        });

        render(<CharityApplications />);

        await waitFor(() => {
            const reviewButton = screen.getByText('Review');
            fireEvent.click(reviewButton);
        });

        expect(screen.getByText('Review Charity Application')).toBeInTheDocument();
    });

    it('handles approve action', async () => {
        mockAuthFetch
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ applications: mockCharities })
            })
            .mockResolvedValueOnce({
                json: () => Promise.resolve({ message: 'Approved successfully' })
            });

        render(<CharityApplications />);

        await waitFor(() => {
            const reviewButton = screen.getByText('Review');
            fireEvent.click(reviewButton);
        });

        const approveButton = screen.getByText('Approve');
        fireEvent.click(approveButton);

        await waitFor(() => {
            expect(mockAuthFetch).toHaveBeenCalledWith(
                expect.stringContaining('/review'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ action: 'approve' })
                })
            );
        });
    });

    it('handles error state', async () => {
        mockAuthFetch.mockRejectedValueOnce(new Error('Failed to fetch'));

        render(<CharityApplications />);

        await waitFor(() => {
            expect(screen.getByText('Error:')).toBeInTheDocument();
            expect(screen.getByText('Failed to fetch')).toBeInTheDocument();
        });
    });

    it('handles modal close', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            json: () => Promise.resolve({ applications: mockCharities })
        });

        render(<CharityApplications />);

        await waitFor(() => {
            const reviewButton = screen.getByText('Review');
            fireEvent.click(reviewButton);
        });

        const closeButton = screen.getByLabelText(/close/i);
        fireEvent.click(closeButton);

        expect(screen.queryByText('Review Charity Application')).not.toBeInTheDocument();
    });
});