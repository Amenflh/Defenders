"use client";

import { useState } from "react";
import { Icon } from "@/components/Icon";
import { dateFmt } from "@/lib/labels";
import { formatTnd, type MyReferral, type RewardState } from "@/lib/program";

const REWARD: Record<RewardState, { label: string; tone: string }> = {
  en_attente: { label: "Demande envoyée", tone: "border-line text-mist" },
  a_verser: { label: "Inscrit · bonus gagné", tone: "border-gold/60 text-gold" },
  verse: { label: "Bonus versé", tone: "border-football/60 text-football" },
};

/** Lien personnel à partager, gains et suivi des amis invités. */
export function ReferralPanel({ referral, link }: { referral: MyReferral; link: string }) {
  const [copied, setCopied] = useState(false);
  const message = `Je te recommande Defenders Fitness Academy pour te former comme coach. Inscris-toi avec mon lien : ${link}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copiez votre lien :", link);
    }
  }

  async function share() {
    if (navigator.share) {
      await navigator.share({ title: "Defenders Fitness Academy", text: message, url: link }).catch(() => undefined);
    } else {
      void copy();
    }
  }

  const { stats } = referral;
  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
      <div className="border border-gold/40 bg-gradient-to-br from-gold/10 to-transparent p-6 sm:p-8">
        <p className="eyebrow">Parrainage</p>
        <h3 className="mt-2 font-display text-3xl tracking-wide uppercase">
          {formatTnd(referral.rewardTnd)} offerts par ami inscrit
        </h3>
        <p className="mt-3 max-w-lg text-sm leading-relaxed text-mist">
          Partagez votre lien. Quand un ami s&apos;inscrit à une formation grâce à lui, vous recevez {formatTnd(referral.rewardTnd)} de bonus.
        </p>

        <label htmlFor="referral-link" className="mt-6 block text-xs tracking-[0.14em] text-mist uppercase">Votre lien personnel</label>
        <div className="mt-2 flex gap-2">
          <input id="referral-link" readOnly value={link} onFocus={(e) => e.currentTarget.select()} className="min-w-0 flex-1 border border-line bg-ink px-3 py-2.5 font-mono text-sm text-bone" />
          <button type="button" onClick={copy} className="btn btn-primary shrink-0 px-4">
            {copied ? <><Icon name="check" width={16} height={16} /> Copié</> : "Copier"}
          </button>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <a href={`https://wa.me/?text=${encodeURIComponent(message)}`} target="_blank" rel="noreferrer" className="border border-[#1fa855]/60 px-4 py-2 text-xs tracking-wider text-[#4ade80] uppercase hover:bg-[#1fa855]/10">
            Partager sur WhatsApp
          </a>
          <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer" className="border border-line px-4 py-2 text-xs tracking-wider text-mist uppercase hover:border-gold hover:text-gold">
            Facebook
          </a>
          <button type="button" onClick={share} className="border border-line px-4 py-2 text-xs tracking-wider text-mist uppercase hover:border-gold hover:text-gold sm:hidden">
            Autres applis
          </button>
        </div>
        <p className="mt-4 text-xs text-mist/80">Code : <span className="font-mono text-bone">{referral.code}</span></p>
      </div>

      <div className="border border-line bg-ink-2 p-6 sm:p-8">
        <dl className="grid grid-cols-3 gap-3 text-center">
          {[
            [String(stats.invited), "Amis invités"],
            [String(stats.enrolled), "Inscrits"],
            [formatTnd(stats.earnedTnd), "Bonus gagnés"],
          ].map(([value, label]) => (
            <div key={label} className="border border-line bg-ink px-2 py-4">
              <dt className="text-[0.65rem] tracking-[0.12em] text-mist uppercase">{label}</dt>
              <dd className="mt-1 font-display text-2xl text-gold">{value}</dd>
            </div>
          ))}
        </dl>
        {stats.pendingTnd > 0 && (
          <p className="mt-4 border border-gold/40 bg-gold/10 px-4 py-3 text-sm text-bone">
            {formatTnd(stats.pendingTnd)} de bonus à recevoir : l&apos;équipe vous contacte pour le versement.
          </p>
        )}
        <h4 className="mt-6 text-xs tracking-[0.14em] text-mist uppercase">Vos amis</h4>
        {referral.referrals.length === 0 ? (
          <p className="mt-3 text-sm text-mist">Aucun ami invité pour l&apos;instant. Partagez votre lien pour commencer !</p>
        ) : (
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {referral.referrals.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-3 py-3">
                <span>
                  <span className="block text-sm text-bone">{r.name}</span>
                  <span className="text-xs text-mist">{dateFmt.format(new Date(r.createdAt))}</span>
                </span>
                <span className={`shrink-0 border px-2.5 py-1 text-[0.65rem] tracking-[0.12em] uppercase ${REWARD[r.reward].tone}`}>{REWARD[r.reward].label}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
