import { createContext, useContext, useState, ReactNode } from 'react';

type Lang = 'TR' | 'EN';

const translations = {
  TR: {
    nav: {
      mission: 'Misyon & Vizyon',
      byk: 'BYK',
      works: 'Çalışmalarımız',
      join: 'Üye Ol',
      contact: 'İletişim',
    },
    hero: {
      badge: 'Uluslararası Demokratlar Birliği — Toronto',
      headline: "Kanada'daki Türk Toplumunun Güçlü Sesi",
      subtitle: "UID Toronto, Kanada'da yaşayan Türk toplumunun sosyal, kültürel ve sivil hayata katılımını desteklemekte; toplumumuzun birlik, dayanışma ve temsil gücünü artırmaya yönelik çalışmalar yürütmektedir.",
      ctaPrimary: 'Üye Ol / Become a Member',
      ctaSecondary: "UID Toronto'yu Keşfet",
    },
    mission: {
      tag: 'DEĞERLER & HEDEFLER',
      heading: 'Misyon & Vizyon',
      missionTag: 'MİSYON',
      missionTitle: 'Görevimiz / Our Mission',
      missionP1: "UID Toronto olarak misyonumuz; Kanada'da yaşayan Türk toplumunun kültürel kimliğini korumasına, sosyal hayatta daha güçlü temsil edilmesine ve demokratik süreçlere aktif şekilde katılım sağlamasına destek olmaktır.",
      missionP2: 'Toplumumuzun ihtiyaçlarına yönelik eğitim programları, kültürel faaliyetler, gençlik projeleri, networking etkinlikleri ve sosyal çalışmalar düzenleyerek bireylerin gelişimine katkı sağlamayı amaçlıyoruz.',
      missionP3: "Farklı toplumlar arasında karşılıklı anlayış, saygı ve iş birliğini güçlendirerek Kanada ile Türk toplumu arasında kalıcı köprüler kuruyoruz.",
      visionTag: 'VİZYON',
      visionTitle: 'Hedefimiz / Our Vision',
      visionP1: "Vizyonumuz; Kanada'da güçlü, bilinçli, aktif ve birlik içinde hareket eden bir Türk toplumu oluşturmaktır.",
      visionP2: 'UID Toronto olarak; gençlerin liderlik becerilerini geliştirdiği, kadınların ve bireylerin toplumsal hayatta daha etkin rol aldığı, kültürel mirasımızın gelecek nesillere aktarıldığı sürdürülebilir bir topluluk yapısı oluşturmayı hedefliyoruz.',
      visionP3: "Yaşadığımız ülkenin değerlerine katkı sağlayan, kendi kimliğini koruyan ve toplumlar arasında köprü görevi üstlenen örnek bir sivil toplum hareketi olmayı amaçlıyoruz.",
    },
    byk: {
      tag: 'YÖNETİM',
      heading: 'BYK — Bölge Yönetim Kurulu',
      sub: 'Regional Executive Board / Bölgesel Yürütme Kurulu',
    },
    works: {
      tag: 'FAALİYETLER',
      heading: 'Çalışmalarımız / Our Works',
      sub: 'Topluluk, kültür ve demokrasi adına gerçekleştirdiğimiz etkinlikler ve programlar.',
      cta: 'Tümünü Gör / View All Works',
    },
    membership: {
      tag: 'UID TORONTO ÜYELİĞİ',
      heading: 'UID Toronto Üyeliği',
      subtitle: 'Toplumumuzun geleceğine katkı sağlayın ve UID Toronto ailesinin bir parçası olun.',
      monthly: {
        name: 'Aylık Üyelik',
        price: '$20',
        period: 'CAD / Ay',
        cta: 'Aylık Üye Ol',
        features: [
          'UID Toronto resmi üyeliği',
          'Etkinlik ve program davetleri',
          'Topluluk ağına erişim',
          'Gençlik ve liderlik çalışmalarına katılım',
          'Kültürel ve sosyal projelere destek',
        ],
      },
      yearly: {
        name: 'Yıllık Üyelik',
        price: '$240',
        period: 'CAD / Yıl',
        badge: 'En Çok Tercih Edilen',
        cta: 'Yıllık Üye Ol',
        features: [
          'Tüm aylık üyelik avantajları',
          'Bir yıllık kesintisiz destek',
          'UID Toronto gelişim projelerine katkı',
          'Toplum çalışmalarında aktif rol alma',
        ],
      },
      trust1: 'Güvenli üyelik',
      trust2: 'Güçlü topluluk',
      trust3: 'İptal edilebilir',
    },
    faq: {
      tag: 'SIKÇA SORULAN SORULAR',
      heading: 'Sıkça Sorulan Sorular / FAQ',
      items: [
        {
          q: 'UID Toronto nedir?',
          a: "UID Toronto, Kanada'da yaşayan Türk toplumunu sosyal, kültürel ve sivil alanlarda bir araya getiren uluslararası bir sivil toplum kuruluşudur.",
        },
        {
          q: 'Kimler üye olabilir?',
          a: "Topluma katkı sağlamak, kültürel bağlarını güçlendirmek ve UID Toronto çalışmalarına destek olmak isteyen herkes üyelik başvurusu yapabilir.",
        },
        {
          q: 'Üyelik ücretleri nasıl kullanılıyor?',
          a: "Üyelik destekleri; etkinlikler, gençlik projeleri, eğitim programları ve toplum çalışmalarının geliştirilmesi için kullanılmaktadır.",
        },
        {
          q: 'UID Toronto etkinliklerine nasıl katılabilirim?',
          a: "Web sitemiz ve sosyal medya hesaplarımız üzerinden duyurulan programlara kayıt olarak katılım sağlayabilirsiniz.",
        },
        {
          q: 'Gönüllü olabilir miyim?',
          a: "Evet. UID Toronto farklı alanlarda katkı sağlamak isteyen gönüllülere açıktır.",
        },
      ],
    },
    newsletter: {
      tag: 'BÜLTENİMİZ',
      heading: 'Bültenimize Katılın',
      headingSub: 'Join Our Newsletter',
      quote: '"Together, we shape the future of our community."',
      quoteTr: '"Birlikte toplumumuzun geleceğini inşa ediyoruz."',
      firstName: 'Ad / First Name',
      lastName: 'Soyad / Last Name',
      email: 'E-posta / Email',
      city: 'Şehir / City',
      submit: 'Bültene Abone Ol / Subscribe',
      successTitle: 'Teşekkürler!',
      successMsg: 'Bültenimize başarıyla abone oldunuz. Yakında haberdar olacaksınız.',
    },
    footer: {
      desc: "Kanada'da demokrasi ve topluluğu güçlendiriyoruz.",
      descEn: 'Strengthening democracy and community across Canada.',
      org: 'Organizasyon',
      community: 'Topluluk',
      contact: 'İletişim',
      copyright: '© 2026 UID Toronto. Tüm hakları saklıdır.',
    },
    worksPage: {
      breadHome: 'Ana Sayfa / Home',
      tag: 'FAALİYETLER',
      heading: 'Çalışmalarımız / Our Works',
      sub: 'Topluluk, kültür ve demokrasi adına gerçekleştirdiğimiz tüm etkinlikler, programlar ve projeler.',
      readMore: 'Devamını Oku',
      filterAll: 'Tümü / All',
    },
  },
  EN: {
    nav: {
      mission: 'Mission & Vision',
      byk: 'Executive Board',
      works: 'Our Works',
      join: 'Join',
      contact: 'Contact',
    },
    hero: {
      badge: 'Union of International Democrats — Toronto',
      headline: 'The Strong Voice of the Turkish Community in Canada',
      subtitle: "UID Toronto supports the Turkish community in Canada in participating in social, cultural, and civic life, working to strengthen our community's unity, solidarity, and representation.",
      ctaPrimary: 'Become a Member / Üye Ol',
      ctaSecondary: 'Discover UID Toronto',
    },
    mission: {
      tag: 'VALUES & GOALS',
      heading: 'Mission & Vision',
      missionTag: 'MISSION',
      missionTitle: 'Our Mission / Görevimiz',
      missionP1: 'Our mission at UID Toronto is to support the Turkish community in Canada in preserving their cultural identity, gaining stronger representation in social life, and actively participating in democratic processes.',
      missionP2: 'We aim to contribute to individual development by organizing education programs, cultural activities, youth projects, networking events, and social initiatives tailored to the needs of our community.',
      missionP3: "We are building lasting bridges between Canada and the Turkish community by strengthening mutual understanding, respect, and cooperation between different societies.",
      visionTag: 'VISION',
      visionTitle: 'Our Vision / Hedefimiz',
      visionP1: "Our vision is to build a strong, informed, active, and unified Turkish community in Canada.",
      visionP2: 'At UID Toronto, we aim to create a sustainable community structure where youth develop leadership skills, women and individuals take more active roles in social life, and our cultural heritage is passed on to future generations.',
      visionP3: "We aim to be an exemplary civil society movement that contributes to the values of the country we live in, preserves its own identity, and acts as a bridge between communities.",
    },
    byk: {
      tag: 'LEADERSHIP',
      heading: 'Regional Executive Board',
      sub: 'Bölge Yönetim Kurulu / BYK',
    },
    works: {
      tag: 'ACTIVITIES',
      heading: 'Our Works / Çalışmalarımız',
      sub: 'Events and programs carried out for the benefit of community, culture, and democracy.',
      cta: 'View All Works / Tümünü Gör',
    },
    membership: {
      tag: 'UID TORONTO MEMBERSHIP',
      heading: 'UID Toronto Membership',
      subtitle: 'Contribute to the future of our community and become part of the UID Toronto family.',
      monthly: {
        name: 'Monthly Membership',
        price: '$20',
        period: 'CAD / Month',
        cta: 'Join Monthly',
        features: [
          'Official UID Toronto membership',
          'Event and program invitations',
          'Access to the community network',
          'Youth and leadership program participation',
          'Support for cultural and social projects',
        ],
      },
      yearly: {
        name: 'Annual Membership',
        price: '$240',
        period: 'CAD / Year',
        badge: 'Most Popular',
        cta: 'Join Annually',
        features: [
          'All monthly membership benefits',
          'One year of uninterrupted support',
          'Contribution to UID Toronto development projects',
          'Active role in community initiatives',
        ],
      },
      trust1: 'Secure membership',
      trust2: 'Strong community',
      trust3: 'Cancellable anytime',
    },
    faq: {
      tag: 'FREQUENTLY ASKED QUESTIONS',
      heading: 'Frequently Asked Questions / SSS',
      items: [
        {
          q: 'What is UID Toronto?',
          a: "UID Toronto is an international civil society organization that brings the Turkish community in Canada together in social, cultural, and civic areas.",
        },
        {
          q: 'Who can become a member?',
          a: "Anyone who wants to contribute to the community, strengthen their cultural ties, and support UID Toronto's work can apply for membership.",
        },
        {
          q: 'How are membership fees used?',
          a: "Membership contributions are used for events, youth projects, education programs, and the development of community initiatives.",
        },
        {
          q: 'How can I participate in UID Toronto events?',
          a: "You can register for programs announced through our website and social media accounts.",
        },
        {
          q: 'Can I volunteer?',
          a: "Yes. UID Toronto is open to volunteers who want to contribute in different areas.",
        },
      ],
    },
    newsletter: {
      tag: 'NEWSLETTER',
      heading: 'Join Our Newsletter',
      headingSub: 'Bültenimize Katılın',
      quote: '"Together, we shape the future of our community."',
      quoteTr: '"Birlikte toplumumuzun geleceğini inşa ediyoruz."',
      firstName: 'First Name / Ad',
      lastName: 'Last Name / Soyad',
      email: 'Email / E-posta',
      city: 'City / Şehir',
      submit: 'Subscribe to Newsletter / Abone Ol',
      successTitle: 'Thank You!',
      successMsg: 'You have successfully subscribed to our newsletter. Stay tuned for updates.',
    },
    footer: {
      desc: 'Strengthening democracy and community across Canada.',
      descEn: "Kanada'da demokrasi ve topluluğu güçlendiriyoruz.",
      org: 'Organization',
      community: 'Community',
      contact: 'Contact',
      copyright: '© 2026 UID Toronto. All rights reserved.',
    },
    worksPage: {
      breadHome: 'Home / Ana Sayfa',
      tag: 'ACTIVITIES',
      heading: 'Our Works / Çalışmalarımız',
      sub: 'All events, programs, and projects carried out for community, culture, and democracy.',
      readMore: 'Read More',
      filterAll: 'All / Tümü',
    },
  },
} as const;

type Translations = typeof translations.TR;

interface LangContextType {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
}

const LangContext = createContext<LangContextType>({
  lang: 'TR',
  setLang: () => {},
  t: translations.TR,
});

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('TR');
  return (
    <LangContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
