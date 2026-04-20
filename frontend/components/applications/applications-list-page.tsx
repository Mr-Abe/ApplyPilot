'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import {
  applicationStatuses,
  formatCurrencyRange,
  formatDateLabel,
  formatDateTimeLabel,
  listApplications,
  type ApplicationListFilters,
  type ApplicationRecord,
} from '@/lib/applications';

const initialFilters: ApplicationListFilters = {
  archiveState: 'active',
  search: '',
  sortBy: 'date_applied',
  sortOrder: 'desc',
  status: '',
};

export function ApplicationsListPage() {
  const [filters, setFilters] = useState<ApplicationListFilters>(initialFilters);
  const [items, setItems] = useState<ApplicationRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const response = await listApplications(filters);
        if (isCancelled) {
          return;
        }

        setItems(response.items);
        setTotal(response.total);
      } catch (error) {
        if (isCancelled) {
          return;
        }

        setErrorMessage(error instanceof Error ? error.message : 'Unable to load applications.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isCancelled = true;
    };
  }, [filters]);

  function updateFilter<K extends keyof ApplicationListFilters>(field: K, value: ApplicationListFilters[K]) {
    setFilters((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="page-stack">
      <section className="card applications-filter-card">
        <div className="form-grid form-grid--filters">
          <label className="field">
            <span>Search</span>
            <input
              onChange={(event) => updateFilter('search', event.target.value)}
              placeholder="Company or job title"
              value={filters.search ?? ''}
            />
          </label>
          <label className="field">
            <span>Status</span>
            <select onChange={(event) => updateFilter('status', event.target.value as ApplicationListFilters['status'])} value={filters.status ?? ''}>
              <option value="">All statuses</option>
              {applicationStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Sort by</span>
            <select onChange={(event) => updateFilter('sortBy', event.target.value as ApplicationListFilters['sortBy'])} value={filters.sortBy}>
              <option value="date_applied">Date applied</option>
              <option value="next_action_due_at">Next action due</option>
            </select>
          </label>
          <label className="field">
            <span>Sort order</span>
            <select onChange={(event) => updateFilter('sortOrder', event.target.value as ApplicationListFilters['sortOrder'])} value={filters.sortOrder}>
              <option value="desc">Newest first</option>
              <option value="asc">Oldest first</option>
            </select>
          </label>
          <label className="field">
            <span>View</span>
            <select onChange={(event) => updateFilter('archiveState', event.target.value as ApplicationListFilters['archiveState'])} value={filters.archiveState}>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
              <option value="all">All</option>
            </select>
          </label>
        </div>
      </section>

      <section className="card applications-list-card">
        <div className="applications-list-header">
          <h2>{total} application{total === 1 ? '' : 's'}</h2>
          <Link className="button button--small" href="/app/applications/new">
            New application
          </Link>
        </div>

        {isLoading ? <p>Loading applications...</p> : null}
        {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}
        {!isLoading && !errorMessage && items.length === 0 ? (
          <div className="empty-state">
            <p>No applications match the current filters yet.</p>
          </div>
        ) : null}
        {!isLoading && !errorMessage && items.length > 0 ? (
          <div className="application-list">
            {items.map((item) => (
              <article className="application-list-item" key={item.id}>
                <div className="application-list-item__header">
                  <div>
                    <h3>{item.company_name}</h3>
                    <p>{item.job_title}</p>
                  </div>
                  <span className={`status-badge status-badge--${item.status}`}>{item.status.replaceAll('_', ' ')}</span>
                </div>
                <div className="application-list-item__meta">
                  <p>
                    <strong>Applied:</strong> {formatDateLabel(item.date_applied)}
                  </p>
                  <p>
                    <strong>Next action:</strong> {item.next_action || '—'}
                  </p>
                  <p>
                    <strong>Due:</strong> {formatDateTimeLabel(item.next_action_due_at)}
                  </p>
                  <p>
                    <strong>Comp:</strong> {formatCurrencyRange(item.salary_min, item.salary_max)}
                  </p>
                </div>
                <div className="application-list-item__footer">
                  <p>{item.location || item.work_type || 'No location or work type provided'}</p>
                  <Link href={`/app/applications/${item.id}`}>View details</Link>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  );
}
