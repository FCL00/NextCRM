const paths = {
  home: {
    getHref: "/",
  },
  dashboard: {
    getHref: "/dashboard",
  },
  contact: {
    getHref: "/contacts",
  },
  companies: {
    getHref: "/companies",
  },
  deals: {
    getHref: "/deals",
  },
  activities: {
    getHref: "/activities",
  },
  analytics: {
    getHref: "/analytics",
  },
  resetPassword: {
    getHref: "/reset-password",
  },
  overview: {
    getHref: "/overview",
  },
};

type Paths = typeof paths;

export { paths };
export type { Paths };
