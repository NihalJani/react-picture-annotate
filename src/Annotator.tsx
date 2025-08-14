import { Box, Paper, Typography, Select, MenuItem, Button, SelectChangeEvent, FormControl, Slider, IconButton } from '@mui/material';
import UndoIcon from '@mui/icons-material/Undo';
import RedoIcon from '@mui/icons-material/Redo';
import { useState, useRef, MouseEvent, SyntheticEvent, useMemo } from 'react';

export interface Annotation {
  box: [number, number, number, number]; // [x, y, width, height]
  label: string;
}

interface AnnotatorProps {
  imageUrl: string;
  classes: string[];
  onSave: (annotations: Annotation[]) => void;
  onCancel: () => void;
}

const resizeHandles = ['top-left', 'top-right', 'bottom-left', 'bottom-right'];

const Annotator = ({ imageUrl, classes, onSave, onCancel }: AnnotatorProps) => {
  const [boxes, setBoxes] = useState<Annotation[]>([]);
  const [drawing, setDrawing] = useState(false);
  const [history, setHistory] = useState<Annotation[][]>([[]]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [drawingBox, setDrawingBox] = useState<Annotation | null>(null);
  const [selectedBoxIndex, setSelectedBoxIndex] = useState<number | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [zoom, setZoom] = useState(1);
  const [isResizing, setIsResizing] = useState(false);
  const [resizeHandle, setResizeHandle] = useState<string | null>(null);
  const [editingLabelIndex, setEditingLabelIndex] = useState<number | null>(null);

  const imageContainerRef = useRef<HTMLDivElement>(null);
  const drawingAreaRef = useRef<HTMLDivElement>(null);


  const handleImageLoad = (event: SyntheticEvent<HTMLImageElement, Event>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    setImageSize({ width: naturalWidth, height: naturalHeight });
  };

  const getMousePos = (e: MouseEvent<HTMLDivElement>) => {
    if (!drawingAreaRef.current) return { x: 0, y: 0 };
    const rect = drawingAreaRef.current.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / zoom,
      y: (e.clientY - rect.top) / zoom
    };
  };

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target !== drawingAreaRef.current) return;
    const { x, y } = getMousePos(e);
    setStartPoint({ x, y });
    setDrawing(true);
    setDrawingBox({ box: [x, y, 0, 0], label: '(Unassigned)' });
    setEditingLabelIndex(null);
  };

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!drawingAreaRef.current) return;
    const pos = getMousePos(e);
    // Clamp mouse position to image boundaries
    const clampedX = Math.max(0, Math.min(pos.x, imageSize.width));
    const clampedY = Math.max(0, Math.min(pos.y, imageSize.height));

    if (isResizing && selectedBoxIndex !== null) {
      const newBoxes = [...boxes];
      const box = newBoxes[selectedBoxIndex].box;
      let [x, y, width, height] = box;

      if (resizeHandle?.includes('right')) {
        width = clampedX - x;
      }
      if (resizeHandle?.includes('left')) {
        width += x - clampedX;
        x = clampedX;
      }
      if (resizeHandle?.includes('bottom')) {
        height = clampedY - y;
      }
      if (resizeHandle?.includes('top')) {
        height += y - clampedY;
        y = clampedY;
      }

      if (width > 5 && height > 5) {
        newBoxes[selectedBoxIndex].box = [x, y, width, height];
        setBoxes(newBoxes);
      }
    }
    else if (drawing && startPoint && drawingBox) {
      const newBox: Annotation = {
        box: [
          Math.min(startPoint.x, clampedX),
          Math.min(startPoint.y, clampedY),
          Math.abs(clampedX - startPoint.x),
          Math.abs(clampedY - startPoint.y),
        ],
        label: drawingBox.label,
      };
      setDrawingBox(newBox);
    }
  };

  const handleMouseUp = () => {
    if (drawing && drawingBox && (drawingBox.box[2] < 5 || drawingBox.box[3] < 5)) {
      setDrawing(false);
      setDrawingBox(null);
      return;
    }

    if(drawing && drawingBox) {
        const newBoxes = [...boxes, drawingBox];
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newBoxes]);
        setHistoryIndex(newHistory.length);
        setBoxes(newBoxes);
    }
    
    setDrawing(false);
    setDrawingBox(null);
    setStartPoint(null);
    setIsResizing(false);
    setResizeHandle(null);
  };
  
  const handleBoxClick = (e: MouseEvent<HTMLDivElement>, index: number) => {
    e.stopPropagation();
    setSelectedBoxIndex(index);
    setEditingLabelIndex(null); // Ensure dropdown is closed
  };

  const handleLabelClick = (e: MouseEvent<HTMLElement>, index: number) => {
    e.stopPropagation(); // Prevents the box click from firing
    setEditingLabelIndex(index);
    setSelectedBoxIndex(index); // Also select the box
  };
  
  const handleLabelChange = (event: SelectChangeEvent<string>, index: number) => {
    const newBoxes = [...boxes];
    newBoxes[index].label = event.target.value;
    setBoxes(newBoxes);
    setEditingLabelIndex(null);
  };

  const handleResizeMouseDown = (e: MouseEvent<HTMLDivElement>, handle: string) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeHandle(handle);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setBoxes(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setBoxes(history[newIndex]);
    }
  };
  
  const handleSaveClick = () => {
    onSave(boxes);
  };

  const hasUnassigned = useMemo(() => boxes.some(b => b.label === '(Unassigned)'), [boxes]);
  return (
    <Paper elevation={0} sx={{ p: 2, mt: 2, border: '1px solid #e0e0e0' }} onClick={() => { setSelectedBoxIndex(null); setEditingLabelIndex(null); }}>
      <Typography variant="h5" color="text.primary" gutterBottom align='center' marginBottom={2} sx={{ fontWeight: 'bold' }}>
        Correct Annotations
      </Typography>
      <Box
        ref={imageContainerRef}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        sx={{
          width: '100%',
          height: '54vh',
          overflow: 'auto',
          border: '1px solid #ccc',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f0f0f0'
        }}
      >
        <Box
          ref={drawingAreaRef}
          onMouseDown={handleMouseDown}
          sx={{
            position: 'relative',
            cursor: 'crosshair',
            width: imageSize.width,
            height: imageSize.height,
            transform: `scale(${zoom})`,
            transformOrigin: 'center center',
          }}
        >
          <img
            src={imageUrl}
            alt="annotation"
            onLoad={handleImageLoad}
            style={{
              width: '100%',
              height: '100%',
              pointerEvents: 'none',
              userSelect: 'none',
            }}
          />
          {drawingBox && (
            <Box
              sx={{
                border: '2px dashed red',
                position: 'absolute',
                left: drawingBox.box[0],
                top: drawingBox.box[1],
                width: drawingBox.box[2],
                height: drawingBox.box[3],
              }}
            />
          )}
          {boxes.map((b, i) => (
            <Box
              key={i}
              onClick={(e) => handleBoxClick(e, i)}
              sx={{
                border: '2px solid #0D9ECA',
                position: 'absolute',
                left: b.box[0],
                top: b.box[1],
                width: b.box[2],
                height: b.box[3],
                cursor: 'pointer',
                backgroundColor: selectedBoxIndex === i ? 'rgba(13, 158, 202, 0.2)' : 'transparent',
                opacity: drawing ? 0.5 : 1,
              }}
            >
              {editingLabelIndex  === i && (
                <FormControl size="small" sx={{ position: 'absolute', bottom: '100%', left: '30vh', backgroundColor: 'white', zIndex: 10 }} onClick={(e) => e.stopPropagation()}>
                  <Select
                    value={b.label}
                    onChange={(e) => handleLabelChange(e, i)}
                    autoWidth
                    open={editingLabelIndex  === i}
                  >
                    <MenuItem value="(Unassigned)">(Unassigned)</MenuItem>
                    {classes.map((cls) => (<MenuItem key={cls} value={cls}>{cls}</MenuItem>))}
                  </Select>
                </FormControl>
              )}
               {selectedBoxIndex === i && resizeHandles.map(handle => (
                <Box
                  key={handle}
                  onMouseDown={(e) => handleResizeMouseDown(e, handle)}
                  sx={{
                    position: 'absolute',
                    width: 10,
                    height: 10,
                    backgroundColor: 'white',
                    border: '1px solid black',
                    cursor: `${handle.includes('top') ? 'n' : 's'}${handle.includes('left') ? 'w' : 'e'}-resize`,
                    top: handle.includes('top') ? -5 : 'auto',
                    bottom: handle.includes('bottom') ? -5 : 'auto',
                    left: handle.includes('left') ? -5 : 'auto',
                    right: handle.includes('right') ? -5 : 'auto',
                  }}
                />
              ))}
              <Typography
                onClick={(e) => handleLabelClick(e, i)}
                sx={{
                  backgroundColor: '#0D9ECA',
                  color: 'white',
                  fontSize: '12px',
                  padding: '2px',
                  cursor: 'pointer', // Add this to indicate it's clickable
                }}
              >
                {b.label}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2, justifyContent:'center' }}>
        <Typography>Zoom:</Typography>
        <Slider
          value={zoom}
          onChange={(_, newValue) => setZoom(newValue as number)}
          min={0.2}
          max={5}
          step={0.1}
          sx={{ width: 150 }}
        />
        <IconButton onClick={handleUndo} disabled={historyIndex === 0}>
          <UndoIcon />
        </IconButton>
        <IconButton onClick={handleRedo} disabled={historyIndex === history.length - 1}>
          <RedoIcon />
        </IconButton>
      </Box>
      <Box sx={{ mt: 2, display: 'flex', gap: 1, justifyContent:'center' }}>
        <Button variant="contained" color="secondary" onClick={handleSaveClick} disabled={boxes.length === 0 || hasUnassigned}>
          Save Annotations
        </Button>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
      </Box>
    </Paper>
  );
};

export default Annotator;