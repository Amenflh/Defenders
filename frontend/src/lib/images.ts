// Imports statiques : Next.js connaît les dimensions et génère un flou de chargement.
import logo from "../../public/pics/logo.jpg";
import info from "../../public/pics/info.jpg";

import banner1 from "../../public/pics/banner_images/banner1.jpeg";
import banner2 from "../../public/pics/banner_images/banner2.jpeg";
import banner3 from "../../public/pics/banner_images/banner3.jpg";
import banner4 from "../../public/pics/banner_images/banner4.jpg";
import banner5 from "../../public/pics/banner_images/banner5.jpeg";
import banner6 from "../../public/pics/banner_images/banner6.jpeg";
import banner7 from "../../public/pics/banner_images/banner7.jpeg";
import banner18 from "../../public/pics/banner_images/banner18.jpeg";

import pilates1 from "../../public/pics/Pilates_images/acc_images.jpg";
import pilates2 from "../../public/pics/Pilates_images/acc_images1.jpg";
import pilates3 from "../../public/pics/Pilates_images/acc_images2.jpg";

import footballTeam from "../../public/pics/football_images/2.jpeg";
import footballPoster from "../../public/pics/football_images/acc_images.jpg";

import ptPoster1 from "../../public/pics/personal_trainers/acc_images.jpg";
import ptPoster2 from "../../public/pics/personal_trainers/acc_images1.jpeg";

import type { StaticImageData } from "next/image";

export type Photo = { src: StaticImageData; alt: string };

export const brand = { logo, info };

/** Images du bandeau défilant de la page d'accueil (dossier banner_images). */
export const bannerPhotos: Photo[] = [
  { src: banner18, alt: "Remise de certificat à un stagiaire de Defenders Academy" },
  { src: banner1, alt: "Diplômé entouré des formateurs lors de la cérémonie de certification" },
  { src: banner5, alt: "Promotion de stagiaires réunie en salle de formation" },
  { src: banner2, alt: "Stagiaire recevant son certificat de fin de formation" },
  { src: banner6, alt: "Séance théorique en salle avec l'ensemble des stagiaires" },
  { src: banner3, alt: "Cérémonie de certification : stagiaire et formateurs" },
  { src: banner7, alt: "Remise officielle d'un certificat de formation" },
  { src: banner4, alt: "Stagiaire certifiée posant avec les formateurs" },
];

export const pilatesPhotos: Photo[] = [
  { src: pilates2, alt: "Exercice de Pilates sur Reformer avec sangles" },
  { src: pilates1, alt: "Travail de jambes sur Reformer dans un studio lumineux" },
  { src: pilates3, alt: "Deux pratiquantes en séance de Pilates Reformer" },
];

export const footballPhotos: Photo[] = [
  { src: footballPoster, alt: "Affiche de la formation d'entraîneur de football — 4 jours, hébergement inclus" },
  { src: footballTeam, alt: "Équipe de jeunes footballeurs et encadrement sur le terrain" },
];

export const personalPhotos: Photo[] = [
  { src: ptPoster2, alt: "Affiche Personal Fitness Trainer Certification" },
  { src: ptPoster1, alt: "Affiche de la certification Personal Fitness Trainer — 7 certificats" },
];
