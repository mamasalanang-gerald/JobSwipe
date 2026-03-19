import React from 'react';
import Head from 'next/head';

export default function Home() {
  return (
    <>
      <Head>
        <title>JobApp - Web Frontend</title>
        <meta name="description" content="JobApp Web Application" />
      </Head>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">JobApp</h1>
          <p className="text-xl text-gray-600 mb-8">Web Frontend</p>
          <p className="text-gray-500">
            Backend API is running at:{' '}
            <span className="font-mono text-green-600">
              {process.env.NEXT_PUBLIC_API_URL}
            </span>
          </p>
        </div>
      </div>
    </>
  );
}
