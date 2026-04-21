'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { formatDateLabel, formatDateTimeLabel, listApplications, type ApplicationRecord } from '@/lib/applications';
import {
  getDashboardOverdueTasks,
  getDashboardStatusBreakdown,
  getDashboardSummary,
  getDashboardUpcomingTasks,
  type DashboardStatusItem,
  type DashboardSummary,
  type DashboardTaskItem,
} from '@/lib/dashboard';
import { taskPriorityLabel } from '@/lib/tasks';

interface DashboardState {
  summary: DashboardSummary;
  statusItems: DashboardStatusItem[];
  overdueTasks: DashboardTaskItem[];
  overdueTotal: number;
  upcomingTasks: DashboardTaskItem[];
  upcomingTotal: number;
  recentApplications: ApplicationRecord[];
}

const emptyState: DashboardState = {
  summary: {
    active_applications: 0,
    open_tasks: 0,
    overdue_tasks: 0,
    upcoming_tasks: 0,
  },
  statusItems: [],
  overdueTasks: [],
  overdueTotal: 0,
  upcomingTasks: [],
  upcomingTotal: 0,
  recentApplications: [],
};

function statusLabel(value: DashboardStatusItem['status']): string {
  return value.replaceAll('_', ' ');
}

export function DashboardHome() {
  const [data, setData] = useState<DashboardState>(emptyState);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [summary, breakdown, overdue, upcoming, recentApplications] = await Promise.all([
        getDashboardSummary(),
        getDashboardStatusBreakdown(),
        getDashboardOverdueTasks(),
        getDashboardUpcomingTasks(),
        listApplications({ archiveState: 'active', sortBy: 'date_applied', sortOrder: 'desc' }),
      ]);

      setData({
        summary,
        statusItems: breakdown.items,
        overdueTasks: overdue.items,
        overdueTotal: overdue.total,
        upcomingTasks: upcoming.items,
        upcomingTotal: upcoming.total,
        recentApplications: recentApplications.items.slice(0, 5),
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load the dashboard.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (isLoading) {
    return (
      <div className="card empty-state">
        <p>Loading dashboard overview...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="card empty-state">
        <p className="auth-message auth-message--error">{errorMessage}</p>
        <button className="button button--small" onClick={() => void loadDashboard()} type="button">
          Retry
        </button>
      </div>
    );
  }

  const hasAnyData =
    data.summary.active_applications > 0 ||
    data.summary.open_tasks > 0 ||
    data.overdueTotal > 0 ||
    data.upcomingTotal > 0 ||
    data.recentApplications.length > 0;

  return (
    <section className="page-stack">
      <div className="dashboard-stats">
        <article className="card dashboard-stat-card">
          <p className="dashboard-stat-card__label">Active applications</p>
          <p className="dashboard-stat-card__value">{data.summary.active_applications}</p>
        </article>
        <article className="card dashboard-stat-card">
          <p className="dashboard-stat-card__label">Open tasks</p>
          <p className="dashboard-stat-card__value">{data.summary.open_tasks}</p>
        </article>
        <article className="card dashboard-stat-card dashboard-stat-card--alert">
          <p className="dashboard-stat-card__label">Overdue follow-ups</p>
          <p className="dashboard-stat-card__value">{data.summary.overdue_tasks}</p>
        </article>
        <article className="card dashboard-stat-card">
          <p className="dashboard-stat-card__label">Upcoming tasks</p>
          <p className="dashboard-stat-card__value">{data.summary.upcoming_tasks}</p>
        </article>
      </div>

      {!hasAnyData ? (
        <div className="card empty-state">
          <p>No dashboard activity yet. Add your first application to start tracking the pipeline.</p>
          <Link className="button button--small" href="/app/applications/new">
            New application
          </Link>
        </div>
      ) : null}

      <div className="dashboard-columns">
        <section className="card dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Status summary</h2>
              <p>Scan where active applications sit in the pipeline right now.</p>
            </div>
          </div>

          {data.summary.active_applications === 0 ? (
            <p className="dashboard-empty">No active applications yet.</p>
          ) : (
            <div className="dashboard-status-list">
              {data.statusItems.filter((item) => item.count > 0).map((item) => (
                <div className="dashboard-status-list__item" key={item.status}>
                  <span>{statusLabel(item.status)}</span>
                  <strong>{item.count}</strong>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="card dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Recent applications</h2>
              <p>Jump back into the opportunities you touched most recently.</p>
            </div>
            <Link href="/app/applications">View all</Link>
          </div>

          {data.recentApplications.length === 0 ? (
            <p className="dashboard-empty">No recent applications yet.</p>
          ) : (
            <div className="dashboard-list">
              {data.recentApplications.map((application) => (
                <article className="dashboard-list__item" key={application.id}>
                  <div>
                    <h3>{application.company_name}</h3>
                    <p>{application.job_title}</p>
                    <p className="dashboard-list__meta">Applied {formatDateLabel(application.date_applied)}</p>
                  </div>
                  <Link href={`/app/applications/${application.id}`}>Open</Link>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>

      <div className="dashboard-columns">
        <section className="card dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Overdue follow-ups</h2>
              <p>These tasks need attention first.</p>
            </div>
            {data.overdueTotal > data.overdueTasks.length ? <span>{data.overdueTotal} total</span> : null}
          </div>

          {data.overdueTasks.length === 0 ? (
            <p className="dashboard-empty">No overdue tasks right now.</p>
          ) : (
            <div className="dashboard-list">
              {data.overdueTasks.map((task) => (
                <article className="dashboard-list__item" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {task.application_id ? (
                        <Link href={`/app/applications/${task.application_id}`}>
                          {task.application_company_name || 'Linked application'}
                          {task.application_job_title ? ` · ${task.application_job_title}` : ''}
                        </Link>
                      ) : (
                        'General task'
                      )}
                    </p>
                    <p className="dashboard-list__meta">
                      Due {formatDateTimeLabel(task.due_at)} · {taskPriorityLabel(task.priority)} priority
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="card dashboard-panel">
          <div className="dashboard-panel__header">
            <div>
              <h2>Upcoming tasks</h2>
              <p>Keep the next few follow-ups in view.</p>
            </div>
            {data.upcomingTotal > data.upcomingTasks.length ? <span>{data.upcomingTotal} total</span> : null}
          </div>

          {data.upcomingTasks.length === 0 ? (
            <p className="dashboard-empty">No upcoming tasks scheduled yet.</p>
          ) : (
            <div className="dashboard-list">
              {data.upcomingTasks.map((task) => (
                <article className="dashboard-list__item" key={task.id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {task.application_id ? (
                        <Link href={`/app/applications/${task.application_id}`}>
                          {task.application_company_name || 'Linked application'}
                          {task.application_job_title ? ` · ${task.application_job_title}` : ''}
                        </Link>
                      ) : (
                        'General task'
                      )}
                    </p>
                    <p className="dashboard-list__meta">
                      Due {formatDateTimeLabel(task.due_at)} · {taskPriorityLabel(task.priority)} priority
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </section>
  );
}
