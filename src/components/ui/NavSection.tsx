interface NavSectionProps {
  title: string
}

export function NavSection({ title }: NavSectionProps) {
  return <li className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">{title}</li>
}
