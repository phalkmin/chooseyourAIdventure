import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface ImageBody {
  prompt?: string;
  seed?: number;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ImageBody;
    const prompt = body.prompt || 'A beautiful fantasy landscape';
    const seed = body.seed || Math.floor(Math.random() * 1000000);

    // Negative prompt to steer away from diffuse/blurry/realistic looks
    const negative_prompt = "photorealistic, blurry, soft, gradient, 3d render, digital painting, smooth, out of frame, watermark, signature";

    // Priority 1: Cloudflare AI Binding (only works on Cloudflare)
    try {
      const { getCloudflareContext } = await import('@opennextjs/cloudflare');
      const { env } = getCloudflareContext();
      if (env?.AI) {
        console.log('Generating image with Cloudflare AI (SDXL Lightning) via binding...');
        const image = await env.AI.run(
          '@cf/bytedance/stable-diffusion-xl-lightning',
          {
            prompt: prompt,
            negative_prompt: negative_prompt,
            width: 1024,
            height: 576, // 16:9 ratio
            num_steps: 8, // Increased for better definition
            seed: seed,
          }
        );

        return new Response(image, {
          headers: { 'Content-Type': 'image/png' },
        });
      }
    } catch {
      // Not running on Cloudflare, fall through to REST API
    }

    // Priority 2: Cloudflare AI via REST API (works on any platform)
    const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
    const apiToken = process.env.CLOUDFLARE_API_TOKEN;

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
            negative_prompt: negative_prompt,
            width: 1024,
            height: 576,
            num_steps: 8,
            seed: seed,
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
