'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import { ContactForm } from '@/components/contacts/contact-form';
import {
  createContact,
  linkContactToApplication,
  listContacts,
  unlinkContactFromApplication,
  type ContactMutationPayload,
  type ContactRecord,
} from '@/lib/contacts';

interface ApplicationContactsPanelProps {
  applicationId: string;
}

export function ApplicationContactsPanel({ applicationId }: ApplicationContactsPanelProps) {
  const [linkedContacts, setLinkedContacts] = useState<ContactRecord[]>([]);
  const [allContacts, setAllContacts] = useState<ContactRecord[]>([]);
  const [selectedContactId, setSelectedContactId] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const loadContacts = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const [linkedResponse, allResponse] = await Promise.all([
        listContacts({ applicationId }),
        listContacts(),
      ]);
      setLinkedContacts(linkedResponse.items);
      setAllContacts(allResponse.items);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to load contacts for this application.');
    } finally {
      setIsLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    void loadContacts();
  }, [loadContacts]);

  const availableContacts = useMemo(
    () => allContacts.filter((contact) => !linkedContacts.some((linked) => linked.id === contact.id)),
    [allContacts, linkedContacts],
  );

  async function handleCreateAndLink(payload: ContactMutationPayload) {
    const contact = await createContact(payload);
    await linkContactToApplication(applicationId, contact.id);
    setSuccessMessage('Contact created and linked successfully.');
    await loadContacts();
  }

  async function handleLinkSelected() {
    if (!selectedContactId) {
      return;
    }

    try {
      await linkContactToApplication(applicationId, selectedContactId);
      setSelectedContactId('');
      setSuccessMessage('Contact linked successfully.');
      await loadContacts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to link contact.');
    }
  }

  async function handleUnlink(contactId: string) {
    try {
      await unlinkContactFromApplication(applicationId, contactId);
      setSuccessMessage('Contact unlinked successfully.');
      await loadContacts();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to unlink contact.');
    }
  }

  return (
    <section className="card detail-panel">
      <div className="detail-panel__header">
        <div>
          <h2>Contacts</h2>
          <p>Link recruiters, hiring managers, or referrals to this application.</p>
        </div>
      </div>

      {successMessage ? <p className="auth-message auth-message--success">{successMessage}</p> : null}
      {errorMessage ? <p className="auth-message auth-message--error">{errorMessage}</p> : null}

      <div className="page-stack">
        <div className="detail-subpanel">
          <h3>Linked contacts</h3>
          {isLoading ? <p>Loading contacts...</p> : null}
          {!isLoading && linkedContacts.length === 0 ? <p>No contacts linked to this application yet.</p> : null}
          {!isLoading && linkedContacts.length > 0 ? (
            <div className="mini-list">
              {linkedContacts.map((contact) => (
                <article className="mini-list__item" key={contact.id}>
                  <div>
                    <strong>{contact.full_name}</strong>
                    <p>{contact.title || 'No title'}{contact.company_name ? ` · ${contact.company_name}` : ''}</p>
                  </div>
                  <button className="button button--secondary button--small" onClick={() => void handleUnlink(contact.id)} type="button">
                    Unlink
                  </button>
                </article>
              ))}
            </div>
          ) : null}
        </div>

        <div className="detail-subpanel">
          <h3>Link existing contact</h3>
          {availableContacts.length === 0 ? (
            <p>All current contacts are already linked.</p>
          ) : (
            <div className="inline-action-row">
              <select onChange={(event) => setSelectedContactId(event.target.value)} value={selectedContactId}>
                <option value="">Select a contact</option>
                {availableContacts.map((contact) => (
                  <option key={contact.id} value={contact.id}>
                    {contact.full_name}{contact.company_name ? ` · ${contact.company_name}` : ''}
                  </option>
                ))}
              </select>
              <button className="button button--small" disabled={!selectedContactId} onClick={() => void handleLinkSelected()} type="button">
                Link contact
              </button>
            </div>
          )}
        </div>

        <div className="detail-subpanel">
          <h3>Add a new contact</h3>
          <ContactForm onSubmit={handleCreateAndLink} submitLabel="Create and link contact" />
        </div>
      </div>
    </section>
  );
}
