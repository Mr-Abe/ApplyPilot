import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { ApplicationForm } from '@/components/applications/application-form';

describe('ApplicationForm', () => {
  it('submits a normalized application payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const expectedNextActionDueAt = new Date('2026-04-20T15:30').toISOString();

    render(<ApplicationForm onSubmit={onSubmit} submitLabel="Create application" />);

    await user.type(screen.getByLabelText(/company name/i), '  Acme  ');
    await user.type(screen.getByLabelText(/job title/i), '  Backend Engineer  ');
    await user.type(screen.getByLabelText(/location/i), ' Remote ');
    await user.type(screen.getByLabelText(/salary min/i), '100000');
    await user.type(screen.getByLabelText(/salary max/i), '140000');
    await user.type(screen.getByLabelText(/^next action$/i), '  Follow up with recruiter  ');
    await user.type(screen.getByLabelText(/next action due/i), '2026-04-20T15:30');

    await user.click(screen.getByRole('button', { name: /create application/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      company_name: 'Acme',
      cover_letter_version: null,
      date_applied: null,
      date_found: null,
      job_title: 'Backend Engineer',
      location: 'Remote',
      next_action: 'Follow up with recruiter',
      next_action_due_at: expectedNextActionDueAt,
      notes_summary: null,
      posting_url: null,
      resume_version: null,
      salary_max: 140000,
      salary_min: 100000,
      source: null,
      status: 'wishlist',
      work_type: null,
    });
  });
});
