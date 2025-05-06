import React, { useEffect, useRef } from 'react';
import Globe from 'react-globe.gl';
import './Globe3D.css';

const Globe3D = ({ 
  completedCountries, 
  selectedCountry, 
  onCountryClick,
  onMouseLeave,
  width = 800,
  height = 600 
}) => {
  const globeRef = useRef();

  // Country code to name mapping
  const countryCodeToName = {
    // A
    'af': 'Afghanistan',
    'al': 'Albania',
    'dz': 'Algeria',
    'ad': 'Andorra',
    'ao': 'Angola',
    'ag': 'Antigua and Barbuda',
    'ar': 'Argentina',
    'am': 'Armenia',
    'au': 'Australia',
    'at': 'Austria',
    'az': 'Azerbaijan',
    
    // B
    'bs': 'Bahamas',
    'bh': 'Bahrain',
    'bd': 'Bangladesh',
    'bb': 'Barbados',
    'by': 'Belarus',
    'be': 'Belgium',
    'bz': 'Belize',
    'bj': 'Benin',
    'bt': 'Bhutan',
    'bo': 'Bolivia',
    'ba': 'Bosnia and Herzegovina',
    'bw': 'Botswana',
    'br': 'Brazil',
    'bn': 'Brunei',
    'bg': 'Bulgaria',
    'bf': 'Burkina Faso',
    'bi': 'Burundi',
    
    // C
    'cv': 'Cabo Verde',
    'kh': 'Cambodia',
    'cm': 'Cameroon',
    'ca': 'Canada',
    'cf': 'Central African Republic',
    'td': 'Chad',
    'cl': 'Chile',
    'cn': 'China',
    'co': 'Colombia',
    'km': 'Comoros',
    'cg': 'Congo',
    'cr': 'Costa Rica',
    'ci': 'Côte d\'Ivoire',
    'hr': 'Croatia',
    'cu': 'Cuba',
    'cy': 'Cyprus',
    'cz': 'Czech Republic',
    
    // D
    'dk': 'Denmark',
    'dj': 'Djibouti',
    'dm': 'Dominica',
    'do': 'Dominican Republic',
    
    // E
    'ec': 'Ecuador',
    'eg': 'Egypt',
    'sv': 'El Salvador',
    'gq': 'Equatorial Guinea',
    'er': 'Eritrea',
    'ee': 'Estonia',
    'sz': 'Eswatini',
    'et': 'Ethiopia',
    
    // F
    'fj': 'Fiji',
    'fi': 'Finland',
    'fr': 'France',
    
    // G
    'ga': 'Gabon',
    'gm': 'Gambia',
    'ge': 'Georgia',
    'de': 'Germany',
    'gh': 'Ghana',
    'gr': 'Greece',
    'gd': 'Grenada',
    'gt': 'Guatemala',
    'gn': 'Guinea',
    'gw': 'Guinea-Bissau',
    'gy': 'Guyana',
    
    // H
    'ht': 'Haiti',
    'hn': 'Honduras',
    'hu': 'Hungary',
    
    // I
    'is': 'Iceland',
    'in': 'India',
    'id': 'Indonesia',
    'ir': 'Iran',
    'iq': 'Iraq',
    'ie': 'Ireland',
    'il': 'Israel',
    'it': 'Italy',
    
    // J
    'jm': 'Jamaica',
    'jp': 'Japan',
    'jo': 'Jordan',
    
    // K
    'kz': 'Kazakhstan',
    'ke': 'Kenya',
    'ki': 'Kiribati',
    'kp': 'North Korea',
    'kr': 'South Korea',
    'kw': 'Kuwait',
    'kg': 'Kyrgyzstan',
    
    // L
    'la': 'Laos',
    'lv': 'Latvia',
    'lb': 'Lebanon',
    'ls': 'Lesotho',
    'lr': 'Liberia',
    'ly': 'Libya',
    'li': 'Liechtenstein',
    'lt': 'Lithuania',
    'lu': 'Luxembourg',
    
    // M
    'mg': 'Madagascar',
    'mw': 'Malawi',
    'my': 'Malaysia',
    'mv': 'Maldives',
    'ml': 'Mali',
    'mt': 'Malta',
    'mh': 'Marshall Islands',
    'mr': 'Mauritania',
    'mu': 'Mauritius',
    'mx': 'Mexico',
    'fm': 'Micronesia',
    'md': 'Moldova',
    'mc': 'Monaco',
    'mn': 'Mongolia',
    'me': 'Montenegro',
    'ma': 'Morocco',
    'mz': 'Mozambique',
    'mm': 'Myanmar',
    
    // N
    'na': 'Namibia',
    'nr': 'Nauru',
    'np': 'Nepal',
    'nl': 'Netherlands',
    'nz': 'New Zealand',
    'ni': 'Nicaragua',
    'ne': 'Niger',
    'ng': 'Nigeria',
    'mk': 'North Macedonia',
    'no': 'Norway',
    
    // O
    'om': 'Oman',
    
    // P
    'pk': 'Pakistan',
    'pw': 'Palau',
    'pa': 'Panama',
    'pg': 'Papua New Guinea',
    'py': 'Paraguay',
    'pe': 'Peru',
    'ph': 'Philippines',
    'pl': 'Poland',
    'pt': 'Portugal',
    
    // Q
    'qa': 'Qatar',
    
    // R
    'ro': 'Romania',
    'ru': 'Russia',
    'rw': 'Rwanda',
    
    // S
    'kn': 'Saint Kitts and Nevis',
    'lc': 'Saint Lucia',
    'vc': 'Saint Vincent and the Grenadines',
    'ws': 'Samoa',
    'sm': 'San Marino',
    'st': 'São Tomé and Príncipe',
    'sa': 'Saudi Arabia',
    'sn': 'Senegal',
    'rs': 'Serbia',
    'sc': 'Seychelles',
    'sl': 'Sierra Leone',
    'sg': 'Singapore',
    'sk': 'Slovakia',
    'si': 'Slovenia',
    'sb': 'Solomon Islands',
    'so': 'Somalia',
    'za': 'South Africa',
    'ss': 'South Sudan',
    'es': 'Spain',
    'lk': 'Sri Lanka',
    'sd': 'Sudan',
    'sr': 'Suriname',
    'se': 'Sweden',
    'ch': 'Switzerland',
    'sy': 'Syria',
    
    // T
    'tw': 'Taiwan',
    'tj': 'Tajikistan',
    'tz': 'Tanzania',
    'th': 'Thailand',
    'tl': 'Timor-Leste',
    'tg': 'Togo',
    'to': 'Tonga',
    'tt': 'Trinidad and Tobago',
    'tn': 'Tunisia',
    'tr': 'Turkey',
    'tm': 'Turkmenistan',
    'tv': 'Tuvalu',
    
    // U
    'ug': 'Uganda',
    'ua': 'Ukraine',
    'ae': 'United Arab Emirates',
    'gb': 'United Kingdom',
    'us': 'United States',
    'uy': 'Uruguay',
    'uz': 'Uzbekistan',
    
    // V
    'vu': 'Vanuatu',
    'va': 'Vatican City',
    've': 'Venezuela',
    'vn': 'Vietnam',
    
    // Y
    'ye': 'Yemen',
    
    // Z
    'zm': 'Zambia',
    'zw': 'Zimbabwe'
  };

  // Country coordinates mapping (latitude, longitude)
  const countryCoordinates = {
    // A
    'af': [34.5167, 69.1833], // Kabul
    'al': [41.3275, 19.8187], // Tirana
    'dz': [36.7538, 3.0588], // Algiers
    'ad': [42.5063, 1.5218], // Andorra la Vella
    'ao': [-8.8389, 13.2894], // Luanda
    'ag': [17.3026, -61.7177], // Saint John's
    'ar': [-34.6037, -58.3816], // Buenos Aires
    'am': [40.1872, 44.5152], // Yerevan
    'au': [-35.2809, 149.1300], // Canberra
    'at': [48.2082, 16.3738], // Vienna
    'az': [40.4093, 49.8671], // Baku
    
    // B
    'bs': [25.0343, -77.3963], // Nassau
    'bh': [26.2285, 50.5860], // Manama
    'bd': [23.8103, 90.4125], // Dhaka
    'bb': [13.1132, -59.5988], // Bridgetown
    'by': [53.9023, 27.5619], // Minsk
    'be': [50.8503, 4.3517], // Brussels
    'bz': [17.2534, -88.7713], // Belmopan
    'bj': [6.4969, 2.6283], // Porto-Novo
    'bt': [27.4712, 89.6386], // Thimphu
    'bo': [-16.4897, -68.1193], // La Paz
    'ba': [43.8564, 18.4131], // Sarajevo
    'bw': [-24.6282, 25.9231], // Gaborone
    'br': [-15.7801, -47.9292], // Brasília
    'bn': [4.9031, 114.9398], // Bandar Seri Begawan
    'bg': [42.6977, 23.3219], // Sofia
    'bf': [12.3714, -1.5197], // Ouagadougou
    'bi': [-3.3731, 29.9189], // Gitega
    
    // C
    'cv': [14.9315, -23.5087], // Praia
    'kh': [11.5564, 104.9282], // Phnom Penh
    'cm': [3.8480, 11.5021], // Yaoundé
    'ca': [45.4215, -75.6972], // Ottawa
    'cf': [4.3947, 18.5582], // Bangui
    'td': [12.1348, 15.0557], // N'Djamena
    'cl': [-33.4489, -70.6693], // Santiago
    'cn': [39.9042, 116.4074], // Beijing
    'co': [4.7110, -74.0721], // Bogotá
    'km': [-11.7172, 43.2473], // Moroni
    'cg': [-4.2634, 15.2429], // Kinshasa
    'cr': [9.9281, -84.0907], // San José
    'ci': [6.8276, -5.2893], // Yamoussoukro
    'hr': [45.8150, 15.9819], // Zagreb
    'cu': [23.1136, -82.3666], // Havana
    'cy': [35.1856, 33.3823], // Nicosia
    'cz': [50.0755, 14.4378], // Prague
    
    // D
    'dk': [55.6761, 12.5683], // Copenhagen
    'dj': [11.5886, 43.1456], // Djibouti
    'dm': [15.3014, -61.3870], // Roseau
    'do': [18.4861, -69.9312], // Santo Domingo
    
    // E
    'ec': [-0.1807, -78.4678], // Quito
    'eg': [30.0444, 31.2357], // Cairo
    'sv': [13.6929, -89.2182], // San Salvador
    'gq': [3.7523, 8.7742], // Malabo
    'er': [15.3229, 38.9251], // Asmara
    'ee': [59.4369, 24.7536], // Tallinn
    'sz': [-26.3054, 31.1367], // Mbabane
    'et': [9.0320, 38.7421], // Addis Ababa
    
    // F
    'fj': [-18.1416, 178.4419], // Suva
    'fi': [60.1699, 24.9384], // Helsinki
    'fr': [48.8566, 2.3522], // Paris
    
    // G
    'ga': [0.4162, 9.4673], // Libreville
    'gm': [13.4432, -16.5919], // Banjul
    'ge': [41.7151, 44.8271], // Tbilisi
    'de': [52.5200, 13.4050], // Berlin
    'gh': [5.5600, -0.2057], // Accra
    'gr': [37.9838, 23.7275], // Athens
    'gd': [12.0564, -61.7486], // St. George's
    'gt': [14.6349, -90.5069], // Guatemala City
    'gn': [9.6412, -13.5784], // Conakry
    'gw': [11.8636, -15.5846], // Bissau
    'gy': [6.8013, -58.1553], // Georgetown
    
    // H
    'ht': [18.5944, -72.3074], // Port-au-Prince
    'hn': [14.0723, -87.1921], // Tegucigalpa
    'hu': [47.4979, 19.0402], // Budapest
    
    // I
    'is': [64.1265, -21.8174], // Reykjavík
    'in': [28.6139, 77.2090], // New Delhi
    'id': [-6.2088, 106.8456], // Jakarta
    'ir': [35.7219, 51.3347], // Tehran
    'iq': [33.3152, 44.3661], // Baghdad
    'ie': [53.3498, -6.2603], // Dublin
    'il': [31.7683, 35.2137], // Jerusalem
    'it': [41.9028, 12.4964], // Rome
    
    // J
    'jm': [18.1096, -77.2975], // Kingston
    'jp': [35.6762, 139.6503], // Tokyo
    'jo': [31.9454, 35.9284], // Amman
    
    // K
    'kz': [43.2220, 76.8512], // Almaty
    'ke': [-1.2921, 36.8219], // Nairobi
    'ki': [1.3382, 172.9816], // South Tarawa
    'kp': [39.0392, 125.7625], // Pyongyang
    'kr': [37.5665, 126.9780], // Seoul
    'kw': [29.3759, 47.9774], // Kuwait City
    'kg': [42.8746, 74.5698], // Bishkek
    
    // L
    'la': [17.9757, 102.6331], // Vientiane
    'lv': [56.9496, 24.1052], // Riga
    'lb': [33.8938, 35.5018], // Beirut
    'ls': [-29.3142, 27.4833], // Maseru
    'lr': [6.3004, -10.7969], // Monrovia
    'ly': [32.8872, 13.1913], // Tripoli
    'li': [47.1410, 9.5209], // Vaduz
    'lt': [54.6872, 25.2797], // Vilnius
    'lu': [49.6116, 6.1319], // Luxembourg
    
    // M
    'mg': [-18.8792, 47.5079], // Antananarivo
    'mw': [-13.9631, 33.7741], // Lilongwe
    'my': [3.1390, 101.6869], // Kuala Lumpur
    'mv': [4.1755, 73.5093], // Malé
    'ml': [12.6392, -8.0029], // Bamako
    'mt': [35.9375, 14.3754], // Valletta
    'mh': [7.0897, 171.3803], // Majuro
    'mr': [18.0794, -15.9782], // Nouakchott
    'mu': [-20.1609, 57.5012], // Port Louis
    'mx': [19.4326, -99.1332], // Mexico City
    'fm': [6.9248, 158.1618], // Palikir
    'md': [47.0105, 28.8638], // Chișinău
    'mc': [43.7384, 7.4246], // Monaco
    'mn': [47.9184, 106.9177], // Ulaanbaatar
    'me': [42.4304, 19.2594], // Podgorica
    'ma': [34.0209, -6.8416], // Rabat
    'mz': [-25.9692, 32.5732], // Maputo
    'mm': [16.8661, 96.1951], // Naypyidaw
    
    // N
    'na': [-22.5597, 17.0832], // Windhoek
    'nr': [-0.5228, 166.9315], // Yaren
    'np': [27.7172, 85.3240], // Kathmandu
    'nl': [52.3676, 4.9041], // Amsterdam
    'nz': [-41.2866, 174.7756], // Wellington
    'ni': [12.1149, -86.2362], // Managua
    'ne': [13.5117, 2.1251], // Niamey
    'ng': [9.0765, 7.3986], // Abuja
    'mk': [41.9981, 21.4254], // Skopje
    'no': [59.9139, 10.7522], // Oslo
    
    // O
    'om': [23.5859, 58.4059], // Muscat
    
    // P
    'pk': [33.6844, 73.0479], // Islamabad
    'pw': [7.5000, 134.6244], // Ngerulmud
    'pa': [8.9824, -79.5199], // Panama City
    'pg': [-9.4438, 147.1803], // Port Moresby
    'py': [-25.2867, -57.3333], // Asunción
    'pe': [-12.0464, -77.0428], // Lima
    'ph': [14.5995, 120.9842], // Manila
    'pl': [52.2297, 21.0122], // Warsaw
    'pt': [38.7223, -9.1393], // Lisbon
    
    // Q
    'qa': [25.2867, 51.5333], // Doha
    
    // R
    'ro': [44.4268, 26.1025], // Bucharest
    'ru': [55.7558, 45.6173], // Moscow (adjusted longitude from 37.6173 to 45.6173 to move east)
    'rw': [-1.9441, 30.0619], // Kigali
    
    // S
    'kn': [17.3026, -62.7177], // Basseterre
    'lc': [14.0101, -60.9875], // Castries
    'vc': [13.1587, -61.2242], // Kingstown
    'ws': [-13.8333, -171.7667], // Apia
    'sm': [43.9322, 12.4484], // San Marino
    'st': [0.3333, 6.7333], // São Tomé
    'sa': [24.7136, 46.6753], // Riyadh
    'sn': [14.7168, -17.4572], // Dakar
    'rs': [44.8125, 20.4612], // Belgrade
    'sc': [-4.6191, 55.4513], // Victoria
    'sl': [8.4847, -13.2343], // Freetown
    'sg': [1.3521, 103.8198], // Singapore
    'sk': [48.1486, 17.1077], // Bratislava
    'si': [46.0569, 14.5058], // Ljubljana
    'sb': [-9.4333, 159.9500], // Honiara
    'so': [2.0469, 45.3182], // Mogadishu
    'za': [-33.9249, 18.4241], // Cape Town
    'ss': [4.8594, 31.5713], // Juba
    'es': [40.4168, -3.7038], // Madrid
    'lk': [6.9271, 79.8612], // Colombo
    'sd': [15.5007, 32.5599], // Khartoum
    'sr': [5.8520, -55.2038], // Paramaribo
    'se': [59.3293, 18.0686], // Stockholm
    'ch': [46.9480, 7.4474], // Bern
    'sy': [33.5138, 36.2765], // Damascus
    
    // T
    'tw': [25.0330, 121.5654], // Taipei
    'tj': [38.5598, 68.7870], // Dushanbe
    'tz': [-6.7924, 39.2083], // Dar es Salaam
    'th': [13.7563, 100.5018], // Bangkok
    'tl': [-8.5586, 125.5736], // Dili
    'tg': [6.1375, 1.2123], // Lomé
    'to': [-21.1333, -175.2000], // Nuku'alofa
    'tt': [10.6596, -61.5078], // Port of Spain
    'tn': [36.8065, 10.1815], // Tunis
    'tr': [41.0082, 28.9784], // Istanbul
    'tm': [37.9509, 58.3794], // Ashgabat
    'tv': [-8.5167, 179.2167], // Funafuti
    
    // U
    'ug': [0.3476, 32.5825], // Kampala
    'ua': [50.4501, 30.5234], // Kyiv
    'ae': [25.2048, 55.2708], // Dubai
    'gb': [51.5074, -0.1278], // London
    'us': [38.9072, -77.0369], // Washington, D.C.
    'uy': [-34.8941, -56.0675], // Montevideo
    'uz': [41.3111, 69.2797], // Tashkent
    
    // V
    'vu': [-17.7333, 168.3167], // Port Vila
    'va': [41.9029, 12.4534], // Vatican City
    've': [10.4806, -66.9036], // Caracas
    'vn': [21.0285, 105.8542], // Hanoi
    
    // Y
    'ye': [15.3694, 44.1910], // Sana'a
    
    // Z
    'zm': [-15.3875, 28.3228], // Lusaka
    'zw': [-17.8252, 31.0335] // Harare
  };

  // Log the props for debugging
  useEffect(() => {
    console.log('Globe3D props:', { completedCountries, selectedCountry });
  }, [completedCountries, selectedCountry]);

  // Convert country code to country name
  const getCountryName = (code) => {
    if (!code) return 'Unknown';
    
    // Convert to lowercase for case-insensitive matching
    const codeLower = code.toLowerCase();
    
    // Check if the code is already a full country name
    if (code.length > 2) {
      // Capitalize the first letter of each word
      return code.split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    }
    
    // Look up the country name
    return countryCodeToName[codeLower] || code;
  };

  // Get country coordinates
  const getCountryCoordinates = (code) => {
    if (!code) return [0, 0];
    
    // Convert to lowercase for case-insensitive matching
    const codeLower = code.toLowerCase();
    
    // Check if the code is already a full country name
    if (code.length > 2) {
      // Try to find the country code from the name
      for (const [countryCode, countryName] of Object.entries(countryCodeToName)) {
        if (countryName.toLowerCase() === codeLower) {
          return countryCoordinates[countryCode] || [0, 0];
        }
      }
      return [0, 0];
    }
    
    // Look up the coordinates
    return countryCoordinates[codeLower] || [0, 0];
  };

  // Handle country click
  const handleCountryClick = (country) => {
    console.log('Country clicked:', country);
    if (country && country.name) {
      console.log('Calling onCountryClick with:', country.name);
      onCountryClick(country.name);
    }
  };

  return (
    <div className="globe-container">
      <Globe
        ref={globeRef}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        width={width}
        height={height}
        onMouseLeave={onMouseLeave}
        // Add a point for each completed country with actual coordinates
        pointsData={completedCountries.map(country => {
          const coords = getCountryCoordinates(country);
          return {
            name: getCountryName(country),
            lat: coords[0],
            lng: coords[1],
            size: 1.05,
            color: country === selectedCountry ? '#2d8b4e' : '#1a5f34'
          };
        })}
        pointAltitude={0.1}
        pointColor="color"
        pointRadius="size"
        pointLabel={d => d.name}
        onPointClick={handleCountryClick}
      />
    </div>
  );
};

export default Globe3D;
