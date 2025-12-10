import { Poppins, League_Gothic, Outfit, Moderustic } from 'next/font/google';

export const poppins = Poppins({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
});

export const outfit = Outfit({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-outfit',
});

export const moderustic = Moderustic({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-moderustic',
});

export const leagueGothic = League_Gothic({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
});
