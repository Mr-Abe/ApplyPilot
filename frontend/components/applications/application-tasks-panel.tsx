'use client';

import { useCallback, useEffect, useState } from 'react';

import { TaskForm } from '@/components/tasks/task-form';
import { formatDateTimeLabel } from '@/lib/applications';
import { createTask, listTasks, taskPriorityLabel, updateTask, type TaskMutationPayload, type TaskRecord } from '@/lib/tasks';

interface ApplicationTasksPanelProps {
  applicationId: string;
}

export function ApplicationTasksPanel({ applicationId }: ApplicationTasksPanelProps) {
  const [items, setItems] = useState<TaskRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadTasks = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listTasks({ applicationId });
      setItems(response.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load tasks for this application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadTasks();
  }, [loadTasks]);

  async function handleCreate(payload: TaskMutationPayload) {
    await createTask({ ...payload, application_id: applicationId });
    setSuccessMessage('Task added successfully.');
    await loadTasks();
  }

  async function handleUpdate(taskId: string, payload: TaskMutationPayload) {
    await updateTask(taskId, { ...payload, application_id: applicationId });
    setEditingId(null);
    setSuccessMessage('Task updated successfully.');
    await loadTasks();
  }

  async function handleComplete(taskId: string) {
    try {
      await updateTask(taskId, { status: 'completed' });
      setSuccessMessage('Task marked complete.');
      await loadTasks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete the task.');
    }
  }

  return (
    <section className="card detail-panel">
      <div className="detail-panel__header">
        <div>
          <h2>Follow-up tasks</h2>
          <p>Track next actions tied to this application.</p>
        </div>
      </div>

      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <div className="page-stack">
        <div className="detail-subpanel">
          <h3>Current tasks</h3>
          {isLoading ? <p>Loading tasks...</p> : null}
          {!isLoading && items.length === 0 ? <p>No follow-up tasks linked yet.</p> : null}
          {!isLoading && items.length > 0 ? (
            <div className="mini-list">
              {items.map((task) => (
                <article className="mini-list__item mini-list__item--stacked" key={task.id}>
                  <div>
                    <strong>{task.title}</strong>
                    <p>{taskPriorityLabel(task.priority)} priority · Due {formatDateTimeLabel(task.due_at)}</p>
                    <p>{task.description || 'No description yet.'}</p>
                  </div>
                  <div className="resource-card__actions">
                    {task.status === 'open' ? (
                      <button className="button button--secondary button--small" onClick={() => void handleComplete(task.id)} type="button">
                        Complete
                      </button>
                    ) : null}
                    <button className="button button--secondary button--small" onClick={() => setEditingId((current) => current === task.id ? null : task.id)} type="button">
                      {editingId === task.id ? 'Cancel' : 'Edit'}
                    </button>
                  </div>

                  {editingId === task.id ? (
                    <div className="resource-card__edit">
                      <TaskForm
                        defaultApplicationId={applicationId}
                        hideApplicationField
                        initialValues={task}
                        onSubmit={(payload) => handleUpdate(task.id, payload)}
                        submitLabel="Save task"
                      />
                    </div>
                  ) : null}
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="detail-subpanel">
          <h3>Add task</h3>
          <TaskForm defaultApplicationId={applicationId} hideApplicationField onSubmit={handleCreate} submitLabel="Create task" />
        </div>
      </div>
    </section>
  );
}
