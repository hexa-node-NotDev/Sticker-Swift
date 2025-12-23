import React, { useState, useEffect } from 'react';
import { Save, RotateCcw, Key, ArrowLeft, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Settings: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('sticker_swift_api_key');
    if (stored) setApiKey(stored);
  }, []);

  const handleSave = () => {
    if (apiKey.trim()) {
      localStorage.setItem('sticker_swift_api_key', apiKey.trim());
    } else {
      localStorage.removeItem('sticker_swift_api_key');
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleReset = () => {
    localStorage.removeItem('sticker_swift_api_key');
    setApiKey('');
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-surface border border-white/5 rounded-2xl p-8 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="flex items-center mb-8 pb-4 border-b border-white/10">
            <div className="p-3 bg-primary/20 rounded-xl mr-4">
                <Key className="w-8 h-8 text-primary" />
            </div>
            <div>
                <h1 className="text-2xl font-bold text-white">Configuration API</h1>
                <p className="text-gray-400 text-sm">Gérez votre connexion aux services Tenor</p>
            </div>
        </div>

        <div className="space-y-6">
          <div className="bg-dark/50 p-4 rounded-xl border border-white/5">
            <h3 className="text-white font-medium mb-2 flex items-center">
                <ShieldCheck className="w-4 h-4 mr-2 text-green-400" />
                Clé API Gratuite
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed mb-4">
              L'application utilise une clé par défaut partagée. Pour éviter les limites de quota ou utiliser votre propre projet Google Cloud, vous pouvez entrer votre clé API Tenor v2 ici.
            </p>
            <a 
                href="https://developers.google.com/tenor/guides/quickstart" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center text-primary hover:text-primary/80 text-sm font-medium"
            >
                Obtenir une clé API Tenor <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Votre Clé API</label>
            <input 
              type="text" 
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Collez votre clé ici (ex: AIzaSy...)"
              className="w-full bg-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all font-mono text-sm"
            />
          </div>

          <div className="flex items-center space-x-4 pt-4">
            <button 
              onClick={handleSave}
              className={`flex-1 font-bold py-3 rounded-xl flex items-center justify-center transition-all active:scale-95 ${
                  saved 
                  ? 'bg-green-500 hover:bg-green-600 text-white' 
                  : 'bg-primary hover:bg-primary/90 text-white'
              }`}
            >
              {saved ? 'Enregistré !' : 'Sauvegarder'}
              <Save className="w-5 h-5 ml-2" />
            </button>
            
            <button 
              onClick={handleReset}
              className="px-4 py-3 bg-white/5 hover:bg-white/10 text-gray-300 rounded-xl transition-colors border border-white/5"
              title="Rétablir la clé par défaut"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};