import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddStoryModal from '../src/components/NewStory';
import { useAuth } from '../src/context/AuthContext';

// Mock useAuth hook
vi.mock('../src/context/AuthContext', () => ({
  useAuth: vi.fn()
}));

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'mocked-url');

describe('AddStoryModal', () => {
  const mockAuthFetch = vi.fn();
  const mockOnClose = vi.fn();
  
  beforeEach(() => {
    vi.clearAllMocks();
    useAuth.mockReturnValue({ authFetch: mockAuthFetch });
  });

  const renderModal = (isOpen = true) => {
    return render(
      <AddStoryModal 
        isOpen={isOpen} 
        onClose={mockOnClose}
      />
    );
  };

  it('renders nothing when isOpen is false', () => {
    renderModal(false);
    expect(screen.queryByText('Add New Story')).toBeInTheDocument();
  });

  it('renders the modal when isOpen is true', () => {
    renderModal();
    expect(screen.getByText('Add New Story')).toBeInTheDocument();
    expect(screen.getByLabelText('Title')).toBeInTheDocument();
    expect(screen.getByLabelText('Content')).toBeInTheDocument();
    expect(screen.getByText('Upload a file')).toBeInTheDocument();
  });

  it('handles form submission with text fields only', async () => {
    mockAuthFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ success: true })
    });

    renderModal();
    
    await userEvent.type(screen.getByLabelText('Title'), 'Test Story');
    await userEvent.type(screen.getByLabelText('Content'), 'Test Content');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(mockAuthFetch).toHaveBeenCalledWith('/api/stories', {
      method: 'POST',
      body: expect.any(FormData)
    });

    expect(mockOnClose).toHaveBeenCalled();
  });

  it('handles image upload successfully', async () => {
    renderModal();
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload a file/i);
    
    await userEvent.upload(input, file);

    expect(screen.getByText('test.png')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  

  it('shows error for file too large', async () => {
    renderModal();
    
    // Create a file larger than 5MB
    const largeFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload a file/i);
    
    await userEvent.upload(input, largeFile);

    expect(screen.getByText(/Invalid file type or size/)).toBeInTheDocument();
  });

  it('handles API error during submission', async () => {
    mockAuthFetch.mockRejectedValueOnce(new Error('API Error'));
    
    renderModal();
    
    await userEvent.type(screen.getByLabelText('Title'), 'Test Story');
    await userEvent.type(screen.getByLabelText('Content'), 'Test Content');
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(await screen.findByText('API Error')).toBeInTheDocument();
    expect(mockOnClose).not.toHaveBeenCalled();
  });

  it('shows loading state during submission', async () => {
    mockAuthFetch.mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    renderModal();
    
    const saveButton = screen.getByRole('button', { name: /save/i });
    await userEvent.click(saveButton);

    expect(screen.getByText('Processing...')).toBeInTheDocument();
    expect(saveButton).toBeDisabled();
    expect(screen.getByRole('button', { name: /cancel/i })).toBeDisabled();
  });

  it('allows removing uploaded image', async () => {
    renderModal();
    
    const file = new File(['test'], 'test.png', { type: 'image/png' });
    const input = screen.getByLabelText(/Upload a file/i);
    
    await userEvent.upload(input, file);
    expect(screen.getByText('test.png')).toBeInTheDocument();
    
    const removeButton = screen.getByRole('button', { name: /remove/i });
    await userEvent.click(removeButton);
    
    expect(screen.queryByText('test.png')).not.toBeInTheDocument();
    expect(screen.getByText('Upload a file')).toBeInTheDocument();
  });

  it('closes modal when cancel is clicked', async () => {
    renderModal();
    
    const cancelButton = screen.getByRole('button', { name: /cancel/i });
    await userEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
});