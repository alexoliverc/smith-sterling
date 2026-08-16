import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import {
  describe,
  expect,
  it,
} from 'vitest';

const pageSource = readFileSync(
  resolve(
    process.cwd(),
    'src/app/admin/solicitacoes/[protocol]/formalizacao/page.tsx',
  ),
  'utf8',
);

const panelSource = readFileSync(
  resolve(
    process.cwd(),
    'src/app/admin/solicitacoes/[protocol]/formalizacao/reveal-bank-data-panel.tsx',
  ),
  'utf8',
);

const actionsSource = readFileSync(
  resolve(
    process.cwd(),
    'src/app/admin/solicitacoes/[protocol]/formalizacao/actions.ts',
  ),
  'utf8',
);

describe('admin bank data exposure', () => {
  it('does not embed complete financial identifiers in the initial admin page markup', () => {
    expect(pageSource).not.toContain(
      'Agência completa',
    );

    expect(pageSource).not.toContain(
      'Conta completa',
    );

    expect(pageSource).not.toContain(
      'Titular completo',
    );

    expect(pageSource).not.toContain(
      'Chave Pix completa',
    );

    expect(pageSource).not.toMatch(
      /value=\{\s*formalization\.bankData\.branch\s*\}/,
    );

    expect(pageSource).not.toMatch(
      /value=\{\s*formalization\.bankData\.account\s*\}/,
    );

    expect(pageSource).not.toMatch(
      /value=\{\s*formalization\.bankData\.holderName\s*\}/,
    );

    expect(pageSource).not.toMatch(
      /value=\{\s*formalization\.bankData\.pixKey\s*\|\|/,
    );
  });

  it('keeps financial identifiers masked in the normal admin view', () => {
    expect(pageSource).toMatch(
      /maskFinancialValue\(\s*formalization\.bankData\.branch\s*\)/,
    );

    expect(pageSource).toMatch(
      /maskFinancialValue\(\s*formalization\.bankData\.account\s*\)/,
    );

    expect(pageSource).toMatch(
      /maskHolderName\(\s*formalization\.bankData\.holderName\s*\)/,
    );

    expect(pageSource).toMatch(
      /maskFinancialValue\(\s*formalization\.bankData\.pixKey\s*\)/,
    );
  });

  it('passes only protocol and permission state to the client reveal panel initially', () => {
    expect(pageSource).toContain(
      '<RevealBankDataPanel',
    );

    expect(pageSource).toContain(
      'protocol={protocolLabel}',
    );

    expect(pageSource).toContain(
      'allowed={bankDataRevealAllowed}',
    );

    expect(pageSource).not.toMatch(
      /<RevealBankDataPanel[\s\S]*bankData=/,
    );

    expect(panelSource).toContain(
      'useState<RevealedBankData | null>',
    );

    expect(panelSource).toContain(
      'await revealBankData(',
    );

    expect(panelSource).toContain(
      'setData(null)',
    );

    expect(panelSource).toContain(
      'Ocultar dados',
    );

    expect(panelSource).not.toContain(
      'bankData: {',
    );
  });

  it('revalidates authorization and operational status before revealing data', () => {
    const revealStart =
      actionsSource.indexOf(
        'export async function revealBankData',
      );

    const confirmStart =
      actionsSource.indexOf(
        'export async function confirmFormalizationReady',
      );

    expect(revealStart).toBeGreaterThan(
      -1,
    );

    expect(confirmStart).toBeGreaterThan(
      revealStart,
    );

    const revealSource =
      actionsSource.slice(
        revealStart,
        confirmStart,
      );

    const roleCheck =
      revealSource.indexOf(
        'session.user.role !==',
      );

    const dataFetch =
      revealSource.indexOf(
        'await getAdminFormalizationByProtocol',
      );

    expect(roleCheck).toBeGreaterThan(
      -1,
    );

    expect(dataFetch).toBeGreaterThan(
      roleCheck,
    );

    expect(revealSource).toContain(
      "'BANK_DETAILS_SUBMITTED'",
    );

    expect(revealSource).toContain(
      "'READY_FOR_DISBURSEMENT'",
    );

    expect(revealSource).toContain(
      'adminUserId:',
    );

    expect(revealSource).toContain(
      'formalizationId:',
    );

    expect(revealSource).not.toContain(
      'bankData:',
    );
  });
});