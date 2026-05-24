import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-marine-profond border-t border-white/[0.08] text-slate-300 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
          {/* Brand block */}
          <div className="lg:col-span-2 space-y-4">
            <span className="font-playfair text-2xl font-black tracking-tight text-white">
              SERMA <span className="text-orange-logo">GROUPE</span>
            </span>
            <p className="text-orange-logo font-mono text-xs uppercase tracking-widest font-bold">
              Former. Structurer. Performer.
            </p>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Le Groupe SERMA accompagne les entreprises et les individus vers l'excellence économique et professionnelle au Bénin. 
              Une alliance unique d'expertise comptable et de formation pratique.
            </p>
            <p className="text-slate-500 text-xs">
              📍 Zongo 2, axe BENI CHIC – PRESIDO, Parakou, Bénin
            </p>
          </div>

          {/* Col 1: Groupe */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-logo pl-2">
              Le Groupe
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/#presentation" className="hover:text-white transition-colors">
                  Qui sommes-nous
                </Link>
              </li>
              <li>
                <Link href="/#approche" className="hover:text-white transition-colors">
                  Notre approche
                </Link>
              </li>
              <li>
                <Link href="/#pourquoi" className="hover:text-white transition-colors">
                  Nos valeurs
                </Link>
              </li>
              <li>
                <Link href="/blog" className="hover:text-white transition-colors">
                  Ressources & Blog
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 2: Cabinet */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-logo pl-2">
              Cabinet SERMA
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/cabinet#services" className="hover:text-white transition-colors">
                  Tenue comptable
                </Link>
              </li>
              <li>
                <Link href="/cabinet#services" className="hover:text-white transition-colors">
                  Certification
                </Link>
              </li>
              <li>
                <Link href="/cabinet#services" className="hover:text-white transition-colors">
                  Conseil fiscal & social
                </Link>
              </li>
              <li>
                <Link href="/cabinet#contact" className="hover:text-white transition-colors">
                  Prendre rendez-vous
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Academy */}
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4 border-l-2 border-orange-logo pl-2">
              SERMA HUB Academy
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/academy#filieres" className="hover:text-white transition-colors">
                  Les 5 filières métiers
                </Link>
              </li>
              <li>
                <Link href="/academy#formations" className="hover:text-white transition-colors">
                  Formations courtes
                </Link>
              </li>
              <li>
                <Link href="/academy/inscription" className="hover:text-white transition-colors">
                  Inscription cohorte
                </Link>
              </li>
              <li>
                <Link href="/academy#contact" className="hover:text-white transition-colors">
                  Contact Academy
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Middle Line - Contact details bar */}
        <div className="border-t border-white/[0.05] py-6 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
          <div className="flex flex-wrap justify-center sm:justify-start gap-6 font-medium">
            <span>📞 Direct : <a href="tel:+2290196237343" className="text-white hover:text-orange-logo transition-colors">+229 01 96 23 73 43</a></span>
            <span>💬 WhatsApp : <a href="https://wa.me/2290140377199" target="_blank" rel="noopener noreferrer" className="text-white hover:text-orange-logo transition-colors">+229 01 40 37 71 99</a></span>
            <span>✉️ E-mail : <a href="mailto:contact@sermagroupe.bj" className="text-white hover:text-orange-logo transition-colors">contact@sermagroupe.bj</a></span>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="border-t border-white/[0.05] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>
            © {new Date().getFullYear()} Groupe SERMA — Cabinet SERMA SARL + SERMA HUB Impact Academy. Tous droits réservés.
          </p>
          <div className="flex gap-4">
            <Link href="/confidentialite" className="hover:underline">
              Politique de confidentialité
            </Link>
            <span>·</span>
            <Link href="/mentions" className="hover:underline">
              Mentions légales
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
