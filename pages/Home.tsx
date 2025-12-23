import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Trash2, Smartphone, Loader2, Sparkles, X, Layers, Share2, Download, Info, ArrowLeft, ImageOff, Filter, Gauge, Image as ImageIcon, FileImage, FolderPlus, Upload, ChevronDown, Pencil } from 'lucide-react';
import { searchStickers } from '../services/tenor';
import { TenorResult, StickerPack, PackSticker } from '../types';
import { StickerEditor } from '../components/StickerEditor';

export const Home: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<TenorResult[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [nextCursor, setNextCursor] = useState<string>('');
  
  // Search Configuration State
  const [searchType, setSearchType] = useState<'sticker' | 'gif' | 'static'>('sticker');
  const [quality, setQuality] = useState<'low' | 'high'>('low');

  // Pack State - Now supports multiple packs
  const [packs, setPacks] = useState<StickerPack[]>([
    { id: 'pack_default', name: 'Mon Premier Pack', author: 'Moi', stickers: [] }
  ]);
  const [activePackId, setActivePackId] = useState<string>('pack_default');
  const [isPackOpen, setIsPackOpen] = useState<boolean>(false);
  
  // Derived state for the current pack
  const activePack = packs.find(p => p.id === activePackId) || packs[0];
  
  // Editor State
  const [editingSticker, setEditingSticker] = useState<PackSticker | null>(null);

  // Export Modal State
  const [showExportModal, setShowExportModal] = useState<boolean>(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initial load
  useEffect(() => {
    handleSearch('Trending', undefined, searchType);
    
    // Load packs from local storage if available
    const savedPacks = localStorage.getItem('sticker_swift_packs');
    if (savedPacks) {
        try {
            setPacks(JSON.parse(savedPacks));
            // Set active pack to the first one if the previously active one doesn't exist
            // Or just default to first
        } catch (e) {
            console.error("Failed to load packs", e);
        }
    }
  }, []);

  // Save packs to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('sticker_swift_packs', JSON.stringify(packs));
  }, [packs]);

  // Effect to reload when filter changes (if there is a query)
  useEffect(() => {
    if (query || !nextCursor) { 
       const q = query || 'Trending';
       setResults([]); 
       handleSearch(q, undefined, searchType);
    }
  }, [searchType]);

  const handleSearch = async (searchTerm: string, cursor?: string, type: 'sticker' | 'gif' | 'static' = 'sticker') => {
    if (!searchTerm.trim()) return;
    
    setIsLoading(true);
    const response = await searchStickers(searchTerm, 30, cursor, type);
    
    if (cursor) {
      setResults(prev => [...prev, ...response.results]);
    } else {
      setResults(response.results);
    }
    
    setNextCursor(response.next);
    setIsLoading(false);
  };

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setResults([]); 
    handleSearch(query, undefined, searchType);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    handleSearch('Trending', undefined, searchType);
  };

  // Helper to safely get the best available image URL based on selected Quality
  const getImageUrl = (sticker: TenorResult): string | undefined => {
    const formats = sticker.media_formats || {};
    
    if (quality === 'high') {
        return formats.mediumgif?.url || 
               formats.gif?.url || 
               formats.tinygif?.url ||
               formats.nanogif?.url;
    } else {
        return formats.tinygif?.url || 
               formats.nanogif?.url || 
               formats.mediumgif?.url || 
               formats.gif?.url;
    }
  };

  // Pack Management Functions
  const createNewPack = () => {
      const newPack: StickerPack = {
          id: `pack_${Date.now()}`,
          name: `Nouveau Pack ${packs.length + 1}`,
          author: 'Moi',
          stickers: []
      };
      setPacks([...packs, newPack]);
      setActivePackId(newPack.id);
  };

  const deleteActivePack = () => {
      if (packs.length <= 1) {
          alert("Vous ne pouvez pas supprimer le dernier pack.");
          return;
      }
      if (window.confirm("Êtes-vous sûr de vouloir supprimer ce pack ?")) {
          const newPacks = packs.filter(p => p.id !== activePackId);
          setPacks(newPacks);
          setActivePackId(newPacks[0].id);
      }
  };

  const updateActivePackDetails = (key: 'name' | 'author', value: string) => {
      setPacks(packs.map(p => p.id === activePackId ? { ...p, [key]: value } : p));
  };

  const addToPack = (sticker: TenorResult) => {
    if (activePack.stickers.find(s => s.id === sticker.id)) return;
    if (activePack.stickers.length >= 30) {
      alert("Ce pack est plein (30 stickers max). Créez un nouveau pack !");
      return;
    }

    const url = getImageUrl(sticker);
    if (!url) return;

    const newSticker: PackSticker = {
        id: sticker.id,
        url: url,
        source: 'tenor',
        tenorData: sticker
    };

    setPacks(packs.map(p => p.id === activePackId ? { ...p, stickers: [...p.stickers, newSticker] } : p));
    setIsPackOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (!file.type.startsWith('image/')) {
          alert("Veuillez sélectionner une image valide.");
          return;
      }

      if (activePack.stickers.length >= 30) {
          alert("Ce pack est plein (30 stickers max).");
          return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
          if (event.target?.result) {
              const newSticker: PackSticker = {
                  id: `upload_${Date.now()}`,
                  url: event.target.result as string,
                  source: 'user'
              };
              setPacks(packs.map(p => p.id === activePackId ? { ...p, stickers: [...p.stickers, newSticker] } : p));
              
              // Reset file input
              if (fileInputRef.current) fileInputRef.current.value = '';
          }
      };
      reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
      fileInputRef.current?.click();
  };

  const removeFromPack = (id: string) => {
    setPacks(packs.map(p => p.id === activePackId ? { ...p, stickers: p.stickers.filter(s => s.id !== id) } : p));
  };

  const handleEditSticker = (sticker: PackSticker) => {
      setEditingSticker(sticker);
  };

  const saveEditedSticker = (newUrl: string) => {
      if (!editingSticker) return;

      const updatedSticker: PackSticker = {
          ...editingSticker,
          url: newUrl,
          source: 'user' // It becomes a user image (static png) after edit
      };

      setPacks(packs.map(p => 
          p.id === activePackId 
          ? { ...p, stickers: p.stickers.map(s => s.id === editingSticker.id ? updatedSticker : s) } 
          : p
      ));
      
      setEditingSticker(null);
  };

  const handleOpenExport = () => {
    setShowExportModal(true);
  };

  const downloadPackFile = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(activePack));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `${activePack.name.replace(/\s+/g, '_')}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const shareOnWhatsApp = () => {
    const text = `Je viens de créer le pack de stickers "${activePack.name}" sur Sticker-Swift par Hexa-Node !`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Helper text for empty results based on type
  const getTypeLabel = () => {
      switch(searchType) {
          case 'sticker': return 'stickers animés';
          case 'static': return 'stickers fixes';
          case 'gif': return 'GIFs / images';
          default: return 'résultats';
      }
  };

  return (
    <div className="min-h-screen bg-dark pb-20">
      {/* Hidden File Input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept="image/png, image/jpeg, image/gif, image/webp" 
        className="hidden" 
      />

      {/* Hero Section */}
      <div className="relative bg-surface border-b border-white/5 overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20 pointer-events-none">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary rounded-full blur-3xl"></div>
          <div className="absolute top-48 -left-24 w-72 h-72 bg-secondary rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight mb-6">
            Créez des Stickers <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Ultra Rapidement
            </span>
          </h1>
          <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
            Accédez à des millions de GIFs ou importez vos photos pour créer vos packs WhatsApp.
            Propulsé par Hexa-Node.
          </p>

          <form onSubmit={onSearchSubmit} className="mt-10 max-w-xl mx-auto relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 group-focus-within:text-primary transition-colors" />
            </div>
            <input
              type="text"
              className="block w-full pl-11 pr-12 py-4 bg-dark/50 border border-white/10 rounded-2xl leading-5 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all shadow-xl backdrop-blur-sm"
              placeholder="Rechercher des stickers (ex: chat drôle, café)..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            
            {query && (
              <button
                type="button"
                onClick={clearSearch}
                className="absolute right-20 top-4 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button 
              type="submit"
              className="absolute right-2 top-2 bottom-2 bg-primary hover:bg-primary/90 text-white px-6 rounded-xl font-medium transition-colors"
            >
              Go
            </button>
          </form>

          {/* Filters Bar */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Type Filter */}
            <div className="bg-dark/60 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10 overflow-x-auto max-w-full">
                <button 
                    onClick={() => setSearchType('sticker')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${searchType === 'sticker' ? 'bg-secondary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <Sparkles className="w-3 h-3 mr-2" />
                    Stickers Animés
                </button>
                <button 
                    onClick={() => setSearchType('static')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${searchType === 'static' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <FileImage className="w-3 h-3 mr-2" />
                    Stickers Fixes
                </button>
                <button 
                    onClick={() => setSearchType('gif')}
                    className={`px-3 sm:px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center whitespace-nowrap ${searchType === 'gif' ? 'bg-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
                >
                    <ImageIcon className="w-3 h-3 mr-2" />
                    Non Transparent
                </button>
            </div>

            {/* Quality Filter */}
            <div className="bg-dark/60 backdrop-blur-md rounded-xl p-1 flex items-center border border-white/10">
                <button 
                    onClick={() => setQuality('low')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${quality === 'low' ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    <Gauge className="w-3 h-3 mr-2" />
                    Éco
                </button>
                <button 
                    onClick={() => setQuality('high')}
                    className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center ${quality === 'high' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                >
                    HD
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <Filter className="w-5 h-5 mr-2 text-primary" />
            {query ? `Résultats pour "${query}"` : `Tendances (${getTypeLabel()})`}
          </h2>
          <button 
             onClick={() => setIsPackOpen(true)}
             className="relative bg-surface border border-white/10 hover:border-primary/50 text-white px-4 py-2 rounded-lg flex items-center transition-all group"
          >
            <Layers className="w-4 h-4 mr-2 group-hover:text-primary transition-colors" />
            <span className="mr-2">Gérer mes Packs</span>
            <div className="bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full border border-primary/20">
               {activePack.stickers.length}
            </div>
          </button>
        </div>

        {/* Empty State */}
        {!isLoading && results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/30 rounded-2xl border border-dashed border-white/10">
            <div className="bg-dark p-4 rounded-full mb-4">
              <ImageOff className="w-10 h-10 text-gray-500" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">Aucun résultat trouvé</h3>
            <p className="text-gray-400 text-center max-w-md">
              Nous n'avons trouvé aucun {getTypeLabel()} pour "{query}". Essayez de changer le filtre ou utilisez des mots-clés anglais.
            </p>
            <button 
              onClick={clearSearch}
              className="mt-6 text-primary hover:text-primary/80 font-medium hover:underline"
            >
              Voir les tendances
            </button>
          </div>
        )}

        {/* Results Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((gif) => {
            const thumbUrl = getImageUrl(gif);
            return (
              <div 
                key={gif.id} 
                className="group relative aspect-square bg-surface rounded-xl overflow-hidden cursor-pointer border border-white/5 hover:border-primary transition-all hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-1"
                onClick={() => addToPack(gif)}
              >
                {thumbUrl ? (
                  <img 
                    src={thumbUrl} 
                    alt={gif.content_description} 
                    className={`w-full h-full object-contain ${searchType === 'sticker' || searchType === 'static' ? 'p-2' : 'object-cover'}`}
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs p-2 text-center">
                    Image non disponible
                  </div>
                )}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Plus className="w-8 h-8 text-white scale-75 group-hover:scale-100 transition-transform" />
                </div>
                {/* Visual indicator if already in active pack */}
                {activePack.stickers.some(p => p.id === gif.id) && (
                    <div className="absolute top-2 right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                        <Smartphone className="w-3 h-3" />
                    </div>
                )}
              </div>
            );
          })}
        </div>

        {isLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        )}

        {!isLoading && results.length > 0 && nextCursor && (
          <div className="flex justify-center mt-12">
            <button 
              onClick={() => handleSearch(query || 'Trending', nextCursor, searchType)}
              className="bg-surface hover:bg-surface/80 text-white border border-white/10 px-8 py-3 rounded-full font-medium transition-colors"
            >
              Charger plus de résultats
            </button>
          </div>
        )}
      </main>

      {/* Floating Pack Panel (Right Sidebar) */}
      {isPackOpen && (
        <div className="fixed inset-0 z-[70] flex justify-end">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsPackOpen(false)}></div>
          <div className="relative w-full max-w-md bg-surface h-full shadow-2xl border-l border-white/10 flex flex-col transform transition-transform duration-300 ease-in-out">
            
            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-dark flex items-center justify-between sticky top-0 z-10 shadow-md">
              <button 
                onClick={() => setIsPackOpen(false)}
                className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg border border-white/20 transition-all hover:border-primary/50 group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium text-sm">Retour</span>
              </button>
              
              <div className="text-right">
                 <h3 className="text-lg font-bold text-white">Gestionnaire</h3>
                 <p className="text-xs text-gray-400">Hexa-Node Studio</p>
              </div>
            </div>

            {/* Pack Selector & Controls */}
            <div className="p-4 bg-dark/30 border-b border-white/5 space-y-4">
                <div className="flex items-center space-x-2">
                    <div className="relative flex-grow">
                        <select 
                            value={activePackId}
                            onChange={(e) => setActivePackId(e.target.value)}
                            className="w-full appearance-none bg-surface border border-white/10 rounded-lg py-2 pl-3 pr-10 text-white focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer"
                        >
                            {packs.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                    
                    <button 
                        onClick={createNewPack}
                        className="bg-primary hover:bg-primary/90 text-white p-2 rounded-lg transition-colors"
                        title="Nouveau Pack"
                    >
                        <FolderPlus className="w-5 h-5" />
                    </button>
                    
                    <button 
                        onClick={deleteActivePack}
                        disabled={packs.length <= 1}
                        className={`p-2 rounded-lg transition-colors ${packs.length <= 1 ? 'bg-white/5 text-gray-600 cursor-not-allowed' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'}`}
                        title="Supprimer le pack"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Nom du Pack</label>
                        <input 
                            type="text" 
                            value={activePack.name}
                            onChange={(e) => updateActivePackDetails('name', e.target.value)}
                            className="w-full bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-1 uppercase tracking-wider">Auteur</label>
                        <input 
                            type="text" 
                            value={activePack.author}
                            onChange={(e) => updateActivePackDetails('author', e.target.value)}
                            className="w-full bg-dark border border-white/10 rounded-lg px-3 py-1.5 text-sm text-white focus:ring-1 focus:ring-primary focus:outline-none"
                        />
                    </div>
                </div>

                {/* Import Button */}
                <button 
                    onClick={triggerFileUpload}
                    className="w-full bg-white/5 hover:bg-white/10 border border-dashed border-white/20 text-gray-300 py-2 rounded-lg flex items-center justify-center transition-all text-sm group"
                >
                    <Upload className="w-4 h-4 mr-2 group-hover:text-white" />
                    Importer une photo depuis l'appareil
                </button>
            </div>

            {/* Stickers List */}
            <div className="flex-1 overflow-y-auto p-4 bg-dark/20">
              {activePack.stickers.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 text-center">
                  <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                      <Layers className="w-8 h-8 opacity-20" />
                  </div>
                  <p className="font-medium text-gray-400 mb-1">Ce pack est vide</p>
                  <p className="text-xs max-w-[200px]">Recherchez des stickers ou importez vos propres photos pour commencer.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-3">
                  {activePack.stickers.map((sticker) => {
                    return (
                      <div key={sticker.id} className="relative group aspect-square rounded-lg overflow-hidden bg-surface border border-white/5">
                        <img 
                            src={sticker.url} 
                            className={`w-full h-full ${sticker.source === 'user' || searchType !== 'gif' ? 'object-contain p-1' : 'object-cover'}`} 
                            alt="Sticker"
                        />
                        {/* Source Badge */}
                        {sticker.source === 'user' && (
                             <div className="absolute top-1 left-1 bg-blue-500/80 p-0.5 rounded text-[8px] text-white px-1">PERSO</div>
                        )}
                        
                        {/* Action Buttons Overlay */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                             <button 
                                onClick={() => handleEditSticker(sticker)}
                                className="bg-primary hover:bg-primary/90 p-1.5 rounded-full text-white transition-colors"
                                title="Éditer"
                             >
                                <Pencil className="w-3 h-3" />
                             </button>
                             <button 
                                onClick={() => removeFromPack(sticker.id)}
                                className="bg-red-500 hover:bg-red-600 p-1.5 rounded-full text-white transition-colors"
                                title="Supprimer"
                             >
                                <Trash2 className="w-3 h-3" />
                             </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-surface space-y-3">
               <div className="flex justify-between text-sm text-gray-400 mb-2">
                 <span>Contenu du pack</span>
                 <span className={`${activePack.stickers.length >= 30 ? 'text-red-400 font-bold' : ''}`}>{activePack.stickers.length} / 30</span>
               </div>
               
               <button 
                onClick={handleOpenExport}
                disabled={activePack.stickers.length === 0}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-green-900/20"
               >
                 <Smartphone className="w-5 h-5 mr-2" />
                 Ajouter à WhatsApp
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Editor Modal */}
      {editingSticker && (
        <StickerEditor 
            imageUrl={editingSticker.url} 
            onSave={saveEditedSticker} 
            onCancel={() => setEditingSticker(null)} 
        />
      )}

      {/* Export Explanation Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowExportModal(false)}></div>
          <div className="relative bg-surface border border-white/10 rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in duration-300">
            
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center text-white">
                <div className="bg-primary/20 p-2 rounded-lg mr-3">
                  <Smartphone className="w-6 h-6 text-primary" />
                </div>
                <div>
                    <h3 className="text-xl font-bold">Installation du Pack</h3>
                    <p className="text-xs text-gray-400">{activePack.name}</p>
                </div>
              </div>
              <button onClick={() => setShowExportModal(false)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-blue-900/20 border border-blue-500/20 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <Info className="w-5 h-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-200">
                  <strong>Information importante :</strong> Pour des raisons de sécurité, WhatsApp n'autorise pas l'ajout direct de stickers depuis un site web.
                </p>
              </div>
            </div>

            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Pour ajouter ce pack, vous devez télécharger le fichier de données et l'importer via notre application native (bientôt disponible) ou une application tierce compatible.
            </p>

            <div className="space-y-3">
              <button 
                onClick={downloadPackFile}
                className="w-full bg-surface border border-white/10 hover:bg-white/5 text-white font-semibold py-3 rounded-xl flex items-center justify-center transition-colors"
              >
                <Download className="w-5 h-5 mr-2" />
                Télécharger le fichier (.json)
              </button>
              
              <button 
                onClick={shareOnWhatsApp}
                className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl flex items-center justify-center transition-colors shadow-lg shadow-green-900/20"
              >
                <Share2 className="w-5 h-5 mr-2" />
                Partager le lien sur WhatsApp
              </button>
            </div>

            <p className="text-xs text-center text-gray-500 mt-6">
              Application mobile Sticker-Swift Native bientôt sur Play Store & App Store.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};