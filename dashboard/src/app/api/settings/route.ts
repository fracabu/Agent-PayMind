import { NextRequest, NextResponse } from 'next/server';
import { AVAILABLE_MODELS, PROVIDER_INFO, AIProvider } from '@/lib/ai-providers';

// GET available providers and models
export async function GET() {
  // Check which providers have API keys configured
  const configuredProviders: Record<AIProvider, boolean> = {
    anthropic: !!process.env.ANTHROPIC_API_KEY,
    openai: !!process.env.OPENAI_API_KEY,
    openrouter: !!process.env.OPENROUTER_API_KEY,
    gemini: !!process.env.GEMINI_API_KEY,
  };

  return NextResponse.json({
    providers: Object.entries(PROVIDER_INFO).map(([id, info]) => ({
      id,
      ...info,
      configured: configuredProviders[id as AIProvider],
      models: AVAILABLE_MODELS[id as AIProvider],
    })),
    defaultProvider: 'anthropic',
  });
}

// POST - Validate API key for a provider
export async function POST(request: NextRequest) {
  try {
    const { provider, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key is required' }, { status: 400 });
    }

    // Simple validation - try to make a minimal API call
    let valid = false;
    let error = '';

    try {
      switch (provider) {
        case 'anthropic':
          const Anthropic = (await import('@anthropic-ai/sdk')).default;
          const anthropic = new Anthropic({ apiKey });
          await anthropic.messages.create({
            model: 'claude-3-haiku-20240307',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          });
          valid = true;
          break;

        case 'openai':
          const OpenAI = (await import('openai')).default;
          const openai = new OpenAI({ apiKey });
          await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          });
          valid = true;
          break;

        case 'openrouter':
          const OpenAIOR = (await import('openai')).default;
          const openrouter = new OpenAIOR({
            apiKey,
            baseURL: 'https://openrouter.ai/api/v1',
          });
          await openrouter.chat.completions.create({
            model: 'openai/gpt-4o-mini',
            max_tokens: 10,
            messages: [{ role: 'user', content: 'Hi' }],
          });
          valid = true;
          break;

        case 'gemini':
          const { GoogleGenerativeAI } = await import('@google/generative-ai');
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
          await model.generateContent('Hi');
          valid = true;
          break;

        default:
          error = 'Unknown provider';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Validation failed';
    }

    return NextResponse.json({ valid, error });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Validation failed' },
      { status: 500 }
    );
  }
}
