import {
  Injectable,
  InternalServerErrorException,
  ServiceUnavailableException,
} from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private readonly openai: OpenAI;

  constructor() {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'OPENAI_API_KEY is not configured',
      );
    }
    this.openai = new OpenAI({ apiKey });
  }

  async generateProductDescription(
    name: string,
    category: string,
  ): Promise<{ description: string }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
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
    });

    const description = completion.choices[0]?.message?.content?.trim();
    if (!description) {
      throw new InternalServerErrorException(
        'Failed to generate product description',
      );
    }

    return { description };
  }

  async chat(message: string): Promise<{ response: string }> {
    const completion = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content:
            'You are a helpful e-commerce store assistant. Answer briefly and clearly.',
        },
        { role: 'user', content: message },
      ],
    });

    const response = completion.choices[0]?.message?.content?.trim();
    if (!response) {
      throw new InternalServerErrorException('Failed to generate chat response');
    }

    return { response };
  }
}
