import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Footer from '../src/components/Footer';

describe('Footer', () => {
    const renderFooter = () => {
        return render(
            <BrowserRouter>
                <Footer />
            </BrowserRouter>
        );
    };

    it('renders the logo text correctly', () => {
        renderFooter();
        expect(screen.getByText('Msaada')).toBeInTheDocument();
        expect(screen.getByText('Plus')).toBeInTheDocument();
    });

    it('renders contact information', () => {
        renderFooter();
        expect(screen.getByText('contact@msaadaplus.org')).toBeInTheDocument();
        expect(screen.getByText('+254 700 000000')).toBeInTheDocument();
        expect(screen.getByText('Nairobi, Kenya')).toBeInTheDocument();
    });

    it('renders quick links section with correct links', () => {
        renderFooter();
        expect(screen.getByText('Quick Links')).toBeInTheDocument();
        expect(screen.getByText('About Us')).toBeInTheDocument();
        expect(screen.getByText('Find Charities')).toBeInTheDocument();
        expect(screen.getByText('FAQs')).toBeInTheDocument();
    });

    it('renders charity resources section with correct links', () => {
        renderFooter();
        expect(screen.getByText('For Charities')).toBeInTheDocument();
        expect(screen.getByText('Apply as Charity')).toBeInTheDocument();
        expect(screen.getByText('Charity Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Success Stories')).toBeInTheDocument();
        expect(screen.getByText('Resource Center')).toBeInTheDocument();
    });

    it('renders newsletter signup section', () => {
        renderFooter();
        expect(screen.getByText('Stay Updated')).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Enter your email')).toBeInTheDocument();
        expect(screen.getByText('Subscribe')).toBeInTheDocument();
    });

    it('renders social media links', () => {
        renderFooter();
        const socialLinks = screen.getAllByRole('link').filter(link => link.getAttribute('href') === '#');
        expect(socialLinks).toHaveLength(4); // Facebook, Twitter, Instagram, LinkedIn
    });

    it('renders copyright notice with current year', () => {
        renderFooter();
        const currentYear = new Date().getFullYear();
        expect(screen.getByText(`© ${currentYear} MsaadaPlus. All rights reserved.`)).toBeInTheDocument();
    });
});