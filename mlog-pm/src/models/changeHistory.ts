export interface ChangeHistoryEntry {
  userName: string
  date: string // formatted date/time
  from: number
  to: number
  note?: string
}

export default ChangeHistoryEntry
