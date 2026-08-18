/**
 * Navix Partner Portal — PartnerProfilePage (PROMPT 061)
 * --------------------------------------------------------------------------
 * Profil de l'entreprise partenaire et de l'utilisateur partenaire.
 * Lecture/édition simulée — aucune donnée réelle transmise.
 */
import { useState, useRef, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import toast from 'react-hot-toast';
import { z } from 'zod';
import { Card, Button, Badge } from '@/components/ui';
import { PageHeader, LoadingState, ErrorState } from '@/components/core';
import { ROUTES } from '@/routes/route.constants';
import { usePartnerContext } from '../hooks/usePartnerContext';
import usePartnerProfile from '../hooks/usePartnerProfile';
import { useZodForm } from '@/features/auth/hooks/useZodForm';

const profileSchema = z.object({
  companyName: z.string().min(1, "Le nom de l'entreprise est requis."),
  contactName: z.string().min(1, 'Le nom du responsable est requis.'),
  email: z.string().email('Adresse email invalide.'),
  phone: z.string().min(1, 'Le numéro de téléphone est requis.'),
  registrationNumber: z.string().min(1, 'Le numéro de registre est requis.'),
  taxId: z.string().min(1, 'Le numéro contribuable est requis.'),
});

const PartnerProfilePage = () => {
  const { companyName, companyContext } = usePartnerContext();
  const { profile, isLoading, error, refetch } = usePartnerProfile();
  const [saved, setSaved] = useState(false);
  const savedTimerRef = useRef(null);

  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

  const form = useZodForm({
    schema: profileSchema,
    defaultValues: {
      companyName: companyName || 'Cameroon Logistics Partners',
      contactName: profile?.displayName || companyContext?.profile?.contactName || 'Aïcha Mballa',
      email: profile?.email || 'aicha.mballa@cameroon-logistics.cm',
      phone: profile?.phone || '+237 6 88 55 44 33',
      registrationNumber: companyContext?.profile?.registrationNumber || 'RC/YDE/2019/B/0891',
      taxId: companyContext?.profile?.taxId || 'M012198765432B',
    },
    onSubmit: () => {
      setSaved(true);
      toast.success('Profil mis à jour (simulation).');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = window.setTimeout(() => setSaved(false), 3000);
    },
  });

  return (
    <div>
      <Helmet>
        <title>Mon Profil Partenaire — Navix</title>
      </Helmet>

      <PageHeader
        title="Profil Partenaire"
        subtitle="Consultez les informations de votre entreprise partenaire et de votre compte."
        icon="bi-person-vcard"
        breadcrumbs={[{ label: 'Espace Partenaire', to: ROUTES.PARTNER_DASHBOARD }, { label: 'Profil' }]}
      />

      {isLoading && <LoadingState label="Chargement du profil…" />}
      {error && !isLoading && (
        <ErrorState title="Erreur de chargement" description={error} retry={refetch} />
      )}

      {!isLoading && !error && (
      <div className="row g-3">
        <div className="col-lg-4">
          <Card className="text-center shadow-sm">
            <div className="p-4 rounded-circle bg-primary-subtle text-primary d-inline-flex mb-3">
              <i className="bi bi-buildings fs-1" />
            </div>
            <h5 className="fw-bold mb-1">{form.values.companyName}</h5>
            <p className="text-muted small mb-2">{form.values.email}</p>
            <Badge variant="primary">Partenaire Navix — Cameroun</Badge>

            <div className="mt-4 pt-3 border-top text-start">
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Identifiant :</span>
                <span className="fw-medium font-monospace">{companyContext?.partnerId || 'ptr_partner_tec'}</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Ville :</span>
                <span className="fw-medium">Yaoundé 🇨🇲</span>
              </div>
              <div className="d-flex justify-content-between py-1">
                <span className="text-muted small">Statut :</span>
                <span className="badge bg-success-subtle text-success">Partenariat actif</span>
              </div>
            </div>
          </Card>
        </div>

        <div className="col-lg-8">
          <Card title="Informations de contact & entreprise">
            <form onSubmit={form.handleSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-company-name">Nom de l'entreprise</label>
                  <input
                    id="profile-company-name"
                    type="text"
                    className={`form-control ${form.errors.companyName ? 'is-invalid' : ''}`}
                    value={form.values.companyName}
                    onChange={(e) => form.setField('companyName', e.target.value)}
                  />
                  {form.errors.companyName && <div className="invalid-feedback">{form.errors.companyName}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-contact-name">Responsable</label>
                  <input
                    id="profile-contact-name"
                    type="text"
                    className={`form-control ${form.errors.contactName ? 'is-invalid' : ''}`}
                    value={form.values.contactName}
                    onChange={(e) => form.setField('contactName', e.target.value)}
                  />
                  {form.errors.contactName && <div className="invalid-feedback">{form.errors.contactName}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-email">Adresse Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    className={`form-control ${form.errors.email ? 'is-invalid' : ''}`}
                    value={form.values.email}
                    onChange={(e) => form.setField('email', e.target.value)}
                  />
                  {form.errors.email && <div className="invalid-feedback">{form.errors.email}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-phone">Téléphone (Cameroun)</label>
                  <input
                    id="profile-phone"
                    type="text"
                    className={`form-control ${form.errors.phone ? 'is-invalid' : ''}`}
                    value={form.values.phone}
                    onChange={(e) => form.setField('phone', e.target.value)}
                  />
                  {form.errors.phone && <div className="invalid-feedback">{form.errors.phone}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-registration">N° registre de commerce</label>
                  <input
                    id="profile-registration"
                    type="text"
                    className={`form-control ${form.errors.registrationNumber ? 'is-invalid' : ''}`}
                    value={form.values.registrationNumber}
                    onChange={(e) => form.setField('registrationNumber', e.target.value)}
                  />
                  {form.errors.registrationNumber && <div className="invalid-feedback">{form.errors.registrationNumber}</div>}
                </div>
                <div className="col-md-6">
                  <label className="form-label small fw-semibold" htmlFor="profile-tax-id">N° contribuable</label>
                  <input
                    id="profile-tax-id"
                    type="text"
                    className={`form-control ${form.errors.taxId ? 'is-invalid' : ''}`}
                    value={form.values.taxId}
                    onChange={(e) => form.setField('taxId', e.target.value)}
                  />
                  {form.errors.taxId && <div className="invalid-feedback">{form.errors.taxId}</div>}
                </div>
              </div>

              <div className="d-flex justify-content-end gap-2">
                <Button type="submit" variant="primary" icon={saved ? 'bi-check-lg' : 'bi-save'} disabled={saved}>
                  {saved ? 'Enregistré' : 'Enregistrer les modifications'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
      )}
    </div>
  );
};

export default PartnerProfilePage;
