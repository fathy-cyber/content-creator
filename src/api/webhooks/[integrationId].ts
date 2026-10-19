import { NextRequest, NextResponse } from 'next/server';
import { webhookManager } from '../../../core/integrations/webhook-manager';

/**
 * Next.js Route Handler for incoming webhooks.
 * Path: /api/webhooks/[integrationId]
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { integrationId: string } }
) {
  try {
    const { integrationId } = params;
    
    if (!integrationId) {
      return NextResponse.json(
        { error: 'Missing integrationId in path' }, 
        { status: 400 }
      );
    }

    const payload = await request.json();
    
    // Process the webhook using the WebhookManager
    const result = await webhookManager.handleWebhook(integrationId, payload);

    if (!result.success) {
      return NextResponse.json(
        { error: result.message }, 
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: result.message }, 
      { status: 200 }
    );

  } catch (error: any) {
    console.error('[WebhookRoute] Critical error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error.message }, 
      { status: 500 }
    );
  }
}
