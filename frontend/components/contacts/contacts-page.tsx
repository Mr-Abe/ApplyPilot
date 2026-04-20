'use client';

import { useEffect, useState } from 'react';

import { ContactForm } from '@/components/contacts/contact-form';
import {
  createContact,
  deleteContact,
  listContacts,
  updateContact,
  type ContactMutationPayload,
  type ContactRecord,
} from '@/lib/contacts';

export function ContactsPageContent() {
  const [items, setItems] = useState<ContactRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadContacts() {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await listContacts();
      setItems(response.items);
      setTotal(response.total);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load contacts.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadContacts();
  }, []);

  async function handleCreate(payload: ContactMutationPayload) {
    await createContact(payload);
    setSuccessMessage('Contact added successfully.');
    await loadContacts();
  }

  async function handleUpdate(contactId: string, payload: ContactMutationPayload) {
    await updateContact(contactId, payload);
    setEditingId(null);
    setSuccessMessage('Contact updated successfully.');
    await loadContacts();
  }

  async function handleDelete(contactId: string) {
    setErrorMessage(null);

    try {
      await deleteContact(contactId);
      setSuccessMessage('Contact deleted successfully.');
      await loadContacts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to delete the contact.');
    }
  }

  return (
    <div className="page-stack">
      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <section className="card form-card">
        <h2>Add contact</h2>
        <p className="section-copy">Track recruiters, hiring managers, and referrals tied to your applications.</p>
        <ContactForm onSubmit={handleCreate} submitLabel="Create contact" />
      </section>

      <section className="card resource-list-card">
        <div className="resource-list-card__header">
          <h2>{total} contact{total === 1 ? '' : 's'}</h2>
        </div>

        {isLoading ? <p>Loading contacts...</p> : null}
        {!isLoading && !errorMessage && items.length === 0 ? (
          <div className="empty-state">
            <p>No contacts added yet.</p>
          </div>
        ) : null}

        {!isLoading && !errorMessage && items.length > 0 ? (
          <div className="resource-list">
            {items.map((contact) => (
              <article className="resource-card" key={contact.id}>
                <div className="resource-card__header">
                  <div>
                    <h3>{contact.full_name}</h3>
                    <p>{contact.title || 'No title provided'}{contact.company_name ? ` · ${contact.company_name}` : ''}</p>
                  </div>
                  <div className="resource-card__actions">
                    <button className="button button--secondary button--small" onClick={() => setEditingId((current) => current === contact.id ? null : contact.id)} type="button">
                      {editingId === contact.id ? 'Cancel' : 'Edit'}
                    </button>
                    <button className="button button--small" onClick={() => void handleDelete(contact.id)} type="button">
                      Delete
                    </button>
                  </div>
                </div>
                <div className="resource-card__meta">
                  <p><strong>Email:</strong> {contact.email || '—'}</p>
                  <p><strong>Phone:</strong> {contact.phone || '—'}</p>
                  <p><strong>LinkedIn:</strong> {contact.linkedin_url || '—'}</p>
                  <p className="resource-card__full"><strong>Notes:</strong> {contact.notes || '—'}</p>
                </div>

                {editingId === contact.id ? (
                  <div className="resource-card__edit">
                    <ContactForm initialValues={contact} onSubmit={(payload) => handleUpdate(contact.id, payload)} submitLabel="Save contact" />
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
