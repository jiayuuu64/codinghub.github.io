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

      return res.status(200).json(parsed); // ✅ Show quiz-based recs
    }

    // ✅ fallback if no quiz taken — based on preference
    const lang = user.languagePreference || 'Python';
    const fallbackLinks = {
      Python: {
        article: {
          title: 'Learn Python Basics',
          link: 'https://www.w3schools.com/python/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'Python Full Course for Beginners',
          link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
          hostname: 'youtube.com',
          videoId: 'rfscVS0vtbw'
        }
      },
      JavaScript: {
        article: {
          title: 'JavaScript Introduction',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Introduction',
          hostname: 'developer.mozilla.org'
        },
        video: {
          title: 'JavaScript Crash Course',
          link: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
          hostname: 'youtube.com',
          videoId: 'hdI2bqOjy3c'
        }
      },
      HTML: {
        article: {
          title: 'HTML Beginner Guide',
          link: 'https://www.w3schools.com/html/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'HTML Full Course',
          link: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
          hostname: 'youtube.com',
          videoId: 'pQN-pnXPaVg'
        }
      },
      CSS: {
        article: {
          title: 'CSS Basics',
          link: 'https://www.w3schools.com/css/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'CSS Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
          hostname: 'youtube.com',
          videoId: 'yfoY53QXEnI'
        }
      },
      SQL: {
        article: {
          title: 'SQL Introduction',
          link: 'https://www.w3schools.com/sql/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'SQL Tutorial - Full Database Course',
          link: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
          hostname: 'youtube.com',
          videoId: 'HXV3zeQKqGY'
        }
      },
      Java: {
        article: {
          title: 'Java Programming Basics',
          link: 'https://www.w3schools.com/java/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'Java Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=grEKMHGYyns',
          hostname: 'youtube.com',
          videoId: 'grEKMHGYyns'
        }
      },
      'C++': {
        article: {
          title: 'C++ Tutorial',
          link: 'https://www.w3schools.com/cpp/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'C++ Full Course',
          link: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
          hostname: 'youtube.com',
          videoId: 'vLnPwxZdW4Y'
        }
      },
      PHP: {
        article: {
          title: 'PHP Basics',
          link: 'https://www.w3schools.com/php/',
          hostname: 'w3schools.com'
        },
        video: {
          title: 'PHP Full Course for Beginners',
          link: 'https://www.youtube.com/watch?v=OK_JCtrrv-c',
          hostname: 'youtube.com',
          videoId: 'OK_JCtrrv-c'
        }
      },
      Dart: {
        article: {
          title: 'Introduction to Dart',
          link: 'https://dart.dev/guides',
          hostname: 'dart.dev'
        },
        video: {
          title: 'Dart Crash Course',
          link: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
          hostname: 'youtube.com',
          videoId: 'Ej_Pcr4uC2Q'
        }
      }
    };

    const langLinks = fallbackLinks[lang] || fallbackLinks['Python'];

    const fallback = [
      {
        type: 'article',
        title: langLinks.article.title,
        link: langLinks.article.link,
        hostname: langLinks.article.hostname,
        thumbnail: `https://www.google.com/s2/favicons?sz=128&domain=${langLinks.article.hostname}`
      },
      {
        type: 'video',
        title: langLinks.video.title,
        link: langLinks.video.link,
        hostname: langLinks.video.hostname,
        thumbnail: `https://img.youtube.com/vi/${langLinks.video.videoId}/hqdefault.jpg`
      }
    ];

    return res.status(200).json(fallback);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
