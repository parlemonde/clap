import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useQueryCache } from "react-query";
import React from "react";

import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from "@mui/material/Backdrop";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";
import NoSsr from "@mui/material/NoSsr";
import RadioGroup from "@mui/material/RadioGroup";
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import { Theme as MaterialTheme } from "@mui/material/styles";
import { makeStyles, createStyles } from "@mui/styles";

import { Modal } from "src/components/Modal";
import { AdminTile } from "src/components/admin/AdminTile";
import { UserServiceContext } from "src/services/UserService";
import { getQueryString } from "src/util";
import type { User } from "types/models/user.type";

const useStyles = makeStyles((theme: MaterialTheme) =>
  createStyles({
    backdrop: {
      zIndex: theme.zIndex.drawer + 1,
      color: "#fff",
    },
  }),
);

const AdminEditUser: React.FunctionComponent = () => {
  const classes = useStyles();
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const queryCache = useQueryCache();
  const userId = React.useMemo(() => parseInt(getQueryString(router.query.id), 10) || 0, [router]);
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState<boolean>(false);
  const [isBlocked, setIsBlocked] = React.useState<boolean>(true);
  const [isBlockedModalOpen, setIsBlockedModalOpen] = React.useState<boolean>(false);

  const goToPath = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };

  const onChangeValue = (key: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({
      ...user,
      [key]: key === "type" ? parseInt(event.target.value, 10) : event.target.value,
    });
  };

  const getUser = React.useCallback(async () => {
    const response = await axiosLoggedRequest({
      method: "GET",
      url: `/users/${userId}`,
    });
    if (response.error) {
      router.push("/admin/users");
    } else {
      const u = response.data;
      delete u.languageCode;
      setUser(u);
    }
  }, [axiosLoggedRequest, router, userId]);
  React.useEffect(() => {
    getUser().catch((e) => console.error(e));
  }, [getUser]);

  const submit = async () => {
    if (!user.pseudo || !user.email) {
      // todo use validations
      return;
    }
    setLoading(true);
    const updatedUser = { ...user };
    if (isBlocked) {
      delete updatedUser.email;
      delete updatedUser.pseudo;
    }
    const response = await axiosLoggedRequest({
      method: "PUT",
      url: `/users/${userId}`,
      data: updatedUser,
    });
    setLoading(false);
    if (response.error) {
      enqueueSnackbar("Une erreur est survenue...", {
        variant: "error",
      });
      return;
    }
    enqueueSnackbar("Utilisateur modifié avec succès!", {
      variant: "success",
    });
    queryCache.invalidateQueries("users");
    router.push("/admin/users");
  };

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
        <Link href="/admin/users" onClick={goToPath("/admin/users")}>
          <Typography variant="h1" color="primary">
            Utilisateurs
          </Typography>
        </Link>
        <Typography variant="h1" color="textPrimary">
          {user?.pseudo || ""}
        </Typography>
      </Breadcrumbs>
      <NoSsr>
        {user !== null && (
          <AdminTile title="Informations">
            <div style={{ padding: "1rem" }}>
              <Typography variant="h3">Identifiants de connexion</Typography>
              <div style={{ margin: "0.5rem 0 2rem 0" }}>
                <TextField variant="standard" label="Pseudo" value={user.pseudo || ""} color="secondary" fullWidth disabled={isBlocked} onChange={onChangeValue("pseudo")} />
                <TextField variant="standard" style={{ marginTop: "0.5rem" }} label="Email" value={user.email || ""} color="secondary" fullWidth disabled={isBlocked} onChange={onChangeValue("email")} />
                {isBlocked && (
                  <Button
                    style={{ marginTop: "0.8rem" }}
                    onClick={() => {
                      setIsBlockedModalOpen(true);
                    }}
                    variant="contained"
                    color="secondary"
                    size="small"
                  >
                    Changer les identifiants
                  </Button>
                )}
              </div>
              <Typography variant="h3">École</Typography>
              <div style={{ margin: "0.5rem 0 2rem 0" }}>
                <TextField
                  variant="standard"
                  label="École"
                  value={user.school || ""}
                  placeholder="Non renseignée"
                  color="secondary"
                  fullWidth
                  onChange={onChangeValue("school")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <TextField
                  variant="standard"
                  style={{ marginTop: "0.5rem" }}
                  label="Niveau de la classe"
                  value={user.level || ""}
                  placeholder="Non renseigné"
                  color="secondary"
                  fullWidth
                  onChange={onChangeValue("level")}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </div>
              <Typography variant="h3">Type de compte</Typography>
              <div style={{ margin: "0.5rem 0 2rem 0" }}>
                <FormControl component="fieldset">
                  <RadioGroup aria-label="type de compte" name="type" value={user.type} onChange={onChangeValue("type")}>
                    <FormControlLabel value={0} control={<Radio size="small" />} label="Compte classe" />
                    <FormControlLabel value={1} control={<Radio size="small" />} label="Compte administrateur" />
                    <FormControlLabel value={2} control={<Radio size="small" />} label="Super administrateur" />
                  </RadioGroup>
                </FormControl>
              </div>
              <div style={{ width: "100%", textAlign: "center" }}>
                <Button variant="contained" color="secondary" onClick={submit}>
                  Modifier
                </Button>
              </div>
            </div>
            <Modal
              open={isBlockedModalOpen}
              onClose={() => {
                setIsBlockedModalOpen(false);
              }}
              onConfirm={() => {
                setIsBlocked(false);
                setIsBlockedModalOpen(false);
              }}
              cancelLabel="Annuler"
              confirmLabel="Changer"
              title="Modifier les identifiants"
              ariaLabelledBy="up-dialog-title"
              ariaDescribedBy="up-dialog-description"
              fullWidth
            >
              <div>Attention, les identifiants sont nécessaires à la connection ! Êtes vous sur de vouloir les changer ?</div>
            </Modal>
          </AdminTile>
        )}
      </NoSsr>
      <Button variant="outlined" style={{ marginTop: "1rem" }} onClick={goToPath("/admin/users")}>
        Retour
      </Button>
      <Backdrop className={classes.backdrop} open={loading}>
        <CircularProgress color="inherit" />
      </Backdrop>
    </div>
  );
};

export default AdminEditUser;
