export default function Home() {
  return (
    <main className="container">
      <div className="glass-panel fade-in" style={{ padding: '4rem 3rem', textAlign: 'center', marginTop: '4rem', maxWidth: '600px', margin: '4rem auto' }}>
        <h1 className="heading-xl">Secure Report App</h1>
        <p style={{ fontSize: '1.1rem', opacity: 0.9, marginBottom: '2rem', lineHeight: 1.6 }}>
          Organize your reports in password-protected folders with QR code access
        </p>

        <div style={{
          background: 'var(--gradient-primary)',
          padding: '1.5rem',
          borderRadius: 'var(--radius)',
          marginBottom: '2rem'
        }}>
          <p style={{ color: 'white', fontSize: '0.95rem', lineHeight: 1.6 }}>
            📁 Create folders with passwords<br />
            📂 Add subfolders without passwords<br />
            📊 Upload Excel reports<br />
            📱 Share via QR codes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/login" className="btn btn-primary">Admin Login</a>
        </div>
      </div>
    </main>
  );
}
