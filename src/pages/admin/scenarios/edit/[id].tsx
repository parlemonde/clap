import type { AxiosRequestConfig } from "axios";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { useQueryCache } from "react-query";
import React from "react";

import Close from "@mui/icons-material/Close";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import Backdrop from "@mui/material/Backdrop";
import Breadcrumbs from "@mui/material/Breadcrumbs";
import Button from "@mui/material/Button";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import Card from "@mui/material/Card";
import CircularProgress from "@mui/material/CircularProgress";
import FormControl from "@mui/material/FormControl";
import IconButton from "@mui/material/IconButton";
import InputLabel from "@mui/material/InputLabel";
import Link from "@mui/material/Link";
import NoSsr from "@mui/material/NoSsr";
import Select from "@mui/material/Select";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";

import { Modal } from "src/components/Modal";
import { AdminTile } from "src/components/admin/AdminTile";
import { UserServiceContext } from "src/services/UserService";
import { useLanguages } from "src/services/useLanguages";
import type { AxiosReturnType } from "src/util/axiosRequest";
import { GroupedScenario, groupScenarios } from "src/util/groupScenarios";
import { getQueryString } from "src/util";
import type { Language } from "types/models/language.type";

const getUpdateRequest = (scenario: GroupedScenario, language: string): AxiosRequestConfig => ({
  method: "PUT",
  url: `/scenarios/${scenario.id}_${language}`,
  data: {
    name: scenario.names[language] || "",
    description: scenario.descriptions[language] || "",
  },
});
const getAddRequest = (scenario: GroupedScenario, language: string): AxiosRequestConfig => ({
  method: "POST",
  url: `/scenarios`,
  data: {
    id: scenario.id,
    languageCode: language,
    themeId: scenario.themeId,
    isDefault: true,
    name: scenario.names[language] || "",
    description: scenario.descriptions[language] || "",
  },
});
const getDeleteRequest = (scenario: GroupedScenario, language: string): AxiosRequestConfig => ({
  method: "DELETE",
  url: `/scenarios/${scenario.id}_${language}`,
});

const AdminEditScenario: React.FunctionComponent = () => {
  const router = useRouter();
  const { enqueueSnackbar } = useSnackbar();
  const scenarioId = React.useMemo(() => parseInt(getQueryString(router.query.id), 10) || 0, [router]);
  const queryCache = useQueryCache();
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const { languages, isLoading } = useLanguages();
  const languagesMap = React.useMemo(() => languages.reduce((acc: { [key: string]: number }, language: Language, index: number) => ({ ...acc, [language.value]: index }), {}), [languages]);
  const [scenario, setScenario] = React.useState<GroupedScenario>({
    id: -1,
    themeId: -1,
    names: {},
    descriptions: {},
    isDefault: true,
  });
  const [initialLanguages, setInitialLanguages] = React.useState<string[]>([]);
  const [showModal, setShowModal] = React.useState<boolean>(false);
  const [languageToAdd, setLanguageToAdd] = React.useState<number>(0);
  const [selectedLanguages, setSelectedLanguages] = React.useState<number[]>([]);
  const [loading, setLoading] = React.useState<boolean>(false);
  const availableLanguages = languages.filter((_l, index) => !selectedLanguages.includes(index));

  const goToPath = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };
  const onAddLanguage = () => {
    setShowModal(false);
    setSelectedLanguages([...selectedLanguages, languagesMap[availableLanguages[languageToAdd].value]]);
    setLanguageToAdd(0);
  };
  const onDeleteLanguage = (deleteIndex: number) => () => {
    const language = languages[selectedLanguages[deleteIndex]];
    const s = [...selectedLanguages];
    s.splice(deleteIndex, 1);
    setSelectedLanguages(s);
    const newScenario = { ...scenario };
    delete newScenario.names[language.value];
    delete newScenario.descriptions[language.value];
    setScenario(newScenario);
  };

  const getScenario = React.useCallback(async () => {
    if (isLoading) {
      return;
    }
    const response = await axiosLoggedRequest({
      method: "GET",
      url: `/scenarios/${scenarioId}`,
    });
    if (response.error) {
      router.push("/admin/scenarios");
    } else {
      const groupedScenarios = groupScenarios(response.data);
      setScenario(groupedScenarios[0]);
      setSelectedLanguages(
        Object.keys(groupedScenarios[0].names)
          .filter((key) => key !== "default")
          .map((languageValue) => languagesMap[languageValue] || 0),
      );
      setInitialLanguages(Object.keys(groupedScenarios[0].names).filter((key) => key !== "default"));
    }
  }, [axiosLoggedRequest, router, scenarioId, isLoading, languagesMap]);

  React.useEffect(() => {
    getScenario().catch((e) => console.error(e));
  }, [getScenario]);

  const onNameInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScenario = { ...scenario };
    newScenario.names[languageValue] = event.target.value;
    setScenario(newScenario);
  };
  const onDescInputChange = (languageValue: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const newScenario = { ...scenario };
    newScenario.descriptions[languageValue] = event.target.value;
    setScenario(newScenario);
  };

  const onSubmit = async () => {
    const usedLanguages = Object.keys(scenario.names).filter((key) => key !== "default");
    if (scenario.id === -1 || usedLanguages.length === 0) {
      enqueueSnackbar("Le nom du scénario ne peut pas être vide.", {
        variant: "error",
      });
      return;
    }
    setLoading(true);
    const responses: Promise<AxiosReturnType>[] = [];
    for (let i = 0, n = usedLanguages.length; i < n; i++) {
      responses.push(axiosLoggedRequest(initialLanguages.includes(usedLanguages[i]) ? getUpdateRequest(scenario, usedLanguages[i]) : getAddRequest(scenario, usedLanguages[i])));
    }
    for (const l of initialLanguages) {
      if (!usedLanguages.includes(l)) {
        responses.push(axiosLoggedRequest(getDeleteRequest(scenario, l)));
      }
    }
    await Promise.all(responses);
    setLoading(false);
    enqueueSnackbar("Scénario modifié avec succès!", {
      variant: "success",
    });
    queryCache.invalidateQueries("scenarios");
    router.push("/admin/scenarios");
  };

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Breadcrumbs separator={<NavigateNextIcon fontSize="large" color="primary" />} aria-label="breadcrumb">
        <Link href="/admin/scenarios" onClick={goToPath("/admin/scenarios")}>
          <Typography variant="h1" color="primary">
            Scénarios
          </Typography>
        </Link>
        <Typography variant="h1" color="textPrimary">
          {scenario.names.default || "Modifier un scenario"}
        </Typography>
      </Breadcrumbs>
      <NoSsr>
        <AdminTile title="Modifier un scénario">
          <div style={{ padding: "1rem" }}>
            <Typography variant="h3" color="textPrimary">
              Scénario :
            </Typography>
            {selectedLanguages.map((languageIndex, index) => (
              <Card key={languages[languageIndex].value} variant="outlined" style={{ margin: "8px 0" }}>
                <CardActions>
                  <div style={{ marginLeft: "8px", fontWeight: "bold" }}>{languages[languageIndex].label}</div>
                  {selectedLanguages.length > 1 && (
                    <IconButton style={{ marginLeft: "auto" }} size="small" onClick={onDeleteLanguage(index)}>
                      <Close />
                    </IconButton>
                  )}
                </CardActions>
                <CardContent style={{ paddingTop: "0" }}>
                  <TextField variant="standard" label="Nom" value={scenario.names[languages[languageIndex].value] || ""} onChange={onNameInputChange(languages[languageIndex].value)} color="secondary" fullWidth />
                  <TextField
                    variant="standard"
                    style={{ marginTop: "8px" }}
                    label="Description"
                    value={scenario.descriptions[languages[languageIndex].value] || ""}
                    onChange={onDescInputChange(languages[languageIndex].value)}
                    color="secondary"
                    multiline
                    fullWidth
                  />
                </CardContent>
              </Card>
            ))}
            {availableLanguages.length > 0 && (
              <Button
                variant="outlined"
                onClick={() => {
                  setShowModal(true);
                }}
              >
                Ajouter une langue
              </Button>
            )}

            <div style={{ width: "100%", textAlign: "center", marginTop: "1rem" }}>
              <Button color="secondary" variant="contained" onClick={onSubmit}>
                Modifier le scénario !
              </Button>
            </div>
          </div>
        </AdminTile>
        <Button variant="outlined" style={{ marginTop: "1rem" }} onClick={goToPath("/admin/scenarios")}>
          Retour
        </Button>
        <Backdrop
          sx={{
            zIndex: (theme) => theme.zIndex.drawer + 1,
            color: "#fff",
          }}
          open={loading}
        >
          <CircularProgress color="inherit" />
        </Backdrop>

        {/* language modal */}
        <Modal
          open={showModal}
          onClose={() => {
            setShowModal(false);
          }}
          onConfirm={onAddLanguage}
          confirmLabel="Ajouter"
          cancelLabel="Annuler"
          title="Ajouter une langue"
          ariaLabelledBy="add-dialog"
          ariaDescribedBy="add-dialog-desc"
        >
          {availableLanguages.length > 0 && (
            <FormControl variant="outlined" style={{ minWidth: "15rem" }} className="mobile-full-width">
              <InputLabel htmlFor="langage">Languages</InputLabel>
              <Select
                native
                value={languageToAdd}
                onChange={(event) => {
                  setLanguageToAdd(typeof event.target.value === "number" ? event.target.value : parseInt(event.target.value, 10));
                }}
                label={"Langages"}
                inputProps={{
                  name: "langage",
                  id: "langage",
                }}
              >
                {availableLanguages.map((l, index) => (
                  <option value={index} key={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </FormControl>
          )}
        </Modal>
      </NoSsr>
    </div>
  );
};

export default AdminEditScenario;
