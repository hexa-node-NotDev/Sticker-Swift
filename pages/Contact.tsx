import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, MapPin, ArrowLeft } from 'lucide-react';

export const Contact: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Contactez Hexa-Node</h1>
          <p className="text-gray-400">Une question sur Sticker-Swift ? Un projet à développer ?</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-surface p-8 rounded-2xl border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-6">Nos Coordonnées</h2>
            <div className="space-y-6">
              <div className="flex items-start">
                <Mail className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <h3 className="text-white font-medium">Email</h3>
                  <a href="mailto:support@hexa-node.site" className="text-gray-400 hover:text-white transition-colors">support@hexa-node.site</a>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-6 h-6 text-secondary mt-1 mr-4" />
                <div>
                  <h3 className="text-white font-medium">Studio</h3>
                  <p className="text-gray-400">Hexa-Node</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-surface p-8 rounded-2xl border border-white/5">
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Nom</label>
                <input type="text" className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Votre nom" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Email</label>
                <input type="email" className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="votre@email.com" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Message</label>
                <textarea rows={4} className="w-full bg-dark border border-white/10 rounded-lg px-4 py-3 text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none" placeholder="Comment pouvons-nous vous aider ?"></textarea>
              </div>
              <button className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 rounded-lg transition-colors">
                Envoyer le message
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};