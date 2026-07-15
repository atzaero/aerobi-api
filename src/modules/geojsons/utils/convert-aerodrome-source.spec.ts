import JSZip from 'jszip';

import { GeojsonMapFileType } from '@/generated/prisma/client';

import {
  convertAerodromeSource,
  deriveMapFileType,
} from './convert-aerodrome-source';

const KML =
  '<?xml version="1.0"?><kml xmlns="http://www.opengis.net/kml/2.2">' +
  '<Document><Placemark><name>P1</name><Point>' +
  '<coordinates>-46.6,-23.5,0</coordinates></Point></Placemark></Document></kml>';

describe('deriveMapFileType', () => {
  it('.kmz → KMZ, resto → KML', () => {
    expect(deriveMapFileType('mapa.kmz')).toBe(GeojsonMapFileType.KMZ);
    expect(deriveMapFileType('MAPA.KMZ')).toBe(GeojsonMapFileType.KMZ);
    expect(deriveMapFileType('mapa.kml')).toBe(GeojsonMapFileType.KML);
    expect(deriveMapFileType('mapa')).toBe(GeojsonMapFileType.KML);
  });
});

describe('convertAerodromeSource', () => {
  it('KML plano → FeatureCollection com featureCount e zipBytes null', async () => {
    const out = await convertAerodromeSource(
      GeojsonMapFileType.KML,
      Buffer.from(KML),
    );
    expect(out.geoJson.type).toBe('FeatureCollection');
    expect(out.featureCount).toBe(1);
    expect(out.zipBytes).toBeNull();
    expect(out.geoJsonBytes).toBeGreaterThan(0);
    expect(out.sourceBytes).toBe(Buffer.from(KML).byteLength);
  });

  it('KMZ detectado por magic-number (mesmo declarado KML) → descompacta o .kml', async () => {
    const zip = new JSZip();
    zip.file('doc.kml', KML);
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    const out = await convertAerodromeSource(GeojsonMapFileType.KML, buffer);
    expect(out.featureCount).toBe(1);
    expect(out.zipBytes).toBe(buffer.byteLength);
  });

  it('KMZ sem .kml interno → lança', async () => {
    const zip = new JSZip();
    zip.file('leia-me.txt', 'sem kml aqui');
    const buffer = await zip.generateAsync({ type: 'nodebuffer' });

    await expect(
      convertAerodromeSource(GeojsonMapFileType.KMZ, buffer),
    ).rejects.toThrow('KMZ sem arquivo .kml interno');
  });
});
