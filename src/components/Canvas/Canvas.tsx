import React, { useEffect, useState } from 'react';

import AdjustIcon from '@mui/icons-material/Adjust';
import BorderColorIcon from '@mui/icons-material/BorderColor';
import ClearIcon from '@mui/icons-material/Clear';
import RedoIcon from '@mui/icons-material/Redo';
import UndoIcon from '@mui/icons-material/Undo';
import { IconButton, Tooltip } from '@mui/material';

import { KeepRatio } from '../layout/KeepRatio';
import { ClearModal } from './ClearModal';
import { ColorModal } from './ColorModal';
import { SizeModal } from './SizeModal';
import { useTranslation } from 'src/i18n/useTranslation';

const IconButtonSX = {
    border: '1px solid',
    borderBottom: 'none',
    borderRadius: 0,
};

const sizes = [2, 4, 8];

export interface CanvasRef {
    getBlob(): Promise<Blob | null>;
}

interface Path {
    color: string;
    size: number;
    lines: Array<number[]>;
}

const CanvasComponent = (_: unknown, ref: React.ForwardedRef<HTMLCanvasElement | null>) => {
    const { t } = useTranslation();
    const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
    const [isDrawing, setIsDrawing] = useState<boolean>(false);
    const [paths, setPaths] = useState<Array<Path>>([]);
    const [redoPaths, setRedoPaths] = useState<Array<Path>>([]);
    const [clear, setClear] = useState<boolean>(false);
    const [position, setPosition] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const [color, setColor] = useState<string>('#444');
    const [size, setSize] = useState<number>(0);
    const [showModalColor, setShowModalColor] = useState<boolean>(false);
    const [showModalSize, setShowModalSize] = useState<boolean>(false);
    const [showModalClear, setShowModalClear] = useState<boolean>(false);

    const getCtx = React.useCallback(() => (canvasRef.current ? canvasRef.current.getContext('2d') : null), []);

    // Listen for resize events
    useEffect(() => {
        const resize = () => {
            setClear(true);
        };
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };
    }, []);

    const getXY = (event: React.MouseEvent<HTMLCanvasElement>) =>
        canvasRef.current
            ? {
                  x: event.clientX - canvasRef.current.getBoundingClientRect().left,
                  y: event.clientY - canvasRef.current.getBoundingClientRect().top,
              }
            : { x: 0, y: 0 };

    const drawPath = React.useCallback(
        (x1: number, y1: number, x2: number, y2: number, isNew: boolean, save: boolean, specificColor?: string, specificSize?: number) => {
            const ctx = getCtx();
            if (ctx === null) return;
            const delta = (specificSize !== undefined ? sizes[specificSize] : sizes[size]) / 4;
            ctx.beginPath();
            ctx.strokeStyle = specificColor || color;
            ctx.lineWidth = specificSize !== undefined ? sizes[specificSize] : sizes[size];
            ctx.lineCap = 'round';
            ctx.moveTo(x1 - delta, y1 - delta);
            ctx.lineTo(x2 - delta, y2 - delta);
            ctx.stroke();
            ctx.closePath();

            if (!save) return;
            const allPaths = [...paths];
            if (isNew) {
                allPaths.push({ color, size, lines: [[x1, y1, x2, y2]] });
            } else {
                (allPaths[paths.length - 1] || { lines: [] }).lines.push([x1, y1, x2, y2]);
            }
            setPaths(allPaths);
        },
        [color, getCtx, paths, size],
    );

    const drawAllPaths = React.useCallback(() => {
        for (const path of paths) {
            for (const line of path.lines) {
                const [x1, y1, x2, y2] = line;
                drawPath(x1, y1, x2, y2, false, false, path.color, path.size);
            }
        }
    }, [drawPath, paths]);

    // Resize canvas
    useEffect(() => {
        setClear(false);
        const ctx = getCtx();
        if (canvasRef.current && ctx !== null) {
            canvasRef.current.width = canvasRef.current.clientWidth;
            canvasRef.current.height = canvasRef.current.clientHeight;
            drawAllPaths();
        }
    }, [canvasRef, getCtx, clear, drawAllPaths]);

    const onMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (ctx === null) return;
        const { x, y } = getXY(event);
        drawPath(x, y, x, y, true, true);
        setIsDrawing(true);
        setPosition({ x, y });
        setRedoPaths([]);
    };

    const onMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const ctx = getCtx();
        if (ctx === null || !isDrawing) return;
        const { x, y } = getXY(event);
        const { x: prevX, y: prevY } = position;
        drawPath(prevX, prevY, x, y, false, true);
        setPosition({ x, y });
    };

    const onMouseUpOrOut = () => {
        const ctx = getCtx();
        if (ctx === null || !isDrawing) return;
        setIsDrawing(false);
        setPosition({ x: 0, y: 0 });
    };

    const handleUndo = () => {
        if (paths.length === 0) return;
        setRedoPaths([...redoPaths, ...paths.splice(paths.length - 1, 1)]);
        setPaths(paths);
        setClear(true);
    };
    const handleRedo = () => {
        if (redoPaths.length === 0) return;
        setPaths([...paths, ...redoPaths.splice(redoPaths.length - 1, 1)]);
        setRedoPaths(redoPaths);
        setClear(true);
    };

    const handleOpenModalColor = () => {
        setShowModalColor(true);
    };
    const handleOpenModalSize = () => {
        setShowModalSize(true);
    };
    const handleOpenModalClear = () => {
        setShowModalClear(true);
    };
    const handleCloseModalClear = (confirm: boolean) => () => {
        setShowModalClear(false);
        if (confirm) {
            setPaths([]);
            setRedoPaths([]);
            setClear(true);
        }
    };

    return (
        <div>
            <div className="draw-canvas-container-max-width">
                <div>
                    <div role="group" className="actions-buttons-container" aria-label="outlined primary button group">
                        <Tooltip title={t('tool_color')}>
                            <IconButton sx={IconButtonSX} aria-label={t('tool_color')} onClick={handleOpenModalColor}>
                                <BorderColorIcon
                                    style={{
                                        color,
                                        stroke: `${color === 'white' ? '#444' : 'none'}`,
                                    }}
                                />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('tool_stroke_width')}>
                            <IconButton sx={IconButtonSX} aria-label={t('tool_stroke_width')} onClick={handleOpenModalSize}>
                                <AdjustIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('tool_go_back')}>
                            <IconButton sx={IconButtonSX} aria-label={t('tool_go_back')} onClick={handleUndo}>
                                <UndoIcon color="secondary" />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title={t('tool_go_forward')}>
                            <IconButton sx={IconButtonSX} aria-label={t('tool_go_forward')} style={{ borderRight: '1px solid' }} onClick={handleRedo}>
                                <RedoIcon color="secondary" />
                            </IconButton>
                        </Tooltip>
                        <div style={{ flex: 1 }} />
                        <Tooltip title={t('tool_clear')}>
                            <IconButton sx={IconButtonSX} aria-label={t('tool_clear')} onClick={handleOpenModalClear}>
                                <ClearIcon color="error" />
                            </IconButton>
                        </Tooltip>
                    </div>
                </div>
                <KeepRatio ratio={9 / 16}>
                    <canvas
                        ref={(node) => {
                            canvasRef.current = node;
                            if (typeof ref === 'function') {
                                ref(node);
                            } else if (ref) {
                                ref.current = node;
                            }
                        }}
                        className="draw-canvas"
                        onMouseDown={onMouseDown}
                        onMouseMove={onMouseMove}
                        onMouseUp={onMouseUpOrOut}
                        onMouseOut={onMouseUpOrOut}
                    />
                </KeepRatio>
            </div>

            <ColorModal isOpen={showModalColor} setIsOpen={setShowModalColor} setColor={setColor} />
            <SizeModal isOpen={showModalSize} setIsOpen={setShowModalSize} setSize={setSize} />
            <ClearModal isOpen={showModalClear} onClear={handleCloseModalClear} />
        </div>
    );
};

export const Canvas = React.forwardRef(CanvasComponent);
