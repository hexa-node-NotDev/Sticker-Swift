import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Privacy: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface border border-white/5 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>

        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Politique de Confidentialité</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <p className="text-sm text-gray-500">Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}</p>
          
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Introduction</h2>
            <p>
              La confidentialité de vos données est une priorité pour <strong>Hexa Node</strong>. Cette politique décrit comment Sticker-Swift gère vos informations. Notre philosophie est simple : nous ne collectons pas ce dont nous n'avons pas besoin.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Données Collectées</h2>
            <p>
              <strong>Aucune donnée personnelle</strong> (nom, email, IP stockée) n'est collectée par Hexa Node lors de l'utilisation standard du site.
              Les packs de stickers que vous créez sont générés localement dans votre navigateur et ne sont pas envoyés sur nos serveurs.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Cookies et Stockage Local</h2>
            <p>
              Nous utilisons le <em>LocalStorage</em> de votre navigateur uniquement pour :
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Sauvegarder temporairement votre pack en cours de création.</li>
                <li>Mémoriser vos préférences d'affichage (filtres).</li>
              </ul>
              Ces données restent sur votre appareil et peuvent être effacées à tout moment en vidant le cache de votre navigateur.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Services Tiers</h2>
            <p>
              Pour la recherche d'images, ce site utilise l'API Tenor (Google). L'utilisation de cette fonctionnalité est soumise aux <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Règles de confidentialité de Google</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Nous Contacter</h2>
            <p>
              Si vous avez des questions concernant cette politique de confidentialité, vous pouvez nous contacter par email à : <br />
              <a href="mailto:support@hexa-node.site" className="text-primary font-medium hover:underline">support@hexa-node.site</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};