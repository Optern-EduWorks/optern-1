module.exports = {
  async rewrites() {
    return [
      {
        source: '/candidate/:path*',
        destination: 'http://localhost:4200/candidate/:path*',
      },
      {
        source: '/recruiter/:path*',
        destination: 'http://localhost:4200/recruiter/:path*',
      },
      {
        source: '/api/:path*',
        destination: 'http://localhost:5003/api/:path*',
      },
    ];
  },
};
