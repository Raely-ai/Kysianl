import React from 'react';
import SliderPlusTwo from './SliderPlusTwo';
import FourNewsGrid from './FourNewsGrid';
import CategoryNewsGrid from './CategoryNewsGrid';
import AdBannerBlock from './AdBannerBlock';
import PopularNewsBlock from './PopularNewsBlock';
import WhatsAppBlock from './WhatsAppBlock';
import SocialBlock from './SocialBlock';

export default function BlockRenderer({ block, newsList }: { block: any; newsList: any[] }) {
  switch (block.type) {
    case 'slider_plus_two':
      return <SliderPlusTwo block={block} newsList={newsList} />;
    case 'four_news_grid':
      return <FourNewsGrid block={block} newsList={newsList} />;
    case 'category_news_grid':
      return <CategoryNewsGrid block={block} newsList={newsList} />;
    case 'ad_banner':
      return <AdBannerBlock block={block} />;
    case 'popular_news':
      return <PopularNewsBlock block={block} newsList={newsList} />;
    case 'whatsapp_box':
      return <WhatsAppBlock block={block} />;
    case 'social_box':
      return <SocialBlock block={block} />;
    default:
      return null;
  }
}

