"use client"

import { RncForm } from "../../../form-components/rnc-form/rnc-form"
import { RncSubmitButton } from "../../../form-components/rnc-submit-button"
import { RncDialog } from "../../../overlays/rnc-dialog/rnc-dialog"
import { Trash2 } from "../../../primitives/icon"
import { useRncGridContext } from "../rnc-grid-context"

export function RncGridDialogs() {
  const {
    deleteTarget,
    cancelDelete,
    confirmDelete,
    deleteDialogTitle,
    deleteDialogDescription,
    modalEdit,
    modalEditRow,
    closeModalEdit,
    saveModalEdit,
    id,
  } = useRncGridContext()

  let modalTitle = "Edit"
  if (modalEdit && modalEditRow) {
    modalTitle =
      typeof modalEdit.title === "function"
        ? modalEdit.title(modalEditRow)
        : (modalEdit.title ?? "Edit")
  }

  const loadModalValues = modalEdit?.loadFormValues

  return (
    <>
      <RncDialog
        title={deleteDialogTitle}
        description={deleteDialogDescription}
        open={!!deleteTarget}
        onOpenChange={(open) => {
          if (!open) cancelDelete()
        }}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        confirmLabel="Delete"
        confirmIcon={Trash2}
      />

      {modalEdit && (
        <RncDialog
          title={modalTitle}
          open={!!modalEditRow}
          onOpenChange={(open) => {
            if (!open) closeModalEdit()
          }}
          onCancel={closeModalEdit}
          footer={null}
          maxWidth={modalEdit.maxWidth}
          dismissable={modalEdit.dismissable}
        >
          {modalEditRow != null && (
            <RncForm
              id={`${id}-modal-edit`}
              onSubmit={async (formData) =>
                saveModalEdit(formData as Record<string, unknown>)
              }
              loadFormValues={
                loadModalValues
                  ? async () => loadModalValues(modalEditRow)
                  : async () => modalEditRow as Record<string, unknown>
              }
              unstyled
            >
              {modalEdit.renderFields(modalEditRow)}
              <RncSubmitButton label="Save" className="mt-3" />
            </RncForm>
          )}
        </RncDialog>
      )}
    </>
  )
}
