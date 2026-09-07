import ExerciseBrowser from './ExerciseBrowser'

interface ExercisePickerModalProps {
  open: boolean
  onClose: () => void
  onSelect: (exerciseId: string) => void
  /** exercise ids already added, hidden from the browse/search results */
  excludeIds?: string[]
}

export default function ExercisePickerModal({ open, onClose, onSelect, excludeIds = [] }: ExercisePickerModalProps) {
  if (!open) return null

  function handleSelect(exerciseId: string) {
    onSelect(exerciseId)
    onClose()
  }

  return <ExerciseBrowser onSelect={handleSelect} onCancel={onClose} excludeIds={excludeIds} />
}
