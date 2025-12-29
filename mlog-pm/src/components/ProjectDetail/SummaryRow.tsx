interface Props {
  label: string
  value?: string | number
}

export default function SummaryRow({ label, value }: Props) {
  return (
    <tr>
      <td colSpan={2}>{label}</td>
      <td>{value}</td>
    </tr>
  )
}
