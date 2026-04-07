import BankingApp from '../components/banking/BankingApp';

export const BankingAppPage = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#020617', padding: '2rem' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f1f5f9', letterSpacing: '0.1em' }}>INDRA BANK</h1>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Secure Mobile Banking Experience</p>
      </div>
      <BankingApp />
    </div>
  );
};

export default BankingAppPage;
