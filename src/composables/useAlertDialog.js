import { ref, reactive } from 'vue'

// Global state for the alert dialog
const isOpen = ref(false)
const dialogOptions = reactive({
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  confirmColor: 'primary',
  onConfirm: null,
  onCancel: null,
})

export function useAlertDialog() {
  const showAlert = ({
    title = 'Confirm Action',
    message = 'Are you sure?',
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    confirmColor = 'primary',
    onConfirm = () => {},
    onCancel = () => {},
  }) => {
    dialogOptions.title = title
    dialogOptions.message = message
    dialogOptions.confirmText = confirmText
    dialogOptions.cancelText = cancelText
    dialogOptions.confirmColor = confirmColor
    dialogOptions.onConfirm = onConfirm
    dialogOptions.onCancel = onCancel
    isOpen.value = true
  }

  const hideAlert = () => {
    isOpen.value = false
  }

  const handleConfirm = () => {
    if (dialogOptions.onConfirm) {
      dialogOptions.onConfirm()
    }
    hideAlert()
  }

  const handleCancel = () => {
    if (dialogOptions.onCancel) {
      dialogOptions.onCancel()
    }
    hideAlert()
  }

  return {
    // State
    isOpen,
    dialogOptions,

    // Actions
    showAlert,
    hideAlert,
    handleConfirm,
    handleCancel,
  }
}
