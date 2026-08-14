import type { ReactNode } from 'react';

import { Footer } from '@/components/layout/footer';
import { Header } from '@/components/layout/header';

type InstitutionalPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function InstitutionalPage({
  eyebrow,
  title,
  description,
  children,
}: InstitutionalPageProps) {
  return (
    <>
      <Header />

      <main className="min-h-[65vh] bg-slate-50">
        <section className="border-b border-slate-200 bg-white">
          <div className="mx-auto max-w-5xl px-6 py-16 lg:px-8 lg:py-20">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-blue-600">
              {eyebrow}
            </p>

            <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-[-0.04em] text-[#0b1f33] md:text-5xl">
              {title}
            </h1>

            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-500">
              {description}
            </p>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-6 py-12 lg:px-8 lg:py-16">
          <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-10">
            {children}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
