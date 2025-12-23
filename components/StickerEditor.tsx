import React, { useState, useRef, useEffect } from 'react';
import { X, Check, Type, Move, Image as ImageIcon, ZoomIn, RotateCw, Hand, Grid3x3, RotateCcw, Minus, Plus, Palette, Maximize, MousePointer2 } from 'lucide-react';

interface StickerEditorProps {
  imageUrl: string;
  onSave: (newUrl: string) => void;
  onCancel: () => void;
}

type EditorTab = 'image' | 'text';
type DragTarget = 'none' | 'image' | 'text' | 'resize-tl' | 'resize-tr' | 'resize-bl' | 'resize-br';

export const StickerEditor: React.FC<StickerEditorProps> = ({ imageUrl, onSave, onCancel }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // UI State
  const [activeTab, setActiveTab] = useState<EditorTab>('image');
  const [showGrid, setShowGrid] = useState(true);

  // Text State
  const [text, setText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textSize, setTextSize] = useState(60);
  const [textPos, setTextPos] = useState({ x: 256, y: 400 }); 
  
  // Image transformation state
  const [scale, setScale] = useState(1);
  const [offsetX, setOffsetX] = useState(0); // Screen space offset from center
  const [offsetY, setOffsetY] = useState(0); // Screen space offset from center
  const [rotation, setRotation] = useState(0);
  
  // Dragging Logic
  const [dragTarget, setDragTarget] = useState<DragTarget>('none');
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialParams, setInitialParams] = useState({ x: 0, y: 0, s: 1 }); // Stores initial pos or scale

  const [imageObj, setImageObj] = useState<HTMLImageElement | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => {
      setImageObj(img);
      setOffsetX(0);
      setOffsetY(0);
      setScale(1);
    };
  }, [imageUrl]);

  // Handle Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomSensitivity = 0.001;
    const newScale = Math.min(Math.max(0.1, scale - e.deltaY * zoomSensitivity), 5);
    setScale(newScale);
  };

  // Reset Image Transform
  const handleResetImage = () => {
      setScale(1);
      setRotation(0);
      setOffsetX(0);
      setOffsetY(0);
  };

  // Helper: Transform local point to screen space
  const toScreen = (lx: number, ly: number) => {
      if (!canvasRef.current) return { x: 0, y: 0 };
      const cx = canvasRef.current.width / 2;
      const cy = canvasRef.current.height / 2;
      const rad = (rotation * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      
      const rx = lx * scale * cos - ly * scale * sin;
      const ry = lx * scale * sin + ly * scale * cos;
      
      return { x: rx + cx + offsetX, y: ry + cy + offsetY };
  };

  // Helper: Get Image Dimensions on Canvas (Base size before scale)
  const getImageBaseDims = () => {
      if (!canvasRef.current || !imageObj) return { w: 0, h: 0 };
      const canvas = canvasRef.current;
      const aspect = imageObj.width / imageObj.height;
      let drawWidth = canvas.width;
      let drawHeight = canvas.width / aspect;

      if (drawHeight < canvas.height) {
          drawHeight = canvas.height;
          drawWidth = canvas.height * aspect;
      }
      return { w: drawWidth, h: drawHeight };
  };

  // Draw loop
  useEffect(() => {
    if (!canvasRef.current || !imageObj) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear and draw background
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Transparent Checkerboard
    const patternSize = 20;
    for(let i=0; i<canvas.width/patternSize; i++) {
        for(let j=0; j<canvas.height/patternSize; j++) {
            ctx.fillStyle = (i+j)%2 === 0 ? '#333' : '#444';
            ctx.fillRect(i*patternSize, j*patternSize, patternSize, patternSize);
        }
    }

    ctx.save();
    
    // Transformations (Screen Space Panning)
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    
    ctx.translate(cx + offsetX, cy + offsetY);
    ctx.rotate((rotation * Math.PI) / 180);
    ctx.scale(scale, scale);
    
    // Draw Image (Centered at 0,0 in transformed space)
    const { w: drawWidth, h: drawHeight } = getImageBaseDims();
    ctx.drawImage(imageObj, -drawWidth/2, -drawHeight/2, drawWidth, drawHeight);
    
    ctx.restore();

    // Draw UI Overlays (Handles, Grid) - Top of stack
    
    // 1. Grid (Fixed to Canvas)
    if (activeTab === 'image' && showGrid) {
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(canvas.width / 3, 0); ctx.lineTo(canvas.width / 3, canvas.height);
        ctx.moveTo(2 * canvas.width / 3, 0); ctx.lineTo(2 * canvas.width / 3, canvas.height);
        ctx.moveTo(0, canvas.height / 3); ctx.lineTo(canvas.width, canvas.height / 3);
        ctx.moveTo(0, 2 * canvas.height / 3); ctx.lineTo(canvas.width, 2 * canvas.height / 3);
        ctx.stroke();
        ctx.restore();
    }

    // 2. Image Handles (When Image Tab Active)
    if (activeTab === 'image') {
        const { w, h } = getImageBaseDims();
        const hw = w / 2;
        const hh = h / 2;
        
        const tl = toScreen(-hw, -hh);
        const tr = toScreen(hw, -hh);
        const bl = toScreen(-hw, hh);
        const br = toScreen(hw, hh);

        // Draw Bounding Box
        ctx.save();
        ctx.strokeStyle = '#6366f1'; // Primary Color
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(tl.x, tl.y);
        ctx.lineTo(tr.x, tr.y);
        ctx.lineTo(br.x, br.y);
        ctx.lineTo(bl.x, bl.y);
        ctx.closePath();
        ctx.stroke();

        // Draw Handles
        const handleRadius = 8;
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#6366f1';
        
        [tl, tr, bl, br].forEach(pt => {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, handleRadius, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
        });
        ctx.restore();
    }

    // 3. Text
    if (text) {
        ctx.save();
        ctx.fillStyle = textColor;
        ctx.strokeStyle = 'black';
        ctx.lineWidth = textSize / 12;
        ctx.font = `900 ${textSize}px Inter, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        ctx.miterLimit = 2;
        
        ctx.shadowColor = "rgba(0,0,0,0.8)";
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 3;
        ctx.shadowOffsetY = 3;

        ctx.strokeText(text, textPos.x, textPos.y);
        ctx.fillText(text, textPos.x, textPos.y);

        // Selection Box for Text
        if (dragTarget === 'text' || activeTab === 'text') {
            const metrics = ctx.measureText(text);
            const tw = metrics.width;
            const th = textSize;
            ctx.shadowColor = "transparent";
            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.setLineDash([6, 6]);
            ctx.rect(textPos.x - tw/2 - 15, textPos.y - th/2 - 15, tw + 30, th + 30);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        ctx.restore();
    }

  }, [imageObj, scale, offsetX, offsetY, rotation, text, textColor, textSize, textPos, dragTarget, activeTab, showGrid]);

  // --- Interaction Logic ---
  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : (e as React.MouseEvent).clientY;
      const scaleX = canvas.width / rect.width;
      const scaleY = canvas.height / rect.height;
      return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const isNearPoint = (p1: {x: number, y: number}, p2: {x: number, y: number}, dist: number) => {
      return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)) <= dist;
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!canvasRef.current) return;
    const coords = getCanvasCoords(e);
    const ctx = canvasRef.current.getContext('2d');
    
    // 1. Check Image Resize Handles first (Top Priority)
    if (activeTab === 'image') {
        const { w, h } = getImageBaseDims();
        const hw = w / 2; const hh = h / 2;
        const tl = toScreen(-hw, -hh);
        const tr = toScreen(hw, -hh);
        const bl = toScreen(-hw, hh);
        const br = toScreen(hw, hh);
        const hitDist = 20;

        if (isNearPoint(coords, tl, hitDist)) { setDragTarget('resize-tl'); setDragStart(coords); setInitialParams({ x: 0, y: 0, s: scale }); return; }
        if (isNearPoint(coords, tr, hitDist)) { setDragTarget('resize-tr'); setDragStart(coords); setInitialParams({ x: 0, y: 0, s: scale }); return; }
        if (isNearPoint(coords, bl, hitDist)) { setDragTarget('resize-bl'); setDragStart(coords); setInitialParams({ x: 0, y: 0, s: scale }); return; }
        if (isNearPoint(coords, br, hitDist)) { setDragTarget('resize-br'); setDragStart(coords); setInitialParams({ x: 0, y: 0, s: scale }); return; }
    }

    // 2. Check Text Hit
    let isTextHit = false;
    if (text && ctx) {
        ctx.font = `900 ${textSize}px Inter, sans-serif`;
        const metrics = ctx.measureText(text);
        const tw = metrics.width;
        const th = textSize;
        if (coords.x >= textPos.x - tw/2 - 20 && coords.x <= textPos.x + tw/2 + 20 &&
            coords.y >= textPos.y - th/2 - 20 && coords.y <= textPos.y + th/2 + 20) {
            isTextHit = true;
        }
    }

    if ((activeTab === 'text' || isTextHit) && text) {
        setDragTarget('text');
        setDragStart(coords);
        setInitialParams({ x: textPos.x, y: textPos.y, s: 1 });
        setActiveTab('text');
    } else {
        // 3. Fallback: Pan Image
        setDragTarget('image');
        setDragStart(coords);
        setInitialParams({ x: offsetX, y: offsetY, s: 1 });
        setActiveTab('image');
    }
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (dragTarget === 'none') return;
    e.preventDefault();
    const coords = getCanvasCoords(e);
    const deltaX = coords.x - dragStart.x;
    const deltaY = coords.y - dragStart.y;

    if (dragTarget === 'text') {
        setTextPos({ x: initialParams.x + deltaX, y: initialParams.y + deltaY });
    } else if (dragTarget === 'image') {
        // Pan logic (Screen space now!)
        setOffsetX(initialParams.x + deltaX);
        setOffsetY(initialParams.y + deltaY);
    } else if (dragTarget.startsWith('resize')) {
        // Resize logic (Simple approximation based on distance from center)
        // This gives a "pinch" zoom feel using the mouse
        const canvas = canvasRef.current;
        if (!canvas) return;
        const cx = canvas.width/2 + offsetX; // Current screen center of image
        const cy = canvas.height/2 + offsetY;
        
        // Dist from center at start
        const distStart = Math.sqrt(Math.pow(dragStart.x - cx, 2) + Math.pow(dragStart.y - cy, 2));
        // Dist from center now
        const distNow = Math.sqrt(Math.pow(coords.x - cx, 2) + Math.pow(coords.y - cy, 2));
        
        if (distStart > 0) {
            const ratio = distNow / distStart;
            setScale(Math.min(Math.max(0.1, initialParams.s * ratio), 5));
        }
    }
  };

  function handleSaveInternal() {
    if (!canvasRef.current) return;
    const dataUrl = canvasRef.current.toDataURL('image/png');
    onSave(dataUrl);
  }

  return (
    <div className="fixed inset-0 z-[100] bg-dark/95 backdrop-blur-xl flex flex-col md:flex-row animate-in fade-in duration-300">
      
      {/* 1. LEFT / TOP: Canvas Area */}
      <div className="flex-1 relative flex flex-col items-center justify-center p-4 bg-gradient-to-br from-dark to-slate-900 select-none">
         
         {/* Top Actions */}
         <div className="absolute top-4 left-4 right-4 flex justify-between z-20">
             <button onClick={onCancel} className="bg-black/40 hover:bg-white/10 text-white p-2 rounded-full transition-colors backdrop-blur-md border border-white/5">
                 <X className="w-6 h-6" />
             </button>
             
             {activeTab === 'image' && (
                 <button 
                    onClick={() => setShowGrid(!showGrid)} 
                    className={`p-2 rounded-full transition-colors backdrop-blur-md border border-white/5 ${showGrid ? 'bg-primary/50 text-white' : 'bg-black/40 text-gray-400'}`}
                    title="Afficher/Masquer la grille"
                 >
                     <Grid3x3 className="w-6 h-6" />
                 </button>
             )}
         </div>

         {/* Canvas Wrapper */}
         <div className="relative shadow-2xl shadow-black/50 rounded-lg overflow-hidden border border-white/10 ring-1 ring-white/5">
             <canvas 
              ref={canvasRef}
              width={512}
              height={512}
              onWheel={handleWheel}
              className={`max-w-full max-h-[60vh] md:max-h-[75vh] w-auto h-auto touch-none object-contain bg-[#222] ${dragTarget === 'image' ? 'cursor-move' : dragTarget.startsWith('resize') ? 'cursor-nwse-resize' : 'cursor-default'}`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setDragTarget('none')}
              onMouseLeave={() => setDragTarget('none')}
              onTouchStart={handleMouseDown}
              onTouchMove={handleMouseMove}
              onTouchEnd={() => setDragTarget('none')}
             />
             
             <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-xs text-white/90 pointer-events-none whitespace-nowrap border border-white/10 flex items-center shadow-lg">
                <MousePointer2 className="w-3 h-3 mr-2 text-primary" />
                {activeTab === 'image' ? 'Glissez l\'image pour déplacer • Coins pour redimensionner' : 'Glissez le texte pour le placer'}
             </div>
         </div>
      </div>

      {/* 2. RIGHT / BOTTOM: Tools Panel */}
      <div className="w-full md:w-96 bg-surface border-t md:border-t-0 md:border-l border-white/10 flex flex-col shadow-2xl z-20">
        
        {/* Header */}
        <div className="p-4 border-b border-white/10 bg-dark flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center">
                <ImageIcon className="w-5 h-5 mr-2 text-primary" /> Éditeur Sticker
            </h3>
            <button 
                onClick={handleSaveInternal}
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold flex items-center transition-transform active:scale-95 shadow-lg shadow-green-900/20"
            >
                <Check className="w-4 h-4 mr-1.5" /> Terminer
            </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-2 bg-dark/50 gap-2">
            <button 
                onClick={() => setActiveTab('image')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'image' ? 'bg-surface text-primary shadow-lg ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Maximize className="w-4 h-4 mr-2" /> Recadrer
            </button>
            <button 
                onClick={() => setActiveTab('text')}
                className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center transition-all ${activeTab === 'text' ? 'bg-surface text-secondary shadow-lg ring-1 ring-white/5' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
            >
                <Type className="w-4 h-4 mr-2" /> Texte
            </button>
        </div>

        {/* Tools Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {/* IMAGE TOOLS */}
            {activeTab === 'image' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    
                    {/* Zoom Control */}
                    <div className="bg-dark/30 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Zoom</label>
                            <span className="text-xs font-mono text-primary">{Math.round(scale * 100)}%</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Minus className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => setScale(s => Math.max(0.1, s - 0.1))} />
                            <input 
                                type="range" min="0.1" max="4" step="0.05" 
                                value={scale} onChange={(e) => setScale(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-dark rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <Plus className="w-4 h-4 text-gray-500 cursor-pointer hover:text-white transition-colors" onClick={() => setScale(s => Math.min(5, s + 0.1))} />
                        </div>
                    </div>

                    {/* Rotation Control */}
                    <div className="bg-dark/30 p-4 rounded-xl border border-white/5">
                        <div className="flex justify-between mb-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase">Rotation</label>
                            <span className="text-xs font-mono text-secondary">{rotation}°</span>
                        </div>
                        <div className="flex items-center gap-2 mb-3">
                             <button onClick={() => setRotation(r => r - 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"><RotateCcw className="w-4 h-4" /></button>
                             <input 
                                type="range" min="-180" max="180" step="1" 
                                value={rotation} onChange={(e) => setRotation(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-dark rounded-full appearance-none cursor-pointer accent-secondary"
                            />
                             <button onClick={() => setRotation(r => r + 90)} className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-300 transition-colors"><RotateCw className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                        <button onClick={handleResetImage} className="w-full py-2 text-sm text-gray-500 hover:text-white flex items-center justify-center transition-colors">
                            <RotateCcw className="w-3 h-3 mr-2" /> Réinitialiser l'image
                        </button>
                    </div>
                </div>
            )}

            {/* TEXT TOOLS */}
            {activeTab === 'text' && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                    <div>
                        <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Tapez votre texte..."
                            className="w-full bg-dark/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-secondary focus:border-transparent outline-none transition-all placeholder-gray-600"
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-dark/30 p-3 rounded-xl border border-white/5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex items-center">
                                <Palette className="w-3 h-3 mr-1" /> Couleur
                            </label>
                            <div className="flex items-center justify-center">
                                <input 
                                    type="color" 
                                    value={textColor} 
                                    onChange={(e) => setTextColor(e.target.value)}
                                    className="w-full h-8 bg-transparent border-none cursor-pointer rounded"
                                />
                            </div>
                        </div>

                        <div className="bg-dark/30 p-3 rounded-xl border border-white/5">
                            <label className="text-[10px] font-bold text-gray-500 uppercase mb-2 block flex items-center">
                                <Type className="w-3 h-3 mr-1" /> Taille
                            </label>
                            <input 
                                type="number" 
                                value={textSize} 
                                onChange={(e) => setTextSize(parseInt(e.target.value))}
                                className="w-full bg-transparent border-b border-white/10 text-white text-center font-mono focus:outline-none focus:border-secondary py-1"
                            />
                        </div>
                    </div>

                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <p className="text-xs text-blue-300 flex items-start">
                            <Hand className="w-4 h-4 mr-2 flex-shrink-0" />
                            Touchez le texte sur l'écran et glissez-le pour le positionner précisément.
                        </p>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};