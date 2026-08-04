/**
 * Navix Documents — DocumentTimeline
 * --------------------------------------------------------------------------
 * Historique simplifié d'un document (Timeline générique) : création
 * (version initiale) et dernière modification. Le modèle actuel ne stocke
 * qu'une version — l'historique est reconstruit à partir des dates.
 *
 * Props :
 *   document : document dont on affiche l'historique
 */
import { Timeline } from '@/components/core';
import { formatDocumentLongDate } from '../constants';

const DocumentTimeline = ({ document }) => {
  if (!document) return null;

  const items = [
    {
      id: 'created',
      title: 'Fichier ajouté',
      description: `Version initiale${document.uploadedBy ? ` · ${document.uploadedBy}` : ''}`,
      date: formatDocumentLongDate(document.createdAt),
      icon: 'bi-cloud-arrow-up',
      variant: 'success',
      active: true,
    },
    {
      id: 'updated',
      title: 'Dernière modification',
      description:
        document.version > 1
          ? `Mise à jour vers la version ${document.version}`
          : 'Aucune modification ultérieure',
      date: formatDocumentLongDate(document.updatedAt),
      icon: 'bi-pencil',
    },
  ];

  return <Timeline items={items} />;
};

export default DocumentTimeline;
