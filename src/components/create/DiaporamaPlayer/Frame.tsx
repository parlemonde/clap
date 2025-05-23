import Image from 'next/legacy/image';
import React from 'react';

import type { Sequence, Title } from 'src/database/schemas/projects';

type ImageFrame =
    | null
    | {
          kind: 'title';
          title: Title;
      }
    | {
          kind: 'image';
          imageUrl: string;
      };

export const getCurrentFrame = (questions: Sequence[], time: number): ImageFrame => {
    let currentTime = 0;
    for (const question of questions) {
        if (question.title) {
            const titleDuration = question.title.duration;
            if (currentTime + titleDuration > time) {
                return {
                    kind: 'title',
                    title: question.title,
                };
            } else {
                currentTime += titleDuration;
            }
        }
        for (const plan of question.plans || []) {
            const planDuration = plan.duration;
            if (currentTime + planDuration > time) {
                if (!plan.imageUrl) {
                    return null;
                } else {
                    return {
                        kind: 'image',
                        imageUrl: plan.imageUrl,
                    };
                }
            } else {
                currentTime += planDuration;
            }
        }
    }
    return null;
};

type FrameProps = {
    questions: Sequence[];
    time: number;
    className?: string;
};

export const Frame = ({ questions, time, className }: FrameProps) => {
    const [canvasHeight, setCanvasHeight] = React.useState<number>(0);
    const currentFrame = getCurrentFrame(questions, time);

    const uniqueId = React.useId();
    const frameId = `frame-${uniqueId}`;
    const resizeObserver = React.useMemo(
        () =>
            new ResizeObserver((entries) => {
                for (const entry of entries) {
                    if (entry.target.id === frameId) {
                        setCanvasHeight(entry.contentRect.height);
                    }
                }
            }),
        [frameId],
    );
    const onResizeRef = React.useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                resizeObserver.observe(node);
            } else {
                resizeObserver.disconnect();
            }
        },
        [resizeObserver],
    );

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                boxSizing: 'border-box',
                backgroundColor: currentFrame !== null && currentFrame.kind === 'title' ? currentFrame.title.backgroundColor : 'black',
                textAlign: 'center',
            }}
            id={frameId}
            ref={onResizeRef}
        >
            {currentFrame === null ? null : currentFrame.kind === 'image' ? (
                <Image unoptimized layout="fill" objectFit="contain" src={currentFrame.imageUrl} alt="Plan" />
            ) : (
                <p
                    className={className}
                    style={{
                        fontSize: `${(currentFrame.title.fontSize * canvasHeight) / 100}px`,
                        lineHeight: 1,
                        fontFamily: currentFrame.title.fontFamily,
                        fontWeight: 400,
                        left: `${currentFrame.title.x}%`,
                        top: `${currentFrame.title.y}%`,
                        width: `${currentFrame.title.width}%`,
                        textAlign: currentFrame.title.textAlign,
                        color: currentFrame.title.color,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                    }}
                >
                    {currentFrame.title.text}
                </p>
            )}
        </div>
    );
};
