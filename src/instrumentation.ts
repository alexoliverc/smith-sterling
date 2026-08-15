export async function register() {
  if (
    process.env.NEXT_RUNTIME !==
    'nodejs'
  ) {
    return;
  }

  const {
    validateRuntimeEnvironment,
  } = await import(
    '@/config/runtime-env'
  );

  validateRuntimeEnvironment();
}
