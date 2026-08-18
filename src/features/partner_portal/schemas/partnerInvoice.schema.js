/**
 * Navix Partner Portal — Schema facture partenaire (PROMPT 071 §33)
 * --------------------------------------------------------------------------
 * Validation Zod pour la création de facture.
 */
import { z } from 'zod';

export const partnerInvoiceSchema = z.object({
  clientId: z.string().min(1, 'Le client est requis.'),
  missionId: z.string().min(1, 'La mission est requise.'),
  clientName: z.string().optional(),
  clientContact: z.string().optional(),
  missionReference: z.string().optional(),
  serviceType: z.string().optional(),
  serviceLabel: z.string().optional(),
  grossAmount: z.coerce.number().min(1, 'Le montant doit être supérieur à 0.'),
  issueDate: z.string().min(1, "La date d'émission est requise."),
  dueDate: z.string().min(1, "La date d'échéance est requise."),
  description: z.string().optional(),
}).refine(
  (data) => {
    if (!data.issueDate || !data.dueDate) return true;
    return new Date(data.dueDate) >= new Date(data.issueDate);
  },
  { message: "L'échéance doit être postérieure à la date d'émission.", path: ['dueDate'] }
);

export const partnerInvoiceDefaultValues = {
  clientId: '',
  missionId: '',
  clientName: '',
  clientContact: '',
  missionReference: '',
  serviceType: 'transport',
  serviceLabel: '',
  grossAmount: 0,
  issueDate: new Date().toISOString().split('T')[0],
  dueDate: '',
  description: '',
};

export const toPartnerInvoiceFormValues = (invoice) => ({
  clientId: invoice?.clientId || '',
  missionId: invoice?.missionId || '',
  clientName: invoice?.clientName || '',
  clientContact: invoice?.clientContact || '',
  missionReference: invoice?.missionReference || '',
  serviceType: invoice?.serviceType || 'transport',
  serviceLabel: invoice?.serviceLabel || '',
  grossAmount: invoice?.grossAmount || 0,
  issueDate: invoice?.issueDate || '',
  dueDate: invoice?.dueDate || '',
  description: invoice?.description || '',
});

export const toPartnerInvoicePayload = (formValues) => ({
  clientId: formValues.clientId,
  missionId: formValues.missionId,
  clientName: formValues.clientName,
  clientContact: formValues.clientContact,
  missionReference: formValues.missionReference,
  serviceType: formValues.serviceType,
  serviceLabel: formValues.serviceLabel,
  grossAmount: Number(formValues.grossAmount) || 0,
  issueDate: formValues.issueDate,
  dueDate: formValues.dueDate,
  description: formValues.description,
});
