import { useState } from "react";
import {
  Rss, Mail, Facebook, Instagram, Linkedin, Newspaper,
  Image as Pin, Send, Music2, MessageCircle, Youtube,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { FormShell, SaveButton, inputCls, useSaved } from "./shared";

const CANAIS = [
  { id: "blog", nome: "Blog", Icon: Rss },
  { id: "email", nome: "E-mail Marketing", Icon: Mail },
  { id: "facebook", nome: "Facebook", Icon: Facebook },
  { id: "instagram", nome: "Instagram", Icon: Instagram },
  { id: "linkedin", nome: "LinkedIn", Icon: Linkedin },
  { id: "newsletter", nome: "Newsletter", Icon: Newspaper },
  { id: "pinterest", nome: "Pinterest", Icon: Pin },
  { id: "telegram", nome: "Telegram", Icon: Send },
  { id: "tiktok", nome: "TikTok", Icon: Music2 },
  { id: "whatsapp", nome: "WhatsApp", Icon: MessageCircle },
  { id: "youtube", nome: "YouTube", Icon: Youtube },
];

interface Estado {
  ativo: boolean;
  obs: string;
}

export const CanaisForm = () => {
  const { saved, onSubmit } = useSaved();
  const [state, setState] = useState<Record<string, Estado>>(
    Object.fromEntries(CANAIS.map((c) => [c.id, { ativo: false, obs: "" }]))
  );

  const upd = (id: string, patch: Partial<Estado>) =>
    setState({ ...state, [id]: { ...state[id], ...patch } });

  return (
    <FormShell onSubmit={onSubmit}>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {CANAIS.map(({ id, nome, Icon }) => {
          const s = state[id];
          return (
            <div
              key={id}
              className={`rounded-lg border bg-[#1c1c1e] p-3 transition-all ${
                s.ativo ? "border-[#7c3aed]/60" : "border-[#2a2a2a]"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="h-8 w-8 rounded-md bg-[#0f0f0f] border border-[#2a2a2a] flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-[#a78bfa]" />
                  </div>
                  <span className="text-sm text-white truncate">{nome}</span>
                </div>
                <Switch
                  checked={s.ativo}
                  onCheckedChange={(v) => upd(id, { ativo: v })}
                />
              </div>
              <div
                className={`grid transition-all duration-200 ${
                  s.ativo ? "grid-rows-[1fr] mt-3 opacity-100" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden">
                  <Textarea
                    value={s.obs}
                    onChange={(e) => upd(id, { obs: e.target.value })}
                    placeholder="Observações sobre o canal..."
                    className={`${inputCls} min-h-[70px] text-xs`}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <SaveButton saved={saved} />
    </FormShell>
  );
};
