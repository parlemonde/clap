import { DragHandleDots2Icon, PauseIcon } from '@radix-ui/react-icons';
import React from 'react';

import { KeepRatio } from 'src/components/layout/KeepRatio';
import { useDragHandler } from 'src/hooks/useDragHandler';
import { useResizeObserver } from 'src/hooks/useResizeObserver';
import { useTranslation } from 'src/i18n/useTranslation';
import type { Title } from 'types/models/title.type';

const PrimaryColor = '#6065fc';

const getStyle = (style: string) => {
    try {
        return JSON.parse(style);
    } catch (err) {
        return {};
    }
};

type TextAlign = 'left' | 'center' | 'right';

type TitleCanvasProps = {
    title: Title;
    onChange: React.Dispatch<React.SetStateAction<Title>>;
};
export function TitleCanvas({ title, onChange }: TitleCanvasProps) {
    const { t } = useTranslation();
    const style = React.useMemo(() => getStyle(title.style), [title]);

    // --- Title variables ---
    const [titleText, setTitleText] = React.useState(title.text || '');
    const [fontFamily, setFontFamily] = React.useState<string>(style.fontFamily || 'serif');
    const [fontSize, setFontSize] = React.useState<number>(style.fontSize || 8); // %
    const [textAlign, setTextAlign] = React.useState<TextAlign>(style.textAlign || 'center');
    const [backgroundColor, setBackgroundColor] = React.useState<string>(style.backgroundColor || 'white');
    const [color, setColor] = React.useState<string>(style.color || 'black');
    // relative pos
    const [textXPer, setTextXPer] = React.useState<number>(style.x ?? 15); // %
    const [textYPer, setTextYPer] = React.useState<number>(style.y ?? 30); // %
    const [textWidthPer, setTextWidthPer] = React.useState<number>(style.width || 70); // %

    // Update variables on external style change.
    React.useEffect(() => {
        setTitleText(title.text || '');
        setFontFamily(style.fontFamily || 'serif');
        setFontSize(style.fontSize || 8);
        setTextXPer(style.x ?? 25);
        setTextYPer(style.y ?? 35);
        setTextWidthPer(style.width || 50);
        setTextAlign(style.textAlign || 'center');
        setBackgroundColor(style.backgroundColor || 'white');
        setColor(style.color || 'black');
    }, [title, style]);

    const onChangeStyle = (newPartialSyle: Record<string, string | number>) => {
        onChange((prev) => ({ ...prev, style: JSON.stringify({ ...getStyle(prev.style), ...newPartialSyle }) }));
    };

    // Canvas ref with dimensions
    const [canvasRef, { width: canvasWidth, height: canvasHeight }] = useResizeObserver<HTMLDivElement>();

    // Autosize textarea height
    const textAreaRef = React.useRef<HTMLTextAreaElement | null>(null);
    const [textAreaRefHeight, setTextAreaRefHeight] = React.useState(0);
    const textHeight = React.useMemo(
        () =>
            canvasHeight === 0
                ? 0
                : Math.min(canvasHeight - (textYPer * canvasHeight) / 100, Math.max((2 * fontSize * canvasHeight) / 100, textAreaRefHeight + 4)),
        [textAreaRefHeight, fontSize, canvasHeight, textYPer],
    );
    React.useEffect(() => {
        if (textAreaRef.current) {
            setTextAreaRefHeight(textAreaRef.current.scrollHeight);
        }
    }, [titleText, textWidthPer, canvasWidth, fontSize, fontFamily, textAlign, backgroundColor]); // update textAreaRefHeight on title change.

    // Absolute pos
    const { textX, textY, textWidth } = React.useMemo(
        () => ({
            textX: (textXPer * canvasWidth) / 100,
            textY: (textYPer * canvasHeight) / 100,
            textWidth: (textWidthPer * canvasWidth) / 100,
        }),
        [textXPer, textYPer, textWidthPer, canvasWidth, canvasHeight],
    );

    const cursorDelta = React.useRef<{ x: number; y: number }>({ x: 0, y: 0 });

    // Move textarea
    const { onMouseDown: onMoveMouseDown } = useDragHandler({
        onDragStart(event) {
            cursorDelta.current = {
                x: event.clientX - textX,
                y: event.clientY - textY,
            };
            return true;
        },
        onDrag(event) {
            if (canvasWidth === 0 || canvasHeight === 0) {
                return;
            }
            const maxX = ((canvasWidth - textWidth) / canvasWidth) * 100;
            const maxY = ((canvasHeight - textHeight) / canvasHeight) * 100;
            setTextXPer(Math.min(maxX, Math.max(0, ((event.clientX - cursorDelta.current.x) / canvasWidth) * 100)));
            setTextYPer(Math.min(maxY, Math.max(0, ((event.clientY - cursorDelta.current.y) / canvasHeight) * 100)));
        },
        onDragEnd(event) {
            if (canvasWidth === 0 || canvasHeight === 0) {
                return;
            }
            const maxX = ((canvasWidth - textWidth) / canvasWidth) * 100;
            const maxY = ((canvasHeight - textHeight) / canvasHeight) * 100;
            onChangeStyle({
                x: Math.min(maxX, Math.max(0, ((event.clientX - cursorDelta.current.x) / canvasWidth) * 100)),
                y: Math.min(maxY, Math.max(0, ((event.clientY - cursorDelta.current.y) / canvasHeight) * 100)),
            });
        },
    });

    // Resize textarea
    const { onMouseDown: onResizeMouseDown } = useDragHandler({
        onDragStart(event) {
            cursorDelta.current = {
                x: event.clientX - textWidth,
                y: 0,
            };
            return true;
        },
        onDrag(event) {
            if (canvasWidth === 0) {
                return;
            }
            const maxWidth = ((canvasWidth - textX) / canvasWidth) * 100;
            setTextWidthPer(Math.min(maxWidth, Math.max(10, ((event.clientX - cursorDelta.current.x) / canvasWidth) * 100)));
        },
        onDragEnd(event) {
            if (canvasWidth === 0) {
                return;
            }
            const maxWidth = ((canvasWidth - textX) / canvasWidth) * 100;
            onChangeStyle({ width: Math.min(maxWidth, Math.max(10, ((event.clientX - cursorDelta.current.x) / canvasWidth) * 100)) });
        },
    });

    return (
        <div style={{ width: '100%', maxWidth: '600px', margin: '2rem auto' }} ref={canvasRef}>
            <div
                style={{
                    display: 'inline-flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: PrimaryColor,
                    color: '#fff',
                    padding: '0.1rem',
                    borderTopLeftRadius: '4px',
                    borderTopRightRadius: '4px',
                }}
            >
                <select
                    value={backgroundColor}
                    onChange={(event) => {
                        const newBackgroundColor = event.target.value;
                        setBackgroundColor(newBackgroundColor);
                        onChangeStyle({ backgroundColor: newBackgroundColor });
                    }}
                    style={{
                        margin: '0 0.5rem',
                        backgroundColor: PrimaryColor,
                        color: '#fff',
                        border: 'none',
                        outline: 'none',
                        cursor: 'pointer',
                    }}
                >
                    <option value={'white'}>{t('white')}</option>
                    <option value={'black'}>{t('black')}</option>
                    <option value={'#fbe5d3'}>{t('red')}</option>
                    <option value={'#dad7fe'}>{t('blue')}</option>
                    <option value={'#e2fbd7'}>{t('green')}</option>
                </select>
            </div>
            <KeepRatio ratio={9 / 16} style={{ border: '1px solid grey', borderRadius: '0 8px 8px 8px', backgroundColor: backgroundColor }}>
                <div
                    style={{
                        display: 'inline-block',
                        position: 'relative',
                        transform: `translate(${textX}px, ${textY}px)`,
                    }}
                >
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: -1,
                            display: 'inline-flex',
                            flexDirection: 'row',
                            alignItems: 'center',
                            backgroundColor: PrimaryColor,
                            color: '#fff',
                            padding: '0.1rem',
                            borderTopLeftRadius: '4px',
                            borderTopRightRadius: '4px',
                            transform: 'translate(0, -100%)',
                        }}
                    >
                        <span style={{ cursor: 'grab', display: 'inline-flex' }} onMouseDown={onMoveMouseDown}>
                            <DragHandleDots2Icon style={{ height: '20px', width: '20px' }} />
                        </span>
                        <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff' }}></div>
                        <select
                            value={fontFamily}
                            onChange={(event) => {
                                const newFontFamily = event.target.value;
                                setFontFamily(event.target.value);
                                onChangeStyle({ fontFamily: newFontFamily });
                            }}
                            style={{
                                margin: '0 0.5rem',
                                backgroundColor: PrimaryColor,
                                color: '#fff',
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value={'serif'}>Serif</option>
                            <option value={'sans-serif'}>Sans-serif</option>
                        </select>
                        <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff' }}></div>
                        <select
                            value={fontSize}
                            onChange={(event) => {
                                const newFontSize = Number(event.target.value) || 8;
                                setFontSize(newFontSize);
                                onChangeStyle({ fontSize: newFontSize });
                            }}
                            style={{
                                margin: '0 0.5rem',
                                backgroundColor: PrimaryColor,
                                color: '#fff',
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value={6}>{t('small')}</option>
                            <option value={8}>{t('medium')}</option>
                            <option value={10}>{t('big')}</option>
                        </select>
                        <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff' }}></div>
                        <select
                            value={textAlign}
                            onChange={(event) => {
                                const newTextAlign = event.target.value as TextAlign;
                                setTextAlign(newTextAlign);
                                onChangeStyle({ textAlign: newTextAlign });
                            }}
                            style={{
                                margin: '0 0.5rem',
                                backgroundColor: PrimaryColor,
                                color: '#fff',
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value={'left'}>{t('left')}</option>
                            <option value={'center'}>{t('center')}</option>
                            <option value={'right'}>{t('right')}</option>
                        </select>
                        <div style={{ height: '1rem', width: '1px', backgroundColor: '#fff' }}></div>
                        <select
                            value={color}
                            onChange={(event) => {
                                const newColor = event.target.value;
                                setBackgroundColor(color);
                                onChangeStyle({ color: newColor });
                            }}
                            style={{
                                margin: '0 0.5rem',
                                backgroundColor: PrimaryColor,
                                color: '#fff',
                                border: 'none',
                                outline: 'none',
                                cursor: 'pointer',
                            }}
                        >
                            <option value={'black'}>{t('black')}</option>
                            <option value={'white'}>{t('white')}</option>
                        </select>
                    </div>
                    <textarea
                        value={titleText}
                        onChange={(event) => {
                            setTitleText(event.target.value);
                        }}
                        onBlur={(event) => {
                            onChange({ ...title, text: event.target.value });
                        }}
                        style={{
                            position: 'relative',
                            transform: 'translate(-1px, -1px)',
                            outline: 'none',
                            boxSizing: 'content-box',
                            width: textWidth,
                            height: textHeight,
                            borderWidth: 1,
                            borderStyle: 'dashed',
                            borderRadius: '8px',
                            padding: 0,
                            borderTopLeftRadius: 0,
                            fontSize: `${(fontSize * canvasHeight) / 100}px`,
                            lineHeight: `${(fontSize * canvasHeight) / 100}px`,
                            fontFamily: fontFamily,
                            textAlign: textAlign,
                            resize: 'none',
                            backgroundColor: backgroundColor,
                            color: color,
                        }}
                    />
                    <textarea
                        ref={textAreaRef}
                        value={titleText}
                        readOnly={true}
                        style={{
                            opacity: 0,
                            position: 'absolute',
                            zIndex: -1,
                            left: 0,
                            top: 0,
                            width: textWidth,
                            height: 0,
                            boxSizing: 'content-box',
                            borderWidth: 1,
                            padding: 0,
                            fontSize: `${(fontSize * canvasHeight) / 100}px`,
                            lineHeight: `${(fontSize * canvasHeight) / 100}px`,
                            fontFamily: fontFamily,
                            textAlign: textAlign,
                            resize: 'none',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            backgroundColor: backgroundColor,
                            color: color,
                        }}
                    ></textarea>
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            right: -11,
                            width: 20,
                            height: textHeight,
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'ew-resize',
                        }}
                    >
                        <PauseIcon style={{ width: '18px', height: '18px' }} onMouseDown={onResizeMouseDown} />
                    </div>
                </div>
            </KeepRatio>
        </div>
    );
}
