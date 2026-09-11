export type MemberType = "Aparat" | "Profburo" | "Viddil";

export const APARAT_TYPE  = 0;
export const PROFBURO_HEAD_TYPE = 1;
export const VIDDIL_HEAD_TYPE  = 2;

export const MEMBER_TYPE_OPTIONS = [
  { id: APARAT_TYPE, label: "Член Президії", filterLabel: "Члени Президії" },
  { id: PROFBURO_HEAD_TYPE, label: "Голова Профбюро Студентів", filterLabel: "Голови Профбюро Студентів" },
  { id: VIDDIL_HEAD_TYPE, label: "Голова Відділу", filterLabel: "Голови Відділів" },
] as const;

export const MEMBER_TYPE_LABELS: Record<number, string> = Object.fromEntries(
  MEMBER_TYPE_OPTIONS.map(({ id, label }) => [id, label]),
);

export function getMemberTypeLabel(type: number): string {
  return MEMBER_TYPE_LABELS[type] ?? String(type);
}

export interface TeamFormData {
  name: string;
  position: string;
  type: number;
  orderInd: number;
  isTemporary: boolean;
  email?: string;
  imageUrl?: string;
}

export interface TeamMember {
  id: number;
  name: string;
  position: string;
  type: number;
  typeName?: string;
  orderInd: number;
  isTemporary: boolean;
  createdAt: string;
  email?: string;
  imageUrl?: string;
  isChoosed: boolean;
}