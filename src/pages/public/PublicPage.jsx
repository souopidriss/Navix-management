import { Helmet } from 'react-helmet-async';

const PublicPage = ({ title, children }) => (
  <>
    <Helmet>
      <title>{title} — Navix Management</title>
    </Helmet>
    {children}
  </>
);

export default PublicPage;
