export default function Achievements({ list }) {
  const got = list.filter(a => a.unlocked).length;
  return (
    <section className="card">
      <p className="muted">{got} de {list.length} desbloqueados</p>
      <ul className="achievements">
        {list.map(a => (
          <li key={a.id} className={a.unlocked ? 'unlocked' : 'locked'}>
            <span className="ach-icon" aria-hidden>{a.unlocked ? a.icon : '🔒'}</span>
            <div><b>{a.title}</b><p>{a.desc}</p></div>
          </li>
        ))}
      </ul>
    </section>
  );
}
