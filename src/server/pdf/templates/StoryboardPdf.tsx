/* eslint-disable @next/next/no-head-element, @next/next/no-img-element, @next/next/no-page-custom-font */

import type { CSSProperties } from 'react';

import type { StoryboardPdfTemplateProps } from './templates.types';

const pdfStyles = `
html {
box-sizing: border-box;
-webkit-font-smoothing: antialiased;
-moz-osx-font-smoothing: grayscale;
}
*,
*::before,
*::after {
box-sizing: inherit;
}
strong,
b {
font-weight: 700;
}
h1,
h2,
h3,
h4,
h5,
h6,
p {
margin: 0;
padding: 0;
}
.material-icons {
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
body {
color: rgba(0, 0, 0, 0.87);
margin: 0;
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
@media print {
body {
padding: 0;
background-color: #fff;
}
}
body::backdrop {
background-color: #fff;
}
@page {
margin: 1cm;
}
header {
width: 100%;
display: flex;
flex-direction: row;
justify-content: space-between;
}
header > div {
display: flex;
flex-direction: row;
align-items: center;
}
h6.pseudo {
font-size: 1rem;
font-weight: 400;
margin-left: 0.25rem;
}
.logo-svg {
margin: 0 0.5rem 0 0;
padding: 0;
}
.logo-title {
font-family: littledays, Alegreya Sans, sans-serif;
font-size: 1.4rem;
font-weight: 700;
padding-top: 0.25rem;
}
.text-center {
width: 100%;
text-align: center;
}
.content {
width: 100%;
padding: 0.8rem 1rem 1.2rem 1rem;
}
label {
display: inline;
text-decoration: underline;
}
p.inline {
display: inline;
}
.plan {
page-break-inside: avoid;
margin: -1px 0 0 0;
border: 1px solid black;
display: flex;
}
.plans > .plan:first-child {
margin-top: 0.5rem;
}
.plan-image,
.title {
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
.title {
display: flex;
justify-content: center;
align-items: center;
}
.title h4 {
position: absolute;
}
.plan-description {
padding: 0.5rem;
border-left: 1px solid black;
margin-left: -1px;
}
.scene > h3 {
page-break-after: avoid;
}
`;

const logoSvg = `
<svg class="logo-svg" width="1cm" height="0.98cm" viewBox="0 0 1138 1113" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
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

const getImageUrl = (hostUrl: string, imageUrl: string): string => {
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

export function StoryboardPdfTemplate({
    hostUrl,
    currentLocale,
    project,
    pseudo,
    scenarioDescription,
    logoFont,
    userLogo,
    labels,
    qrCode,
}: StoryboardPdfTemplateProps) {
    const questionsWithPlanNumbers = getQuestionsWithPlanNumbers(project.questions);

    return (
        <html lang={currentLocale}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Plan de tournage</title>
                <meta name="description" content={`Plan de tournage pour ${pseudo ?? ''} sur le theme ${project.themeName}`} />
                <meta name="author" content={pseudo ?? ''} />
                <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css?family=Alegreya+Sans&display=swap" rel="stylesheet" />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `@font-face {
font-family: "littledays";
src: local("littledays"), url("data:application/x-font-woff;charset=utf-8;base64,${logoFont}") format("woff");
}
${pdfStyles}`,
                    }}
                />
            </head>
            <body>
                <header>
                    <div>
                        <div dangerouslySetInnerHTML={{ __html: logoSvg }} />
                        <h6 className="logo-title">Par Le Monde</h6>
                    </div>
                    {pseudo ? (
                        <div>
                            <img width="30" height="auto" alt="user" src={`data:image/png;base64,${userLogo}`} />
                            <h6 className="pseudo">{pseudo}</h6>
                        </div>
                    ) : null}
                </header>
                <main>
                    <div className="text-center">
                        <h1 style={titleStyle}>{labels.title}</h1>
                    </div>
                    {project.name ? (
                        <div className="text-center">
                            <h2 style={projectNameStyle}>{project.name}</h2>
                        </div>
                    ) : null}
                    <div>
                        <h2>{labels.subtitleDescription}</h2>
                        <div className="content">
                            <div style={{ margin: '0.1rem 0' }}>
                                <label>{labels.theme}</label>
                                <p className="inline"> {project.themeName}</p>
                            </div>
                            <div style={{ margin: '0.1rem 0' }}>
                                <label>{labels.scenario}</label>
                                <p className="inline"> {project.scenarioName}</p>
                            </div>
                            {scenarioDescription ? <p>{scenarioDescription}</p> : null}
                        </div>
                    </div>
                    <div>
                        <h2>{labels.subtitleStoryboard}</h2>
                        {questionsWithPlanNumbers.map(({ question, numberedPlans }, questionIndex) => (
                            <div key={question.id} className="content scene">
                                <h3>
                                    {questionIndex + 1}. {question.question}
                                </h3>
                                <div className="plans">
                                    {question.title ? (
                                        <div className="plan">
                                            <div className="title">
                                                <h4>{question.title.text}</h4>
                                            </div>
                                            <div className="plan-description" />
                                        </div>
                                    ) : null}
                                    {numberedPlans.map(({ number, plan }) => {
                                        const imageUrl = getImageUrl(hostUrl, plan.imageUrl);
                                        return (
                                            <div key={plan.id} className="plan">
                                                <div
                                                    className="plan-image"
                                                    style={
                                                        imageUrl
                                                            ? {
                                                                  backgroundImage: `url(${imageUrl})`,
                                                              }
                                                            : undefined
                                                    }
                                                >
                                                    <div className="plan-number">{number}</div>
                                                </div>
                                                <div className="plan-description">{plan.description}</div>
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
                            <div className="content">
                                <p>{labels.toCameraDescription}</p>
                                <div className="text-center" style={{ marginTop: '1rem' }}>
                                    <img alt="qrcode" style={qrCodeStyle} src={qrCode} />
                                </div>
                            </div>
                        </div>
                    ) : null}
                </main>
            </body>
        </html>
    );
}

export default StoryboardPdfTemplate;
