import React, { useRef, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

export const JournalCanvas = forwardRef(({ onStrokeChange, onEraseCountChange }, ref) => {
  const canvasRef = useRef(null);
  const [eraseCount, setEraseCount] = useState(0);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const strokesRef = useRef([]);

  const handleStrokeComplete = useCallback((path, isEraser) => {
    if (isEraser) return;
    const points = path.paths;
    if (points.length < 2) return;

    const startTime = path.startTimestamp || 0;
    const endTime = path.endTimestamp || Date.now();
    const duration = endTime - startTime;

    const withTime = points.map((p, i) => ({
      x: p.x,
      y: p.y,
      time: points.length > 1 ? Math.round((i / (points.length - 1)) * duration) : 0,
    }));

    strokesRef.current.push({ points: withTime });
    if (onStrokeChange) {
      onStrokeChange([...strokesRef.current]);
    }
  }, [onStrokeChange]);

  const handleClear = () => {
    canvasRef.current?.clearCanvas();
    strokesRef.current = [];
    if (onStrokeChange) {
      onStrokeChange([]);
    }
    setEraseCount(prev => {
      const next = prev + 1;
      if (onEraseCountChange) {
        onEraseCountChange(next);
      }
      return next;
    });
  };

  useImperativeHandle(ref, () => ({
    exportImage: async () => {
      if (canvasRef.current) {
        return await canvasRef.current.exportImage("png");
      }
      return null;
    },
    clear: () => {
      handleClear();
      setEraseCount(0);
      if (onEraseCountChange) {
        onEraseCountChange(0);
      }
    },
    getStrokes: () => {
      return strokesRef.current;
    },
    getEraseCount: () => {
      return eraseCount;
    }
  }));

  return (
    <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6 md:p-8 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-xl font-medium tracking-tight text-[#080808]">Kanvas Refleksi</h3>
        <span className="text-xs text-[#898989] font-mono">Erase Count: {eraseCount}</span>
      </div>

      <div className="border-2 border-[#7a3dff] rounded-[8px] overflow-hidden bg-white relative cursor-crosshair flex-1">
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={4}
          strokeColor="#7a3dff"
          canvasColor="#ffffff"
          withTimestamp
          onStroke={handleStrokeComplete}
          style={{ width: '100%', height: '500px' }}
        />
      </div>

      <div className="flex gap-3 mt-4 flex-shrink-0">
        <button
          onClick={() => {
            setIsEraserMode(false);
            canvasRef.current?.eraseMode(false);
          }}
          className={`font-medium text-sm py-2.5 px-5 rounded-[4px] transition-all duration-150 border cursor-pointer ${
            !isEraserMode
              ? 'bg-[#080808] text-white border-[#080808]'
              : 'bg-white text-[#080808] border-[#d8d8d8] hover:bg-[#fafafa]'
          }`}
        >
          Pena
        </button>
        <button
          onClick={() => {
            setIsEraserMode(true);
            canvasRef.current?.eraseMode(true);
          }}
          className={`font-medium text-sm py-2.5 px-5 rounded-[4px] transition-all duration-150 border cursor-pointer ${
            isEraserMode
              ? 'bg-[#080808] text-white border-[#080808]'
              : 'bg-white text-[#080808] border-[#d8d8d8] hover:bg-[#fafafa]'
          }`}
        >
          Penghapus
        </button>
        <button
          onClick={handleClear}
          className="bg-white hover:bg-[#fafafa] text-[#080808] border border-[#d8d8d8] font-medium text-sm py-2.5 px-5 rounded-[4px] transition-all duration-150 cursor-pointer"
        >
          Bersihkan
        </button>
      </div>
    </div>
  );
});

JournalCanvas.displayName = 'JournalCanvas';
