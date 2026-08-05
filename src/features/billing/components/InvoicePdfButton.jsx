/**
 * Navix Billing — InvoicePdfButton
 * --------------------------------------------------------------------------
 * Téléchargement PDF (placeholder). Aucune bibliothèque PDF n'est utilisée :
 * l'action appelle le service `downloadInvoice` qui retourne les métadonnées
 * du fichier simulé puis affiche une notification d'information.
 */
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui';
import { billingService } from '../services';

const InvoicePdfButton = ({ invoiceId, size, variant = 'outline', className }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownload = async () => {
    setIsLoading(true);
    try {
      const result = await billingService.downloadInvoice(invoiceId);
      if (result?.simulated) {
        toast.info(
          `PDF simulé : « ${result.fileName} » — la génération réelle arrivera avec le backend.`,
          { duration: 4000 },
        );
      }
    } catch {
      toast.error('Impossible de générer le PDF de la facture.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      icon="bi-file-earmark-pdf"
      loading={isLoading}
      onClick={handleDownload}
      className={className}
    >
      Télécharger le PDF
    </Button>
  );
};

export default InvoicePdfButton;
