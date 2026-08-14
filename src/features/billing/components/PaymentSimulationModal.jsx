/**
 * Navix Billing — PaymentSimulationModal
 * --------------------------------------------------------------------------
 * Modale de simulation de paiement d'une facture (jamais réel). Enveloppe le
 * FormModal générique avec la grille PaymentSimulationForm, la validation
 * exclusive Zod (paymentSimulationSchema) et la soumission via le store.
 */
import { useEffect, useMemo } from 'react';
import { FormModal } from '@/components/core';
import { useZodForm } from '@/features/auth';
import { paymentSimulationSchema, paymentDefaultValues, toPaymentPayload } from '../schemas';
import PaymentSimulationForm from './PaymentSimulationForm';

const PaymentSimulationModal = ({ open, onClose, invoice, loading, error, onConfirm }) => {
  const invoiceId = invoice?.id ?? '';
  const amountDue = Number(invoice?.amountDue || 0);
  const currency = invoice?.currency || 'XAF';

  const defaultValues = useMemo(
    () => ({ ...paymentDefaultValues, invoiceId, currency }),
    [invoiceId, currency],
  );

  const { values, errors, setField, reset, handleSubmit } = useZodForm({
    schema: paymentSimulationSchema,
    defaultValues,
    onSubmit: (formValues) => onConfirm?.(toPaymentPayload(formValues)),
  });

  useEffect(() => {
    if (open) reset({ ...paymentDefaultValues, invoiceId, currency });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, invoiceId, currency]);

  return (
    <FormModal
      open={open}
      onClose={onClose}
      title="Simuler un paiement"
      subtitle="Aucun montant réel n’est prélevé — simulation de facturation."
      icon="bi-cash-coin"
      size="lg"
      onSubmit={handleSubmit}
      submitLabel="Enregistrer le paiement"
      submitIcon="bi-check-lg"
      loading={loading}
      error={error}
    >
      <PaymentSimulationForm
        values={values}
        errors={errors}
        setField={setField}
        invoice={{ ...invoice, amountDue }}
      />
    </FormModal>
  );
};

export default PaymentSimulationModal;
