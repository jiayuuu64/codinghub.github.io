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

    // fallback to preferences
    const pref = user.languagePreference || 'Python';

    const articles = {
      Python: [
        {
          title: 'Intro to Python Programming',
          link: 'https://www.geeksforgeeks.org/python-programming-language/',
          hostname: 'geeksforgeeks.org'
        },
        {
          title: 'Python Basics',
          link: 'https://www.programiz.com/python-programming',
          hostname: 'programiz.com'
        },
        {
          title: 'Learn Python – Full Course',
          link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
          hostname: 'youtube.com',
          isVideo: true
        }
      ],
      JavaScript: [
        {
          title: 'JavaScript Guide',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          hostname: 'mdn.dev'
        },
        {
          title: 'JS Tutorial',
          link: 'https://www.w3schools.com/js/',
          hostname: 'w3schools.com'
        },
        {
          title: 'JavaScript Full Course',
          link: 'https://www.youtube.com/watch?v=jS4aFq5-91M',
          hostname: 'youtube.com',
          isVideo: true
        }
      ],
      HTML: [
        {
          title: 'HTML Beginner Tutorial',
          link: 'https://www.w3schools.com/html/',
          hostname: 'w3schools.com'
        },
        {
          title: 'HTML Crash Course',
          link: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
          hostname: 'youtube.com',
          isVideo: true
        },
        {
          title: 'HTML Basics',
          link: 'https://developer.mozilla.org/en-US/docs/Learn/HTML/Introduction_to_HTML',
          hostname: 'mdn.dev'
        }
      ],
      CSS: [
        {
          title: 'CSS Tutorial',
          link: 'https://www.w3schools.com/css/',
          hostname: 'w3schools.com'
        },
        {
          title: 'Learn CSS',
          link: 'https://developer.mozilla.org/en-US/docs/Web/CSS',
          hostname: 'mdn.dev'
        },
        {
          title: 'CSS Crash Course',
          link: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
          hostname: 'youtube.com',
          isVideo: true
        }
      ],
      SQL: [
        {
          title: 'SQL Tutorial',
          link: 'https://www.w3schools.com/sql/',
          hostname: 'w3schools.com'
        },
        {
          title: 'SQL for Beginners',
          link: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
          hostname: 'youtube.com',
          isVideo: true
        },
        {
          title: 'Intro to SQL',
          link: 'https://mode.com/sql-tutorial/',
          hostname: 'mode.com'
        }
      ],
      Java: [
        {
          title: 'Java Programming',
          link: 'https://www.geeksforgeeks.org/java/',
          hostname: 'geeksforgeeks.org'
        },
        {
          title: 'Learn Java – Full Course',
          link: 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
          hostname: 'youtube.com',
          isVideo: true
        },
        {
          title: 'Java Basics',
          link: 'https://www.programiz.com/java-programming',
          hostname: 'programiz.com'
        }
      ],
      'C++': [
        {
          title: 'C++ for Beginners',
          link: 'https://www.geeksforgeeks.org/c-plus-plus/',
          hostname: 'geeksforgeeks.org'
        },
        {
          title: 'Learn C++',
          link: 'https://www.learncpp.com/',
          hostname: 'learncpp.com'
        },
        {
          title: 'C++ Crash Course',
          link: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
          hostname: 'youtube.com',
          isVideo: true
        }
      ],
      PHP: [
        {
          title: 'PHP Tutorial',
          link: 'https://www.w3schools.com/php/',
          hostname: 'w3schools.com'
        },
        {
          title: 'PHP for Beginners',
          link: 'https://www.youtube.com/watch?v=OK_JCtrrv-c',
          hostname: 'youtube.com',
          isVideo: true
        },
        {
          title: 'Learn PHP',
          link: 'https://www.tutorialrepublic.com/php-tutorial/',
          hostname: 'tutorialrepublic.com'
        }
      ],
      Dart: [
        {
          title: 'Dart Language Tour',
          link: 'https://dart.dev/guides/language/language-tour',
          hostname: 'dart.dev'
        },
        {
          title: 'Dart Tutorial',
          link: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
          hostname: 'youtube.com',
          isVideo: true
        },
        {
          title: 'Learn Dart Basics',
          link: 'https://www.javatpoint.com/dart-programming',
          hostname: 'javatpoint.com'
        }
      ]
    };

    const selected = articles[pref] || articles['Python'];
    const formatted = selected.map(item => ({
      type: item.isVideo ? 'video' : 'article',
      title: item.title,
      link: item.link,
      hostname: item.hostname,
      thumbnail: item.isVideo
        ? `https://img.youtube.com/vi/${item.link.split('v=')[1]}/hqdefault.jpg`
        : `https://www.google.com/s2/favicons?sz=128&domain_url=${item.link}`
    }));

    return res.status(200).json(formatted);
  } catch (err) {
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
