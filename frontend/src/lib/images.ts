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

// Photos football et personal trainer : banque d'images libre de droits (Unsplash).
import footballStaff from "../../public/pics/football_images/staff-technique.jpg";
import footballTeam from "../../public/pics/football_images/seance-equipe.jpg";
import footballDrill from "../../public/pics/football_images/exercice-plots.jpg";
import footballCoach from "../../public/pics/football_images/coach-terrain.jpg";

import ptTechnique from "../../public/pics/personal_trainers/coaching-technique.jpg";
import ptLifting from "../../public/pics/personal_trainers/coaching-halterophilie.jpg";
import ptFollowUp from "../../public/pics/personal_trainers/suivi-client.jpg";
import ptBalance from "../../public/pics/personal_trainers/coaching-equilibre.jpg";

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
  { src: footballStaff, alt: "Staff technique préparant une séance d'entraînement au bord du terrain" },
  { src: footballTeam, alt: "Équipe à l'échauffement pendant une séance d'entraînement" },
  { src: footballDrill, alt: "Joueur réalisant un exercice technique entre les plots" },
  { src: footballCoach, alt: "Entraîneur donnant des consignes à une joueuse sur le terrain" },
];

export const personalPhotos: Photo[] = [
  { src: ptTechnique, alt: "Coach personnel corrigeant la technique d'une cliente en salle" },
  { src: ptLifting, alt: "Coach supervisant un soulevé de terre en salle de musculation" },
  { src: ptFollowUp, alt: "Coach faisant le point avec sa cliente sur une tablette" },
  { src: ptBalance, alt: "Coach accompagnant un exercice d'équilibre" },
];
