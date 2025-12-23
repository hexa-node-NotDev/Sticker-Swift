import React from 'react';
import { Link } from 'react-router-dom';
import { Hexagon, Heart, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-surface border-t border-white/5 pt-12 pb-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <Hexagon className="h-6 w-6 text-secondary" />
              <span className="text-lg font-bold text-white">Hexa-Node</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Développeur de solutions web innovantes. Sticker-Swift est notre plateforme pour la création rapide de contenu numérique.
            </p>
          </div>

          {/* Links */}
          <div className="col-span-1 md:text-center">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Légal</h3>
            <ul className="space-y-3">
              <li>
                <Link to="/terms" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Conditions d'utilisation
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-400 hover:text-primary transition-colors text-sm">
                  Politique de Confidentialité
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1 md:text-right">
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li>
                <a href="mailto:support@hexa-node.site" className="text-gray-400 hover:text-primary transition-colors text-sm flex items-center md:justify-end">
                  <Mail className="w-4 h-4 mr-2" />
                  support@hexa-node.site
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Sticker-Swift par Hexa-Node. Tous droits réservés.
          </p>
          <div className="flex items-center mt-4 md:mt-0 text-gray-500 text-sm font-medium">
            <span>Fait par Hexa Node</span>
          </div>
        </div>
      </div>
    </footer>
  );
};