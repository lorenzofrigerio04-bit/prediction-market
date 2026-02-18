/**
 * Source configuration for ingestion pipeline
 * 
 * This file contains configuration for RSS feeds and calendar events.
 * These will be populated with actual sources as needed.
 */

export interface RSSFeed {
  id: string;
  url: string;
  type: 'MEDIA' | 'OFFICIAL';
  name: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: Date;
  type: 'SPORT' | 'EARNINGS';
  sourceUrl?: string;
}

export const RSS_MEDIA_FEEDS: RSSFeed[] = [
  {
    id: 'reuters-top',
    url: 'https://www.reutersagency.com/feed/?best-topics=business-finance&post_type=best',
    type: 'MEDIA',
    name: 'Reuters Business',
  },
  {
    id: 'ap-news',
    url: 'https://apnews.com/apf-topnews',
    type: 'MEDIA',
    name: 'AP News Top',
  },
  {
    id: 'bbc-news',
    url: 'http://feeds.bbci.co.uk/news/rss.xml',
    type: 'MEDIA',
    name: 'BBC News',
  },
  {
    id: 'guardian-world',
    url: 'https://www.theguardian.com/world/rss',
    type: 'MEDIA',
    name: 'The Guardian World',
  },
  {
    id: 'ilsole24ore',
    url: 'https://www.ilsole24ore.com/rss/home.xml',
    type: 'MEDIA',
    name: 'Il Sole 24 Ore',
  },
  {
    id: 'ansa-top',
    url: 'https://www.ansa.it/sito/notizie/topnews/topnews_rss.xml',
    type: 'MEDIA',
    name: 'ANSA Top News',
  },
  {
    id: 'corriere',
    url: 'https://www.corriere.it/rss/homepage.xml',
    type: 'MEDIA',
    name: 'Corriere della Sera',
  },
  {
    id: 'repubblica',
    url: 'https://www.repubblica.it/rss/homepage/rss2.0.xml',
    type: 'MEDIA',
    name: 'La Repubblica',
  },
  {
    id: 'bloomberg',
    url: 'https://www.bloomberg.com/feed/topics/economics',
    type: 'MEDIA',
    name: 'Bloomberg Economics',
  },
  {
    id: 'techcrunch',
    url: 'https://techcrunch.com/feed/',
    type: 'MEDIA',
    name: 'TechCrunch',
  },
];

export const RSS_OFFICIAL_FEEDS: RSSFeed[] = [
  {
    id: 'governo-news',
    url: 'https://www.governo.it/it/rss-feed',
    type: 'OFFICIAL',
    name: 'Governo Italiano',
  },
  {
    id: 'salute-news',
    url: 'https://www.salute.gov.it/portale/news/rss.jsp',
    type: 'OFFICIAL',
    name: 'Ministero della Salute',
  },
  {
    id: 'interno-news',
    url: 'https://www.interno.gov.it/it/notizie',
    type: 'OFFICIAL',
    name: 'Ministero dell\'Interno',
  },
  {
    id: 'mef-news',
    url: 'https://www.mef.gov.it/inevidenza/rss.xml',
    type: 'OFFICIAL',
    name: 'Ministero dell\'Economia',
  },
  {
    id: 'consob-comunicati',
    url: 'https://www.consob.it/web/area-pubblica/comunicati-stampa',
    type: 'OFFICIAL',
    name: 'CONSOB Comunicati',
  },
  {
    id: 'uefa-news',
    url: 'https://www.uefa.com/rssfeed/news/rss.xml',
    type: 'OFFICIAL',
    name: 'UEFA News',
  },
  {
    id: 'fifa-news',
    url: 'https://www.fifa.com/rss-feeds/news/rss.xml',
    type: 'OFFICIAL',
    name: 'FIFA News',
  },
  {
    id: 'figc-news',
    url: 'https://www.figc.it/it/news/feed/',
    type: 'OFFICIAL',
    name: 'FIGC News',
  },
  {
    id: 'sec-news',
    url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=&company=&dateb=&owner=include&start=0&count=40&output=atom',
    type: 'OFFICIAL',
    name: 'SEC Filings',
  },
  {
    id: 'gazzetta-ufficiale',
    url: 'https://www.gazzettaufficiale.it/rss/home',
    type: 'OFFICIAL',
    name: 'Gazzetta Ufficiale',
  },
];

export const CALENDAR_EVENTS: CalendarEvent[] = [
  // Sport events
  {
    id: 'serie-a-matchday',
    title: 'Serie A - Matchday',
    date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 giorni da ora
    type: 'SPORT',
    sourceUrl: 'https://www.legaseriea.it/it',
  },
  {
    id: 'champions-league',
    title: 'Champions League - Match',
    date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 giorni da ora
    type: 'SPORT',
    sourceUrl: 'https://www.uefa.com/uefachampionsleague/',
  },
  {
    id: 'serie-a-matchday-2',
    title: 'Serie A - Matchday',
    date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 giorni da ora
    type: 'SPORT',
    sourceUrl: 'https://www.legaseriea.it/it',
  },
  {
    id: 'euro-2024-qualifier',
    title: 'Euro 2024 Qualifier',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 giorni da ora
    type: 'SPORT',
    sourceUrl: 'https://www.uefa.com/euro2024/',
  },
  {
    id: 'serie-a-matchday-3',
    title: 'Serie A - Matchday',
    date: new Date(Date.now() + 9 * 24 * 60 * 60 * 1000), // 9 giorni da ora
    type: 'SPORT',
    sourceUrl: 'https://www.legaseriea.it/it',
  },
  // Earnings events
  {
    id: 'apple-earnings',
    title: 'Apple Inc. Earnings Report',
    date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000), // 4 giorni da ora
    type: 'EARNINGS',
    sourceUrl: 'https://investor.apple.com/',
  },
  {
    id: 'microsoft-earnings',
    title: 'Microsoft Corporation Earnings Report',
    date: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000), // 6 giorni da ora
    type: 'EARNINGS',
    sourceUrl: 'https://www.microsoft.com/investor',
  },
  {
    id: 'amazon-earnings',
    title: 'Amazon.com Inc. Earnings Report',
    date: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000), // 8 giorni da ora
    type: 'EARNINGS',
    sourceUrl: 'https://ir.aboutamazon.com/',
  },
  {
    id: 'google-earnings',
    title: 'Alphabet Inc. Earnings Report',
    date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 giorni da ora
    type: 'EARNINGS',
    sourceUrl: 'https://abc.xyz/investor/',
  },
  {
    id: 'meta-earnings',
    title: 'Meta Platforms Inc. Earnings Report',
    date: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000), // 12 giorni da ora
    type: 'EARNINGS',
    sourceUrl: 'https://investor.fb.com/',
  },
];

export interface SourceConfigs {
  rssMediaFeeds: RSSFeed[];
  rssOfficialFeeds: RSSFeed[];
  calendarEvents: CalendarEvent[];
}

export function getSourceConfigs(): SourceConfigs {
  return {
    rssMediaFeeds: RSS_MEDIA_FEEDS,
    rssOfficialFeeds: RSS_OFFICIAL_FEEDS,
    calendarEvents: CALENDAR_EVENTS,
  };
}
