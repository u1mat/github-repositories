import { z, ZodError } from 'zod';

const booleanSchema = z
  .enum(['true', 'false', '1', '0'])
  .transform((val) => val === 'true' || val === '1');

const envVariablesSchema = z.object({
  VITE_API_BASE_URL: z.url(),
  VITE_API_TIMEOUT_MS: z.coerce.number().default(300).optional(),
  VITE_ENABLED_ANALYTICS: booleanSchema.optional(),
});

let env: z.infer<typeof envVariablesSchema>;

try {
  env = envVariablesSchema.parse(import.meta.env);
} catch (error) {
  console.error('Env vars is invalid, check schema in the "src/shared/libs/env.ts"');

  if (error instanceof ZodError) {
    error.issues.forEach((issue) => {
      console.error(`Env validation error: [${issue.path.join('.')}] ${issue.message}`);
    });
  }

  throw error;
}

export { env };
