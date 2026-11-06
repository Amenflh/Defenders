/**
 * Lien WhatsApp (wa.me) vers un numéro saisi librement : « 92 204 005 », « +216 92… », « 0021692… ».
 * Un numéro tunisien à 8 chiffres reçoit l'indicatif 216. Renvoie null si le numéro est inutilisable.
 */
export function whatsappHref(phone: string, message?: string): string | null {
  let digits = phone.replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.length === 8) digits = `216${digits}`;
  if (digits.length < 10 || digits.length > 15) return null;
  return `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

/** Message de premier contact pré-rempli, envoyé par l'équipe depuis l'admin. */
export function followUpMessage(firstName: string, formations: string[], brand = "Defenders Fitness Academy"): string {
  const about = formations.length ? ` concernant la formation ${formations.join(", ")}` : "";
  return `Bonjour ${firstName}, ici l'équipe ${brand}. Nous avons bien reçu votre demande${about}. Quand pouvons-nous vous appeler ?`;
}
