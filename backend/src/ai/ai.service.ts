import {
  Injectable,
  InternalServerErrorException,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';
import type { ChatCompletionMessageParam } from 'openai/resources/chat/completions';

const MAX_ATTEMPTS = 3;
const BASE_BACKOFF_MS = 1500;

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly openai: OpenAI;

  private readonly model = process.env.GEMINI_MODEL ?? 'gemini-2.0-flash';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'GEMINI_API_KEY is not configured',
      );
    }
    this.openai = new OpenAI({
      apiKey,
      baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
      timeout: 30_000,
      maxRetries: 0,
    });
  }

  async generateProductDescription(
    name: string,
    category: string,
  ): Promise<{ description: string }> {
    const description = await this.complete(
      [
        {
          role: 'system',
          content:
            'You write concise, engaging e-commerce product descriptions. Return only the description text, no headings or labels.',
        },
        {
          role: 'user',
          content: `Write a product description for "${name}" in the "${category}" category.`,
        },
      ],
      'product description',
    );

    return { description };
  }

  async chat(message: string): Promise<{ response: string }> {
    const response = await this.complete(
      [
        {
          role: 'system',
          content:
            'You are a helpful e-commerce store assistant. Answer briefly and clearly.',
        },
        { role: 'user', content: message },
      ],
      'chat response',
    );

    return { response };
  }

  /** Calls the model with retry/backoff on rate-limit (429) and transient (503) errors. */
  private async complete(
    messages: ChatCompletionMessageParam[],
    label: string,
  ): Promise<string> {
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      try {
        const completion = await this.openai.chat.completions.create({
          model: this.model,
          messages,
        });

        const content = completion.choices[0]?.message?.content?.trim();
        if (!content) {
          throw new InternalServerErrorException(
            `Failed to generate ${label}`,
          );
        }
        return content;
      } catch (error) {
        const status =
          error instanceof OpenAI.APIError ? error.status : undefined;

        if ((status === 429 || status === 503) && attempt < MAX_ATTEMPTS) {
          const delay = BASE_BACKOFF_MS * attempt;
          this.logger.warn(
            `AI ${label} hit ${status}; retrying in ${delay}ms (attempt ${attempt}/${MAX_ATTEMPTS})`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        if (status === 429) {
          throw new ServiceUnavailableException(
            'The AI service is rate-limited right now (free-tier quota). Please wait a moment and try again.',
          );
        }

        if (error instanceof OpenAI.APIError) {
          this.logger.error(
            `AI ${label} failed: ${status ?? 'unknown'} ${error.message}`,
          );
          throw new ServiceUnavailableException(
            'The AI service is temporarily unavailable. Please try again later.',
          );
        }

        throw error;
      }
    }

    throw new ServiceUnavailableException(
      'The AI service is rate-limited right now. Please try again later.',
    );
  }
}
