import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

export const Terms: React.FC = () => {
  return (
    <div className="min-h-screen bg-dark py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-surface border border-white/5 rounded-2xl p-8 sm:p-12 shadow-2xl">
        <div className="mb-6">
          <Link to="/" className="inline-flex items-center text-gray-400 hover:text-primary transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Retour à l'accueil
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-white mb-8 border-b border-white/10 pb-4">Conditions d'Utilisation</h1>
        
        <div className="space-y-6 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Présentation</h2>
            <p>
              Bienvenue sur Sticker-Swift. Ce service est édité et maintenu par <strong>Hexa Node</strong>. En accédant à ce site Web, vous acceptez d'être lié par les présentes conditions d'utilisation, toutes les lois et réglementations applicables, et convenez que vous êtes responsable du respect des lois locales applicables.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Utilisation du Service</h2>
            <p>
              Sticker-Swift est un outil permettant la recherche et la compilation de stickers et GIFs.
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>Vous êtes responsable du contenu que vous compilez dans vos packs.</li>
                <li>L'utilisation du service à des fins illégales ou nuisibles est strictement interdite.</li>
                <li>Hexa Node se réserve le droit de suspendre l'accès au service en cas d'abus.</li>
              </ul>
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Propriété Intellectuelle</h2>
            <p>
              Le code source, le design et l'infrastructure de Sticker-Swift sont la propriété exclusive de <strong>Hexa Node</strong>.
              Les images et contenus recherchés via l'API Tenor (Google) restent la propriété de leurs créateurs respectifs. Nous ne revendiquons aucun droit sur les images tierces affichées.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Limitation de Responsabilité</h2>
            <p>
              Les services de Hexa Node sont fournis "tels quels". Hexa Node ne donne aucune garantie, expresse ou implicite. En aucun cas, Hexa Node ou ses fournisseurs ne pourront être tenus responsables de tout dommage (y compris, sans limitation, les dommages pour perte de données ou de profit) découlant de l'utilisation de Sticker-Swift.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
            <p>
              Pour toute question concernant ces conditions, veuillez nous contacter à : <a href="mailto:support@hexa-node.site" className="text-primary hover:underline">support@hexa-node.site</a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};