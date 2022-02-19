import { useQueryCache } from "react-query";
import React from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import BackupIcon from "@mui/icons-material/Backup";
import DeleteIcon from "@mui/icons-material/Delete";
import GetAppIcon from "@mui/icons-material/GetApp";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Link from "@mui/material/Link";
import NoSsr from "@mui/material/NoSsr";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Theme as MaterialTheme } from "@mui/material/styles";
import { makeStyles, createStyles, withStyles } from "@mui/styles";

import { AdminTile } from "src/components/admin/AdminTile";
import { AddLanguageModal } from "src/components/admin/languages/AddLanguageModal";
import { DeleteLanguageModal } from "src/components/admin/languages/DeleteLanguageModal";
import { UploadLanguageModal } from "src/components/admin/languages/UploadLanguageModal";
import { useLanguages } from "src/services/useLanguages";
import type { Language } from "types/models/language.type";

const useTableStyles = makeStyles((theme: MaterialTheme) =>
  createStyles({
    toolbar: {
      backgroundColor: theme.palette.secondary.main,
      color: "white",
      fontWeight: "bold",
      minHeight: "unset",
      padding: "8px 8px 8px 16px",
    },
    title: {
      flex: "1 1 100%",
    },
    button: {
      color: "white",
    },
  }),
);

const StyledTableRow = withStyles(() =>
  createStyles({
    root: {
      backgroundColor: "white",
      "&:nth-of-type(even)": {
        backgroundColor: "rgb(224 239 232)",
      },
      "&.sortable-ghost": {
        opacity: 0,
      },
    },
  }),
)(TableRow);

const AdminLanguages: React.FunctionComponent = () => {
  const queryCache = useQueryCache();
  const classes = useTableStyles();
  const { languages } = useLanguages();
  const [isAddModalOpen, setIsAddModalOpen] = React.useState<boolean>(false);
  const [uploadLanguageIndex, setUploadLanguageIndex] = React.useState<number>(-1);
  const [deleteLanguageIndex, setDeleteLanguageIndex] = React.useState<number>(-1);

  const setLanguages = React.useCallback(
    (f: (ll: Language[]) => Language[]) => {
      queryCache.setQueryData(["languages"], f(languages));
    },
    [languages, queryCache],
  );

  const onDownload = (l: Language) => async (event: React.MouseEvent) => {
    event.preventDefault();
    window.open(`/api/locales/${l.value}.po`);
  };

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Typography variant="h1" color="primary">
        Langues
      </Typography>
      <NoSsr>
        <AdminTile
          title="Liste des langues"
          toolbarButton={
            <Button
              onClick={() => {
                setIsAddModalOpen(true);
              }}
              style={{ flexShrink: 0 }}
              variant="contained"
              startIcon={<AddCircleIcon />}
            >
              Ajouter une langue
            </Button>
          }
        >
          <Table aria-labelledby="themetabletitle" size="medium" aria-label="toutes les langues">
            {languages.length > 0 ? (
              <>
                <TableHead style={{ borderBottom: "1px solid white" }} className={classes.toolbar}>
                  <TableRow>
                    <TableCell style={{ color: "white", fontWeight: "bold", maxWidth: "2rem" }}>Code langue</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>Langue</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {languages.map((l, index) => (
                    <StyledTableRow key={l.value}>
                      <TableCell style={{ maxWidth: "2rem" }}>
                        <strong>{l.value.toUpperCase()}</strong>
                      </TableCell>
                      <TableCell>{l.label}</TableCell>
                      <TableCell align="right" padding="none" style={{ minWidth: "96px" }}>
                        <Tooltip title="Télécharger le fichier des traductions (.po)">
                          <IconButton aria-label="edit" onClick={onDownload(l)}>
                            <GetAppIcon />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Uploader le fichier des traductions">
                          <IconButton
                            aria-label="edit"
                            onClick={() => {
                              setUploadLanguageIndex(index);
                            }}
                          >
                            <BackupIcon />
                          </IconButton>
                        </Tooltip>
                        {l.value !== "fr" && (
                          <Tooltip title="Supprimer">
                            <IconButton
                              aria-label="delete"
                              onClick={() => {
                                setDeleteLanguageIndex(index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={3} align="center">
                    Cette liste est vide !{" "}
                    <Link
                      onClick={() => {
                        setIsAddModalOpen(true);
                      }}
                      style={{ cursor: "pointer" }}
                      color="secondary"
                    >
                      Ajouter une langue ?
                    </Link>
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </AdminTile>
        <AddLanguageModal
          open={isAddModalOpen}
          onClose={() => {
            setIsAddModalOpen(false);
          }}
          setLanguages={setLanguages}
        />
        <UploadLanguageModal
          language={uploadLanguageIndex === -1 ? null : languages[uploadLanguageIndex] || null}
          onClose={() => {
            setUploadLanguageIndex(-1);
          }}
        />
        <DeleteLanguageModal
          language={deleteLanguageIndex === -1 ? null : languages[deleteLanguageIndex] || null}
          onClose={() => {
            setDeleteLanguageIndex(-1);
          }}
          setLanguages={setLanguages}
        />
      </NoSsr>
    </div>
  );
};

export default AdminLanguages;
