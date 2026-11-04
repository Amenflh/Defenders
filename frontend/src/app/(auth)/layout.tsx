import Image from "next/image";
import { redirect } from "next/navigation";
import { bannerPhotos, brand } from "@/lib/images";
import { getCurrentUser, homeFor } from "@/lib/session";
import { site } from "@/lib/site";
import { AuthVideo } from "./AuthVideo";

/** Écrans de connexion / création de compte : vidéo à gauche, formulaire à droite. */
export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // Déjà connecté → directement vers son espace.
  const user = await getCurrentUser();
  if (user && user !== "unavailable") redirect(homeFor(user.role));

  return (
    <main className="grid min-h-dvh lg:grid-cols-[1.1fr_1fr]">
      <aside className="relative hidden overflow-hidden lg:block">
        <Image
          src={bannerPhotos[0].src}
          alt=""
          fill
          preload
          placeholder="blur"
          sizes="55vw"
          className="object-cover grayscale-[40%]"
        />
        {/* La photo reste visible pendant le chargement de la vidéo. */}
        <AuthVideo src="/video/formation.mp4" poster={bannerPhotos[0].src.src} />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="absolute inset-x-0 bottom-0 p-12 xl:p-16">
          <p className="eyebrow mb-4">Centre de formation certifié · {site.approval}</p>
          <p className="heading-lg max-w-xl">
            Former les coachs <span className="text-gold">de demain</span>
          </p>
          <p className="mt-4 max-w-md text-mist">{site.tagline}.</p>
        </div>
      </aside>

      <section className="flex flex-col justify-center px-5 py-12 sm:px-10">
        <div className="mx-auto w-full max-w-md">
          <div className="mb-10 flex items-center gap-3">
            <Image src={brand.logo} alt="" width={52} height={52} className="rounded-full ring-1 ring-white/15" />
            <span className="leading-none">
              <span className="block font-display text-xl font-semibold tracking-[0.18em] uppercase">Defenders</span>
              <span className="block text-[0.62rem] tracking-[0.34em] text-mist uppercase">Fitness Academy</span>
            </span>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
