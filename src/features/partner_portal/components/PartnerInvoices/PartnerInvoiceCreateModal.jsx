/**
 * Navix Partner Portal — PartnerInvoiceCreateModal (PROMPT 071 §18-19)
 * --------------------------------------------------------------------------
 * Modal de création de facture partenaire.
 * Validation Zod, champs : Client, Mission, Montant, Dates, Description.
 * Réutilise FormModal du core.
 */
import { useState } from 'react';
import { FormModal } from '@/components/core';
import { partnerInvoiceSchema, partnerInvoiceDefaultValues, toPartnerInvoicePayload } from '../../schemas/partnerInvoice.schema';
import {
  FCFA_LABEL,
  computeInvoiceTotal,
  PARTNER_DEFAULT_COMMISSION_RATE,
} from '../../constants/partner.constants';

const MOCK_CLIENT_OPTIONS = [
  { id: 'CLI-P-001', name: 'Transports Express Cameroun', contact: 'Bertrand Tchoumi' },
  { id: 'CLI-P-002', name: 'SCL Logistique', contact: 'Chantal Ngo Bell' },
  { id: 'CLI-P-003', name: 'Cameroon Agro Industries', contact: 'Emmanuel Mbarga' },
  { id: 'CLI-P-004', name: 'Global Mining Cameroun', contact: 'Paul Ndjock' },
  { id: 'CLI-P-005', name: 'DBS Transports', contact: 'Alice Fouda' },
];

const MOCK_MISSION_OPTIONS = [
  { id: 'MIS-P-001', reference: 'MIS-2026-0801', type: 'transport', label: 'Transport logistique Douala → Yaoundé' },
  { id: 'MIS-P-002', reference: 'MIS-2026-0802', type: 'livraison', label: 'Livraison matériaux de construction — Kribi' },
  { id: 'MIS-P-003', reference: 'MIS-2026-0803', type: 'livraison', label: 'Acheminement matériel électrique — Kribi' },
  { id: 'MIS-P-004', reference: 'MIS-2026-0804', type: 'disponibilite', label: 'Mise à disposition 4x4 — site minier de Garoua' },
  { id: 'MIS-P-005', reference: 'MIS-2026-0805', type: 'transfert', label: 'Transfert de marchandises Yaoundé → Douala' },
  { id: 'MIS-P-006', reference: 'MIS-2026-0806', type: 'location', label: 'Location utilitaire — tournée Limbe' },
  { id: 'MIS-P-007', reference: 'MIS-2026-0807', type: 'autre', label: 'Prestation ponctuelle — Bafoussam' },
  { id: 'MIS-P-008', reference: 'MIS-2026-0808', type: 'transport', label: 'Transport équipements industriels — Bafoussam → Douala' },
];

const PartnerInvoiceCreateModal = ({ isOpen, onClose, onSubmit }) => {
  const [form, setForm] = useState(partnerInvoiceDefaultValues);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleClientChange = (clientId) => {
    const client = MOCK_CLIENT_OPTIONS.find((c) => c.id === clientId);
    if (client) {
      setForm((prev) => ({
        ...prev,
        clientId: client.id,
        clientName: client.name,
        clientContact: client.contact,
      }));
    }
  };

  const handleMissionChange = (missionId) => {
    const mission = MOCK_MISSION_OPTIONS.find((m) => m.id === missionId);
    if (mission) {
      setForm((prev) => ({
        ...prev,
        missionId: mission.id,
        missionReference: mission.reference,
        serviceType: mission.type,
        serviceLabel: mission.label,
      }));
    }
  };

  const preview = computeInvoiceTotal(form.grossAmount || 0);

  const handleSubmit = async () => {
    const result = partnerInvoiceSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors = {};
      result.error.issues.forEach((issue) => {
        fieldErrors[issue.path[0]] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }
    setIsSubmitting(true);
    try {
      await onSubmit(toPartnerInvoicePayload(form));
      setForm(partnerInvoiceDefaultValues);
      onClose();
    } catch {
      setErrors({ submit: 'Erreur lors de la création.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormModal
      open={isOpen}
      onClose={onClose}
      title="Nouvelle facture"
      icon="bi-receipt"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel="Créer la facture"
      submitIcon="bi-plus-lg"
      loading={isSubmitting}
      error={errors.submit}
    >
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-client">Client *</label>
          <select
            id="invoice-client"
            className={`form-select ${errors.clientId ? 'is-invalid' : ''}`}
            value={form.clientId}
            onChange={(e) => handleClientChange(e.target.value)}
          >
            <option value="">Sélectionner un client</option>
            {MOCK_CLIENT_OPTIONS.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          {errors.clientId && <div className="invalid-feedback">{errors.clientId}</div>}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-mission">Mission *</label>
          <select
            id="invoice-mission"
            className={`form-select ${errors.missionId ? 'is-invalid' : ''}`}
            value={form.missionId}
            onChange={(e) => handleMissionChange(e.target.value)}
          >
            <option value="">Sélectionner une mission</option>
            {MOCK_MISSION_OPTIONS.map((m) => (
              <option key={m.id} value={m.id}>{m.reference} — {m.label}</option>
            ))}
          </select>
          {errors.missionId && <div className="invalid-feedback">{errors.missionId}</div>}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-gross-amount">Montant brut (FCFA) *</label>
          <input
            id="invoice-gross-amount"
            type="number"
            className={`form-control ${errors.grossAmount ? 'is-invalid' : ''}`}
            value={form.grossAmount || ''}
            onChange={(e) => handleChange('grossAmount', e.target.value)}
            min="1"
            placeholder="ex: 1 500 000"
          />
          {errors.grossAmount && <div className="invalid-feedback">{errors.grossAmount}</div>}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-description">Description</label>
          <input
            id="invoice-description"
            type="text"
            className="form-control"
            value={form.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Description de la prestation"
          />
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-issue-date">Date d&apos;émission *</label>
          <input
            id="invoice-issue-date"
            type="date"
            className={`form-control ${errors.issueDate ? 'is-invalid' : ''}`}
            value={form.issueDate}
            onChange={(e) => handleChange('issueDate', e.target.value)}
          />
          {errors.issueDate && <div className="invalid-feedback">{errors.issueDate}</div>}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label fw-semibold" htmlFor="invoice-due-date">Date d&apos;échéance *</label>
          <input
            id="invoice-due-date"
            type="date"
            className={`form-control ${errors.dueDate ? 'is-invalid' : ''}`}
            value={form.dueDate}
            onChange={(e) => handleChange('dueDate', e.target.value)}
          />
          {errors.dueDate && <div className="invalid-feedback">{errors.dueDate}</div>}
        </div>
      </div>

      {form.grossAmount > 0 && (
        <div className="mt-3 p-3 bg-light rounded">
          <div className="d-flex justify-content-between mb-1">
            <span>Montant brut :</span>
            <strong>{Number(form.grossAmount).toLocaleString('fr-FR')} {FCFA_LABEL}</strong>
          </div>
          <div className="d-flex justify-content-between mb-1 text-danger">
            <span>Commission ({Math.round(PARTNER_DEFAULT_COMMISSION_RATE * 100)}%) :</span>
            <span>-{preview.commission.toLocaleString('fr-FR')} {FCFA_LABEL}</span>
          </div>
          <hr className="my-1" />
          <div className="d-flex justify-content-between fw-bold">
            <span>Montant net :</span>
            <span>{preview.net.toLocaleString('fr-FR')} {FCFA_LABEL}</span>
          </div>
        </div>
      )}
    </FormModal>
  );
};

export default PartnerInvoiceCreateModal;
