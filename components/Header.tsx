import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Zap, Layers } from 'lucide-react';

export const Header: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full bg-dark/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-gradient-to-br from-primary to-secondary p-2 rounded-lg group-hover:shadow-lg group-hover:shadow-primary/50 transition-all duration-300">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                Sticker-Swift
              </span>
            </Link>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link 
                to="/" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/') ? 'text-primary bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Créer un Pack
              </Link>
              <Link 
                to="/terms" 
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive('/terms') ? 'text-primary bg-white/5' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
              >
                Conditions
              </Link>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="bg-surface px-3 py-1 rounded-full border border-white/10 text-xs text-gray-400 flex items-center">
              <Layers className="w-3 h-3 mr-1" />
              v1.2.0
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};