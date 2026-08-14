import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { getApplicationStatusPresentation } from '@/lib/application-status';

import { formatCurrency } from '@/lib/credit';
import { findApplicationForSession } from '@/server/dal/credit-application';

type AnalysisPageProps = {
  params: Promise<{
    protocol: string;
  }>;
};

export default async function AnalysisPage({ params }: AnalysisPageProps) {
  const { protocol } = await params;

  const cookieStore = await cookies();

  const accessToken = cookieStore.get('smith_application_session')?.value;

  if (!accessToken) {
    notFound();
  }

  const application = await findApplicationForSession(protocol, accessToken);
  const presentation = getApplicationStatusPresentation(application.status);

  if (!application) {
    notFound();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-16">
      <section className="w-full max-w-2xl rounded-[32px] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/40 md:p-12">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-2xl">
          ✓
        </div>

        <p className="mt-8 text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
          {presentation.eyebrow}
        </p>

        <h1 className="mt-4 text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33]">
          {presentation.title}
        </h1>

        <p className="mt-5 text-lg leading-8 text-slate-600">
          Recebemos seus dados e sua solicitação foi registrada para processamento.
        </p>

        <div className="mt-10 grid gap-4 rounded-2xl bg-slate-50 p-6">
          <Detail label="Protocolo" value={application.publicProtocol ?? protocol} />

          <Detail label="Valor solicitado" value={formatCurrency(application.amount)} />

          <Detail label="Prazo" value={`${application.months} meses`} />

          <Detail label="Status" value={presentation.label} />
        </div>

        <p className="mt-8 text-sm leading-6 text-slate-500">
          A solicitação ainda está sujeita à análise e não representa aprovação definitiva de
          crédito.
        </p>
      </section>
    </main>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-200 pb-4 last:border-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>

      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}
