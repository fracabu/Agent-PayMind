import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

export type AIProvider = 'anthropic' | 'openai' | 'openrouter' | 'gemini';

export interface AIProviderConfig {
  provider: AIProvider;
  model?: string;
  apiKey?: string;
}

export interface AIMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  content: string;
  model: string;
  provider: AIProvider;
  tokensUsed?: number;
}

// Default models for each provider
const DEFAULT_MODELS: Record<AIProvider, string> = {
  anthropic: 'claude-sonnet-4-5-20250929',
  openai: 'gpt-5.2',
  openrouter: 'google/gemini-2.0-flash-exp:free', // FREE by default!
  gemini: 'gemini-2.5-flash',
};

// Provider implementations
async function callAnthropic(
  systemPrompt: string,
  userMessage: string,
  model: string,
  apiKey?: string
): Promise<AIResponse> {
  const client = new Anthropic({
    apiKey: apiKey || process.env.ANTHROPIC_API_KEY,
  });

  const message = await client.messages.create({
    model,
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const content = message.content[0];
  return {
    content: content.type === 'text' ? content.text : '',
    model,
    provider: 'anthropic',
    tokensUsed: message.usage.input_tokens + message.usage.output_tokens,
  };
}

async function callOpenAI(
  systemPrompt: string,
  userMessage: string,
  model: string,
  apiKey?: string,
  baseURL?: string
): Promise<AIResponse> {
  const client = new OpenAI({
    apiKey: apiKey || process.env.OPENAI_API_KEY,
    baseURL,
  });

  const completion = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    max_tokens: 4096,
  });

  return {
    content: completion.choices[0]?.message?.content || '',
    model,
    provider: baseURL ? 'openrouter' : 'openai',
    tokensUsed: completion.usage?.total_tokens,
  };
}

async function callOpenRouter(
  systemPrompt: string,
  userMessage: string,
  model: string,
  apiKey?: string
): Promise<AIResponse> {
  return callOpenAI(
    systemPrompt,
    userMessage,
    model,
    apiKey || process.env.OPENROUTER_API_KEY,
    'https://openrouter.ai/api/v1'
  );
}

async function callGemini(
  systemPrompt: string,
  userMessage: string,
  model: string,
  apiKey?: string
): Promise<AIResponse> {
  const key = apiKey || process.env.GEMINI_API_KEY || '';

  if (!key) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const genAI = new GoogleGenerativeAI(key);
  const geminiModel = genAI.getGenerativeModel({
    model,
    systemInstruction: systemPrompt,
  });

  const result = await geminiModel.generateContent(userMessage);
  const response = result.response;

  return {
    content: response.text(),
    model,
    provider: 'gemini',
  };
}

// Main function to call any provider
export async function callAI(
  config: AIProviderConfig,
  systemPrompt: string,
  userMessage: string
): Promise<AIResponse> {
  const model = config.model || DEFAULT_MODELS[config.provider];

  switch (config.provider) {
    case 'anthropic':
      return callAnthropic(systemPrompt, userMessage, model, config.apiKey);
    case 'openai':
      return callOpenAI(systemPrompt, userMessage, model, config.apiKey);
    case 'openrouter':
      return callOpenRouter(systemPrompt, userMessage, model, config.apiKey);
    case 'gemini':
      return callGemini(systemPrompt, userMessage, model, config.apiKey);
    default:
      throw new Error(`Unknown provider: ${config.provider}`);
  }
}

// Available models for each provider
export const AVAILABLE_MODELS: Record<AIProvider, { id: string; name: string }[]> = {
  anthropic: [
    { id: 'claude-opus-4-5-20251124', name: 'Claude Opus 4.5' },
    { id: 'claude-sonnet-4-5-20250929', name: 'Claude Sonnet 4.5' },
    { id: 'claude-opus-4-1-20250805', name: 'Claude Opus 4.1' },
    { id: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4' },
  ],
  openai: [
    { id: 'gpt-5.2', name: 'GPT-5.2' },
    { id: 'gpt-5.1', name: 'GPT-5.1' },
    { id: 'gpt-5', name: 'GPT-5' },
    { id: 'gpt-4.1', name: 'GPT-4.1' },
    { id: 'o4-mini', name: 'o4-mini (Fast Reasoning)' },
  ],
  openrouter: [
    // FREE Models
    { id: 'google/gemini-2.0-flash-exp:free', name: '🆓 Gemini 2.0 Flash (FREE)' },
    { id: 'deepseek/deepseek-r1-0528:free', name: '🆓 DeepSeek R1 Reasoning (FREE)' },
    { id: 'meta-llama/llama-3.3-70b-instruct:free', name: '🆓 Llama 3.3 70B (FREE)' },
    { id: 'mistralai/devstral-2512:free', name: '🆓 Devstral Coding (FREE)' },
    { id: 'mistralai/mistral-small-3.1-24b-instruct:free', name: '🆓 Mistral Small 3.1 (FREE)' },
    // Google Gemini
    { id: 'google/gemini-2.5-pro', name: 'Gemini 2.5 Pro ($1.25/$10)' },
    { id: 'google/gemini-2.5-flash', name: 'Gemini 2.5 Flash ($0.30/$2.50)' },
    // Anthropic Claude
    { id: 'anthropic/claude-sonnet-4', name: 'Claude Sonnet 4 ($3/$15)' },
    { id: 'anthropic/claude-3.5-haiku', name: 'Claude 3.5 Haiku ($0.80/$4)' },
    { id: 'anthropic/claude-opus-4', name: 'Claude Opus 4 ($15/$75)' },
    // OpenAI
    { id: 'openai/gpt-4o', name: 'GPT-4o ($2.50/$10)' },
    { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini ($0.15/$0.60)' },
    { id: 'openai/o3-mini', name: 'o3-mini Reasoning ($1.10/$4.40)' },
    // DeepSeek
    { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2 ($0.26/$0.38)' },
    { id: 'deepseek/deepseek-r1', name: 'DeepSeek R1 ($0.30/$1.20)' },
    // Mistral
    { id: 'mistralai/mistral-large-2512', name: 'Mistral Large ($0.50/$1.50)' },
    // Meta Llama
    { id: 'meta-llama/llama-4-maverick', name: 'Llama 4 Maverick 1M ($0.15/$0.60)' },
    { id: 'meta-llama/llama-4-scout', name: 'Llama 4 Scout ($0.08/$0.30)' },
  ],
  gemini: [
    { id: 'gemini-2.5-flash', name: 'Gemini 2.5 Flash (Recommended)' },
    { id: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro' },
    { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash' },
    { id: 'gemini-2.0-flash-lite', name: 'Gemini 2.0 Flash-Lite' },
    { id: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview' },
    { id: 'gemini-3-pro-preview', name: 'Gemini 3 Pro Preview' },
  ],
};

export const PROVIDER_INFO: Record<AIProvider, { name: string; icon: string }> = {
  anthropic: { name: 'Anthropic', icon: '🟠' },
  openai: { name: 'OpenAI', icon: '🟢' },
  openrouter: { name: 'OpenRouter', icon: '🔵' },
  gemini: { name: 'Google', icon: '🔴' },
};
