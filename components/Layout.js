export default function Layout({ children, currentPageName }) {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
        
        body {
          font-family: 'Inter', sans-serif;
        }

        :root {
          --bg-primary: #111111;
          --bg-secondary: #1a1a1a;
          --text-primary: #f7f7f7;
          --text-secondary: #a0a0a0;
          --border-color: rgba(139, 92, 246, 0.2);
          --accent: #8B5CF6;
          --accent-hover: #7C3AED;
        }
        
        [data-theme="light"] {
          --bg-primary: #f7f7f7;
          --bg-secondary: #ffffff;
          --text-primary: #111111;
          --text-secondary: #5a5a5a;
          --border-color: rgba(139, 92, 246, 0.2);
          --accent: #8B5CF6;
          --accent-hover: #7C3AED;
        }
        
        html {
          scroll-behavior: smooth;
        }
        
        .section-scroll {
          scroll-margin-top: 80px;
        }
        
        .gradient-text {
          background: linear-gradient(135deg, var(--accent), #EC4899);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        
        .glow-effect {
          box-shadow: 0 0 20px rgba(139, 92, 246, 0.3);
        }
        
        .bg-primary {
          background-color: var(--bg-primary);
        }
        
        .bg-secondary {
          background-color: var(--bg-secondary);
        }
        
        .text-primary {
          color: var(--text-primary);
        }
        
        .text-secondary {
          color: var(--text-secondary);
        }

        .border-themed {
          border-color: var(--border-color);
        }
      `}</style>
      <div className="bg-primary">{children}</div>
    </>
  )
}
