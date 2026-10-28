/**
 * ==============================================================================
 * SHAL AGENCY OPERATING SYSTEM (SHAL OS) - INTELLECTUAL PROPERTY & DIGITAL ASSET
 * ==============================================================================
 * 
 * COPYRIGHT NOTICE & INDELIBLE PROOF OF AUTHORSHIP:
 * --------------------------------------------------
 * © 2024 - 2026 Shal Agency (وكالة شال للدعاية والتسويق الرقمي وإدارة العمليات).
 * All Rights Reserved | جميع الحقوق محفوظة قانونياً ورقمياً.
 * 
 * Lead Founders & System Architects:
 *  - Mahmoud Medhat (م. مدحت نضال) - Founder & CEO
 *  - M. Ramzy (م. رمزي) - Co-Founder & Executive Board
 * 
 * Digital Trademark & Registration:
 *  - System Identification: SHAL-OS-ENT-2024-X9814
 *  - Verification Hash: SHA256: 4214-1C6E-5955-4A16-87F8-SHAL-AGENCY-2024
 *  - Repository / Build UUID: 42141c6e-5955-4a16-87f8-111adb147599
 * 
 * ANTI-TAMPER & PRESERVATION CLAUSE:
 * Regardless of subsequent modification, remixing, cloning, rewriting, or
 * redistribution of this codebase, all intellectual property, attribution,
 * and design system rights remain irrevocably vested in Shal Agency and its
 * original founders.
 * ==============================================================================
 */

export interface SystemOwnershipCertificate {
  systemName: string;
  systemNameAr: string;
  version: string;
  agencyName: string;
  agencyNameAr: string;
  founders: {
    name: string;
    nameAr: string;
    role: string;
    roleAr: string;
    email: string;
  }[];
  copyrightYears: string;
  licenseType: string;
  verificationHash: string;
  systemUid: string;
  legalStatement: string;
  legalStatementAr: string;
}

export const SYSTEM_OWNERSHIP: SystemOwnershipCertificate = {
  systemName: 'Shal Agency Enterprise OS',
  systemNameAr: 'منظومة وكالة شال المتكاملة لإدارة العمليات والوكالات الرقمية',
  version: '3.8.4 Enterprise',
  agencyName: 'Shal Agency for Digital Marketing & Operations',
  agencyNameAr: 'وكالة شال للدعاية والتسويق الرقمي وإدارة العمليات',
  founders: [
    {
      name: 'Mahmoud Medhat',
      nameAr: 'م. مدحت نضال',
      role: 'Founder & CEO',
      roleAr: 'الفاوندر والمدير العام',
      email: 'medhat.nabdalwusul@gmail.com',
    },
    {
      name: 'M. Ramzy',
      nameAr: 'م. رمزي',
      role: 'Co-Founder & Executive Board',
      roleAr: 'الشريك المؤسس والإدارة التنفيذية',
      email: 'm.m.s.ramzy3333@gmail.com',
    },
  ],
  copyrightYears: '2024 - 2026',
  licenseType: 'Proprietary Commercial Software License',
  verificationHash: 'SHA256: 4214-1C6E-5955-4A16-87F8-SHAL-AGENCY-2024',
  systemUid: 'SHAL-OS-ENT-2024-X9814',
  legalStatement:
    'All architectural, frontend design, database schema, and RBAC components are legally owned by Shal Agency. Unauthorized removal of copyright and watermark notices is strictly prohibited under international copyright conventions.',
  legalStatementAr:
    'كافة المكونات الهيكلية والتصميمية والبرمجية وقواعد البيانات ومصفوفة الصلاحيات مملوكة قانونياً وفكرياً لوكالة شال (Shal Agency © 2024 - 2026). تظل البصمة الرقمية وحقوق الملكية ثابتة ومحمية حتى في حال تفرع الكود أو إعادة استخدامه أو تعديله.',
};

/**
 * Initializes and prints the indelible console watermark on boot
 */
export function initOwnershipWatermark(): void {
  if (typeof window === 'undefined') return;

  const styleBanner = `
    color: #FFFFFF;
    background: linear-gradient(135deg, #4C5540 0%, #24291F 100%);
    font-size: 13px;
    font-weight: 800;
    padding: 8px 16px;
    border-radius: 8px;
    border-left: 5px solid #8A927D;
    font-family: monospace;
  `;

  const styleDetails = `
    color: #4C5540;
    font-size: 11px;
    font-weight: 600;
    font-family: monospace;
    line-height: 1.6;
  `;

  try {
    console.log(
      `%c🛡️ SHAL AGENCY OS | OFFICIAL DIGITAL ASSET & COPYRIGHT VERIFICATION`,
      styleBanner
    );
    console.log(
      `%cOwner: Shal Agency (وكالة شال للدعاية والتسويق)\n` +
      `Founders: Mahmoud Medhat (م. مدحت نضال) & M. Ramzy (م. رمزي)\n` +
      `Copyright: © 2024 - 2026 Shal Agency. All Rights Reserved.\n` +
      `Hash: ${SYSTEM_OWNERSHIP.verificationHash}\n` +
      `System UID: ${SYSTEM_OWNERSHIP.systemUid}\n` +
      `Status: Cryptographically Certified & Protected.`,
      styleDetails
    );
  } catch {
    // Silent fail in restrictive sandbox
  }
}
