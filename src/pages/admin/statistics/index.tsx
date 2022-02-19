import { Chart } from "react-charts";
import { useQuery } from "react-query";
import React from "react";

import Typography from "@mui/material/Typography";
import { Divider, Paper, Grid, NoSsr } from "@mui/material";

import { UserServiceContext } from "src/services/UserService";

type statData = {
  userCount: number;
  classCount: number;
  projectCount: number;
  pdfCount: number;
} | null;

const levelAxes = [
  { primary: true, type: "ordinal", position: "left" },
  { position: "bottom", type: "linear", stacked: true },
];
const levelSerie = {
  type: "bar",
};
const pdfAxes = [
  { primary: true, type: "time", position: "bottom" },
  { position: "left", type: "linear" },
];

const AdminStats: React.FunctionComponent = () => {
  const { axiosLoggedRequest } = React.useContext(UserServiceContext);
  const getData = React.useCallback(
    (url: string) => async () => {
      const resp = await axiosLoggedRequest({
        method: "GET",
        url,
      });
      if (resp.error) {
        return null;
      }
      return resp.data;
    },
    [axiosLoggedRequest],
  );
  const { data: allStats } = useQuery<statData, unknown>("all-stats", getData("/statistics")); // eslint-disable-next-line
  const { data: levels } = useQuery<any, unknown>("level-stats", getData("/statistics/levels")); // eslint-disable-next-line
  const { data: pdf } = useQuery<any, unknown>("pdf-stats", getData("/statistics/pdf")); // eslint-disable-next-line
  const { data: projects } = useQuery<any, unknown>("projects-stats", getData("/statistics/projects"));

  const dataLevel = React.useMemo(
    () => [
      {
        label: "", // eslint-disable-next-line
        data: levels ? levels.map((l: any) => ({ primary: l.label || "Non renseigné", secondary: parseInt(l.count, 10) })) : [],
      },
    ],
    [levels],
  );
  const dataPDF = React.useMemo(
    () => [
      {
        label: "PDF", // eslint-disable-next-line
        data: pdf ? pdf.map((p: any) => ({ primary: new Date(p.date), secondary: p.count })) : [],
      },
    ],
    [pdf],
  );
  const dataProjects = React.useMemo(
    () => [
      {
        label: "Projects", // eslint-disable-next-line
        data: projects ? projects.map((p: any) => ({ primary: new Date(p.date), secondary: p.count })) : [],
      },
    ],
    [projects],
  );

  return (
    <div style={{ paddingBottom: "2rem" }}>
      <Typography variant="h1" color="primary">
        Statistiques
      </Typography>
      <Divider style={{ marginBottom: "1rem" }}></Divider>
      <Grid container justifyContent="space-between" spacing={3}>
        {/* UTILISATEURS */}
        <Grid item xs={6} md={3}>
          <Paper className="admin-stat-tile">
            <strong>{"Nombre d'utilisateurs"}</strong>
            <Divider />
            <div className="stat-number">{allStats?.userCount || 0}</div>
          </Paper>
        </Grid>
        <Grid item xs={6} md={3}>
          <Paper className="admin-stat-tile">
            <strong>{"Nombre de classes"}</strong>
            <Divider />
            <div className="stat-number">{allStats?.classCount || 0}</div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper className="admin-stat-tile">
            <strong>{"Répartition des classes"}</strong>
            <Divider />
            <NoSsr>
              {levels && (
                <div style={{ height: `${Math.max(4, 3 * dataLevel[0].data.length)}rem`, marginTop: `${Math.max(0, 7.5 - Math.max(4, 3 * dataLevel[0].data.length))}rem`, width: "95%", paddingTop: "0.5rem" }}>
                  <Chart data={dataLevel} series={levelSerie} axes={levelAxes} />
                </div>
              )}
            </NoSsr>
          </Paper>
        </Grid>

        {/* PROJETS */}
        <Grid item xs={12} md={3}>
          <Paper className="admin-stat-tile">
            <strong>{"Nombre de projets créés"}</strong>
            <Divider />
            <div className="stat-number">{allStats?.projectCount || 0}</div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper className="admin-stat-tile">
            <strong>{"Répartition des projets créés dans le temps"}</strong>
            <Divider />
            <NoSsr>
              {projects && (
                <div style={{ height: `7.8rem`, width: "95%", paddingTop: "0.5rem" }}>
                  <Chart data={dataProjects} axes={pdfAxes} tooltip />
                </div>
              )}
            </NoSsr>
          </Paper>
        </Grid>

        {/* PDF */}
        <Grid item xs={12} md={3}>
          <Paper className="admin-stat-tile">
            <strong>{"Nombre de pdf téléchargés"}</strong>
            <Divider />
            <div className="stat-number">{allStats?.pdfCount || 0}</div>
          </Paper>
        </Grid>
        <Grid item xs={12} md={9}>
          <Paper className="admin-stat-tile" style={{ overflow: "hidden" }}>
            <strong>{"Répartition des téléchargements dans le temps"}</strong>
            <Divider />
            <NoSsr>
              {pdf && (
                <div style={{ height: `7.8rem`, width: "95%", paddingTop: "0.5rem" }}>
                  <Chart data={dataPDF} axes={pdfAxes} tooltip />
                </div>
              )}
            </NoSsr>
          </Paper>
        </Grid>
      </Grid>
    </div>
  );
};

export default AdminStats;
