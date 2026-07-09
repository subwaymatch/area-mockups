export function CodeBlock({ title, children }: { title?: string; children: string }) {
  return (
    <figure className="codeblock">
      {title && <figcaption className="codeblock-title">{title}</figcaption>}
      <pre>
        <code>{children}</code>
      </pre>
    </figure>
  )
}
