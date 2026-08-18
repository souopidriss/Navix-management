import ContactInfo from '../ContactInfo';
import ContactForm from '../ContactForm';
import './ContactLayout.css';

const ContactLayout = () => (
  <section className="nv-contact-layout nv-section" aria-label="Formulaire de contact">
    <div className="nv-container">
      <div className="nv-contact-layout__grid">
        <ContactInfo />
        <ContactForm />
      </div>
    </div>
  </section>
);

export default ContactLayout;
