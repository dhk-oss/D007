import React from 'react';
import { Sparkles, ExternalLink } from 'lucide-react';
import { useTranslation } from '../context/LanguageContext';

interface AdBannerProps {
  className?: string;
  slotId?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ className = '', slotId }) => {
  const { locale } = useTranslation();
  const adsenseClientId = import.meta.env.VITE_ADSENSE_CLIENT_ID;

  // Localized texts for boutique sponsored fallback card
  const defaultCopy = {
    badge: 'Sponsored · Kids Boutique',
    title: 'Ages 3-11 Trending Kids Wear Collection',
    desc: 'Curated premium outfits and accessories harmonized for kids proportions & weather',
    cta: 'Explore Collection',
  };

  const copyMap: Record<string, typeof defaultCopy> = {
    ko: {
      badge: '스폰서드 · 키즈 부티크',
      title: '3-11세 트렌디 아동복 시즌 기획전',
      desc: '우리 아이 체형과 오늘 날씨에 딱 맞는 프리미엄 데일리룩 & 코디 아이템',
      cta: '기획전 둘러보기',
    },
    ja: {
      badge: 'スポンサー · キッズブティック',
      title: '3-11歳 キッズファッショントレンド特集',
      desc: 'お子様の体型と天気にぴったりのプレミアムデイリールック＆コーデ',
      cta: 'コレクションを見る',
    },
    zh: {
      badge: '赞助 · 精选童装',
      title: '3-11岁 儿童潮流日常穿搭特辑',
      desc: '完美契合孩子身形比例与今日天气的精选童装',
      cta: '查看精选特辑',
    },
    en: defaultCopy,
  };

  const copy = copyMap[locale] || defaultCopy;

  // If real AdSense client ID is configured, render real Google AdSense slot
  if (adsenseClientId && adsenseClientId !== 'your_adsense_client_id') {
    return (
      <div className={`w-full overflow-hidden rounded-2xl bg-[#FAF6F0] border border-[#E89E84]/30 p-2 my-4 ${className}`}>
        <div className="text-[10px] text-stone-400 uppercase tracking-widest text-center mb-1">Advertisement</div>
        <ins
          className="adsbygoogle"
          style={{ display: 'block' }}
          data-ad-client={adsenseClientId}
          data-ad-slot={slotId || '1234567890'}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Refined native sponsored placeholder card matching the boutique aesthetic (#FAF6F0 / #E89E84)
  return (
    <div
      className={`w-full rounded-2xl bg-gradient-to-r from-[#FAF6F0] via-[#FFFDF9] to-[#FDF6EE] border border-[#E89E84]/35 p-3.5 shadow-sm transition hover:shadow-md ${className}`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#E89E84]/15 text-[#E89E84] text-[10px] font-bold tracking-wide">
          <Sparkles className="w-2.5 h-2.5" />
          {copy.badge}
        </span>
        <span className="text-[10px] text-stone-400 font-medium">AD</span>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h4 className="text-xs font-bold text-stone-800 tracking-tight">
            {copy.title}
          </h4>
          <p className="text-[11px] text-stone-600 line-clamp-1 leading-snug">
            {copy.desc}
          </p>
        </div>

        <a
          href="https://search.shopping.naver.com/search/all?query=%ED%82%A4%EC%A6%88%20%ED%8A%B8%EB%A0%8C%EB%94%94%20%EC%95%84%EB%8F%99%EB%B3%B5"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E89E84] text-white text-[11px] font-bold hover:bg-[#d68a70] transition active:scale-95 shadow-xs"
        >
          <span>{copy.cta}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
};

export default AdBanner;
