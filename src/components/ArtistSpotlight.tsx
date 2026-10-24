import { ArrowUpRight } from 'lucide-react';

const artworks = [
  {
    title: 'Glaucous 1',
    file: 'glaucous-1.jpg',
    width: 750,
    height: 754,
    alt: 'Glaucous 1 by Taylor Smalls: a close-up portrait in layered blue-grey and cream tones.',
    url: 'https://www.taylorsmalls.com/glaucous1',
  },
  {
    title: 'Susurrus',
    file: 'susurrus.jpg',
    width: 750,
    height: 487,
    alt: 'Susurrus by Taylor Smalls: two portraits painted in warm ochre and golden washes.',
    url: 'https://www.taylorsmalls.com/susurrus',
  },
  {
    title: 'Nunchi',
    file: 'nunchi.png',
    width: 750,
    height: 501,
    alt: 'Nunchi by Taylor Smalls: a portrait with textured golden paint against a yellow background.',
    url: 'https://www.taylorsmalls.com/nunchi',
  },
];

export default function ArtistSpotlight() {
  return (
    <section className="artist-spotlight container" aria-labelledby="artist-spotlight-title">
      <div className="artist-spotlight-intro">
        <div>
          <p className="eyebrow">Artist inspiration / demo spotlight</p>
          <h2 id="artist-spotlight-title">Taylor <em>Smalls.</em></h2>
          <p className="artist-location">Oakland, California · Contemporary portraiture</p>
        </div>
        <div className="artist-story">
          <p>Taylor Smalls paints portraits using palette knives and water washing. Working from West Oakland, she explores the color and depth of Black and Brown skin, celebrating women of color through layered pigment and texture.</p>
          <div className="artist-inspiration">
            <p className="eyebrow">Part of why this platform exists</p>
            <p>Taylor’s work is part of the inspiration behind Artist Manager: helping artists find the resources and opportunities to keep creating.</p>
          </div>
          <a className="text-link" href="https://www.taylorsmalls.com/about-cv" target="_blank" rel="noopener noreferrer">Meet Taylor <ArrowUpRight size={17} /></a>
        </div>
      </div>
      <div className="artist-artworks">
        {artworks.map(work => (
          <figure key={work.title}>
            <a className="artwork-image" href={work.url} target="_blank" rel="noopener noreferrer" aria-label={`View ${work.title} on Taylor Smalls’s website`}>
              <img src={`${import.meta.env.BASE_URL}artists/taylor-smalls/${work.file}`} alt={work.alt} width={work.width} height={work.height} loading="lazy" decoding="async" />
            </a>
            <figcaption>
              <h3><a href={work.url} target="_blank" rel="noopener noreferrer">{work.title} <ArrowUpRight size={16} /></a></h3>
              <p>Acrylic on stretched canvas · Taylor Smalls</p>
            </figcaption>
          </figure>
        ))}
      </div>
      <div className="artist-credits">
        <p className="tiny">Demo artist spotlight · Artworks © Taylor Smalls. Biography and selected works sourced from her official website.</p>
        <a className="text-link" href="https://www.taylorsmalls.com/" target="_blank" rel="noopener noreferrer">Explore her work <ArrowUpRight size={17} /></a>
      </div>
    </section>
  );
}
