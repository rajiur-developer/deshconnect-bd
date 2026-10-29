"use client";
import Link from "next/link";
import { Icon } from "@/components/ui/icons";
import { BloodChatLauncher } from "./blood-chat-popup";

function internationalNumber(value?: string | null) {
  const digits = String(value ?? "").replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  if (digits.startsWith("00")) return digits.slice(2);
  if (digits.startsWith("0")) return `880${digits.slice(1)}`;
  return digits;
}

function ContactActions({
  phone,
  whatsapp,
  viewerId,
  chat,
}: {
  phone?: string | null;
  whatsapp?: string | null;
  viewerId?: string;
  chat: { targetType: "donor" | "request"; targetId: string; recipientName: string };
}) {
  const callNumber = internationalNumber(phone);
  const whatsappNumber = internationalNumber(whatsapp || phone);
  if (chat.targetType === "donor" && !viewerId) {
    return (
      <div className="flex flex-wrap gap-2">
        <Link
          href="/login?next=%2Fblood-donation"
          className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-800 hover:bg-rose-100"
        >
          <Icon name="phone" className="h-3.5 w-3.5" /> Log in to view contact
        </Link>
      </div>
    );
  }
  return (
    <div className="flex flex-wrap gap-2">
      {whatsappNumber && (
        <a
          href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent("Assalamu Alaikum, I am contacting you regarding blood donation.")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700"
        >
          <Icon name="message" className="h-3.5 w-3.5" /> WhatsApp
        </a>
      )}
      {callNumber && (
        <a
          href={`tel:+${callNumber}`}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
        >
          <Icon name="phone" className="h-3.5 w-3.5" /> Call
        </a>
      )}
      {viewerId && <BloodChatLauncher {...chat} viewerId={viewerId} />}
      {!viewerId && (
        <Link
          href="/login?next=%2Fblood-donation"
          className="inline-flex items-center gap-1.5 rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-xs font-medium text-brand-800 hover:bg-brand-50"
        >
          <Icon name="message" className="h-3.5 w-3.5" /> Log in to chat
        </Link>
      )}
      {!callNumber && !whatsappNumber && <span className="text-xs text-slate-500">Contact number not provided.</span>}
    </div>
  );
}

export function DonorContactButtons({ donorId, phone, whatsapp, viewerId }: { donorId: string; phone?: string | null; whatsapp?: string | null; viewerId?: string }) {
  return <ContactActions phone={phone} whatsapp={whatsapp} viewerId={viewerId} chat={{ targetType: "donor", targetId: donorId, recipientName: "blood donor" }} />;
}

export function RequesterContactButtons({ requestId, phone, whatsapp, viewerId }: { requestId: string; phone?: string | null; whatsapp?: string | null; viewerId?: string }) {
  return <ContactActions phone={phone} whatsapp={whatsapp} viewerId={viewerId} chat={{ targetType: "request", targetId: requestId, recipientName: "blood request owner" }} />;
}
