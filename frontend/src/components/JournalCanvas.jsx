import React, { useRef, useState, useImperativeHandle, forwardRef } from 'react';
import { ReactSketchCanvas } from 'react-sketch-canvas';

export const JournalCanvas = forwardRef(({ onStrokeChange, onEraseCountChange }, ref) => {
  const canvasRef = useRef(null);
  const [eraseCount, setEraseCount] = useState(0);
  const [isEraserMode, setIsEraserMode] = useState(false);
  const strokesRef = useRef([]);
  const currentStrokeRef = useRef(null);
  const startTimeRef = useRef(null);
  const isDrawingRef = useRef(false);

  const handlePointerDown = (e) => {
    if (isEraserMode) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    isDrawingRef.current = true;
    startTimeRef.current = Date.now();
    currentStrokeRef.current = {
      points: [{ x, y, time: 0 }]
    };
  };

  const handlePointerMove = (e) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const time = Date.now() - startTimeRef.current;

    currentStrokeRef.current.points.push({ x, y, time });
  };

  const handlePointerUp = () => {
    if (!isDrawingRef.current) return;
    isDrawingRef.current = false;
    if (currentStrokeRef.current && currentStrokeRef.current.points.length > 0) {
      strokesRef.current.push(currentStrokeRef.current);
      if (onStrokeChange) {
        onStrokeChange([...strokesRef.current]);
      }
    }
    currentStrokeRef.current = null;
  };

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
    <div className="bg-white border border-[#d8d8d8] rounded-[8px] p-6 md:p-8 hover:shadow-[0_13px_13px_rgba(0,0,0,0.04)] transition-all">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-medium tracking-tight text-[#080808]">Kanvas Refleksi</h3>
        <span className="text-xs text-[#898989] font-mono">Erase Count: {eraseCount}</span>
      </div>

      <div
        className="border-2 border-[#7a3dff] rounded-[8px] overflow-hidden bg-white relative cursor-crosshair"
        style={{ height: '350px' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        <ReactSketchCanvas
          ref={canvasRef}
          strokeWidth={4}
          strokeColor="#7a3dff"
          canvasColor="#ffffff"
          style={{ width: '100%', height: '100%' }}
        />
      </div>

      <div className="flex gap-3 mt-4">
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
