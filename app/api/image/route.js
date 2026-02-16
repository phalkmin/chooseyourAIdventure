export const runtime = 'edge';

export async function POST(req) {
  try {
    const body = await req.json();
    const prompt = body.prompt || 'A beautiful fantasy landscape';

    const env = req.context?.env || process.env;

    if (env && env.AI) {
      console.log('Generating image with Cloudflare AI (SDXL Lightning)...');
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

    // Local development fallback
    console.log('AI binding not found for image, using placeholder...');
    const placeholderUrl = `https://placehold.co/512x512/000000/FFFFFF/png?text=${encodeURIComponent(prompt.substring(0, 30))}`;
    const response = await fetch(placeholderUrl);
    const blob = await response.blob();

    return new Response(blob, {
      headers: { 'Content-Type': 'image/png' },
    });
  } catch (error) {
    console.error('Image API error:', error);
    return new Response(
      JSON.stringify({ error: 'Image generation failed' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
