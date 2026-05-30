import { useEffect } from "react";
import { actionClearCanvas } from "../actions";
import { t } from "../i18n";
import { atom, useAtom } from "../editor-jotai";
import { useExcalidrawActionManager } from "./App";
import ConfirmDialog from "./ConfirmDialog";

export const activeConfirmDialogAtom = atom<"clearCanvas" | null>(null);

export const ActiveConfirmDialog = () => {
  const [activeConfirmDialog, setActiveConfirmDialog] = useAtom(
    activeConfirmDialogAtom,
  );
  const actionManager = useExcalidrawActionManager();

  useEffect(() => {
    if (activeConfirmDialog === "clearCanvas") {
      if ((window as any).__penio_confirmClearAnnotation === false) {
        actionManager.executeAction(actionClearCanvas);
        setActiveConfirmDialog(null);
      }
    }
  }, [activeConfirmDialog]);

  if (!activeConfirmDialog) {
    return null;
  }

  if (activeConfirmDialog === "clearCanvas") {
    if ((window as any).__penio_confirmClearAnnotation === false) {
      return null;
    }
    return (
      <ConfirmDialog
        onConfirm={() => {
          actionManager.executeAction(actionClearCanvas);
          setActiveConfirmDialog(null);
        }}
        onCancel={() => setActiveConfirmDialog(null)}
        title={t("clearCanvasDialog.title")}
      >
        <p className="clear-canvas__content"> {t("alerts.clearReset")}</p>
      </ConfirmDialog>
    );
  }

  return null;
};
