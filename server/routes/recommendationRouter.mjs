import express from 'express';
import User from '../db/models/User.mjs';

const router = express.Router();

router.get('/recommendations', async (req, res) => {
  const { email } = req.query;
  if (!email) return res.status(400).json({ error: 'Missing email' });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Check for quiz-based recommendations
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

    // Preference-based fallback
    const pref = user.languagePreference || 'Python';
    const fallbackResources = {
      Python: [
        {
          type: 'video',
          title: 'Python Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
        },
        {
          type: 'article',
          title: 'Official Python Website',
          link: 'https://www.python.org/',
        },
        {
          type: 'article',
          title: 'Python Programming Language Tutorial',
          link: 'https://www.geeksforgeeks.org/python/python-programming-language-tutorial/',
        }
      ],
      JavaScript: [
        {
          type: 'video',
          title: 'JavaScript Crash Course',
          link: 'https://www.youtube.com/watch?v=hdI2bqOjy3c',
        },
        {
          type: 'article',
          title: 'JavaScript Guide',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        },
        {
          type: 'article',
          title: 'JavaScript Basics',
          link: 'https://www.w3schools.com/js/',
        }
      ],
      HTML: [
        {
          type: 'video',
          title: 'HTML Full Course - Build a Website',
          link: 'https://www.youtube.com/watch?v=pQN-pnXPaVg',
        },
        {
          type: 'article',
          title: 'HTML Beginner Guide',
          link: 'https://developer.mozilla.org/en-US/docs/Web/HTML',
        },
        {
          type: 'article',
          title: 'HTML Tutorial',
          link: 'https://www.w3schools.com/html/',
        }
      ],
      CSS: [
        {
          type: 'video',
          title: 'CSS Crash Course For Beginners',
          link: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
        },
        {
          type: 'article',
          title: 'CSS Basics',
          link: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics',
        },
        {
          type: 'article',
          title: 'CSS Tutorial',
          link: 'https://www.w3schools.com/css/',
        }
      ],
      Java: [
        {
          type: 'video',
          title: 'Java Programming Full Course',
          link: 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
        },
        {
          type: 'article',
          title: 'Java Tutorial',
          link: 'https://www.geeksforgeeks.org/java/',
        },
        {
          type: 'article',
          title: 'Official Java Guide',
          link: 'https://docs.oracle.com/javase/tutorial/',
        }
      ],
      C++: [
        {
          type: 'video',
          title: 'C++ Full Course for Beginners',
          link: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
        },
        {
          type: 'article',
          title: 'C++ Tutorial',
          link: 'https://www.geeksforgeeks.org/c-plus-plus/',
        },
        {
          type: 'article',
          title: 'C++ Programming Basics',
          link: 'https://www.programiz.com/cpp-programming',
        }
      ],
      PHP: [
        {
          type: 'video',
          title: 'PHP Full Course',
          link: 'https://www.youtube.com/watch?v=OK_JCtrrv-c',
        },
        {
          type: 'article',
          title: 'PHP Tutorial',
          link: 'https://www.w3schools.com/php/',
        },
        {
          type: 'article',
          title: 'Learn PHP',
          link: 'https://www.geeksforgeeks.org/php-tutorial/',
        }
      ],
      SQL: [
        {
          type: 'video',
          title: 'SQL Full Course',
          link: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
        },
        {
          type: 'article',
          title: 'SQL Tutorial',
          link: 'https://www.w3schools.com/sql/',
        },
        {
          type: 'article',
          title: 'Learn SQL',
          link: 'https://www.geeksforgeeks.org/sql-tutorial/',
        }
      ],
      Dart: [
        {
          type: 'video',
          title: 'Dart Full Course',
          link: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
        },
        {
          type: 'article',
          title: 'Dart Programming Tutorial',
          link: 'https://dart.dev/guides',
        },
        {
          type: 'article',
          title: 'Learn Dart',
          link: 'https://www.geeksforgeeks.org/dart-programming-language/',
        }
      ]
    };

    const fallback = (fallbackResources[pref] || []).map(item => {
      const hostname = item.link ? new URL(item.link).hostname.replace('www.', '') : '';
      const thumbnail = item.type === 'video' && item.link.includes('youtube.com/watch?v=')
        ? `https://img.youtube.com/vi/${item.link.split('v=')[1].split('&')[0]}/hqdefault.jpg`
        : `https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(item.link)}`;

      return { ...item, hostname, thumbnail };
    });

    return res.status(200).json(fallback);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
