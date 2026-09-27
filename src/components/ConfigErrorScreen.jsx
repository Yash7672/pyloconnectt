export default function ConfigErrorScreen() {
  return (
    <div className="config-error">
      <div className="config-error__card">
        <p className="config-error__title">PYLO setup incomplete</p>
        <p className="config-error__message">
          Two environment values are required before this site can run. In
          the <code>.env</code> file at the project root, set:
        </p>
        <ul className="config-error__list">
          <li>
            <code>VITE_SUPABASE_URL</code>
          </li>
          <li>
            <code>VITE_SUPABASE_PUBLISHABLE_KEY</code>
          </li>
        </ul>
        <p className="config-error__message">
          Then restart the dev server with <code>npm run dev</code>.
        </p>
      </div>
    </div>
  );
}