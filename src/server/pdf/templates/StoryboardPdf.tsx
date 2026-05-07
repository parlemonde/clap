/* eslint-disable @next/next/no-head-element, @next/next/no-page-custom-font */

import { StoryboardPdfContent, storyboardPdfStyles } from '@lib/pdf/storyboard-pdf';

import type { StoryboardPdfTemplateProps } from './templates.types';

export function StoryboardPdfTemplate(props: StoryboardPdfTemplateProps) {
    return (
        <html lang={props.currentLocale}>
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width,initial-scale=1" />
                <title>Plan de tournage</title>
                <meta name="description" content={`Plan de tournage pour ${props.pseudo ?? ''} sur le theme ${props.project.themeName}`} />
                <meta name="author" content={props.pseudo ?? ''} />
                <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet" />
                <link href="https://fonts.googleapis.com/css?family=Alegreya+Sans&display=swap" rel="stylesheet" />
                <style
                    dangerouslySetInnerHTML={{
                        __html: `@font-face {
font-family: "littledays";
src: local("littledays"), url("data:application/x-font-woff;charset=utf-8;base64,${props.logoFont}") format("woff");
}
html,
body {
margin: 0;
padding: 0;
background-color: #fff;
}
body::backdrop {
background-color: #fff;
}
${storyboardPdfStyles}`,
                    }}
                />
            </head>
            <body>
                <StoryboardPdfContent {...props} />
            </body>
        </html>
    );
}

export default StoryboardPdfTemplate;
