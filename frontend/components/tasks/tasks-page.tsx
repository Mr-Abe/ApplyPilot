'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { TaskForm } from '@/components/tasks/task-form';
import { formatDateTimeLabel } from '@/lib/applications';
import {
  createTask,
  deleteTask,
  listTasks,
  taskPriorityLabel,
  taskStatusLabel,
  taskTimingFilters,
  updateTask,
  type TaskListFilters,
  type TaskMutationPayload,
  type TaskRecord,
} from '@/lib/tasks';

const initialFilters: TaskListFilters = {
  status: '',
  timing: 'all',
};

export function TasksPageContent() {
  const [filters, setFilters] = useState<TaskListFilters>(initialFilters);
  const [items, setItems] = useState<TaskRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const loadTasks = useCallback(async (nextFilters: TaskListFilters = filters) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listTasks(nextFilters);
      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load tasks.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    void loadTasks(filters);
  }, [filters, loadTasks]);

  function updateFilter<K extends keyof TaskListFilters>(field: K, value: TaskListFilters[K]) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  async function handleCreate(payload: TaskMutationPayload) {
    await createTask(payload);
    setSuccessMessage('Task created successfully.');
    await loadTasks();
  }

  async function handleUpdate(taskId: string, payload: TaskMutationPayload) {
    await updateTask(taskId, payload);
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

  async function handleDelete(taskId: string) {
    setErrorMessage(null);

    try {
      await deleteTask(taskId);
      setSuccessMessage('Task deleted successfully.');
      await loadTasks();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete the task.');
    }
  }

  return (
    <div className="page-stack">
      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <section className="card form-card">
        <h2>Add follow-up task</h2>
        <p className="section-copy">Capture next steps, due dates, and priority for active applications.</p>
        <TaskForm onSubmit={handleCreate} submitLabel="Create task" />
      </section>

      <section className="card applications-filter-card">
        <div className="form-grid form-grid--filters">
          <label className="field">
            <span>Status</span>
            <select onChange={(event) => updateFilter('status', event.target.value as TaskListFilters['status'])} value={filters.status ?? ''}>
              <option value="">All statuses</option>
              <option value="open">Open</option>
              <option value="completed">Completed</option>
            </select>
          </label>
          <label className="field">
            <span>Timing</span>
            <select onChange={(event) => updateFilter('timing', event.target.value as TaskListFilters['timing'])} value={filters.timing}>
              {taskTimingFilters.map((timing) => (
                <option key={timing} value={timing}>
                  {timing}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="card resource-list-card">
        <div className="resource-list-card__header">
          <h2>{total} task{total === 1 ? '' : 's'}</h2>
        </div>

        {isLoading ? <p>Loading tasks...</p> : null}
        {!isLoading && !errorMessage && items.length === 0 ? (
          <div className="empty-state">
            <p>No tasks match the current filters.</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && items.length > 0 ? (
          <div className="resource-list">
            {items.map((task) => (
              <article className="resource-card" key={task.id}>
                <div className="resource-card__header">
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      <span className={`status-badge status-badge--${task.status}`}>{taskStatusLabel(task.status)}</span>
                      <span className={`priority-badge priority-badge--${task.priority}`}>{taskPriorityLabel(task.priority)}</span>
                    </p>
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
                    <button className="button button--small" onClick={() => void handleDelete(task.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="resource-card__meta">
                  <p><strong>Due:</strong> {formatDateTimeLabel(task.due_at)}</p>
                  <p><strong>Completed:</strong> {formatDateTimeLabel(task.completed_at)}</p>
                  <p>
                    <strong>Application:</strong>{' '}
                    {task.application_id ? <Link href={`/app/applications/${task.application_id}`}>View linked application</Link> : '—'}
                  </p>
                  <p className="resource-card__full"><strong>Description:</strong> {task.description || '—'}</p>
                </div>

                {editingId === task.id ? (
                  <div className="resource-card__edit">
                    <TaskForm initialValues={task} onSubmit={(payload) => handleUpdate(task.id, payload)} submitLabel="Save task" />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
