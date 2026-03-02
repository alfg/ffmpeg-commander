import Vue from 'vue';
import VueRouter, { RouteConfig } from 'vue-router';

Vue.use(VueRouter);

const DEFAULT_TITLE = 'FFmpeg Commander | Visual FFmpeg Command Generator';
const DEFAULT_DESCRIPTION = 'Build FFmpeg commands in your browser with a visual editor for video, audio, filters, formats, and presets.';

const routes: Array<RouteConfig> = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/Home.vue'),
    meta: {
      title: DEFAULT_TITLE,
      description: DEFAULT_DESCRIPTION,
      canonicalPath: '/',
    },
  },
];

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes,
});

router.afterEach((to) => {
  const meta = to.meta || {};
  const title = (meta.title as string) || DEFAULT_TITLE;
  const description = (meta.description as string) || DEFAULT_DESCRIPTION;
  const canonicalPath = (meta.canonicalPath as string) || to.path;

  document.title = title;

  const descriptionTag = document.querySelector('meta[name="description"]');
  if (descriptionTag) {
    descriptionTag.setAttribute('content', description);
  }

  const ogTitleTag = document.querySelector('meta[property="og:title"]');
  if (ogTitleTag) {
    ogTitleTag.setAttribute('content', title);
  }

  const ogDescriptionTag = document.querySelector('meta[property="og:description"]');
  if (ogDescriptionTag) {
    ogDescriptionTag.setAttribute('content', description);
  }

  const twitterTitleTag = document.querySelector('meta[name="twitter:title"]');
  if (twitterTitleTag) {
    twitterTitleTag.setAttribute('content', title);
  }

  const twitterDescriptionTag = document.querySelector('meta[name="twitter:description"]');
  if (twitterDescriptionTag) {
    twitterDescriptionTag.setAttribute('content', description);
  }

  const canonicalUrl = new URL(canonicalPath, window.location.origin).toString();

  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute('href', canonicalUrl);
  }

  const ogUrlTag = document.querySelector('meta[property="og:url"]');
  if (ogUrlTag) {
    ogUrlTag.setAttribute('content', canonicalUrl);
  }
});

export default router;
