/**
 * Type declaration for `Supabase.ai` — the built-in AI inference API provided
 * by the Supabase Edge Runtime. Not needed at runtime (the runtime injects the
 * global); this only lets `deno check` verify the functions locally.
 *
 * See https://supabase.com/docs/guides/functions/ai-models
 */
declare namespace Supabase {
  namespace ai {
    class Session {
      constructor(model: string)
      run(
        input: string,
        options?: { mean_pool?: boolean; normalize?: boolean },
      ): Promise<Float32Array>
    }
  }
}
