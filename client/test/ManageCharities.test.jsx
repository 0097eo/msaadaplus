import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ManageCharityPage from '../src/pages/ManageCharities';

const mockAuthFetch = vi.fn();

// Mock the entire AuthContext module
vi.mock('../src/context/AuthContext', () => ({
    useAuth: () => ({
        user: {
            userId: '123',
            userType: 'admin',
            accessToken: 'mock-token'
        },
        isAuthenticated: true,
        authFetch: mockAuthFetch
    })
}));

describe('ManageCharityPage', () => {
    const mockCharities = [
        {
            id: 1,
            name: 'Test Charity 1',
            description: 'Test Description 1'
        },
        {
            id: 2, 
            name: 'Test Charity 2',
            description: 'Test Description 2'
        }
    ];

    const mockPagination = {
        has_prev: false,
        has_next: true
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockAuthFetch.mockReset();
        // Set up default successful response for initial fetch
        mockAuthFetch.mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ charities: [], pagination: { has_prev: false, has_next: false } })
        });
    });

    test('renders search input', () => {
        render(<ManageCharityPage />);
        expect(screen.getByPlaceholderText('Search charities...')).toBeInTheDocument();
    });

    test('displays charities when fetched successfully', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ charities: mockCharities, pagination: mockPagination })
        });

        render(<ManageCharityPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Charity 1')).toBeInTheDocument();
            expect(screen.getByText('Test Charity 2')).toBeInTheDocument();
        });
    });

    test('shows error message when fetch fails', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            ok: false,
            json: () => Promise.resolve({ error: 'Failed to fetch charities' })
        });

        render(<ManageCharityPage />);

        await waitFor(() => {
            expect(screen.getByText('Failed to fetch charities')).toBeInTheDocument();
        });
    });

    test('handles search input change', async () => {
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ charities: [], pagination: { has_prev: false, has_next: false } })
        });

        render(<ManageCharityPage />);

        const searchInput = screen.getByPlaceholderText('Search charities...');
        fireEvent.change(searchInput, { target: { value: 'test search' }});
        
        expect(searchInput.value).toBe('test search');

        await waitFor(() => {
            expect(mockAuthFetch).toHaveBeenCalledWith(
                '/api/charities?page=1&per_page=10&search=test+search'
            );
        });
    });

    test('handles pagination', async () => {
        // Mock initial load
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ charities: mockCharities, pagination: mockPagination })
        });

        // Mock response for next page
        mockAuthFetch.mockResolvedValueOnce({
            ok: true,
            json: () => Promise.resolve({ charities: mockCharities, pagination: mockPagination })
        });

        render(<ManageCharityPage />);

        await waitFor(() => {
            expect(screen.getByText('Next')).toBeInTheDocument();
            expect(screen.getByText('Previous')).toBeInTheDocument();
        });

        const nextButton = screen.getByText('Next');
        fireEvent.click(nextButton);

        await waitFor(() => {
            expect(mockAuthFetch).toHaveBeenCalledWith(
                '/api/charities?page=2&per_page=10&search='
            );
        });
    });

    test('handles charity deletion', async () => {
        mockAuthFetch
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ charities: mockCharities, pagination: mockPagination })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ 
                    id: 1,
                    name: 'Test Charity 1',
                    description: 'Test Description 1',
                    contact_email: 'test@example.com',
                    contact_phone: '1234567890',
                    registration_number: 'REG123'
                })
            })
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({})
            });

        render(<ManageCharityPage />);

        await waitFor(() => {
            expect(screen.getByText('Test Charity 1')).toBeInTheDocument();
        });

        const manageButton = screen.getAllByText('Manage')[0];
        fireEvent.click(manageButton);

        await waitFor(() => {
            expect(screen.getByText('Delete Charity')).toBeInTheDocument();
        });

        const deleteButton = screen.getByText('Delete Charity');
        fireEvent.click(deleteButton);

        const confirmDeleteButton = screen.getByText('Confirm Delete');
        fireEvent.click(confirmDeleteButton);

        await waitFor(() => {
            expect(mockAuthFetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/charity/1'),
                expect.objectContaining({ method: 'DELETE' })
            );
        });
    });
});