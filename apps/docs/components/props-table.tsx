export type PropRow = {
  name: string
  type: string
  defaultValue?: string
  description: string
}

export function PropsTable({ rows }: { rows: PropRow[] }) {
  return (
    <table className="props-table">
      <thead>
        <tr>
          <th>Prop</th>
          <th>Type</th>
          <th>Default</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.name}>
            <td>
              <code>{row.name}</code>
            </td>
            <td>
              <span className="type">{row.type}</span>
            </td>
            <td>
              <span className="type">{row.defaultValue ?? '—'}</span>
            </td>
            <td>{row.description}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
