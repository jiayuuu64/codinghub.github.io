import express from 'express';
import User from '../db/models/User.mjs';

// Create an Express router instance
const router = express.Router();

// === GET /recommendations ===
// Returns either quiz-based or preference-based learning recommendations for the user
router.get('/recommendations', async (req, res) => {
  const { email } = req.query;

  // Validate email
  if (!email) return res.status(400).json({ error: 'Email is required' });

  try {
    // Fetch user and populate course references in progress
    const user = await User.findOne({ email }).populate('progress.courseId');
    if (!user) return res.status(404).json({ error: 'User not found' });

    // === STEP 1: Check if user has quiz-based recommendations ===

    // Flatten all recommendations across all course progress
    const allQuizRecs = user.progress.flatMap(p => p.recommendations || []);
    const uniqueQuizRecs = [...new Set(allQuizRecs)]; // Remove duplicates

    // Parse each recommendation line into structured objects
    const parsed = uniqueQuizRecs.map(line => {
      const titleMatch = line.match(/"(.+?)"/); // Extract title in quotes
      const linkMatch = line.match(/https?:\/\/[^\s]+/); // Extract URL

      const title = titleMatch ? titleMatch[1] : 'Untitled';
      const link = linkMatch ? linkMatch[0] : null;

      // Determine content type
      const isVideo = line.includes('📺') || (link && link.includes('youtube.com/watch?v='));
      const isArticle = line.includes('📰') || (!isVideo && line?.includes('Article'));

      // Extract YouTube video ID for thumbnail
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

    if (parsed.length > 0) {
      // ✅ If quiz-based recommendations exist, return 3 random
      const random3 = parsed.sort(() => 0.5 - Math.random()).slice(0, 3);
      return res.status(200).json(random3);
    }

    // Step 2: Fallback to language preference
    const lang = (user.languagePreference || '').toLowerCase();
    const fallbackMap = {
      python: [
        {
          type: 'video',
          title: 'Python Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=rfscVS0vtbw',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/rfscVS0vtbw/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'Python Programming Language — Official Docs',
          link: 'https://www.python.org/',
          hostname: 'python.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=python.org'
        },
        {
          type: 'article',
          title: 'Python Tutorial - GeeksforGeeks',
          link: 'https://www.geeksforgeeks.org/python/python-programming-language-tutorial/',
          hostname: 'geeksforgeeks.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=geeksforgeeks.org'
        }
      ],
      javascript: [
        {
          type: 'video',
          title: 'JavaScript Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg'
        },

        {
          type: 'article',
          title: 'JavaScript Guide',
          link: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
          hostname: 'developer.mozilla.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=developer.mozilla.org'
        },
        {
          type: 'article',
          title: 'JavaScript First Steps – MDN Web Docs',
          link: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/First_steps',
          hostname: 'developer.mozilla.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=developer.mozilla.org'
        }
      ],
      html: [
        {
          type: 'video',
          title: 'HTML Crash Course For Beginners',
          link: 'https://www.youtube.com/watch?v=UB1O30fR-EE',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/UB1O30fR-EE/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'HTML Beginner’s Guide',
          link: 'https://www.w3schools.com/html/',
          hostname: 'w3schools.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=w3schools.com'
        },
        {
          type: 'article',
          title: 'Semantic HTML: What You Should Know',
          link: 'https://developer.mozilla.org/en-US/docs/Glossary/Semantics',
          hostname: 'developer.mozilla.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=developer.mozilla.org'
        }
      ],
      css: [
        {
          type: 'video',
          title: 'CSS Crash Course For Beginners',
          link: 'https://www.youtube.com/watch?v=yfoY53QXEnI',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/yfoY53QXEnI/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'CSS Tutorial for Beginners',
          link: 'https://www.w3schools.com/css/',
          hostname: 'w3schools.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=w3schools.com'
        },
        {
          type: 'article',
          title: 'CSS Basics',
          link: 'https://developer.mozilla.org/en-US/docs/Learn/Getting_started_with_the_web/CSS_basics',
          hostname: 'developer.mozilla.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=developer.mozilla.org'
        }
      ],
      sql: [
        {
          type: 'video',
          title: 'SQL Tutorial - Full Database Course',
          link: 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/HXV3zeQKqGY/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'Learn SQL Basics',
          link: 'https://www.w3schools.com/sql/',
          hostname: 'w3schools.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=w3schools.com'
        },
        {
          type: 'article',
          title: 'SQL for Beginners',
          link: 'https://www.freecodecamp.org/news/learn-sql-in-10-minutes/',
          hostname: 'freecodecamp.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=freecodecamp.org'
        }
      ],
      java: [
        {
          type: 'video',
          title: 'Java Full Course for Beginners',
          link: 'https://www.youtube.com/watch?v=GoXwIVyNvX0',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/GoXwIVyNvX0/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'Java Programming Basics',
          link: 'https://www.geeksforgeeks.org/java/',
          hostname: 'geeksforgeeks.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=geeksforgeeks.org'
        },
        {
          type: 'article',
          title: 'Java Tutorial - W3Schools',
          link: 'https://www.w3schools.com/java/',
          hostname: 'w3schools.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=w3schools.com'
        }

      ],
      cplusplus: [
        {
          type: 'video',
          title: 'C++ Tutorial for Beginners',
          link: 'https://www.youtube.com/watch?v=vLnPwxZdW4Y',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/vLnPwxZdW4Y/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'C++ Tutorial',
          link: 'https://www.learncpp.com/',
          hostname: 'learncpp.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=learncpp.com'
        },
        {
          type: 'article',
          title: 'C++ Basics: Learn from Scratch',
          link: 'https://www.programiz.com/cpp-programming',
          hostname: 'programiz.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=programiz.com'
        }
      ],
      php: [
        {
          type: 'video',
          title: 'PHP Full Course for Beginners',
          link: 'https://www.youtube.com/watch?v=OK_JCtrrv-c',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/OK_JCtrrv-c/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'PHP Tutorial',
          link: 'https://www.w3schools.com/php/',
          hostname: 'w3schools.com',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=w3schools.com'
        },
        {
          type: 'article',
          title: 'Learn PHP Basics',
          link: 'https://www.geeksforgeeks.org/php-tutorial/',
          hostname: 'geeksforgeeks.org',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=geeksforgeeks.org'
        }
      ],
      dart: [
        {
          type: 'video',
          title: 'Dart Programming Full Course',
          link: 'https://www.youtube.com/watch?v=Ej_Pcr4uC2Q',
          hostname: 'youtube.com',
          thumbnail: 'https://img.youtube.com/vi/Ej_Pcr4uC2Q/hqdefault.jpg'
        },
        {
          type: 'article',
          title: 'Learn Dart Basics',
          link: 'https://dart.dev/guides',
          hostname: 'dart.dev',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=dart.dev'
        },
        {
          type: 'article',
          title: 'Introduction to Dart',
          link: 'https://dart.dev/tutorials',
          hostname: 'dart.dev',
          thumbnail: 'https://www.google.com/s2/favicons?sz=128&domain=dart.dev'
        }
      ]
    };

    // Use fallback based on language, default to Python if unknown
    const fallback = fallbackMap[lang] || fallbackMap['python'];

    // Return fallback resources
    return res.status(200).json(fallback);

  } catch (err) {
    // Handle unexpected server errors
    console.error('Error fetching recommendations:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
