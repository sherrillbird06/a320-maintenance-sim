interface NoticeProps {
  title: string
  body: string
}

/** Full-page message shown in place of the simulator when it cannot run. */
export function Notice({ title, body }: NoticeProps) {
  return (
    <main className="notice" role="alert">
      <div className="notice__panel">
        <p className="notice__eyebrow">A320 Maintenance Simulator</p>
        <h1 className="notice__title">{title}</h1>
        <p className="notice__body">{body}</p>
      </div>
    </main>
  )
}
