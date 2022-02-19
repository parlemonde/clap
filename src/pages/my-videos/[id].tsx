import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useQueryCache } from "react-query";
import React from "react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Modal } from "src/components/Modal";
import { Trans } from "src/components/Trans";
import { useTranslation } from "src/i18n/useTranslation";
import { UserServiceContext } from "src/services/UserService";
import { getQueryString } from "src/util";
import type { Project } from "types/models/project.type";

const EditProject: React.FC = () => {
  const router = useRouter();
  const { t, currentLocale } = useTranslation();
  const queryCache = useQueryCache();
  const { enqueueSnackbar } = useSnackbar();
  const { axiosLoggedRequest, isLoggedIn } = React.useContext(UserServiceContext);
  const projectId = React.useMemo(() => parseInt(getQueryString(router.query.id), 10) || 0, [router]);
  const [project, setProject] = React.useState<Project | null>(null);
  const [projectTitle, setProjectTitle] = React.useState<string>("");
  const [showModal, setShowModal] = React.useState<number>(-1);
  const [hasError, setHasError] = React.useState(false);

  const getProject = React.useCallback(async () => {
    const response = await axiosLoggedRequest({
      method: "GET",
      url: `/projects/${projectId}`,
    });
    if (!response.error) {
      setProject(response.data);
    } else {
      router.push("/create");
    }
  }, [projectId, router, axiosLoggedRequest]);
  React.useEffect(() => {
    if (!isLoggedIn) {
      router.push("/create");
    }
    getProject().catch();
  }, [isLoggedIn, router, getProject]);

  React.useEffect(() => {
    setProjectTitle(project?.title || "");
  }, [project]);

  const onUpdateProject = async () => {
    if (projectTitle.length === 0) {
      setHasError(true);
      return;
    }
    const response = await axiosLoggedRequest({
      method: "PUT",
      url: `/projects/${projectId}`,
      data: {
        title: projectTitle,
      },
    });
    if (!response.error) {
      enqueueSnackbar("Projet modifié !", {
        variant: "success",
      });
      setProject({ ...project, title: projectTitle });
      queryCache.invalidateQueries("projects");
    } else {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
    }
    setShowModal(-1);
  };

  const onDeleteProject = async () => {
    const response = await axiosLoggedRequest({
      method: "DELETE",
      url: `/projects/${projectId}`,
    });
    if (!response.error) {
      enqueueSnackbar("Projet supprimé !", {
        variant: "success",
      });
      queryCache.invalidateQueries("projects");
      router.push("/my-videos");
    } else {
      enqueueSnackbar("Une erreur inconnue est survenue...", {
        variant: "error",
      });
    }
    setShowModal(-1);
  };

  if (project === null) {
    return <div></div>;
  }

  return (
    <div>
      <div className="text-center" style={{ margin: "1rem 0" }}>
        <Typography color="primary" variant="h1" style={{ display: "inline" }}>
          {t("project")}
        </Typography>
        <Typography color="inherit" variant="h1" style={{ display: "inline", marginLeft: "0.5rem" }}>
          {project.title}
        </Typography>
      </div>
      <div style={{ maxWidth: "800px", margin: "auto", paddingBottom: "2rem" }}>
        <Typography variant="h2">{t("project_details")}</Typography>
        <div style={{ marginTop: "0.5rem" }}>
          <label>
            <strong>{t("project_name")} : </strong>
          </label>
          {project.title} -{" "}
          <Link
            style={{ cursor: "pointer" }}
            onClick={() => {
              setShowModal(1);
            }}
          >
            {t("account_change_button")}
          </Link>
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ marginRight: "0.5rem" }}>
            <strong>{t("pdf_theme")}</strong>
          </label>
          {project.theme.names[currentLocale] || project.theme.names.fr}
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ marginRight: "0.5rem" }}>
            <strong>{t("pdf_scenario")}</strong>
          </label>
          {project.scenario.name}
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ marginRight: "0.5rem" }}>
            <strong>{t("project_question_number")}</strong>
          </label>
          {project.questions.length}
        </div>
        <div style={{ marginTop: "0.5rem" }}>
          <label style={{ marginRight: "0.5rem" }}>
            <strong>{t("project_plan_number")}</strong>
          </label>
          {project.questions.reduce<number>((n, q) => n + (q.plans || []).length, 0)}
        </div>
        <Button
          style={{ marginTop: "0.8rem" }}
          className="mobile-full-width"
          onClick={() => {
            router.push(`/create/3-storyboard-and-filming-schedule?project=${projectId}`);
          }}
          variant="contained"
          color="secondary"
          size="small"
        >
          {t("project_see_plans")}
        </Button>
        <Divider style={{ margin: "1rem 0 1.5rem" }} />
        <Typography variant="h2">{t("project_delete")}</Typography>
        <Button
          sx={{
            color: (theme) => theme.palette.error.contrastText,
            background: (theme) => theme.palette.error.light,
            "&:hover": {
              backgroundColor: (theme) => theme.palette.error.dark,
            },
          }}
          style={{ marginTop: "0.8rem" }}
          onClick={() => setShowModal(2)}
          className="mobile-full-width"
          variant="contained"
          size="small"
        >
          {t("project_delete")}
        </Button>
      </div>

      <Modal
        open={showModal === 1}
        onClose={() => {
          setProjectTitle(project.title);
          setShowModal(-1);
        }}
        onConfirm={onUpdateProject}
        confirmLabel={t("edit")}
        cancelLabel={t("cancel")}
        title={t("project_name")}
        ariaLabelledBy="project-dialog-title"
        ariaDescribedBy="project-dialog-description"
        fullWidth
      >
        <div id="project-dialog-description">
          <TextField
            fullWidth
            variant="outlined"
            value={projectTitle}
            InputLabelProps={{
              shrink: true,
            }}
            placeholder={t("project_name")}
            label={t("project_name")}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
              setProjectTitle(event.target.value || "");
            }}
            className={hasError ? "shake" : ""}
            error={hasError}
            helperText={hasError ? t("signup_required") : ""}
            color="secondary"
          />
        </div>
      </Modal>
      <Modal
        open={showModal === 2}
        onClose={() => setShowModal(-1)}
        onConfirm={onDeleteProject}
        confirmLabel={t("delete")}
        cancelLabel={t("cancel")}
        title={t("project_delete_title")}
        ariaLabelledBy="delete-dialog-title"
        ariaDescribedBy="delete-dialog-description"
        fullWidth
        error
      >
        <div id="delete-dialog-description">
          <Alert severity="error" style={{ marginBottom: "1rem" }}>
            <Trans i18nKey="project_delete_desc1" i18nParams={{ projectTitle: project.title }}>
              Attention! Êtes-vous sur de vouloir supprimer le projet <strong>{project.title}</strong> ? Cette action est <strong>irréversible</strong> et supprimera toutes les données du projet incluant questions, plans et images.
            </Trans>
            <br />
          </Alert>
        </div>
      </Modal>
    </div>
  );
};

export default EditProject;
