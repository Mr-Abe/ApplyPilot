import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ContactForm } from '@/components/contacts/contact-form';

describe('ContactForm', () => {
  it('submits a normalized contact payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);

    render(<ContactForm onSubmit={onSubmit} submitLabel="Create contact" />);

    await user.type(screen.getByLabelText(/full name/i), '  Jordan Smith  ');
    await user.type(screen.getByLabelText(/company/i), '  Acme  ');
    await user.type(screen.getByLabelText(/^title$/i), '  Recruiter  ');
    await user.type(screen.getByLabelText(/email/i), '  jordan@example.com  ');
    await user.type(screen.getByLabelText(/notes/i), '  Warm outreach.  ');

    await user.click(screen.getByRole('button', { name: /create contact/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      company_name: 'Acme',
      email: 'jordan@example.com',
      full_name: 'Jordan Smith',
      linkedin_url: null,
      notes: 'Warm outreach.',
      phone: null,
      title: 'Recruiter',
    });
  });
});
