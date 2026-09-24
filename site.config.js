/* =========================================================
   SITE CONFIG — every personal detail of the portfolio lives here.
   Edit the values below and re-run:  node tools/build.js
   Fields marked (HTML) accept simple markup such as <em class="serif">.
   ========================================================= */

module.exports = {
  /* ---------- identity ---------- */
  name: 'Seyed',
  title: 'Visual Designer | Motion Designer | AI Artist',   // used in titles, footer, meta
  shortTitle: 'Visual Designer',                     // header brand subtitle
  email: 'SEYDMHDYAR@GMAIL.COM',
  location: 'Tehran, Iran — collaborating worldwide',
  availability: 'Replies within 24 hours — projects booked for Q4 2026',

  /* ---------- social links (add / remove / reorder freely) ---------- */
  socials: [
    { label: 'Instagram', url: 'https://www.instagram.com/' },
    { label: 'Behance', url: 'https://www.behance.net/' },
    { label: 'Vimeo', url: 'https://vimeo.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  ],

  /* ---------- search / social preview ---------- */
  description:
    'Portfolio of Nima Vale — visual designer and creative storyteller working across graphic design, motion, video editing, AI visual experiments and documentary film.',

  /* ---------- homepage hero ---------- */
  heroEyebrow: 'Creative Media Designer — Visual Artist',
  heroLines: ['Visual Designer', '& <em class="serif">Creative</em>', 'Storyteller'], // (HTML)
  heroStatement:
    'Creating visual experiences through design, motion and artificial intelligence — for brands, films and cultural projects that deserve to be remembered.',

  /* ---------- about text ---------- */
  about: {
    headline: 'Designer, editor, <span class="serif">image</span> maker', // (HTML)
    lede: 'I design visual experiences that move — across posters, screens, films and the strange new territory of artificial intelligence.',
    skills: ['Art Direction', 'Poster Design', 'Typography', 'Motion Graphics', 'Video Editing', 'AI Films', 'Documentary', 'Campaigns'],
    home: {
      quote: 'Every frame should earn its place, or it is just decoration with a deadline.',
      paragraphs: [
        'I’m Nima — a visual designer and creative storyteller working across graphic design, motion, video and AI-assisted image making. I build systems first, then break them carefully.',
        'Seven years in, my approach is unchanged: strong concept, restrained execution, obsessive craft in the details nobody is supposed to notice.',
      ],
    },
    page: {
      quote: 'Design is direction — the craft is knowing what to leave out.',
      paragraphs: [
        'I started in print, moved into motion, and now spend a large part of my week directing generative tools. The through-line is editorial thinking: hierarchy, rhythm, restraint, and a stubborn belief that whitespace is a feature.',
        'Whether the deliverable is a poster, a title sequence or a four-minute AI film, the process is the same — <strong>define the system, find the tension, then cut everything that is not earning its place.</strong>',
      ],
    },
  },
};
