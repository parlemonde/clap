import { DragHandleDots2Icon, PauseIcon } from '@radix-ui/react-icons';
import React from 'react';

import styles from './title-form.module.scss';
import { KeepRatio } from 'src/components/layout/KeepRatio';
import { useTranslation } from 'src/contexts/translationContext';
import type { Title } from 'src/database/schemas/projects';

const PRIMARY_COLOR = '#6065fc';

interface TitleFormProps {
    title: Title;
    onTitleChange: (newTitle: Title) => void;
}

export const TitleForm = ({ title, onTitleChange }: TitleFormProps) => {
    const { t } = useTranslation();
    const [isDragging, setIsDragging] = React.useState(false);
    const [isCenteringX, setIsCenteringX] = React.useState(false);
    const [isCenteringY, setIsCenteringY] = React.useState(false);
    const textAreaRef = React.useRef<HTMLTextAreaElement>(null);

    // Use a ResizeObserver to get the width and height of the canvas
    // This is used to calculate the font size and position of the title
    const canvasRef = React.useRef<HTMLDivElement>(null);
    const [canvasWidth, setCanvasWidth] = React.useState(0);
    const [canvasHeight, setCanvasHeight] = React.useState(0);
    const resizeObserverRef = React.useRef<ResizeObserver>(
        new ResizeObserver((entries) => {
            for (const entry of entries) {
                if (entry.target === canvasRef.current) {
                    setCanvasWidth(entry.contentRect.width);
                    setCanvasHeight(entry.contentRect.height);
                }
            }
        }),
    );
    React.useEffect(() => {
        const el = canvasRef.current;
        const resizeObserver = resizeObserverRef.current;
        if (el) {
            resizeObserver.observe(el);
            return () => {
                resizeObserver.unobserve(el);
            };
        }
        return () => {};
    }, []);

    const x = (title.x * canvasWidth) / 100;
    const y = (title.y * canvasHeight) / 100;
    const textWidth = (title.width * canvasWidth) / 100;
    const fontSize = (title.fontSize * canvasHeight) / 100;

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '0px auto 50px auto', overflow: 'hidden', paddingTop: 50 }}>
            <div
                style={{
                    display: 'inline-block',
                    backgroundColor: PRIMARY_COLOR,
                    padding: '2px',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                }}
            >
                <select
                    value={title.backgroundColor}
                    onChange={(event) => {
                        const newBackgroundColor = event.target.value;
                        const newTitle = { ...title, backgroundColor: newBackgroundColor, color: newBackgroundColor === 'black' ? 'white' : 'black' };
                        onTitleChange(newTitle);
                    }}
                    style={{
                        margin: '0 0.5rem',
                        backgroundColor: PRIMARY_COLOR,
                        color: '#fff',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <option value={'white'}>{t('3_title_storyboard_page.title_form_color.white')}</option>
                    <option value={'black'}>{t('3_title_storyboard_page.title_form_color.black')}</option>
                    <option value={'#ffadac'}>{t('3_title_storyboard_page.title_form_color.red')}</option>
                    <option value={'#dad7fe'}>{t('3_title_storyboard_page.title_form_color.blue')}</option>
                    <option value={'#e2fbd7'}>{t('3_title_storyboard_page.title_form_color.green')}</option>
                </select>
            </div>
            <KeepRatio
                ratio={9 / 16}
                style={{
                    border: `1px solid ${PRIMARY_COLOR}`,
                    borderRadius: '8px',
                    borderTopLeftRadius: 0,
                    boxSizing: 'border-box',
                    backgroundColor: title.backgroundColor,
                }}
            >
                <div style={{ width: '100%', height: '100%' }} ref={canvasRef}>
                    <div
                        style={{
                            display: 'inline-block',
                            position: 'absolute',
                            width: 0,
                            height: '100%',
                            borderRight: `1px dashed ${PRIMARY_COLOR}`,
                            opacity: isCenteringX ? 0.75 : 0,
                            top: 0,
                            left: '50%',
                        }}
                    ></div>
                    <div
                        style={{
                            display: 'inline-block',
                            position: 'absolute',
                            width: '100%',
                            height: 0,
                            borderBottom: `1px dashed ${PRIMARY_COLOR}`,
                            opacity: isCenteringY ? 0.75 : 0,
                            top: '50%',
                            left: 0,
                        }}
                    ></div>
                    <div
                        style={{
                            display: 'inline-block',
                            position: 'relative',
                            userSelect: isDragging ? 'none' : 'auto',
                            transform: `translate(${x - 1}px, ${y - 1}px)`, // -1px to account for border
                        }}
                    >
                        <div
                            style={{
                                position: 'absolute',
                                top: 1,
                                left: 0,
                                display: 'inline-flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                padding: '2px',
                                color: 'white',
                                backgroundColor: PRIMARY_COLOR,
                                borderTopLeftRadius: '4px',
                                borderTopRightRadius: '4px',
                                transform: 'translate(0, -100%)',
                            }}
                        >
                            <span
                                style={{ cursor: 'grab', display: 'inline-flex' }}
                                onMouseDown={() => {
                                    setIsDragging(true);
                                    setIsCenteringX(false);
                                    setIsCenteringY(false);
                                    let x = title.x;
                                    let y = title.y;
                                    const maxX = 100 - title.width;
                                    const middleX = 50 - title.width / 2;
                                    const textAreaHeight = textAreaRef.current?.getBoundingClientRect().height;
                                    const titleHeight = textAreaHeight ? ((textAreaHeight - 2) * 100) / canvasHeight : 0;
                                    const maxY = 100 - titleHeight;
                                    const middleY = 50 - titleHeight / 2;
                                    const onMouseMove = (e: MouseEvent) => {
                                        x += (e.movementX * 100) / canvasWidth;
                                        y += (e.movementY * 100) / canvasHeight;
                                        let newX = Math.max(0, Math.min(maxX, x));
                                        if (Math.abs(newX - middleX) < 3) {
                                            newX = middleX;
                                            setIsCenteringX(true);
                                        } else {
                                            setIsCenteringX(false);
                                        }
                                        let newY = Math.max(0, Math.min(maxY, y));
                                        if (Math.abs(newY - middleY) < 3) {
                                            newY = middleY;
                                            setIsCenteringY(true);
                                        } else {
                                            setIsCenteringY(false);
                                        }
                                        onTitleChange({
                                            ...title,
                                            x: newX,
                                            y: newY,
                                        });
                                    };
                                    window.addEventListener('mousemove', onMouseMove);
                                    window.addEventListener(
                                        'mouseup',
                                        () => {
                                            setIsDragging(false);
                                            setIsCenteringX(false);
                                            setIsCenteringY(false);
                                            window.removeEventListener('mousemove', onMouseMove);
                                        },
                                        { once: true },
                                    );
                                }}
                            >
                                <DragHandleDots2Icon style={{ height: '20px', width: '20px' }} />
                            </span>
                            <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff', margin: '0 4px' }}></div>
                            <select
                                value={title.fontSize}
                                onChange={(event) => {
                                    const newFontSize = Number(event.target.value) || 8;
                                    onTitleChange({
                                        ...title,
                                        fontSize: newFontSize,
                                    });
                                }}
                                style={{
                                    backgroundColor: PRIMARY_COLOR,
                                    color: '#fff',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value={6}>{t('3_title_storyboard_page.title_form_size.small')}</option>
                                <option value={8}>{t('3_title_storyboard_page.title_form_size.medium')}</option>
                                <option value={10}>{t('3_title_storyboard_page.title_form_size.big')}</option>
                            </select>
                            <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff', margin: '0 4px' }}></div>
                            <select
                                value={title.textAlign}
                                onChange={(event) => {
                                    const newTextAlign = event.target.value as 'left' | 'center' | 'right' | 'justify';
                                    onTitleChange({
                                        ...title,
                                        textAlign: newTextAlign,
                                    });
                                }}
                                style={{
                                    backgroundColor: PRIMARY_COLOR,
                                    color: '#fff',
                                    border: 'none',
                                    outline: 'none',
                                    cursor: 'pointer',
                                }}
                            >
                                <option value={'left'}>{t('3_title_storyboard_page.title_form_alignment.left')}</option>
                                <option value={'center'}>{t('3_title_storyboard_page.title_form_alignment.center')}</option>
                                <option value={'right'}>{t('3_title_storyboard_page.title_form_alignment.right')}</option>
                                <option value={'justify'}>{t('3_title_storyboard_page.title_form_alignment.justify')}</option>
                            </select>
                        </div>
                        <div
                            className={styles.textAreaContainer}
                            style={{
                                display: 'grid',
                                width: `${textWidth}px`,
                                backgroundColor: title.backgroundColor,
                                color: title.color,
                                fontSize: `${fontSize}px`,
                                lineHeight: 1,
                                fontFamily: title.fontFamily,
                                textAlign: title.textAlign,
                                maxHeight: `${canvasHeight - y}px`,
                            }}
                            data-replicated-value={title.text}
                        >
                            <textarea
                                value={title.text}
                                onChange={(event) => {
                                    onTitleChange({ ...title, text: event.target.value });
                                }}
                                style={{ maxHeight: `${canvasHeight - y}px` }}
                                ref={textAreaRef}
                            ></textarea>
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    right: -11,
                                    width: 20,
                                    height: '100%',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'ew-resize',
                                }}
                            >
                                <PauseIcon
                                    style={{ width: '18px', height: '18px' }}
                                    onMouseDown={() => {
                                        setIsDragging(true);
                                        let width = title.width;
                                        const minWidth = 20; //%
                                        const maxWidth = 100 - title.x;
                                        const onMouseMove = (e: MouseEvent) => {
                                            width += (e.movementX * 100) / canvasWidth;
                                            onTitleChange({
                                                ...title,
                                                width: Math.max(minWidth, Math.min(maxWidth, width)),
                                            });
                                        };
                                        window.addEventListener('mousemove', onMouseMove);
                                        window.addEventListener(
                                            'mouseup',
                                            () => {
                                                setIsDragging(false);
                                                window.removeEventListener('mousemove', onMouseMove);
                                            },
                                            { once: true },
                                        );
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </KeepRatio>
        </div>
    );
};
