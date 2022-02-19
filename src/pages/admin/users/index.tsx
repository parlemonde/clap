import { useRouter } from "next/router";
import React from "react";

import AddCircleIcon from "@mui/icons-material/AddCircle";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import NoSsr from "@mui/material/NoSsr";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Table from "@mui/material/Table";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { Theme as MaterialTheme } from "@mui/material/styles";
import { makeStyles, createStyles, withStyles } from "@mui/styles";

import { AdminTile } from "src/components/admin/AdminTile";
import { DeleteUserModal } from "src/components/admin/users/DeleteUserModal";
import { InviteUserModal } from "src/components/admin/users/InviteUserModal";
import { UserServiceContext } from "src/services/UserService";
import { useUsers, UserArgs } from "src/services/useUsers";

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
    visuallyHidden: {
      border: 0,
      clip: "rect(0 0 0 0)",
      height: 1,
      margin: -1,
      overflow: "hidden",
      padding: 0,
      position: "absolute",
      top: 20,
      width: 1,
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

const userTypeNames = {
  0: "Classe",
  1: "Admin",
  2: "Super Admin",
};

const AdminUsers: React.FunctionComponent = () => {
  const classes = useTableStyles();
  const router = useRouter();
  const [args, setArgs] = React.useState<UserArgs>({
    page: 1,
    limit: 10,
  });
  const { user: currentUser } = React.useContext(UserServiceContext);
  const { users, count } = useUsers(args);
  const [deleteIndex, setDeleteIndex] = React.useState<number>(-1);
  const [inviteOpen, setInviteOpen] = React.useState<boolean>(false);

  const goToPath = (path: string) => (event: React.MouseEvent) => {
    event.preventDefault();
    router.push(path);
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setArgs({ ...args, page: newPage + 1 });
  };
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setArgs({ ...args, page: 1, limit: parseInt(event.target.value, 10) });
  };

  const onHeaderClick = (name: "id" | "email" | "pseudo" | "school" | "level") => () => {
    if (args.order === name) {
      setArgs({ ...args, page: 1, sort: args.sort === "asc" ? "desc" : "asc" });
    } else {
      setArgs({ ...args, page: 1, sort: "asc", order: name });
    }
  };

  const closeInviteOpen = React.useCallback(() => {
    setInviteOpen(false);
  }, []);

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Typography variant="h1" color="primary">
        Utilisateurs
      </Typography>
      <NoSsr>
        <AdminTile
          title="Liste des utilisateurs"
          toolbarButton={
            <Button
              onClick={() => {
                setInviteOpen(true);
              }}
              style={{ flexShrink: 0 }}
              variant="contained"
              startIcon={<AddCircleIcon />}
            >
              Inviter un utilisateur
            </Button>
          }
        >
          <Table aria-labelledby="themetabletitle" size="medium" aria-label="toutes les langues">
            {users.length > 0 ? (
              <>
                <TableHead style={{ borderBottom: "1px solid white" }} className={classes.toolbar}>
                  <TableRow>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel active={args.order === "pseudo"} direction={args.sort} onClick={onHeaderClick("pseudo")}>
                        Pseudo
                        {args.order === "pseudo" ? <span className={classes.visuallyHidden}>{args.sort === "desc" ? "sorted descending" : "sorted ascending"}</span> : null}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel active={args.order === "email"} direction={args.sort} onClick={onHeaderClick("email")}>
                        Email
                        {args.order === "email" ? <span className={classes.visuallyHidden}>{args.sort === "desc" ? "sorted descending" : "sorted ascending"}</span> : null}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel active={args.order === "school"} direction={args.sort} onClick={onHeaderClick("school")}>
                        École
                        {args.order === "school" ? <span className={classes.visuallyHidden}>{args.sort === "desc" ? "sorted descending" : "sorted ascending"}</span> : null}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>
                      <TableSortLabel active={args.order === "level"} direction={args.sort} onClick={onHeaderClick("level")}>
                        Niveau de la classe
                        {args.order === "level" ? <span className={classes.visuallyHidden}>{args.sort === "desc" ? "sorted descending" : "sorted ascending"}</span> : null}
                      </TableSortLabel>
                    </TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }}>Compte</TableCell>
                    <TableCell style={{ color: "white", fontWeight: "bold" }} align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.map((user, index) => (
                    <StyledTableRow key={user.id}>
                      <TableCell>{user.pseudo}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.school || <span style={{ color: "grey" }}>Non renseignée</span>}</TableCell>
                      <TableCell>{user.level || <span style={{ color: "grey" }}>Non renseigné</span>}</TableCell>
                      <TableCell padding="none">
                        <Chip size="small" label={userTypeNames[user.type]} />
                      </TableCell>
                      <TableCell align="right" padding="none" style={{ minWidth: "96px" }}>
                        <Tooltip title="Modifier">
                          <IconButton aria-label="edit" onClick={goToPath(`/admin/users/edit/${user.id}`)}>
                            <EditIcon />
                          </IconButton>
                        </Tooltip>
                        {user.id !== currentUser.id && (
                          <Tooltip title="Supprimer">
                            <IconButton
                              aria-label="delete"
                              onClick={() => {
                                setDeleteIndex(index);
                              }}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        )}
                      </TableCell>
                    </StyledTableRow>
                  ))}
                  <TableRow>
                    <TablePagination rowsPerPageOptions={[5, 10, 25]} count={count} rowsPerPage={args.limit || 10} page={(args.page || 1) - 1} onPageChange={handleChangePage} onRowsPerPageChange={handleChangeRowsPerPage} />
                  </TableRow>
                </TableBody>
              </>
            ) : (
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Cette liste est vide !
                  </TableCell>
                </TableRow>
              </TableBody>
            )}
          </Table>
        </AdminTile>
        <InviteUserModal open={inviteOpen} onClose={closeInviteOpen} />
        <DeleteUserModal
          user={deleteIndex === -1 ? null : users[deleteIndex] || null}
          onClose={() => {
            setDeleteIndex(-1);
          }}
        />
      </NoSsr>
    </div>
  );
};

export default AdminUsers;
