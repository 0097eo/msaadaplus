import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import AboutPage from '../src/pages/AboutPage';
import { useNavigate } from 'react-router-dom';

// Mock react-router-dom's useNavigate
vi.mock('react-router-dom', () => {
    return {
      useNavigate: vi.fn(),
    };
  });

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Heart: () => <div data-testid="heart-icon" />,
  Users: () => <div data-testid="users-icon" />,
  Building: () => <div data-testid="building-icon" />,
  ShieldCheck: () => <div data-testid="shield-icon" />,
  Sparkles: () => <div data-testid="sparkles-icon" />,
  Globe: () => <div data-testid="globe-icon" />
}));

describe('AboutPage', () => {
  it('renders the mission section with correct content', () => {
    render(<AboutPage />);
    
    // Check main heading
    expect(screen.getByText('Empowering Girls Through Continuous Support')).toBeInTheDocument();
    
    // Check impact stats
    const stats = [
      '20%',
      '24',
      '18+',
      '144'
    ];
    
    stats.forEach(stat => {
      expect(screen.getByText(stat)).toBeInTheDocument();
    });
  });

  it('renders the problem statement section with correct content', () => {
    render(<AboutPage />);
    
    expect(screen.getByText(/In most sub-Saharan countries/i)).toBeInTheDocument();
    expect(screen.getByText(/According to 2016 studies/i)).toBeInTheDocument();
  });

  it('renders both donor and charity sections with all steps', () => {
    render(<AboutPage />);
    
    // Check section headings
    expect(screen.getByText('For Donors')).toBeInTheDocument();
    expect(screen.getByText('For Charities')).toBeInTheDocument();
    
    // Check donor steps
    expect(screen.getByText('Browse Verified Charities')).toBeInTheDocument();
    expect(screen.getByText('Choose Your Impact')).toBeInTheDocument();
    expect(screen.getByText('Track Your Impact')).toBeInTheDocument();
    
    // Check charity steps
    expect(screen.getByText('Apply to Join')).toBeInTheDocument();
    expect(screen.getByText('Get Verified')).toBeInTheDocument();
    expect(screen.getByText('Share Your Impact')).toBeInTheDocument();
  });

  it('renders all Lucide icons correctly', () => {
    render(<AboutPage />);
    
    const icons = [
      'heart-icon',
      'users-icon',
      'building-icon',
      'shield-icon',
      'sparkles-icon',
      'globe-icon'
    ];
    
    icons.forEach(icon => {
      expect(screen.getByTestId(icon)).toBeInTheDocument();
    });
  });

  it('renders CTA section with working buttons', () => {
    const navigate = vi.fn();
    useNavigate.mockReturnValue(navigate);
    
    render(<AboutPage />);
    
    // Check buttons
    const donateButton = screen.getByText('Start Donating');
    const charityButton = screen.getByText('Apply as Charity');
    
    expect(donateButton).toBeInTheDocument();
    expect(charityButton).toBeInTheDocument();
    
    // Test button clicks
    fireEvent.click(donateButton);
    expect(navigate).toHaveBeenCalledWith('/signup');
    
    fireEvent.click(charityButton);
    expect(navigate).toHaveBeenCalledWith('/signup');
  });

  it('renders all impact statistics correctly', () => {
    render(<AboutPage />);
    
    const stats = [
      { number: '20%', label: 'School days missed annually' },
      { number: '24', label: 'Weeks of learning lost' },
      { number: '18+', label: 'Weeks lost in primary school' },
      { number: '144', label: 'Total weeks in high school' }
    ];
    
    stats.forEach(stat => {
      expect(screen.getByText(stat.number)).toBeInTheDocument();
      expect(screen.getByText(stat.label)).toBeInTheDocument();
    });
  });
});