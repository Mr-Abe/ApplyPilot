import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { TaskForm } from '@/components/tasks/task-form';

describe('TaskForm', () => {
  it('submits a normalized task payload with a default application id', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(undefined);
    const expectedDueAt = new Date('2026-04-21T09:45').toISOString();

    render(
      <TaskForm
        defaultApplicationId="application-123"
        hideApplicationField
        onSubmit={onSubmit}
        submitLabel="Create task"
      />,
    );

    await user.type(screen.getByLabelText(/^title$/i), '  Send follow-up email  ');
    await user.type(screen.getByLabelText(/description/i), '  Thank them for the interview.  ');
    await user.selectOptions(screen.getByLabelText(/priority/i), 'high');
    await user.type(screen.getByLabelText(/due date/i), '2026-04-21T09:45');

    await user.click(screen.getByRole('button', { name: /create task/i }));

    expect(onSubmit).toHaveBeenCalledWith({
      application_id: 'application-123',
      description: 'Thank them for the interview.',
      due_at: expectedDueAt,
      priority: 'high',
      status: 'open',
      title: 'Send follow-up email',
    });
  });
});
