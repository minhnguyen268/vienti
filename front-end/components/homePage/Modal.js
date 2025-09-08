import { Button, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useTranslation } from 'react-i18next';

const CustomDialog = styled(Dialog)(({ theme }) => ({
  color: "#000",

  "&.MuiDialog-root": {
    width: "100%",
    maxWidth: "540px",
    left: "50%",
    transform: "translateX(-50%)",
  },
  "& .MuiDialog-paper": {
    borderRadius: "1rem",
    width: "100%",
  },
  "& .MuiDialogContent-root": {
    color: "#000",
    fontSize: "1.5rem",
    marginTop: "2rem",
    padding: "1.5rem",
  },
  "& .MuiDialogActions-root": {
    padding: theme.spacing(1),
  },
}));
const Modal = (props) => {
  const { t } = useTranslation('common');
  const { isModal, setIsModal, title } = props;
  const handleClose = () => {
    setIsModal(false);
  };
  return (
    <>
      <CustomDialog open={isModal} onClose={handleClose} disableScrollLock>
        <DialogTitle
          sx={{
            background: "linear-gradient(179deg,#13a2ba,#087c95)",
            fontWeight: "bold",
            color: (theme) => theme.palette.text.primary,
          }}
        >
          {title}
        </DialogTitle>
        <DialogContent>{props.children}</DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
          }}
        >
          <Button onClick={handleClose}>{t('Close')}</Button>
        </DialogActions>
      </CustomDialog>
    </>
  );
};
export default Modal;
