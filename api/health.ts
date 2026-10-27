export default function handler(_req: any, res: any) {
  res.status(200).json({
    status: 'ok',
    service: 'Shal Agency Supabase OS',
    platform: 'Vercel Serverless',
    timestamp: new Date().toISOString(),
  });
}
