import Image from 'next/legacy/image';
import React from 'react';

import { useResizeObserver } from 'src/hooks/useResizeObserver';
import type { Question } from 'types/models/question.type';

type ImageFrame =
    | null
    | {
          kind: 'title';
          text: string;
          style: Record<string, string | number>;
      }
    | {
          kind: 'image';
          imageUrl: string;
      };

export const getCurrentFrame = (questions: Question[], time: number): ImageFrame => {
    let currentTime = 0;
    for (const question of questions) {
        if (question.title) {
            if (question.title.duration > 0 && currentTime + question.title.duration > time) {
                return {
                    kind: 'title',
                    text: question.title.text,
                    style: JSON.parse(question.title.style) || {},
                };
            } else {
                currentTime += Math.max(0, question.title.duration);
            }
        }
        for (const plan of question.plans || []) {
            if (plan.duration !== null && plan.duration > 0 && currentTime + plan.duration > time) {
                if (!plan.imageUrl) {
                    return null;
                } else {
                    return {
                        kind: 'image',
                        imageUrl: plan.imageUrl,
                    };
                }
            } else {
                currentTime += Math.max(0, plan.duration || 0);
            }
        }
    }
    return null;
};

type FrameProps = {
    questions: Question[];
    time: number;
    className?: string;
};

type TextAlign = 'left' | 'center' | 'right';

export const Frame = ({ questions, time, className }: FrameProps) => {
    const [canvasRef, { height: canvasHeight }] = useResizeObserver<HTMLDivElement>();
    const currentFrame = getCurrentFrame(questions, time);

    return (
        <div
            style={{
                width: '100%',
                height: '100%',
                backgroundColor:
                    currentFrame !== null && currentFrame.kind === 'title' ? (currentFrame.style.backgroundColor as string) || 'white' : 'white',
                color: currentFrame !== null && currentFrame.kind === 'title' ? String(currentFrame.style.color) || 'black' : 'black',
                textAlign:
                    currentFrame !== null && currentFrame.kind === 'title' ? (currentFrame.style.textAlign as TextAlign) || 'center' : 'center',
            }}
            ref={canvasRef}
        >
            {currentFrame === null ? null : currentFrame.kind === 'image' ? (
                <Image unoptimized layout="fill" objectFit="contain" src={currentFrame.imageUrl} />
            ) : (
                <p
                    className={className}
                    style={
                        currentFrame.style === null
                            ? {}
                            : {
                                  fontSize: `${((Number(currentFrame.style.fontSize) || 8) * canvasHeight) / 100}px`,
                                  lineHeight: `${((Number(currentFrame.style.fontSize) || 8) * canvasHeight) / 100}px`,
                                  fontFamily: String(currentFrame.style.fontFamily) || 'serif',
                                  left: `${currentFrame.style.x ?? 15}%`,
                                  top: `${currentFrame.style.y ?? 30}%`,
                                  width: `${currentFrame.style.width ?? 70}%`,
                                  textAlign: (currentFrame.style.textAlign as TextAlign) || 'center',
                              }
                    }
                >
                    {currentFrame.text}
                </p>
            )}
        </div>
    );
};
