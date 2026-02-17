import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface ImageBody {
  prompt?: string;
}

interface Env {
  AI?: any;
  CLOUDFLARE_ACCOUNT_ID?: string;
  CLOUDFLARE_API_TOKEN?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImageBody;
    const prompt = body.prompt || 'A beautiful fantasy landscape';

    // @ts-ignore - req.context is added by Cloudflare Pages / OpenNext
    const env = (req.context?.env || process.env) as Env;

    // Priority 1: Cloudflare AI Binding
    if (env && env.AI) {
      console.log('Generating image with Cloudflare AI (SDXL Lightning) via binding...');
      const image = await env.AI.run(
        '@cf/bytedance/stable-diffusion-xl-lightning',
        {
          prompt: prompt,
          width: 512,
          height: 512,
          num_steps: 4,
        }
      );

      return new Response(image, {
        headers: { 'Content-Type': 'image/png' },
      });
    }

    // Priority 2: Cloudflare AI via REST API (for local development without wrangler)
    const accountId = env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = env.CLOUDFLARE_API_TOKEN;

    if (accountId && apiToken) {
      console.log('Generating image with Cloudflare AI via REST API...');
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/ai/run/@cf/bytedance/stable-diffusion-xl-lightning`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${apiToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: prompt,
            width: 512,
            height: 512,
            num_steps: 4,
          }),
        }
      );

      if (response.ok) {
        const imageBuffer = await response.arrayBuffer();
        return new Response(imageBuffer, {
          headers: { 'Content-Type': 'image/png' },
        });
      } else {
        const errorText = await response.text();
        console.error('Cloudflare AI Image API error:', errorText);
      }
    }

    // Fallback: Placeholder
    console.log('AI binding/token not found for image, using placeholder...');
    const placeholderUrl = `https://placehold.co/512x512/000000/FFFFFF/png?text=${encodeURIComponent(prompt.substring(0, 30))}`;
    const placeholderResponse = await fetch(placeholderUrl);
    const blob = await placeholderResponse.blob();

    return new Response(blob, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error: any) {
    console.error('Image API error:', error);
    return new Response(
      JSON.stringify({ error: 'Image generation failed', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
