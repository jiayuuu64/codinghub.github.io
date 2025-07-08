import express from 'express';
import User from '../db/models/User.mjs';

const router = express.Router();

router.get('/recommendations', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    const latestProgress = user.progress
      ?.filter(p => p.recommendations?.length)
      ?.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))[0];

    if (latestProgress && latestProgress.recommendations?.length) {
      const parsed = latestProgress.recommendations.map(line => {
        const titleMatch = line.match(/"(.+?)"/);
        const linkMatch = line.match(/https?:\/\/[^\s]+/);
        const title = titleMatch ? titleMatch[1] : 'Untitled';
        const link = linkMatch ? linkMatch[0] : null;
        const isVideo = line.includes('📺') || (link && link.includes('youtube.com/watch?v='));
        const isArticle = line.includes('📰') || (!isVideo && line.includes('Article'));
        const videoId = isVideo && link?.includes('v=') ? link.split('v=')[1].split('&')[0] : null;

        return {
          type: isVideo ? 'video' : 'article',
          title,
          link,
          hostname: link ? new URL(link).hostname.replace('www.', '') : '',
          thumbnail: isVideo && videoId
            ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
            : isArticle && link
              ? `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(link)}`
              : 'https://via.placeholder.com/160x90?text=Resource'
        };
      });

      return res.status(200).json(parsed);
    }

    // fallback to user preferences
    const fallback = [
  {
    type: 'article',
    title: 'Intro to PHP',
    link: 'https://www.geeksforgeeks.org/php-introduction/',
    hostname: 'geeksforgeeks.org',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=geeksforgeeks.org'
  },
  {
    type: 'video',
    title: 'Top tips for Confident Coder',
    link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
    hostname: 'youtube.com',
    thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg'
  },
  {
    type: 'article',
    title: 'Boost Your Learning Motivation',
    link: 'https://www.lifehack.org/813336/study-smart',
    hostname: 'lifehack.org',
    thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=lifehack.org'
  }
];

    return res.status(200).json(fallback);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
