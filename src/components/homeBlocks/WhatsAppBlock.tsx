import React from 'react';
import WidgetWhatsApp from '../WidgetWhatsApp';

export default function WhatsAppBlock({ block }: { block: any }) {
  // Can override properties based on block.settings if needed
  return (
    <div className="mb-8">
      <WidgetWhatsApp />
    </div>
  );
}
