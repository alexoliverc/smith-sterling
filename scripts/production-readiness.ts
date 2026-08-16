import {
  getProductionReadinessReport,
} from '../src/config/production-readiness-report';

const report =
  getProductionReadinessReport();

if (report.ready) {
  console.log(
    'Production readiness: READY',
  );
}
else {
  console.error(
    'Production readiness: BLOCKED',
  );

  for (const blocker of report.blockers) {
    console.error(
      `[${blocker.domain}] ${blocker.code} — ${blocker.label}`,
    );
  }

  console.error(
    `Total de blockers: ${report.blockers.length}`,
  );

  process.exitCode =
    1;
}
