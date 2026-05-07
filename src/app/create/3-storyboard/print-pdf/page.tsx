'use client';

import { useLocale, useExtracted } from 'next-intl';
import * as React from 'react';

import { Button } from '@frontend/components/layout/Button';
import { Text } from '@frontend/components/layout/Typography';
import { Loader } from '@frontend/components/ui/Loader';
import { userContext } from '@frontend/contexts/userContext';
import { useCurrentProject } from '@frontend/hooks/useCurrentProject';
import { ensureLocalMediaServiceWorker } from '@frontend/lib/local-media';
import { StoryboardPdfContent, storyboardPdfStyles, type StoryboardPdfLabels } from '@lib/pdf/storyboard-pdf';
import type { ProjectData } from '@server/database/schemas/projects';
import { getScenario } from '@server-actions/scenarios/get-scenario';

const printPageStyles = `
@media screen {
.pdfPrintPage {
min-height: 100vh;
padding: 24px 0;
background: #f5f5f5;
}
.pdfPrintControls {
position: sticky;
top: 64px;
z-index: 10;
width: min(21cm, calc(100% - 32px));
margin: 0 auto 16px auto;
padding: 12px 16px;
background: #fff;
border: 1px solid rgba(0, 0, 0, 0.12);
border-radius: 4px;
display: flex;
align-items: center;
justify-content: space-between;
gap: 16px;
}
}
@media print {
body > header,
body > footer,
.pdfPrintControls {
display: none !important;
}
body {
margin: 0 !important;
padding: 0 !important;
background: #fff !important;
}
.pdfPrintPage {
padding: 0 !important;
background: #fff !important;
}
}
`;

function getProjectImageUrls(projectData: ProjectData): string[] {
    return projectData.questions.flatMap((question) => question.plans.map((plan) => plan.imageUrl).filter(Boolean));
}

function waitForImage(url: string): Promise<void> {
    return new Promise((resolve) => {
        const image = new Image();
        let isResolved = false;
        const resolveOnce = () => {
            if (!isResolved) {
                isResolved = true;
                resolve();
            }
        };
        image.onload = resolveOnce;
        image.onerror = resolveOnce;
        image.src = url;
        if (image.complete) {
            resolveOnce();
        }
    });
}

function nextFrame(): Promise<void> {
    return new Promise((resolve) => {
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                resolve();
            });
        });
    });
}

export default function PrintPdfPage() {
    const t = useExtracted('pdf');
    const pageT = useExtracted('create.3-storyboard.print-pdf');
    const currentLocale = useLocale();
    const user = React.useContext(userContext);
    const { projectData, name } = useCurrentProject();
    const [loadedScenarioDescription, setLoadedScenarioDescription] = React.useState<{
        description: string | null;
        locale: string;
        scenarioId: number;
    } | null>(null);
    const [isPreparing, setIsPreparing] = React.useState(true);
    const hasAutoPrintedRef = React.useRef(false);
    const scenarioId = projectData?.scenarioId;
    const scenarioDescription = React.useMemo(() => {
        if (typeof scenarioId !== 'number') {
            return null;
        }
        if (loadedScenarioDescription?.scenarioId === scenarioId && loadedScenarioDescription.locale === currentLocale) {
            return loadedScenarioDescription.description;
        }
        return undefined;
    }, [currentLocale, loadedScenarioDescription, scenarioId]);

    const labels = React.useMemo<StoryboardPdfLabels>(
        () => ({
            title: t('Plan de tournage'),
            subtitleDescription: t('Description générale :'),
            theme: t('Thème :'),
            scenario: t('Scénario :'),
            subtitleStoryboard: t('Storyboard :'),
            subtitleToCamera: t('À votre caméra !'),
            toCameraDescription: t("Flashez le code QR suivant pour accéder directement à l'application et démarrer le tournage."),
        }),
        [t],
    );

    React.useEffect(() => {
        let isMounted = true;

        if (typeof scenarioId !== 'number') {
            return () => {
                isMounted = false;
            };
        }

        getScenario(scenarioId)
            .then((scenario) => {
                if (isMounted) {
                    setLoadedScenarioDescription({
                        description: scenario?.descriptions[currentLocale] || scenario?.descriptions.fr || null,
                        locale: currentLocale,
                        scenarioId,
                    });
                }
            })
            .catch((error) => {
                console.error(error);
                if (isMounted) {
                    setLoadedScenarioDescription({
                        description: null,
                        locale: currentLocale,
                        scenarioId,
                    });
                }
            });

        return () => {
            isMounted = false;
        };
    }, [currentLocale, scenarioId]);

    const printStoryboard = React.useCallback(async () => {
        if (!projectData) {
            return;
        }

        setIsPreparing(true);
        try {
            await ensureLocalMediaServiceWorker().catch((error) => {
                console.error(error);
            });
            await Promise.all(getProjectImageUrls(projectData).map(waitForImage));
            await document.fonts?.ready;
            await nextFrame();
        } finally {
            setIsPreparing(false);
        }

        await nextFrame();
        window.print();
    }, [projectData]);

    React.useEffect(() => {
        if (!projectData || scenarioDescription === undefined || hasAutoPrintedRef.current) {
            return;
        }

        hasAutoPrintedRef.current = true;
        printStoryboard().catch((error) => {
            console.error(error);
            setIsPreparing(false);
        });
    }, [printStoryboard, projectData, scenarioDescription]);

    if (!projectData) {
        return (
            <>
                <style dangerouslySetInnerHTML={{ __html: printPageStyles }} />
                <div className="pdfPrintPage">
                    <div className="pdfPrintControls">
                        <Text>{pageT('Aucun projet à imprimer.')}</Text>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <style dangerouslySetInnerHTML={{ __html: `${storyboardPdfStyles}${printPageStyles}` }} />
            <div className="pdfPrintPage">
                <div className="pdfPrintControls">
                    <Text>{isPreparing ? pageT('Préparation du PDF...') : pageT('Le PDF est prêt.')}</Text>
                    <Button
                        label={pageT('Imprimer')}
                        variant="contained"
                        color="secondary"
                        isUpperCase={false}
                        onClick={() => {
                            printStoryboard().catch((error) => {
                                console.error(error);
                                setIsPreparing(false);
                            });
                        }}
                    />
                </div>
                <StoryboardPdfContent
                    hostUrl=""
                    currentLocale={currentLocale}
                    project={{
                        ...projectData,
                        name,
                    }}
                    pseudo={user?.name || null}
                    scenarioDescription={scenarioDescription || null}
                    logoFont=""
                    userLogo=""
                    labels={labels}
                />
            </div>
            <Loader isLoading={isPreparing} />
        </>
    );
}
