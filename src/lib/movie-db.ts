import { Content } from '../types/netflix';

export const GENRES = {
  NEW: 'Újonnan a kínálatban',
  POPULAR: 'Népszerűek',
  HUNGARIAN_DUB_TV: 'Magyar szinkronos sorozatok',
  FEATURED: 'Kiemelt',
  ACTION: 'Akció',
  DRAMA: 'Dráma',
  SCIFI: 'Sci-Fi',
  HORROR: 'Horror',
  THRILLER: 'Thriller',
  COMEDY: 'Vígjáték'
};

export const movieDB: Content[] = [
  {
    id: '1',
    title: 'A Gesztenyeember',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy koppenhágai játszótéren egy brutálitalanul meggyilkolt nőt találnak, mellette pedig egy gesztenyéből készült kisbábut. A nyomozók hamarosan összefüggést találnak egy eltűnt politikus lányával.',
    year: 2021,
    duration: '6 epizód',
    genres: ['Kemény', 'Komor', 'Skandináv noir', 'Dán', GENRES.NEW, GENRES.THRILLER],
    cast: ['Danica Curcic', 'Mikkel Boe Følsgaard', 'David Dencik'],
    isNewSeasonAvailable: false,
    trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '52m',
            durationSeconds: 3120,
            upNextTriggerSeconds: 15,
            description: 'Naia Thulin nyomozó és új társa, Mark Hess egy borzalmas gyilkossági helyszűre érkeznek.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          },
          {
            episode: 2,
            title: '2. epizód',
            duration: '55m',
            durationSeconds: 3300,
            upNextTriggerSeconds: 20,
            description: 'Hess felfedez egy gyanús nyomot a gesztenyeemberen, ami egy évekkel ezelőtti ügyhöz vezet.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    title: 'Közönséges kémek',
    type: 'series',
    imageUrl: 'https://assets.snitt.hu/system/covers/normal/covers_150671.jpg?1777863163',
    description: 'Egy exnyomozó (Steve Coogan) a szárnyai alá vesz egy mogorva vámtisztet (Tom Burke), és egy újonc csapattal beépülnek Nagy-Britannia drogbáróinak világába.',
    year: 2026,
    duration: '6 epizód',
    genres: [GENRES.POPULAR, GENRES.THRILLER],
    cast: ['Tom Burke', 'Steve Coogan', 'Tom Hughes'],
    trailerUrl: 'https://www.youtube.com/embed/Y274jZs5s7s',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/Y274jZs5s7s',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '45m',
            durationSeconds: 2700,
            upNextTriggerSeconds: 15,
            description: 'A csapat első bevetése nem várt fordulatokat tartogat.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1485081666276-03999829deac?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/Y274jZs5s7s'
          }
        ]
      }
    ]
  },
  {
    id: '3',
    title: 'BALHÉ',
    type: 'series',
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    description: 'Két idegen egy közlekedési incidens után olyan bosszúhadjáratba kezd, ami felemészti minden gondolatukat.',
    year: 2023,
    duration: '10 epizód',
    genres: [GENRES.POPULAR, GENRES.COMEDY, GENRES.DRAMA],
    cast: ['Steven Yeun', 'Ali Wong'],
    isNewSeasonAvailable: true,
    trailerUrl: 'https://www.youtube.com/embed/RRwycJ08PSA',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/RRwycJ08PSA',
        episodes: [
          {
            episode: 1,
            title: 'A madarak csiripelnek',
            duration: '35m',
            durationSeconds: 2100,
            upNextTriggerSeconds: 15,
            description: 'Amy és Danny útjai kereszteződnek egy parkolóban.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/RRwycJ08PSA'
          }
        ]
      }
    ]
  },
  {
    id: '4',
    title: 'The Gray Man',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    description: 'Amikor a CIA legképzettebb bérgyilkosa véletlenül sötét ügynökségi titkokat tár fel, egy pszichopata exkollégája vérdíjat tűz ki a fejére, és globális hajtóvadászatot indít ellene.',
    year: 2022,
    duration: '2ó 2p',
    durationSeconds: 7320,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.THRILLER],
    cast: ['Ryan Gosling', 'Chris Evans', 'Ana de Armas'],
    trailerUrl: 'https://www.youtube.com/embed/BmllggGOBAc',
    embedUrl: 'https://vidsrc.to/embed/movie/tt1649418'
  },
  {
    id: '5',
    title: 'Stranger Things',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://snitt.hu/system/covers/big/covers_142629.jpg?1752595225',
    description: 'Amikor egy kisfiú eltűnik, egy kisvárosban rejtélyes kísérletek, félelmetes természetfeletti erők és egy furcsa kislány története bontakozik ki.',
    year: 2016,
    duration: '4 évad',
    genres: [GENRES.SCIFI, GENRES.HORROR, GENRES.DRAMA, GENRES.NEW, GENRES.POPULAR],
    cast: ['Winona Ryder', 'David Harbour', 'Millie Bobby Brown'],
    trailerUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/b9EkMc79ZSU',
        episodes: [
          {
            episode: 1,
            title: 'Will Byers eltűnése',
            duration: '48m',
            durationSeconds: 2880,
            upNextTriggerSeconds: 15,
            description: 'Will hazatérve valami félelmetessel találkozik. A közelben egy kormányzati laboratóriumban valami balul sül el.',
            thumbnailUrl: 'https://occ-0-8479-1490.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABVK_gFEgtIUehB6eVZUDlqSrTW8upc-aOdSC5tRoAHiQQTobAdi_pmZtEufHWKP851hzbv1NDyVg4ML2-bCsjI8uZRBbyxmIFnEHVYLCbEZt2Kh-otgqlQBi.jpg?r=f18',
            embedUrl: 'https://vkvideo.ru/video_ext.php?oid=-238528419&id=456239020&hash=de7d484e544ad459'
          },
          {
            episode: 2,
            title: 'A juharszirupos kislány',
            duration: '56m',
            durationSeconds: 3360,
            upNextTriggerSeconds: 15,
            description: 'Lucas, Mike és Dustin egy rejtélyes lányt találnak az erdőben. Hopper kihallgatja a megriadt Joyce-ot.',
            thumbnailUrl: 'https://occ-0-8479-1490.1.nflxso.net/dnm/api/v6/9pS1daC2n6UGc3dUogvWIPMR_OU/AAAABaYzylimO7RbG8rNrXcRwIJyCwtZOQy3xC1mzkh_x9auBVrZ36B6F-NxccqWgFOWC-09O-CpChLksnkuZ8ZzFsNXqKoBMVK0ePZGbalQ7qicLea3J6vfeshp.jpg?r=4c0',
            embedUrl: 'https://vkvideo.ru/video_ext.php?oid=-238528419&id=456239018&hash=e29f7d6abfe80ce7'
          }
        ]
      },
      {
        season: 2,
        trailerUrl: 'https://www.youtube.com/embed/R1ZXOOLMJ8s',
        episodes: [
          {
            episode: 1,
            title: 'MADMAX',
            duration: '48m',
            durationSeconds: 2880,
            upNextTriggerSeconds: 15,
            description: 'Will látomásai rosszabbodnak. Egy új lány érkezik a városba, aki felkelti a fiúk érdeklődését.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1627110991758-2d1ae81665a0?q=80&w=500',
            embedUrl: 'https://vidsrc.to/embed/tv/tt4574334/2/1'
          }
        ]
      }
    ]
  },
  {
    id: '6',
    title: 'Inception',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2089&auto=format&fit=crop',
    description: 'Egy tolvaj, aki titkokat lop el az almokból, kap egy utolsó esélyt a megváltásra: végre kell hajtania az "eredetet", azaz elültetni egy ötletet valaki elméjében.',
    year: 2010,
    duration: '2ó 28p',
    durationSeconds: 8880,
    upNextTriggerSeconds: 15,
    genres: [GENRES.SCIFI, GENRES.ACTION],
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page'],
    trailerUrl: 'https://www.youtube.com/embed/YoHD9XEInc0',
    embedUrl: 'https://vidsrc.to/embed/movie/tt1375666'
  },
  {
    id: '7',
    title: 'Squid Game',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1627110991758-2d1ae81665a0?q=80&w=2070&auto=format&fit=crop',
    description: 'Több száz pénzszűkében lévő játékos elfogad egy különös meghívást, hogy gyerekjátékokban mérjék össze erejüket. A tét hatalmas, de a veszély halálos.',
    year: 2021,
    duration: '1 évad',
    genres: [GENRES.THRILLER, GENRES.DRAMA, GENRES.NEW, GENRES.POPULAR],
    cast: ['Lee Jung-jae', 'Park Hae-soo', 'Jung Ho-yeon'],
    trailerUrl: 'https://www.youtube.com/embed/oqxAJKy0ii4',
    seasons: [
      {
        season: 1,
        episodes: [
          {
            episode: 1,
            title: 'Piros lámpa, zöld lámpa',
            duration: '60m',
            durationSeconds: 3600,
            upNextTriggerSeconds: 15,
            description: 'Gihun a hatalmas adósságai miatt beleegyezik egy titokzatos játékba, de hamarosan rájön, hogy a szabályok brutálisak.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1627110991758-2d1ae81665a0?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/oqxAJKy0ii4'
          }
        ]
      }
    ]
  },
  {
    id: '8',
    title: 'The Dark Knight',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=2070&auto=format&fit=crop',
    description: 'Amikor a Joker néven ismert rejtélyes bűnöző káoszt és pusztítást okoz Gotham lakói körében, Batmannek szembe kell néznie az egyik legnagyobb pszichológiai és fizikai kihívással.',
    year: 2008,
    duration: '2ó 32p',
    durationSeconds: 9120,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.DRAMA, GENRES.THRILLER],
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    trailerUrl: 'https://www.youtube.com/embed/EXeTwQWrcwY',
    embedUrl: 'https://vidsrc.to/embed/movie/tt0468569'
  },
  {
    id: '9',
    title: 'The Crown',
    type: 'series',
    imageUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=2070&auto=format&fit=crop',
    description: 'Ez a drámasorozat II. Erzsébet királynő uralkodását és azokat a politikai és személyi eseményeket követi nyomon, amelyek alakították a 20. század második felét.',
    year: 2016,
    duration: '6 évad',
    genres: [GENRES.DRAMA, GENRES.FEATURED],
    cast: ['Claire Foy', 'Olivia Colman', 'Imelda Staunton'],
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/JWtnJjn6ng0',
        episodes: [
          {
            episode: 1,
            title: 'Wolferton Splash',
            duration: '56m',
            durationSeconds: 3360,
            upNextTriggerSeconds: 15,
            description: 'A fiatal Erzsébet feleségül megy Fülöp herceghez, miközben apja, VI. György király egészsége romlik.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/JWtnJjn6ng0'
          }
        ]
      },
      {
        season: 2,
        trailerUrl: 'https://www.youtube.com/embed/V6f6tSExyYg',
        episodes: [
          {
            episode: 1,
            title: 'Misadventure',
            duration: '58m',
            durationSeconds: 3480,
            upNextTriggerSeconds: 15,
            description: 'Fülöp herceg elindul egy hosszú tengerentúli útra, miközben Erzsébetnek a Szuezi-válsággal kell szembenéznie.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/V6f6tSExyYg'
          }
        ]
      }
    ]
  },
  {
    id: '10',
    title: 'Top Gun: Maverick',
    type: 'movie',
    imageUrl: 'https://m.media-amazon.com/images/M/MV5BMDBkZDNjMWEtOTdmMi00NmExLTg5MmMtNTFlYTJlNWY5YTdmXkEyXkFqcGc@._V1_.jpg',
    description: 'Több mint harminc évnyi szolgálat után a haditengerészet egyik legjobb pilótája, Pete "Maverick" Mitchell visszatér, hogy kiképezze a kiválasztott fiatal pilóták egy csoportját egy különleges és veszélyes küldetésre.',
    year: 2022,
    duration: '2ó 10p',
    durationSeconds: 7800,
    genres: [GENRES.ACTION, GENRES.DRAMA],
    cast: ['Tom Cruise', 'Miles Teller', 'Jennifer Connelly'],
    trailerUrl: 'https://www.youtube.com/embed/HqsagXiW3WI',
    embedUrl: 'https://vkvideo.ru/video_ext.php?oid=-229871314&id=456239019&hash=384c664e615cb4e7'
  },
  {
    id: '11',
    title: 'A Bridgerton család',
    type: 'series',
    imageUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=2070&auto=format&fit=crop',
    description: 'A Bridgerton család nyolc testvére a londoni társaságban keresi a boldogságot és a szerelmet, miközben Julia Quinn sikerkönyvei alapján készült sorozatban a titokzatos Lady Whistledown pletykalapja tartja izgalomban a várost.',
    year: 2020,
    duration: '3 évad',
    genres: [GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Adjoa Andoh', 'Julie Andrews', 'Lorraine Ashbourne'],
    trailerUrl: 'https://www.youtube.com/embed/gpv7ayf_tyE',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/gpv7ayf_tyE',
        episodes: [
          {
            episode: 1,
            title: 'Az első gyémánt',
            duration: '58m',
            durationSeconds: 3480,
            upNextTriggerSeconds: 15,
            description: 'Daphne Bridgerton bemutatkozik a londoni társaságnak, és rögtön felkelti a királyné figyelmét.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/gpv7ayf_tyE'
          }
        ]
      }
    ]
  },
  {
    id: '12',
    title: 'Glass Onion: A Knives Out Mystery',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    description: 'A világhírű detektív, Benoit Blanc Görögországba utazik, hogy megfejtse egy milliárdos tech-mogul és baráti köre körül kialakult rejtélyes gyilkossági ügyet.',
    year: 2022,
    duration: '2ó 19p',
    durationSeconds: 8340,
    upNextTriggerSeconds: 15,
    genres: [GENRES.COMEDY, GENRES.THRILLER],
    cast: ['Daniel Craig', 'Edward Norton', 'Janelle Monáe'],
    embedUrl: 'https://www.youtube.com/embed/gj5ibYSz8C0'
  },
  {
    id: '13',
    title: 'Extraction 2',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    description: 'Tyler Rake, a feketepiaci zsoldos egy újabb életveszélyes küldetésre indul: ki kell szabadítania egy könyörtelen grúz bűnöző családját a börtönből.',
    year: 2023,
    duration: '2ó 3p',
    durationSeconds: 7380,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.THRILLER, GENRES.NEW],
    cast: ['Chris Hemsworth', 'Golshifteh Farahani', 'Adam Bessa'],
    embedUrl: 'https://www.youtube.com/embed/Y274jZs5s7s'
  },
  {
    id: '14',
    title: 'The Queen\'s Gambit',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy árva sakkozó zseni küzdelme a függőséggel és a világ legjobb játékosaival az 1960-as években.',
    year: 2020,
    duration: '7 epizód',
    genres: [GENRES.DRAMA, GENRES.FEATURED, GENRES.POPULAR],
    cast: ['Anya Taylor-Joy', 'Bill Camp', 'Marielle Heller'],
    trailerUrl: 'https://www.youtube.com/embed/CDrieqwSdgI',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/CDrieqwSdgI',
        episodes: [
          {
            episode: 1,
            title: 'Megnyitás',
            duration: '59m',
            durationSeconds: 3540,
            upNextTriggerSeconds: 15,
            description: 'Beth felfedezi a sakk világát az árvaház alagsorában.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1586165368502-1bad197a6461?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/CDrieqwSdgI'
          }
        ]
      }
    ]
  },
  {
    id: '15',
    title: 'Wednesday',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1627389955609-bf0114b0b1f3?q=80&w=2070&auto=format&fit=crop',
    description: 'Wednesday Addams diákként próbálja uralni kibontakozó látnoki képességeit, miközben egy rejtélyes gyilkosságsorozat után nyomoz a Nevermore Akadémián.',
    year: 2022,
    duration: '1 évad',
    genres: [GENRES.COMEDY, GENRES.HORROR, GENRES.NEW, GENRES.POPULAR],
    cast: ['Jenna Ortega', 'Gwendoline Christie', 'Riki Lindhome'],
    trailerUrl: 'https://www.youtube.com/embed/Di310WS8zLk',
    seasons: [
      {
        season: 1,
        episodes: [
          {
            episode: 1,
            title: 'Szerda gyermeke csupa bánat',
            duration: '59m',
            durationSeconds: 3540,
            upNextTriggerSeconds: 15,
            description: 'Wednesdayt kicsapják az iskolából, ezért szülei a Nevermore Akadémiára küldik.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1627389955609-bf0114b0b1f3?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/Di310WS8zLk'
          }
        ]
      }
    ]
  },
  {
    id: '16',
    title: 'Interstellar',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?q=80&w=2072&auto=format&fit=crop',
    description: 'Amikor a Föld élhetetlenné válik a jövőben, egy csapat kutató a történelem legfontosabb küldetésére indul: átlépnek a galaxisunk határain, hogy kiderítsék, van-e jövője az emberiségnek a csillagok között.',
    year: 2014,
    duration: '2ó 49p',
    durationSeconds: 10140,
    upNextTriggerSeconds: 15,
    genres: [GENRES.SCIFI, GENRES.DRAMA],
    cast: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain'],
    embedUrl: 'https://www.youtube.com/embed/zSWdZVtXT7E'
  },
  {
    id: '17',
    title: 'DARK',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy gyermek eltűnése után négy család lázas keresésbe kezd, hogy válaszokat kapjanak. A rejtély három generáción átívelő, szövevényes titkokat tár fel.',
    year: 2017,
    duration: '3 évad',
    genres: [GENRES.SCIFI, GENRES.THRILLER, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Louis Hofmann', 'Karoline Eichhorn', 'Lisa Vicari'],
    trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
        episodes: [
          {
            episode: 1,
            title: 'Titkok',
            duration: '47m',
            durationSeconds: 2820,
            upNextTriggerSeconds: 15,
            description: '2019-ben egy fiú eltűnése Windenben félelmet és gyanakvást kelt a lakók között.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          }
        ]
      },
      {
        season: 2,
        episodes: [
          {
            episode: 1,
            title: 'Kezdetek és végek',
            duration: '54m',
            durationSeconds: 3240,
            upNextTriggerSeconds: 15,
            description: 'Clausen és Charlotte válaszokat keresnek. Jonas és az idegen titkokat fedeznek fel a jövőről.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          },
          {
            episode: 2,
            title: 'Sötét anyag',
            duration: '55m',
            durationSeconds: 3300,
            upNextTriggerSeconds: 15,
            description: 'Clausen átkutatja a rendőrségi aktákat. Jonas megpróbál visszatérni a saját idejébe.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          }
        ]
      }
    ]
  },
  {
    id: '18',
    title: 'A nagy pénzrablás',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2037&auto=format&fit=crop',
    description: 'Nyolc rabló túszokat ejt és bezárkózik a Spanyol Királyi Pénzverdébe, miközben egy bűnöző zseni a rendőrséget manipulálja, hogy végrehajtsa a történelem legnagyobb rablását.',
    year: 2017,
    duration: '5 évad',
    genres: [GENRES.THRILLER, GENRES.ACTION, GENRES.POPULAR, GENRES.NEW],
    cast: ['Úrsula Corberó', 'Álvaro Morte', 'Itziar Ituño'],
    trailerUrl: 'https://www.youtube.com/embed/hMANI1jbS6E',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/hMANI1jbS6E',
        episodes: [
          {
            episode: 1,
            title: 'Epizód 1',
            duration: '47m',
            durationSeconds: 2820,
            upNextTriggerSeconds: 15,
            description: 'A Professzor beszervezi a csapatot egy ambiciózus rablásra.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/hMANI1jbS6E'
          }
        ]
      }
    ]
  },
  {
    id: '19',
    title: 'Különösen veszélyes bűnözők',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    description: 'A világ legkeresettebb műkincstolvaja és a világ legjobb szélhámosa kénytelen összefogni az FBI egyik profilozójával, hogy elkapjanak egy még veszélyesebb bűnözőt.',
    year: 2021,
    duration: '1ó 58p',
    durationSeconds: 7080,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.COMEDY, GENRES.POPULAR],
    cast: ['Dwayne Johnson', 'Ryan Reynolds', 'Gal Gadot'],
    embedUrl: 'https://www.youtube.com/embed/PjGkVAgXu67'
  },
  {
    id: '20',
    title: 'Mindannyian halottak vagyunk',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500',
    description: 'Egy zombi-vírus kitörése után a középiskolás diákok csapdába esnek az iskolájukban, és minden erejükkel küzdeniük kell a túlélésért.',
    year: 2022,
    duration: '1 évad',
    genres: [GENRES.HORROR, GENRES.THRILLER, GENRES.DRAMA, GENRES.NEW],
    cast: ['Park Ji-hu', 'Yoon Chan-young', 'Cho Yi-hyun'],
    trailerUrl: 'https://www.youtube.com/embed/IN5TD4obcWw',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/IN5TD4obcWw',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '67m',
            durationSeconds: 4020,
            upNextTriggerSeconds: 15,
            description: 'Egy diákot megharap egy laboratóriumi hörcsög, ami elindítja a káoszt.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/IN5TD4obcWw'
          }
        ]
      }
    ]
  },
  {
    id: '21',
    title: 'Vaják',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=2069&auto=format&fit=crop',
    description: 'Ríviai Geralt, a magányos szörnyvadász küzd, hogy megtalálja a helyét egy olyan világban, ahol az emberek gyakran hitványabbak a bestiáknál.',
    year: 2019,
    duration: '3 évad',
    genres: [GENRES.ACTION, GENRES.DRAMA, GENRES.SCIFI, GENRES.POPULAR],
    cast: ['Henry Cavill', 'Anya Chalotra', 'Freya Allan'],
    trailerUrl: 'https://www.youtube.com/embed/ndl1W4ltcmg',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/ndl1W4ltcmg',
        episodes: [
          {
            episode: 1,
            title: 'A vég kezdete',
            duration: '61m',
            durationSeconds: 3660,
            upNextTriggerSeconds: 15,
            description: 'Geralt Blavikennek találja szembe magát Renfrivel.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/ndl1W4ltcmg'
          }
        ]
      }
    ]
  },
  {
    id: '22',
    title: 'Bird Box',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    description: 'Amikor egy rejtélyes erő megtizedeli a népességet, csak egy dolog biztos: ha meglátod, meghalsz. Egy anya bekötött szemmel indul veszélyes útra gyermekeivel.',
    year: 2018,
    duration: '2ó 4p',
    durationSeconds: 7440,
    upNextTriggerSeconds: 15,
    genres: [GENRES.THRILLER, GENRES.HORROR, GENRES.DRAMA],
    cast: ['Sandra Bullock', 'Trevante Rhodes', 'John Malkovich'],
    embedUrl: 'https://www.youtube.com/embed/o2AsIXShPua'
  },
  {
    id: '23',
    title: 'Black Mirror',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    description: 'Ez az antológiasorozat az emberi természet sötét oldalát és a technológia modern társadalomra gyakorolt nyugtalanító hatását vizsgálja.',
    year: 2011,
    duration: '6 évad',
    genres: [GENRES.SCIFI, GENRES.DRAMA, GENRES.THRILLER, GENRES.POPULAR],
    cast: ['Bryce Dallas Howard', 'Jon Hamm', 'Aaron Paul'],
    trailerUrl: 'https://www.youtube.com/embed/jDiYGjp5iFg',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/jDiYGjp5iFg',
        episodes: [
          {
            episode: 1,
            title: 'Nemzeti himnusz',
            duration: '44m',
            durationSeconds: 2640,
            upNextTriggerSeconds: 15,
            description: 'A miniszterelnöknek lehetetlen döntést kell hoznia, amikor a királyi család tagját elrabolják.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/jDiYGjp5iFg'
          }
        ]
      }
    ]
  },
  {
    id: '24',
    title: 'Army of the Dead',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy zombi-járvány után Las Vegasban egy csapat zsoldos a végső kockázatot vállalja: behatolnak a karanténzónába, hogy végrehajtsák a világ legnagyobb rablását.',
    year: 2021,
    duration: '2ó 28p',
    durationSeconds: 8880,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.HORROR, GENRES.THRILLER],
    cast: ['Dave Bautista', 'Ella Purnell', 'Omari Hardwick'],
    embedUrl: 'https://www.youtube.com/embed/tI1JGpbdnC0'
  },
  {
    id: '25',
    title: 'Mindhunter',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    description: 'Két FBI-ügynök a modern bűnügyi profilalkotás alapjait rakja le a sorozatgyilkosok pszichológiájának tanulmányozásával.',
    year: 2017,
    duration: '2 évad',
    genres: [GENRES.DRAMA, GENRES.THRILLER],
    cast: ['Jonathan Groff', 'Holt McCallany', 'Anna Torv'],
    trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/rrwycJ08PSA',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '60m',
            durationSeconds: 3600,
            upNextTriggerSeconds: 15,
            description: 'Holden Ford ügynök elkezd érdeklődni a fogvatartottak pszichológiája iránt.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/rrwycJ08PSA'
          }
        ]
      }
    ]
  },
  {
    id: '26',
    title: 'Joker',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1531259683007-016a7b328a62?q=80&w=2070&auto=format&fit=crop',
    description: 'Arthur Fleck, a magányos és mentálisan zavart komikus Gothamben próbál boldogulni, de a sorozatos megaláztatások hatására elindul egy sötét, erőszakos úton.',
    year: 2019,
    duration: '2ó 2p',
    durationSeconds: 7320,
    upNextTriggerSeconds: 15,
    genres: [GENRES.DRAMA, GENRES.THRILLER],
    cast: ['Joaquin Phoenix', 'Robert De Niro', 'Zazie Beetz'],
    embedUrl: 'https://www.youtube.com/embed/zAGVQLHvwOY'
  },
  {
    id: '27',
    title: 'Paraziták',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy szegény család ravasz módon beférkőzik egy gazdag család bizalmába, de az események hamarosan kontrollálhatatlanná válnak.',
    year: 2019,
    duration: '2ó 12p',
    durationSeconds: 7920,
    upNextTriggerSeconds: 15,
    genres: [GENRES.THRILLER, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    embedUrl: 'https://www.youtube.com/embed/5xH0HfJHsaY'
  },
  {
    id: '28',
    title: 'Lupin',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2037&auto=format&fit=crop',
    description: 'Assane Diop úri tolvajként próbál bosszút állni az apján esett igazságtalanságért, inspirációt merítve Arsène Lupin kalandjaiból.',
    year: 2021,
    duration: '3 évad',
    genres: [GENRES.THRILLER, GENRES.ACTION, GENRES.POPULAR],
    cast: ['Omar Sy', 'Ludivine Sagnier', 'Clotilde Hesme'],
    trailerUrl: 'https://www.youtube.com/embed/ga0iKU6M69c',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/ga0iKU6M69c',
        episodes: [
          {
            episode: 1,
            title: 'Le Louvre',
            duration: '47m',
            durationSeconds: 2820,
            upNextTriggerSeconds: 15,
            description: 'Assane rablási kísérletet hajt végre a Louvre-ban, hogy megszerezzen egy értékes nyakláncot.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/ga0iKU6M69c'
          }
        ]
      }
    ]
  },
  {
    id: '29',
    title: 'Arcane',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=2069&auto=format&fit=crop',
    description: 'A gazdag Piltover és a szegény Zaun negyedek közötti feszültség közepette két testvér sorsa megpecsételődik egy különleges technológia felfedezése után.',
    year: 2021,
    duration: '2 évad',
    genres: [GENRES.ACTION, GENRES.SCIFI, GENRES.DRAMA, GENRES.NEW, GENRES.POPULAR],
    cast: ['Hailee Steinfeld', 'Ella Purnell', 'Kevin Alejandro'],
    trailerUrl: 'https://www.youtube.com/embed/fXmAurh012s',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/fXmAurh012s',
        episodes: [
          {
            episode: 1,
            title: 'Welcome to the Playground',
            duration: '45m',
            durationSeconds: 2700,
            upNextTriggerSeconds: 15,
            description: 'Vi és Powder rablási akciója nem várt következményekkel jár.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/fXmAurh012s'
          }
        ]
      }
    ]
  },
  {
    id: '30',
    title: 'A Sandman: Az álmok fejedelme',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=2070&auto=format&fit=crop',
    description: 'Évekig tartó fogság után az Álmok Fejedelme kiszabadul, és elindul, hogy visszaszerezze hatalmát és helyreállítsa birodalmát.',
    year: 2022,
    duration: '1 évad',
    genres: [GENRES.SCIFI, GENRES.DRAMA, GENRES.HORROR],
    cast: ['Tom Sturridge', 'Boyd Holbrook', 'Patton Oswalt'],
    trailerUrl: 'https://www.youtube.com/embed/83ClbRPRDXU',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/83ClbRPRDXU',
        episodes: [
          {
            episode: 1,
            title: 'Sleep of the Just',
            duration: '54m',
            durationSeconds: 3240,
            upNextTriggerSeconds: 15,
            description: 'Egy okkultista csoport véletlenül foglyul ejti az Álmok Fejedelmét.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/83ClbRPRDXU'
          }
        ]
      }
    ]
  },
  {
    id: '31',
    title: 'Narcos',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://www.tallengestore.com/cdn/shop/products/Narcos-PabloEscobar-NetflixTVShowPosterFanArt_96e25208-c097-45eb-8848-aa545cf37f45.jpg?v=1589271807',
    description: 'Igaz történeten alapuló drámasorozat Kolumbia hírhedt drogbáróinak felemelkedéséről és a bűnüldöző szervek hajtóvadászatáról.',
    year: 2015,
    duration: '3 évad',
    genres: [GENRES.THRILLER, GENRES.ACTION, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Wagner Moura', 'Pedro Pascal', 'Boyd Holbrook'],
    trailerUrl: 'https://www.youtube.com/embed/xl8zdCY-abw',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/xl8zdCY-abw',
        episodes: [
          {
            episode: 1,
            title: 'Descent',
            duration: '57m',
            durationSeconds: 3420,
            upNextTriggerSeconds: 15,
            description: 'Steve Murphy ügynök Kolumbiába érkezik, hogy felvegye a harcot a kábítószer-kereskedők ellen.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/xl8zdCY-abw'
          }
        ]
      }
    ]
  },
  {
    id: '32',
    title: 'Peaky Blinders',
    type: 'series',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2037&auto=format&fit=crop',
    description: 'Birmingham hírhedt gengsztercsaládja, a Shelbyk felemelkedése az első világháború utáni Nagy-Britanniában.',
    year: 2013,
    duration: '6 évad',
    genres: [GENRES.DRAMA, GENRES.THRILLER, GENRES.POPULAR],
    cast: ['Cillian Murphy', 'Paul Anderson', 'Helen McCrory'],
    trailerUrl: 'https://www.youtube.com/embed/oVzVdvGIC7U',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/oVzVdvGIC7U',
        episodes: [
          {
            episode: 1,
            title: 'Epizód 1',
            duration: '57m',
            durationSeconds: 3420,
            upNextTriggerSeconds: 15,
            description: 'Thomas Shelby ellop egy fegyverszállítmányt, ami felkelti a kormány érdeklődését.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/oVzVdvGIC7U'
          }
        ]
      }
    ]
  },
  {
    id: '33',
    title: 'Ozark',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    description: 'Egy pénzügyi tanácsadó családjával az Ozark-tóhoz költözik, hogy tisztára mosson 500 millió dollárt egy drogkartell számára.',
    year: 2017,
    duration: '4 évad',
    genres: [GENRES.THRILLER, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Jason Bateman', 'Laura Linney', 'Julia Garner'],
    trailerUrl: 'https://www.youtube.com/embed/5hAXVqrljbs',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/5hAXVqrljbs',
        episodes: [
          {
            episode: 1,
            title: 'Sugarwood',
            duration: '58m',
            durationSeconds: 3480,
            upNextTriggerSeconds: 15,
            description: 'Marty Byrde kénytelen alkut kötni egy kegyetlen kartellel, hogy megmentse az életét.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/5hAXVqrljbs'
          }
        ]
      }
    ]
  },
  {
    id: '34',
    title: 'The Unforgivable',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2037&auto=format&fit=crop',
    description: 'A börtönből szabadult nő megpróbál visszailleszkedni a társadalomba, miközben keresi az elszakított húgát.',
    year: 2021,
    duration: '1ó 52p',
    durationSeconds: 6720,
    upNextTriggerSeconds: 15,
    genres: [GENRES.DRAMA, GENRES.THRILLER],
    cast: ['Sandra Bullock', 'Vincent D\'Onofrio', 'Jon Bernthal'],
    embedUrl: 'https://www.youtube.com/embed/J6reL3OInuU'
  },
  {
    id: '35',
    title: 'Elit',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=2070&auto=format&fit=crop',
    description: 'Amikor három munkásosztálybeli diák bekerül Spanyolország legexkluzívabb magániskolájába, az ellentétek végül gyilkossághoz vezetnek.',
    year: 2018,
    duration: '7 évad',
    genres: [GENRES.DRAMA, GENRES.THRILLER, GENRES.POPULAR],
    cast: ['Itzan Escamilla', 'Omar Ayuso', 'Miguel Bernardeau'],
    trailerUrl: 'https://www.youtube.com/embed/QNwhAdrdwp0',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/QNwhAdrdwp0',
        episodes: [
          {
            episode: 1,
            title: 'Új fiúk',
            duration: '47m',
            durationSeconds: 2820,
            upNextTriggerSeconds: 15,
            description: 'Három ösztöndíjas diák érkezik Las Encinas-ba.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/QNwhAdrdwp0'
          }
        ]
      }
    ]
  },
  {
    id: '36',
    title: 'Love, Death & Robots',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    description: 'Rémisztő lények, gonosz meglepetések és sötét humor találkozik ebben a Tim Miller és David Fincher nevével fémjelzett antológiasorozatban.',
    year: 2019,
    duration: '3 évad',
    genres: [GENRES.SCIFI, GENRES.HORROR, GENRES.COMEDY],
    cast: ['Scott Whyte', 'Nolan North', 'Fred Tatasciore'],
    trailerUrl: 'https://www.youtube.com/embed/wUFwunMKa4E',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/wUFwunMKa4E',
        episodes: [
          {
            episode: 1,
            title: 'Sonnie előnye',
            duration: '17m',
            durationSeconds: 1020,
            upNextTriggerSeconds: 15,
            description: 'A szörnyeteg-gladiátorviadalok világában Sonnie veretlen maradt.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/wUFwunMKa4E'
          }
        ]
      }
    ]
  },
  {
    id: '37',
    title: 'Red Notice',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    description: 'Az FBI profilozója kénytelen összeállni a világ legnagyobb műkincstolvajával, hogy elkapjanak egy még nagyobb szélhámost.',
    year: 2021,
    duration: '1ó 58p',
    durationSeconds: 7080,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.COMEDY, GENRES.POPULAR],
    cast: ['Dwayne Johnson', 'Ryan Reynolds', 'Gal Gadot'],
    embedUrl: 'https://www.youtube.com/embed/PjGkVAgXu67'
  },
  {
    id: '38',
    title: 'Brooklyn Nine-Nine',
    type: 'series',
    imageUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=2037&auto=format&fit=crop',
    description: 'Jake Peralta egy tehetséges, de gyerekes detektív, akinek alkalmazkodnia kell az új, szigorú kapitányhoz a 99-es körzetben.',
    year: 2013,
    duration: '8 évad',
    genres: [GENRES.COMEDY, GENRES.POPULAR, GENRES.HUNGARIAN_DUB_TV],
    cast: ['Andy Samberg', 'Andre Braugher', 'Terry Crews'],
    trailerUrl: 'https://www.youtube.com/embed/sEOuJ4z5aTc',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/sEOuJ4z5aTc',
        episodes: [
          {
            episode: 1,
            title: 'Pilot',
            duration: '22m',
            durationSeconds: 1320,
            upNextTriggerSeconds: 15,
            description: 'Ray Holt kapitány átveszi az irányítást a körzet felett.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/sEOuJ4z5aTc'
          }
        ]
      }
    ]
  },
  {
    id: '39',
    title: 'Enola Holmes',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1485081666276-03999829deac?q=80&w=2070&auto=format&fit=crop',
    description: 'Sherlock Holmes tinédzser húga eltűnt anyja keresésére indul, és közben egy nagyobb politikai összeesküvés nyomára bukkan.',
    year: 2020,
    duration: '2ó 3p',
    durationSeconds: 7380,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.DRAMA, GENRES.COMEDY],
    cast: ['Millie Bobby Brown', 'Henry Cavill', 'Sam Claflin'],
    embedUrl: 'https://www.youtube.com/embed/1d0Zf9sXlHk'
  },
  {
    id: '40',
    title: 'A platform',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy függőleges börtönben az étel egy platformon érkezik fentről lefelé. A fenti szinteken lakók dőzsölnek, míg az alsóbb szinteknek csak a maradék jut – ha marad bármi.',
    year: 2019,
    duration: '1ó 34p',
    durationSeconds: 5640,
    upNextTriggerSeconds: 15,
    genres: [GENRES.SCIFI, GENRES.THRILLER, GENRES.HORROR],
    cast: ['Ivan Massagué', 'Antonia San Juan', 'Zorion Eguileor'],
    embedUrl: 'https://www.youtube.com/embed/RlfooqeZoFY'
  },
  {
    id: '41',
    title: 'Tőrbe ejtve',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1485846234645-a62644f84728?q=80&w=2059&auto=format&fit=crop',
    description: 'Egy híres krimiíró halála után a detektív Benoit Blanc nyomozni kezd a gyanúsan viselkedő családtagok között.',
    year: 2019,
    duration: '2ó 10p',
    durationSeconds: 7800,
    upNextTriggerSeconds: 15,
    genres: [GENRES.COMEDY, GENRES.THRILLER, GENRES.DRAMA],
    cast: ['Daniel Craig', 'Chris Evans', 'Ana de Armas'],
    embedUrl: 'https://www.youtube.com/embed/qGqiHJTsRkQ'
  },
  {
    id: '42',
    title: 'Szexoktatás',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=2070&auto=format&fit=crop',
    description: 'Otis, a bizonytalan tinédzser tanácsokat kezd adni osztálytársainak a szexuális problémáikkal kapcsolatban, kihasználva édesanyja szakértelmét.',
    year: 2019,
    duration: '4 évad',
    genres: [GENRES.COMEDY, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Asa Butterfield', 'Gillian Anderson', 'Emma Mackey'],
    trailerUrl: 'https://www.youtube.com/embed/HdZ9weP5i68',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/HdZ9weP5i68',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '52m',
            durationSeconds: 3120,
            upNextTriggerSeconds: 15,
            description: 'Otis és barátja, Eric szembenéznek a középiskola kihívásaival.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1542204111235-866444c1145a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/HdZ9weP5i68'
          }
        ]
      }
    ]
  },
  {
    id: '43',
    title: 'A láthatatlan ember',
    type: 'movie',
    imageUrl: 'https://images.unsplash.com/photo-1505663912202-ac22d4cb3707?q=80&w=2070&auto=format&fit=crop',
    description: 'Miután bántalmazó exe öngyilkos lesz, Ceciliát valaki – vagy valami – kísérteni kezdi, amiről senki sem hiszi el, hogy valóság.',
    year: 2020,
    duration: '2ó 4p',
    durationSeconds: 7440,
    upNextTriggerSeconds: 15,
    genres: [GENRES.HORROR, GENRES.THRILLER, GENRES.SCIFI],
    cast: ['Elisabeth Moss', 'Oliver Jackson-Cohen', 'Aldis Hodge'],
    embedUrl: 'https://www.youtube.com/embed/dSBsNeYqh-k'
  },
  {
    id: '44',
    title: 'The Gray Man',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy ex-CIA ügynök globális hajtóvadászat célpontjává válik, miután rájön az ügynökség sötét titkaira.',
    year: 2022,
    duration: '2ó 2p',
    durationSeconds: 7320,
    upNextTriggerSeconds: 15,
    genres: [GENRES.ACTION, GENRES.THRILLER, GENRES.NEW],
    cast: ['Ryan Gosling', 'Chris Evans', 'Ana de Armas'],
    embedUrl: 'https://www.youtube.com/embed/BmllggGOBAc'
  },
  {
    id: '45',
    title: 'Emily Párizsban',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1506190500384-604770f4821a?q=80&w=2070&auto=format&fit=crop',
    description: 'Egy chicagói marketingmenedzser megkapja álmai munkáját Párizsban, és megpróbál egyensúlyt teremteni a munka, a barátság és a szerelem között.',
    year: 2020,
    duration: '4 évad',
    genres: [GENRES.COMEDY, GENRES.DRAMA, GENRES.POPULAR],
    cast: ['Lily Collins', 'Philippine Leroy-Beaulieu', 'Ashley Park'],
    trailerUrl: 'https://www.youtube.com/embed/lptctjat-Mk',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/lptctjat-Mk',
        episodes: [
          {
            episode: 1,
            title: 'Emily Párizsba megy',
            duration: '29m',
            durationSeconds: 1740,
            upNextTriggerSeconds: 15,
            description: 'Emily megérkezik a fények városába, hogy új életet kezdjen.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1506190500384-604770f4821a?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/lptctjat-Mk'
          }
        ]
      }
    ]
  },
  {
    id: '46',
    title: 'Don\'t Look Up',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=2089&auto=format&fit=crop',
    description: 'Két csillagász médiakörútra indul, hogy figyelmeztesse az emberiséget egy közeledő üstökösre, ami elpusztítja a Földet, de senki sem veszi őket komolyan.',
    year: 2021,
    duration: '2ó 18p',
    durationSeconds: 8280,
    upNextTriggerSeconds: 15,
    genres: [GENRES.COMEDY, GENRES.SCIFI, GENRES.DRAMA, GENRES.NEW],
    cast: ['Leonardo DiCaprio', 'Jennifer Lawrence', 'Meryl Streep'],
    embedUrl: 'https://www.youtube.com/embed/RbIxYm3mKzI'
  },
  {
    id: '47',
    title: 'The Witcher: Blood Origin',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=2069&auto=format&fit=crop',
    description: 'Több mint ezer évvel a Vaják világa előtt hét számkivetett összefog a tünde világban, egy vérszomjas birodalom ellen.',
    year: 2022,
    duration: '4 epizód',
    genres: [GENRES.ACTION, GENRES.SCIFI, GENRES.DRAMA],
    cast: ['Sophia Brown', 'Laurence O\'Fuarain', 'Michelle Yeoh'],
    trailerUrl: 'https://www.youtube.com/embed/fTpe_2G8n8Y',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/fTpe_2G8n8Y',
        episodes: [
          {
            episode: 1,
            title: '1. epizód',
            duration: '47m',
            durationSeconds: 2820,
            upNextTriggerSeconds: 15,
            description: 'A tünde birodalmakat árulás rázza meg.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1514539079130-25950c84af65?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/fTpe_2G8n8Y'
          }
        ]
      }
    ]
  },
  {
    id: '48',
    title: 'Nyugaton a helyzet változatlan',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    description: 'Egy fiatal német katona és társai az első világháború borzalmaival szembesülnek a nyugati fronton.',
    year: 2022,
    duration: '2ó 28p',
    durationSeconds: 8880,
    upNextTriggerSeconds: 15,
    genres: [GENRES.DRAMA, GENRES.ACTION],
    cast: ['Felix Kammerer', 'Albrecht Schuch', 'Aaron Hilmer'],
    embedUrl: 'https://www.youtube.com/embed/hf8EYbVxtCY'
  },
  {
    id: '49',
    title: 'You',
    type: 'series',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=2069&auto=format&fit=crop',
    description: 'Egy könyvesbolt-vezető megszállottan kezd követni egy írópalántát, és mindent megtesz, hogy a lány élete részévé váljon.',
    year: 2018,
    duration: '4 évad',
    genres: [GENRES.THRILLER, GENRES.DRAMA, GENRES.POPULAR, GENRES.HUNGARIAN_DUB_TV],
    cast: ['Penn Badgley', 'Victoria Pedretti', 'Elizabeth Lail'],
    trailerUrl: 'https://www.youtube.com/embed/cKOhno0IMpA',
    seasons: [
      {
        season: 1,
        trailerUrl: 'https://www.youtube.com/embed/cKOhno0IMpA',
        episodes: [
          {
            episode: 1,
            title: 'Pilot',
            duration: '48m',
            durationSeconds: 2880,
            upNextTriggerSeconds: 15,
            description: 'Joe Goldberg találkozik Beckkel, és azonnal bűvöletébe esik.',
            thumbnailUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=500',
            embedUrl: 'https://www.youtube.com/embed/cKOhno0IMpA'
          }
        ]
      }
    ]
  },
  {
    id: '50',
    title: 'The Irishman',
    type: 'movie',
    isOriginal: true,
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop',
    description: 'Martin Scorsese filmje Frank Sheeran, a maffia bérgyilkosának életéről és Jimmy Hoffa eltűnéséről.',
    year: 2019,
    duration: '3ó 29p',
    durationSeconds: 12540,
    upNextTriggerSeconds: 15,
    genres: [GENRES.DRAMA, GENRES.THRILLER, GENRES.POPULAR],
    cast: ['Robert De Niro', 'Al Pacino', 'Joe Pesci'],
    embedUrl: 'https://www.youtube.com/embed/WHXq6YB1hUk'
  }
];
