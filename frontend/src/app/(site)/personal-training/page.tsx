import { permanentRedirect } from "next/navigation";

/** Ancienne adresse : les formations sont désormais sous /formations/<slug>. */
export default function Page() {
  permanentRedirect("/formations/personal-training");
}
