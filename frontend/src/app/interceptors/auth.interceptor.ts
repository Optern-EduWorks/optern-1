import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  // Get token from localStorage
  console.log('Auth interceptor processing request:', {
    url: req.url,
    method: req.method,
    headers: req.headers.keys().reduce((acc, key) => ({...acc, [key]: req.headers.get(key)}), {})
  });

  const raw = localStorage.getItem('optern_user');
  console.log('Raw localStorage data:', raw);

  if (raw) {
    try {
      const user = JSON.parse(raw);
      if (user && user.token) {
        console.log('Found auth token:', user.token);
        // Clone the request and add auth header
        const authReq = req.clone({
          headers: req.headers.set('Authorization', `Bearer ${user.token}`)
        });
        console.log('Modified request headers:', {
          original: req.headers.keys(),
          modified: authReq.headers.keys(),
          authHeader: authReq.headers.get('Authorization')
        });
        return next(authReq);
      } else {
        console.warn('No token found in user data:', user);
        // For test/development, add test token if no real token
        if (req.url.includes('/api/')) {
          console.log('Adding test token for API request');
          const authReq = req.clone({
            headers: req.headers.set('Authorization', 'Bearer test-token')
          });
          return next(authReq);
        }
      }
    } catch (error) {
      console.error('Error parsing user data from localStorage:', error);
      // Clear invalid data
      localStorage.removeItem('optern_user');
      // For test/development, add test token if no real token
      if (req.url.includes('/api/')) {
        console.log('Adding test token for API request after error');
        const authReq = req.clone({
          headers: req.headers.set('Authorization', 'Bearer test-token')
        });
        return next(authReq);
      }
    }
  } else {
    console.log('No user data found in localStorage');
    // For test/development, add test token if no real token
    if (req.url.includes('/api/')) {
      console.log('Adding test token for API request');
      const authReq = req.clone({
        headers: req.headers.set('Authorization', 'Bearer test-token')
      });
      return next(authReq);
    }
  }
  return next(req);
};
