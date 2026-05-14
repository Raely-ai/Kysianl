import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import BlockRenderer from "../components/homeBlocks/BlockRenderer";
import { useAppContext } from "../AppContext";

export default function Home() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { initData } = useAppContext();

  useEffect(() => {
    fetch('/api/news')
      .then(res => res.json())
      .then(data => {
        setNewsList(data.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Haberler çekilemedi:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-32 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-gray-100 border-t-red-600 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500 font-medium tracking-wide">Yükleniyor...</p>
      </div>
    );
  }

  const { publishedLayout, settings = {} } = initData || {};
  const siteName = settings.general?.siteName || "Kayserianlık";
  
  let sections = publishedLayout?.sections || [];
  
  // Migration fallback logic if sections don't exist in initData but legacy blocks do
  if (sections.length === 0 && initData?.blocks?.length > 0) {
      sections = [{
          id: 'legacy-section',
          layoutParams: '70-30',
          columns: [
              { id: 'col-1', blocks: initData.blocks.filter((b:any) => !['popular_news', 'whatsapp_box', 'social_box'].includes(b.type)) },
              { id: 'col-2', blocks: initData.blocks.filter((b:any) => ['popular_news', 'whatsapp_box', 'social_box'].includes(b.type)) }
          ]
      }];
  }

  const getColumnClassHome = (layout: string, index: number) => {
    if (layout === '100') return 'w-full';
    if (layout === '50-50') return 'w-full md:w-1/2';
    if (layout === '70-30') return index === 0 ? 'w-full lg:w-[70%]' : 'w-full lg:w-[30%]';
    if (layout === '30-70') return index === 0 ? 'w-full lg:w-[30%]' : 'w-full lg:w-[70%]';
    if (layout === '66-34') return index === 0 ? 'w-full lg:w-[66%]' : 'w-full lg:w-[34%]';
    if (layout === '33-33-33') return 'w-full md:w-1/3';
    return 'w-full';
  };

  return (
    <>
      <Helmet>
        <title>{siteName} - Kayseri Haberleri, Son Dakika</title>
        <meta name="description" content={`${siteName} modern kayseri haber platformu`} />
      </Helmet>
      <div className="flex flex-col gap-10 lg:gap-14 mb-10 mt-6 md:mt-8">
        {sections.map((section: any) => {
            const secSettings = section.settings || {};
            const isFluid = secSettings.containerFluid;
            const bgGray = secSettings.grayBackground;
            const hideMobile = secSettings.hideOnMobile;

            return (
                <section key={section.id} id={section.sectionId || section.id} className={`
                    ${bgGray ? 'bg-gray-50 py-10 border-y border-gray-100' : ''}
                    ${hideMobile ? 'hidden md:block' : ''}
                `}>
                    <div className={`${isFluid ? 'w-full px-4' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}`}>
                        <div className="flex flex-col md:flex-row gap-6 lg:gap-8">
                            {section.columns.map((col: any, cIdx: number) => (
                                <div key={col.id} className={`${getColumnClassHome(section.layoutParams, cIdx)} flex flex-col gap-6 lg:gap-8`}>
                                    {col.blocks.map((block: any) => (
                                        <div key={block.id} className={`${block.settings?.grayBackground ? 'bg-gray-50 p-6 rounded-2xl border border-gray-100' : ''}`}>
                                            <BlockRenderer block={block} newsList={newsList} />
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            );
        })}
        {sections.length === 0 && <p className="text-gray-500 py-10 text-center">Ana sayfa blokları yapılandırılmamış.</p>}
      </div>
    </>
  );
}
