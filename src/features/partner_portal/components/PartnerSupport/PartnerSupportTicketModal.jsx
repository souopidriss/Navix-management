/**
 * Navix Partner Portal — PartnerSupportTicketModal (PROMPT 077)
 * ──────────────────────────────────────────────────────────────
 * Modal de création d'un ticket de support.
 * Réutilise FormModal + useZodForm + FileUploader.
 */
import { useState, memo } from 'react';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import {
  ticketCreateSchema,
  TICKET_CREATE_DEFAULTS,
  TICKET_CATEGORY_OPTIONS,
  TICKET_PRIORITY_OPTIONS,
} from '../../schemas/partnerSupport.schema';

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'Aucune' },
  { value: 'vehicle', label: 'Véhicule' },
  { value: 'mission', label: 'Mission' },
  { value: 'invoice', label: 'Facture' },
  { value: 'contract', label: 'Contrat' },
  { value: 'document', label: 'Document' },
];

const PartnerSupportTicketModal = ({ open, onClose, onSubmit, loading, error }) => {
  const [attachments, setAttachments] = useState([]);

  const form = useZodForm({
    schema: ticketCreateSchema,
    defaultValues: TICKET_CREATE_DEFAULTS,
    onSubmit: async (values) => {
      await onSubmit({
        ...values,
        attachments,
      });
      setAttachments([]);
    },
  });

  const categories = TICKET_CATEGORY_OPTIONS.filter((o) => o.value !== 'all');
  const priorities = TICKET_PRIORITY_OPTIONS.filter((o) => o.value !== 'all');

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Nouvelle demande de support"
      subtitle="Décrivez votre problème ou votre question"
      icon="bi-headset"
      size="lg"
      onSubmit={form.handleSubmit}
      loading={loading}
      error={error}
      submitLabel="Créer la demande"
    >
      <div className="row g-3">
        <div className="col-12">
          <label className="form-label fw-semibold" htmlFor="ps-subject">Sujet *</label>
          <input
            id="ps-subject"
            type="text"
            className={`form-control ${form.errors?.subject ? 'is-invalid' : ''}`}
            placeholder="Ex : Problème de connexion au portail"
            value={form.values?.subject || ''}
            onChange={(e) => form.setField('subject', e.target.value)}
          />
          {form.errors?.subject && (
            <div className="invalid-feedback">{form.errors.subject}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="ps-category">Catégorie *</label>
          <select
            id="ps-category"
            className={`form-select ${form.errors?.category ? 'is-invalid' : ''}`}
            value={form.values?.category || 'technique'}
            onChange={(e) => form.setField('category', e.target.value)}
          >
            {categories.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {form.errors?.category && (
            <div className="invalid-feedback">{form.errors.category}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="ps-priority">Priorité *</label>
          <select
            id="ps-priority"
            className={`form-select ${form.errors?.priority ? 'is-invalid' : ''}`}
            value={form.values?.priority || 'medium'}
            onChange={(e) => form.setField('priority', e.target.value)}
          >
            {priorities.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          {form.errors?.priority && (
            <div className="invalid-feedback">{form.errors.priority}</div>
          )}
        </div>

        <div className="col-12">
          <label className="form-label fw-semibold" htmlFor="ps-description">Description *</label>
          <textarea
            id="ps-description"
            className={`form-control ${form.errors?.description ? 'is-invalid' : ''}`}
            rows={5}
            placeholder="Décrivez votre problème en détail..."
            value={form.values?.description || ''}
            onChange={(e) => form.setField('description', e.target.value)}
          />
          {form.errors?.description && (
            <div className="invalid-feedback">{form.errors.description}</div>
          )}
        </div>

        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="ps-entityType">Référence liée</label>
          <select
            id="ps-entityType"
            className="form-select"
            value={form.values?.entityType || ''}
            onChange={(e) => form.setField('entityType', e.target.value)}
          >
            {ENTITY_TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {form.values?.entityType && (
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="ps-entityId">ID de l'entité</label>
            <input
              id="ps-entityId"
              type="text"
              className="form-control"
              placeholder={`Ex : ${form.values.entityType === 'vehicle' ? 'VEH-P-001' : form.values.entityType === 'mission' ? 'MIS-P-001' : form.values.entityType === 'invoice' ? 'INV-P-001' : form.values.entityType === 'contract' ? 'ctr_prt_001' : 'DOC-P-001'}`}
              value={form.values?.entityId || ''}
              onChange={(e) => form.setField('entityId', e.target.value)}
            />
          </div>
        )}

        <div className="col-12">
          <label className="form-label fw-semibold">Pièce jointe (optionnel)</label>
          <input
            type="file"
            className="form-control"
            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
            multiple
            onChange={(e) => setAttachments(Array.from(e.target.files || []))}
          />
          <div className="form-text">PDF, JPG, PNG, DOC — Max 5 Mo</div>
        </div>
      </div>
    </FormModal>
  );
};

export default memo(PartnerSupportTicketModal);
