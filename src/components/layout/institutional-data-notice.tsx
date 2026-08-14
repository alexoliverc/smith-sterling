import {
  hasProductionInstitutionalData,
} from '@/config/institution';

export function InstitutionalDataNotice() {
  if (
    hasProductionInstitutionalData()
  ) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
      <p className="font-semibold text-amber-900">
        Informações institucionais em configuração
      </p>

      <p className="mt-2 text-sm leading-6 text-amber-800">
        Alguns dados cadastrais, de atendimento e regulatórios ainda são provisórios no ambiente de desenvolvimento e serão substituídos antes da publicação em produção.
      </p>
    </div>
  );
}
