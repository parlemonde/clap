/* eslint-disable @next/next/no-img-element */

import type { CSSProperties } from 'react';

import type { ProjectData } from '@server/database/schemas/projects';

export type StoryboardPdfLabels = {
    title: string;
    subtitleDescription: string;
    theme: string;
    scenario: string;
    subtitleStoryboard: string;
    subtitleToCamera: string;
    toCameraDescription: string;
};

export interface StoryboardPdfTemplateProps {
    hostUrl: string;
    currentLocale: string;
    project: ProjectData & {
        name?: string | null;
    };
    pseudo: string | null;
    scenarioDescription: string | null;
    logoFont: string;
    userLogo: string;
    labels: StoryboardPdfLabels;
    qrCode?: string | null;
}

export const storyboardPdfStyles = `
.StoryboardPdf_root {
box-sizing: border-box;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
color: rgba(0, 0, 0, 0.87);
margin: 0 auto;
padding: 1cm;
font-size: 0.875rem;
font-family: Open Sans, Arial, sans-serif;
font-weight: 400;
line-height: 1.43;
background-color: #fff;
width: 21cm;
min-height: 29cm;
-webkit-print-color-adjust: exact !important;
print-color-adjust: exact !important;
font-variant-ligatures: none !important;
}
.StoryboardPdf_root *,
.StoryboardPdf_root *::before,
.StoryboardPdf_root *::after {
box-sizing: inherit;
}
.StoryboardPdf_root strong,
.StoryboardPdf_root b {
font-weight: 700;
}
.StoryboardPdf_root h1,
.StoryboardPdf_root h2,
.StoryboardPdf_root h3,
.StoryboardPdf_root h4,
.StoryboardPdf_root h5,
.StoryboardPdf_root h6,
.StoryboardPdf_root p {
margin: 0;
padding: 0;
}
.StoryboardPdf_materialIcon {
font-family: "Material Icons";
font-weight: normal;
font-style: normal;
font-size: 24px;
display: inline-block;
line-height: 1;
text-transform: none;
letter-spacing: normal;
word-wrap: normal;
white-space: nowrap;
direction: ltr;
-webkit-font-smoothing: antialiased;
text-rendering: optimizeLegibility;
-moz-osx-font-smoothing: grayscale;
font-feature-settings: "liga";
}
@media print {
.StoryboardPdf_root {
padding: 0;
background-color: #fff;
margin: 0;
}
}
@page {
margin: 1cm;
}
.StoryboardPdf_header {
width: 100%;
display: flex;
flex-direction: row;
justify-content: space-between;
}
.StoryboardPdf_headerGroup {
display: flex;
flex-direction: row;
align-items: center;
}
.StoryboardPdf_pseudo {
font-size: 1rem;
font-weight: 400;
margin-left: 0.25rem;
}
.StoryboardPdf_logoSvg {
margin: 0 0.5rem 0 0;
padding: 0;
}
.StoryboardPdf_logoTitle {
font-family: littledays, Alegreya Sans, sans-serif;
font-size: 1.4rem;
font-weight: 700;
padding-top: 0.25rem;
}
.StoryboardPdf_textCenter {
width: 100%;
text-align: center;
}
.StoryboardPdf_content {
width: 100%;
padding: 0.8rem 1rem 1.2rem 1rem;
}
.StoryboardPdf_label {
display: inline;
text-decoration: underline;
}
.StoryboardPdf_inline {
display: inline;
}
.StoryboardPdf_plan {
page-break-inside: avoid;
margin: -1px 0 0 0;
border: 1px solid black;
display: flex;
}
.StoryboardPdf_plans > .StoryboardPdf_plan:first-child {
margin-top: 0.5rem;
}
.StoryboardPdf_planImage,
.StoryboardPdf_title {
padding: 0.5rem;
width: 6.5cm;
height: 5cm;
min-width: 6.5cm;
min-height: 5cm;
border-right: 1px solid black;
background-repeat: no-repeat;
background-size: contain;
background-position: center;
position: relative;
}
.StoryboardPdf_title {
display: flex;
justify-content: center;
align-items: center;
}
.StoryboardPdf_title h4 {
position: absolute;
}
.StoryboardPdf_planDescription {
padding: 0.5rem;
border-left: 1px solid black;
margin-left: -1px;
white-space: pre-wrap;
}
.StoryboardPdf_scene > h3 {
page-break-after: avoid;
}
`;

const logoSvg = `
<svg class="StoryboardPdf_logoSvg" width="1cm" height="0.98cm" viewBox="0 0 1138 1113" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <title>Pelico</title>
  <defs>
    <filter id="filter-1" x="-12.0%" y="-1.3%" width="113.9%" height="110.4%" filterUnits="objectBoundingBox">
      <feOffset dx="0" dy="6" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
      <feGaussianBlur stdDeviation="5.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
      <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.2 0" type="matrix" in="shadowBlurOuter1" result="shadowMatrixOuter1"></feColorMatrix>
      <feMerge>
        <feMergeNode in="shadowMatrixOuter1"></feMergeNode>
        <feMergeNode in="SourceGraphic"></feMergeNode>
      </feMerge>
    </filter>
    <linearGradient id="linearGradient-2" x1="50%" y1="100%" x2="50%" y2="0%">
      <stop stop-color="#79C3A5" offset="0%"></stop>
      <stop stop-color="#54A987" offset="100%"></stop>
    </linearGradient>
  </defs>
  <g id="UI" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
    <g id="App-icons" transform="translate(0.000000, -1097.000000)">
      <g id="iOS" filter="url(#filter-1)" transform="translate(103.000000, 1102.000000)">
        <rect id="masky-mcmask" x="0" y="0" width="1024" height="1024"></rect>
        <g id="UI/AppIcon/Background" fill="url(#linearGradient-2)">
          <rect id="very-nice-background" x="0" y="0" width="1024" height="1024"></rect>
        </g>
        <g id="Pelico_app_android" transform="translate(-103.000000, 193.000000)">
          <g id="corps">
            <path id="Path" d="M0,507.824776 C20.0387821,440.196757 47.4522874,371.741948 82.240516,302.460349 C97.709574,271.653346 124.75352,199.746419 166.089362,128.96493 C179.729096,105.608913 214.022312,69.2113557 266.479896,43.6724104 C288.802394,32.8047148 331.795118,18.8561817 377.583361,10.973781 C409.155083,5.53874026 440.391879,1.56419751 463.100233,1.0232746 C480.836992,0.600777253 495.963303,-0.420055205 495.963303,18.7499513 C495.963303,37.0754493 507.308869,305.208978 530,823.150538 C261.798632,926.807888 107.231206,921.942297 66.2977227,808.553763 C25.3642395,695.16523 3.26499864,594.922235 0,507.824776 Z" fill="#000000"></path>
            <path id="Path-2" d="M526.802254,749.346011 L284.35782,267.569903 C239.701407,184.342527 246.006294,130.168961 303.272479,105.049204 C360.538665,79.9294482 424.768939,50.6991167 495.963303,17.3582099 L526.802254,749.346011 Z" fill="#FFFFFF"></path>
            <ellipse id="Oval" fill="#000000" cx="386.386485" cy="190.961413" rx="55.3052604" ry="55.2293771"></ellipse>
          </g>
          <path id="Path-3" d="M509.211692,341 L1002,341 C982.500125,228.499789 952.868211,153.480177 913.104256,115.941165 C869.630089,74.8995405 827.174031,50.0794649 767.28562,34.2598665 C724.216973,22.8832298 633.788433,18.3138726 496,20.5517949 L509.211692,341 Z" fill="#FCA34B"></path>
          <path id="Path-3" d="M506.991884,278 L905,278 C889.270252,207.976775 865.367404,161.282505 833.291456,137.917192 C798.222631,112.371756 763.975073,96.9230583 715.665553,87.0765053 C680.923844,79.9953737 608.701994,77.0575569 499,78.2630548 L506.991884,278 Z" fill="#FCD74B"></path>
        </g>
      </g>
    </g>
  </g>
</svg>
`;

export const getPdfImageUrl = (hostUrl: string, imageUrl: string): string => {
    if (!imageUrl) {
        return '';
    }
    if (/^https?:\/\//.test(imageUrl)) {
        return imageUrl;
    }
    return `${hostUrl}${imageUrl}`;
};

const titleStyle: CSSProperties = {
    margin: '0.5rem 0',
};

const projectNameStyle: CSSProperties = {
    margin: '0 0 0.5rem 0',
};

const qrCodeStyle: CSSProperties = {
    height: '4cm',
    width: '4cm',
};

const getQuestionsWithPlanNumbers = (questions: StoryboardPdfTemplateProps['project']['questions']) => {
    return questions.reduce<
        Array<{
            numberedPlans: Array<{
                number: number;
                plan: (typeof questions)[number]['plans'][number];
            }>;
            question: (typeof questions)[number];
        }>
    >((acc, question) => {
        const previousNumber = acc.at(-1)?.numberedPlans.at(-1)?.number ?? 0;
        const numberedPlans = question.plans.map((plan, index) => ({
            number: previousNumber + index + 1,
            plan,
        }));

        return [...acc, { numberedPlans, question }];
    }, []);
};

export function StoryboardPdfContent({ hostUrl, project, pseudo, scenarioDescription, userLogo, labels, qrCode }: StoryboardPdfTemplateProps) {
    const questionsWithPlanNumbers = getQuestionsWithPlanNumbers(project.questions);

    return (
        <div className="StoryboardPdf_root">
            <header className="StoryboardPdf_header">
                <div className="StoryboardPdf_headerGroup">
                    <div dangerouslySetInnerHTML={{ __html: logoSvg }} />
                    <h6 className="StoryboardPdf_logoTitle">Par Le Monde</h6>
                </div>
                {pseudo && userLogo ? (
                    <div className="StoryboardPdf_headerGroup">
                        <img width="30" height="auto" alt="user" src={`data:image/png;base64,${userLogo}`} />
                        <h6 className="StoryboardPdf_pseudo">{pseudo}</h6>
                    </div>
                ) : null}
            </header>
            <main>
                <div className="StoryboardPdf_textCenter">
                    <h1 style={titleStyle}>{labels.title}</h1>
                </div>
                {project.name ? (
                    <div className="StoryboardPdf_textCenter">
                        <h2 style={projectNameStyle}>{project.name}</h2>
                    </div>
                ) : null}
                <div>
                    <h2>{labels.subtitleDescription}</h2>
                    <div className="StoryboardPdf_content">
                        <div style={{ margin: '0.1rem 0' }}>
                            <label className="StoryboardPdf_label">{labels.theme}</label>
                            <p className="StoryboardPdf_inline"> {project.themeName}</p>
                        </div>
                        <div style={{ margin: '0.1rem 0' }}>
                            <label className="StoryboardPdf_label">{labels.scenario}</label>
                            <p className="StoryboardPdf_inline"> {project.scenarioName}</p>
                        </div>
                        {scenarioDescription ? <p>{scenarioDescription}</p> : null}
                    </div>
                </div>
                <div>
                    <h2>{labels.subtitleStoryboard}</h2>
                    {questionsWithPlanNumbers.map(({ question, numberedPlans }, questionIndex) => (
                        <div key={question.id} className="StoryboardPdf_content StoryboardPdf_scene">
                            <h3>
                                {questionIndex + 1}. {question.question}
                            </h3>
                            <div className="StoryboardPdf_plans">
                                {question.title ? (
                                    <div className="StoryboardPdf_plan">
                                        <div className="StoryboardPdf_title">
                                            <h4>{question.title.text}</h4>
                                        </div>
                                        <div className="StoryboardPdf_planDescription" />
                                    </div>
                                ) : null}
                                {numberedPlans.map(({ number, plan }) => {
                                    const imageUrl = getPdfImageUrl(hostUrl, plan.imageUrl);
                                    return (
                                        <div key={plan.id} className="StoryboardPdf_plan">
                                            <div
                                                className="StoryboardPdf_planImage"
                                                style={
                                                    imageUrl
                                                        ? {
                                                              backgroundImage: `url(${imageUrl})`,
                                                          }
                                                        : undefined
                                                }
                                            >
                                                <div className="StoryboardPdf_planNumber">{number}</div>
                                            </div>
                                            <div className="StoryboardPdf_planDescription">{plan.description}</div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                {qrCode ? (
                    <div>
                        <h2>{labels.subtitleToCamera}</h2>
                        <div className="StoryboardPdf_content">
                            <p>{labels.toCameraDescription}</p>
                            <div className="StoryboardPdf_textCenter" style={{ marginTop: '1rem' }}>
                                <img alt="qrcode" style={qrCodeStyle} src={qrCode} />
                            </div>
                        </div>
                    </div>
                ) : null}
            </main>
        </div>
    );
}
